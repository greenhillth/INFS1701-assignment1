<script lang="ts">
	import { fromStore } from 'svelte/store';
	import { iconSet, type IconSet } from '$lib/stores/iconSet';

	let {
		type,
		size = 56,
		title
	} = $props<{
		type:
			| 'internet'
			| 'router'
			| 'switch'
			| 'mls'
			| 'server'
			| 'webserver'
			| 'mailserver'
			| 'client'
			| 'workstation'
			| 'firewall'
			| 'vpn'
			| 'wlc'
			| 'ap'
			| 'storage'
			| 'db'
			| 'printer'
			| 'telephone'
			| 'cctv'
			| 'poe';
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
			webserver: '/icons/affinity/sq_nas_blue.svg',
			mailserver: '/icons/affinity/sq_nas_blue.svg',
			client: '/icons/affinity/sq_laptop_blue.svg',
			workstation: '/icons/affinity/sq_client_blue.svg',
			firewall: '/icons/affinity/sq_firewall_blue.svg',
			vpn: '/icons/affinity/sq_vrf_blue.svg',
			wlc: '/icons/affinity/sq_wlc_blue.svg',
			ap: '/icons/affinity/sq_wifi_blue.svg',
			storage: '/icons/affinity/sq_storage_blue.svg',
			db: '/icons/affinity/sq_servercluster_blue.svg',
			printer: '/icons/affinity/sq_printer_blue.svg',
			telephone: '/icons/affinity/sq_ip_phone_blue.svg',
			cctv: '/icons/affinity/sq_camera_dome_blue.svg',
			poe: '/icons/affinity/sq_rj45_blue.svg'
		},
		crayon: {
			internet: '/icons/crayon/internet.png',
			router: '/icons/crayon/router.png',
			switch: '/icons/crayon/switch_2.png',
			mls: '/icons/crayon/switch.png',
			server: '/icons/crayon/server.png',
			webserver: '/icons/crayon/server_web.png',
			mailserver: '/icons/crayon/server_mail.png',
			client: '/icons/crayon/user.png',
			workstation: '/icons/crayon/workstation.png',
			firewall: '/icons/crayon/firewall.png',
			vpn: '/icons/crayon/vpn_router.png',
			wlc: '/icons/crayon/wap.png',
			ap: '/icons/crayon/wap.png',
			storage: '/icons/crayon/storage.png',
			db: '/icons/crayon/server_database.png',
			printer: '/icons/crayon/printer2.png',
			telephone: '/icons/crayon/telephone.png',
			cctv: '/icons/crayon/cctv.png',
			poe: '/icons/crayon/poe_switch.png'
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
