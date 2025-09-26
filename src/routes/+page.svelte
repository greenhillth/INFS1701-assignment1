<script lang="ts">
	import { fromStore } from 'svelte/store';
	import { iconSet, type IconSet } from '$lib/stores/iconSet';
	import NodeCard from '$lib/components/NodeCard.svelte';
	import { page } from '$app/stores';

	type NodeType =
		| 'internet'
		| 'router'
		| 'switch'
		| 'mls'
		| 'server'
		| 'client'
		| 'firewall'
		| 'vpn'
		| 'wlc'
		| 'ap'
		| 'storage'
		| 'db';

	type Node = {
		id: string;
		label: string;
		type: NodeType;
		x: number;
		y: number;
		size?: number;
	};

	type Link = {
		source: Node['id'];
		target: Node['id'];
		dashed?: boolean;
	};

	type Zone = {
		id: string;
		label: string;
		left: number;
		top: number;
		width: number;
		height: number;
	};

	const nodes: Node[] = [
		{ id: 'isp', label: 'ISP', type: 'internet', x: 6, y: 46 },
		{ id: 'edge-modem', label: 'Edge Modem', type: 'router', x: 16, y: 46 },
		{ id: 'perimeter-fw', label: 'Perimeter Firewall', type: 'firewall', x: 26, y: 46 },
		{ id: 'core-router', label: 'Core Router', type: 'router', x: 36, y: 32 },
		{ id: 'core-switch', label: 'Core Switch Stack', type: 'mls', x: 36, y: 52 },
		{ id: 'wlc', label: 'Wireless LAN Controller', type: 'wlc', x: 38, y: 68 },

		{ id: 'dc-distribution', label: 'Data Centre Distribution', type: 'switch', x: 52, y: 18 },
		{ id: 'dmz-switch', label: 'DMZ Switch', type: 'switch', x: 64, y: 14 },
		{ id: 'web-servers', label: 'Web Frontends', type: 'server', x: 78, y: 10 },
		{ id: 'app-servers', label: 'Application Servers', type: 'server', x: 78, y: 20 },
		{ id: 'student-db', label: 'Student Records DB', type: 'db', x: 78, y: 30 },
		{ id: 'backup-storage', label: 'Backup Storage', type: 'storage', x: 90, y: 20 },

		{ id: 'admin-distribution', label: 'Admin Distribution', type: 'switch', x: 52, y: 34 },
		{ id: 'admin-access', label: 'Admin Access Switch', type: 'switch', x: 66, y: 34 },
		{ id: 'admin-ap', label: 'Admin Building AP', type: 'ap', x: 66, y: 26 },
		{ id: 'admin-clients', label: 'Admin Staff PCs', type: 'client', x: 82, y: 30 },
		{ id: 'admin-printers', label: 'Secure Printers', type: 'client', x: 82, y: 38 },

		{ id: 'library-distribution', label: 'Library Distribution', type: 'switch', x: 52, y: 50 },
		{ id: 'library-access', label: 'Library Access Switch', type: 'switch', x: 66, y: 50 },
		{ id: 'library-ap', label: 'Library Atrium AP', type: 'ap', x: 66, y: 58 },
		{ id: 'library-pcs', label: 'Study PCs', type: 'client', x: 82, y: 46 },
		{ id: 'library-kiosks', label: 'Self-check Kiosks', type: 'client', x: 82, y: 54 },

		{ id: 'labs-distribution', label: 'Engineering Labs Distribution', type: 'switch', x: 52, y: 66 },
		{ id: 'labs-access', label: 'Lab Access Switch', type: 'switch', x: 66, y: 66 },
		{ id: 'labs-ap', label: 'Engineering AP', type: 'ap', x: 66, y: 74 },
		{ id: 'labs-workstations', label: 'Research Workstations', type: 'client', x: 82, y: 62 },
		{ id: 'labs-iot', label: 'IoT Lab Gear', type: 'client', x: 82, y: 70 },

		{ id: 'residence-distribution', label: 'Residence Distribution', type: 'switch', x: 52, y: 82 },
		{ id: 'residence-access', label: 'Residence Access Switch', type: 'switch', x: 66, y: 82 },
		{ id: 'residence-ap', label: 'Hallway Mesh AP', type: 'ap', x: 66, y: 90 },
		{ id: 'residence-gaming', label: 'Student Consoles', type: 'client', x: 82, y: 78 },
		{ id: 'residence-laptops', label: 'Student Laptops', type: 'client', x: 82, y: 86 }
	];

	const links: Link[] = [
		{ source: 'isp', target: 'edge-modem' },
		{ source: 'edge-modem', target: 'perimeter-fw' },
		{ source: 'perimeter-fw', target: 'core-router' },
		{ source: 'core-router', target: 'core-switch' },
		{ source: 'core-router', target: 'dc-distribution' },
		{ source: 'core-switch', target: 'admin-distribution' },
		{ source: 'core-switch', target: 'library-distribution' },
		{ source: 'core-switch', target: 'labs-distribution' },
		{ source: 'core-switch', target: 'residence-distribution' },
		{ source: 'core-switch', target: 'wlc' },

		{ source: 'dc-distribution', target: 'dmz-switch' },
		{ source: 'dmz-switch', target: 'web-servers' },
		{ source: 'dmz-switch', target: 'app-servers' },
		{ source: 'dmz-switch', target: 'student-db' },
		{ source: 'student-db', target: 'backup-storage' },

		{ source: 'admin-distribution', target: 'admin-access' },
		{ source: 'admin-access', target: 'admin-clients' },
		{ source: 'admin-access', target: 'admin-printers' },
		{ source: 'wlc', target: 'admin-ap', dashed: true },
		{ source: 'admin-ap', target: 'admin-clients', dashed: true },
		{ source: 'admin-ap', target: 'admin-printers', dashed: true },

		{ source: 'library-distribution', target: 'library-access' },
		{ source: 'library-access', target: 'library-pcs' },
		{ source: 'library-access', target: 'library-kiosks' },
		{ source: 'wlc', target: 'library-ap', dashed: true },
		{ source: 'library-ap', target: 'library-pcs', dashed: true },
		{ source: 'library-ap', target: 'library-kiosks', dashed: true },

		{ source: 'labs-distribution', target: 'labs-access' },
		{ source: 'labs-access', target: 'labs-workstations' },
		{ source: 'labs-access', target: 'labs-iot' },
		{ source: 'wlc', target: 'labs-ap', dashed: true },
		{ source: 'labs-ap', target: 'labs-workstations', dashed: true },
		{ source: 'labs-ap', target: 'labs-iot', dashed: true },

		{ source: 'residence-distribution', target: 'residence-access' },
		{ source: 'residence-access', target: 'residence-gaming' },
		{ source: 'residence-access', target: 'residence-laptops' },
		{ source: 'wlc', target: 'residence-ap', dashed: true },
		{ source: 'residence-ap', target: 'residence-gaming', dashed: true },
		{ source: 'residence-ap', target: 'residence-laptops', dashed: true }
	];

	const zones: Zone[] = [
		{
			id: 'core',
			label: 'Core Network & Security',
			left: 8,
			top: 24,
			width: 32,
			height: 56
		},
		{
			id: 'dc',
			label: 'Data Centre / DMZ',
			left: 48,
			top: 6,
			width: 48,
			height: 26
		},
		{
			id: 'admin',
			label: 'Administration Building',
			left: 48,
			top: 30,
			width: 48,
			height: 20
		},
		{
			id: 'library',
			label: 'Library & Learning Commons',
			left: 48,
			top: 48,
			width: 48,
			height: 20
		},
		{
			id: 'labs',
			label: 'Engineering Labs',
			left: 48,
			top: 66,
			width: 48,
			height: 20
		},
		{
			id: 'residence',
			label: 'Student Residence',
			left: 48,
			top: 84,
			width: 48,
			height: 18
		}
	];

	const nodeById = nodes.reduce(
		(acc, node) => {
			acc[node.id] = node;
			return acc;
		},
		{} as Record<string, Node>
	);

	const iconSetState = fromStore(iconSet);
	const pageState = fromStore(page);

	$effect(() => {
		const q = pageState.current.url.searchParams.get('icons') as IconSet | null;
		if ((q === 'affinity' || q === 'crayon') && iconSetState.current !== q) {
			iconSetState.current = q;
		}
	});
