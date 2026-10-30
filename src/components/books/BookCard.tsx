import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { CastleText } from '@/components/ui/CastleText';
import { formatLabel, type Book } from '@/data/books';
import { useTheme } from '@/theme/ThemeProvider';
import { dimension } from '@/theme/tokens';

type BookCardProps = {
  book: Book;
  onPress: (book: Book) => void;
  /** Artwork box height: 206 for text covers, 136/149 for square audio covers. */
  artworkHeight?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/** Castle book tile used in home rails, search results and recommendations. */
export const BookCard = memo(function BookCard({ book, onPress, artworkHeight, style, testID }: BookCardProps) {
  const { colors } = useTheme();
  const label = formatLabel(book);
  const height = artworkHeight ?? (book.format === 'audio' ? 136 : 206);
  return (
    <Pressable
      testID={testID ?? `book-card-${book.id}`}
      onPress={() => onPress(book)}
      accessibilityRole="button"
      accessibilityLabel={[book.title, book.author, label.text].filter(Boolean).join(', ')}
      style={({ pressed }) => [styles.card, { backgroundColor: colors.surface, opacity: pressed ? 0.75 : 1 }, style]}
    >
      <View style={[styles.artwork, { height }]}>
        <Image
          source={book.cover}
          style={styles.cover}
          contentFit="contain"
          transition={150}
          recyclingKey={book.id}
        />
      </View>
      <View style={styles.text}>
        <CastleText variant="bodyMedium" numberOfLines={3}>
          {book.title}
        </CastleText>
        {book.author ? (
          <CastleText variant="caption" tone="textSecondary" numberOfLines={1}>
            {book.author}
          </CastleText>
        ) : null}
        <CastleText variant="caption" tone={label.accent ? 'actionAccent' : 'textTertiary'} numberOfLines={1}>
          {label.text}
        </CastleText>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: dimension.d16,
    padding: 12,
    gap: dimension.d12,
  },
  artwork: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cover: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  text: {
    gap: dimension.d4,
  },
});
