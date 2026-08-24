import type { CodegenPack, JsxEmitter } from '../../../composer/codegen';
import {
  expr,
  flag,
  LAYOUT_EMITTERS,
  LAYOUT_PRIMITIVE_NAMES,
  num,
  str,
} from '../../../composer/codegen';

/**
 * Volt's JSX codegen pack. Emitters mirror the volt registry render mappings;
 * layout-primitive emitters come from the shared engine.
 */

const IMPORT_SOURCES: Record<string, string[]> = {
  '../components/atoms': [
    'BatteryGlyph', 'Button', 'CodeInput', 'ConnectorIcon', 'FreshnessIndicator',
    'Icon', 'Input', 'PaymentStatusTag', 'PowerText', 'PriceText', 'Skeleton',
    'Spinner', 'StatusBadge', 'Switch', 'Tag',
  ],
  '../components/molecules': [
    'ActiveSessionCard', 'Alert', 'BatteryProgressBar', 'ChargerStatusRow',
    'ConnectorChip', 'DurationSelector', 'EmptyState', 'FilterChip',
    'LineItemList', 'ListRow', 'LocationStatusCard', 'MapPin',
    'PaymentMethodRow', 'PricingTable', 'SegmentedControl', 'SessionStat',
    'StationListCard', 'SupportContextCard', 'Toast', 'WalletBalanceCard',
  ],
  '../components/organisms': [
    'ActiveChargingSession', 'BottomNavBar', 'ScannerFrame', 'StartChargeStepper',
  ],
  './primitives': [...LAYOUT_PRIMITIVE_NAMES, 'ScreenHeader'].sort(),
};

const FIXTURES: Record<string, string> = {
  SAMPLE_STATIONS: '../components/data',
  SAMPLE_PRICE_BANDS: '../components/data',
  SAMPLE_TARIFF_NOTES: '../components/data',
  SAMPLE_SESSION: '../components/data',
  SAMPLE_LOCATIONS: '../components/data',
  SAMPLE_RECEIPT_ITEMS: '../components/data',
  SAMPLE_PHASES: '../components/data',
};

