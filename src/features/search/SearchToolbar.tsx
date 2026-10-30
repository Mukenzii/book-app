import { forwardRef } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputInstance } from 'react-native';

import { Icon } from '@/components/icons/Icon';
import { IconButton } from '@/components/ui/Buttons';
import { CastleText } from '@/components/ui/CastleText';
import { useTheme } from '@/theme/ThemeProvider';
import { dimension } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export const SEARCH_PLACEHOLDER = 'Название, автор или жанр';

type BaseProps = { onBack: () => void };

type InputProps = BaseProps & {
  mode: 'input';
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  onClear: () => void;
};

type DisplayProps = BaseProps & {
  mode: 'display';
  value: string;
  onPress: () => void;
  onClear: () => void;
};

/** Castle / Search / Header toolbar: back + query field (h48). */
export const SearchToolbar = forwardRef<TextInputInstance, InputProps | DisplayProps>(function SearchToolbar(props, ref) {
  const { colors, scheme } = useTheme();
  const clearButton = props.value ? (
    <Pressable
      testID="search-clear"
      onPress={props.onClear}
      hitSlop={13}
      accessibilityRole="button"
      accessibilityLabel="Очистить запрос"
    >
      <Icon name="clear" size={18} color={colors.textTertiary} />
    </Pressable>
  ) : null;

  return (
    <View style={styles.toolbar}>
      <IconButton icon="arrowBack" label="Назад" onPress={props.onBack} testID="search-back" />
      {props.mode === 'input' ? (
        <View style={[styles.field, { backgroundColor: colors.surface, borderColor: colors.actionAccent }]}>
          <Icon name="searchSmall" size={20} color={colors.textTertiary} />
          <TextInput
            ref={ref}
            testID="search-input"
            value={props.value}
            onChangeText={props.onChangeText}
            onSubmitEditing={props.onSubmit}
            placeholder={SEARCH_PLACEHOLDER}
            placeholderTextColor={colors.textTertiary}
            selectionColor={colors.actionAccent}
            cursorColor={colors.actionAccent}
            keyboardAppearance={scheme}
            returnKeyType="search"
            enterKeyHint="search"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            accessibilityLabel="Поиск книг"
            style={[styles.input, { color: colors.textPrimary }]}
          />
          {clearButton}
        </View>
      ) : (
        <View style={[styles.field, { backgroundColor: colors.surface, borderColor: 'transparent' }]}>
          <Pressable
            testID="search-query"
            onPress={props.onPress}
            accessibilityRole="search"
            accessibilityLabel={props.value ? `Запрос: ${props.value}. Изменить` : SEARCH_PLACEHOLDER}
            style={styles.displayPressable}
          >
            <Icon name="searchSmall" size={20} color={colors.textTertiary} />
            <CastleText
              variant="body"
              tone={props.value ? 'textPrimary' : 'textTertiary'}
              numberOfLines={1}
              style={[styles.flex, props.value ? null : typography.small]}
            >
              {props.value || SEARCH_PLACEHOLDER}
            </CastleText>
          </Pressable>
          {clearButton}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  toolbar: {
    height: 64,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: dimension.d8,
  },
  field: {
    flex: 1,
    height: 48,
    borderRadius: dimension.d12,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    ...typography.body,
    flex: 1,
    height: '100%',
    paddingVertical: 0,

    // The Castle field border is the focus indicator; drop the browser outline on web.
    outlineWidth: 0,
  },
  displayPressable: {
    flex: 1,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flex: {
    flex: 1,
  },
});
