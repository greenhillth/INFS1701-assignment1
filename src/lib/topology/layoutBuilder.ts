import { DEVICE_LIBRARY, type DeviceTemplateKey } from './deviceLibrary';
import type {
        AxisSpacing,
        DevicePlacement,
        FlowLayout,
        LayoutBlueprint,
        LayoutSettings,
        NodeInstance,
        Positioning,
        ResolvedLinkStyle,
        Spacing,
        ZoneDefinition
} from './types';

type Anchor = { x: number; y: number };

type ZoneAnchor = {
        x: number;
        y: number;
        padding: Spacing;
        minWidth: number;
        minHeight: number;
};

type ZoneAnchorMap = Record<string, ZoneAnchor>;

type ZoneOffset = { dx: number; dy: number };

type AnchorMap = Record<string, Anchor>;

const ensureAbsolute = (
        position: Positioning,
        nodes: Record<string, NodeInstance>,
        anchors: AnchorMap
): { x: number; y: number } => {
        if (position.kind === 'absolute') {
                return { x: position.x, y: position.y };
        }

        const referenceNode = nodes[position.reference];
        if (referenceNode) {
                return {
                        x: referenceNode.x + position.offsetX,
                        y: referenceNode.y + position.offsetY
                };
        }

        const anchor = anchors[position.reference];
        if (!anchor) {
                throw new Error(
                        `Unable to resolve relative position: reference "${position.reference}" was not found.`
                );
        }

        return {
                x: anchor.x + position.offsetX,
                y: anchor.y + position.offsetY
        };
};

export const normalisePosition = (
        position: Partial<Positioning> & Record<string, unknown>
): Positioning => {
        if ('reference' in position || 'relativeTo' in position) {
                const reference = (position.reference ?? position.relativeTo) as string;
                const offsetX = (position.offsetX ?? position.x ?? 0) as number;
                const offsetY = (position.offsetY ?? position.y ?? 0) as number;

                return {
                        kind: 'relative',
                        reference,
                        offsetX,
                        offsetY
                };
        }

        return {
                kind: 'absolute',
                x: (position.x ?? 0) as number,
                y: (position.y ?? 0) as number
        };
};

export const placeDevice = (
        template: DeviceTemplateKey,
        options: Omit<DevicePlacement, 'template' | 'position'> & {
                position: Partial<Positioning> & Record<string, unknown>;
        }
): DevicePlacement => ({
        template,
        id: options.id,
        zone: options.zone,
        overrides: options.overrides,
        position: normalisePosition(options.position)
});

const normalisePadding = (padding: ZoneDefinition['padding']): Spacing => {
        if (typeof padding === 'number') {
                return { top: padding, right: padding, bottom: padding, left: padding };
        }

        return {
                top: padding?.top ?? 6,
                right: padding?.right ?? 6,
                bottom: padding?.bottom ?? 6,
                left: padding?.left ?? 6
        };
};

const normaliseSpacing = (
        spacing: number | Partial<Spacing> | undefined,
        fallback: Spacing
): Spacing => {
        if (typeof spacing === 'number') {
                return { top: spacing, right: spacing, bottom: spacing, left: spacing };
        }

        return {
                top: spacing?.top ?? fallback.top,
                right: spacing?.right ?? fallback.right,
                bottom: spacing?.bottom ?? fallback.bottom,
                left: spacing?.left ?? fallback.left
        };
};

const normaliseCanvasPadding = (settings: LayoutSettings | undefined): Spacing =>
        normaliseSpacing(settings?.canvasPadding, { top: 12, right: 14, bottom: 18, left: 14 });

const normaliseZoneSpacing = (spacing: LayoutSettings['zoneSpacing']): AxisSpacing => {
        if (typeof spacing === 'number') {
                return { horizontal: spacing, vertical: spacing };
        }

        return {
                horizontal: spacing?.horizontal ?? 14,
                vertical: spacing?.vertical ?? 18
        };
};

const defaultLinkStyle: ResolvedLinkStyle = {
        stroke: 'rgb(148 163 184 / 0.75)',
        dashedStroke: 'rgb(125 211 252 / 0.85)',
        width: 1.4,
        dashArray: '3.5 3.5',
        opacity: 1,
        linecap: 'round',
        linejoin: 'round',
        glowColor: 'rgb(14 116 144 / 0.55)',
        glowBlur: 0
};