const VOLT_EMITTERS: Record<string, JsxEmitter> = {
  ScreenHeader: (p) => ({
    name: 'ScreenHeader',
    attrs: [
      str('title', p.title),
      ...(p.subtitle ? [str('subtitle', p.subtitle)] : []),
      ...flag('back', p.back),
    ],
    children: [],
  }),
  Button: (p) => ({
    name: 'Button',
    attrs: [
      str('variant', p.variant),
      str('size', p.size),
      ...flag('loading', p.loading),
      ...flag('disabled', p.disabled),
    ],
    children: [String(p.label ?? '')],
  }),
  Alert: (p) => ({
    name: 'Alert',
    attrs: [
      str('tone', p.tone),
      str('title', p.title),
      ...(p.actionLabel
        ? [expr('action', `{ label: ${JSON.stringify(String(p.actionLabel))} }`)]
        : []),
      ...(p.dismissible ? [expr('onDismiss', '() => {}')] : []),
    ],
    children: p.description ? [String(p.description)] : [],
  }),
  Toast: (p) => ({
    name: 'Toast',
    attrs: [
      str('tone', p.tone),
      str('message', p.message),
      ...(p.description ? [str('description', p.description)] : []),
    ],
    children: [],
  }),
  Icon: (p) => ({
    name: 'Icon',
    attrs: [str('name', p.name), num('size', p.size)],
    children: [],
  }),
  StatusBadge: (p) => ({
    name: 'StatusBadge',
    attrs: [
      str('status', p.status),
      str('form', p.form),
      ...(p.form === 'count'
        ? [expr('count', `{ free: ${p.free}, total: ${p.total} }`)]
        : []),
    ],
    children: [],
  }),
  Tag: (p) => ({
    name: 'Tag',
    attrs: [str('tone', p.tone)],
    children: [String(p.label ?? '')],
  }),
  ConnectorIcon: (p) => ({
    name: 'ConnectorIcon',
    attrs: [str('type', p.type), ...flag('muted', p.muted), num('size', p.size)],
    children: [],
  }),
  PowerText: (p) => ({
    name: 'PowerText',
    attrs: [
      num('kw', p.kw),
      ...(p.tier > 0 ? [num('tier', p.tier)] : []),
      ...flag('emphasis', p.emphasis),
    ],
    children: [],
  }),
  PriceText: (p) => ({
    name: 'PriceText',
    attrs: [num('amount', p.amount), str('unit', p.unit), ...flag('emphasis', p.emphasis)],
    children: [],
  }),
  BatteryGlyph: (p) => ({
    name: 'BatteryGlyph',
    attrs: [num('percent', p.percent), ...flag('charging', p.charging)],
    children: [],
  }),
  Input: (p) => ({
    name: 'Input',
    attrs: [
      str('kind', p.kind),
      str('placeholder', p.placeholder),
      ...flag('error', p.error),
      ...flag('disabled', p.disabled),
    ],
    children: [],
  }),
  Switch: (p) => ({
    name: 'Switch',
    attrs: [...flag('defaultChecked', p.checked), ...flag('disabled', p.disabled)],
    children: [],
  }),
  Spinner: (p) => ({ name: 'Spinner', attrs: [str('size', p.size)], children: [] }),
  ConnectorChip: (p) => ({
    name: 'ConnectorChip',
    attrs: [
      str('form', p.form),
      str('type', p.type),
      str('status', p.status),
      num('kw', p.kw),
      num('pricePerKwh', p.pricePerKwh),
      str('stallId', p.stallId),
      ...flag('selected', p.selected),
    ],
    children: [],
  }),
  StationListCard: (p, ctx) => {
    ctx.fixtures.add('SAMPLE_STATIONS');
    return {
      name: 'StationListCard',
      attrs: [expr('station', `SAMPLE_STATIONS[${p.station}]`), str('variant', p.variant)],
      children: [],
    };
  },
  MapPin: (p) => ({
    name: 'MapPin',
    attrs: [
      str('status', p.status),
      ...(p.count > 0 ? [num('count', p.count)] : []),
      ...flag('selected', p.selected),
      ...(p.cluster > 0 ? [num('cluster', p.cluster)] : []),
    ],
    children: [],
  }),
  FilterChip: (p) => ({
    name: 'FilterChip',
    attrs: [...flag('active', p.active), ...(p.count > 0 ? [num('count', p.count)] : [])],
    children: [String(p.label ?? '')],
  }),
  SessionStat: (p) => ({
    name: 'SessionStat',
    attrs: [
      str('form', p.form),
      str('label', p.label),
      str('value', p.value),
      ...(p.unit ? [str('unit', p.unit)] : []),
    ],
    children: [],
  }),
  BatteryProgressBar: (p) => ({
    name: 'BatteryProgressBar',
    attrs: [
      num('percent', p.percent),
      ...(p.limit > 0 ? [num('limit', p.limit)] : []),
      ...flag('charging', p.charging),
    ],
    children: [],
  }),
  PricingTable: (p, ctx) => {
    ctx.fixtures.add('SAMPLE_PRICE_BANDS');
    if (p.notes) ctx.fixtures.add('SAMPLE_TARIFF_NOTES');
    return {
      name: 'PricingTable',
      attrs: [
        expr('bands', 'SAMPLE_PRICE_BANDS'),
        ...flag('showMember', p.showMember),
        ...(p.idleFeePerMin > 0 ? [num('idleFeePerMin', p.idleFeePerMin)] : []),
        ...(p.notes ? [expr('notes', 'SAMPLE_TARIFF_NOTES')] : []),
      ],
      children: [],
    };
  },
  PaymentMethodRow: (p) => ({
    name: 'PaymentMethodRow',
    attrs: [
      str('brand', p.brand),
      ...(p.last4 ? [str('last4', p.last4)] : []),
      ...flag('isDefault', p.isDefault),
    ],
    children: [],
  }),
  ActiveChargingSession: (p, ctx) => {
    ctx.fixtures.add('SAMPLE_SESSION');
    return {
      name: 'ActiveChargingSession',
      attrs: [
        str('archetype', p.archetype),
        str('state', p.state),
        expr('telemetry', String(Boolean(p.telemetry))),
        expr('session', `{ ...SAMPLE_SESSION, soc: ${p.soc}, kw: ${p.kw} }`),
      ],
      children: [],
    };
  },
  StartChargeStepper: (p, ctx) => {
    if (p.vocabulary === 'handshake') ctx.fixtures.add('SAMPLE_PHASES');
    return {
      name: 'StartChargeStepper',
      attrs: [
        num('step', p.step),
        ...(p.vocabulary === 'handshake' ? [expr('steps', 'SAMPLE_PHASES')] : []),
        ...flag('failed', p.failed),
      ],
      children: [],
    };
  },
  CodeInput: (p) => ({
    name: 'CodeInput',
    attrs: [
      num('length', p.length),
      str('mode', p.mode),
      ...(p.value ? [str('value', p.value)] : []),
      ...flag('error', p.error),
      ...flag('disabled', p.disabled),
    ],
    children: [],
  }),
  FreshnessIndicator: (p) => ({
    name: 'FreshnessIndicator',
    attrs: [str('state', p.state), str('label', p.label)],
    children: [],
  }),
  PaymentStatusTag: (p) => ({
    name: 'PaymentStatusTag',
    attrs: [str('status', p.status)],
    children: [],
  }),
  Skeleton: (p) => ({
    name: 'Skeleton',
    attrs: [str('shape', p.shape), ...(p.width > 0 ? [num('width', p.width)] : [])],
    children: [],
  }),
  ListRow: (p) => ({
    name: 'ListRow',
    attrs: [
      str('icon', p.icon),
      str('label', p.label),
      ...(p.description ? [str('description', p.description)] : []),
      ...(p.trailing === 'none' ? [str('trailing', 'none')] : []),
      ...flag('destructive', p.destructive),
      expr('onClick', '() => {}'),
    ],
    children: [],
  }),
  SegmentedControl: (p) => {
    const labels = String(p.labels ?? '')
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean);
    const options = labels
      .map((l) => `{ label: ${JSON.stringify(l)}, value: ${JSON.stringify(l)} }`)
      .join(', ');
    const value = labels[p.activeIndex] ?? labels[0] ?? '';
    return {
      name: 'SegmentedControl',
      attrs: [expr('options', `[${options}]`), str('value', value)],
      children: [],
    };
  },
  LocationStatusCard: (p, ctx) => {
    ctx.fixtures.add('SAMPLE_LOCATIONS');
    return {
      name: 'LocationStatusCard',
      attrs: [expr('location', `SAMPLE_LOCATIONS[${p.location}]`)],
      children: [],
    };
  },
  ChargerStatusRow: (p) => ({
    name: 'ChargerStatusRow',
    attrs: [
      str('code', p.code),
      str('status', p.status),
      ...(p.kw > 0 ? [num('kw', p.kw)] : []),
      str('connector', p.connector),
      ...(p.freshnessLabel
        ? [str('freshness', p.freshness), str('freshnessLabel', p.freshnessLabel)]
        : []),
    ],
    children: [],
  }),
  EmptyState: (p) => ({
    name: 'EmptyState',
    attrs: [
      str('icon', p.icon),
      str('title', p.title),
      ...(p.body ? [str('body', p.body)] : []),
      ...(p.actionLabel
        ? [expr('action', `{ label: ${JSON.stringify(String(p.actionLabel))} }`)]
        : []),
    ],
    children: [],
  }),
  ActiveSessionCard: (p, ctx) => {
    ctx.fixtures.add('SAMPLE_SESSION');
    return {
      name: 'ActiveSessionCard',
      attrs: [expr('session', 'SAMPLE_SESSION'), str('state', p.state)],
      children: [],
    };
  },
  DurationSelector: (p) => ({
    name: 'DurationSelector',
    attrs: [num('value', p.value), ...(p.helper ? [str('helper', p.helper)] : [])],
    children: [],
  }),
  WalletBalanceCard: (p) => ({
    name: 'WalletBalanceCard',
    attrs: [
      num('balance', p.balance),
      ...(p.required > 0 ? [num('required', p.required)] : []),
      str('state', p.state),
    ],
    children: [],
  }),
  LineItemList: (p, ctx) => {
    ctx.fixtures.add('SAMPLE_RECEIPT_ITEMS');
    return {
      name: 'LineItemList',
      attrs: [
        expr('items', 'SAMPLE_RECEIPT_ITEMS'),
        ...(p.showMeta
          ? [expr('meta', `['Session #VD-20260713-0412', 'Charger LKV-B2']`)]
          : []),
      ],
      children: [],
    };
  },
  SupportContextCard: (p) => ({
    name: 'SupportContextCard',
    attrs: [
      str('title', p.title),
      expr('action', `{ label: ${JSON.stringify(String(p.actionLabel ?? ''))} }`),
    ],
    children: [],
  }),
  BottomNavBar: (p) => {
    const items =
      p.layout === 'scan-center'
        ? `[{ id: 'home', icon: 'home', label: 'Home' }, { id: 'history', icon: 'receipt', label: 'Records' }]`
        : `[{ id: 'home', icon: 'home', label: 'Home' }, { id: 'history', icon: 'receipt', label: 'Records' }, { id: 'profile', icon: 'user', label: 'Profile' }]`;
    return {
      name: 'BottomNavBar',
      attrs: [
        expr('items', items),
        str('activeId', p.activeId),
        ...(p.layout === 'scan-center'
          ? [expr('centerAction', `{ icon: 'qr-code', label: 'Scan' }`)]
          : []),
      ],
      children: [],
    };
  },
  ScannerFrame: (p) => ({
    name: 'ScannerFrame',
    attrs: [
      str('state', p.state),
      str('instruction', p.instruction),
      ...flag('torchOn', p.torch),
      expr('onManualCode', '() => {}'),
    ],
    children: [],
  }),
};

export const VOLT_CODEGEN: CodegenPack = {
  emitters: { ...LAYOUT_EMITTERS, ...VOLT_EMITTERS },
  importSources: IMPORT_SOURCES,
  fixtures: FIXTURES,
};
