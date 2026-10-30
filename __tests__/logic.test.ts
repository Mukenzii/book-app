import { books } from '@/data/books';
import {
  __setRandomForTests,
  clearChallenge,
  formatCountdown,
  getChallenge,
  requestCode,
  secondsUntilResend,
  verifyCode,
} from '@/features/auth/demoSmsAdapter';
import { formatNational, isCompletePhone, maskPhone, toNationalDigits } from '@/features/auth/phone';
import { dotEmphasis, dotWidth, pageForOffset } from '@/features/home/carouselMath';
import { editDistance, normalize, searchBooks } from '@/features/search/searchBooks';
import { foundBooksLabel, ruPlural, savedBooksLabel } from '@/lib/plural';
import { resolveScheme } from '@/theme/ThemeProvider';

describe('+998 phone input', () => {
  it('keeps only nine national digits', () => {
    expect(toNationalDigits('90 123 45 67')).toBe('901234567');
    expect(toNationalDigits('90a1b2')).toBe('9012');
    expect(toNationalDigits('9012345678999')).toBe('901234567');
  });

  it('strips a pasted country code', () => {
    expect(toNationalDigits('+998 (90) 123-45-67')).toBe('901234567');
    expect(toNationalDigits('998901234567')).toBe('901234567');
  });

  it('formats as «90 123 45 67» while typing', () => {
    expect(formatNational('')).toBe('');
    expect(formatNational('9')).toBe('9');
    expect(formatNational('90123')).toBe('90 123');
    expect(formatNational('9012345')).toBe('90 123 45');
    expect(formatNational('901234567')).toBe('90 123 45 67');
  });

  it('validates the exact length and masks the number', () => {
    expect(isCompletePhone('90123456')).toBe(false);
    expect(isCompletePhone('901234567')).toBe(true);
    expect(maskPhone('901234567')).toBe('+998 90 ••• •• 67');
  });
});

describe('demo SMS adapter', () => {
  afterEach(() => clearChallenge());

  it('creates a six-digit code that only verifies when it matches', () => {
    __setRandomForTests(() => 0.42);
    const challenge = requestCode('901234567', 1_000);
    expect(challenge.demoCode).toBe('444444');
    expect(getChallenge()?.phone).toBe('901234567');
    expect(verifyCode('000000')).toBe(false);
    expect(verifyCode('44444')).toBe(false);
    expect(verifyCode('444444')).toBe(true);
    __setRandomForTests(Math.random);
  });

  it('counts down 0:59 before resend', () => {
    expect(secondsUntilResend(0, 0)).toBe(59);
    expect(formatCountdown(secondsUntilResend(0, 0))).toBe('0:59');
    expect(formatCountdown(secondsUntilResend(0, 49_500))).toBe('0:10');
    expect(secondsUntilResend(0, 59_000)).toBe(0);
    expect(secondsUntilResend(10_000, 5_000)).toBe(59);
  });
});

describe('local search', () => {
  it('finds the Castle example «айдар» in Читать and nothing in Слушать', () => {
    expect(searchBooks('айдар', 'text').map((book) => book.id)).toEqual(['gramotnym']);
    expect(searchBooks('айдар', 'audio')).toEqual([]);
  });

  it('matches title prefixes, authors and genres, case and ё-insensitive', () => {
    expect(searchBooks('МОРФ', 'audio').map((book) => book.id)).toEqual(['morfiy-audio']);
    expect(searchBooks('четвертое', 'text').map((book) => book.id)).toEqual(['chetvertoe-krylo']);
    expect(searchBooks('щерба', 'audio').map((book) => book.id)).toEqual(['chasodei-audio']);
    expect(searchBooks('для детей', 'audio').map((book) => book.id)).toContain('myshonok-tim-audio');
  });

  it('ignores empty queries and unrelated words', () => {
    expect(searchBooks('   ', 'text')).toEqual([]);
    expect(searchBooks('квантовая физика', 'text')).toEqual([]);
  });

  it('normalizes punctuation and computes small edit distances', () => {
    expect(normalize('«Файл   надежды»!')).toBe('файл надежды');
    expect(editDistance('айдар', 'айдай')).toBe(1);
    expect(editDistance('ерба', 'ребa', 1)).toBeGreaterThan(1);
  });

  it('only references bundled books', () => {
    expect(books.every((book) => typeof book.cover === 'number' || typeof book.cover === 'object')).toBe(true);
  });
});

describe('russian plurals', () => {
  it.each([
    [1, 'Найдена 1 книга'],
    [2, 'Найдено 2 книги'],
    [5, 'Найдено 5 книг'],
    [11, 'Найдено 11 книг'],
    [21, 'Найдена 21 книга'],
    [24, 'Найдено 24 книги'],
  ])('%i → %s', (count, label) => {
    expect(foundBooksLabel(count)).toBe(label);
  });

  it('labels saved books', () => {
    expect(savedBooksLabel(1)).toBe('Сохранена 1 книга');
    expect(savedBooksLabel(3)).toBe('Сохранено 3 книги');
    expect(ruPlural(112, ['a', 'b', 'c'])).toBe('c');
  });
});

describe('theme resolution', () => {
  it('follows the system only for «Системная»', () => {
    expect(resolveScheme('system', 'dark')).toBe('dark');
    expect(resolveScheme('system', null)).toBe('light');
    expect(resolveScheme('light', 'dark')).toBe('light');
    expect(resolveScheme('dark', 'light')).toBe('dark');
  });
});

describe('promo carousel indicator', () => {
  it('maps a swipe offset to the visible page', () => {
    expect(pageForOffset(0, 358, 3)).toBe(0);
    expect(pageForOffset(178, 358, 3)).toBe(0);
    expect(pageForOffset(180, 358, 3)).toBe(1);
    expect(pageForOffset(716, 358, 3)).toBe(2);
    expect(pageForOffset(900, 358, 3)).toBe(2);
    expect(pageForOffset(-40, 358, 3)).toBe(0);
    expect(pageForOffset(100, 0, 3)).toBe(0);
  });

  it('stretches the active pill continuously instead of jumping', () => {
    // Halfway between slide 1 and 2 both pills are mid-size; nothing snaps.
    expect(dotWidth(dotEmphasis(0, 0))).toBe(24);
    expect(dotWidth(dotEmphasis(0.25, 0))).toBe(20);
    expect(dotWidth(dotEmphasis(0.5, 0))).toBe(16);
    expect(dotWidth(dotEmphasis(0.5, 1))).toBe(16);
    expect(dotWidth(dotEmphasis(1, 0))).toBe(8);
    expect(dotWidth(dotEmphasis(2, 0))).toBe(8);
    // The three pills always add up to the design's 24 + 8 + 8.
    for (const progress of [0, 0.3, 0.5, 1, 1.7, 2]) {
      const total = [0, 1, 2].reduce((sum, index) => sum + dotWidth(dotEmphasis(progress, index)), 0);
      expect(total).toBeCloseTo(40);
    }
  });
});
