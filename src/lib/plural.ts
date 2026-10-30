/** Russian plural category for an integer (one / few / many). */
export function ruPlural(count: number, forms: [one: string, few: string, many: string]): string {
  const n = Math.abs(Math.trunc(count)) % 100;
  const last = n % 10;
  if (n > 10 && n < 20) return forms[2];
  if (last === 1) return forms[0];
  if (last >= 2 && last <= 4) return forms[1];
  return forms[2];
}

/** «Найдена 1 книга», «Найдено 3 книги», «Найдено 11 книг». */
export function foundBooksLabel(count: number): string {
  const verb = ruPlural(count, ['Найдена', 'Найдено', 'Найдено']);
  return `${verb} ${count} ${ruPlural(count, ['книга', 'книги', 'книг'])}`;
}

/** «Сохранена 1 книга», «Сохранено 4 книги». */
export function savedBooksLabel(count: number): string {
  const verb = ruPlural(count, ['Сохранена', 'Сохранено', 'Сохранено']);
  return `${verb} ${count} ${ruPlural(count, ['книга', 'книги', 'книг'])}`;
}
