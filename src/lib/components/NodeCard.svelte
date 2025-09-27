<script lang="ts">
        import Icon from './Icon.svelte';

        let {
                label,
                description,
                type,
                size = 40
        } = $props<{
                label: string;
                description: string;
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
        }>();

        const scale = $derived(size / 40);

        const handleHover = () => {
                // Placeholder: attach hover interactions (tooltips, highlights, etc.) here.
        };
</script>

<div
        class="card"
        role="group"
        title={description}
        onmouseenter={handleHover}
        style={`--node-scale: ${scale}`}
>
        <Icon {type} {size} title={label} />
        <div class="card__body">
                <span class="card__label">{label}</span>
        </div>
</div>

<style>
        .card {
                --node-scale: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0.35rem;
                width: max-content;
                padding: 0.6rem 0.75rem 0.65rem;
                border-radius: 1rem;
                border: 1px solid rgb(148 163 184 / 0.25);
                background: radial-gradient(circle at top, rgb(241 245 249 / 0.08), rgb(15 23 42 / 0.65));
                box-shadow: 0 12px 24px rgb(15 23 42 / 0.4);
                backdrop-filter: blur(6px);
                text-align: center;
                min-width: 7rem;
                transform: scale(var(--node-scale));
                transform-origin: center;
        }

        .card__body {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
        }

        .card__label {
                font-size: 0.85rem;
                font-weight: 600;
                color: rgb(248 250 252 / 0.95);
        }
</style>
