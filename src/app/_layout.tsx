import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { FeedbackHost } from '@/components/ui/FeedbackHost';
import { hydrateAppStore, useAppStore } from '@/state/appStore';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

/**
 * Deep links (e.g. castle://book/morfiy or an auth link) always get the tab navigator
 * underneath, so back, «Закрыть» and the book card's bottom navigation have a home.
 */
export const unstable_settings = {
  anchor: '(tabs)',
};

/**
 * Fonts are embedded natively by the expo-font config plugin in development/production
 * builds. `useFonts` keeps Expo Go and web working with the same bundled files.
 */
const FONT_FILES = {
  'Manrope-Regular': require('../../assets/fonts/Manrope-Regular.ttf'),
  'Manrope-Medium': require('../../assets/fonts/Manrope-Medium.ttf'),
  'Manrope-SemiBold': require('../../assets/fonts/Manrope-SemiBold.ttf'),
  'Manrope-Bold': require('../../assets/fonts/Manrope-Bold.ttf'),
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(FONT_FILES);
  const hydrated = useAppStore((state) => state.hydrated);

  useEffect(() => {
    hydrateAppStore();
  }, []);

  const ready = (fontsLoaded || fontError !== null) && hydrated;
  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  if (!ready) return null;

  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}

function AppNavigator() {
  const { scheme, colors } = useTheme();
  const navigationTheme = useMemo(() => {
    const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.actionAccent,
        background: colors.canvas,
        card: colors.surface,
        text: colors.textPrimary,
        border: colors.borderDefault,
      },
    };
  }, [scheme, colors]);

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <View style={[styles.root, { backgroundColor: colors.canvas }]}>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.canvas },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="search" options={{ animation: 'fade' }} />
          <Stack.Screen name="book/[id]" />
          <Stack.Screen name="auth/phone" />
          <Stack.Screen name="auth/code" />
        </Stack>
        <FeedbackHost />
      </View>
    </NavigationThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
