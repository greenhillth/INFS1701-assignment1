<script lang="ts">
	import { fromStore } from 'svelte/store';
	import { iconSet, type IconSet } from '$lib/stores/iconSet';

	let { type, size = 56, title } = $props<{
		type:
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
		size?: number;
		title?: string;
	}>();

	// Map logical type -> file path per set (using your static/ tree)
	const map: Record<IconSet, Record<string, string>> = {
		affinity: {
			internet: '/icons/affinity/sq_globe_blue.svg',
			router: '/icons/affinity/sq_router_blue.svg',
			switch: '/icons/affinity/sq_switch_blue.svg',
			mls: '/icons/affinity/sq_switch_multilayer_blue.svg',
			server: '/icons/affinity/sq_server_blue.svg',
			client: '/icons/affinity/sq_laptop_blue.svg',
			firewall: '/icons/affinity/sq_firewall_blue.svg',
			vpn: '/icons/affinity/sq_vrf_blue.svg',
			wlc: '/icons/affinity/sq_wlc_blue.svg',
			ap: '/icons/affinity/sq_wifi_blue.svg',
			storage: '/icons/affinity/sq_storage_blue.svg',
			db: '/icons/affinity/sq_servercluster_blue.svg'
		},
		crayon: {
			internet: '/icons/crayon/Internet.png',
			router: '/icons/crayon/Router.png',
			switch: '/icons/crayon/Switch 1.png',
			mls: '/icons/crayon/Switch 2.png',
			server: '/icons/crayon/Server.png',
			client: '/icons/crayon/User.png',
			firewall: '/icons/crayon/Firewall.png',
			vpn: '/icons/crayon/VPN.png',
			wlc: '/icons/crayon/Wireless Access Point.png',
			ap: '/icons/crayon/Wireless Access Point.png',
			storage: '/icons/crayon/Storage.png',
			db: '/icons/crayon/SQL Server.png'
		}
	};

	const iconSetState = fromStore(iconSet);
	const src = $derived(map[iconSetState.current]?.[type]);
</script>

{#if src}
	<img {src} alt={title ?? type} width={size} height={size} class="select-none" draggable="false" />
{:else}
	<div
		class="flex items-center justify-center rounded bg-white/10 text-xs text-red-200/80"
		style:width={`${size}px`}
		style:height={`${size}px`}
	>
		Missing icon: {type}
	</div>
{/if}
