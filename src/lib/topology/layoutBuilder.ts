import { DEVICE_LIBRARY, type DeviceTemplateKey } from './deviceLibrary';
import type {
        AxisSpacing,
        ComputedZone,
        DevicePlacement,
        FlowLayout,
        LayoutBlueprint,
        LayoutSettings,
        NodeInstance,
        Positioning,
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

type AnchorMap = Record<string, Anchor>;

type ZoneShift = { dx: number; dy: number };

type ZoneShiftMap = Record<string, ZoneShift>;

const normaliseSpacingValue = (
        spacing: number | Partial<Spacing> | undefined,
        fallback: number
): Spacing => {
        if (typeof spacing === 'number') {
                return { top: spacing, right: spacing, bottom: spacing, left: spacing };
        }

        return {
                top: spacing?.top ?? fallback,
                right: spacing?.right ?? fallback,
                bottom: spacing?.bottom ?? fallback,
                left: spacing?.left ?? fallback
        };
};

const normaliseAxisSpacing = (
        spacing: Partial<AxisSpacing> | number | undefined,
        fallback: AxisSpacing
): AxisSpacing => {
        if (typeof spacing === 'number') {
                return { x: spacing, y: spacing };
        }

        return {
                x: spacing?.x ?? fallback.x,
                y: spacing?.y ?? fallback.y
        };
};

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

const normalisePadding = (padding: ZoneDefinition['padding']): Spacing =>
        normaliseSpacingValue(padding, 6);

const normaliseCanvasPadding = (padding: LayoutSettings['canvasPadding']): Spacing =>
        normaliseSpacingValue(padding, 48);

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

const ensureNodeSpacing = (nodes: NodeInstance[], spacing: AxisSpacing) => {
        const groups = new Map<string, NodeInstance[]>();

        for (const node of nodes) {
                const key = node.zoneId ?? '__global__';
                const existing = groups.get(key);

                if (existing) {
                        existing.push(node);
                } else {
                        groups.set(key, [node]);
                }
        }

        for (const group of groups.values()) {
                if (group.length < 2) {
                        continue;
                }

                group.sort((a, b) => (a.y - b.y !== 0 ? a.y - b.y : a.x - b.x));

                for (let i = 0; i < group.length; i += 1) {
                        const current = group[i];

                        for (let j = 0; j < i; j += 1) {
                                const other = group[j];
                                const dx = current.x - other.x;
                                const dy = current.y - other.y;
                                const absDx = Math.abs(dx);
                                const absDy = Math.abs(dy);
                                const overlapX = spacing.x - absDx;
                                const overlapY = spacing.y - absDy;

                                if (overlapX > 0 && overlapY > 0) {
                                        if (overlapY >= overlapX) {
                                                const directionY = dy === 0 ? 1 : Math.sign(dy);
                                                shiftNode(current, 0, directionY * overlapY);
                                        } else {
                                                const directionX = dx === 0 ? 1 : Math.sign(dx);
                                                shiftNode(current, directionX * overlapX, 0);
                                        }
                                } else if (overlapX > 0) {
                                        const directionX = dx === 0 ? (j % 2 === 0 ? -1 : 1) : Math.sign(dx);
                                        shiftNode(current, directionX * overlapX, 0);
                                } else if (overlapY > 0) {
                                        const directionY = dy === 0 ? 1 : Math.sign(dy);
                                        shiftNode(current, 0, directionY * overlapY);
                                }
                        }
                }
        }
};

const separateZones = (zones: ComputedZone[], spacing: AxisSpacing) => {
        const adjustments: ZoneShiftMap = Object.fromEntries(
                zones.map((zone) => [zone.id, { dx: 0, dy: 0 }])
        ) as ZoneShiftMap;

        const ordered = zones
                .map((zone) => ({ ...zone }))
                .sort((a, b) => (a.top - b.top !== 0 ? a.top - b.top : a.left - b.left));

        for (let i = 0; i < ordered.length; i += 1) {
                const current = ordered[i];

                for (let j = 0; j < i; j += 1) {
                        const other = ordered[j];
                        let needsCheck = true;

                        while (needsCheck) {
                                needsCheck = false;

                                const currentRight = current.left + current.width;
                                const currentBottom = current.top + current.height;
                                const otherRight = other.left + other.width;
                                const otherBottom = other.top + other.height;

                                const overlapsHorizontally =
                                        current.left < otherRight + spacing.x &&
                                        currentRight > other.left - spacing.x;
                                const overlapsVertically =
                                        current.top < otherBottom + spacing.y &&
                                        currentBottom > other.top - spacing.y;

                                if (overlapsHorizontally && overlapsVertically) {
                                        const deltaY = otherBottom + spacing.y - current.top;

                                        if (deltaY > 0) {
                                                current.top += deltaY;
                                                adjustments[current.id].dy += deltaY;
                                                needsCheck = true;
                                        }
                                } else if (overlapsHorizontally) {
                                        const currentCenter = current.left + current.width / 2;
                                        const otherCenter = other.left + other.width / 2;

                                        if (currentCenter >= otherCenter) {
                                                const deltaX = otherRight + spacing.x - current.left;

                                                if (deltaX > 0) {
                                                        current.left += deltaX;
                                                        adjustments[current.id].dx += deltaX;
                                                        needsCheck = true;
                                                }
                                        } else {
                                                const deltaX = currentRight + spacing.x - other.left;

                                                if (deltaX > 0) {
                                                        current.left -= deltaX;
                                                        adjustments[current.id].dx -= deltaX;
                                                        needsCheck = true;
                                                }
                                        }
                                } else if (overlapsVertically) {
                                        const deltaY = otherBottom + spacing.y - current.top;

                                        if (deltaY > 0) {
                                                current.top += deltaY;
                                                adjustments[current.id].dy += deltaY;
                                                needsCheck = true;
                                        }
                                }
                        }
                }
        }

        return { zones: ordered, adjustments };
};

const shiftNode = (node: NodeInstance, dx: number, dy: number) => {
        if (dx === 0 && dy === 0) {
                return;
        }

        node.x += dx;
        node.y += dy;

        if (node.localPosition) {
                node.localPosition = {
                        x: node.localPosition.x + dx,
                        y: node.localPosition.y + dy
                };
        }
};

const minOf = (values: number[]) => (values.length > 0 ? Math.min(...values) : 0);
const maxOf = (values: number[]) => (values.length > 0 ? Math.max(...values) : 0);

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
};

