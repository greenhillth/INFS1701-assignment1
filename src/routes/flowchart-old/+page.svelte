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

<div class="page">
	<div class="page__inner">
		<header class="page__header">
			<div class="page__hero">
				<div class="page__brand">
					<img class="page__logo" src="/logo/logo-512.png" alt="SecureStart company logo" />
					<span class="page__brand-name">SecureStart</span>
				</div>
				<div class="page__hero-copy">
					<h1 class="page__title">High School Network Topology</h1>
					<p class="page__blurb">
						Explore the SecureStart network flowchart to trace campus connectivity, security zones, and
						key infrastructure at a glance.
					</p>
				</div>
			</div>

			<div class="control-panel">
				<div class="mode-switch">
					<span class="mode-switch__label">Mode</span>
					<button
						type="button"
						class={`mode-switch__toggle${isEpic ? ' mode-switch__toggle--epic' : ''}`}
						role="switch"
						aria-label="Mode"
						aria-checked={isEpic}
						onclick={toggleMode}
					>
						<span class="mode-switch__option mode-switch__option--standard"> Standard </span>
						<span class="mode-switch__thumb" aria-hidden="true"></span>
						<span class="mode-switch__option mode-switch__option--epic"> epic </span>
					</button>
				</div>

				<button type="button" class="export-button" onclick={exportCanvas} disabled={exporting}>
					{exporting ? 'Exporting…' : 'Export PNG'}
				</button>
				<button
					type="button"
					class={`share-button${copyStatus === 'copied' ? ' share-button--success' : ''}${
						copyStatus === 'error' ? ' share-button--error' : ''
					}`}
					onclick={copyShareLink}
				>
					{shareLabel}
				</button>
			</div>
		</header>
		<section class="page__legend" aria-labelledby="diagram-legend-title">
			<div class="diagram__legend">
				<h2 id="diagram-legend-title" class="diagram__section-title diagram__section-title--legend">
					Diagram Legend
				</h2>
				<div class="diagram__legend-section">
					<p class="diagram__legend-heading">Zone Indicators</p>
					<div class="diagram__legend-zones">
						<div class="diagram__legend-zone-list">
							{#each zoneLegendEntries as zone (zone.id)}
								<div class="diagram__legend-zone">
									<span class="diagram__legend-zone-label">{zone.label}</span>
									{#if zone.trustLevel}
										<span class={`trust-badge trust-badge--${zone.trustLevel!}`}>
											{TRUST_LABELS[zone.trustLevel!]}
										</span>
									{/if}
								</div>
							{/each}
						</div>
						<div class="diagram__legend-trust">
							{#each trustLegend as trust (trust.level)}
								<div class="diagram__legend-trust-item">
									<span class={`trust-badge trust-badge--${trust.level}`}>
										{TRUST_LABELS[trust.level]}
									</span>
									<p>{trust.copy}</p>
								</div>
							{/each}
						</div>
						<div class="diagram__legend-zone-hint">
							<span class="diagram__legend-zone-swatch" aria-hidden="true"></span>
							<span>
								Yellow border marks representative or repeated spaces (e.g. typical classroom or office).
							</span>
						</div>
					</div>
				</div>

				<div class="diagram__legend-section">
					<p class="diagram__legend-heading">Device Types</p>
					<div class="diagram__legend-groups">
						{#each legendDeviceGroups as group (group.title)}
							<div class="diagram__legend-group">
								<span class="diagram__legend-group-title">{group.title}</span>
								<div class="diagram__legend-device-grid">
									{#each group.items as item (item.type)}
										<div class="diagram__legend-device">
											<Icon type={item.type} size={32} title={item.label} />
											<span>{item.label}</span>
										</div>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				</div>

				<div class="diagram__legend-section">
					<p class="diagram__legend-heading">Network Context</p>
					<div class="diagram__legend-network">
						<div class="diagram__legend-network-item">
							<span class="diagram__legend-link" aria-hidden="true"></span>
							<span>Wired uplink</span>
						</div>
						<div class="diagram__legend-network-item">
							<span class="diagram__legend-link diagram__legend-link--dashed" aria-hidden="true"></span>
							<span>Wireless association</span>
						</div>
						<div class="diagram__legend-network-item">
							<div class="diagram__legend-range-list">
								{#each privateRanges as range}
									<span class="diagram__legend-range">{range}</span>
								{/each}
							</div>
							<span>Private IPv4 ranges indicating internal networks.</span>
						</div>
						<div class="diagram__legend-network-item">
							<span class="diagram__legend-lock" aria-hidden="true"></span>
							<span>{securityBoundaryHint}</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>

	<section class="diagram">
		<div class="diagram__inner">
			<div class="diagram__frame" bind:this={diagramFrameElement}>
				<div class="diagram__canvas" aria-labelledby="diagram-canvas-title">
					<h2 id="diagram-canvas-title" class="diagram__section-title diagram__section-title--canvas">
						Network Flowchart
					</h2>
					<FlowCanvas {layout} bind:this={flowCanvasComponent} />
				</div>
			</div>
		</div>
	</section>

	<div class="page__inner">
		<footer class="page__footer">
			Created by
			<a href="https://github.com/greenhillth" target="_blank" rel="noopener noreferrer"> Tom Greenhill </a>
			(z5309693) for <b>INFS1701 Assignment 1</b>. Icons by
			<a href="https://www.affinity.serif.com/en-gb/iconset/" target="_blank" rel="noopener noreferrer"> Affinity </a>
			and
			<a href="https://crayons.world/" target="_blank" rel="noopener noreferrer"> Crayons </a>.
			Source code available on
			<a href="https://github.com/greenhillth/INFS1701-assignment1" target="_blank" rel="noopener noreferrer"> GitHub </a>.
		</footer>
	</div>
</div>

<style>
	.page {
		min-height: 100vh;
		background: linear-gradient(180deg, #0f172a 0%, #020617 60%, #01010a 100%);
		color: #f8fafc;
	}

	.page__inner {
		margin: 0 auto;
		max-width: 96rem;
		padding: 3rem 2rem;
	}

	.page__inner:last-of-type {
		padding-top: 2rem;
		padding-bottom: 4rem;
	}

	.page__header {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		align-items: center;
		gap: 1.5rem;
		margin-bottom: 2rem;
		padding: 1.75rem 2rem;
		border-radius: 1.25rem;
		border: 1px solid rgb(148 163 184 / 0.45);
		background: linear-gradient(90deg, #7eb6de 0%, #68a2cf 100%);
		box-shadow: 0 26px 52px rgb(15 23 42 / 0.4);
		color: #0b1f33;
	}

	.page__hero {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 1.25rem;
	}

	.page__brand {
		display: inline-flex;
		align-items: center;
		gap: 0.85rem;
		padding: 0.35rem 0.85rem;
		border-radius: 9999px;
		border: 1px solid rgb(255 255 255 / 0.45);
		background: rgb(255 255 255 / 0.5);
		backdrop-filter: blur(8px);
	}

	.page__logo {
		width: 48px;
		height: 48px;
		object-fit: contain;
	}

	.page__brand-name {
		font-size: 1.5rem;
		font-weight: 700;
		letter-spacing: -0.01em;
		color: inherit;
		text-shadow: 0 1px 0 rgb(255 255 255 / 0.35);
	}

	.page__hero-copy {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		min-width: 15rem;
	}

	.page__title {
		margin: 0;
		font-size: 1.95rem;
		font-weight: 700;
		letter-spacing: -0.015em;
		color: #0b1f33;
	}

	.page__blurb {
		margin: 0;
		font-size: 0.95rem;
		line-height: 1.5;
		color: rgb(15 23 42 / 0.75);
		max-width: clamp(22rem, 50vw, 32rem);
	}

	.page__legend {
		margin-top: 2rem;
		border-radius: 1.5rem;
		border: 1px solid rgb(148 163 184 / 0.25);
		background: linear-gradient(145deg, rgb(15 23 42 / 0.9), rgb(30 41 59 / 0.8));
		box-shadow: 0 26px 48px rgb(2 6 23 / 0.55);
		padding: clamp(1.5rem, 4vw, 2.5rem);
	}

	.page__legend .diagram__section-title--legend {
		margin-bottom: 1.25rem;
		color: rgb(226 232 240 / 0.92);
	}

	.page__legend > .diagram__legend {
		margin: 0;
	}

	.control-panel {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
		width: 20rem;
		margin-left: auto;
		padding: 1rem;
		border-radius: 1rem;
		border: 1px solid rgb(15 23 42 / 0.35);
		background: rgb(15 23 42 / 0.82);
		box-shadow: 0 18px 32px rgb(15 23 42 / 0.4);
	}

	.mode-switch {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.mode-switch__label {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: rgb(226 232 240 / 0.75);
	}

	.mode-switch__toggle {
		position: relative;
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		align-items: center;
		padding: 0.4rem;
		border-radius: 9999px;
		border: 1px solid rgb(148 163 184 / 0.35);
		background: rgb(15 23 42 / 0.65);
		color: rgb(226 232 240 / 0.85);
		font-size: 0.8rem;
		font-weight: 500;
		letter-spacing: 0.02em;
		cursor: pointer;
		transition:
			border-color 150ms ease,
			background 150ms ease,
			box-shadow 150ms ease;
	}

	.mode-switch__toggle:hover {
		border-color: rgb(148 163 184 / 0.55);
		background: rgb(30 41 59 / 0.75);
	}

	.mode-switch__toggle:focus-visible {
		outline: 2px solid rgb(96 165 250 / 0.8);
		outline-offset: 2px;
	}

	.mode-switch__thumb {
		position: absolute;
		inset: 0.25rem auto 0.25rem 0.25rem;
		width: calc(50% - 0.5rem);
		border-radius: 9999px;
		background: linear-gradient(135deg, rgb(59 130 246 / 0.35), rgb(59 130 246 / 0.7));
		box-shadow: 0 12px 22px rgb(59 130 246 / 0.35);
		transform: translateX(0);
		transition: transform 200ms ease;
		z-index: 1;
	}

	.mode-switch__toggle--epic .mode-switch__thumb {
		transform: translateX(calc(100% + 0.5rem));
	}

	.mode-switch__option {
		position: relative;
		z-index: 2;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.2rem;
		padding: 0.15rem 0.3rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		pointer-events: auto;
	}

	.mode-switch__option--standard {
		color: rgb(226 232 240 / 0.85);
	}

	.mode-switch__option--epic {
		color: rgb(226 232 240 / 0.68);
	}

	.mode-switch__toggle--epic .mode-switch__option--standard {
		color: rgb(226 232 240 / 0.6);
	}

	.mode-switch__toggle--epic .mode-switch__option--epic {
		color: rgb(244 114 182 / 0.9);
	}

	.export-button {
		display: inline-flex;
		justify-content: center;
		align-items: center;
		gap: 0.4rem;
		padding: 0.55rem 1.1rem;
		border-radius: 0.9rem;
		border: 1px solid rgb(148 163 184 / 0.35);
		background: linear-gradient(135deg, rgb(59 130 246 / 0.18), rgb(14 116 144 / 0.28));
		color: rgb(191 219 254 / 0.92);
		font-size: 0.82rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		cursor: pointer;
		transition:
			transform 150ms ease,
			box-shadow 150ms ease,
			border-color 150ms ease,
			background 150ms ease;
	}

	.export-button:hover:not(:disabled) {
		transform: translateY(-1px);
		border-color: rgb(148 163 184 / 0.6);
		background: linear-gradient(135deg, rgb(59 130 246 / 0.26), rgb(14 116 144 / 0.4));
		box-shadow: 0 12px 25px rgb(59 130 246 / 0.25);
	}

	.export-button:focus-visible {
		outline: 2px solid rgb(96 165 250 / 0.8);
		outline-offset: 2px;
	}

	.export-button:disabled {
		opacity: 0.65;
		cursor: wait;
		box-shadow: none;
	}

	.share-button {
		display: inline-flex;
		justify-content: center;
		align-items: center;
		padding: 0.6rem 1.1rem;
		border-radius: 0.85rem;
		border: 1px solid rgb(96 165 250 / 0.55);
		background: rgb(15 23 42 / 0.7);
		color: rgb(191 219 254 / 0.95);
		font-size: 0.8rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		transition:
			transform 150ms ease,
			box-shadow 150ms ease,
			border-color 150ms ease,
			color 150ms ease;
	}

	.share-button:hover,
	.share-button:focus-visible {
		transform: translateY(-1px);
		border-color: rgb(56 189 248 / 0.85);
		color: rgb(224 242 254);
		box-shadow: 0 10px 22px rgb(14 165 233 / 0.25);
	}

	.share-button--success {
		border-color: rgb(74 222 128 / 0.8);
		color: rgb(187 247 208 / 0.95);
		box-shadow: 0 10px 22px rgb(74 222 128 / 0.25);
	}

	.share-button--error {
		border-color: rgb(248 113 113 / 0.85);
		color: rgb(254 202 202 / 0.95);
		box-shadow: 0 10px 22px rgb(248 113 113 / 0.35);
	}

	@media (max-width: 40rem) {
		.page__header {
			padding: 1.5rem;
		}

		.page__brand {
			width: 100%;
			justify-content: center;
		}

		.control-panel {
			width: 100%;
		}

		.page__legend {
			padding: 1.25rem;
		}

		.diagram__legend {
			grid-template-columns: minmax(0, 1fr);
		}
	}

	@media (min-width: 62rem) {
		.page__header {
			grid-template-columns: minmax(0, 1fr) auto;
		}
	}

	@media (max-width: 68rem) and (min-width: 40.0625rem) {
		.diagram__legend {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	.diagram {
		width: 100%;
		padding: 0 clamp(1.5rem, 5vw, 3rem);
		margin: 0 auto 2.5rem;
	}

	.diagram__inner {
		width: 100%;
	}

	.diagram__frame {
		position: relative;
		border-radius: 2rem;
		border: 1px solid rgb(148 163 184 / 0.2);
		background: rgb(15 23 42 / 0.55);
		box-shadow: 0 30px 60px rgb(2 6 23 / 0.65);
		max-width: 96rem;
		margin: 0 auto;
		padding: 1.5rem;
	}

	.diagram__section-title {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: rgb(148 163 184 / 0.95);
	}

	.diagram__section-title--legend {
		grid-column: 1 / -1;
	}

	.diagram__section-title--canvas {
		margin-bottom: 1rem;
		color: rgb(226 232 240 / 0.92);
	}

	.diagram__canvas {
		position: relative;
		width: 100%;
		border-radius: 1.5rem;
		overflow: visible;
		background: linear-gradient(140deg, rgb(30 41 59 / 0.4), rgb(15 23 42 / 0.8));
		padding: 1.5rem;
	}

	.diagram__canvas :global(.canvas) {
		margin: 0 auto;
	}

	.diagram__legend {
		display: grid;
		gap: 1.5rem;
		margin: 1.5rem 0 0;
		font-size: 0.75rem;
		color: rgb(226 232 240 / 0.82);
		grid-template-columns: repeat(3, minmax(0, 1fr));
		align-items: stretch;
	}

	.diagram__legend-section {
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
		padding: 1rem 1.25rem;
		border-radius: 1.25rem;
		border: 1px solid rgb(148 163 184 / 0.24);
		background: linear-gradient(160deg, rgb(148 163 184 / 0.14), rgb(15 23 42 / 0.55));
		box-shadow: 0 18px 32px rgb(15 23 42 / 0.35);
		backdrop-filter: blur(6px);
	}

	.diagram__legend-heading {
		margin: 0;
		font-size: 0.82rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: rgb(148 163 184 / 0.95);
	}

	.diagram__legend-zones {
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}

	.diagram__legend-zone-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
	}

	.diagram__legend-zone {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		padding: 0.4rem 0.65rem 0.4rem 0.75rem;
		border-radius: 9999px;
		border: 1px solid rgb(148 163 184 / 0.28);
		background: linear-gradient(135deg, rgb(15 23 42 / 0.55), rgb(30 41 59 / 0.48));
		box-shadow: 0 12px 24px rgb(15 23 42 / 0.28);
	}

	.diagram__legend-zone-label {
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-weight: 600;
		color: rgb(241 245 249 / 0.92);
	}

	.diagram__legend-trust {
		display: grid;
		gap: 0.65rem;
	}

	.diagram__legend-trust-item {
		display: flex;
		align-items: flex-start;
		gap: 0.6rem;
		font-size: 0.72rem;
		color: rgb(226 232 240 / 0.78);
		line-height: 1.45;
	}

	.diagram__legend-trust-item p {
		margin: 0;
	}

	.trust-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.25rem 0.7rem;
		border-radius: 9999px;
		border: 1px solid rgb(148 163 184 / 0.35);
		font-size: 0.6rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: rgb(226 232 240 / 0.88);
		background: linear-gradient(135deg, rgb(148 163 184 / 0.2), rgb(15 23 42 / 0.55));
		box-shadow: 0 10px 24px rgb(15 23 42 / 0.32);
		white-space: nowrap;
	}

	.trust-badge--none {
		border-color: rgb(248 113 113 / 0.6);
		background: linear-gradient(135deg, rgb(248 113 113 / 0.22), rgb(190 24 93 / 0.18));
		color: rgb(254 202 202 / 0.96);
	}

	.trust-badge--low {
		border-color: rgb(252 211 77 / 0.6);
		background: linear-gradient(135deg, rgb(251 191 36 / 0.24), rgb(217 119 6 / 0.2));
		color: rgb(254 249 195 / 0.95);
	}

	.trust-badge--high {
		border-color: rgb(74 222 128 / 0.65);
		background: linear-gradient(135deg, rgb(52 211 153 / 0.26), rgb(22 163 74 / 0.2));
		color: rgb(187 247 208 / 0.96);
	}

	.diagram__legend-zone-hint {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		font-size: 0.72rem;
		color: rgb(226 232 240 / 0.68);
		line-height: 1.4;
	}

	.diagram__legend-zone-swatch {
		position: relative;
		display: inline-block;
		width: 1.75rem;
		height: 1.1rem;
		border-radius: 0.6rem;
		border: 2px solid rgb(253 224 71 / 0.75);
		background: linear-gradient(160deg, rgb(253 224 71 / 0.16), rgb(15 23 42 / 0.6));
		box-shadow: 0 0 0 2px rgb(253 224 71 / 0.3), 0 0 18px rgb(253 224 71 / 0.35);
	}

	.diagram__legend-groups {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	.diagram__legend-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.diagram__legend-group-title {
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: rgb(148 163 184 / 0.78);
	}

	.diagram__legend-device-grid {
		display: grid;
		gap: 0.6rem 1rem;
		grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
	}

	.diagram__legend-device {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		color: rgb(226 232 240 / 0.9);
		font-weight: 500;
	}

	.diagram__legend-device span {
		font-size: 0.74rem;
	}

	.diagram__legend-network {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	.diagram__legend-link {
		display: inline-block;
		width: 3rem;
		height: 0.125rem;
		background: rgb(148 163 184 / 0.7);
		border-radius: 9999px;
	}

	.diagram__legend-link--dashed {
		background: none;
		border-bottom: 1px dashed rgb(125 211 252 / 0.85);
	}

	.diagram__legend-network-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
		color: rgb(226 232 240 / 0.8);
		line-height: 1.4;
	}

	.diagram__legend-range-list {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		flex-wrap: wrap;
	}

	.diagram__legend-range {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.25rem 0.55rem;
		border-radius: 0.5rem;
		border: 1px solid rgb(94 234 212 / 0.4);
		background: rgb(15 118 110 / 0.18);
		color: rgb(204 251 241 / 0.9);
		font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
			'Courier New', monospace;
		font-size: 0.68rem;
	}

	.diagram__legend-lock {
		position: relative;
		display: inline-block;
		width: 1rem;
		height: 0.8rem;
		border: 2px solid rgb(94 234 212 / 0.7);
		border-radius: 0.2rem;
		box-sizing: border-box;
	}

	.diagram__legend-lock::before {
		content: '';
		position: absolute;
		top: -0.55rem;
		left: 50%;
		width: 1rem;
		height: 0.6rem;
		border: 2px solid rgb(94 234 212 / 0.7);
		border-bottom: none;
		border-radius: 0.55rem 0.55rem 0 0;
		transform: translateX(-50%);
		box-sizing: border-box;
	}

	.page__footer {
		margin-top: 3rem;
		text-align: center;
		font-size: 0.7rem;
		color: rgb(148 163 184 / 0.7);
	}

</style>
