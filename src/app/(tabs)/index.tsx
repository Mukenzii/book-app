import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BookCard } from '@/components/books/BookCard';
import { Icon } from '@/components/icons/Icon';
import { TitleToolbar, TopInset } from '@/components/navigation/Headers';
import { IconButton } from '@/components/ui/Buttons';
import { CastleText } from '@/components/ui/CastleText';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { collections, genres, getBooks, homeRails, type Book, type Rail } from '@/data/books';
import { PromoCarousel, type PromoAction } from '@/features/home/PromoCarousel';
import { openBook, openSearch, openTab, showCatalogResults } from '@/lib/navigation';
import { appActions, useAppStore } from '@/state/appStore';
import { showIntegrationNeeded } from '@/state/feedbackStore';
import { useTheme } from '@/theme/ThemeProvider';
import { dimension } from '@/theme/tokens';

const onBookPress = (book: Book) => openBook(book.id, 'index');

function onPromoAction(action: PromoAction) {
  if (action === 'exclusive') openBook('file-nadezhdy', 'index');
  else if (action === 'formats') openTab('catalog');
  else showIntegrationNeeded('Подписка', 'Оформление подписки требует платёжного сервиса — в демо оплаты нет.');
}

function BookRail({ rail }: { rail: Rail }) {
  return (
    <View style={styles.section}>
      <SectionHeader
        title={rail.title}
        onPress={() => showIntegrationNeeded(rail.title, 'Полный список подборки придёт из API каталога.')}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.railViewport}
        contentContainerStyle={styles.railContent}
      >
        {getBooks(rail.bookIds).map((book) => (
          <BookCard key={book.id} book={book} onPress={onBookPress} style={styles.railCard} />
        ))}
      </ScrollView>
    </View>
  );
}

