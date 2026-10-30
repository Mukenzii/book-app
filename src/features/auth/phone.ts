/** Uzbekistan numbers: +998 followed by nine national digits (e.g. 90 123 45 67). */
export const COUNTRY_CODE = '+998';
export const NATIONAL_LENGTH = 9;
export const PHONE_PLACEHOLDER = '00 000 00 00';
export const PHONE_ERROR = 'Введите все 9 цифр после +998';

/**
 * Extracts national digits from any user input, including pasted values such as
 * «+998 90 123-45-67» or «998901234567».
 */
export function toNationalDigits(input: string): string {
  let digits = input.replace(/\D/g, '');
  if (digits.length > NATIONAL_LENGTH && digits.startsWith('998')) digits = digits.slice(3);
  return digits.slice(0, NATIONAL_LENGTH);
}

/** Groups national digits as «90 123 45 67». */
export function formatNational(digits: string): string {
  const d = digits.slice(0, NATIONAL_LENGTH);
  return [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(' ');
}

export function isCompletePhone(digits: string): boolean {
  return /^\d{9}$/.test(digits);
}

/** «+998 90 ••• •• 67» — masked number shown on the SMS step. */
export function maskPhone(digits: string): string {
  if (!isCompletePhone(digits)) return `${COUNTRY_CODE} ${formatNational(digits)}`;
  return `${COUNTRY_CODE} ${digits.slice(0, 2)} ••• •• ${digits.slice(7, 9)}`;
}
