<script lang="ts">
	import { iconSet, type IconSet } from '$lib/stores/iconSet';
	import NodeCard from '$lib/components/NodeCard.svelte';
	import { page } from '$app/stores';

	// Simple “zones” for a uni network
	const dmz = [
		{ type: 'switch', label: 'DMZ Switch' },
		{ type: 'server', label: 'Web Frontend' },
		{ type: 'server', label: 'Reverse Proxy' },
		{ type: 'server', label: 'Mail Gateway' },
		{ type: 'vpn', label: 'VPN Gateway' }
	] as const;

	const medium = [
		{ type: 'mls', label: 'Distribution L3' },
		{ type: 'switch', label: 'Student VLAN' },
		{ type: 'switch', label: 'Staff VLAN' },
		{ type: 'wlc', label: 'WLC' },
		{ type: 'ap', label: 'AP-01' },
		{ type: 'ap', label: 'AP-02' },
		{ type: 'client', label: 'Student Device' },
		{ type: 'client', label: 'Staff Device' }
	] as const;

	const high = [
		{ type: 'router', label: 'Core Router' },
		{ type: 'mls', label: 'Core Switch' },
		{ type: 'server', label: 'App Servers' },
		{ type: 'db', label: 'PostgreSQL Cluster' },
		{ type: 'storage', label: 'NAS / Backups' }
	] as const;

	// optional: pick up /?icons=affinity|crayon
	$: {
		const q = new URL($page.url).searchParams.get('icons') as IconSet | null;
		if (q === 'affinity' || q === 'crayon') iconSet.set(q);
	}
</script>

<!-- Page wrapper -->
<div class="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white">
	<div class="mx-auto max-w-6xl px-5 py-8">
		<header class="mb-6 flex flex-wrap items-center justify-between gap-4">
			<h1 class="text-2xl font-semibold tracking-tight">University Network Topology</h1>

			<!-- Icon set toggle -->
			<div class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
				<span class="text-xs text-white/70">Icon set</span>
				<label class="flex items-center gap-1 text-sm">
					<input
						type="radio"
						name="iconset"
						value="affinity"
						on:change={() => iconSet.set('affinity')}
						checked
						class="accent-pink-500"
					/>
					Affinity (SVG)
				</label>
				<label class="flex items-center gap-1 text-sm">
					<input
						type="radio"
						name="iconset"
						value="crayon"
						on:change={() => iconSet.set('crayon')}
						class="accent-pink-500"
					/>
					Crayon (PNG)
				</label>
			</div>
		</header>

		<!-- Zones -->
		<section class="space-y-8">
			<!-- Low trust row -->
			<div class="rounded-2xl border border-white/10 bg-white/5 p-4">
				<div class="mb-3 flex items-center gap-3">
					<div class="h-3 w-3 rounded-full bg-red-500/90"></div>
					<h2 class="text-lg font-medium">Low Trust — Internet Edge</h2>
				</div>

				<div class="grid grid-cols-[repeat(3,minmax(0,1fr))] items-center gap-4 sm:grid-cols-4">
					<NodeCard type="internet" label="Internet" />
					<NodeCard type="firewall" label="WAF" />
					<NodeCard type="firewall" label="Perimeter FW" />
					<div class="text-xs text-white/60 sm:col-span-2">Mirror/SPAN → IDS</div>
					<NodeCard type="firewall" label="IDS (SPAN/TAP)" />
				</div>
			</div>

			<!-- DMZ -->
			<div class="rounded-2xl border border-white/10 bg-white/5 p-4">
				<div class="mb-3 flex items-center gap-3">
					<div class="h-3 w-3 rounded-full bg-blue-500/90"></div>
					<h2 class="text-lg font-medium">DMZ — Public Services</h2>
				</div>

				<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
					{#each dmz as n}
						<NodeCard type={n.type} label={n.label} />
					{/each}
				</div>
			</div>

			<!-- Medium -->
			<div class="rounded-2xl border border-white/10 bg-white/5 p-4">
				<div class="mb-3 flex items-center gap-3">
					<div class="h-3 w-3 rounded-full bg-amber-500/90"></div>
					<h2 class="text-lg font-medium">Medium Trust — Campus VLANs</h2>
				</div>

				<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
					{#each medium as n}
						<NodeCard type={n.type} label={n.label} />
					{/each}
				</div>
			</div>

			<!-- High -->
			<div class="rounded-2xl border border-white/10 bg-white/5 p-4">
				<div class="mb-3 flex items-center gap-3">
					<div class="h-3 w-3 rounded-full bg-emerald-500/90"></div>
					<h2 class="text-lg font-medium">High Trust — Core / DC</h2>
				</div>

				<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
					{#each high as n}
						<NodeCard type={n.type} label={n.label} />
					{/each}
				</div>
			</div>
		</section>

		<footer class="mt-10 text-center text-xs text-white/50">
			Toggle icons above — files are served from <code>/static/icons/…</code>
		</footer>
	</div>
</div>
