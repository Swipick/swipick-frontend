import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, shadows } from './spacing';

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} as const;

export type Theme = typeof theme;

// Export individual modules for convenience
export { colors } from './colors';
export { typography } from './typography';
export { spacing, borderRadius, shadows } from './spacing';
