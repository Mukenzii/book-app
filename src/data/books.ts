import type { IconName } from '@/components/icons/Icon';

/**
 * Local demo catalog. Every title, author, label and cover comes from the current
 * Castle Figma screens (home 134:4, search 134:732/899, book card 87:1743/2108).
 * There is no catalog backend: anything the designs do not specify is left empty
 * and surfaced as "integration needed" in the UI instead of being invented.
 */
export type BookFormat = 'text' | 'audio';
export type BookAccess = 'purchase' | 'subscription';
export type GenreId = 'romance' | 'kids' | 'young-adult' | 'self-development' | 'business';

export type BookFact = { value: string; label: string };

export type BookDetails = {
  badge?: string;
  facts: BookFact[];
  about: string;
  /** The annotation in Figma is truncated with «…»; the full text needs the catalog API. */
  aboutTruncated: boolean;
  metadata: { caption: string; title: string }[];
  recommendationsTitle: string;
  recommendationIds: string[];
};

/** Result of `require()` for a bundled image (Metro asset id). */
export type ImageAsset = number;

export type Book = {
  id: string;
  title: string;
  author: string;
  format: BookFormat;
  access: BookAccess;
  cover: ImageAsset;
  genres: GenreId[];
  /** The same work in the other format (Морфий text ⇄ audio). */
  alternateId?: string;
  details?: BookDetails;
};

const MORPHINE_ABOUT =
  'Михаил Булгаков — главный русский мистик XX века. Медик по образованию и тонкий сатирик по призванию, он сам видел и мастерски описал слом эпох, Революцию, Гражданскую войну…';

export const books: Book[] = [
  {
    id: 'dikie-yagody',
    title: 'Дикие ягоды: начало',
    author: 'Татьяна Ким и команда',
    format: 'text',
    access: 'purchase',
    cover: require('../../assets/covers/dikie-yagody.png'),
    genres: ['business'],
  },
  {
    id: 'file-nadezhdy',
    title: 'Файл надежды',
    author: 'Александр Цыпкин',
    format: 'text',
    access: 'purchase',
    cover: require('../../assets/covers/file-nadezhdy.png'),
    genres: ['romance'],
  },
  {
    id: 'chetvertoe-krylo',
    title: 'Четвёртое крыло',
    author: 'Ребекка Яррос',
    format: 'text',
    access: 'subscription',
    cover: require('../../assets/covers/chetvertoe-krylo.png'),
    genres: ['young-adult', 'romance'],
  },
  {
    id: 'stan-svetom',
    title: 'Стань светом в тёмном море. Том 1',
    author: 'Softcoral',
    format: 'text',
    access: 'subscription',
    cover: require('../../assets/covers/stan-svetom.png'),
    genres: ['young-adult'],
  },
  {
    id: 'nevermore',
    title: 'Неверморе',
    author: 'Елена Ядренцева',
    format: 'text',
    access: 'purchase',
    cover: require('../../assets/covers/nevermore.png'),
    genres: ['young-adult'],
    alternateId: 'nevermore-audio',
  },
  {
    id: 'dni-hleba',
    title: 'Дни хлеба, супа и котов',
    author: 'Йоко Мурэ',
    format: 'text',
    access: 'purchase',
    cover: require('../../assets/covers/dni-hleba.png'),
    genres: ['self-development'],
  },
  {
    id: 'gramotnym',
    title: 'Грамотным быть модно @ru_grammar',
    author: 'Айдай Максатбекова',
    format: 'text',
    access: 'purchase',
    cover: require('../../assets/covers/gramotnym.png'),
    genres: ['self-development'],
  },
  {
    id: 'morfiy',
    title: 'Морфий',
    author: 'Михаил Булгаков',
    format: 'text',
    access: 'purchase',
    cover: require('../../assets/covers/morfiy.jpg'),
    genres: [],
    alternateId: 'morfiy-audio',
    details: {
      badge: 'Новая книга',
      facts: [
        { value: '320', label: 'страниц' },
        { value: '~2 ч 8 мин', label: 'чтения' },
        { value: '16+', label: 'возраст' },
      ],
      about: MORPHINE_ABOUT,
      aboutTruncated: true,
      metadata: [
        { caption: 'Автор', title: 'Михаил Афанасьевич Булгаков' },
        { caption: 'Издательство', title: 'Эксмо' },
      ],
      recommendationsTitle: 'С этой книгой читают',
      recommendationIds: ['1984', 'boytsovskiy-klub'],
    },
  },
  {
    id: 'morfiy-audio',
    title: 'Морфий',
    author: 'Михаил Булгаков',
    format: 'audio',
    access: 'purchase',
    cover: require('../../assets/covers/morfiy-audio.jpg'),
    genres: [],
    alternateId: 'morfiy',
    details: {
      badge: 'Новая книга',
      facts: [
        { value: '12 ч 13 мин', label: 'длительность' },
        { value: 'К. Радциг', label: 'читает' },
        { value: '16+', label: 'возраст' },
      ],
      about: MORPHINE_ABOUT,
      aboutTruncated: true,
      metadata: [
        { caption: 'Автор', title: 'Михаил Афанасьевич Булгаков' },
        { caption: 'Издательство', title: 'Эксмо' },
        { caption: 'Чтец', title: 'Кирилл Радциг' },
      ],
      recommendationsTitle: 'С этой книгой слушают',
      recommendationIds: ['1984-audio', 'boytsovskiy-klub-audio'],
    },
  },
  {
    id: '1984',
    title: '1984',
    author: 'Джордж Оруэлл',
    format: 'text',
    access: 'purchase',
    cover: require('../../assets/covers/1984.jpg'),
    genres: [],
    alternateId: '1984-audio',
  },
  {
    id: '1984-audio',
    title: '1984',
    author: 'Джордж Оруэлл',
    format: 'audio',
    access: 'purchase',
    cover: require('../../assets/covers/1984.jpg'),
    genres: [],
    alternateId: '1984',
  },
  {
    id: 'boytsovskiy-klub',
    title: 'Бойцовский клуб',
    author: 'Чак Паланик',
    format: 'text',
    access: 'purchase',
    cover: require('../../assets/covers/boytsovskiy-klub.jpg'),
    genres: [],
    alternateId: 'boytsovskiy-klub-audio',
  },
  {
    id: 'boytsovskiy-klub-audio',
    title: 'Бойцовский клуб',
    author: 'Чак Паланик',
    format: 'audio',
    access: 'purchase',
    cover: require('../../assets/covers/boytsovskiy-klub.jpg'),
    genres: [],
    alternateId: 'boytsovskiy-klub',
  },
  {
    id: 'etiket-audio',
    title: 'Этикет для убийц и влюблённых',
    author: 'Анна Фицджеральд Хили',
    format: 'audio',
    access: 'purchase',
    cover: require('../../assets/covers/etiket-audio.png'),
    genres: ['romance'],
  },
  {
    id: 'nevermore-audio',
    title: 'Неверморе',
    author: 'Елена Ядренцева',
    format: 'audio',
    access: 'purchase',
    cover: require('../../assets/covers/nevermore-audio.png'),
    genres: ['young-adult'],
    alternateId: 'nevermore',
  },
  {
    id: 'restoran-audio',
    title: 'Ресторан 06:06:06',
    author: 'Пом Ю Джин',
    format: 'audio',
    access: 'subscription',
    cover: require('../../assets/covers/restoran-audio.png'),
    genres: ['young-adult'],
  },
  {
    id: 'chasodei-audio',
    title: 'Часодеи. 3. Часовая башня',
    author: 'Наталья Щерба',
    format: 'audio',
    access: 'subscription',
    cover: require('../../assets/covers/chasodei-audio.png'),
    genres: ['kids', 'young-adult'],
  },
  {
    id: 'myshonok-tim-audio',
    title: 'Мышонок Тим не хочет спать',
    // The Castle search screen (134:899) shows no author for this card.
    author: '',
    format: 'audio',
    access: 'subscription',
    cover: require('../../assets/covers/myshonok-tim-audio.png'),
    genres: ['kids'],
  },
  {
    id: 'neveroyatnye-audio',
    title: 'Невероятные создания',
    author: 'Кэтрин Ранделл',
    format: 'audio',
    access: 'subscription',
    cover: require('../../assets/covers/neveroyatnye-audio.png'),
    genres: ['kids'],
  },
];