const normaliseLinkStyle = (style: LayoutSettings['linkStyle']): ResolvedLinkStyle => ({
        stroke: style?.stroke ?? defaultLinkStyle.stroke,
        dashedStroke: style?.dashedStroke ?? style?.stroke ?? defaultLinkStyle.dashedStroke,
        width: style?.width ?? defaultLinkStyle.width,
        dashArray: style?.dashArray ?? defaultLinkStyle.dashArray,
        opacity: style?.opacity ?? defaultLinkStyle.opacity,
        linecap: style?.linecap ?? defaultLinkStyle.linecap,
        linejoin: style?.linejoin ?? defaultLinkStyle.linejoin,
        glowColor: style?.glowColor ?? defaultLinkStyle.glowColor,
        glowBlur: style?.glowBlur ?? defaultLinkStyle.glowBlur
});

const clamp = (value: number, min: number, max?: number): number => {
        if (max !== undefined) {
                return Math.min(Math.max(value, min), max);
        }

        return Math.max(value, min);
};

const computeZoneBounds = (
        zones: ZoneDefinition[],
        anchors: ZoneAnchorMap,
        nodes: NodeInstance[]
): FlowLayout['zones'] => {
        return zones.map((zone) => {
                const anchor = anchors[zone.id];
                const zoneNodes = nodes.filter((node) => node.zoneId === zone.id);
                const { padding, minWidth, minHeight } = anchor;

                if (zoneNodes.length === 0) {
                        return {
                                id: zone.id,
                                label: zone.label,
                                left: anchor.x - padding.left,
                                top: anchor.y - padding.top,
                                width: Math.max(minWidth, padding.left + padding.right),
                                height: Math.max(minHeight, padding.top + padding.bottom)
                        };
                }

                const localXs = zoneNodes.map((node) => node.localPosition?.x ?? node.x - anchor.x);
                const localYs = zoneNodes.map((node) => node.localPosition?.y ?? node.y - anchor.y);

                const minX = Math.min(...localXs);
                const maxX = Math.max(...localXs);
                const minY = Math.min(...localYs);
                const maxY = Math.max(...localYs);

                const width = Math.max(minWidth, maxX - minX + padding.left + padding.right);
                const height = Math.max(minHeight, maxY - minY + padding.top + padding.bottom);

                return {
                        id: zone.id,
                        label: zone.label,
                        left: anchor.x + minX - padding.left,
                        top: anchor.y + minY - padding.top,
                        width,
                        height
                };
        });
};

export type StackDirection = 'horizontal' | 'vertical';

export type StackItem = {
        template: DeviceTemplateKey;
        id?: string;
        overrides?: DevicePlacement['overrides'];
};

export type StackOptions = {
        zone?: string;
        start: { x: number; y: number };
        gap?: number;
        alignAxis?: 'x' | 'y';
};

export const stackDevices = (
        direction: StackDirection,
        items: StackItem[],
        options: StackOptions
): DevicePlacement[] => {
        const gap = options.gap ?? 12;
        const alignAxis =
                options.alignAxis ?? (direction === 'horizontal' ? 'y' : direction === 'vertical' ? 'x' : undefined);

        return items.map((item, index) =>
                placeDevice(item.template, {
                        id: item.id,
                        zone: options.zone,
                        overrides:
                                alignAxis
                                        ? {
                                                ...item.overrides,
                                                layoutHints: {
                                                        ...(item.overrides?.layoutHints ?? {}),
                                                        ...(alignAxis === 'x' ? { lockX: true } : {}),
                                                        ...(alignAxis === 'y' ? { lockY: true } : {})
                                                }
                                        }
                                        : item.overrides,
                        position: {
                                x: options.start.x + (direction === 'horizontal' ? index * gap : 0),
                                y: options.start.y + (direction === 'vertical' ? index * gap : 0)
                        }
                })
        );
};

