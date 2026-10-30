import type { TextStyle } from 'react-native';

/**
 * Manrope is bundled in assets/fonts and embedded with the expo-font config plugin.
 * File names equal the PostScript names, so the same family string works on iOS,
 * Android and web.
 */
export const fonts = {
  regular: 'Manrope-Regular',
  medium: 'Manrope-Medium',
  semiBold: 'Manrope-SemiBold',
  bold: 'Manrope-Bold',
} as const;

/**
 * Castle / Books text styles. Figma letter spacing is in percent of the font size
 * (e.g. -2 → -0.02em), converted to points here.
 */
export const typography = {
  /** Castle/Books/Title — Bold 30/36, -3% */
  title: { fontFamily: fonts.bold, fontSize: 30, lineHeight: 36, letterSpacing: -0.9 },
  /** Castle / Books / Heading — SemiBold 24/30, -2% */
  heading: { fontFamily: fonts.semiBold, fontSize: 24, lineHeight: 30, letterSpacing: -0.48 },
  /** Castle / Books / Section — SemiBold 20/26, -1% */
  section: { fontFamily: fonts.semiBold, fontSize: 20, lineHeight: 26, letterSpacing: -0.2 },
  /** Castle / Books / Body — Regular 17/22, -1% */
  body: { fontFamily: fonts.regular, fontSize: 17, lineHeight: 22, letterSpacing: -0.17 },
  /** Castle / Books / Body medium — Medium 17/22, -1% */
  bodyMedium: { fontFamily: fonts.medium, fontSize: 17, lineHeight: 22, letterSpacing: -0.17 },
  /** Castle / Books / Button — Medium 16/24 */
  button: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 24, letterSpacing: 0 },
  /** Castle / Books / Small — Regular 14/20 */
  small: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, letterSpacing: 0 },
  /** Castle / Books / Caption — Medium 12/16 */
  caption: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16, letterSpacing: 0 },
  /** Bottom navigation label — Medium 10/14 */
  tab: { fontFamily: fonts.medium, fontSize: 10, lineHeight: 14, letterSpacing: 0 },
  /** OTP digit — Medium 24/32 */
  digit: { fontFamily: fonts.medium, fontSize: 24, lineHeight: 32, letterSpacing: 0 },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
