import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Keyboard, StyleSheet, View, type TextInputInstance } from 'react-native';

import { PrimaryButton, TextLink } from '@/components/ui/Buttons';
import { CastleText } from '@/components/ui/CastleText';
import { AuthScaffold, DemoNote } from '@/features/auth/AuthScaffold';
import {
  CODE_LENGTH,
  clearChallenge,
  formatCountdown,
  requestCode,
  secondsUntilResend,
  useChallenge,
  verifyCode,
} from '@/features/auth/demoSmsAdapter';
import { maskPhone } from '@/features/auth/phone';
import { PinInput } from '@/features/auth/PinInput';
import { useNow } from '@/features/auth/useNow';
import { appActions } from '@/state/appStore';
import { showFeedback } from '@/state/feedbackStore';

const CODE_ERROR = 'Неверный код. Попробуйте ещё раз.';

/**
 * SMS · Ожидание кода (69:2411) · Код введён (69:2490) · Неверный код (69:2690)
 * · Повторная отправка (69:2769).
 */
export default function CodeScreen() {
  const { returnTo } = useLocalSearchParams<{ returnTo?: 'library' | 'book' }>();
  const challenge = useChallenge();
  const inputRef = useRef<TextInputInstance>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const now = useNow(challenge !== null);

  if (!challenge) return <Redirect href="/auth/phone" />;

  const secondsLeft = secondsUntilResend(challenge.sentAt, now);
  const complete = code.length === CODE_LENGTH;

  const confirm = () => {
    if (!complete) return;
    if (!verifyCode(code)) {
      setError(true);
      return;
    }
    Keyboard.dismiss();
    appActions.signIn(challenge.phone);
    clearChallenge();
    if (returnTo === 'book') {
      router.dismiss(2);
      showFeedback({ tone: 'success', title: 'Вы вошли в аккаунт' });
    } else {
      router.dismissTo('/library');
    }
  };

  const resend = () => {
    requestCode(challenge.phone);
    setCode('');
    setError(false);
    inputRef.current?.focus();
    showFeedback({ tone: 'info', title: 'Новый демо-код создан', description: 'SMS не отправлялась — код показан на экране.' });
  };

  return (
    <AuthScaffold
      title="Введите код"
      subtitle={`Отправили SMS с кодом\nна ${maskPhone(challenge.phone)}`}
      onBack={() => router.back()}
      onClose={() => router.dismiss(2)}
    >
      <TextLink label="Изменить номер" onPress={() => router.back()} testID="change-phone" />
      <View style={styles.spacing12} />
      <PinInput
        ref={inputRef}
        value={code}
        error={error}
        onChange={(next) => {
          setCode(next);
          if (error) setError(false);
        }}
      />
      <View style={styles.spacing8} />
      <CastleText
        testID="code-helper"
        variant="small"
        tone={error ? 'feedbackDanger' : 'textTertiary'}
        accessibilityRole={error ? 'alert' : undefined}
        accessibilityLiveRegion={error ? 'assertive' : 'none'}
      >
        {error ? CODE_ERROR : 'Код состоит из 6 цифр'}
      </CastleText>
      {secondsLeft > 0 ? (
        <View style={styles.resendRow}>
          <CastleText testID="resend-countdown" variant="small" tone="textTertiary">
            {`Новый код можно получить через ${formatCountdown(secondsLeft)}`}
          </CastleText>
        </View>
      ) : (
        <TextLink label="Отправить код ещё раз" onPress={resend} testID="resend-code" />
      )}
      <View style={styles.flexSpace} />
      <DemoNote testID="demo-code-note">{`SMS не отправлялась. Код для входа: ${challenge.demoCode}`}</DemoNote>
      <View style={styles.spacing12} />
      <PrimaryButton label="Подтвердить" onPress={confirm} disabled={!complete || error} testID="confirm-code" />
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  spacing12: { height: 12 },
  spacing8: { height: 8 },
  resendRow: { minHeight: 44, justifyContent: 'center' },
  flexSpace: { flex: 1, minHeight: 16 },
});
