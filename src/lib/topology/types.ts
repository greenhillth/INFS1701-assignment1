export type NodeType =
        | 'internet'
        | 'router'
        | 'switch'
        | 'mls'
        | 'server'
        | 'webserver'
        | 'mailserver'
        | 'client'
        | 'workstation'
        | 'firewall'
        | 'vpn'
        | 'wlc'
        | 'ap'
        | 'storage'
        | 'db'
        | 'printer'
        | 'telephone'
        | 'cctv'
        | 'poe';

export type NodeNetworkProfile = {
        ipAddress?: string;
        subnet?: string;
        macAddress?: string;
        notes?: string;
};

export type DeviceTemplate = {
        /** Unique key within the device library */
        templateId: string;
        type: NodeType;
        label: string;
        description: string;
        size?: number;
        network?: NodeNetworkProfile;
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

export type LayoutHints = {
        lockX?: boolean;
        lockY?: boolean;
};

export type LinkAppearance = {
        stroke?: string;
        dashedStroke?: string;
        width?: number;
        dashArray?: string;
        opacity?: number;
        linecap?: 'butt' | 'round' | 'square';
        linejoin?: 'miter' | 'round' | 'bevel';
        glowColor?: string;
        glowBlur?: number;
};

export type NodeInstance = {
        id: string;
        type: NodeType;
        label: string;
        description: string;
        x: number;
        y: number;
        size?: number;
        scale?: number;
        templateId: string;
        zoneId?: string;
        localPosition?: { x: number; y: number };
        layoutHints?: LayoutHints;
        network?: NodeNetworkProfile;
        multipleInstances?: boolean;
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
        multipleInstances?: boolean;
};

export type Spacing = {
        top: number;
        right: number;
        bottom: number;
        left: number;
};

export type CanvasBoxValue = number | string;

export type CanvasBoxOverrides = CanvasBoxValue | Partial<Record<keyof Spacing, CanvasBoxValue>>;

export type CanvasRenderSettings = {
        width?: 'full-screen' | CanvasBoxValue;
        padding?: CanvasBoxOverrides;
        margin?: CanvasBoxOverrides;
};

export type CanvasLayoutSettings = {
        padding?: number | Partial<Spacing>;
        maxWidth?: number;
        render?: CanvasRenderSettings;
};

export type ZoneDefinition = {
        id: string;
        label: string;
        origin: { x: number; y: number };
        padding?: number | Partial<Spacing>;
        minWidth?: number;
        minHeight?: number;
        multipleInstances?: boolean;
};

export type AxisSpacing = {
        horizontal: number;
        vertical: number;
};

export type LayoutSettings = {
        canvas?: CanvasLayoutSettings;
        zoneSpacing?: number | Partial<AxisSpacing>;
        nodeSpacing?: number;
        minNodeSize?: number;
        maxNodeSize?: number;
        minNodeScale?: number;
        linkStyle?: LinkAppearance;
        routeStyle?: RouteHighlightAppearance;
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

export type CanvasMetrics = {
        width: number;
        height: number;
        scale: number;
        padding: Spacing;
        render?: CanvasRenderSettings;
};

export type ResolvedLinkStyle = {
        stroke: string;
        dashedStroke: string;
        width: number;
        dashArray: string;
        opacity: number;
        linecap: 'butt' | 'round' | 'square';
        linejoin: 'miter' | 'round' | 'bevel';
        glowColor: string;
        glowBlur: number;
};

export type RouteGradientStop = {
        offset: number;
        color: string;
};

export type RouteHighlightAppearance = {
        gradientStops?: RouteGradientStop[];
        animationDistance?: number;
        animationDuration?: number;
        highlightWidthMultiplier?: number;
        solidDashArray?: string;
        dashedDashArray?: string;
        glowColor?: string;
        glowBlur?: number;
        fadeOutDelay?: number;
        fadeOutDuration?: number;
};

export type ResolvedRouteHighlightStyle = {
        gradientStops: RouteGradientStop[];
        animationDistance: number;
        animationDuration: number;
        highlightWidthMultiplier: number;
        solidDashArray: string;
        dashedDashArray: string;
        glowColor: string;
        glowBlur: number;
        fadeOutDelay: number;
        fadeOutDuration: number;
};

export type FlowLayout = {
        nodes: NodeInstance[];
        links: Link[];
        zones: ComputedZone[];
        canvas: CanvasMetrics;
        linkStyle: ResolvedLinkStyle;
        routeStyle: ResolvedRouteHighlightStyle;
};
