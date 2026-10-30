import { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputInstance } from 'react-native';

import { CastleText } from '@/components/ui/CastleText';
import { useTheme } from '@/theme/ThemeProvider';
import { dimension } from '@/theme/tokens';

import { CODE_LENGTH } from './demoSmsAdapter';

type PinInputProps = {
  value: string;
  onChange: (value: string) => void;
  error: boolean;
};

/**
 * «SMS code · 6 digits» (Castle / Input Pin / Cell ×6). A single hidden TextInput
 * receives native keyboard input, SMS autofill (one-time-code) and paste.
 */
export const PinInput = forwardRef<TextInputInstance, PinInputProps>(function PinInput({ value, onChange, error }, ref) {
  const { colors, scheme } = useTheme();
  const [focused, setFocused] = useState(false);
  const activeIndex = Math.min(value.length, CODE_LENGTH - 1);
  const focusInput = () => {
    if (ref && typeof ref === 'object') ref.current?.focus();
  };

  return (
    <Pressable
      testID="pin-cells"
      onPress={focusInput}
      accessibilityRole="none"
      accessibilityLabel={`Код из SMS, введено ${value.length} из ${CODE_LENGTH}`}
      style={styles.row}
    >
      {Array.from({ length: CODE_LENGTH }, (_, index) => {
        const digit = value[index];
        const isActive = focused && !error && index === activeIndex && value.length < CODE_LENGTH;
        const borderColor = error ? colors.feedbackDanger : isActive ? colors.actionAccent : colors.borderDefault;
        return (
          <View key={index} style={[styles.cell, { borderColor, backgroundColor: colors.surface }]}>
            {digit ? (
              <CastleText variant="digit" tone={error ? 'feedbackDanger' : 'textPrimary'}>
                {digit}
              </CastleText>
            ) : isActive ? (
              <View style={[styles.caret, { backgroundColor: colors.actionAccent }]} />
            ) : null}
          </View>
        );
      })}
      <TextInput
        ref={ref}
        testID="pin-input"
        value={value}
        onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, CODE_LENGTH))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        inputMode="numeric"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        keyboardAppearance={scheme}
        maxLength={CODE_LENGTH}
        autoFocus
        caretHidden
        contextMenuHidden={false}
        accessibilityLabel="Код из SMS, 6 цифр"
        style={styles.hiddenInput}
      />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    height: 56,
    flexDirection: 'row',
    gap: 8,
  },
  cell: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderRadius: dimension.d12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caret: {
    width: 2,
    height: 24,
    borderRadius: 1,
  },
  hiddenInput: {
    ...StyleSheet.absoluteFill,
    opacity: 0.02,
    color: 'transparent',
    fontSize: 1,
    outlineWidth: 0,
  },
});
