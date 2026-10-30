import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icons/Icon';
import { useTheme } from '@/theme/ThemeProvider';
import type { TypographyVariant } from '@/theme/typography';

import { CastleText } from './CastleText';

type SectionHeaderProps = {
  title: string;
  onPress?: () => void;
  variant?: Extract<TypographyVariant, 'section' | 'bodyMedium'>;
};

/** Section heading with optional trailing chevron (whole row is the touch target). */
export function SectionHeader({ title, onPress, variant = 'section' }: SectionHeaderProps) {
  const { colors } = useTheme();
  const content = (
    <>
      <CastleText variant={variant} accessibilityRole="header" style={styles.title}>
        {title}
      </CastleText>
      {onPress ? <Icon name="chevron" size={20} color={colors.textSecondary} /> : null}
    </>
  );
  if (!onPress) return <View style={styles.row}>{content}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}, показать все`}
      style={({ pressed }) => [styles.row, styles.pressable, { opacity: pressed ? 0.6 : 1 }]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pressable: {
    minHeight: 44,
    marginVertical: -9,
  },
  title: {
    flex: 1,
  },
});
