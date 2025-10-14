import { tw } from '$lib/utils/tw';
import { TOKENS } from '../tokens';

export const ICON = {
  image: TOKENS.utility.nonSelectable,
  fallback: tw(
    'flex items-center justify-center rounded bg-white/10 text-xs text-red-200/80',
    TOKENS.utility.nonSelectable
  )
} as const;
