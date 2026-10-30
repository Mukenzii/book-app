/**
 * Castle design tokens.
 *
 * Source of truth: design-context/lightvars.json and design-context/darkvars.json
 * (Figma variables `--castle-*`). Tokens that are used in the exported screens but
 * are not part of those variable dumps (disabled, inverse, danger, keyboard…) use the
 * fallback values Figma embedded in the reference code for each mode.
 */
export type ColorScheme = 'light' | 'dark';

export type CastleColors = {
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;
  textInverse: string;
  canvas: string;
  surface: string;
  actionAccent: string;
  actionNeutral: string;
  actionTint: string;
  actionDisabled: string;
  controlSelected: string;
  borderDefault: string;
  feedbackDanger: string;
  feedbackSuccess: string;
  fxAccentShadow: string;
  fxControlShadow: string;
};

export const colors: Record<ColorScheme, CastleColors> = {
  light: {
    textPrimary: '#101012',
    textSecondary: '#3c3c43b8',
    textTertiary: '#3c3c4385',
    textDisabled: 'rgba(60,60,67,0.3)',
    textInverse: '#ffffff',
    canvas: '#f5f5f5',
    surface: '#ffffff',
    actionAccent: '#4a8fff',
    actionNeutral: '#7878801f',
    actionTint: '#4a8fff14',
    actionDisabled: 'rgba(120,120,128,0.08)',
    controlSelected: '#ffffff',
    borderDefault: '#78788029',
    feedbackDanger: '#ff3a3a',
    feedbackSuccess: '#30d158',
    fxAccentShadow: 'rgba(74,143,255,0.16)',
    fxControlShadow: 'rgba(16,16,18,0.12)',
  },
  dark: {
    textPrimary: '#ffffff',
    textSecondary: '#b0b0b9b8',
    textTertiary: '#b0b0b985',
    textDisabled: 'rgba(176,176,185,0.32)',
    textInverse: '#ffffff',
    canvas: '#101012',
    surface: '#1c1c1e',
    actionAccent: '#4a8fff',
    actionNeutral: '#7878803d',
    actionTint: '#4a8fff14',
    actionDisabled: 'rgba(120,120,128,0.16)',
    // Not exported for Dark in Figma; a raised neutral that keeps the selected
    // segment readable on the dark canvas.
    controlSelected: '#3a3a3c',
    borderDefault: '#78788033',
    feedbackDanger: '#ff3a3a',
    feedbackSuccess: '#30d158',
    fxAccentShadow: 'rgba(74,143,255,0.16)',
    fxControlShadow: 'rgba(16,16,18,0.2)',
  },
};

/** `--castle-dimension-*` */
export const dimension = {
  d4: 4,
  d8: 8,
  d12: 12,
  d16: 16,
  d24: 24,
  pill: 9999,
} as const;

/** Minimum accessible touch target (Apple HIG 44pt, Material 48dp → 44 + hitSlop). */
export const MIN_TOUCH = 44;
