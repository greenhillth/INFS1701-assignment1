import { instantiateLayout, placeDevice, stackDevices } from '../layoutBuilder';
import type { LayoutBlueprint } from '../types';

const HORIZONTAL_GAP = 160;
const VERTICAL_GAP = 160;
const CLUSTER_ROW_OFFSET = VERTICAL_GAP * 1.15;
const SECOND_ROW_OFFSET = CLUSTER_ROW_OFFSET + VERTICAL_GAP * 0.85;
const SIDE_OFFSET = HORIZONTAL_GAP * 0.75;

const column = (index: number) => 160 + index * 240;
const rows = {
        edge: 0,
        core: 280,
        distribution: 620
};

const settings = {
        canvasPadding: { top: 64, right: 112, bottom: 112, left: 112 },
        maxWidth: 1380,
        zoneSpacing: { x: 120, y: 180 },
        nodeSpacing: { x: HORIZONTAL_GAP, y: VERTICAL_GAP }
} as const;

const blueprint: LayoutBlueprint = {
        settings,
        zones: [
                {
                        id: 'edge',
                        label: 'Edge & Perimeter',
                        origin: { x: column(2), y: rows.edge },
                        padding: { top: 48, right: 64, bottom: 48, left: 64 },
                        minWidth: 320,
                        minHeight: 280
                },
                {
                        id: 'core',
                        label: 'Core Network & Security',
                        origin: { x: column(2), y: rows.core },
                        padding: { top: 56, right: 72, bottom: 60, left: 72 },
                        minWidth: 360,
                        minHeight: 340
                },
                {
                        id: 'dc',
                        label: 'Data Centre / DMZ',
                        origin: { x: column(3), y: rows.distribution },
                        padding: { top: 56, right: 72, bottom: 76, left: 72 },
                        minWidth: 360,
                        minHeight: 380
                },
                {
                        id: 'admin',
                        label: 'Administration Building',
                        origin: { x: column(0), y: rows.distribution },
                        padding: { top: 56, right: 64, bottom: 72, left: 64 },
                        minWidth: 320,
                        minHeight: 340
                },
                {
                        id: 'library',
                        label: 'Library & Learning Commons',
                        origin: { x: column(1), y: rows.distribution },
                        padding: { top: 56, right: 64, bottom: 72, left: 64 },
                        minWidth: 320,
                        minHeight: 340
                },
                {
                        id: 'labs',
                        label: 'Engineering Labs',
                        origin: { x: column(2), y: rows.distribution },
                        padding: { top: 56, right: 64, bottom: 72, left: 64 },
                        minWidth: 320,
                        minHeight: 340
                },
                {
                        id: 'residence',
                        label: 'Student Residence',
                        origin: { x: column(4), y: rows.distribution },
                        padding: { top: 56, right: 64, bottom: 72, left: 64 },
                        minWidth: 320,
                        minHeight: 340
                }
        ],
        nodes: [
                ...stackDevices(
                        'vertical',
                        [
                                {
                                        template: 'internetGateway',
                                        id: 'isp',
                                        overrides: {
                                                label: 'ISP',
                                                description: 'Primary internet service provider for the university.'
                                        }
                                },
                                {
                                        template: 'router',
                                        id: 'edge-modem',
                                        overrides: {
                                                label: 'Edge Modem',
                                                description:
                                                        'Terminates the ISP link and hands off to campus security.'
                                        }
                                },
                                {
                                        template: 'perimeterFirewall',
                                        id: 'perimeter-fw',
                                        overrides: {
                                                label: 'Perimeter Firewall',
                                                description:
                                                        'Protects ingress and egress between trusted and untrusted networks.'
                                        }
                                }
                        ],
                        { zone: 'edge', start: { x: 0, y: 0 }, gap: VERTICAL_GAP }
                ),
                ...stackDevices(
                        'vertical',
                        [
                                {
                                        template: 'router',
                                        id: 'core-router',
                                        overrides: {
                                                label: 'Core Router',
                                                description:
                                                        'Routes traffic between the campus core, distribution layers and data centre.'
                                        }
                                },
                                {
                                        template: 'multilayerSwitch',
                                        id: 'core-switch',
                                        overrides: {
                                                description:
                                                        'Aggregates distribution switches and provides high-speed inter-VLAN routing.'
                                        }
                                }
                        ],
                        { zone: 'core', start: { x: 0, y: 0 }, gap: VERTICAL_GAP }
                ),
                placeDevice('wirelessController', {
                        id: 'wlc',
                        zone: 'core',
                        overrides: {
                                label: 'WLC',
                                description: 'Controls SSIDs, RF policies and roaming services for APs.'
                        },
                        position: { reference: 'core-switch', offsetX: SIDE_OFFSET, offsetY: 0 }
                }),
                ...stackDevices(
                        'vertical',
                        [
                                {
                                        template: 'distributionSwitch',
                                        id: 'dc-distribution',
                                        overrides: {
                                                label: 'Data Centre Distribution',
                                                description:
                                                        'High-availability distribution layer for the data centre footprint.'
                                        }
                                },
                                {
                                        template: 'accessSwitch',
                                        id: 'dmz-switch',
                                        overrides: {
                                                label: 'DMZ Switch',
                                                description: 'Hardened switch segmenting public-facing DMZ services.'
                                        }
                                }
                        ],
                        { zone: 'dc', start: { x: 0, y: 0 }, gap: VERTICAL_GAP }
                ),
                ...stackDevices(
                        'horizontal',
                        [
                                {
                                        template: 'server',
                                        id: 'web-servers',
                                        overrides: {
                                                label: 'Web Frontends',
                                                description: 'Handles public website and student portals.'
                                        }
                                },
                                {
                                        template: 'server',
                                        id: 'app-servers',
                                        overrides: {
                                                label: 'Application Servers',
                                                description: 'Hosts middleware and faculty specific applications.'
                                        }
                                }
                        ],
                        {
                                zone: 'dc',
                                start: { x: -HORIZONTAL_GAP / 2, y: CLUSTER_ROW_OFFSET },
                                gap: HORIZONTAL_GAP
                        }
                ),
                ...stackDevices(
                        'horizontal',
                        [
                                {
                                        template: 'databaseCluster',
                                        id: 'student-db',
                                        overrides: {
                                                label: 'Student Records DB',
                                                description: 'Mission-critical academic records database cluster.'
                                        }
                                },
                                {
                                        template: 'storageArray',
                                        id: 'backup-storage',
                                        overrides: {
                                                label: 'Backup Storage',
                                                description: 'Protects critical services with scheduled snapshots.'
                                        }
                                }
                        ],
                        {
                                zone: 'dc',
                                start: { x: -HORIZONTAL_GAP / 2, y: SECOND_ROW_OFFSET },
                                gap: HORIZONTAL_GAP
                        }
                ),
                ...stackDevices(
                        'vertical',
                        [
                                {
                                        template: 'distributionSwitch',
                                        id: 'admin-distribution',
                                        overrides: {
                                                label: 'Admin Distribution',
                                                description: 'Feeds the administrative building access layer.'
                                        }
                                },
                                {
                                        template: 'accessSwitch',
                                        id: 'admin-access',
                                        overrides: {
                                                label: 'Admin Access Switch',
                                                description:
                                                        'Connects administration offices, meeting rooms and wired printers.'
                                        }
                                }
                        ],
                        { zone: 'admin', start: { x: 0, y: 0 }, gap: VERTICAL_GAP }
                ),
                placeDevice('accessPoint', {
                        id: 'admin-ap',
                        zone: 'admin',
                        overrides: {
                                label: 'Admin AP',
                                description: 'Delivers Wi-Fi coverage for staff in administration buildings.'
                        },
                        position: { reference: 'admin-access', offsetX: SIDE_OFFSET, offsetY: 0 }
                }),
                ...stackDevices(
                        'horizontal',
                        [
                                {
                                        template: 'endpointCluster',
                                        id: 'admin-clients',
                                        overrides: {
                                                label: 'Admin Staff PCs',
                                                description: 'Desktops and laptops used by university administration staff.'
                                        }
                                },
                                {
                                        template: 'endpointCluster',
                                        id: 'admin-printers',
                                        overrides: {
                                                label: 'Secure Printers',
                                                description: 'Badge-release multifunction devices for staff.'
                                        }
                                }
                        ],
                        {
                                zone: 'admin',
                                start: { x: -HORIZONTAL_GAP / 2, y: CLUSTER_ROW_OFFSET },
                                gap: HORIZONTAL_GAP
                        }
                ),
                ...stackDevices(
                        'vertical',
                        [
                                {
                                        template: 'distributionSwitch',
                                        id: 'library-distribution',
                                        overrides: {
                                                label: 'Library Distribution',
                                                description: 'Backbone connectivity for the library complex.'
                                        }
                                },
                                {
                                        template: 'accessSwitch',
                                        id: 'library-access',
                                        overrides: {
                                                label: 'Library Access Switch',
                                                description: 'Provides wired ports for library facilities.'
                                        }
                                }
                        ],
                        { zone: 'library', start: { x: 0, y: 0 }, gap: VERTICAL_GAP }
                ),
                placeDevice('accessPoint', {
                        id: 'library-ap',
                        zone: 'library',
                        overrides: {
                                label: 'Library Atrium AP',
                                description: 'High-density wireless coverage for study areas.'
                        },
                        position: { reference: 'library-access', offsetX: SIDE_OFFSET, offsetY: 0 }
                }),
                ...stackDevices(
                        'horizontal',
                        [
                                {
                                        template: 'endpointCluster',
                                        id: 'library-pcs',
                                        overrides: {
                                                label: 'Study PCs',
                                                description: 'Open-access computers for students and visitors.'
                                        }
                                },
                                {
                                        template: 'endpointCluster',
                                        id: 'library-kiosks',
                                        overrides: {
                                                label: 'Self-check Kiosks',
                                                description: 'Self-service kiosks for borrowing and account management.'
                                        }
                                }
                        ],
                        {
                                zone: 'library',
                                start: { x: -HORIZONTAL_GAP / 2, y: CLUSTER_ROW_OFFSET },
                                gap: HORIZONTAL_GAP
                        }
                ),
                ...stackDevices(
                        'vertical',
                        [
                                {
                                        template: 'distributionSwitch',
                                        id: 'labs-distribution',
                                        overrides: {
                                                label: 'Engineering Labs Distribution',
                                                description: 'Aggregates specialist lab and research networks.'
                                        }
                                },
                                {
                                        template: 'accessSwitch',
                                        id: 'labs-access',
                                        overrides: {
                                                label: 'Lab Access Switch',
                                                description: 'High-throughput access for engineering lab benches.'
                                        }
                                }
                        ],
                        { zone: 'labs', start: { x: 0, y: 0 }, gap: VERTICAL_GAP }
                ),
                placeDevice('accessPoint', {
                        id: 'labs-ap',
                        zone: 'labs',
                        overrides: {
                                label: 'Engineering AP',
                                description: 'Wireless coverage for mobile research equipment.'
                        },
                        position: { reference: 'labs-access', offsetX: SIDE_OFFSET, offsetY: 0 }
                }),
                ...stackDevices(
                        'horizontal',
                        [
                                {
                                        template: 'endpointCluster',
                                        id: 'labs-workstations',
                                        overrides: {
                                                label: 'Research Workstations',
                                                description: 'High-performance PCs for computation and CAD.'
                                        }
                                },
                                {
                                        template: 'endpointCluster',
                                        id: 'labs-iot',
                                        overrides: {
                                                label: 'IoT Lab Gear',
                                                description: 'Embedded devices and prototypes under test.'
                                        }
                                }
                        ],
                        {
                                zone: 'labs',
                                start: { x: -HORIZONTAL_GAP / 2, y: CLUSTER_ROW_OFFSET },
                                gap: HORIZONTAL_GAP
                        }
                ),
                ...stackDevices(
                        'vertical',
                        [
                                {
                                        template: 'distributionSwitch',
                                        id: 'residence-distribution',
                                        overrides: {
                                                label: 'Residence Distribution',
                                                description: 'Feeds residence halls with redundant uplinks.'
                                        }
                                },
                                {
                                        template: 'accessSwitch',
                                        id: 'residence-access',
                                        overrides: {
                                                label: 'Residence Access Switch',
                                                description: 'Provides wired connectivity for hall infrastructure.'
                                        }
                                }
                        ],
                        { zone: 'residence', start: { x: 0, y: 0 }, gap: VERTICAL_GAP }
                ),
                placeDevice('accessPoint', {
                        id: 'residence-ap',
                        zone: 'residence',
                        overrides: {
                                label: 'Hallway Mesh AP',
                                description: 'Mesh-capable AP extending Wi-Fi into residential rooms.'
                        },
                        position: { reference: 'residence-access', offsetX: SIDE_OFFSET, offsetY: 0 }
                }),
                ...stackDevices(
                        'horizontal',
                        [
                                {
                                        template: 'endpointCluster',
                                        id: 'residence-gaming',
                                        overrides: {
                                                label: 'Student Consoles',
                                                description: 'Gaming consoles on the residence entertainment network.'
                                        }
                                },
                                {
                                        template: 'endpointCluster',
                                        id: 'residence-laptops',
                                        overrides: {
                                                label: 'Student Laptops',
                                                description: 'Personal laptops and tablets connecting via Wi-Fi.'
                                        }
                                }
                        ],
                        {
                                zone: 'residence',
                                start: { x: -HORIZONTAL_GAP / 2, y: CLUSTER_ROW_OFFSET },
                                gap: HORIZONTAL_GAP
                        }
                )
        ],
        links: [
                { source: 'isp', target: 'edge-modem', routing: 'orthogonal', orientation: 'vertical-first' },
                { source: 'edge-modem', target: 'perimeter-fw', routing: 'orthogonal', orientation: 'vertical-first' },
                { source: 'perimeter-fw', target: 'core-router', routing: 'orthogonal', orientation: 'vertical-first' },
                { source: 'core-router', target: 'core-switch', routing: 'orthogonal', orientation: 'vertical-first' },
                { source: 'core-router', target: 'dc-distribution', routing: 'orthogonal', orientation: 'horizontal-first' },
                { source: 'core-switch', target: 'admin-distribution', routing: 'orthogonal', orientation: 'horizontal-first' },
                { source: 'core-switch', target: 'library-distribution', routing: 'orthogonal', orientation: 'horizontal-first' },
                { source: 'core-switch', target: 'labs-distribution', routing: 'orthogonal', orientation: 'horizontal-first' },
                { source: 'core-switch', target: 'residence-distribution', routing: 'orthogonal', orientation: 'horizontal-first' },
                { source: 'core-switch', target: 'wlc' },

                { source: 'dc-distribution', target: 'dmz-switch', routing: 'orthogonal', orientation: 'vertical-first' },
                { source: 'dmz-switch', target: 'web-servers' },
                { source: 'dmz-switch', target: 'app-servers' },
                { source: 'dmz-switch', target: 'student-db' },
                { source: 'student-db', target: 'backup-storage', routing: 'orthogonal', orientation: 'horizontal-first' },

                { source: 'admin-distribution', target: 'admin-access', routing: 'orthogonal', orientation: 'vertical-first' },
                { source: 'admin-access', target: 'admin-clients' },
                { source: 'admin-access', target: 'admin-printers' },
                { source: 'wlc', target: 'admin-ap', dashed: true },
                { source: 'admin-ap', target: 'admin-clients', dashed: true },
                { source: 'admin-ap', target: 'admin-printers', dashed: true },

                { source: 'library-distribution', target: 'library-access', routing: 'orthogonal', orientation: 'vertical-first' },
                { source: 'library-access', target: 'library-pcs' },
                { source: 'library-access', target: 'library-kiosks' },
                { source: 'wlc', target: 'library-ap', dashed: true },
                { source: 'library-ap', target: 'library-pcs', dashed: true },
                { source: 'library-ap', target: 'library-kiosks', dashed: true },

                { source: 'labs-distribution', target: 'labs-access', routing: 'orthogonal', orientation: 'vertical-first' },
                { source: 'labs-access', target: 'labs-workstations' },
                { source: 'labs-access', target: 'labs-iot' },
                { source: 'wlc', target: 'labs-ap', dashed: true },
                { source: 'labs-ap', target: 'labs-workstations', dashed: true },
                { source: 'labs-ap', target: 'labs-iot', dashed: true },

                { source: 'residence-distribution', target: 'residence-access', routing: 'orthogonal', orientation: 'vertical-first' },
                { source: 'residence-access', target: 'residence-gaming' },
                { source: 'residence-access', target: 'residence-laptops' },
                { source: 'wlc', target: 'residence-ap', dashed: true },
                { source: 'residence-ap', target: 'residence-gaming', dashed: true },
                { source: 'residence-ap', target: 'residence-laptops', dashed: true }
        ]
};

export const universityLayout = instantiateLayout(blueprint);
