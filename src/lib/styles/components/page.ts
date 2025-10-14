import { tw } from '$lib/utils/tw';
import { LAYOUT } from '../layouts';
import { TOKENS } from '../tokens';

export const PAGE = {
  root: tw('page', LAYOUT.page.viewport, TOKENS.surface.page),
  inner: tw(LAYOUT.page.frame, LAYOUT.page.padding),
  innerBottom: tw(LAYOUT.page.frame, LAYOUT.page.paddingBottom),
  footer: tw('page__footer', LAYOUT.footer.content, TOKENS.text.footer),
  footerLink: TOKENS.text.footerLink
} as const;
