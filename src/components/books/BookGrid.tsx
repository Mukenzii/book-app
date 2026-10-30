import { StyleSheet, View } from 'react-native';

import type { Book } from '@/data/books';
import { dimension } from '@/theme/tokens';

import { BookCard } from './BookCard';

type BookGridProps = {
  books: Book[];
  onPress: (book: Book) => void;
  testID?: string;
};

/** Two-column grid (173pt cards on a 390pt screen). Lists here are short, so no virtualization. */
export function BookGrid({ books, onPress, testID }: BookGridProps) {
  const rows: Book[][] = [];
  for (let i = 0; i < books.length; i += 2) rows.push(books.slice(i, i + 2));
  return (
    <View testID={testID} style={styles.grid}>
      {rows.map((row) => (
        <View key={row.map((book) => book.id).join('|')} style={styles.row}>
          {row.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onPress={onPress}
              artworkHeight={book.format === 'audio' ? 149 : 206}
              style={styles.cell}
            />
          ))}
          {row.length === 1 ? <View style={styles.cell} /> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: dimension.d12,
  },
  row: {
    flexDirection: 'row',
    gap: dimension.d12,
    alignItems: 'flex-start',
  },
  cell: {
    flex: 1,
  },
});
