import { tw } from '$lib/utils/tw';
import { LAYOUT } from '../layouts';
import { TOKENS } from '../tokens';

export const LANDING = {
  root: tw(LAYOUT.landing.viewport, TOKENS.surface.landing),
  hero: LAYOUT.landing.hero,
  tagline: TOKENS.text.homeTagline,
  title: TOKENS.text.homeTitle,
  lead: TOKENS.text.homeLead,
  ctaRow: LAYOUT.landing.ctaRow,
  ctaPrimary: TOKENS.buttons.ctaPrimary,
  ctaLink: TOKENS.buttons.ctaLink,
  tipCard: tw(LAYOUT.landing.tipCard, TOKENS.surface.darkCard, 'text-slate-200/90'),
  tipCopy: 'text-base',
  projectsSection: LAYOUT.landing.projectsSection,
  projectsIntro: LAYOUT.landing.projectsIntro,
  projectsHeading: TOKENS.text.homeProjectsHeading,
  projectsCopy: tw(LAYOUT.landing.projectsIntroCopy, TOKENS.text.homeProjectsIntro),
  projectGrid: LAYOUT.landing.projectGrid,
  projectCard: tw(LAYOUT.landing.projectCard, TOKENS.surface.darkCard),
  projectTitle: TOKENS.text.homeProjectTitle,
  projectCopy: TOKENS.text.homeProjectCopy,
  placeholder: TOKENS.surface.placeholderPill
} as const;
