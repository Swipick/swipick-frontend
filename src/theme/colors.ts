export const colors = {
  // Brand colors
  primary: '#6366f1',
  secondary: '#8b5cf6',

  // Status colors
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',

  // UI colors
  background: '#ffffff',
  backgroundSecondary: '#f9fafb',
  text: '#1f2937',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  disabled: '#d1d5db',

  // Prediction colors (Swipick specific)
  home: '#4CAF50',      // Green - Home win (1)
  draw: '#9E9E9E',      // Gray - Draw (X)
  away: '#F44336',      // Red - Away win (2)
  skip: '#FFC107',      // Yellow - Skip

  // Semantic colors
  correct: '#10b981',   // Green for correct predictions
  incorrect: '#ef4444', // Red for incorrect predictions
  pending: '#f59e0b',   // Orange for pending results

  // Dark mode (optional - for future implementation)
  dark: {
    background: '#111827',
    backgroundSecondary: '#1f2937',
    text: '#f9fafb',
    textSecondary: '#9ca3af',
    border: '#374151',
  },
} as const;

export type Colors = typeof colors;
