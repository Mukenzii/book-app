import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/icons/Icon';
import { useTheme } from '@/theme/ThemeProvider';
import { dimension } from '@/theme/tokens';

import { CastleText } from './CastleText';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  accessibilityHint?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Castle / Button (Large, 56). Enabled: accent fill with a top sheen and a 16 radius.
 * Disabled: neutral pill, exactly as in the auth states 02/04/07/08/09.
 */
export function PrimaryButton({ label, onPress, disabled = false, accessibilityHint, testID, style }: PrimaryButtonProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.primary,
        disabled
          ? { backgroundColor: colors.actionDisabled, borderRadius: dimension.pill }
          : { backgroundColor: colors.actionAccent, borderRadius: dimension.d16, opacity: pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {disabled ? null : (
        <>
          <LinearGradient
            pointerEvents="none"
            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0)']}
            style={StyleSheet.absoluteFill}
          />
          <View pointerEvents="none" style={[styles.innerShadow, { backgroundColor: colors.fxControlShadow }]} />
        </>
      )}
      <CastleText variant="button" tone={disabled ? 'textDisabled' : 'textInverse'} numberOfLines={1}>
        {label}
      </CastleText>
    </Pressable>
  );
}

type IconButtonProps = {
  icon: IconName;
  label: string;
  onPress: () => void;
  selected?: boolean;
  iconColor?: string;
  testID?: string;
};

/** Castle / Icon button — 40pt circle, 44pt effective target via hitSlop. */
export function IconButton({ icon, label, onPress, selected, iconColor, testID }: IconButtonProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={selected === undefined ? undefined : { selected }}
      style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.actionNeutral, opacity: pressed ? 0.6 : 1 }]}
    >
      <Icon name={icon} size={20} color={iconColor ?? colors.textPrimary} />
    </Pressable>
  );
}

type TextLinkProps = {
  label: string;
  onPress: () => void;
  align?: 'left' | 'center';
  testID?: string;
};

/** Accent text action with a 44pt tall hit area (Figma «Link / …»). */
export function TextLink({ label, onPress, align = 'left', testID }: TextLinkProps) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.link, align === 'center' ? styles.linkCenter : null, { opacity: pressed ? 0.6 : 1 }]}
    >
      <CastleText variant="small" tone="actionAccent">
        {label}
      </CastleText>
    </Pressable>
  );
}

/** Surface row with title/caption and trailing chevron (Castle / Book / Metadata row). */
export function ListRow({
  title,
  caption,
  onPress,
  leading,
}: {
  title: string;
  caption?: string;
  onPress: () => void;
  leading?: ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={caption ? `${caption}: ${title}` : title}
      style={({ pressed }) => [styles.row, { backgroundColor: colors.surface, opacity: pressed ? 0.7 : 1 }]}
    >
      {leading}
      <View style={styles.rowText}>
        <CastleText variant="small">{title}</CastleText>
        {caption ? (
          <CastleText variant="caption" tone="textSecondary">
            {caption}
          </CastleText>
        ) : null}
      </View>
      <Icon name="chevron" size={20} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primary: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: dimension.d16,
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  innerShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: dimension.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: {
    minHeight: 44,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  linkCenter: {
    alignSelf: 'center',
  },
  row: {
    minHeight: 72,
    borderRadius: dimension.d16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: dimension.d12,
    paddingHorizontal: dimension.d16,
    paddingVertical: 12,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
});
