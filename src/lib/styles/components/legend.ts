import { tw } from '$lib/utils/tw';
import { LAYOUT } from '../layouts';
import { TOKENS, TRUST_BADGE_COLORS } from '../tokens';

export const LEGEND = {
  section: tw(LAYOUT.legend.section, TOKENS.surface.legendShell),
  grid: tw(LAYOUT.legend.grid, TOKENS.text.legendBody),
  title: tw(LAYOUT.legend.title, TOKENS.text.uppercaseSm),
  card: tw(LAYOUT.cards.base, TOKENS.surface.legendCard),
  heading: TOKENS.text.cardHeading,
  zoneList: LAYOUT.lists.zoneList,
  zoneChips: LAYOUT.lists.zoneChips,
  zoneChip: TOKENS.surface.zoneChip,
  zoneLabel: TOKENS.text.zoneLabel,
  trustList: LAYOUT.lists.trustList,
  trustRow: tw(LAYOUT.lists.trustRow, TOKENS.text.cardCopy),
  trustCopy: tw(TOKENS.utility.noMargin, TOKENS.text.cardCopy),
  trustBadge: TOKENS.badges.trustBase,
  trustColors: TRUST_BADGE_COLORS,
  zoneHint: tw(LAYOUT.lists.zoneHint, TOKENS.text.zoneHint),
  zoneHintDot: TOKENS.badges.legendHintDot,
  deviceGroups: LAYOUT.lists.deviceGroups,
  deviceGroup: LAYOUT.lists.deviceGroup,
  deviceGroupTitle: TOKENS.text.cardHeading,
  deviceGrid: LAYOUT.lists.deviceGrid,
  deviceItem: LAYOUT.lists.deviceItem,
  deviceLabel: TOKENS.text.deviceLabel,
  netList: LAYOUT.lists.netList,
  netItem: LAYOUT.lists.netItem,
  rangeGroup: LAYOUT.lists.rangeGroup,
  netDividerSolid: TOKENS.legend.dividerSolid,
  netDividerDashed: TOKENS.legend.dividerDashed,
  netRange: TOKENS.badges.networkRange,
  lockWrapper: TOKENS.legend.lockIconWrapper,
  lockArc: TOKENS.legend.lockArc,
  lockBody: TOKENS.legend.lockBody
} as const;
