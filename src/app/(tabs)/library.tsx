import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { BookGrid } from '@/components/books/BookGrid';
import { Icon } from '@/components/icons/Icon';
import { TitleToolbar, TopInset } from '@/components/navigation/Headers';
import { IconButton } from '@/components/ui/Buttons';
import { CastleText } from '@/components/ui/CastleText';
import { getBooks, type Book } from '@/data/books';
import { LibraryEmptyCard } from '@/features/library/LibraryEmptyCard';
import { openAuth, openBook, openSearch, openTab } from '@/lib/navigation';
import { savedBooksLabel } from '@/lib/plural';
import { appActions, useAppStore } from '@/state/appStore';
import { useTheme } from '@/theme/ThemeProvider';

const onBookPress = (book: Book) => openBook(book.id, 'library');

function SignedInBanner() {
  const { colors } = useTheme();
  useEffect(() => {
    const timer = setTimeout(appActions.dismissSignedInBanner, 5000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <View
      testID="signed-in-banner"
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[styles.banner, { backgroundColor: colors.surface }]}
    >
      <Icon name="check" size={20} color={colors.feedbackSuccess} />
      <CastleText variant="small">Вы вошли в аккаунт</CastleText>
    </View>
  );
}

/** Мои книги: guest (69:2221), signed in (69:2569) and the saved-books list. */
export default function LibraryScreen() {
  const { colors } = useTheme();
  const session = useAppStore((state) => state.session);
  const savedIds = useAppStore((state) => state.savedBookIds);
  const showBanner = useAppStore((state) => state.showSignedInBanner);
  const saved = getBooks(savedIds);

  // The banner is a one-time confirmation; leaving the tab clears it.
  useFocusEffect(useCallback(() => () => appActions.dismissSignedInBanner(), []));

  return (
    <View style={[styles.screen, { backgroundColor: colors.canvas }]}>
      <TopInset />
      <TitleToolbar
        title="Мои книги"
        height={64}
        trailing={<IconButton icon="searchSmall" label="Поиск" onPress={() => openSearch()} testID="library-search" />}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {session && showBanner ? <SignedInBanner /> : null}
        {!session ? <LibraryEmptyCard variant="guest" onAction={() => openAuth('library')} /> : null}
        {session && saved.length === 0 ? <LibraryEmptyCard variant="welcome" onAction={() => openTab('catalog')} /> : null}
        {session && saved.length > 0 ? (
          <View testID="library-saved" style={styles.saved}>
            <CastleText variant="small" tone="textSecondary">
              {savedBooksLabel(saved.length)}
            </CastleText>
            <BookGrid books={saved} onPress={onBookPress} />
          </View>
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
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  banner: {
    height: 52,
    borderRadius: 16,
    paddingLeft: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  saved: {
    gap: 16,
  },
});
