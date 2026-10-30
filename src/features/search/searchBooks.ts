import { books as catalog, genres, type Book, type BookFormat } from '@/data/books';

export function normalize(text: string): string {
  return text.toLocaleLowerCase('ru-RU').replace(/ё/g, 'е').replace(/[«»"'.,:;!?()@#—–-]/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Optimal string alignment distance, capped for speed. */
export function editDistance(a: string, b: string, max = 2): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const rows = a.length + 1;
  const cols = b.length + 1;
  const d: number[][] = Array.from({ length: rows }, (_, i) => Array.from({ length: cols }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i < rows; i++) {
    let rowMin = Infinity;
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let value = Math.min(d[i - 1]![j]! + 1, d[i]![j - 1]! + 1, d[i - 1]![j - 1]! + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        value = Math.min(value, d[i - 2]![j - 2]! + 1);
      }
      d[i]![j] = value;
      rowMin = Math.min(rowMin, value);
    }
    if (rowMin > max) return max + 1;
  }
  return d[a.length]![b.length]!;
}

function allowedTypos(token: string): number {
  if (token.length >= 8) return 2;
  if (token.length >= 4) return 1;
  return 0;
}

/** A query token matches a word by prefix or, for longer tokens, with a small typo budget. */
export function tokenMatches(token: string, word: string): boolean {
  if (word.startsWith(token)) return true;
  const typos = allowedTypos(token);
  if (typos === 0) return false;
  const candidate = word.length > token.length ? word.slice(0, token.length) : word;
  return editDistance(token, candidate, typos) <= typos || editDistance(token, word, typos) <= typos;
}

function searchableWords(book: Book): string[] {
  const genreTitles = genres.filter((genre) => book.genres.includes(genre.id)).map((genre) => genre.title);
  return normalize([book.title, book.author, ...genreTitles].join(' ')).split(' ').filter(Boolean);
}

/**
 * Local demo search over title, author and genre. Typo-tolerant so the Castle
 * example query «айдар» finds «Айдай Максатбекова» (134:732).
 */
export function searchBooks(query: string, format: BookFormat, source: Book[] = catalog): Book[] {
  const tokens = normalize(query).split(' ').filter(Boolean);
  if (tokens.length === 0) return [];
  return source.filter((book) => {
    if (book.format !== format) return false;
    const words = searchableWords(book);
    return tokens.every((token) => words.some((word) => tokenMatches(token, word)));
  });
}
