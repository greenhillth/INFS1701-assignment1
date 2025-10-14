import { tw } from '$lib/utils/tw';

export const TOKENS = {
  surface: {
    page: tw('bg-page-gradient', 'text-slate-100'),
    header: tw(
      'rounded-[1.25rem]',
      'border border-[rgba(148,163,184,0.45)]',
      'bg-header-gradient',
      'text-[#0b1f33]',
      'shadow-header-panel'
    ),
    controlPanel: tw(
      'rounded-[1rem]',
      'border border-[rgba(15,23,42,0.35)]',
      'bg-control-panel',
      'shadow-control-panel'
    ),
    legendShell: tw('rounded-[1.5rem]', 'border border-slate-500/25', 'bg-legend-shell', 'shadow-legend-shell'),
    legendCard: tw(
      'rounded-[1.25rem]',
      'border border-slate-500/24',
      'bg-legend-card',
      'shadow-legend-card',
      'backdrop-blur-[6px]'
    ),
    darkCard: tw('rounded-2xl', 'border border-slate-500/25', 'bg-slate-900/65', 'shadow-card'),
    diagramFrame: tw('rounded-[2rem]', 'border border-slate-500/20', 'bg-slate-900/60', 'shadow-diagram-frame'),
    diagramCanvas: tw('rounded-2xl', 'bg-diagram-canvas'),
    brandChip: tw(
      'inline-flex items-center gap-[0.85rem]',
      'px-[0.85rem] py-[0.35rem]',
      'rounded-full',
      'border border-[rgba(255,255,255,0.45)]',
      'bg-[rgba(255,255,255,0.5)]',
      'backdrop-blur-[8px]',
      'max-[40rem]:w-full',
      'max-[40rem]:justify-center'
    ),
    zoneChip: tw(
      'inline-flex items-center gap-[0.55rem]',
      'rounded-full',
      'border border-slate-500/30',
      'bg-zone-chip',
      'px-[0.75rem] py-[0.4rem]',
      'shadow-zone-chip'
    ),
    placeholderPill: tw(
      'inline-flex w-fit items-center rounded-full',
      'bg-placeholder-pill px-3 py-1',
      'text-xs font-semibold uppercase tracking-[0.08em] text-emerald-400'
    ),
    landing: tw(
      'bg-[#020617]',
      'text-slate-200',
      '[background-image:radial-gradient(circle_at_top_right,rgba(56,189,248,0.1),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.12),transparent_50%)]'
    )
  },
  text: {
    brandName: 'text-[1.5rem] font-bold tracking-[-0.01em] text-inherit [text-shadow:0_1px_0_rgba(255,255,255,0.35)]',
    heroTitle: 'm-0 text-[1.95rem] font-bold tracking-[-0.015em] text-[#0b1f33]',
    heroBlurb: 'm-0 text-[0.95rem] leading-[1.5] text-[rgba(15,23,42,0.75)] max-w-[clamp(22rem,50vw,32rem)]',
    headerLabel: 'text-[0.75rem] uppercase tracking-[0.08em] text-[rgba(226,232,240,0.75)]',
    uppercaseXs: 'text-xs font-semibold uppercase tracking-[0.08em] text-slate-300/95',
    uppercaseSm: 'text-sm font-semibold uppercase tracking-[0.08em] text-slate-300/90',
    legendBody: 'text-xs text-slate-200/85',
    zoneLabel: 'text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-slate-100/90',
    cardCopy: 'text-[0.72rem] leading-relaxed text-slate-200/80',
    zoneHint: 'text-[0.72rem] leading-relaxed text-slate-200/70',
    deviceLabel: 'text-[0.74rem] text-slate-200/90',
    footer: 'text-xs text-slate-400/70',
    footerLink: 'text-slate-300 hover:text-slate-100 focus-visible:text-slate-100',
    homeTagline: 'text-sm uppercase tracking-[0.12em] font-semibold text-slate-400/85',
    homeTitle: 'text-4xl sm:text-5xl font-bold text-slate-50',
    homeLead: 'text-lg leading-relaxed text-slate-200/90',
    homeProjectsIntro: 'text-base leading-relaxed text-slate-200/80',
    homeProjectsHeading: 'text-3xl font-semibold text-slate-50 sm:text-4xl',
    homeProjectTitle: 'text-xl font-semibold text-slate-100',
    homeProjectCopy: 'leading-relaxed text-slate-200/85',
    cardHeading: 'text-xs font-semibold uppercase tracking-[0.08em] text-slate-300/95',
    sectionTitle: 'mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-slate-200/90'
  },
  controls: {
    toggleBase: tw(
      'relative grid grid-cols-2 items-center',
      'p-[0.4rem] rounded-full',
      'border border-[rgba(148,163,184,0.35)]',
      'bg-[rgba(15,23,42,0.65)]',
      'text-[rgba(226,232,240,0.85)] text-[0.8rem] font-medium tracking-[0.02em]',
      'transition-[border-color,background,box-shadow] duration-150',
      'hover:border-[rgba(148,163,184,0.55)] hover:bg-[rgba(30,41,59,0.75)]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(96,165,250,0.8)]'
    ),
    toggleOption:
      'relative z-[2] flex items-center justify-center gap-[0.2rem] px-[0.3rem] py-[0.15rem] uppercase tracking-[0.08em] select-none',
    toggleThumb:
      'pointer-events-none absolute inset-y-[0.25rem] left-[0.25rem] w-[calc(50%-0.5rem)] rounded-full bg-[linear-gradient(135deg,rgba(59,130,246,0.35),rgba(59,130,246,0.70))] shadow-[0_12px_22px_rgba(59,130,246,0.35)] transform transition-transform duration-200',
    toggleDefaultLabel: 'text-[rgba(226,232,240,0.85)]',
    toggleDimmedLabel: 'text-[rgba(226,232,240,0.60)]',
    toggleEpicLabel: 'text-[rgba(244,114,182,0.90)]',
    toggleInactiveEpic: 'text-[rgba(226,232,240,0.68)]'
  },
  buttons: {
    export: [
      'inline-flex items-center justify-center gap-[0.4rem]',
      'px-[1.1rem] py-[0.55rem] rounded-[0.9rem]',
      'border border-[rgba(148,163,184,0.35)]',
      'bg-[linear-gradient(135deg,rgba(59,130,246,0.18),rgba(14,116,144,0.28))]',
      'text-[rgba(191,219,254,0.92)] text-[0.82rem] font-semibold uppercase tracking-[0.04em]',
      'transition-[transform,box-shadow,border-color,background] duration-150',
      'hover:-translate-y-px hover:border-[rgba(148,163,184,0.60)]',
      'hover:bg-[linear-gradient(135deg,rgba(59,130,246,0.26),rgba(14,116,144,0.40))]',
      'hover:shadow-[0_12px_25px_rgba(59,130,246,0.25)]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(96,165,250,0.8)]',
      'disabled:opacity-65 disabled:cursor-wait disabled:shadow-none'
    ].join(' '),
    shareBase: [
      'inline-flex items-center justify-center',
      'px-[1.1rem] py-[0.6rem] rounded-[0.85rem] uppercase',
      'border bg-[rgba(15,23,42,0.70)]',
      'text-[0.8rem] font-semibold tracking-[0.02em]',
      'border-[rgba(96,165,250,0.55)] text-[rgba(191,219,254,0.95)]',
      'transition-[transform,box-shadow,border-color,color] duration-150',
      'hover:-translate-y-px hover:border-[rgba(56,189,248,0.85)] hover:text-[rgb(224,242,254)]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(56,189,248,0.85)]'
    ].join(' '),
    shareSuccess:
      'border-[rgba(74,222,128,0.80)] text-[rgba(187,247,208,0.95)] shadow-[0_10px_22px_rgba(74,222,128,0.25)]',
    shareError:
      'border-[rgba(248,113,113,0.85)] text-[rgba(254,202,202,0.95)] shadow-[0_10px_22px_rgba(248,113,113,0.35)]',
    ctaPrimary: [
      'inline-flex items-center justify-center gap-2',
      'rounded-full bg-gradient-to-r from-sky-400 to-emerald-400',
      'px-8 py-3 font-semibold text-slate-900',
      'shadow-[0_12px_30px_rgba(56,189,248,0.35)]',
      'transition duration-200 ease-out',
      'hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(74,222,128,0.35)]',
      'focus-visible:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70'
    ].join(' '),
    ctaLink:
      'text-sm font-medium text-slate-400/95 border-b border-slate-400/40 pb-1 hover:text-slate-100 hover:border-slate-100 focus-visible:text-slate-100 focus-visible:border-slate-100 focus-visible:outline-none'
  },
  badges: {
    trustBase:
      'inline-flex w-fit items-center rounded-full border px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.08em] shadow-[0_10px_24px_rgba(15,23,42,0.32)]',
    trustNone:
      'border-rose-400/60 bg-[linear-gradient(135deg,rgba(248,113,113,0.22),rgba(190,24,93,0.18))] text-rose-200/95',
    trustLow:
      'border-amber-300/60 bg-[linear-gradient(135deg,rgba(251,191,36,0.24),rgba(217,119,6,0.2))] text-amber-100/95',
    trustHigh:
      'border-emerald-400/65 bg-[linear-gradient(135deg,rgba(52,211,153,0.26),rgba(22,163,74,0.2))] text-emerald-200/95',
    legendHintDot:
      'inline-block h-4 w-7 rounded-full border-2 border-yellow-300/75 bg-[linear-gradient(160deg,rgba(253,224,71,0.16),rgba(15,23,42,0.6))] shadow-[0_0_0_2px_rgba(253,224,71,0.3),0_0_18px_rgba(253,224,71,0.35)]',
    networkRange:
      'inline-flex items-center justify-center rounded-md border border-teal-200/40 bg-teal-900/20 px-[0.55rem] py-[0.25rem] font-mono text-[0.68rem] text-teal-100/90'
  },
  legend: {
    dividerSolid: 'inline-block h-0.5 w-12 rounded-full bg-slate-400/70',
    dividerDashed: 'inline-block w-12 border-b border-dashed border-sky-300/85',
    lockIconWrapper: 'relative flex h-3.5 w-4 items-center justify-center',
    lockArc: 'absolute -top-2 h-2 w-4 rounded-t-full border-2 border-teal-300/70 border-b-0',
    lockBody: 'block h-3.5 w-4 rounded-[0.2rem] border-2 border-teal-300/70'
  },
  utility: {
    nonSelectable: 'select-none',
    noMargin: 'm-0'
  }
} as const;

export const TRUST_BADGE_COLORS = {
  none: TOKENS.badges.trustNone,
  low: TOKENS.badges.trustLow,
  high: TOKENS.badges.trustHigh
} as const;