function FavoriteGenres() {
  const { colors } = useTheme();
  const selected = useAppStore((state) => state.favoriteGenreIds);
  const tiles = [...genres.map((genre) => ({ ...genre, kind: 'genre' as const })), { id: 'all', title: 'Все жанры', icon: 'chevronLarge' as const, kind: 'all' as const }];
  const rows = [tiles.slice(0, 2), tiles.slice(2, 4), tiles.slice(4, 6)];
  return (
    <View testID="favorite-genres" style={[styles.genres, { backgroundColor: colors.actionTint }]}>
      <CastleText variant="section" accessibilityRole="header">
        Выберите любимые жанры
      </CastleText>
      <CastleText variant="small" tone="textSecondary">
        {selected.length > 0 ? `Подберём книги по вашим интересам · выбрано: ${selected.length}` : 'Подберём книги по вашим интересам'}
      </CastleText>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.genreRow}>
          {row.map((tile) => {
            const isSelected = tile.kind === 'genre' && selected.includes(tile.id);
            return (
              <Pressable
                key={tile.id}
                testID={`genre-${tile.id}`}
                onPress={() => (tile.kind === 'all' ? openTab('catalog') : appActions.toggleGenre(tile.id))}
                accessibilityRole={tile.kind === 'all' ? 'button' : 'checkbox'}
                accessibilityLabel={tile.title}
                accessibilityState={tile.kind === 'all' ? undefined : { checked: isSelected }}
                style={({ pressed }) => [
                  styles.genreTile,
                  {
                    backgroundColor: colors.surface,
                    borderColor: isSelected ? colors.actionAccent : 'transparent',
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Icon name={tile.icon} size={24} color={tile.kind === 'all' || tile.icon === 'puzzle' ? colors.actionAccent : colors.textPrimary} />
                <CastleText variant="small" style={styles.flex} numberOfLines={2}>
                  {tile.title}
                </CastleText>
                {isSelected ? <Icon name="check" size={20} color={colors.actionAccent} /> : null}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const { colors } = useTheme();
  return (
    <View style={[styles.screen, { backgroundColor: colors.canvas }]}>
      <TopInset />
      <TitleToolbar
        title="Главная"
        trailing={<IconButton icon="personSmall" label="Профиль" onPress={() => openTab('profile')} testID="home-profile" />}
      />
      <View style={styles.searchEntry}>
        <Pressable
          testID="home-search"
          onPress={() => openSearch()}
          accessibilityRole="search"
          accessibilityLabel="Поиск: название, автор или жанр"
          style={({ pressed }) => [styles.searchField, { backgroundColor: colors.surface, opacity: pressed ? 0.8 : 1 }]}
        >
          <Icon name="searchSmall" size={20} color={colors.textTertiary} />
          <CastleText variant="small" tone="textTertiary" style={styles.flex}>
            Название, автор или жанр
          </CastleText>
        </Pressable>
      </View>
      <ScrollView testID="home-scroll" contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PromoCarousel onAction={onPromoAction} />
        <BookRail rail={homeRails.top} />

        <View style={styles.section}>
          <SectionHeader
            title="Подборки для вдохновения"
            onPress={() => showIntegrationNeeded('Подборки', 'Редакционные подборки придут из API каталога.')}
          />
          <View style={styles.twoColumns}>
            {collections.map((collection) => (
              <Pressable
                key={collection.id}
                onPress={() => showIntegrationNeeded(`Подборка «${collection.title}»`, 'Содержимое подборки придёт из API каталога.')}
                accessibilityRole="button"
                accessibilityLabel={`Подборка: ${collection.title}`}
                style={({ pressed }) => [styles.collection, { backgroundColor: colors.surface, opacity: pressed ? 0.75 : 1 }]}
              >
                <Image source={collection.artwork} style={styles.collectionArtwork} contentFit="cover" />
                <CastleText variant="small" numberOfLines={2}>
                  {collection.title}
                </CastleText>
              </Pressable>
            ))}
          </View>
        </View>

        <FavoriteGenres />

        <View style={styles.section}>
          <SectionHeader title="Большая коллекция книг" />
          <View style={styles.twoColumns}>
            <Pressable
              testID="format-text"
              onPress={() => showCatalogResults('', 'text')}
              accessibilityRole="button"
              accessibilityLabel="Электронные книги"
              style={({ pressed }) => [styles.formatTile, { backgroundColor: colors.surface, opacity: pressed ? 0.75 : 1 }]}
            >
              <Icon name="bookTwoTone" size={24} />
              <CastleText variant="small" style={styles.flex}>
                Электронные книги
              </CastleText>
            </Pressable>
            <Pressable
              testID="format-audio"
              onPress={() => showCatalogResults('', 'audio')}
              accessibilityRole="button"
              accessibilityLabel="Аудиокниги"
              style={({ pressed }) => [styles.formatTile, { backgroundColor: colors.surface, opacity: pressed ? 0.75 : 1 }]}
            >
              <Icon name="headphone" size={24} />
              <CastleText variant="small" style={styles.flex}>
                Аудиокниги
              </CastleText>
            </Pressable>
          </View>
        </View>

        <BookRail rail={homeRails.subscription} />
        <BookRail rail={homeRails.walk} />
        <BookRail rail={homeRails.discuss} />
      </ScrollView>
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
  searchEntry: {
    height: 64,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchField: {
    height: 48,
    borderRadius: dimension.d12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 24,
  },
  section: {
    gap: dimension.d12,
  },
  railViewport: {
    marginHorizontal: -16,
  },
  railContent: {
    paddingHorizontal: 16,
    gap: dimension.d12,
  },
  railCard: {
    width: 160,
  },
  twoColumns: {
    flexDirection: 'row',
    gap: dimension.d12,
  },
  collection: {
    flex: 1,
    padding: 12,
    gap: 8,
    borderRadius: 16,
  },
  collectionArtwork: {
    height: 88,
    borderRadius: 8,
  },
  genres: {
    borderRadius: 24,
    padding: 16,
    gap: dimension.d12,
  },
  genreRow: {
    flexDirection: 'row',
    gap: dimension.d12,
  },
  genreTile: {
    flex: 1,
    minHeight: 60,
    borderRadius: dimension.d12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  formatTile: {
    flex: 1,
    height: 72,
    borderRadius: dimension.d12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
