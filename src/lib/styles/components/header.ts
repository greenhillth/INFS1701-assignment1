import { tw } from '$lib/utils/tw';
import { LAYOUT } from '../layouts';
import { TOKENS } from '../tokens';

export const HEADER = {
  container: tw(LAYOUT.header.container, TOKENS.surface.header),
  hero: LAYOUT.hero.cluster,
  brand: TOKENS.surface.brandChip,
  brandName: TOKENS.text.brandName,
  brandLogo: 'h-12 w-12 object-contain',
  copy: LAYOUT.hero.copy,
  title: TOKENS.text.heroTitle,
  blurb: TOKENS.text.heroBlurb,
  panel: tw(LAYOUT.panel.shell, TOKENS.surface.controlPanel),
  modeGroup: LAYOUT.panel.modeGroup,
  modeLabel: TOKENS.text.headerLabel,
  modeToggle: TOKENS.controls.toggleBase,
  modeOption: TOKENS.controls.toggleOption,
  modeThumb: TOKENS.controls.toggleThumb,
  exportButton: TOKENS.buttons.export,
  shareButton: TOKENS.buttons.shareBase
} as const;

export const HEADER_STATE = {
  modeDefault: TOKENS.controls.toggleDefaultLabel,
  modeDimmed: TOKENS.controls.toggleDimmedLabel,
  modeEpic: TOKENS.controls.toggleEpicLabel,
  modeEpicInactive: TOKENS.controls.toggleInactiveEpic,
  shareSuccess: TOKENS.buttons.shareSuccess,
  shareError: TOKENS.buttons.shareError,
  thumbDefault: 'translate-x-0',
  thumbEpic: 'translate-x-[calc(100%+0.5rem)]'
} as const;
