<script lang="ts">
  import { onDestroy } from 'svelte';
  import { fromStore } from 'svelte/store';
  import { page } from '$app/stores';
  import { iconSet, type IconSet } from '$lib/stores/iconSet';
  import Icon from '$lib/components/Icon.svelte';
  import FlowCanvas from '$lib/topology/FlowCanvas.svelte';
  import { layout } from '$lib/topology/layouts/highschool';
  import { PAGE } from '$lib/styles/components/page';
  import { HEADER, HEADER_STATE } from '$lib/styles/components/header';
  import { LEGEND } from '$lib/styles/components/legend';
  import { DIAGRAM } from '$lib/styles/components/diagram';
  import { tw } from '$lib/utils/tw';
  import type { NodeType, TrustLevel } from '$lib/topology/types';

  const iconSetState = fromStore(iconSet);
  const pageState = fromStore(page);
  let flowCanvasComponent: FlowCanvas | null = null;
  let diagramFrameElement: HTMLDivElement | null = null;
  let exporting = $state(false);
  const isEpic = $derived(iconSetState.current === 'crayon');
  let copyStatus = $state<'idle' | 'copied' | 'error'>('idle');
  let copyTimeout: ReturnType<typeof setTimeout> | null = null;
  const shareLabel = $derived(
    copyStatus === 'copied' ? 'Link copied!' : copyStatus === 'error' ? 'Copy failed' : 'Copy share link'
  );
  const shareButtonClass = () =>
    tw(
      HEADER.shareButton,
      copyStatus === 'copied' && HEADER_STATE.shareSuccess,
      copyStatus === 'error' && HEADER_STATE.shareError
    );

  const zoneLegendOrder = ['edge', 'core', 'admin', 'classrooms', 'dc'] as const;
  const zoneLegendEntries = zoneLegendOrder
    .map((id) => layout.zones.find((zone) => zone.id === id))
    .filter((zone): zone is (typeof layout.zones)[number] => Boolean(zone));

  const TRUST_LABELS: Record<TrustLevel, string> = {
    none: 'No Trust',
    low: 'Low Trust',
    high: 'High Trust'
  };

  const trustLegend: Array<{ level: TrustLevel; copy: string }> = [
    {
      level: 'none',
      copy: 'Internet-facing or guest segments assumed untrusted until filtered by edge security.'
    },
    {
      level: 'low',
      copy: 'User access networks with limited privileges and monitoring to contain compromise.'
    },
    {
      level: 'high',
      copy: 'Core infrastructure and data centre workloads with strict controls and least privilege.'
    }
  ];
  /* ====== lifecycle / actions ====== */
  const EXPORT_BACKGROUND = '#01010a';

  $effect(() => {
    const q = pageState.current.url.searchParams.get('icons') as IconSet | null;
    if ((q === 'affinity' || q === 'crayon') && iconSetState.current !== q) {
      iconSetState.current = q;
    }
  });

  onDestroy(() => {
    if (copyTimeout) clearTimeout(copyTimeout);
  });

  function setMode(mode: IconSet) {
    if (iconSetState.current !== mode) iconSetState.current = mode;
  }
  function toggleMode() {
    setMode(iconSetState.current === 'crayon' ? 'affinity' : 'crayon');
  }

  async function exportCanvas() {
    if (typeof window === 'undefined') return;

    const exportElement = diagramFrameElement ?? flowCanvasComponent?.getCanvasElement?.();
    if (!exportElement) return;

    let exportTarget: HTMLElement = exportElement;
    let cleanup: (() => void) | null = null;
    let targetWidth: number | undefined;
    let targetHeight: number | undefined;

    if (exportElement === diagramFrameElement && exportElement.isConnected) {
      const rect = exportElement.getBoundingClientRect();
      const clone = exportElement.cloneNode(true) as HTMLElement;
      clone.style.margin = '0';
      clone.style.maxWidth = 'none';
      clone.style.width = `${rect.width}px`;
      clone.style.height = `${rect.height}px`;
      clone.style.boxSizing = 'border-box';

      const wrapper = document.createElement('div');
      wrapper.style.position = 'fixed';
      wrapper.style.inset = '0';
      wrapper.style.pointerEvents = 'none';
      wrapper.style.opacity = '0';
      wrapper.style.zIndex = '-1';

      const pageElement = document.querySelector('.page') as HTMLElement | null;
      const pageStyle = pageElement ? window.getComputedStyle(pageElement) : null;
      const backgroundContainer = document.createElement('div');
      backgroundContainer.style.display = 'inline-block';
      backgroundContainer.style.width = `${rect.width}px`;
      backgroundContainer.style.height = `${rect.height}px`;
      backgroundContainer.style.margin = '0';
      backgroundContainer.style.backgroundColor = EXPORT_BACKGROUND;

      if (pageStyle) {
        const backgroundImage = pageStyle.backgroundImage;
        if (backgroundImage && backgroundImage !== 'none') {
          backgroundContainer.style.backgroundImage = backgroundImage;
          backgroundContainer.style.backgroundPosition = pageStyle.backgroundPosition;
          backgroundContainer.style.backgroundSize = pageStyle.backgroundSize;
          backgroundContainer.style.backgroundRepeat = pageStyle.backgroundRepeat;
        }
      }

      backgroundContainer.appendChild(clone);
      wrapper.appendChild(backgroundContainer);
      document.body.appendChild(wrapper);

      exportTarget = backgroundContainer;
      targetWidth = rect.width;
      targetHeight = rect.height;
      cleanup = () => document.body.removeChild(wrapper);
    }

    const exportOptions: {
      cacheBust: boolean;
      pixelRatio: number;
      width?: number;
      height?: number;
      backgroundColor?: string;
    } = {
      cacheBust: true,
      pixelRatio: window.devicePixelRatio ?? 1,
      backgroundColor: EXPORT_BACKGROUND
    };
    if (targetWidth) exportOptions.width = targetWidth;
    if (targetHeight) exportOptions.height = targetHeight;

    exporting = true;
    let previousBackgroundColor: string | null = null;
    if (exportTarget instanceof HTMLElement && exportTarget.style) {
      previousBackgroundColor = exportTarget.style.backgroundColor ?? null;
      exportTarget.style.backgroundColor = EXPORT_BACKGROUND;
    }

    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(exportTarget, exportOptions);
      const link = document.createElement('a');
      const modeLabel = iconSetState.current === 'crayon' ? 'epic' : 'standard';
      link.href = dataUrl;
      link.download = `network-topology-${modeLabel}.png`;
      link.click();
    } catch (error) {
      console.error('Failed to export canvas', error);
    } finally {
      if (exportTarget instanceof HTMLElement && exportTarget.style) {
        if (previousBackgroundColor) exportTarget.style.backgroundColor = previousBackgroundColor;
        else exportTarget.style.removeProperty('background-color');
      }
      cleanup?.();
      exporting = false;
    }
  }

  async function copyShareLink() {
    if (typeof window === 'undefined') return;
    if (copyTimeout) {
      clearTimeout(copyTimeout);
      copyTimeout = null;
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      copyStatus = 'copied';
    } catch (error) {
      console.error('Failed to copy link', error);
      copyStatus = 'error';
    }
    copyTimeout = setTimeout(() => {
      copyStatus = 'idle';
      copyTimeout = null;
    }, 2500);
  }

  /* Data for Device Types */
  type LegendDeviceItem = { type: NodeType; label: string };
  const legendDeviceGroups: Array<{ title: string; items: LegendDeviceItem[] }> = [
    {
      title: 'Infrastructure',
      items: [
        { type: 'router', label: 'Router' },
        { type: 'switch', label: 'Switch' },
        { type: 'firewall', label: 'Firewall' },
        { type: 'wlc', label: 'Controller' }
      ]
    },
    {
      title: 'Endpoints',
      items: [
        { type: 'workstation', label: 'PC / Laptop' },
        { type: 'printer', label: 'Printer' },
        { type: 'telephone', label: 'Phone' },
        { type: 'ap', label: 'Access Point' }
      ]
    },
    {
      title: 'Special',
      items: [
        { type: 'server', label: 'Server Stack' },
        { type: 'db', label: 'Database' },
        { type: 'cctv', label: 'CCTV' }
      ]
    }
  ];

  const privateRanges = ['10.x.x.x', '172.16.x.x'] as const;
  const securityBoundaryHint = 'Security boundary enforced by the Perimeter Firewall';
