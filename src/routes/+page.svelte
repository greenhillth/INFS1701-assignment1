<script lang="ts">
        import { fromStore } from 'svelte/store';
        import { page } from '$app/stores';
        import { iconSet, type IconSet } from '$lib/stores/iconSet';
        import FlowCanvas from '$lib/topology/FlowCanvas.svelte';
        import { universityLayout } from '$lib/topology/layouts/university';

        const iconSetState = fromStore(iconSet);
        const pageState = fromStore(page);
        const layout = universityLayout;

        $effect(() => {
                const q = pageState.current.url.searchParams.get('icons') as IconSet | null;
                if ((q === 'affinity' || q === 'crayon') && iconSetState.current !== q) {
                        iconSetState.current = q;
                }
        });
</script>

<div class="page">
        <div class="page__inner">
                <header class="page__header">
                        <h1 class="page__title">University Network Topology</h1>

                        <div class="icon-toggle">
                                <span class="icon-toggle__label">Icon set</span>
                                <label class="icon-toggle__option">
                                        <input
                                                type="radio"
                                                name="iconset"
                                                value="affinity"
                                                bind:group={iconSetState.current}
                                                class="icon-toggle__input"
                                        />
                                        Affinity (SVG)
                                </label>
                                <label class="icon-toggle__option">
                                        <input
                                                type="radio"
                                                name="iconset"
                                                value="crayon"
                                                bind:group={iconSetState.current}
                                                class="icon-toggle__input"
                                        />
                                        Crayon (PNG)
                                </label>
                        </div>
                </header>
        </div>

        <section class="diagram">
                <div class="diagram__inner">
                        <div class="diagram__frame">
                                <div class="diagram__canvas">
                                        <FlowCanvas {layout} />
                                </div>

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

        .icon-toggle {
                display: inline-flex;
                align-items: center;
                gap: 0.9rem;
                padding: 0.65rem 1.1rem;
                border-radius: 9999px;
                border: 1px solid rgb(148 163 184 / 0.25);
                background: rgb(15 23 42 / 0.5);
        }

        .icon-toggle__label {
                font-size: 0.75rem;
                text-transform: uppercase;
                letter-spacing: 0.08em;
                color: rgb(226 232 240 / 0.75);
        }

        .icon-toggle__option {
                display: inline-flex;
                align-items: center;
                gap: 0.3rem;
                font-size: 0.85rem;
        }

        .icon-toggle__input {
                accent-color: #ec4899;
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
                margin-top: 1.5rem;
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
