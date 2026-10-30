import type { ReactNode } from 'react';
import { Keyboard, KeyboardAvoidingView, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthNavigation, TopInset } from '@/components/navigation/Headers';
import { CastleText } from '@/components/ui/CastleText';
import { useTheme } from '@/theme/ThemeProvider';

type AuthScaffoldProps = {
  title: string;
  subtitle: string;
  onBack: () => void;
  onClose: () => void;
  children: ReactNode;
};

/**
 * Canvas + «Вход в аккаунт» navigation + rounded «Auth sheet» (69:2269…69:2769).
 * The design's keypad is the system keyboard; KeyboardAvoidingView keeps the
 * primary action right above it, as in the mockups. `padding` is needed on Android
 * too: with edge-to-edge the window is not resized for the keyboard.
 */
export function AuthScaffold({ title, subtitle, onBack, onClose, children }: AuthScaffoldProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { backgroundColor: colors.canvas }]}>
      <TopInset />
      <AuthNavigation title="Вход в аккаунт" onBack={onBack} onClose={onClose} />
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <Pressable
          accessible={false}
          onPress={Keyboard.dismiss}
          style={[styles.sheet, { backgroundColor: colors.surface, paddingBottom: Math.max(insets.bottom, 16) }]}
        >
          <View style={styles.heading}>
            <CastleText variant="title" accessibilityRole="header">
              {title}
            </CastleText>
            <CastleText variant="body" tone="textSecondary">
              {subtitle}
            </CastleText>
          </View>
          {children}
        </Pressable>
      </KeyboardAvoidingView>
    </View>
  );
}

/** Small «Демо» marker used wherever a demo adapter stands in for a real service. */
export function DemoNote({ children, testID }: { children: ReactNode; testID?: string }) {
  const { colors } = useTheme();
  return (
    <View testID={testID} style={[styles.demo, { backgroundColor: colors.actionTint }]}>
      <CastleText variant="caption" tone="actionAccent">
        ДЕМО
      </CastleText>
      <CastleText variant="caption" tone="textSecondary" style={styles.flex}>
        {children}
      </CastleText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  sheet: {
    flex: 1,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  heading: {
    gap: 8,
  },
  demo: {
    flexDirection: 'row',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'flex-start',
  },
});