export const stackDevices = (
        direction: StackDirection,
        items: StackItem[],
        options: StackOptions
): DevicePlacement[] => {
        const gap = options.gap ?? 12;

        return items.map((item, index) =>
                placeDevice(item.template, {
                        id: item.id,
                        zone: options.zone,
                        overrides: item.overrides,
                        position: {
                                x: options.start.x + (direction === 'horizontal' ? index * gap : 0),
                                y: options.start.y + (direction === 'vertical' ? index * gap : 0)
                        }
                })
        );
};

export const instantiateLayout = (blueprint: LayoutBlueprint): FlowLayout => {
        const settings = blueprint.settings ?? {};
        const canvasPadding = normaliseCanvasPadding(settings.canvasPadding);
        const zoneSpacing = normaliseAxisSpacing(settings.zoneSpacing, { x: 80, y: 140 });
        const nodeSpacing = normaliseAxisSpacing(settings.nodeSpacing, { x: 140, y: 160 });
        const maxWidth = settings.maxWidth;

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
                        localPosition
                };

                resolvedNodes.push(node);
                resolvedMap[node.id] = node;
        }

        ensureNodeSpacing(resolvedNodes, nodeSpacing);

        const initialZones = computeZoneBounds(blueprint.zones, zoneAnchors, resolvedNodes);
        const { zones: separatedZones, adjustments } = separateZones(initialZones, zoneSpacing);

        for (const node of resolvedNodes) {
                if (!node.zoneId) {
                        continue;
                }

                const shift = adjustments[node.zoneId];
                if (shift) {
                        shiftNode(node, shift.dx, shift.dy);
                }
        }

        const zoneExtents = separatedZones.map((zone) => ({
                ...zone,
                right: zone.left + zone.width,
                bottom: zone.top + zone.height
        }));

        const nodeXs = resolvedNodes.map((node) => node.x);
        const nodeYs = resolvedNodes.map((node) => node.y);
        const zoneLefts = zoneExtents.map((zone) => zone.left);
        const zoneRights = zoneExtents.map((zone) => zone.right);
        const zoneTops = zoneExtents.map((zone) => zone.top);
        const zoneBottoms = zoneExtents.map((zone) => zone.bottom);

        const minX = minOf([...nodeXs, ...zoneLefts]);
        const maxX = maxOf([...nodeXs, ...zoneRights]);
        const minY = minOf([...nodeYs, ...zoneTops]);
        const maxY = maxOf([...nodeYs, ...zoneBottoms]);

        const baseWidth = Math.max(maxX - minX + canvasPadding.left + canvasPadding.right, 0);
        const baseHeight = Math.max(maxY - minY + canvasPadding.top + canvasPadding.bottom, 0);

        const scale = maxWidth && baseWidth > maxWidth ? maxWidth / baseWidth : 1;
        const nodeScale = scale < 1 ? scale : 1;

        const offsetX = canvasPadding.left - minX;
        const offsetY = canvasPadding.top - minY;

        for (const node of resolvedNodes) {
                node.x = (node.x + offsetX) * scale;
                node.y = (node.y + offsetY) * scale;

                if (node.localPosition) {
                        node.localPosition = {
                                x: node.localPosition.x * scale,
                                y: node.localPosition.y * scale
                        };
                }

                const baseSize = node.size ?? 40;
                node.size = baseSize * nodeScale;
        }

        const scaledZones = separatedZones.map((zone) => ({ ...zone }));

        for (const zone of scaledZones) {
                zone.left = (zone.left + offsetX) * scale;
                zone.top = (zone.top + offsetY) * scale;
                zone.width *= scale;
                zone.height *= scale;
        }

        return {
                nodes: resolvedNodes,
                links: blueprint.links,
                zones: scaledZones,
                dimensions: {
                        width: baseWidth * scale,
                        height: baseHeight * scale,
                        scale,
                        nodeScale
                }
        };
};
