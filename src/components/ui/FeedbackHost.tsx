import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { dismissFeedback, useFeedback } from '@/state/feedbackStore';
import { useTheme } from '@/theme/ThemeProvider';
import { dimension } from '@/theme/tokens';

import { CastleText } from './CastleText';

/**
 * App-wide snackbar styled after the Castle «Success feedback» surface. It sits just
 * under the 56–64pt toolbars so it never covers a primary action or the tab bar.
 */
export function FeedbackHost() {
  const message = useFeedback();
  const insets = useSafeAreaInsets();
  const { colors, scheme } = useTheme();
  if (!message) return null;
  return (
    <View pointerEvents="box-none" style={[styles.host, { top: insets.top + 68 }]}>
      <Pressable
        testID="feedback-toast"
        onPress={() => dismissFeedback(message.id)}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        accessibilityHint="Нажмите, чтобы закрыть"
        style={[
          styles.toast,
          {
            backgroundColor: colors.surface,
            borderColor: colors.borderDefault,
            shadowOpacity: scheme === 'dark' ? 0.5 : 0.12,
          },
        ]}
      >
        {message.tone === 'success' ? <Icon name="check" size={20} color={colors.feedbackSuccess} /> : null}
        {message.tone === 'integration' ? <Icon name="puzzle" size={20} color={colors.actionAccent} /> : null}
        <View style={styles.text}>
          <CastleText variant="small">{message.title}</CastleText>
          {message.description ? (
            <CastleText variant="caption" tone="textSecondary">
              {message.description}
            </CastleText>
          ) : null}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: dimension.d16,
    right: dimension.d16,
    alignItems: 'stretch',
  },
  toast: {
    minHeight: 52,
    borderRadius: dimension.d16,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: dimension.d16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 6,
  },
  text: {
    flex: 1,
    gap: 2,
  },
});
