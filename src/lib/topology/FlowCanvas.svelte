<script lang="ts">
        import NodeCard from '$lib/components/NodeCard.svelte';
        import { onDestroy } from 'svelte';
        import type { CanvasRenderSettings, FlowLayout, TrustLevel } from './types';

        let { layout, canvasSettings } = $props<{
                layout: FlowLayout;
                canvasSettings?: CanvasRenderSettings;
        }>();
        let canvasRef: HTMLDivElement;

        type CSSBox = { top: string; right: string; bottom: string; left: string };

        const zeroPaddingBox: CSSBox = { top: '0px', right: '0px', bottom: '0px', left: '0px' };
        const defaultMarginBox: CSSBox = { top: '0px', right: 'auto', bottom: '0px', left: 'auto' };

        const toCssScalar = (value: number | string | undefined): string | undefined => {
                if (value === undefined) {
                        return undefined;
                }

                return typeof value === 'number' ? `${value}rem` : value;
        };

        const mergeBox = (base: CSSBox, override: CanvasRenderSettings['padding']): CSSBox => {
                if (typeof override === 'number' || typeof override === 'string') {
                        const formatted = toCssScalar(override) ?? base.top;
                        return {
                                top: formatted,
                                right: formatted,
                                bottom: formatted,
                                left: formatted
                        };
                }

                if (override && typeof override === 'object') {
                        const result: CSSBox = { ...base };
                        const candidate = override as Partial<
                                Record<'top' | 'right' | 'bottom' | 'left', number | string>
                        >;

                        if (candidate.top !== undefined) {
                                const formattedTop = toCssScalar(candidate.top);
                                if (formattedTop !== undefined) {
                                        result.top = formattedTop;
                                }
                        }

                        if (candidate.right !== undefined) {
                                const formattedRight = toCssScalar(candidate.right);
                                if (formattedRight !== undefined) {
                                        result.right = formattedRight;
                                }
                        }

                        if (candidate.bottom !== undefined) {
                                const formattedBottom = toCssScalar(candidate.bottom);
                                if (formattedBottom !== undefined) {
                                        result.bottom = formattedBottom;
                                }
                        }

                        if (candidate.left !== undefined) {
                                const formattedLeft = toCssScalar(candidate.left);
                                if (formattedLeft !== undefined) {
                                        result.left = formattedLeft;
                                }
                        }

                        return result;
                }

                return base;
        };

        const resolveBox = (base: CSSBox, override?: CanvasRenderSettings['padding']): CSSBox =>
                override === undefined ? base : mergeBox(base, override);

        type ResolvedWidth = { mode: 'auto' | 'fixed' | 'full-screen'; value?: string };

        const interpretWidth = (value: CanvasRenderSettings['width'] | undefined): ResolvedWidth | null => {
                if (value === undefined) {
                        return null;
                }

                if (value === 'full-screen') {
                        return { mode: 'full-screen' };
                }

                const formatted = toCssScalar(value);
                return formatted ? { mode: 'fixed', value: formatted } : null;
        };

        const resolveWidthPreference = (
                base: CanvasRenderSettings['width'] | undefined,
                override: CanvasRenderSettings['width'] | undefined
        ): ResolvedWidth => interpretWidth(override) ?? interpretWidth(base) ?? { mode: 'auto' };

        const layoutRenderSettings = $derived((layout.canvas.render ?? {}) as CanvasRenderSettings);
        const zones: FlowLayout['zones'] = layout.zones;
        const baseContainerPadding = $derived(resolveBox(zeroPaddingBox, layoutRenderSettings.padding));
        const baseContainerMargin = $derived(resolveBox(defaultMarginBox, layoutRenderSettings.margin));

        const resolvedContainerPadding = $derived(
                resolveBox(baseContainerPadding, canvasSettings?.padding)
        );
        const resolvedContainerMargin = $derived(
                resolveBox(baseContainerMargin, canvasSettings?.margin)
        );
        const widthPreference = $derived(
                resolveWidthPreference(layoutRenderSettings.width, canvasSettings?.width)
        );

        const nodeLookup = Object.fromEntries(
                layout.nodes.map((node: FlowLayout['nodes'][number]) => [node.id, node] as const)
        ) as Record<string, FlowLayout['nodes'][number]>;

        const inboundLinkMap: Record<string, FlowLayout['links'][number][]> = {};
        for (const link of layout.links) {
                if (!inboundLinkMap[link.target]) {
                        inboundLinkMap[link.target] = [];
                }
                inboundLinkMap[link.target].push(link);
        }

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
        const routeStyle = layout.routeStyle;
        const routeGradientStops = routeStyle.gradientStops;
        const routeAnimationDistance = routeStyle.animationDistance;
        const routeAnimationDuration = routeStyle.animationDuration;
        const routeGlowColor = routeStyle.glowColor;
        const routeGlowBlur = routeStyle.glowBlur;
        const routeSolidDashArray = routeStyle.solidDashArray;
        const routeDashedDashArray = routeStyle.dashedDashArray;
        const routeFadeOutDelay = routeStyle.fadeOutDelay;
        const routeFadeOutDuration = routeStyle.fadeOutDuration;
        const linkHighlightWidth = linkWidth * routeStyle.highlightWidthMultiplier;
        const routeGradientId = 'canvas-route-gradient';
        const TRUST_LABELS: Record<TrustLevel, string> = {
                none: 'No Trust',
                low: 'Low Trust',
                high: 'High Trust'
        };
        const svgStyleDeclarations = [
                `opacity:${linkOpacity}`,
                linkGlowColor ? `filter:drop-shadow(0 0 ${linkGlowBlur}px ${linkGlowColor})` : ''
        ]
                .filter(Boolean)
                .join(';');

        const toPercent = (value: number, total: number) => (total === 0 ? 0 : (value / total) * 100);
        const xPercent = (value: number) => toPercent(value, layout.canvas.width);
        const yPercent = (value: number) => toPercent(value, layout.canvas.height);

        const getTooltipTransform = (
                horizontal: 'left' | 'center' | 'right',
                vertical: 'above' | 'below'
        ) => {
                const verticalComponent = vertical === 'above' ? 'calc(-100% - 1.25rem)' : '1.25rem';
                const horizontalComponent =
                        horizontal === 'left' ? '0%' : horizontal === 'right' ? '-100%' : '-50%';
                return `translate(${horizontalComponent}, ${verticalComponent})`;
        };

        const findRouteToInternet = (startId: string) => {
                const visited = new Set<string>();
                const queue: Array<{
                        nodeId: string;
                        linkIds: string[];
                        nodeTrail: string[];
                }> = [
                        {
                                nodeId: startId,
                                linkIds: [],
                                nodeTrail: [startId]
                        }
                ];

                while (queue.length > 0) {
                        const current = queue.shift();
                        if (!current || visited.has(current.nodeId)) {
                                continue;
                        }

                        visited.add(current.nodeId);

                        const node = nodeLookup[current.nodeId];
                        if (node?.type === 'internet') {
                                return current;
                        }

                        const upstreamLinks = inboundLinkMap[current.nodeId] ?? [];
                        for (const link of upstreamLinks) {
                                const nextNodeId = link.source;
                                const linkIdentifier = `${link.source}__${link.target}`;
                                const nextTrail = current.nodeTrail.includes(nextNodeId)
                                        ? current.nodeTrail
                                        : [nextNodeId, ...current.nodeTrail];

                                queue.push({
                                        nodeId: nextNodeId,
                                        linkIds: [linkIdentifier, ...current.linkIds],
                                        nodeTrail: nextTrail
                                });
                        }
                }

                return { nodeId: startId, linkIds: [], nodeTrail: [startId] };
        };

        const tooltipId = 'canvas-node-tooltip';

        let hoveredNodeId = $state<string | null>(null);
        let hoveredNode = $state<FlowLayout['nodes'][number] | null>(null);
        let activeRouteLinkIds = $state<Set<string>>(new Set());
        let activeRouteNodeIds = $state<Set<string>>(new Set());
        let fadingRouteLinkIds = $state<Set<string>>(new Set());
        let tooltipLeft = $state(0);
        let tooltipTop = $state(0);
        let tooltipTransform = $state(getTooltipTransform('center', 'above'));

        const computeSubnetMask = (subnet: string | undefined): string | null => {
                if (!subnet) return null;

                const [, prefixText] = subnet.split('/');
                if (!prefixText) return null;

                const prefix = Number.parseInt(prefixText, 10);
                if (!Number.isFinite(prefix) || prefix < 0 || prefix > 32) {
                        return null;
                }

                if (prefix === 0) {
                        return '0.0.0.0';
                }

                const mask = ((~0 << (32 - prefix)) >>> 0) >>> 0;
                const octets = [24, 16, 8, 0].map((shift) => ((mask >>> shift) & 255).toString());
                return octets.join('.');
        };

        let hoveredSubnetMask = $state<string | null>(null);

        let fadeTimeout: ReturnType<typeof setTimeout> | null = null;

        const clearFadeTimer = () => {
                if (fadeTimeout) {
                        clearTimeout(fadeTimeout);
                        fadeTimeout = null;
                }
        };

        const beginRouteFadeOut = () => {
                clearFadeTimer();

                if (activeRouteLinkIds.size === 0) {
                        fadingRouteLinkIds = new Set();
                        return;
                }

                const linksToFade = new Set(activeRouteLinkIds);
                fadingRouteLinkIds = linksToFade;

                fadeTimeout = setTimeout(() => {
                        fadingRouteLinkIds = new Set();
                        fadeTimeout = null;
                }, (routeFadeOutDelay + routeFadeOutDuration) * 1000);
        };

        const handleNodeEnter = (node: FlowLayout['nodes'][number]) => {
                clearFadeTimer();
                fadingRouteLinkIds = new Set();

                hoveredNodeId = node.id;
                hoveredNode = node;
                hoveredSubnetMask = computeSubnetMask(node.network?.subnet);

                const leftPercent = xPercent(node.x);
                tooltipLeft = leftPercent;
                const tooltipAlignment = leftPercent < 20 ? 'left' : leftPercent > 80 ? 'right' : 'center';

                const topPercent = yPercent(node.y);
                tooltipTop = topPercent;
                const tooltipPlacement = topPercent < 22 ? 'below' : 'above';
                tooltipTransform = getTooltipTransform(tooltipAlignment, tooltipPlacement);

                const route = findRouteToInternet(node.id);
                activeRouteLinkIds = new Set(route.linkIds);
                activeRouteNodeIds = new Set(route.nodeTrail);
        };

        const clearHover = () => {
                beginRouteFadeOut();

                hoveredNodeId = null;
                hoveredNode = null;
                hoveredSubnetMask = null;
                activeRouteLinkIds = new Set();
                activeRouteNodeIds = new Set();
                tooltipTransform = getTooltipTransform('center', 'above');
        };

        const handleNodeKey = (event: KeyboardEvent, node: FlowLayout['nodes'][number]) => {
                if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleNodeEnter(node);
                }

                if (event.key === 'Escape') {
                        clearHover();
                }
        };

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

        onDestroy(() => {
                clearFadeTimer();
        });
