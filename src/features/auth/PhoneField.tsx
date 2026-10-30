import { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputInstance } from 'react-native';

import { CastleText } from '@/components/ui/CastleText';
import { useTheme } from '@/theme/ThemeProvider';
import { dimension } from '@/theme/tokens';
import { typography } from '@/theme/typography';

import { COUNTRY_CODE, formatNational, PHONE_PLACEHOLDER, toNationalDigits } from './phone';

type PhoneFieldProps = {
  digits: string;
  onChangeDigits: (digits: string) => void;
  onBlur: () => void;
  onSubmit: () => void;
  error: boolean;
};

/** «Phone number» outlined field with floating caption and fixed +998 prefix. */
export const PhoneField = forwardRef<TextInputInstance, PhoneFieldProps>(function PhoneField(
  { digits, onChangeDigits, onBlur, onSubmit, error },
  ref,
) {
  const { colors, scheme } = useTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.feedbackDanger : focused ? colors.actionAccent : colors.borderDefault;
  const focusInput = () => {
    if (ref && typeof ref === 'object') ref.current?.focus();
  };

  return (
    <Pressable onPress={focusInput} accessible={false} style={[styles.field, { borderColor, backgroundColor: colors.surface }]}>
      <View style={styles.row}>
        <CastleText variant="button" accessibilityLabel="Код страны плюс 998">
          {COUNTRY_CODE}
        </CastleText>
        <View style={[styles.separator, { backgroundColor: colors.borderDefault }]} />
        <TextInput
          ref={ref}
          testID="phone-input"
          value={formatNational(digits)}
          onChangeText={(text) => onChangeDigits(toNationalDigits(text))}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur();
          }}
          onSubmitEditing={onSubmit}
          placeholder={PHONE_PLACEHOLDER}
          placeholderTextColor={colors.textTertiary}
          selectionColor={colors.actionAccent}
          cursorColor={colors.actionAccent}
          keyboardType="number-pad"
          inputMode="tel"
          textContentType="telephoneNumber"
          autoComplete="tel"
          keyboardAppearance={scheme}
          returnKeyType="done"
          maxLength={12}
          autoFocus
          accessibilityLabel="Номер телефона, 9 цифр после плюс 998"
          accessibilityState={{ disabled: false }}
          aria-invalid={error}
          style={[styles.input, { color: colors.textPrimary }]}
        />
      </View>
      <View style={[styles.caption, { backgroundColor: colors.surface }]} pointerEvents="none">
        <CastleText variant="caption" tone={error ? 'feedbackDanger' : 'textSecondary'}>
          Номер телефона
        </CastleText>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  field: {
    height: 56,
    borderWidth: 1,
    borderRadius: dimension.d12,
    paddingHorizontal: dimension.d16,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  separator: {
    width: 1,
    height: 20,
  },
  input: {
    ...typography.body,
    flex: 1,
    height: 54,
    paddingVertical: 0,

    // The Castle field border is the focus indicator; drop the browser outline on web.
    outlineWidth: 0,
  },
  caption: {
    position: 'absolute',
    left: 11,
    top: -9,
    paddingHorizontal: 4,
  },
});
