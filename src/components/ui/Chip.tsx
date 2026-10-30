import { Pressable, StyleSheet } from 'react-native';

import { Icon } from '@/components/icons/Icon';
import { useTheme } from '@/theme/ThemeProvider';

import { CastleText } from './CastleText';

type ChipProps = {
  label: string;
  onPress: () => void;
  showOptionsIcon?: boolean;
};

/** Castle / Search / Chip */
export function Chip({ label, onPress, showOptionsIcon = false }: ChipProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: 4, bottom: 4 }}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.chip, { backgroundColor: colors.actionNeutral, opacity: pressed ? 0.6 : 1 }]}
    >
      {showOptionsIcon ? <Icon name="options" size={18} /> : null}
      <CastleText variant="small">{label}</CastleText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 36,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
