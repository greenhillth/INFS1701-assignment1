export const LAYOUT = {
  page: {
    viewport: 'min-h-screen',
    frame: 'mx-auto w-full max-w-[96rem]',
    padding: 'px-6 py-12 sm:px-10 sm:py-14 lg:px-14',
    paddingBottom: 'px-6 pb-16 pt-8 sm:px-10 lg:px-14'
  },
  header: {
    container:
      'mb-8 grid gap-6 px-8 py-[1.75rem] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-10 max-[40rem]:p-6'
  },
  hero: {
    cluster: 'flex flex-wrap items-center gap-5 lg:col-start-1 lg:row-start-1',
    copy: 'flex min-w-[15rem] flex-col gap-[0.4rem]'
  },
  panel: {
    shell:
      'w-full sm:w-[20rem] lg:col-start-2 lg:row-start-1 lg:justify-self-end lg:self-start flex flex-col gap-[0.85rem] p-4',
    modeGroup: 'flex flex-col gap-[0.4rem]'
  },
  legend: {
    section: 'mt-8 px-6 py-8 md:px-8 md:py-9',
    grid: 'grid w-full gap-6 [grid-template-columns:repeat(auto-fill,minmax(20rem,1fr))]',
    title: 'col-span-full'
  },
  cards: {
    base: 'w-full max-w-none flex flex-col gap-4 p-5'
  },
  lists: {
    zoneList: 'flex flex-col gap-3',
    zoneChips: 'grid gap-2.5 [grid-template-columns:repeat(auto-fit,minmax(12rem,1fr))]',
    trustList: 'grid gap-2',
    trustRow: 'grid grid-cols-[6.5rem_1fr] items-start gap-3 text-left',
    deviceGroups: 'space-y-4',
    deviceGroup: 'flex flex-col gap-2.5',
    deviceGrid: 'grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(8rem,1fr))]',
    deviceItem: 'flex items-center gap-2',
    netList: 'flex flex-col gap-3.5',
    netItem: 'flex flex-wrap items-center gap-3',
    rangeGroup: 'inline-flex flex-wrap items-center gap-[0.45rem]',
    zoneHint: 'flex items-center gap-[0.7rem]'
  },
  diagram: {
    outer: 'w-full px-4 pb-12 sm:px-8 lg:px-12 xl:px-16',
    inner: 'w-full',
    frame: 'relative mx-auto max-w-6xl p-6',
    canvas: 'relative w-full p-6'
  },
  footer: {
    inner: 'mx-auto w-full max-w-[96rem] px-6 pb-16 pt-8 sm:px-10 lg:px-14',
    content: 'mt-12 text-center'
  },
  landing: {
    viewport:
      'min-h-screen grid place-items-center gap-10 px-6 py-12 sm:py-16 md:py-20 lg:py-24 sm:px-10 lg:px-20',
    hero: 'max-w-3xl text-center space-y-6',
    ctaRow: 'flex flex-col items-center gap-3 sm:flex-row sm:justify-center',
    tipCard: 'max-w-2xl p-6 text-center leading-relaxed',
    projectsSection: 'grid w-full max-w-[1080px] gap-8',
    projectsIntro: 'grid gap-3 text-center',
    projectsIntroCopy: 'mx-auto max-w-[52ch]',
    projectGrid: 'grid gap-6 md:grid-cols-3',
    projectCard: 'grid min-h-[220px] gap-3 p-6 text-left'
  }
} as const;
