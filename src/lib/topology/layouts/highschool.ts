import { instantiateLayout, placeDevice, stackDevices } from '../layoutBuilder';
import type { LayoutBlueprint, NodeNetworkProfile } from '../types';

const settings: LayoutBlueprint['settings'] = {
        canvas: {
                padding: { top: 1, right: 4, bottom: 1, left: 4 },
                maxWidth: 160
        },
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
        },
        routeStyle: {
                gradientStops: [
                        { offset: 0, color: 'rgb(22 101 52 / 0)' },
                        { offset: 0.25, color: 'rgb(74 222 128 / 0.45)' },
                        { offset: 0.6, color: 'rgb(34 197 94 / 1)' },
                        { offset: 1, color: 'rgb(22 101 52 / 0)' }
                ],
                animationDistance: 60,
                animationDuration: 2.1,
                highlightWidthMultiplier: 2.1,
                solidDashArray: '24 18',
                dashedDashArray: '6 16',
                glowColor: 'rgb(74 222 128 / 0.75)',
                glowBlur: 12,
                fadeOutDelay: 0,
                fadeOutDuration: 0
        }
};

const nodeGap = settings.nodeSpacing ?? 14;
const rowGap = Math.round(nodeGap * 1.4);

const networkProfiles: Record<string, NodeNetworkProfile> = {
        isp: {
                ipAddress: '203.0.113.1',
                subnet: '203.0.113.0/30',
                macAddress: '00:1A:8C:00:00:01',
                notes: 'ISP Internet circuit (example range).'
        },
        'edge-modem': {
                ipAddress: '203.0.113.2',
                subnet: '203.0.113.0/30',
                macAddress: '00:1A:8C:00:00:02',
                notes: 'Provider modem handing off the Internet link to the campus firewall.'
        },
        'perimeter-fw': {
                ipAddress: '10.0.0.1',
                subnet: '10.0.0.0/29',
                macAddress: '00:1A:8C:00:10:01',
                notes: 'Northbound interface performing NAT and protecting internal networks.'
        },
        'core-router': {
                ipAddress: '10.0.0.2',
                subnet: '10.0.0.0/29',
                macAddress: '00:1A:8C:00:10:02',
                notes: 'Gateway advertising internal routes and default route to the firewall.'
        },
        'core-switch': {
                ipAddress: '10.0.1.1',
                subnet: '10.0.1.0/24',
                macAddress: '00:1A:8C:00:20:01',
                notes: 'Collapsed core with 10 Gb uplinks to distribution blocks.'
        },
        wlc: {
                ipAddress: '10.0.5.10',
                subnet: '10.0.5.0/24',
                macAddress: '00:1A:8C:00:50:0A',
                notes: 'Wireless LAN controller for staff/student/guest SSIDs and RF policy.'
        },

        // Server/DMZ segment (school server room)
        'dc-firewall': {
                ipAddress: '10.2.0.2',
                subnet: '10.2.0.0/23',
                macAddress: '00:1A:8C:00:30:07',
                notes: 'Firewall separating server/DMZ networks from the rest of campus.'
        },
        'dc-distribution': {
                ipAddress: '10.2.0.1',
                subnet: '10.2.0.0/23',
                macAddress: '00:1A:8C:00:30:01',
                notes: 'Aggregation switch for the school server room.'
        },
        'dmz-switch': {
                ipAddress: '10.2.1.3',
                subnet: '10.2.0.0/23',
                macAddress: '00:1A:8C:00:30:02',
                notes: 'DMZ for externally reachable services (VPN, guest portal, web proxy).'
        },

        'web-servers': {
                ipAddress: '172.16.10.20',
                subnet: '172.16.10.0/24',
                macAddress: '00:1A:8C:00:40:14',
                notes: 'Intranet/LMS front end (example VIP).'
        },
        'app-servers': {
                ipAddress: '172.16.10.30',
                subnet: '172.16.10.0/24',
                macAddress: '00:1A:8C:00:40:1E',
                notes: 'Application tier for school services (e.g., LMS, printing).'
        },
        'student-db': {
                ipAddress: '172.16.20.10',
                subnet: '172.16.20.0/24',
                macAddress: '00:1A:8C:00:41:0A',
                notes: 'School information system database (SIS).'
        },
        'backup-storage': {
                ipAddress: '172.16.20.40',
                subnet: '172.16.20.0/24',
                macAddress: '00:1A:8C:00:41:28',
                notes: 'NAS handling nightly backups and archives.'
        },

        // Administration block
        'admin-distribution': {
                ipAddress: '10.3.0.1',
                subnet: '10.3.0.0/22',
                macAddress: '00:1A:8C:00:60:01',
                notes: 'Feeds redundant access switches for admin offices.'
        },
        'admin-access': {
                ipAddress: '10.3.1.1',
                subnet: '10.3.0.0/22',
                macAddress: '00:1A:8C:00:60:11',
                notes: 'Edge switch terminating wired ports across admin offices.'
        },
        'admin-ap': {
                ipAddress: '10.3.100.2',
                subnet: '10.3.100.0/24',
                macAddress: '00:1A:8C:00:61:02',
                notes: 'AP for staff Wi-Fi (WPA2/3-Enterprise on 2.4/5 GHz).'
        },
        'admin-clients': {
                ipAddress: '10.3.1.100',
                subnet: '10.3.0.0/22',
                macAddress: '3C:52:82:AA:10:64',
                notes: 'Example staff workstation.'
        },
        'admin-printers': {
                ipAddress: '10.3.1.150',
                subnet: '10.3.0.0/22',
                macAddress: '68:5D:43:10:75:AA',
                notes: 'Secure print MFD shared by administration.'
        },
        'admin-telephone': {
                ipAddress: '10.3.1.250',
                subnet: '10.3.0.0/22',
                macAddress: '00:1A:8C:00:61:30',
                notes: 'VoIP handset(s) on admin VLAN.'
        },

        // Classrooms / STEM labs
        'classroom-distribution': {
                ipAddress: '10.4.0.1',
                subnet: '10.4.0.0/22',
                macAddress: '00:1A:8C:00:70:01',
                notes: 'Aggregates classroom VLANs back to the core.'
        },
        'classroom-access': {
                ipAddress: '10.4.1.1',
                subnet: '10.4.0.0/22',
                macAddress: '00:1A:8C:00:70:11',
                notes: 'High-density access switch for classroom ports.'
        },
        'classroom-ap': {
                ipAddress: '10.4.100.2',
                subnet: '10.4.100.0/24',
                macAddress: '00:1A:8C:00:71:02',
                notes: 'AP providing classroom Wi-Fi coverage.'
        },
        'classroom-workstations': {
                ipAddress: '10.4.1.120',
                subnet: '10.4.0.0/22',
                macAddress: '58:6D:8F:44:20:78',
                notes: 'Teacher workstation connected to projector/room AV.'
        },
        'classroom-users': {
                ipAddress: '10.4.1.200',
                subnet: '10.4.0.0/22',
                macAddress: '8C:85:90:12:7A:1C',
                notes: 'Student devices (filtered internet, student VLAN).'
        },

        // Shared infrastructure in the server room
        'admin-console': {
                ipAddress: '10.2.1.251',
                subnet: '10.2.0.0/23',
                macAddress: '00:1A:8C:00:71:03',
                notes: 'Admin console/jumpbox for managing network devices.'
        },
        'cctv-system': {
                ipAddress: '10.2.1.100',
                subnet: '10.2.0.0/23',
                macAddress: '00:1A:8C:00:71:04',
                notes: 'CCTV NVR and cameras on a segmented VLAN.'
        }
};


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
                        origin: { x: 45, y: 0 },
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
                        id: 'admin-office',
                        label: 'Offices',
                        origin: { x: 0, y: nodeGap },
                        padding: { top: 6, right: 10, bottom: 10, left: 10 },
                        minWidth: 20,
                        minHeight: 20,
                        parentId: 'admin',
                        multipleInstances: true
                },
                {
                        id: 'classrooms',
                        label: 'Teaching Spaces',
                        origin: { x: 50, y: 40 },
                        padding: { top: 8, right: 10, bottom: 8, left: 10 },
                        minWidth: 30,
                        minHeight: 36
                },
                {
                        id: 'classroom-core',
                        label: 'Classrooms',
                        origin: { x: 0, y: nodeGap },
                        padding: { top: 6, right: 10, bottom: 10, left: 10 },
                        minWidth: 22,
                        minHeight: 24,
                        multipleInstances: true,
                        parentId: 'classrooms'
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
                                                description: 'Primary Internet service provider for the school.',
                                                network: networkProfiles.isp
                                        }
                                },
                                {
                                        template: 'router',
                                        id: 'edge-modem',
                                        overrides: {
                                                label: 'Edge Modem',
                                                description: 'Terminates the ISP link and hands off to the campus firewall.',
                                                network: networkProfiles['edge-modem']
                                        }
                                },
                                {
                                        template: 'perimeterFirewall',
                                        id: 'perimeter-fw',
                                        overrides: {
                                                label: 'Perimeter Firewall',
                                                description: 'Protects traffic between the Internet and school networks; performs NAT and policy enforcement.',
                                                network: networkProfiles['perimeter-fw']
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
                                description: 'Routes between the campus core, distribution layers and the server/DMZ networks.',
                                network: networkProfiles['core-router']
                        },
                        position: { offsetX: 0, offsetY: 0 }
                }),

                placeDevice('multilayerSwitch', {
                        id: 'core-switch',
                        zone: 'core',
                        overrides: {
                                description: 'Aggregates distribution switches and provides high-speed inter-VLAN routing (10 Gb uplinks).',
                                network: networkProfiles['core-switch']
                        },
                        position: { reference: 'core-router', offsetX: 10, offsetY: 8 }
                }),

                placeDevice('wirelessController', {
                        id: 'wlc',
                        zone: 'core',
                        overrides: {
                                label: 'WLC',
                                description: 'Controls staff/student/guest SSIDs, RF policy and roaming for APs.',
                                network: networkProfiles.wlc
                        },
                        position: { reference: 'core-switch', offsetX: 15, offsetY: 0 }
                }),

                ...stackDevices(
                        'vertical',
                        [
                                {
                                        template: 'perimeterFirewall',
                                        id: 'dc-firewall',
                                        overrides: {
                                                label: 'Data Centre Firewall',
                                                description: 'Separates server/DMZ networks from the rest of campus; enforces service segmentation.',
                                                network: networkProfiles['dc-firewall']
                                        }
                                },
                                {
                                        template: 'distributionSwitch',
                                        id: 'dc-distribution',
                                        overrides: {
                                                label: 'Data Centre Main Switch',
                                                description: 'High-availability aggregation for the school server room.',
                                                network: networkProfiles['dc-distribution']
                                        }
                                }
                        ],
                        { zone: 'dc', start: { x: 0, y: 0 }, gap: nodeGap }
                ),

                placeDevice('accessSwitch', {
                        id: 'dmz-switch',
                        zone: 'dc',
                        overrides: {
                                label: 'Server DMZ Switch',
                                description: 'Hardened switch segmenting public-facing DMZ services (e.g., VPN portal, guest captive portal).',
                                network: networkProfiles['dmz-switch']
                        },
                        position: { reference: 'dc-distribution', offsetX: 0, offsetY: 10 }
                }),

                ...stackDevices(
                        'horizontal',
                        [
                                {
                                        template: 'server',
                                        id: 'web-servers',
                                        overrides: {
                                                label: 'Web Frontends',
                                                description: 'Intranet / LMS front end. (Public website is often hosted off-site.)',
                                                network: networkProfiles['web-servers']
                                        }
                                },
                                {
                                        template: 'server',
                                        id: 'app-servers',
                                        overrides: {
                                                label: 'Application Servers',
                                                description: 'Hosts school apps (e.g., LMS, print services, portals).',
                                                network: networkProfiles['app-servers']
                                        }
                                }
                        ],
                        { zone: 'dc', start: { x: -12, y: 27 }, gap: rowGap }
                ),

                ...stackDevices(
                        'horizontal',
                        [
                                {
                                        template: 'databaseCluster',
                                        id: 'student-db',
                                        overrides: {
                                                label: 'SIS Database',
                                                description: 'School Information System (SIS) database for student records.',
                                                network: networkProfiles['student-db']
                                        }
                                },
                                {
                                        template: 'storageArray',
                                        id: 'backup-storage',
                                        overrides: {
                                                label: 'Backup Storage',
                                                description: 'NAS handling scheduled backups and archives for critical services.',
                                                network: networkProfiles['backup-storage']
                                        }
                                }
                        ],
                        { zone: 'dc', start: { x: -12, y: 36 }, gap: rowGap }
                ),

                placeDevice('workstation', {
                        id: 'admin-console',
                        zone: 'dc',
                        overrides: {
                                label: 'Admin Console',
                                description: 'Jumpbox/management console for network and server administration.',
                                network: networkProfiles['admin-console']
                        },
                        position: { reference: 'dc-distribution', offsetX: 20, offsetY: 8 }
                }),

                placeDevice('cctv', {
                        id: 'cctv-system',
                        zone: 'dc',
                        overrides: {
                                label: 'CCTV System',
                                description: 'NVR and camera management for school premises (segmented VLAN).',
                                network: networkProfiles['cctv-system'],
                                multipleInstances: true
                        },
                        position: { reference: 'admin-console', offsetX: 15, offsetY: 0 }
                }),

                placeDevice('poeSwitch', {
                        id: 'poe-switch',
                        zone: 'dc',
                        overrides: {
                                label: 'PoE Switch',
                                description: 'Provides Power over Ethernet for APs, VoIP phones and cameras.',
                                network: undefined
                        },
                        position: { reference: 'dc-distribution', offsetX: 35, offsetY: 0 }
                }),

                // Administration
                placeDevice('distributionSwitch', {
                        id: 'admin-distribution',
                        zone: 'admin',
                        overrides: {
                                label: 'Admin Distribution',
                                description: 'Feeds the administrative building access layer.',
                                network: networkProfiles['admin-distribution']
                        },
                        position: { x: 0, y: 0 }
                }),

                placeDevice('accessSwitch', {
                        id: 'admin-access',
                        zone: 'admin-office',
                        overrides: {
                                label: 'Admin Access Switch',
                                description: 'Connects admin offices, meeting rooms and wired printers.',
                                network: networkProfiles['admin-access']
                        },
                        position: { reference: 'admin-distribution', offsetX: 0, offsetY: nodeGap }
                }),

                placeDevice('accessPoint', {
                        id: 'admin-ap',
                        zone: 'admin-office',
                        overrides: {
                                label: 'Admin AP',
                                description: 'Staff Wi-Fi coverage (WPA2/3-Enterprise).',
                                network: networkProfiles['admin-ap']
                        },
                        position: { reference: 'admin-access', offsetX: 16, offsetY: 0 }
                }),

                placeDevice('telephone', {
                        id: 'admin-telephone',
                        zone: 'admin-office',
                        overrides: {
                                label: 'Office Telephones',
                                description: 'VoIP handsets for staff and external calls.',
                                network: networkProfiles['admin-telephone']
                        },
                        position: { reference: 'admin-access', offsetX: 0, offsetY: 10 }
                }),

                ...stackDevices(
                        'horizontal',
                        [
                                {
                                        template: 'workstation',
                                        id: 'admin-clients',
                                        overrides: {
                                                label: 'Staff PC',
                                                description: 'Desktop workstation used by administrative staff.',
                                                network: networkProfiles['admin-clients']
                                        }
                                },
                                {
                                        template: 'printer',
                                        id: 'admin-printers',
                                        overrides: {
                                                label: 'Office Printer',
                                                description: 'Shared MFD for printing and scanning (secure release).',
                                                network: networkProfiles['admin-printers']
                                        }
                                }
                        ],
                        { zone: 'admin-office', start: { x: 0, y: 24 }, gap: rowGap }
                ),

                // Classrooms / Teaching Spaces
                placeDevice('distributionSwitch', {
                        id: 'classroom-distribution',
                        zone: 'classrooms',
                        overrides: {
                                label: 'Classroom Distribution',
                                description: 'Aggregates classroom access switches back to the core.',
                                network: networkProfiles['classroom-distribution']
                        },
                        position: { x: 0, y: 0 }
                }),

                placeDevice('accessSwitch', {
                        id: 'classroom-access',
                        zone: 'classroom-core',
                        overrides: {
                                label: 'Classroom Access Switch',
                                description: 'Access switch for classroom wired connections and AV gear.',
                                network: networkProfiles['classroom-access']
                        },
                        position: { reference: 'classroom-distribution', offsetX: 0, offsetY: nodeGap }
                }),

                placeDevice('accessPoint', {
                        id: 'classroom-ap',
                        zone: 'classroom-core',
                        overrides: {
                                label: 'Classroom AP',
                                description: 'Wi-Fi coverage for student and teacher devices in classrooms.',
                                network: networkProfiles['classroom-ap']
                        },
                        position: { reference: 'classroom-access', offsetX: 16, offsetY: 0 }
                }),

                placeDevice('endpointCluster', {
                        id: 'classroom-teacher',
                        zone: 'classroom-core',
                        overrides: {
                                label: 'Teacher Laptop',
                                description: 'Teacher device(s) connected to the classroom network and AV.',
                                network: networkProfiles['classroom-teacher'] // NOTE: this profile is missing in networkProfiles
                        },
                        position: { reference: 'classroom-access', offsetX: 0, offsetY: 15 }
                }),

                ...stackDevices(
                        'horizontal',
                        [
                                {
                                        template: 'workstation',
                                        id: 'classroom-workstations',
                                        overrides: {
                                                label: 'Teacher PC',
                                                description: 'Teacher PC connected to projector and room facilities.',
                                                network: networkProfiles['classroom-workstations']
                                        }
                                },
                                {
                                        template: 'endpointCluster',
                                        id: 'classroom-users',
                                        overrides: {
                                                label: 'Student Devices',
                                                description: 'Student laptops/tablets on the student VLAN with filtered Internet.',
                                                network: networkProfiles['classroom-users'],
                                                multipleInstances: true
                                        }
                                }
                        ],
                        { zone: 'classroom-core', start: { x: 0, y: 24 }, gap: rowGap }
                )
        ],
        links: [
                { source: 'isp', target: 'edge-modem', routing: 'straight' },
                { source: 'edge-modem', target: 'perimeter-fw', routing: 'straight' },
                { source: 'perimeter-fw', target: 'core-router', routing: 'straight' },
                { source: 'core-router', target: 'core-switch', routing: 'straight' },
                { source: 'core-router', target: 'dc-firewall', routing: 'straight' },
                { source: 'core-switch', target: 'admin-distribution', routing: 'straight' },
                { source: 'core-switch', target: 'classroom-distribution', routing: 'straight' },
                { source: 'core-switch', target: 'wlc' },

                { source: 'dc-firewall', target: 'dc-distribution', routing: 'orthogonal', orientation: 'vertical-first' },
                { source: 'dc-distribution', target: 'dmz-switch' },
                { source: 'dc-distribution', target: 'admin-console', routing: 'orthogonal', orientation: 'horizontal-first' },
                { source: 'dc-distribution', target: 'poe-switch', routing: 'orthogonal', orientation: 'horizontal-first' },
                { source: 'poe-switch', target: 'cctv-system' },

                { source: 'dmz-switch', target: 'web-servers' },
                { source: 'dmz-switch', target: 'app-servers' },
                { source: 'dmz-switch', target: 'student-db' },
                { source: 'student-db', target: 'backup-storage', routing: 'orthogonal', orientation: 'horizontal-first' },

                { source: 'admin-distribution', target: 'admin-access', routing: 'orthogonal', orientation: 'vertical-first' },
                { source: 'admin-access', target: 'admin-clients' },
                { source: 'admin-access', target: 'admin-printers' },
                { source: 'wlc', target: 'admin-ap', dashed: false },
                { source: 'admin-ap', target: 'admin-clients', dashed: true },
                { source: 'admin-ap', target: 'admin-printers', dashed: true },
                { source: 'admin-access', target: 'admin-telephone' },

                { source: 'classroom-distribution', target: 'classroom-access', routing: 'orthogonal', orientation: 'vertical-first' },
                { source: 'classroom-access', target: 'classroom-workstations' },
                { source: 'wlc', target: 'classroom-ap', dashed: false },
                { source: 'classroom-ap', target: 'classroom-workstations', dashed: true },
                { source: 'classroom-ap', target: 'classroom-users', dashed: true },
                { source: 'classroom-ap', target: 'classroom-teacher', dashed: true },

        ]
};

export const layout = instantiateLayout(blueprint);
