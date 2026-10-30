import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icons/Icon';
import { CastleText } from '@/components/ui/CastleText';
import type { BookFormat } from '@/data/books';
import { useTheme } from '@/theme/ThemeProvider';
import { dimension } from '@/theme/tokens';

const OPTIONS: { format: BookFormat; label: string; icon: 'bookSmall' | 'headphoneSmall' }[] = [
  { format: 'text', label: 'Читать', icon: 'bookSmall' },
  { format: 'audio', label: 'Слушать', icon: 'headphoneSmall' },
];

type FormatSwitchProps = {
  value: BookFormat;
  onChange: (format: BookFormat) => void;
  /** Formats that exist for this item; others render as unavailable. */
  available?: BookFormat[];
  onUnavailablePress?: (format: BookFormat) => void;
  testID?: string;
};

/** Castle / Book / Format — «Читать | Слушать» segmented control. */
export function FormatSwitch({ value, onChange, available, onUnavailablePress, testID }: FormatSwitchProps) {
  const { colors } = useTheme();
  return (
    <View testID={testID} accessibilityRole="tablist" style={[styles.track, { backgroundColor: colors.actionDisabled }]}>
      {OPTIONS.map((option) => {
        const selected = option.format === value;
        const enabled = !available || available.includes(option.format);
        const tint = selected ? colors.actionAccent : colors.textSecondary;
        return (
          <Pressable
            key={option.format}
            testID={testID ? `${testID}-${option.format}` : undefined}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected, disabled: !enabled }}
            accessibilityHint={enabled ? undefined : 'Недоступно в этом формате'}
            onPress={() => {
              if (!enabled) onUnavailablePress?.(option.format);
              else if (!selected) onChange(option.format);
            }}
            style={[
              styles.segment,
              selected ? { backgroundColor: colors.controlSelected } : null,
              enabled ? null : styles.unavailable,
            ]}
          >
            <Icon name={option.icon} size={20} color={tint} />
            <CastleText variant="small" style={{ color: tint }}>
              {option.label}
            </CastleText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 48,
    borderRadius: dimension.d12,
    padding: dimension.d4,
    gap: dimension.d4,
    flexDirection: 'row',
    alignSelf: 'stretch',
  },
  segment: {
    flex: 1,
    height: 40,
    borderRadius: dimension.d8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: dimension.d8,
  },
  unavailable: {
    opacity: 0.45,
  },
});
