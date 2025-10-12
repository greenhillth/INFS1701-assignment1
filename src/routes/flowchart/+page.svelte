<script lang="ts">
	import { onDestroy } from 'svelte';
	import { fromStore } from 'svelte/store';
	import { page } from '$app/stores';
	import { iconSet, type IconSet } from '$lib/stores/iconSet';
	import Icon from '$lib/components/Icon.svelte';
	import FlowCanvas from '$lib/topology/FlowCanvas.svelte';
	import { layout } from '$lib/topology/layouts/highschool';
	import type { NodeType, TrustLevel } from '$lib/topology/types';

	const iconSetState = fromStore(iconSet);
	const pageState = fromStore(page);
	let flowCanvasComponent: FlowCanvas | null = null;
	let diagramFrameElement: HTMLDivElement | null = null;
	let exporting = $state(false);
	const isEpic = $derived(iconSetState.current === 'crayon');
	let copyStatus = $state<'idle' | 'copied' | 'error'>('idle');
	let copyTimeout: ReturnType<typeof setTimeout> | null = null;
	const shareLabel = $derived(
		copyStatus === 'copied'
			? 'Link copied!'
			: copyStatus === 'error'
				? 'Copy failed'
				: 'Copy share link'
	);

	const zoneLegendOrder = ['edge', 'core', 'admin', 'classrooms', 'dc'] as const;
	const zoneLegendEntries = zoneLegendOrder
		.map((id) => layout.zones.find((zone) => zone.id === id))
		.filter((zone): zone is (typeof layout.zones)[number] => Boolean(zone));

	const TRUST_LABELS: Record<TrustLevel, string> = {
		none: 'No Trust',
		low: 'Low Trust',
		high: 'High Trust'
	};

	const trustLegend: Array<{ level: TrustLevel; copy: string }> = [
		{
			level: 'none',
			copy: 'Internet-facing or guest segments assumed untrusted until filtered by edge security.'
		},
		{
			level: 'low',
			copy: 'User access networks with limited privileges and monitoring to contain compromise.'
		},
		{
			level: 'high',
			copy: 'Core infrastructure and data centre workloads with strict controls and least privilege.'
		}
	];

	const TRUST_BADGE_BASE_CLASS =
		'inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] shadow-[0_10px_24px_rgba(15,23,42,0.32)]';
	const TRUST_BADGE_COLOR_CLASSES: Record<TrustLevel, string> = {
		none: 'border-rose-400/60 bg-[linear-gradient(135deg,rgba(248,113,113,0.22),rgba(190,24,93,0.18))] text-rose-200/95',
		low: 'border-amber-300/60 bg-[linear-gradient(135deg,rgba(251,191,36,0.24),rgba(217,119,6,0.2))] text-amber-100/95',
		high: 'border-emerald-400/65 bg-[linear-gradient(135deg,rgba(52,211,153,0.26),rgba(22,163,74,0.2))] text-emerald-200/95'
	};

	const MODE_TOGGLE_BASE_CLASS =
		'relative flex items-center justify-between rounded-full border border-slate-500/45 bg-slate-900/75 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-slate-200/85 transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70';
	const MODE_TOGGLE_EPIC_CLASS = 'text-pink-200/90';
	const MODE_THUMB_BASE_CLASS =
		'absolute inset-y-1 left-1 w-[calc(50%-0.5rem)] rounded-full bg-[linear-gradient(135deg,rgba(59,130,246,0.35),rgba(59,130,246,0.7))] shadow-[0_12px_22px_rgba(59,130,246,0.35)] transition-transform duration-200 ease-out';
	const MODE_THUMB_EPIC_CLASS =
		'translate-x-[calc(100%+0.5rem)] bg-[linear-gradient(135deg,rgba(244,114,182,0.4),rgba(236,72,153,0.65))] shadow-[0_12px_22px_rgba(236,72,153,0.35)]';

	const shareButtonBaseClass =
		'inline-flex items-center justify-center rounded-lg border border-sky-400/55 bg-slate-900/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-200/95 transition duration-150 ease-out hover:-translate-y-0.5 hover:border-sky-300/80 hover:text-sky-50 hover:shadow-[0_10px_22px_rgba(14,165,233,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60';
	const shareButtonClass = $derived(() => {
		if (copyStatus === 'copied') {
			return `${shareButtonBaseClass} border-emerald-400/80 text-emerald-200/95 hover:shadow-[0_10px_22px_rgba(74,222,128,0.25)]`;
		}

		if (copyStatus === 'error') {
			return `${shareButtonBaseClass} border-rose-400/85 text-rose-200/95 hover:shadow-[0_10px_22px_rgba(248,113,113,0.35)]`;
		}

		return shareButtonBaseClass;
	});

	type LegendDeviceItem = { type: NodeType; label: string };

	const legendDeviceGroups: Array<{ title: string; items: LegendDeviceItem[] }> = [
		{
			title: 'Infrastructure',
			items: [
				{ type: 'router', label: 'Router' },
				{ type: 'switch', label: 'Switch' },
				{ type: 'firewall', label: 'Firewall' },
				{ type: 'wlc', label: 'Controller' }
			]
		},
		{
			title: 'Endpoints',
			items: [
				{ type: 'workstation', label: 'PC / Laptop' },
				{ type: 'printer', label: 'Printer' },
				{ type: 'telephone', label: 'Phone' },
				{ type: 'ap', label: 'Access Point' }
			]
		},
		{
			title: 'Special',
			items: [
				{ type: 'server', label: 'Server Stack' },
				{ type: 'db', label: 'Database' },
				{ type: 'cctv', label: 'CCTV' }
			]
		}
	];

	const privateRanges = ['10.x.x.x', '172.16.x.x'] as const;
	const securityBoundaryHint = 'Security boundary enforced by the Perimeter Firewall';
	const EXPORT_BACKGROUND = '#01010a';

	$effect(() => {
		const q = pageState.current.url.searchParams.get('icons') as IconSet | null;
		if ((q === 'affinity' || q === 'crayon') && iconSetState.current !== q) {
			iconSetState.current = q;
		}
	});

	onDestroy(() => {
		if (copyTimeout) {
			clearTimeout(copyTimeout);
		}
	});

	function setMode(mode: IconSet) {
		if (iconSetState.current !== mode) {
			iconSetState.current = mode;
		}
	}

	function toggleMode() {
		setMode(iconSetState.current === 'crayon' ? 'affinity' : 'crayon');
	}

	async function exportCanvas() {
		if (typeof window === 'undefined') {
			return;
		}

		const exportElement = diagramFrameElement ?? flowCanvasComponent?.getCanvasElement?.();
		if (!exportElement) {
			return;
		}

		let exportTarget: HTMLElement = exportElement;
		let cleanup: (() => void) | null = null;
		let targetWidth: number | undefined;
		let targetHeight: number | undefined;

		if (exportElement === diagramFrameElement && exportElement.isConnected) {
			const rect = exportElement.getBoundingClientRect();
			const clone = exportElement.cloneNode(true) as HTMLElement;
			clone.style.margin = '0';
			clone.style.maxWidth = 'none';
			clone.style.width = `${rect.width}px`;
			clone.style.height = `${rect.height}px`;
			clone.style.boxSizing = 'border-box';

			const wrapper = document.createElement('div');
			wrapper.style.position = 'fixed';
			wrapper.style.inset = '0';
			wrapper.style.pointerEvents = 'none';
			wrapper.style.opacity = '0';
			wrapper.style.zIndex = '-1';

			const pageElement = document.querySelector('.page') as HTMLElement | null;
			const pageStyle = pageElement ? window.getComputedStyle(pageElement) : null;
			const backgroundContainer = document.createElement('div');
			backgroundContainer.style.display = 'inline-block';
			backgroundContainer.style.width = `${rect.width}px`;
			backgroundContainer.style.height = `${rect.height}px`;
			backgroundContainer.style.margin = '0';
			backgroundContainer.style.backgroundColor = EXPORT_BACKGROUND;

			if (pageStyle) {
				const backgroundImage = pageStyle.backgroundImage;
				if (backgroundImage && backgroundImage !== 'none') {
					backgroundContainer.style.backgroundImage = backgroundImage;
					backgroundContainer.style.backgroundPosition = pageStyle.backgroundPosition;
					backgroundContainer.style.backgroundSize = pageStyle.backgroundSize;
					backgroundContainer.style.backgroundRepeat = pageStyle.backgroundRepeat;
				}
			}

			backgroundContainer.appendChild(clone);
			wrapper.appendChild(backgroundContainer);
			document.body.appendChild(wrapper);

			exportTarget = backgroundContainer;
			targetWidth = rect.width;
			targetHeight = rect.height;
			cleanup = () => {
				document.body.removeChild(wrapper);
			};
		}

		const exportOptions: {
			cacheBust: boolean;
			pixelRatio: number;
			width?: number;
			height?: number;
			backgroundColor?: string;
		} = {
			cacheBust: true,
			pixelRatio: window.devicePixelRatio ?? 1,
			backgroundColor: EXPORT_BACKGROUND
		};

		if (targetWidth) {
			exportOptions.width = targetWidth;
		}

		if (targetHeight) {
			exportOptions.height = targetHeight;
		}

		exporting = true;

		let previousBackgroundColor: string | null = null;

		if (exportTarget instanceof HTMLElement && exportTarget.style) {
			previousBackgroundColor = exportTarget.style.backgroundColor ?? null;
			exportTarget.style.backgroundColor = EXPORT_BACKGROUND;
		}

		try {
			const { toPng } = await import('html-to-image');
			const dataUrl = await toPng(exportTarget, exportOptions);

			const link = document.createElement('a');
			const modeLabel = iconSetState.current === 'crayon' ? 'epic' : 'standard';
			link.href = dataUrl;
			link.download = `network-topology-${modeLabel}.png`;
			link.click();
		} catch (error) {
			console.error('Failed to export canvas', error);
		} finally {
			if (exportTarget instanceof HTMLElement && exportTarget.style) {
				if (previousBackgroundColor) {
					exportTarget.style.backgroundColor = previousBackgroundColor;
				} else {
					exportTarget.style.removeProperty('background-color');
				}
			}
			cleanup?.();
			exporting = false;
		}
	}

	async function copyShareLink() {
		if (typeof window === 'undefined') {
			return;
		}

		if (copyTimeout) {
			clearTimeout(copyTimeout);
			copyTimeout = null;
		}

		try {
			await navigator.clipboard.writeText(window.location.href);
			copyStatus = 'copied';
		} catch (error) {
			console.error('Failed to copy link', error);
			copyStatus = 'error';
		}

		copyTimeout = setTimeout(() => {
			copyStatus = 'idle';
			copyTimeout = null;
		}, 2500);
	}
