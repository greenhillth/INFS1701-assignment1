import { instantiateLayout, placeDevice, stackDevices } from '../layoutBuilder';
import type { LayoutBlueprint } from '../types';

const settings: LayoutBlueprint['settings'] = {
        canvasPadding: { top: 1, right: 4, bottom: 1, left: 4 },
        maxWidth: 160,
        zoneSpacing: { horizontal: 2, vertical: 2 },
        nodeSpacing: 10,
        minNodeSize: 18,
        maxNodeSize: 44,
        minNodeScale: 0.65,
        linkStyle: {
                stroke: 'rgb(148 163 184 / 0.88)',
                dashedStroke: 'rgb(96 165 250 / 0.9)',
                width: 0.5,
                dashArray: '2 3',
                opacity: 0.95,
                glowColor: 'rgb(14 165 233 / 0.45)',
                glowBlur: 10
        }
};

const nodeGap = settings.nodeSpacing ?? 14;
const rowGap = Math.round(nodeGap * 1.4);

const blueprint: LayoutBlueprint = {
        settings,
        zones: [
                {
                        id: 'edge',
                        label: 'Edge & Perimeter',
                        origin: { x: 0, y: 0 },
                        padding: { top: 8, right: 10, bottom: 8, left: 10 },
                        minWidth: 20,
                        minHeight: 10
                },
                {
                        id: 'core',
                        label: 'Core Network & Security',
                        origin: { x: 50, y: 0 },
                        padding: { top: 8, right: 10, bottom: 8, left: 8 },
                        minWidth: 22,
                        minHeight: 20
                },
                {
                        id: 'dc',
                        label: 'Data Centre / DMZ',
                        origin: { x: 30, y: 60 },
                        padding: { top: 8, right: 10, bottom: 8, left: 10 },
                        minWidth: 34,
                        minHeight: 40
                },
                {
                        id: 'admin',
                        label: 'Administration Building',
                        origin: { x: 0, y: 40 },
                        padding: { top: 8, right: 10, bottom: 8, left: 10 },
                        minWidth: 20,
                        minHeight: 20
                },
                {
                        id: 'labs',
                        label: 'Engineering Labs',
                        origin: { x: 50, y: 40 },
                        padding: { top: 8, right: 10, bottom: 8, left: 10 },
                        minWidth: 30,
                        minHeight: 36
                }
        ],
        nodes: [
                ...stackDevices(
                        'horizontal',
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
                        { zone: 'edge', start: { x: 0, y: 0 }, gap: nodeGap }
                ),
                placeDevice('router', {
                        id: 'core-router',
                        zone: 'core',
                        overrides: {
                                label: 'Core Router',
                                description: 'Routes traffic between the campus core, distribution layers and data centre.'
                        },
                        position: { offsetX: 0, offsetY: 0 }
                }),
                placeDevice('multilayerSwitch', {
                        id: 'core-switch',
                        zone: 'core',
                        overrides: {
                                description:
                                        'Aggregates distribution switches and provides high-speed inter-VLAN routing.'
                        },
                        position: { reference: 'core-router', offsetX: 10, offsetY: 8 }
                }),
                placeDevice('wirelessController', {
                        id: 'wlc',
                        zone: 'core',
                        overrides: {
                                label: 'WLC',
                                description: 'Controls SSIDs, RF policies and roaming services for APs.'
                        },
                        position: { reference: 'core-router', offsetX: 20, offsetY: 0 }
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
                        { zone: 'dc', start: { x: 0, y: 0 }, gap: nodeGap }
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
                        { zone: 'dc', start: { x: -12, y: 24 }, gap: rowGap }
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
                        { zone: 'dc', start: { x: -12, y: 36 }, gap: rowGap }
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
                        { zone: 'admin', start: { x: 0, y: 0 }, gap: nodeGap }
                ),
                placeDevice('accessPoint', {
                        id: 'admin-ap',
                        zone: 'admin',
                        overrides: {
                                label: 'Admin AP',
                                description: 'Delivers Wi-Fi coverage for staff in administration buildings.'
                        },
                        position: { reference: 'admin-access', offsetX: 16, offsetY: 0 }
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
                        { zone: 'admin', start: { x: 0, y: 24 }, gap: rowGap }
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
                        { zone: 'labs', start: { x: 0, y: 0 }, gap: nodeGap }
                ),
                placeDevice('accessPoint', {
                        id: 'labs-ap',
                        zone: 'labs',
                        overrides: {
                                label: 'Engineering AP',
                                description: 'Wireless coverage for mobile research equipment.'
                        },
                        position: { reference: 'labs-access', offsetX: 16, offsetY: 0 }
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
                        { zone: 'labs', start: { x: 0, y: 24 }, gap: rowGap }
                )
        ],
        links: [
                { source: 'isp', target: 'edge-modem', routing: 'straight' },
                { source: 'edge-modem', target: 'perimeter-fw', routing: 'straight' },
                { source: 'perimeter-fw', target: 'core-router', routing: 'straight' },
                { source: 'core-router', target: 'core-switch', routing: 'straight' },
                { source: 'core-router', target: 'dc-distribution', routing: 'straight' },
                { source: 'core-switch', target: 'admin-distribution', routing: 'straight' },
                { source: 'core-switch', target: 'library-distribution', routing: 'straight' },
                { source: 'core-switch', target: 'labs-distribution', routing: 'straight' },
                { source: 'core-switch', target: 'residence-distribution', routing: 'straight' },
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

                { source: 'labs-distribution', target: 'labs-access', routing: 'orthogonal', orientation: 'vertical-first' },
                { source: 'labs-access', target: 'labs-workstations' },
                { source: 'labs-access', target: 'labs-iot' },
                { source: 'wlc', target: 'labs-ap', dashed: true },
                { source: 'labs-ap', target: 'labs-workstations', dashed: true },
                { source: 'labs-ap', target: 'labs-iot', dashed: true },

        ]
};

export const universityLayout = instantiateLayout(blueprint);
