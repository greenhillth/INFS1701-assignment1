<script lang="ts">
	import Icon from './Icon.svelte';
	export let label: string;
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
	export let size = 56;
</script>

<div
	class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 shadow-sm backdrop-blur"
>
	<Icon {type} {size} title={label} />
	<div class="text-sm font-medium text-white/90">{label}</div>
</div>