</script>

<!-- =================== PAGE =================== -->
<div class={PAGE.root}>
  <div class={PAGE.inner}>
    <!-- =================== Header =================== -->
    <header class={HEADER.container}>
      <!-- HERO (left) -->
      <div class={HEADER.hero}>
        <div class={HEADER.brand}>
          <img class={HEADER.brandLogo} src="/logo/logo-512.png" alt="SecureStart company logo" />
          <span class={HEADER.brandName}>SecureStart</span>
        </div>

        <div class={HEADER.copy}>
          <h1 class={HEADER.title}>High School Network Topology</h1>
          <p class={HEADER.blurb}>
            Explore the SecureStart network flowchart to trace campus connectivity, security zones, and key
            infrastructure at a glance.
          </p>
        </div>
      </div>

      <!-- CONTROL PANEL (right) -->
      <div class={HEADER.panel}>
        <div class={HEADER.modeGroup}>
          <span class={HEADER.modeLabel}>Mode</span>
          <button
            type="button"
            role="switch"
            aria-label="Mode"
            aria-checked={isEpic}
            onclick={toggleMode}
            class={HEADER.modeToggle}
          >
            <span class={tw(HEADER.modeOption, isEpic ? HEADER_STATE.modeDimmed : HEADER_STATE.modeDefault)}>
              Standard
            </span>

            <span
              aria-hidden="true"
              class={tw(HEADER.modeThumb, isEpic ? HEADER_STATE.thumbEpic : HEADER_STATE.thumbDefault)}
            ></span>

            <span class={tw(HEADER.modeOption, isEpic ? HEADER_STATE.modeEpic : HEADER_STATE.modeEpicInactive)}>
              Epic
            </span>
          </button>
        </div>

        <button type="button" class={HEADER.exportButton} onclick={exportCanvas} disabled={exporting}>
          {exporting ? 'Exporting…' : 'Export PNG'}
        </button>

        <button type="button" class={shareButtonClass()} onclick={copyShareLink}>
          {shareLabel}
        </button>
      </div>
    </header>

    <!-- =================== Legend =================== -->
    <section class={LEGEND.section} aria-labelledby="diagram-legend-title">
      <div class={LEGEND.grid}>
        <h2 id="diagram-legend-title" class={LEGEND.title}>Diagram Legend</h2>

        <!-- Zone Indicators -->
        <div class={LEGEND.card}>
          <p class={LEGEND.heading}>Zone Indicators</p>

          <div class={LEGEND.zoneList}>
            <!-- Zone chip list -->
            <div class={LEGEND.zoneChips}>
              {#each zoneLegendEntries as zone (zone.id)}
                <div class={LEGEND.zoneChip}>
                  <span class={LEGEND.zoneLabel}>{zone.label}</span>
                  {#if zone.trustLevel}
                    <span class={tw(LEGEND.trustBadge, LEGEND.trustColors[zone.trustLevel!])}>
                      {TRUST_LABELS[zone.trustLevel!]}
                    </span>
                  {/if}
                </div>
              {/each}
            </div>

            <!-- Trust rows -->
            <div class={LEGEND.trustList}>
              {#each trustLegend as trust (trust.level)}
                <div class={LEGEND.trustRow}>
                  <span class={tw(LEGEND.trustBadge, LEGEND.trustColors[trust.level])}>
                    {TRUST_LABELS[trust.level]}
                  </span>
                  <p class={LEGEND.trustCopy}>{trust.copy}</p>
                </div>
              {/each}
            </div>

            <!-- Hint -->
            <div class={LEGEND.zoneHint}>
              <span class={LEGEND.zoneHintDot} aria-hidden="true"></span>
              <span>Yellow border marks representative or repeated spaces (e.g. typical classroom or office).</span>
            </div>
          </div>
        </div>

        <!-- Device Types -->
        <div class={LEGEND.card}>
          <p class={LEGEND.heading}>Device Types</p>
          <div class={LEGEND.deviceGroups}>
            {#each legendDeviceGroups as group (group.title)}
              <div class={LEGEND.deviceGroup}>
                <span class={LEGEND.deviceGroupTitle}>{group.title}</span>
                <div class={LEGEND.deviceGrid}>
                  {#each group.items as item (item.type)}
                    <div class={LEGEND.deviceItem}>
                      <Icon type={item.type} size={32} title={item.label} />
                      <span class={LEGEND.deviceLabel}>{item.label}</span>
                    </div>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        </div>

        <!-- Network Context -->
        <div class={LEGEND.card}>
          <p class={LEGEND.heading}>Network Context</p>
          <div class={LEGEND.netList}>
            <div class={LEGEND.netItem}>
              <span class={LEGEND.netDividerSolid} aria-hidden="true"></span>
              <span>Wired uplink</span>
            </div>
            <div class={LEGEND.netItem}>
              <span class={LEGEND.netDividerDashed} aria-hidden="true"></span>
              <span>Wireless association</span>
            </div>
            <div class={LEGEND.netItem}>
              <div class={LEGEND.rangeGroup}>
                {#each privateRanges as range}
                  <span class={LEGEND.netRange}>{range}</span>
                {/each}
              </div>
              <span>Private IPv4 ranges indicating internal networks.</span>
            </div>
            <div class={LEGEND.netItem}>
              <span class={LEGEND.lockWrapper} aria-hidden="true">
                <span class={LEGEND.lockArc}></span>
                <span class={LEGEND.lockBody}></span>
              </span>
              <span>{securityBoundaryHint}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>

  <!-- =================== Diagram =================== -->
  <section class={DIAGRAM.outer}>
    <div class={DIAGRAM.inner}>
      <div class={DIAGRAM.frame} bind:this={diagramFrameElement}>
        <div class={DIAGRAM.canvas} aria-labelledby="diagram-canvas-title">
          <h2 id="diagram-canvas-title" class={DIAGRAM.title}>Network Flowchart</h2>
          <FlowCanvas {layout} bind:this={flowCanvasComponent} />
        </div>
      </div>
    </div>
  </section>

  <!-- =================== Footer =================== -->
  <div class={PAGE.innerBottom}>
    <footer class={PAGE.footer}>
      Created by
      <a class={PAGE.footerLink} href="https://github.com/greenhillth" target="_blank" rel="noopener noreferrer">
        Tom Greenhill
      </a>
      (z5309693) for <b>INFS1701 Assignment 1</b>. Icons by
      <a class={PAGE.footerLink} href="https://www.affinity.serif.com/en-gb/iconset/" target="_blank" rel="noopener noreferrer">
        Affinity
      </a>
      and
      <a class={PAGE.footerLink} href="https://crayons.world/" target="_blank" rel="noopener noreferrer">
        Crayons
      </a>
      . Source code available on
      <a class={PAGE.footerLink} href="https://github.com/greenhillth/INFS1701-assignment1" target="_blank" rel="noopener noreferrer">
        GitHub
      </a>
      .
    </footer>
  </div>
</div>
