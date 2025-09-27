export type NodeType =
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

export type DeviceTemplate = {
        /** Unique key within the device library */
        templateId: string;
        type: NodeType;
        label: string;
        description: string;
        size?: number;
};

export type AbsolutePosition = {
        kind: 'absolute';
        x: number;
        y: number;
};

export type RelativePosition = {
        kind: 'relative';
        reference: string;
        offsetX: number;
        offsetY: number;
};

export type Positioning = AbsolutePosition | RelativePosition;

export type NodeInstance = {
        id: string;
        type: NodeType;
        label: string;
        description: string;
        x: number;
        y: number;
        size?: number;
        templateId: string;
        zoneId?: string;
        localPosition?: { x: number; y: number };
};

export type Link = {
        source: NodeInstance['id'];
        target: NodeInstance['id'];
        dashed?: boolean;
        routing?: 'straight' | 'orthogonal';
        orientation?: 'horizontal-first' | 'vertical-first';
};

export type ComputedZone = {
        id: string;
        label: string;
        left: number;
        top: number;
        width: number;
        height: number;
};

export type Spacing = {
        top: number;
        right: number;
        bottom: number;
        left: number;
};

export type ZoneDefinition = {
        id: string;
        label: string;
        origin: { x: number; y: number };
        padding?: number | Partial<Spacing>;
        minWidth?: number;
        minHeight?: number;
};

export type AxisSpacing = {
        x: number;
        y: number;
};

export type LayoutSettings = {
        canvasPadding?: number | Partial<Spacing>;
        maxWidth?: number;
        zoneSpacing?: Partial<AxisSpacing> | number;
        nodeSpacing?: Partial<AxisSpacing> | number;
        minNodeScale?: number;
};

export type DevicePlacement = {
        template: string;
        id?: string;
        zone?: string;
        position: Positioning;
        overrides?: Partial<Omit<NodeInstance, 'id' | 'x' | 'y' | 'templateId'>>;
};

export type LayoutBlueprint = {
        nodes: DevicePlacement[];
        links: Link[];
        zones: ZoneDefinition[];
        settings?: LayoutSettings;
};

export type FlowLayout = {
        nodes: NodeInstance[];
        links: Link[];
        zones: ComputedZone[];
        dimensions: {
                width: number;
                height: number;
                scale: number;
                nodeScale: number;
        };
};
