import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/ui/Buttons';
import { CastleText } from '@/components/ui/CastleText';
import { useTheme } from '@/theme/ThemeProvider';

/** Top safe-area spacer that paints the canvas behind the status bar. */
export function TopInset({ color }: { color?: string }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  return <View style={{ height: insets.top, backgroundColor: color ?? colors.canvas }} />;
}

/** «Главная» / «Мои книги» toolbar: large title + trailing icon button. */
export function TitleToolbar({ title, trailing, height = 56 }: { title: string; trailing?: ReactNode; height?: number }) {
  return (
    <View style={[styles.toolbar, { height }]}>
      <CastleText variant="heading" accessibilityRole="header" style={styles.flex} numberOfLines={1}>
        {title}
      </CastleText>
      {trailing}
    </View>
  );
}

/** Auth navigation (69:2269…): back · «Вход в аккаунт» · close. */
export function AuthNavigation({ title, onBack, onClose }: { title: string; onBack: () => void; onClose: () => void }) {
  return (
    <View style={[styles.toolbar, { height: 64 }]}>
      <IconButton icon="arrowBack" label="Назад" onPress={onBack} testID="auth-back" />
      <CastleText variant="bodyMedium" accessibilityRole="header" style={styles.flex} numberOfLines={1}>
        {title}
      </CastleText>
      <IconButton icon="close" label="Закрыть" onPress={onClose} testID="auth-close" />
    </View>
  );
}

/** Castle / Book / Header toolbar: back · centered title · actions. */
export function CenteredToolbar({ title, onBack, actions }: { title: string; onBack: () => void; actions?: ReactNode }) {
  return (
    <View style={[styles.toolbar, styles.centered]}>
      <IconButton icon="arrowBack" label="Назад" onPress={onBack} testID="book-back" />
      <CastleText variant="bodyMedium" align="center" accessibilityRole="header" style={styles.flex} numberOfLines={1}>
        {title}
      </CastleText>
      <View style={styles.actions}>{actions}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  centered: {
    height: 56,
    gap: 8,
  },
  flex: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
});