</script>

<div
	class="page min-h-screen bg-[linear-gradient(180deg,#0f172a_0%,#020617_60%,#01010a_100%)] text-slate-100"
>
	<div class="page__inner mx-auto w-full max-w-6xl px-6 py-12 sm:py-16 lg:py-20">
		<header
			class="page__header grid gap-6 rounded-2xl border border-slate-300/45 bg-[linear-gradient(90deg,#7eb6de_0%,#68a2cf_100%)] px-6 py-7 text-slate-900 shadow-[0_26px_52px_rgba(15,23,42,0.4)] lg:grid-cols-[1fr,auto]"
		>
			<div class="page__hero flex flex-wrap items-center gap-5">
				<div
					class="page__brand inline-flex items-center gap-3 rounded-full border border-white/40 bg-white/50 px-3 py-1 backdrop-blur-md"
				>
					<img
						class="page__logo h-12 w-12 object-contain"
						src="/logo/logo-512.png"
						alt="SecureStart company logo"
					/>
					<span class="page__brand-name text-xl font-bold tracking-tight text-slate-900">
						SecureStart
					</span>
				</div>
				<div class="page__hero-copy flex min-w-[15rem] flex-col gap-2">
					<h1 class="page__title text-3xl font-semibold tracking-tight text-slate-900 md:text-[2.1rem]">
						High School Network Topology
					</h1>
					<p class="page__blurb max-w-xl text-sm leading-relaxed text-slate-900/75 md:text-base">
						Explore the SecureStart network flowchart to trace campus connectivity, security zones, and key
						infrastructure at a glance.
					</p>
				</div>
			</div>

			<div
				class="control-panel flex w-full flex-col gap-3 rounded-xl border border-slate-900/35 bg-slate-900/85 p-4 text-slate-200/90 sm:w-[20rem] sm:justify-self-end"
			>
				<div class="mode-switch flex flex-col gap-1">
					<span class="mode-switch__label text-[0.65rem] uppercase tracking-[0.1em] text-slate-400/80">
						Mode
					</span>
					<button
						type="button"
						class={`${MODE_TOGGLE_BASE_CLASS} ${isEpic ? MODE_TOGGLE_EPIC_CLASS : ''}`}
						role="switch"
						aria-label="Mode"
						aria-checked={isEpic}
						onclick={toggleMode}
					>
						<span
							class={`relative z-10 transition-colors ${isEpic ? 'text-slate-400/60' : 'text-slate-200/90'}`}
						>
							Standard
						</span>
						<span
							class={`relative z-10 transition-colors ${isEpic ? 'text-pink-200/90' : 'text-slate-200/70'}`}
						>
							Epic
						</span>
						<span
							class={`${MODE_THUMB_BASE_CLASS} ${isEpic ? MODE_THUMB_EPIC_CLASS : ''}`}
							aria-hidden="true"
						></span>
					</button>
				</div>

				<button
					type="button"
					class="export-button inline-flex items-center justify-center rounded-xl border border-slate-400/35 bg-[linear-gradient(135deg,rgba(59,130,246,0.18),rgba(14,116,144,0.28))] px-5 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-sky-100/90 shadow-[0_12px_25px_rgba(59,130,246,0.25)] transition duration-150 hover:-translate-y-0.5 hover:border-slate-300/60 hover:shadow-[0_12px_25px_rgba(59,130,246,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 disabled:cursor-wait disabled:opacity-65 disabled:shadow-none"
					onclick={exportCanvas}
					disabled={exporting}
				>
					{exporting ? 'Exporting…' : 'Export PNG'}
				</button>
				<button type="button" class={shareButtonClass} onclick={copyShareLink}>
					{shareLabel}
				</button>
			</div>
		</header>

		<section
			class="page__legend mt-8 rounded-3xl border border-slate-500/25 bg-[linear-gradient(145deg,rgba(15,23,42,0.9),rgba(30,41,59,0.8))] px-6 py-8 shadow-[0_26px_48px_rgba(2,6,23,0.55)]"
			aria-labelledby="diagram-legend-title"
		>
			<div class="diagram__legend grid gap-6 text-xs text-slate-200/85 md:grid-cols-2 xl:grid-cols-3">
				<h2
					id="diagram-legend-title"
					class="diagram__section-title col-span-full text-sm font-semibold uppercase tracking-[0.08em] text-slate-300/90"
				>
					Diagram Legend
				</h2>

				<div
					class="diagram__legend-section flex flex-col gap-4 rounded-xl border border-slate-500/24 bg-[linear-gradient(160deg,rgba(148,163,184,0.14),rgba(15,23,42,0.55))] p-5 shadow-[0_18px_32px_rgba(15,23,42,0.35)]"
				>
					<p class="diagram__legend-heading text-xs font-semibold uppercase tracking-[0.08em] text-slate-300/95">
						Zone Indicators
					</p>
					<div class="diagram__legend-zones flex flex-col gap-3">
						<div class="diagram__legend-zone-list flex flex-wrap items-center gap-2.5">
							{#each zoneLegendEntries as zone (zone.id)}
								<div
									class="diagram__legend-zone inline-flex items-center gap-2 rounded-full border border-slate-500/30 bg-[linear-gradient(135deg,rgba(15,23,42,0.55),rgba(30,41,59,0.48))] px-3 py-2 shadow-[0_12px_24px_rgba(15,23,42,0.28)]"
								>
									<span
										class="diagram__legend-zone-label text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-slate-100/90"
									>
										{zone.label}
									</span>
									{#if zone.trustLevel}
										<span
											class={`${TRUST_BADGE_BASE_CLASS} ${TRUST_BADGE_COLOR_CLASSES[zone.trustLevel!]}`}
										>
											{TRUST_LABELS[zone.trustLevel!]}
										</span>
									{/if}
								</div>
							{/each}
						</div>

						<div class="diagram__legend-trust grid gap-3">
							{#each trustLegend as trust (trust.level)}
								<div
									class="diagram__legend-trust-item flex items-start gap-3 text-[0.72rem] leading-relaxed text-slate-200/80"
								>
									<span
										class={`${TRUST_BADGE_BASE_CLASS} ${TRUST_BADGE_COLOR_CLASSES[trust.level]}`}
									>
										{TRUST_LABELS[trust.level]}
									</span>
									<p class="m-0">{trust.copy}</p>
								</div>
							{/each}
						</div>

						<div
							class="diagram__legend-zone-hint flex items-center gap-3 text-[0.72rem] leading-relaxed text-slate-200/70"
						>
							<span
								class="diagram__legend-zone-swatch inline-block h-4 w-7 rounded-full border-2 border-yellow-300/75 bg-[linear-gradient(160deg,rgba(253,224,71,0.16),rgba(15,23,42,0.6))] shadow-[0_0_0_2px_rgba(253,224,71,0.3),0_0_18px_rgba(253,224,71,0.35)]"
								aria-hidden="true"
							></span>
							<span>
								Yellow border marks representative or repeated spaces (e.g. typical classroom or office).
							</span>
						</div>
					</div>
				</div>

				<div
					class="diagram__legend-section flex flex-col gap-4 rounded-xl border border-slate-500/24 bg-[linear-gradient(160deg,rgba(148,163,184,0.14),rgba(15,23,42,0.55))] p-5 shadow-[0_18px_32px_rgba(15,23,42,0.35)]"
				>
					<p class="diagram__legend-heading text-xs font-semibold uppercase tracking-[0.08em] text-slate-300/95">
						Device Types
					</p>
					<div class="diagram__legend-groups space-y-4">
						{#each legendDeviceGroups as group (group.title)}
							<div class="diagram__legend-group flex flex-col gap-2.5">
								<span class="diagram__legend-group-title text-[0.72rem] uppercase tracking-[0.08em] text-slate-300/80">
									{group.title}
								</span>
								<div class="diagram__legend-device-grid grid gap-3 sm:grid-cols-2">
									{#each group.items as item (item.type)}
										<div class="diagram__legend-device flex items-center gap-2 text-slate-200/90">
											<Icon type={item.type} size={32} title={item.label} />
											<span class="text-[0.74rem]">{item.label}</span>
										</div>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				</div>

				<div
					class="diagram__legend-section flex flex-col gap-4 rounded-xl border border-slate-500/24 bg-[linear-gradient(160deg,rgba(148,163,184,0.14),rgba(15,23,42,0.55))] p-5 shadow-[0_18px_32px_rgba(15,23,42,0.35)]"
				>
					<p class="diagram__legend-heading text-xs font-semibold uppercase tracking-[0.08em] text-slate-300/95">
						Network Context
					</p>
					<div class="diagram__legend-network flex flex-col gap-3.5">
						<div class="diagram__legend-network-item flex flex-wrap items-center gap-3 text-slate-200/80">
							<span class="diagram__legend-link inline-block h-0.5 w-12 rounded-full bg-slate-400/70" aria-hidden="true"></span>
							<span>Wired uplink</span>
						</div>
						<div class="diagram__legend-network-item flex flex-wrap items-center gap-3 text-slate-200/80">
							<span class="diagram__legend-link inline-block w-12 border-b border-dashed border-sky-300/85" aria-hidden="true"></span>
							<span>Wireless association</span>
						</div>
						<div class="diagram__legend-network-item flex flex-wrap items-center gap-3 text-slate-200/80">
							<div class="diagram__legend-range-list inline-flex flex-wrap items-center gap-2">
								{#each privateRanges as range}
									<span class="diagram__legend-range inline-flex items-center justify-center rounded-md border border-teal-200/40 bg-teal-900/20 px-2 py-0.5 font-mono text-[0.68rem] text-teal-100/90">
										{range}
									</span>
								{/each}
							</div>
							<span>Private IPv4 ranges indicating internal networks.</span>
						</div>
						<div class="diagram__legend-network-item flex flex-wrap items-center gap-3 text-slate-200/80">
							<span class="diagram__legend-lock relative flex h-3.5 w-4 items-center justify-center" aria-hidden="true">
								<span class="absolute -top-2 h-2 w-4 rounded-t-full border-2 border-teal-300/70 border-b-0"></span>
								<span class="block h-3.5 w-4 rounded-[0.2rem] border-2 border-teal-300/70"></span>
							</span>
							<span>{securityBoundaryHint}</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>

	<section class="diagram w-full px-6 pb-16 md:px-10 lg:px-16">
		<div class="diagram__inner w-full">
			<div
				class="diagram__frame relative mx-auto max-w-6xl rounded-3xl border border-slate-500/20 bg-slate-900/60 p-6 shadow-[0_30px_60px_rgba(2,6,23,0.65)]"
				bind:this={diagramFrameElement}
			>
				<div
					class="diagram__canvas relative w-full rounded-2xl bg-[linear-gradient(140deg,rgba(30,41,59,0.4),rgba(15,23,42,0.8))] p-6"
					aria-labelledby="diagram-canvas-title"
				>
					<h2
						id="diagram-canvas-title"
						class="diagram__section-title mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-slate-200/90"
					>
						Network Flowchart
					</h2>
					<FlowCanvas {layout} bind:this={flowCanvasComponent} />
				</div>
			</div>
		</div>
	</section>

	<div class="page__inner mx-auto w-full max-w-6xl px-6 pb-16 pt-8">
		<footer class="page__footer text-center text-xs text-slate-400/70">
			Created by
			<a
				class="text-slate-300 hover:text-slate-100 focus-visible:text-slate-100"
				href="https://github.com/greenhillth"
				target="_blank"
				rel="noopener noreferrer"
			>
				Tom Greenhill
			</a>
			(z5309693) for <b>INFS1701 Assignment 1</b>. Icons by
			<a
				class="text-slate-300 hover:text-slate-100 focus-visible:text-slate-100"
				href="https://www.affinity.serif.com/en-gb/iconset/"
				target="_blank"
				rel="noopener noreferrer"
			>
				Affinity
			</a>
			and
			<a
				class="text-slate-300 hover:text-slate-100 focus-visible:text-slate-100"
				href="https://crayons.world/"
				target="_blank"
				rel="noopener noreferrer"
			>
				Crayons
			</a>
			. Source code available on
			<a
				class="text-slate-300 hover:text-slate-100 focus-visible:text-slate-100"
				href="https://github.com/greenhillth/INFS1701-assignment1"
				target="_blank"
				rel="noopener noreferrer"
			>
				GitHub
			</a>
			.
		</footer>
	</div>
</div>
