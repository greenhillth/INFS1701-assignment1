<script lang="ts">
        import { onDestroy } from 'svelte';
        import { fromStore } from 'svelte/store';
        import { page } from '$app/stores';
        import { iconSet, type IconSet } from '$lib/stores/iconSet';
        import FlowCanvas from '$lib/topology/FlowCanvas.svelte';
        import { universityLayout } from '$lib/topology/layouts/university';

        const iconSetState = fromStore(iconSet);
        const pageState = fromStore(page);
        const layout = universityLayout;
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
                        wrapper.appendChild(clone);
                        document.body.appendChild(wrapper);

                        exportTarget = clone;
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
                } = {
                        cacheBust: true,
                        pixelRatio: window.devicePixelRatio ?? 1
                };

                if (targetWidth) {
                        exportOptions.width = targetWidth;
                }

                if (targetHeight) {
                        exportOptions.height = targetHeight;
                }

                exporting = true;

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
                        <h1 class="page__title">University Network Topology</h1>

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
                                                <span class="mode-switch__option mode-switch__option--standard">
                                                        Standard
                                                </span>
                                                <span class="mode-switch__thumb" aria-hidden="true"></span>
                                                <span class="mode-switch__option mode-switch__option--epic">
                                                        epic
                                                </span>
                                        </button>
                                </div>

                                <button
                                        type="button"
                                        class="export-button"
                                        onclick={exportCanvas}
                                        disabled={exporting}
                                >
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
        </div>

        <section class="diagram">
                <div class="diagram__inner">
                        <div class="diagram__frame" bind:this={diagramFrameElement}>
                                <div class="diagram__legend">
                                        <div class="diagram__legend-item">
                                                <span class="diagram__legend-line" aria-hidden="true"></span>
                                                <span>Wired uplink</span>
                                        </div>
                                        <div class="diagram__legend-item">
                                                <span class="diagram__legend-line diagram__legend-line--dashed" aria-hidden="true"></span>
                                                <span>Wireless association</span>
                                        </div>
                                </div>
                                <div class="diagram__canvas">
                                        <FlowCanvas {layout} bind:this={flowCanvasComponent} />
                                </div>

                        </div>
                </div>
        </section>

        <div class="page__inner">
                <footer class="page__footer">
                        Toggle icons above — files are served from <code>/static/icons/…</code>
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
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                justify-content: space-between;
                gap: 1.5rem;
                margin-bottom: 2rem;
        }

        .page__title {
                font-size: 1.85rem;
                font-weight: 600;
                letter-spacing: -0.01em;
        }

        .control-panel {
                display: flex;
                flex-direction: column;
                gap: 0.85rem;
                width: min(16rem, 100%);
                margin-left: auto;
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
                transition: border-color 150ms ease, background 150ms ease, box-shadow 150ms ease;
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
                transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease, background 150ms ease;
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
                transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease, color 150ms ease;
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
                .control-panel {
                        width: 100%;
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
                display: flex;
                gap: 2rem;
                margin-top: 0rem;
                margin-bottom: 1.5rem;
                font-size: 0.75rem;
                color: rgb(226 232 240 / 0.8);
                flex-wrap: wrap;
        }

        .diagram__legend-item {
                display: inline-flex;
                align-items: center;
                gap: 0.6rem;
        }

        .diagram__legend-line {
                display: inline-block;
                width: 3rem;
                height: 0.125rem;
                background: rgb(148 163 184 / 0.7);
        }

        .diagram__legend-line--dashed {
                background: none;
                border-bottom: 1px dashed rgb(125 211 252 / 0.85);
        }

        .page__footer {
                margin-top: 3rem;
                text-align: center;
                font-size: 0.7rem;
                color: rgb(148 163 184 / 0.7);
        }

        code {
                color: rgb(248 250 252 / 0.9);
        }
</style>
