import { tw } from '$lib/utils/tw';
import { LAYOUT } from '../layouts';
import { TOKENS } from '../tokens';

export const DIAGRAM = {
  outer: tw('diagram', LAYOUT.diagram.outer),
  inner: tw('diagram__inner', LAYOUT.diagram.inner),
  frame: tw('diagram__frame', LAYOUT.diagram.frame, TOKENS.surface.diagramFrame),
  canvas: tw('diagram__canvas', LAYOUT.diagram.canvas, TOKENS.surface.diagramCanvas),
  title: tw('diagram__section-title', TOKENS.text.sectionTitle)
} as const;
