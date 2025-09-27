<script lang="ts">
        import NodeCard from '$lib/components/NodeCard.svelte';
        import type { FlowLayout } from './types';

        let { layout } = $props<{ layout: FlowLayout }>();
        let canvasRef: HTMLDivElement;

        const nodeLookup = Object.fromEntries(
                layout.nodes.map((node: FlowLayout['nodes'][number]) => [node.id, node] as const)
        ) as Record<string, FlowLayout['nodes'][number]>;

        const linkStyle = layout.linkStyle ?? {};
        const linkStroke = linkStyle.stroke ?? 'rgb(148 163 184 / 0.75)';
        const linkDashedStroke = linkStyle.dashedStroke ?? linkStroke;
        const linkWidth = linkStyle.width ?? 1.4;
        const linkDashArray = linkStyle.dashArray ?? '3.5 3.5';
        const linkOpacity = linkStyle.opacity ?? 1;
        const linkLinecap = linkStyle.linecap ?? 'round';
        const linkLinejoin = linkStyle.linejoin ?? 'round';
        const linkGlowColor = linkStyle.glowColor;
        const linkGlowBlur = linkStyle.glowBlur ?? 0;

        const toPercent = (value: number, total: number) => (total === 0 ? 0 : (value / total) * 100);
        const xPercent = (value: number) => toPercent(value, layout.canvas.width);
        const yPercent = (value: number) => toPercent(value, layout.canvas.height);

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

        export function getCanvasElement() {
                return canvasRef;
        }
</script>

<div
        class="canvas"
        style:aspect-ratio={`${layout.canvas.width} / ${layout.canvas.height}`}
        style:--canvas-scale={`${layout.canvas.scale}`}
        bind:this={canvasRef}
>
        <svg
                class="canvas__links"
                viewBox={`0 0 ${layout.canvas.width} ${layout.canvas.height}`}
                preserveAspectRatio="none"
                style={`opacity:${linkOpacity};${linkGlowColor ? ` filter:drop-shadow(0 0 ${linkGlowBlur}px ${linkGlowColor});` : ''}`}
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
                                                fill="none"
                                                stroke={link.dashed ? linkDashedStroke : linkStroke}
                                                stroke-width={linkWidth}
                                                stroke-linecap={linkLinecap}
                                                stroke-linejoin={linkLinejoin}
                                                stroke-dasharray={link.dashed ? linkDashArray : undefined}
                                        />
                                {:else}
                                        <line
                                                x1={nodeLookup[link.source].x}
                                                y1={nodeLookup[link.source].y}
                                                x2={nodeLookup[link.target].x}
                                                y2={nodeLookup[link.target].y}
                                                class={`canvas__link${link.dashed ? ' canvas__link--dashed' : ''}`}
                                                stroke={link.dashed ? linkDashedStroke : linkStroke}
                                                stroke-width={linkWidth}
                                                stroke-linecap={linkLinecap}
                                                stroke-linejoin={linkLinejoin}
                                                stroke-dasharray={link.dashed ? linkDashArray : undefined}
                                        />
                                {/if}
                        {/if}
                {/each}
        </svg>

        {#each layout.zones as zone (zone.id)}
                <div
                        class="canvas__zone"
                        style:left={`${xPercent(zone.left)}%`}
                        style:top={`${yPercent(zone.top)}%`}
                        style:width={`${xPercent(zone.width)}%`}
                        style:height={`${yPercent(zone.height)}%`}
                >
                        <span class="canvas__zone-label">{zone.label}</span>
                </div>
        {/each}

        {#each layout.nodes as node (node.id)}
                <div
                        class="canvas__node"
                        style:left={`${xPercent(node.x)}%`}
                        style:top={`${yPercent(node.y)}%`}
                        style:transform={`translate(-50%, -50%) scale(${node.scale ?? 1})`}
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
                width: 100%;
                height: auto;
                display: block;
                font-size: 1rem;
        }

        .canvas__links {
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
                z-index: 8;
                pointer-events: none;
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
                z-index: 10;
                transform-origin: center;
                will-change: transform;
        }
</style>
