<script lang="ts">
	import { get } from 'svelte/store';
	import { iconSet, type IconSet } from '$lib/stores/iconSet';

	export let type:
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

	export let size = 56; // px
	export let title: string | undefined;

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

	$: set = get(iconSet);
	$: src = map[set][type];
</script>

<img {src} alt={title ?? type} width={size} height={size} class="select-none" draggable="false" />
