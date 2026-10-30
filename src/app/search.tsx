import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Keyboard, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icons/Icon';
import { TopInset } from '@/components/navigation/Headers';
import { CastleText } from '@/components/ui/CastleText';
import type { BookFormat } from '@/data/books';
import { SearchToolbar } from '@/features/search/SearchToolbar';
import { useTheme } from '@/theme/ThemeProvider';
import { dimension } from '@/theme/tokens';

/** Поиск · Ввод (134:397) and Поиск · Запрос (134:580). Uses the native keyboard. */
export default function SearchInputScreen() {
  const params = useLocalSearchParams<{ q?: string; format?: BookFormat }>();
  const { colors } = useTheme();
  const [query, setQuery] = useState(params.q ?? '');
  const trimmed = query.trim();
  const format: BookFormat = params.format === 'audio' ? 'audio' : 'text';

  const submit = () => {
    if (!trimmed) return;
    Keyboard.dismiss();
    router.dismissTo({ pathname: '/catalog', params: { q: trimmed, format } });
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.canvas }]}>
      <TopInset />
      <SearchToolbar
        mode="input"
        value={query}
        onChangeText={setQuery}
        onSubmit={submit}
        onClear={() => setQuery('')}
        onBack={() => router.back()}
      />
      <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={styles.content}>
        {trimmed ? (
          <Pressable
            testID="search-submit-row"
            onPress={submit}
            accessibilityRole="button"
            accessibilityLabel={`Найти «${trimmed}»`}
            style={({ pressed }) => [styles.submitRow, { backgroundColor: colors.surface, opacity: pressed ? 0.75 : 1 }]}
          >
            <Icon name="searchSmall" size={20} color={colors.actionAccent} />
            <CastleText variant="body" numberOfLines={1} style={styles.flex}>
              {`Найти «${trimmed}»`}
            </CastleText>
            <Icon name="chevron" size={20} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingTop: 16,
    paddingHorizontal: 16,
    gap: dimension.d12,
  },
  submitRow: {
    height: 64,
    borderRadius: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: dimension.d12,
  },
  flex: {
    flex: 1,
  },
});