</script>

<div
        class="canvas-container"
        class:canvas-container--fullscreen={widthPreference.mode === 'full-screen'}
        style:padding-top={resolvedContainerPadding.top}
        style:padding-right={resolvedContainerPadding.right}
        style:padding-bottom={resolvedContainerPadding.bottom}
        style:padding-left={resolvedContainerPadding.left}
        style:margin-top={resolvedContainerMargin.top}
        style:margin-right={resolvedContainerMargin.right}
        style:margin-bottom={resolvedContainerMargin.bottom}
        style:margin-left={resolvedContainerMargin.left}
        style:max-width={widthPreference.mode === 'fixed'
                ? widthPreference.value
                : widthPreference.mode === 'full-screen'
                  ? 'none'
                  : undefined}
        style:width={widthPreference.mode === 'full-screen' ? '100%' : undefined}
>
        <div
                class="canvas"
                style:aspect-ratio={`${layout.canvas.width} / ${layout.canvas.height}`}
                style:--canvas-scale={`${layout.canvas.scale}`}
                style:--route-fade-delay={`${routeFadeOutDelay}s`}
                style:--route-fade-duration={`${routeFadeOutDuration}s`}
                bind:this={canvasRef}
        >
                <svg
                        class="canvas__links"
                        viewBox={`0 0 ${layout.canvas.width} ${layout.canvas.height}`}
                        preserveAspectRatio="none"
                        style={svgStyleDeclarations}
        >
                <defs>
                        <linearGradient id={routeGradientId} gradientUnits="userSpaceOnUse">
                                {#each routeGradientStops as stop, index (`${stop.offset}-${index}`)}
                                        <stop offset={`${stop.offset * 100}%`} stop-color={stop.color} />
                                {/each}
                                <animateTransform
                                        attributeName="gradientTransform"
                                        type="translate"
                                        from={`-${routeAnimationDistance} 0`}
                                        to={`${routeAnimationDistance} 0`}
                                        dur={`${routeAnimationDuration}s`}
                                        repeatCount="indefinite"
                                />
                        </linearGradient>
                </defs>
                {#each layout.links as link (link.source + link.target)}
                        {@const linkId = `${link.source}__${link.target}`}
                        {@const isActive = activeRouteLinkIds.has(linkId)}
                        {@const isFading = fadingRouteLinkIds.has(linkId)}
                        {@const isHighlighted = isActive || isFading}
                        {@const strokeColor = isHighlighted
                                ? `url(#${routeGradientId})`
                                : link.dashed
                                        ? linkDashedStroke
                                        : linkStroke}
                        {@const dashArray = isHighlighted
                                ? link.dashed
                                        ? routeDashedDashArray
                                        : routeSolidDashArray
                                : link.dashed
                                  ? linkDashArray
                                  : undefined}
                        {@const strokeWidth = isHighlighted ? linkHighlightWidth : linkWidth}
                        {#if nodeLookup[link.source] && nodeLookup[link.target]}
                                {#if (link.routing ?? 'straight') === 'orthogonal'}
                                        <path
                                                d={getOrthogonalPath(
                                                        nodeLookup[link.source],
                                                        nodeLookup[link.target],
                                                        link.orientation
                                                )}
                                                class={`canvas__link${link.dashed ? ' canvas__link--dashed' : ''}`}
                                                class:canvas__link--route={isHighlighted}
                                                class:canvas__link--fading={isFading}
                                                fill="none"
                                                stroke={strokeColor}
                                                stroke-width={strokeWidth}
                                                stroke-linecap={linkLinecap}
                                                stroke-linejoin={linkLinejoin}
                                                stroke-dasharray={dashArray}
                                                stroke-dashoffset={isHighlighted ? 0 : undefined}
                                                style:animation-duration={isHighlighted
                                                        ? `${routeAnimationDuration}s`
                                                        : undefined}
                                                style:animation-play-state={isFading ? 'paused' : undefined}
                                                style:filter={isHighlighted
                                                        ? `drop-shadow(0 0 ${routeGlowBlur}px ${routeGlowColor})`
                                                        : undefined}
                                        />
                                {:else}
                                        <line
                                                x1={nodeLookup[link.source].x}
                                                y1={nodeLookup[link.source].y}
                                                x2={nodeLookup[link.target].x}
                                                y2={nodeLookup[link.target].y}
                                                class={`canvas__link${link.dashed ? ' canvas__link--dashed' : ''}`}
                                                class:canvas__link--route={isHighlighted}
                                                class:canvas__link--fading={isFading}
                                                stroke={strokeColor}
                                                stroke-width={strokeWidth}
                                                stroke-linecap={linkLinecap}
                                                stroke-linejoin={linkLinejoin}
                                                stroke-dasharray={dashArray}
                                                stroke-dashoffset={isHighlighted ? 0 : undefined}
                                                style:animation-duration={isHighlighted
                                                        ? `${routeAnimationDuration}s`
                                                        : undefined}
                                                style:animation-play-state={isFading ? 'paused' : undefined}
                                                style:filter={isHighlighted
                                                        ? `drop-shadow(0 0 ${routeGlowBlur}px ${routeGlowColor})`
                                                        : undefined}
                                        />
                                {/if}
                        {/if}
                {/each}
        </svg>

        {#each zones as zone (zone.id)}
                <div
                        class="canvas__zone"
                        class:canvas__zone--multiple={zone.multipleInstances}
                        class:canvas__zone--nested={Boolean(zone.parentId)}
                        style:left={`${xPercent(zone.left)}%`}
                        style:top={`${yPercent(zone.top)}%`}
                        style:width={`${xPercent(zone.width)}%`}
                        style:height={`${yPercent(zone.height)}%`}
                        style:z-index={5 + (zone.depth ?? 0)}
                >
                        <div class="canvas__zone-header">
                                <span class="canvas__zone-label">{zone.label}</span>
                                {#if zone.trustLevel}
                                        <span
                                                class={`canvas__zone-trust canvas__zone-trust--${zone.trustLevel!}`}
                                        >
                                                {TRUST_LABELS[zone.trustLevel!]}
                                        </span>
                                {/if}
                        </div>
                </div>
        {/each}

        {#each layout.nodes as node (node.id)}
                <div
                        class="canvas__node"
                        class:canvas__node--multiple={node.multipleInstances}
                        class:canvas__node--active={activeRouteNodeIds.has(node.id)}
                        style:left={`${xPercent(node.x)}%`}
                        style:top={`${yPercent(node.y)}%`}
                        style:transform={`translate(-50%, -50%) scale(${node.scale ?? 1})`}
                        tabindex="0"
                        role="button"
                        aria-describedby={hoveredNodeId === node.id ? tooltipId : undefined}
                        onmouseenter={() => handleNodeEnter(node)}
                        onmouseleave={clearHover}
                        onfocus={() => handleNodeEnter(node)}
                        onblur={clearHover}
                        onkeydown={(event) => handleNodeKey(event, node)}
                >
                        <NodeCard
                                type={node.type}
                                label={node.label}
                                description={node.description}
                                size={node.size ?? 40}
                        />
                </div>
        {/each}

        {#if hoveredNode}
                <div
                        class="canvas__tooltip"
                        style:left={`${tooltipLeft}%`}
                        style:top={`${tooltipTop}%`}
                        style:transform={tooltipTransform}
                        id={tooltipId}
                >
                        <div class="canvas__tooltip-card" role="presentation">
                                <span class="canvas__tooltip-title">{hoveredNode.label}</span>
                                <p class="canvas__tooltip-description">{hoveredNode.description}</p>

                                <dl class="canvas__tooltip-meta">
                                        <div>
                                                <dt>IP Address</dt>
                                                <dd>
                                                        <span>{hoveredNode.network?.ipAddress ?? '—'}</span>
                                                        {#if hoveredNode.network?.subnet}
                                                                <span class="canvas__tooltip-meta-secondary">
                                                                        Subnet: {hoveredNode.network.subnet}
                                                                </span>
                                                                {#if hoveredSubnetMask}
                                                                        <span class="canvas__tooltip-meta-secondary">
                                                                                Mask: {hoveredSubnetMask}
                                                                        </span>
                                                                {/if}
                                                        {/if}
                                                </dd>
                                        </div>
                                        <div>
                                                <dt>MAC</dt>
                                                <dd>
                                                        <span>{hoveredNode.network?.macAddress ?? '—'}</span>
                                                </dd>
                                        </div>
                                </dl>

                                {#if hoveredNode.network?.notes}
                                        <p class="canvas__tooltip-notes">{hoveredNode.network.notes}</p>
                                {/if}
                        </div>
                </div>
        {/if}
        </div>
</div>

<style>
        .canvas-container {
                width: 100%;
                margin: 0 auto;
                box-sizing: border-box;
        }

        .canvas-container--fullscreen {
                max-width: none;
        }

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
                transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .canvas__zone--nested {
                border-color: rgb(148 163 184 / 0.32);
                background: linear-gradient(160deg, rgb(148 163 184 / 0.06), rgb(15 23 42 / 0.45));
                box-shadow: inset 0 0 36px rgb(15 23 42 / 0.28);
        }

        .canvas__zone--multiple {
                border-color: rgb(250 204 21 / 0.55);
                box-shadow:
                        0 0 0 2px rgb(250 204 21 / 0.25),
                        0 0 24px rgb(250 204 21 / 0.35),
                        inset 0 0 60px rgb(250 204 21 / 0.08);
        }

        .canvas__zone-header {
                position: absolute;
                top: 0.75rem;
                left: 0.9rem;
                right: 0.9rem;
                display: flex;
                align-items: center;
                gap: 0.65rem;
                pointer-events: none;
        }

        .canvas__zone-label {
                flex: 1 1 auto;
                font-size: 0.65rem;
                text-transform: uppercase;
                letter-spacing: 0.08em;
                font-weight: 600;
                color: rgb(226 232 240 / 0.8);
                transition: color 0.3s ease, text-shadow 0.3s ease;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
        }

        .canvas__zone-trust {
                flex: 0 0 auto;
                padding: 0.2rem 0.55rem;
                border-radius: 9999px;
                border: 1px solid rgb(148 163 184 / 0.4);
                font-size: 0.55rem;
                font-weight: 700;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                color: rgb(226 232 240 / 0.85);
                background: linear-gradient(135deg, rgb(148 163 184 / 0.2), rgb(15 23 42 / 0.6));
                box-shadow: 0 6px 18px rgb(15 23 42 / 0.38);
                white-space: nowrap;
        }

        .canvas__zone-trust--none {
                border-color: rgb(248 113 113 / 0.55);
                background: linear-gradient(135deg, rgb(248 113 113 / 0.2), rgb(190 24 93 / 0.16));
                color: rgb(254 202 202 / 0.95);
        }

        .canvas__zone-trust--low {
                border-color: rgb(252 211 77 / 0.55);
                background: linear-gradient(135deg, rgb(251 191 36 / 0.22), rgb(217 119 6 / 0.18));
                color: rgb(254 249 195 / 0.96);
        }

        .canvas__zone-trust--high {
                border-color: rgb(74 222 128 / 0.6);
                background: linear-gradient(135deg, rgb(52 211 153 / 0.24), rgb(22 163 74 / 0.18));
                color: rgb(187 247 208 / 0.96);
        }

        .canvas__zone--nested .canvas__zone-label {
                color: rgb(226 232 240 / 0.9);
        }

        .canvas__zone--multiple .canvas__zone-label {
                color: rgb(253 224 71 / 0.9);
                text-shadow: 0 0 12px rgb(253 224 71 / 0.35);
        }

        .canvas__node {
                position: absolute;
                z-index: 10;
                transform-origin: center;
                will-change: transform;
                cursor: pointer;
        }

        .canvas__node :global(.card) {
                transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .canvas__node:focus {
                outline: none;
        }

        .canvas__node--multiple :global(.card) {
                border-color: rgb(253 224 71 / 0.65);
                box-shadow:
                        0 0 0 2px rgb(253 224 71 / 0.45),
                        0 0 20px rgb(253 224 71 / 0.4),
                        0 18px 28px rgb(15 23 42 / 0.5);
        }

        .canvas__node--active :global(.card) {
                box-shadow: 0 0 0 1.5px rgb(74 222 128 / 0.65), 0 18px 28px rgb(21 128 61 / 0.45);
        }

        .canvas__node:focus-visible :global(.card) {
                outline: 2px solid rgb(74 222 128 / 0.75);
                outline-offset: 4px;
        }

        .canvas__link--route {
                animation: canvas-route-flow 2.4s linear infinite;
                opacity: 1;
                transition: opacity var(--route-fade-duration, 0.5s) linear;
                transition-delay: 0s;
        }

        .canvas__link--route.canvas__link--fading {
                opacity: 0;
                transition-delay: var(--route-fade-delay, 0.25s);
        }

        @keyframes canvas-route-flow {
                from {
                        stroke-dashoffset: 0;
                }
                to {
                        stroke-dashoffset: -180;
                }
        }

        .canvas__tooltip {
                position: absolute;
                min-width: 16rem;
                max-width: min(26rem, 90vw);
                width: max-content;
                pointer-events: none;
                z-index: 40;
        }

        .canvas__tooltip-card {
                background: radial-gradient(circle at top, rgb(15 118 110 / 0.12), rgb(15 23 42 / 0.88));
                border: 1px solid rgb(45 212 191 / 0.35);
                border-radius: 1rem;
                padding: 1rem 1.1rem 1.1rem;
                color: rgb(226 232 240);
                backdrop-filter: blur(6px);
                box-shadow: 0 24px 48px rgb(15 23 42 / 0.55);
        }

        .canvas__tooltip-title {
                font-size: 1rem;
                font-weight: 600;
                letter-spacing: 0.01em;
                color: rgb(240 253 244);
        }

        .canvas__tooltip-description {
                margin: 0.45rem 0 0.75rem;
                font-size: 0.8rem;
                color: rgb(226 232 240 / 0.78);
                line-height: 1.4;
        }

        .canvas__tooltip-meta {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
                gap: 0.6rem 1rem;
                margin: 0 0 0.85rem;
        }

        .canvas__tooltip-meta div {
                display: flex;
                flex-direction: column;
                gap: 0.2rem;
        }

        .canvas__tooltip-meta dt {
                font-size: 0.65rem;
                text-transform: uppercase;
                letter-spacing: 0.08em;
                color: rgb(190 242 100 / 0.75);
        }

        .canvas__tooltip-meta dd {
                margin: 0;
                font-size: 0.82rem;
                font-weight: 500;
                color: rgb(226 232 240 / 0.92);
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
                overflow-wrap: anywhere;
        }

        .canvas__tooltip-meta-secondary {
                font-size: 0.72rem;
                font-weight: 400;
                color: rgb(148 163 184 / 0.85);
        }

        .canvas__tooltip-notes {
                margin: 0;
                font-size: 0.75rem;
                color: rgb(163 230 53 / 0.8);
        }
</style>
