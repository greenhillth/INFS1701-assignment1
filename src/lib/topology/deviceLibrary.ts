import type { DeviceTemplate } from './types';

export const DEVICE_LIBRARY: Record<string, DeviceTemplate> = {
        internetGateway: {
                templateId: 'internetGateway',
                type: 'internet',
                label: 'Internet Gateway',
                description: 'External upstream providing campus connectivity.',
        },
        perimeterFirewall: {
                templateId: 'perimeterFirewall',
                type: 'firewall',
                label: 'Perimeter Firewall',
                description: 'Secures ingress and egress between trusted and untrusted zones.',
        },
        router: {
                templateId: 'router',
                type: 'router',
                label: 'Router',
                description: 'Layer 3 routing and network segmentation.',
        },
        multilayerSwitch: {
                templateId: 'multilayerSwitch',
                type: 'mls',
                label: 'Core Switch Stack',
                description: 'Provides high-speed switching and routing for the core.',
        },
        distributionSwitch: {
                templateId: 'distributionSwitch',
                type: 'switch',
                label: 'Distribution Switch',
                description: 'Aggregates access layer switches for a building or zone.',
        },
        accessSwitch: {
                templateId: 'accessSwitch',
                type: 'switch',
                label: 'Access Switch',
                description: 'Connects local endpoints and edge devices.',
        },
        wirelessController: {
                templateId: 'wirelessController',
                type: 'wlc',
                label: 'Wireless LAN Controller',
                description: 'Manages campus wireless access points.',
        },
        accessPoint: {
                templateId: 'accessPoint',
                type: 'ap',
                label: 'Wireless Access Point',
                description: 'Extends Wi-Fi coverage to client devices.',
        },
        server: {
                templateId: 'server',
                type: 'server',
                label: 'Application Server',
                description: 'Hosts campus applications and services.',
        },
        storageArray: {
                templateId: 'storageArray',
                type: 'storage',
                label: 'Storage Array',
                description: 'Centralised repository for backups and files.',
        },
        databaseCluster: {
                templateId: 'databaseCluster',
                type: 'db',
                label: 'Database Cluster',
                description: 'Stores structured academic and administrative data.',
        },
        endpointCluster: {
                templateId: 'endpointCluster',
                type: 'client',
                label: 'Endpoint Devices',
                description: 'User-facing systems accessing network services.',
        }
};

export type DeviceTemplateKey = keyof typeof DEVICE_LIBRARY;