const byId = new Map(books.map((book) => [book.id, book]));

export function getBook(id: string | undefined): Book | undefined {
  return id ? byId.get(id) : undefined;
}

export function getBooks(ids: string[]): Book[] {
  return ids.map((id) => byId.get(id)).filter((book): book is Book => Boolean(book));
}

export function formatLabel(book: Pick<Book, 'access' | 'format'>): { text: string; accent: boolean } {
  if (book.access === 'subscription') return { text: 'По подписке', accent: true };
  return { text: book.format === 'audio' ? 'Аудиокнига' : 'Электронная книга', accent: false };
}

/** Books to show under the detail card when Figma does not specify recommendations. */
export function relatedBooks(book: Book, limit = 2): Book[] {
  if (book.details) return getBooks(book.details.recommendationIds);
  return books
    .filter((other) => other.id !== book.id && other.format === book.format && other.id !== book.alternateId)
    .filter((other) => other.genres.some((genre) => book.genres.includes(genre)))
    .slice(0, limit);
}

export type Genre = { id: GenreId; title: string; icon: IconName };

export const genres: Genre[] = [
  { id: 'romance', title: 'Любовные романы', icon: 'heart' },
  { id: 'kids', title: 'Для детей', icon: 'bookTwoTone' },
  { id: 'young-adult', title: 'Young Adult', icon: 'sparkles' },
  { id: 'self-development', title: 'Саморазвитие и психология', icon: 'puzzle' },
  { id: 'business', title: 'Бизнес и деньги', icon: 'personTwoTone' },
];

export type Collection = { id: string; title: string; artwork: ImageAsset };

export const collections: Collection[] = [
  { id: 'success', title: 'Секрет успеха', artwork: require('../../assets/covers/collection-success.png') },
  { id: 'history', title: 'Исторические романы', artwork: require('../../assets/covers/collection-history.png') },
];

export type Rail = { id: string; title: string; bookIds: string[] };

export const homeRails = {
  top: { id: 'top', title: 'Топ-10 книг недели', bookIds: ['dikie-yagody', 'file-nadezhdy', 'chetvertoe-krylo'] },
  subscription: {
    id: 'subscription',
    title: 'Популярное в подписке',
    bookIds: ['stan-svetom', 'chetvertoe-krylo', 'file-nadezhdy'],
  },
  walk: { id: 'walk', title: 'Послушать на прогулке', bookIds: ['etiket-audio', 'nevermore-audio'] },
  discuss: { id: 'discuss', title: 'Почитать и обсудить', bookIds: ['nevermore', 'dni-hleba'] },
} satisfies Record<string, Rail>;

/** «Возможно, вам понравится» on the Слушать empty state (134:899). */
export const audioRecommendationIds = ['restoran-audio', 'chasodei-audio', 'myshonok-tim-audio', 'neveroyatnye-audio'];

export const promoAssets = {
  authorPortrait: require('../../assets/covers/author-tsypkin.png') as ImageAsset,
};
