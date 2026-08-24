import type { ConnectorType, Freshness } from './atoms';
import type { ChargerStatus } from './status';

export type { Freshness };
export { SAMPLE_TARIFF_NOTES } from './tariffs';

/** Sample fixtures for the playground showcases. */

export interface StationConnector {
  type: ConnectorType;
  kw: number;
  status: ChargerStatus;
  pricePerKwh?: number;
  stallId: string;
}

export interface StationData {
  id: string;
  name: string;
  network: string;
  distanceKm: number;
  address: string;
  status: ChargerStatus;
  free: number;
  total: number;
  maxKw: number;
  pricePerKwh: number;
  tier: 1 | 2 | 3;
  amenities: string[];
  connectors: StationConnector[];
}

export const SAMPLE_STATIONS: StationData[] = [
  {
    id: 'st-1',
    name: 'Riverside Supercharge Hub',
    network: 'VoltGrid',
    distanceKm: 1.2,
    address: '18 Riverside Drive',
    status: 'available',
    free: 4,
    total: 6,
    maxKw: 300,
    pricePerKwh: 0.48,
    tier: 3,
    amenities: ['Restrooms', 'Coffee', 'Wi-Fi'],
    connectors: [
      { type: 'ccs2', kw: 300, status: 'available', pricePerKwh: 0.48, stallId: 'A1' },
      { type: 'ccs2', kw: 300, status: 'charging', pricePerKwh: 0.48, stallId: 'A2' },
      { type: 'chademo', kw: 50, status: 'available', pricePerKwh: 0.42, stallId: 'B1' },
      { type: 'type2', kw: 22, status: 'occupied', pricePerKwh: 0.32, stallId: 'C1' },
    ],
  },
  {
    id: 'st-2',
    name: 'Central Mall Parking L2',
    network: 'ChargeNow',
    distanceKm: 3.8,
    address: '2 Mall Loop, Level P2',
    status: 'occupied',
    free: 0,
    total: 4,
    maxKw: 22,
    pricePerKwh: 0.29,
    tier: 1,
    amenities: ['Shopping', 'Food'],
    connectors: [
      { type: 'type2', kw: 22, status: 'occupied', pricePerKwh: 0.29, stallId: '1' },
      { type: 'type2', kw: 22, status: 'occupied', pricePerKwh: 0.29, stallId: '2' },
    ],
  },
  {
    id: 'st-3',
    name: 'Highway 7 Rest Stop',
    network: 'VoltGrid',
    distanceKm: 12.4,
    address: 'Exit 23, Highway 7',
    status: 'faulted',
    free: 0,
    total: 2,
    maxKw: 150,
    pricePerKwh: 0.52,
    tier: 2,
    amenities: ['Restrooms', '24/7'],
    connectors: [
      { type: 'ccs2', kw: 150, status: 'faulted', pricePerKwh: 0.52, stallId: '1A' },
      { type: 'nacs', kw: 150, status: 'faulted', pricePerKwh: 0.52, stallId: '1B' },
    ],
  },
];

export interface SessionData {
  stationName: string;
  stallId: string;
  connector: ConnectorType;
  /** State of charge – undefined when the vehicle reports no telemetry. */
  soc?: number;
  targetSoc?: number;
  kw: number;
  kwhDelivered: number;
  costAccrued: number;
  minutesElapsed: number;
  minutesToTarget?: number;
  rangeAddedKm?: number;
}

export const SAMPLE_SESSION: SessionData = {
  stationName: 'Riverside Supercharge Hub',
  stallId: 'A2',
  connector: 'ccs2',
  soc: 64,
  targetSoc: 80,
  kw: 187,
  kwhDelivered: 32.4,
  costAccrued: 15.55,
  minutesElapsed: 18,
  minutesToTarget: 12,
  rangeAddedKm: 210,
};

export interface PriceBand {
  label: string;
  window?: string;
  perKwh: number;
  memberPerKwh?: number;
}

export const SAMPLE_PRICE_BANDS: PriceBand[] = [
  { label: 'Off-peak', window: '00:00–07:00', perKwh: 0.32, memberPerKwh: 0.26 },
  { label: 'Standard', window: '07:00–17:00', perKwh: 0.48, memberPerKwh: 0.4 },
  { label: 'Peak', window: '17:00–21:00', perKwh: 0.6, memberPerKwh: 0.5 },
];

export interface ChargerInfo {
  code: string;
  status: ChargerStatus;
  kw?: number;
  connector?: ConnectorType;
}

/** A previously scanned community location (home status surface). */
export interface LocationData {
  id: string;
  name: string;
  address?: string;
  free: number;
  total: number;
  freshness: Freshness;
  updatedLabel: string;
  chargers: ChargerInfo[];
}

export const SAMPLE_LOCATIONS: LocationData[] = [
  {
    id: 'loc-1',
    name: 'Lakeview Residency — Tower B',
    address: 'Basement P1, visitor bay',
    free: 2,
    total: 4,
    freshness: 'fresh',
    updatedLabel: 'Updated 2 min ago',
    chargers: [
      { code: 'LKV-B1', status: 'available', kw: 7.4, connector: 'type2' },
      { code: 'LKV-B2', status: 'available', kw: 7.4, connector: 'type2' },
      { code: 'LKV-B3', status: 'in-use', kw: 7.4, connector: 'type2' },
      { code: 'LKV-B4', status: 'maintenance', kw: 7.4, connector: 'type2' },
    ],
  },
  {
    id: 'loc-2',
    name: 'Orchid RWA Community Lot',
    free: 0,
    total: 2,
    freshness: 'stale',
    updatedLabel: 'Updated 40 min ago',
    chargers: [
      { code: 'ORC-01', status: 'in-use', kw: 3.3, connector: 'type2' },
      { code: 'ORC-02', status: 'offline', kw: 3.3, connector: 'type2' },
    ],
  },
  {
    id: 'loc-3',
    name: 'Ownpath Workspace Garage',
    address: 'Level 2, bays 14–15',
    free: 0,
    total: 2,
    freshness: 'unknown',
    updatedLabel: 'Status unavailable',
    chargers: [
      { code: 'OWP-14', status: 'unknown' },
      { code: 'OWP-15', status: 'unknown' },
    ],
  },
];

export interface WalletData {
  balance: number;
  /** Conservative upper-bound for the selected duration × charger max kW. */
  required: number;
  currency: string;
}

export const SAMPLE_WALLET: WalletData = {
  balance: 18.5,
  required: 12.6,
  currency: '$',
};

export interface ReceiptItem {
  label: string;
  value: string;
  emphasis?: boolean;
}

export const SAMPLE_RECEIPT_ITEMS: ReceiptItem[] = [
  { label: 'Energy delivered', value: '9.6 kWh × $0.32' },
  { label: 'Energy charge', value: '$3.07' },
  { label: 'Session fee', value: '$0.50' },
  { label: 'Total billed', value: '$3.57', emphasis: true },
];

/** PRD start-handshake vocabulary for the parameterized stepper. */
export const SAMPLE_PHASES = [
  'Start initiated',
  'Command sent',
  'Session started',
  'Charging',
];
