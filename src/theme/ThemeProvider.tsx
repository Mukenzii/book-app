import * as SystemUI from 'expo-system-ui';
import { createContext, use, useEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { Appearance, Platform } from 'react-native';

import { useAppStore, type ThemePreference } from '@/state/appStore';

import { colors, type CastleColors, type ColorScheme } from './tokens';

type ThemeContextValue = {
  scheme: ColorScheme;
  colors: CastleColors;
  preference: ThemePreference;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function resolveScheme(preference: ThemePreference, system: ColorScheme | null | undefined): ColorScheme {
  if (preference === 'system') return system === 'dark' ? 'dark' : 'light';
  return preference;
}

function readScheme(): ColorScheme | null {
  const value = Appearance.getColorScheme();
  return value === 'dark' || value === 'light' ? value : null;
}

const appearanceListeners = new Set<() => void>();

function subscribeAppearance(listener: () => void) {
  appearanceListeners.add(listener);
  const subscription = Appearance.addChangeListener(listener);
  return () => {
    appearanceListeners.delete(listener);
    subscription.remove();
  };
}

/**
 * Applies the in-app override to native chrome (keyboard, alerts, share sheet).
 * While Light/Dark is pinned the OS reports the overridden value, so subscribers are
 * re-notified after the override changes to re-read the real system appearance.
 */
function applyNativeOverride(preference: ThemePreference) {
  if (Platform.OS !== 'web') {
    Appearance.setColorScheme(preference === 'system' ? 'unspecified' : preference);
  }
  appearanceListeners.forEach((listener) => listener());
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const preference = useAppStore((state) => state.themePreference);
  const system = useSyncExternalStore(subscribeAppearance, readScheme, readScheme);
  const scheme = resolveScheme(preference, system);

  useEffect(() => {
    applyNativeOverride(preference);
  }, [preference]);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors[scheme].canvas).catch(() => undefined);
  }, [scheme]);

  const value = useMemo(() => ({ scheme, colors: colors[scheme], preference }), [scheme, preference]);
  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme(): ThemeContextValue {
  const value = use(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside <ThemeProvider>');
  return value;
}
