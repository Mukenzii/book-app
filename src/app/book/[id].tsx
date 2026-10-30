import { Image } from 'expo-image';
import { router, useLocalSearchParams, useRootNavigationState } from 'expo-router';
import { Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';

import { BookCard } from '@/components/books/BookCard';
import { FormatSwitch } from '@/components/books/FormatSwitch';
import { Icon } from '@/components/icons/Icon';
import { BottomNavigation, type TabKey } from '@/components/navigation/BottomNavigation';
import { CenteredToolbar, TopInset } from '@/components/navigation/Headers';
import { IconButton, ListRow, PrimaryButton } from '@/components/ui/Buttons';
import { CastleText } from '@/components/ui/CastleText';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { getBook, relatedBooks, type Book, type BookFormat } from '@/data/books';
import { focusedTabName, openAuth, openBook, openTab, type NavState } from '@/lib/navigation';
import { appActions, useAppStore } from '@/state/appStore';
import { showFeedback, showIntegrationNeeded } from '@/state/feedbackStore';
import { useTheme } from '@/theme/ThemeProvider';
import { dimension } from '@/theme/tokens';

const TAB_KEYS: TabKey[] = ['index', 'catalog', 'library', 'profile'];

/**
 * The book card sits on top of the tab navigator (anchored in the root layout).
 * Pop back to it and switch only if the tab underneath is not the tapped one:
 * re-navigating to the focused tab would drop its params (the Каталог query), and
 * the tab underneath is not necessarily `from` (after a deep link it is Главная).
 */
function useGoToTab() {
  const focusedTab = focusedTabName(useRootNavigationState() as NavState | undefined);
  return (tab: TabKey) => {
    if (router.canDismiss()) router.dismissAll();
    if (focusedTab !== tab) openTab(tab);
  };
}

function BookCover({ book }: { book: Book }) {
  const { colors } = useTheme();
  const size = book.format === 'audio' ? { width: 200, height: 200 } : { width: 132, height: 208 };
  return (
    <View style={styles.coverBox}>
      <View style={[styles.coverShadow, size, { shadowColor: colors.fxControlShadow }]}>
        <Image
          source={book.cover}
          style={[styles.cover, size]}
          contentFit="cover"
          accessibilityLabel={`Обложка: ${book.title}`}
          transition={150}
        />
      </View>
    </View>
  );
}

function Rating({ bookId }: { bookId: string }) {
  const { colors } = useTheme();
  const rating = useAppStore((state) => state.ratings[bookId] ?? 0);
  return (
    <View style={[styles.review, { backgroundColor: colors.surface }]}>
      <CastleText variant="bodyMedium" align="center">
        Поделитесь впечатлениями
      </CastleText>
      <CastleText variant="small" tone="textSecondary" align="center">
        {rating > 0 ? `Ваша оценка: ${rating} из 5 · сохранена на устройстве` : 'Оставьте первый отзыв о книге'}
      </CastleText>
      <View style={styles.stars} accessibilityRole="adjustable" accessibilityLabel="Оценка книги">
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable
            key={star}
            testID={`rate-${star}`}
            onPress={() => {
              appActions.rate(bookId, star);
              showFeedback({ tone: 'success', title: 'Оценка сохранена', description: 'Демо: отзывы хранятся только на этом устройстве.' });
            }}
            accessibilityRole="button"
            accessibilityLabel={`Оценить на ${star} из 5`}
            accessibilityState={{ selected: star <= rating }}
            style={styles.star}
          >
            <Icon name="star" size={28} color={star <= rating ? colors.actionAccent : colors.textTertiary} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function BookDetailsScreen() {
  const params = useLocalSearchParams<{ id: string; from?: TabKey }>();
  const { colors } = useTheme();
  const book = getBook(params.id);
  const from: TabKey = TAB_KEYS.includes(params.from as TabKey) ? (params.from as TabKey) : 'catalog';
  const session = useAppStore((state) => state.session);
  const saved = useAppStore((state) => (book ? state.savedBookIds.includes(book.id) : false));
  const goToTab = useGoToTab();

  if (!book) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.canvas }]}>
        <TopInset />
        <CenteredToolbar title="Книга" onBack={() => router.back()} />
        <View style={styles.missing}>
          <CastleText variant="section" align="center">
            Книга не найдена
          </CastleText>
          <CastleText variant="small" tone="textSecondary" align="center">
            В демо-каталоге нет такой книги.
          </CastleText>
        </View>
      </View>
    );
  }

  const alternate = getBook(book.alternateId);
  const available: BookFormat[] = alternate ? [book.format, alternate.format] : [book.format];
  const isAudio = book.format === 'audio';
  const details = book.details;
  const related = relatedBooks(book);

  const onFormatChange = (format: BookFormat) => {
    if (alternate && alternate.format === format) router.setParams({ id: alternate.id });
  };

  const onBookmark = () => {
    if (!session) {
      showFeedback({ tone: 'info', title: 'Войдите, чтобы сохранять книги' });
      openAuth('book');
      return;
    }
    const nowSaved = appActions.toggleSaved(book.id);
    showFeedback({ tone: 'success', title: nowSaved ? 'Добавлено в «Мои книги»' : 'Удалено из «Мои книги»' });
  };

  const onShare = async () => {
    try {
      await Share.share({ message: `«${book.title}»${book.author ? ` — ${book.author}` : ''}` });
    } catch {
      showIntegrationNeeded('Поделиться', 'Системное меню «Поделиться» недоступно на этой платформе.');
    }
  };

  const onPrimary = () => {
    if (!session) {
      openAuth('book');
      return;
    }
    showIntegrationNeeded(
      isAudio ? 'Аудиоплеер' : 'Ридер',
      isAudio ? 'Стриминг аудиокниг не подключён — прослушивание недоступно в демо.' : 'Ридер и права на контент не подключены — чтение недоступно в демо.',
    );
  };

  const primaryLabel = session ? (isAudio ? 'Слушать' : 'Читать') : isAudio ? 'Войти, чтобы слушать' : 'Войти, чтобы читать';

  return (
    <View style={[styles.screen, { backgroundColor: colors.canvas }]}>
      <TopInset />
      <CenteredToolbar
        title={book.title}
        onBack={() => (router.canGoBack() ? router.back() : goToTab(from))}
        actions={
          <>
            <IconButton
              icon="bookmark"
              label={saved ? 'Убрать из «Мои книги»' : 'Сохранить в «Мои книги»'}
              selected={saved}
              iconColor={saved ? colors.actionAccent : undefined}
              onPress={onBookmark}
              testID="book-bookmark"
            />
            <IconButton icon="share" label="Поделиться" onPress={onShare} testID="book-share" />
          </>
        }
      />
      <ScrollView testID="book-scroll" contentContainerStyle={styles.content}>
        <View style={styles.identity}>
          <BookCover book={book} />
          <View style={styles.titleBlock}>
            <CastleText testID="book-title" variant="heading" align="center">
              {book.title}
            </CastleText>
            {book.author ? (
              <CastleText variant="small" tone="textSecondary" align="center">
                {book.author}
              </CastleText>
            ) : null}
          </View>
          {details?.badge ? (
            <View style={styles.badge}>
              <Icon name="star" size={14} color={colors.textSecondary} />
              <CastleText variant="caption" tone="textSecondary">
                {details.badge}
              </CastleText>
            </View>
          ) : null}
        </View>

        <FormatSwitch
          testID="book-format"
          value={book.format}
          available={available}
          onChange={onFormatChange}
          onUnavailablePress={(format) =>
            showFeedback({
              tone: 'info',
              title: format === 'audio' ? 'Аудиоверсии пока нет' : 'Электронной версии пока нет',
              description: 'В демо-каталоге эта книга есть только в одном формате.',
            })
          }
        />

        {details ? (
          <View testID="book-facts" style={[styles.facts, { backgroundColor: colors.surface }]}>
            {details.facts.map((fact) => (
              <View key={fact.label} style={styles.fact} accessible accessibilityLabel={`${fact.value} ${fact.label}`}>
                <CastleText variant="small" align="center" numberOfLines={1}>
                  {fact.value}
                </CastleText>
                <CastleText variant="caption" tone="textSecondary" align="center">
                  {fact.label}
                </CastleText>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <CastleText variant="bodyMedium" accessibilityRole="header">
            О книге
          </CastleText>
          <CastleText variant="small" tone="textSecondary">
            {details?.about ?? 'Аннотация, характеристики и издательство придут из API каталога — в макетах они есть только для «Морфия».'}
          </CastleText>
          {details?.aboutTruncated ? (
            <Pressable
              onPress={() => showIntegrationNeeded('Полное описание', 'В макете аннотация обрезана; полный текст придёт из API каталога.')}
              accessibilityRole="button"
              hitSlop={12}
            >
              <CastleText variant="small" tone="actionAccent">
                Подробнее
              </CastleText>
            </Pressable>
          ) : null}
        </View>

        {details ? (
          <View style={styles.metadata}>
            {details.metadata.map((row) => (
              <ListRow
                key={row.caption}
                title={row.title}
                caption={row.caption}
                onPress={() => showIntegrationNeeded(row.caption, 'Страницы авторов, чтецов и издательств не входят в текущие макеты.')}
              />
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <CastleText variant="bodyMedium" accessibilityRole="header">
            Бесплатные фрагменты
          </CastleText>
          <View style={styles.row}>
            {(['text', 'audio'] as const).map((format) => (
              <Pressable
                key={format}
                testID={`sample-${format}`}
                onPress={() =>
                  showIntegrationNeeded(
                    format === 'audio' ? 'Аудиофрагмент' : 'Фрагмент книги',
                    format === 'audio' ? 'Аудиоплеер и стриминг не подключены.' : 'Ридер не подключён.',
                  )
                }
                accessibilityRole="button"
                accessibilityLabel={format === 'audio' ? 'Слушать фрагмент' : 'Читать фрагмент'}
                style={({ pressed }) => [styles.sample, { backgroundColor: colors.surface, opacity: pressed ? 0.75 : 1 }]}
              >
                <Icon name={format === 'audio' ? 'headphone' : 'bookTwoTone'} size={24} />
                <View style={styles.flex}>
                  <CastleText variant="button">{format === 'audio' ? 'Слушать' : 'Читать'}</CastleText>
                  <CastleText variant="caption" tone="textSecondary">
                    Фрагмент
                  </CastleText>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        <Rating bookId={book.id} />

        {related.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader
              variant="bodyMedium"
              title={details?.recommendationsTitle ?? (isAudio ? 'С этой книгой слушают' : 'С этой книгой читают')}
              onPress={() => showIntegrationNeeded('Рекомендации', 'Полный список рекомендаций придёт из API каталога.')}
            />
            <View style={styles.row}>
              {related.map((item) => (
                <BookCard
                  key={item.id}
                  book={item}
                  onPress={(next) => openBook(next.id, from)}
                  artworkHeight={206}
                  style={styles.flex}
                />
              ))}
              {related.length === 1 ? <View style={styles.flex} /> : null}
            </View>
          </View>
        ) : null}
      </ScrollView>
      <View style={[styles.footer, { backgroundColor: colors.surface }]}>
        <PrimaryButton label={primaryLabel} onPress={onPrimary} testID="book-primary" />
      </View>
      <BottomNavigation activeKey={from} onSelect={goToTab} />
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
  content: {
    paddingTop: dimension.d16,
    paddingHorizontal: dimension.d16,
    paddingBottom: dimension.d24,
    gap: dimension.d24,
  },
  identity: {
    gap: dimension.d12,
  },
  coverBox: {
    height: 216,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverShadow: {
    borderRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  cover: {
    borderRadius: 8,
  },
  titleBlock: {
    gap: dimension.d4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: dimension.d4,
  },
  facts: {
    borderRadius: dimension.d16,
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  fact: {
    flex: 1,
    height: 56,
    justifyContent: 'center',
    gap: 2,
  },
  section: {
    gap: dimension.d12,
  },
  metadata: {
    gap: dimension.d8,
  },
  row: {
    flexDirection: 'row',
    gap: dimension.d12,
    alignItems: 'flex-start',
  },
  sample: {
    flex: 1,
    height: 80,
    borderRadius: dimension.d16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  review: {
    borderRadius: dimension.d16,
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 8,
    alignItems: 'center',
  },
  stars: {
    flexDirection: 'row',
    gap: dimension.d8,
  },
  star: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
  },
});
