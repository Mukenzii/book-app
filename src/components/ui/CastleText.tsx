import { Text, type TextProps } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import type { CastleColors } from '@/theme/tokens';
import { typography, type TypographyVariant } from '@/theme/typography';

type TextTone = Extract<
  keyof CastleColors,
  'textPrimary' | 'textSecondary' | 'textTertiary' | 'textDisabled' | 'textInverse' | 'actionAccent' | 'feedbackDanger'
>;

export type CastleTextProps = TextProps & {
  variant?: TypographyVariant;
  tone?: TextTone;
  align?: 'left' | 'center' | 'right';
};

export function CastleText({ variant = 'small', tone = 'textPrimary', align, style, ...rest }: CastleTextProps) {
  const { colors } = useTheme();
  return (
    <Text
      maxFontSizeMultiplier={1.6}
      {...rest}
      style={[typography[variant], { color: colors[tone] }, align ? { textAlign: align } : null, style]}
    />
  );
}