</script>

<div class="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white">
	<div class="mx-auto max-w-6xl px-5 py-8">
		<header class="mb-6 flex flex-wrap items-center justify-between gap-4">
			<h1 class="text-2xl font-semibold tracking-tight">University Network Topology</h1>

			<div class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
				<span class="text-xs text-white/70">Icon set</span>
				<label class="flex items-center gap-1 text-sm">
					<input
						type="radio"
						name="iconset"
						value="affinity"
						bind:group={iconSetState.current}
						class="accent-pink-500"
					/>
					Affinity (SVG)
				</label>
				<label class="flex items-center gap-1 text-sm">
					<input
						type="radio"
						name="iconset"
						value="crayon"
						bind:group={iconSetState.current}
						class="accent-pink-500"
					/>
					Crayon (PNG)
				</label>
			</div>
		</header>

		<section class="space-y-6">
			<div class="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/30">
				<div class="relative aspect-[16/10]">
					<svg
						class="absolute inset-0 h-full w-full text-slate-400/70"
						viewBox="0 0 100 100"
						preserveAspectRatio="none"
					>
						{#each links as link}
							{#if nodeById[link.source] && nodeById[link.target]}
								<line
									x1={nodeById[link.source].x}
									y1={nodeById[link.source].y}
									x2={nodeById[link.target].x}
									y2={nodeById[link.target].y}
									class={`link-line${link.dashed ? ' dashed' : ''}`}
									stroke-linecap="round"
								/>
							{/if}
						{/each}
					</svg>

					{#each zones as zone}
						<div
							class="zone"
							style:left={`${zone.left}%`}
							style:top={`${zone.top}%`}
							style:width={`${zone.width}%`}
							style:height={`${zone.height}%`}
						>
							<span class="zone-label">{zone.label}</span>
						</div>
					{/each}

					{#each nodes as node}
						<div
							class="node"
							style:left={`${node.x}%`}
							style:top={`${node.y}%`}
						>
							<NodeCard type={node.type} label={node.label} size={node.size ?? 52} />
						</div>
					{/each}
				</div>

				<div class="mt-4 flex flex-wrap items-center gap-6 text-xs text-slate-300/80">
					<div class="flex items-center gap-2">
						<span class="inline-block h-px w-8 bg-slate-300/70" aria-hidden="true"></span>
						<span>Wired uplink</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="inline-block h-px w-8 border border-dashed border-sky-300/80" aria-hidden="true"></span>
						<span>Wireless association</span>
					</div>
				</div>
			</div>
		</section>

		<footer class="mt-10 text-center text-xs text-white/50">
			Toggle icons above — files are served from <code>/static/icons/…</code>
		</footer>
	</div>
</div>

<style>
	.node {
		position: absolute;
		transform: translate(-50%, -50%);
		z-index: 20;
	}

	.zone {
		position: absolute;
		z-index: 5;
		background: rgba(148, 163, 184, 0.08);
		border: 1px solid rgba(148, 163, 184, 0.22);
		border-radius: 1.5rem;
		padding: 0.65rem 1rem;
	}

	.zone-label {
		display: inline-block;
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: rgba(226, 232, 240, 0.75);
	}

	svg .link-line {
		stroke: rgba(148, 163, 184, 0.65);
		stroke-width: 1.2;
	}

	svg .link-line.dashed {
		stroke: rgba(125, 211, 252, 0.8);
		stroke-width: 1;
		stroke-dasharray: 3.5 3.5;
	}
</style>