export const instantiateLayout = (blueprint: LayoutBlueprint): FlowLayout => {
        const settings: LayoutSettings | undefined = blueprint.settings;
        const canvasPadding = normaliseCanvasPadding(settings);
        const zoneSpacing = normaliseZoneSpacing(settings?.zoneSpacing);
        const maxWidth = settings?.maxWidth ?? 120;
        const minNodeSize = settings?.minNodeSize ?? 18;
        const maxNodeSize = settings?.maxNodeSize;
        const minNodeScale = settings?.minNodeScale ?? 0.6;
        const linkStyle = normaliseLinkStyle(settings?.linkStyle);

        const resolvedNodes: NodeInstance[] = [];
        const resolvedMap: Record<string, NodeInstance> = {};
        const zoneAnchors: ZoneAnchorMap = Object.fromEntries(
                blueprint.zones.map((zone) => [
                        zone.id,
                        {
                                x: zone.origin.x,
                                y: zone.origin.y,
                                padding: normalisePadding(zone.padding ?? 10),
                                minWidth: zone.minWidth ?? 0,
                                minHeight: zone.minHeight ?? 0
                        }
                ])
        );
        const anchorPositions: AnchorMap = Object.fromEntries(
                Object.entries(zoneAnchors).map(([id, anchor]) => [id, { x: anchor.x, y: anchor.y }])
        );

        for (const placement of blueprint.nodes) {
                const template = DEVICE_LIBRARY[placement.template];

                if (!template) {
                        throw new Error(`Template "${placement.template}" not found in device library.`);
                }

                const nodeId = placement.id ?? template.templateId;
                let absolutePosition: { x: number; y: number };
                let localPosition: { x: number; y: number } | undefined;

                if (placement.zone) {
                        const anchor = zoneAnchors[placement.zone];
                        if (!anchor) {
                                throw new Error(`Zone "${placement.zone}" is not defined.`);
                        }

                        if (placement.position.kind === 'absolute') {
                                localPosition = { x: placement.position.x, y: placement.position.y };
                                absolutePosition = {
                                        x: anchor.x + placement.position.x,
                                        y: anchor.y + placement.position.y
                                };
                        } else {
                                const resolved = ensureAbsolute(placement.position, resolvedMap, anchorPositions);
                                absolutePosition = resolved;
                                localPosition = {
                                        x: resolved.x - anchor.x,
                                        y: resolved.y - anchor.y
                                };
                        }
                } else {
                        absolutePosition = ensureAbsolute(placement.position, resolvedMap, anchorPositions);
                }

                const overrideHints = placement.overrides?.layoutHints;
                const layoutHints =
                        placement.position.kind === 'relative'
                                ? {
                                          ...overrideHints,
                                          lockX: overrideHints?.lockX ?? true,
                                          lockY: overrideHints?.lockY ?? true
                                  }
                                : overrideHints;

                const node: NodeInstance = {
                        id: nodeId,
                        templateId: template.templateId,
                        type: template.type,
                        label: placement.overrides?.label ?? template.label,
                        description: placement.overrides?.description ?? template.description,
                        size: placement.overrides?.size ?? template.size,
                        x: absolutePosition.x,
                        y: absolutePosition.y,
                        zoneId: placement.zone,
                        localPosition,
                        layoutHints
                };

                resolvedNodes.push(node);
                resolvedMap[node.id] = node;
        }

        const nodeSpacing = settings?.nodeSpacing ?? 12;
        const nodesByZone = new Map<string, NodeInstance[]>();

        for (const node of resolvedNodes) {
                const zoneKey = node.zoneId ?? '__global__';
                if (!nodesByZone.has(zoneKey)) {
                        nodesByZone.set(zoneKey, []);
                }
                nodesByZone.get(zoneKey)?.push(node);
        }

        for (const nodes of nodesByZone.values()) {
                const verticalOrder = [...nodes].sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y));
                for (let index = 1; index < verticalOrder.length; index += 1) {
                        const previous = verticalOrder[index - 1];
                        const current = verticalOrder[index];
                        const previousLocked = previous.layoutHints?.lockY === true;
                        const currentLocked = current.layoutHints?.lockY === true;

                        if (currentLocked && previousLocked) {
                                continue;
                        }

                        if (currentLocked) {
                                // Leave locked nodes in place; adjustables will shift on their own iterations.
                                continue;
                        }

                        if (current.y - previous.y < nodeSpacing) {
                                current.y = previous.y + nodeSpacing;
                        }
                }

                const horizontalOrder = [...nodes].sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));
                for (let index = 1; index < horizontalOrder.length; index += 1) {
                        const previous = horizontalOrder[index - 1];
                        const current = horizontalOrder[index];
                        const previousLocked = previous.layoutHints?.lockX === true;
                        const currentLocked = current.layoutHints?.lockX === true;

                        if (currentLocked && previousLocked) {
                                continue;
                        }

                        if (currentLocked) {
                                continue;
                        }

                        if (current.x - previous.x < nodeSpacing) {
                                current.x = previous.x + nodeSpacing;
                        }
                }
        }

        for (const node of resolvedNodes) {
                if (node.zoneId) {
                        const anchor = zoneAnchors[node.zoneId];
                        if (anchor) {
                                node.localPosition = { x: node.x - anchor.x, y: node.y - anchor.y };
                        }
                }
        }

        const computedZones = computeZoneBounds(blueprint.zones, zoneAnchors, resolvedNodes);
        const zoneOffsets = new Map<string, ZoneOffset>(
                computedZones.map((zone) => [zone.id, { dx: 0, dy: 0 }])
        );

        const zonesByTop = [...computedZones].sort((a, b) => (a.top === b.top ? a.left - b.left : a.top - b.top));
        for (let index = 0; index < zonesByTop.length; index += 1) {
                const zone = zonesByTop[index];
                let verticalShift = 0;

                for (let previous = 0; previous < index; previous += 1) {
                        const other = zonesByTop[previous];
                        const overlapsHorizontally =
                                zone.left < other.left + other.width &&
                                zone.left + zone.width > other.left;

                        if (overlapsHorizontally) {
                                const requiredTop = other.top + other.height + zoneSpacing.vertical;
                                verticalShift = Math.max(verticalShift, requiredTop - zone.top);
                        }
                }

                if (verticalShift > 0) {
                        zone.top += verticalShift;
                        const offset = zoneOffsets.get(zone.id);
                        if (offset) {
                                offset.dy += verticalShift;
                        }
                }
        }

        const zonesByLeft = [...computedZones].sort((a, b) => (a.left === b.left ? a.top - b.top : a.left - b.left));
        for (let index = 0; index < zonesByLeft.length; index += 1) {
                const zone = zonesByLeft[index];
                let horizontalShift = 0;

                for (let previous = 0; previous < index; previous += 1) {
                        const other = zonesByLeft[previous];
                        const overlapsVertically =
                                zone.top < other.top + other.height && zone.top + zone.height > other.top;

                        if (overlapsVertically) {
                                const requiredLeft = other.left + other.width + zoneSpacing.horizontal;
                                horizontalShift = Math.max(horizontalShift, requiredLeft - zone.left);
                        }
                }

                if (horizontalShift > 0) {
                        zone.left += horizontalShift;
                        const offset = zoneOffsets.get(zone.id);
                        if (offset) {
                                offset.dx += horizontalShift;
                        }
                }
        }

        if (zoneOffsets.size > 0) {
                for (const node of resolvedNodes) {
                        if (node.zoneId) {
                                const offset = zoneOffsets.get(node.zoneId);
                                if (offset) {
                                        node.x += offset.dx;
                                        node.y += offset.dy;
                                }
                        }
                }
        }

        const zoneRightEdges = computedZones.map((zone) => zone.left + zone.width);
        const zoneBottomEdges = computedZones.map((zone) => zone.top + zone.height);
        const nodeXs = resolvedNodes.map((node) => node.x);
        const nodeYs = resolvedNodes.map((node) => node.y);

        const leftEdges = [...nodeXs, ...computedZones.map((zone) => zone.left)];
        const topEdges = [...nodeYs, ...computedZones.map((zone) => zone.top)];
        const rightEdges = [...nodeXs, ...zoneRightEdges];
        const bottomEdges = [...nodeYs, ...zoneBottomEdges];

        if (leftEdges.length === 0) leftEdges.push(0);
        if (topEdges.length === 0) topEdges.push(0);
        if (rightEdges.length === 0) rightEdges.push(0);
        if (bottomEdges.length === 0) bottomEdges.push(0);

        const minX = Math.min(...leftEdges);
        const minY = Math.min(...topEdges);
        const maxX = Math.max(...rightEdges);
        const maxY = Math.max(...bottomEdges);

        const contentWidth = maxX - minX;
        const contentHeight = maxY - minY;
        const paddedWidth = contentWidth + canvasPadding.left + canvasPadding.right;
        const paddedHeight = contentHeight + canvasPadding.top + canvasPadding.bottom;
        const scale = maxWidth && paddedWidth > maxWidth ? maxWidth / paddedWidth : 1;

        const offsetX = canvasPadding.left - minX;
        const offsetY = canvasPadding.top - minY;

        for (const zone of computedZones) {
                zone.left = (zone.left + offsetX) * scale;
                zone.top = (zone.top + offsetY) * scale;
                zone.width *= scale;
                zone.height *= scale;
        }

        for (const node of resolvedNodes) {
                node.x = (node.x + offsetX) * scale;
                node.y = (node.y + offsetY) * scale;

                const baseSize = node.size ?? 40;
                node.size = clamp(baseSize, minNodeSize, maxNodeSize);
                node.scale = clamp(scale, minNodeScale, 1);
        }

        const scaledPadding: Spacing = {
                top: canvasPadding.top * scale,
                right: canvasPadding.right * scale,
                bottom: canvasPadding.bottom * scale,
                left: canvasPadding.left * scale
        };

        return {
                nodes: resolvedNodes,
                links: blueprint.links,
                zones: computedZones,
                canvas: {
                        width: paddedWidth * scale,
                        height: paddedHeight * scale,
                        scale,
                        padding: scaledPadding
                },
                linkStyle
        };
};
