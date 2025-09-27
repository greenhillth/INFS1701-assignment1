<script lang="ts">
        import NodeCard from '$lib/components/NodeCard.svelte';
        import type { FlowLayout } from './types';

        let { layout } = $props<{ layout: FlowLayout }>();

        const nodeLookup = Object.fromEntries(
                layout.nodes.map((node: FlowLayout['nodes'][number]) => [node.id, node] as const)
        ) as Record<string, FlowLayout['nodes'][number]>;

        const viewBox = `0 0 ${layout.dimensions.width} ${layout.dimensions.height}`;

        const getOrthogonalPath = (
                source: FlowLayout['nodes'][number],
                target: FlowLayout['nodes'][number],
                orientation: FlowLayout['links'][number]['orientation']
        ) => {
                const mode = orientation ?? 'vertical-first';

                if (mode === 'horizontal-first') {
                        return `M ${source.x} ${source.y} H ${target.x} V ${target.y}`;
                }

                return `M ${source.x} ${source.y} V ${target.y} H ${target.x}`;
        };
</script>

<div
        class="canvas"
        style:width={`${layout.dimensions.width}px`}
        style:height={`${layout.dimensions.height}px`}
>
        <svg
                class="canvas__links"
                viewBox={viewBox}
                width={layout.dimensions.width}
                height={layout.dimensions.height}
                preserveAspectRatio="none"
        >
                {#each layout.links as link (link.source + link.target)}
                        {#if nodeLookup[link.source] && nodeLookup[link.target]}
                                {#if (link.routing ?? 'straight') === 'orthogonal'}
                                        <path
                                                d={getOrthogonalPath(
                                                        nodeLookup[link.source],
                                                        nodeLookup[link.target],
                                                        link.orientation
                                                )}
                                                class={`canvas__link${link.dashed ? ' canvas__link--dashed' : ''}`}
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                fill="none"
                                        />
                                {:else}
                                        <line
                                                x1={nodeLookup[link.source].x}
                                                y1={nodeLookup[link.source].y}
                                                x2={nodeLookup[link.target].x}
                                                y2={nodeLookup[link.target].y}
                                                class={`canvas__link${link.dashed ? ' canvas__link--dashed' : ''}`}
                                                stroke-linecap="round"
                                        />
                                {/if}
                        {/if}
                {/each}
        </svg>

        {#each layout.zones as zone (zone.id)}
                <div
                        class="canvas__zone"
                        style:left={`${zone.left}px`}
                        style:top={`${zone.top}px`}
                        style:width={`${zone.width}px`}
                        style:height={`${zone.height}px`}
                >
                        <span class="canvas__zone-label">{zone.label}</span>
                </div>
        {/each}

        {#each layout.nodes as node (node.id)}
                <div
                        class="canvas__node"
                        style:left={`${node.x}px`}
                        style:top={`${node.y}px`}
                >
                        <NodeCard
                                type={node.type}
                                label={node.label}
                                description={node.description}
                                size={node.size ?? 40}
                        />
                </div>
        {/each}
</div>

<style>
        .canvas {
                position: relative;
                min-width: max-content;
                min-height: max-content;
        }

        .canvas__links {
                position: absolute;
                inset: 0;
                color: rgb(148 163 184 / 0.7);
        }

        .canvas__link {
                stroke: currentColor;
                stroke-width: 1.4;
        }

        .canvas__link--dashed {
                stroke: rgb(125 211 252 / 0.9);
                stroke-width: 1;
                stroke-dasharray: 3.5 3.5;
        }

        .canvas__zone {
                position: absolute;
                border-radius: 1.5rem;
                border: 1px solid rgb(148 163 184 / 0.22);
                background: linear-gradient(160deg, rgb(148 163 184 / 0.1), rgb(15 23 42 / 0.65));
                backdrop-filter: blur(2px);
                z-index: 5;
                pointer-events: none;
        }

        .canvas__zone-label {
                position: absolute;
                top: 0.75rem;
                left: 0.9rem;
                font-size: 0.65rem;
                text-transform: uppercase;
                letter-spacing: 0.08em;
                font-weight: 600;
                color: rgb(226 232 240 / 0.8);
        }

        .canvas__node {
                position: absolute;
                transform: translate(-50%, -50%);
                z-index: 10;
        }
</style>
