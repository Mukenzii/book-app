import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icons/Icon';
import { TitleToolbar, TopInset } from '@/components/navigation/Headers';
import { PrimaryButton, TextLink } from '@/components/ui/Buttons';
import { CastleText } from '@/components/ui/CastleText';
import { maskPhone } from '@/features/auth/phone';
import { openAuth } from '@/lib/navigation';
import { appActions, useAppStore, type ThemePreference } from '@/state/appStore';
import { showFeedback } from '@/state/feedbackStore';
import { useTheme } from '@/theme/ThemeProvider';
import { dimension } from '@/theme/tokens';

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'Светлая' },
  { value: 'dark', label: 'Тёмная' },
  { value: 'system', label: 'Системная' },
];

const DEMO_NOTES = [
  'SMS не отправляются: код генерируется на устройстве и показывается на экране ввода.',
  'Оплата и подписка не подключены — покупок в приложении нет.',
  'Чтение и прослушивание требуют интеграции ридера и аудиоплеера.',
  'Библиотека, жанры, оценки и тема хранятся только на этом устройстве.',
];

function ThemeSwitch() {
  const { colors } = useTheme();
  const preference = useAppStore((state) => state.themePreference);
  return (
    <View testID="theme-switch" accessibilityRole="radiogroup" style={[styles.track, { backgroundColor: colors.actionDisabled }]}>
      {THEME_OPTIONS.map((option) => {
        const selected = option.value === preference;
        return (
          <Pressable
            key={option.value}
            testID={`theme-${option.value}`}
            accessibilityRole="radio"
            accessibilityLabel={`Тема: ${option.label}`}
            accessibilityState={{ selected, checked: selected }}
            onPress={() => appActions.setThemePreference(option.value)}
            style={[styles.segment, selected ? { backgroundColor: colors.controlSelected } : null]}
          >
            <CastleText variant="small" tone={selected ? 'actionAccent' : 'textSecondary'}>
              {option.label}
            </CastleText>
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * Профиль is not part of the current Castle pages; it is assembled from Castle
 * components to host the persisted theme switch, the demo session and demo notes.
 */
export default function ProfileScreen() {
  const { colors } = useTheme();
  const session = useAppStore((state) => state.session);

  return (
    <View style={[styles.screen, { backgroundColor: colors.canvas }]}>
      <TopInset />
      <TitleToolbar title="Профиль" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={[styles.avatar, { backgroundColor: colors.actionNeutral }]}>
            <Icon name="person" size={24} color={colors.textSecondary} />
          </View>
          {session ? (
            <>
              <CastleText testID="profile-phone" variant="bodyMedium">
                {maskPhone(session.phone)}
              </CastleText>
              <CastleText variant="caption" tone="textSecondary">
                Демо-вход на этом устройстве
              </CastleText>
              <TextLink
                label="Выйти из аккаунта"
                testID="sign-out"
                onPress={() => {
                  appActions.signOut();
                  showFeedback({ tone: 'info', title: 'Вы вышли из аккаунта' });
                }}
              />
            </>
          ) : (
            <>
              <CastleText variant="bodyMedium">Вы не вошли</CastleText>
              <CastleText variant="caption" tone="textSecondary">
                Один аккаунт для книг и аудиокниг
              </CastleText>
              <PrimaryButton label="Войти по телефону" onPress={() => openAuth('library')} testID="profile-sign-in" style={styles.button} />
            </>
          )}
        </View>

        <View style={styles.section}>
          <CastleText variant="bodyMedium" accessibilityRole="header">
            Оформление
          </CastleText>
          <ThemeSwitch />
          <CastleText variant="caption" tone="textTertiary">
            «Системная» следует настройке устройства. Выбор сохраняется.
          </CastleText>
        </View>

        <View style={styles.section}>
          <CastleText variant="bodyMedium" accessibilityRole="header">
            Демо-режим
          </CastleText>
          <View testID="demo-notes" style={[styles.card, styles.notes, { backgroundColor: colors.surface }]}>
            {DEMO_NOTES.map((note) => (
              <View key={note} style={styles.noteRow}>
                <Icon name="puzzle" size={20} color={colors.actionAccent} />
                <CastleText variant="small" tone="textSecondary" style={styles.flex}>
                  {note}
                </CastleText>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 24,
  },
  card: {
    borderRadius: dimension.d16,
    padding: 16,
    gap: 4,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: dimension.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  button: {
    marginTop: 12,
  },
  section: {
    gap: 12,
  },
  track: {
    height: 48,
    borderRadius: dimension.d12,
    padding: dimension.d4,
    gap: dimension.d4,
    flexDirection: 'row',
  },
  segment: {
    flex: 1,
    height: 40,
    borderRadius: dimension.d8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notes: {
    gap: 12,
    alignItems: 'stretch',
  },
  noteRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  flex: {
    flex: 1,
  },
});
