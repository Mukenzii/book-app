import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icons/Icon';
import { PrimaryButton } from '@/components/ui/Buttons';
import { CastleText } from '@/components/ui/CastleText';
import { useTheme } from '@/theme/ThemeProvider';

type Variant = 'guest' | 'welcome';

const COPY: Record<Variant, { title: string; body: string; action: string; caption?: string }> = {
  guest: {
    title: 'Ваши книги —\nвсегда с вами',
    body: 'Войдите, чтобы читать и слушать,\nсохранять книги и продолжать\nс того места, где остановились.',
    action: 'Войти по телефону',
    caption: 'Один аккаунт для книг и аудиокниг',
  },
  welcome: {
    title: 'Здесь начинается\nваша библиотека',
    body: 'Сохраняйте книги и аудиокниги —\nони появятся здесь.',
    action: 'Найти первую книгу',
  },
};

/** «Library empty state» card from 69:2221 (guest) and 69:2569 (signed in). */
export function LibraryEmptyCard({ variant, onAction }: { variant: Variant; onAction: () => void }) {
  const { colors } = useTheme();
  const copy = COPY[variant];
  return (
    <View testID={`library-${variant}`} style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.flexSpace} />
      <View style={styles.hero} accessible={false}>
        <View style={[styles.bookTile, { backgroundColor: colors.actionNeutral }]}>
          <Icon name="book" size={50} color={colors.textPrimary} />
        </View>
        <View style={[styles.audioTile, { backgroundColor: colors.actionAccent, shadowColor: colors.actionAccent }]}>
          {variant === 'guest' ? (
            <Icon name="headphone" size={30} color="#ffffff" accentColor="#ffffff" />
          ) : (
            <Icon name="check" size={30} color="#ffffff" />
          )}
        </View>
      </View>
      <View style={styles.copy}>
        <CastleText variant="title" align="center" accessibilityRole="header">
          {copy.title}
        </CastleText>
        <CastleText variant="body" tone="textSecondary" align="center">
          {copy.body}
        </CastleText>
      </View>
      <View style={styles.flexSpace} />
      <PrimaryButton label={copy.action} onPress={onAction} testID={`library-${variant}-action`} />
      {copy.caption ? (
        <CastleText variant="caption" tone="textTertiary" align="center">
          {copy.caption}
        </CastleText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    minHeight: 520,
    borderRadius: 32,
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 24,
  },
  flexSpace: {
    flexGrow: 1,
  },
  hero: {
    width: 150,
    height: 128,
  },
  bookTile: {
    position: 'absolute',
    left: 15,
    top: 0,
    width: 96,
    height: 112,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioTile: {
    position: 'absolute',
    left: 88,
    top: 66,
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 4,
  },
  copy: {
    alignSelf: 'stretch',
    gap: 12,
  },
});
