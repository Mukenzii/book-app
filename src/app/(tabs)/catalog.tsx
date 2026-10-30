import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BookGrid } from '@/components/books/BookGrid';
import { FormatSwitch } from '@/components/books/FormatSwitch';
import { Icon } from '@/components/icons/Icon';
import { TopInset } from '@/components/navigation/Headers';
import { TextLink } from '@/components/ui/Buttons';
import { CastleText } from '@/components/ui/CastleText';
import { Chip } from '@/components/ui/Chip';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { audioRecommendationIds, books, getBooks, type Book, type BookFormat } from '@/data/books';
import { searchBooks } from '@/features/search/searchBooks';
import { SearchToolbar } from '@/features/search/SearchToolbar';
import { openBook, openSearch, openTab } from '@/lib/navigation';
import { foundBooksLabel } from '@/lib/plural';
import { showIntegrationNeeded } from '@/state/feedbackStore';
import { useTheme } from '@/theme/ThemeProvider';
import { dimension } from '@/theme/tokens';

const onBookPress = (book: Book) => openBook(book.id, 'catalog');

function recommendationsFor(format: BookFormat): Book[] {
  if (format === 'audio') return getBooks(audioRecommendationIds);
  return books.filter((book) => book.format === 'text' && book.access === 'subscription');
}

function SubscriptionChip({ active, onPress }: { active: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      testID="chip-subscription"
      onPress={onPress}
      hitSlop={{ top: 4, bottom: 4 }}
      accessibilityRole="checkbox"
      accessibilityLabel="По подписке"
      accessibilityState={{ checked: active }}
      style={[styles.chip, { backgroundColor: active ? colors.actionTint : colors.actionNeutral }]}
    >
      <CastleText variant="small" tone={active ? 'actionAccent' : 'textPrimary'}>
        По подписке
      </CastleText>
    </Pressable>
  );
}

/** Каталог: Поиск · Читать (134:732) and Поиск · Слушать (134:899), plus a browse state. */
export default function CatalogScreen() {
  const params = useLocalSearchParams<{ q?: string; format?: BookFormat }>();
  const { colors } = useTheme();
  const query = (params.q ?? '').trim();
  const format: BookFormat = params.format === 'audio' ? 'audio' : 'text';
  const [subscriptionOnly, setSubscriptionOnly] = useState(false);

  const results = useMemo(() => {
    const found = searchBooks(query, format);
    return subscriptionOnly ? found.filter((book) => book.access === 'subscription') : found;
  }, [query, format, subscriptionOnly]);

  const setFormat = (next: BookFormat) => router.setParams({ format: next });
  const emptyTitle = format === 'audio' ? 'Аудиокниги не найдены' : 'Книги не найдены';

  return (
    <View style={[styles.screen, { backgroundColor: colors.canvas }]}>
      <TopInset />
      <SearchToolbar
        mode="display"
        value={query}
        onPress={() => openSearch(query, format)}
        onClear={() => router.setParams({ q: '' })}
        onBack={() => (router.canGoBack() ? router.back() : openTab('index'))}
      />
      <ScrollView testID="catalog-scroll" contentContainerStyle={styles.content}>
        <FormatSwitch testID="catalog-format" value={format} onChange={setFormat} />

        {query && (results.length > 0 || subscriptionOnly) ? (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsViewport} contentContainerStyle={styles.chips}>
              <Chip label="Фильтры" showOptionsIcon onPress={() => showIntegrationNeeded('Фильтры', 'Фасеты поиска придут из API каталога.')} />
              <SubscriptionChip active={subscriptionOnly} onPress={() => setSubscriptionOnly((value) => !value)} />
              <Chip label="Жанры" onPress={() => showIntegrationNeeded('Фильтр по жанрам', 'Фасеты поиска придут из API каталога.')} />
              <Chip label="Авторы" onPress={() => showIntegrationNeeded('Фильтр по авторам', 'Фасеты поиска придут из API каталога.')} />
            </ScrollView>
            <CastleText testID="results-count" variant="small" tone="textSecondary">
              {foundBooksLabel(results.length)}
            </CastleText>
            <BookGrid testID="search-results" books={results} onPress={onBookPress} />
          </>
        ) : null}

        {query && results.length === 0 && !subscriptionOnly ? (
          <>
            <View testID="search-empty" style={styles.empty}>
              <View style={[styles.emptySymbol, { backgroundColor: colors.actionTint }]}>
                <Icon name="search" size={28} color={colors.actionAccent} />
              </View>
              <CastleText variant="section" align="center" accessibilityRole="header">
                {emptyTitle}
              </CastleText>
              <CastleText variant="small" tone="textSecondary" align="center">
                {`По запросу «${query}» ничего не нашлось.\nПопробуйте другое название или автора.`}
              </CastleText>
              <TextLink label="Изменить запрос" align="center" onPress={() => openSearch(query, format)} testID="change-query" />
            </View>
            <SectionHeader title="Возможно, вам понравится" />
            <BookGrid books={recommendationsFor(format)} onPress={onBookPress} />
          </>
        ) : null}

        {query ? null : (
          <>
            <SectionHeader title="Возможно, вам понравится" />
            <BookGrid testID="catalog-browse" books={books.filter((book) => book.format === format)} onPress={onBookPress} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 16,
  },
  chipsViewport: {
    marginHorizontal: -16,
  },
  chips: {
    paddingHorizontal: 16,
    gap: dimension.d8,
  },
  chip: {
    height: 36,
    borderRadius: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    gap: dimension.d12,
    paddingTop: 16,
  },
  emptySymbol: {
    width: 56,
    height: 56,
    borderRadius: dimension.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
