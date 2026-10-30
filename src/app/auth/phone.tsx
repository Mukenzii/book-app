import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, View, type TextInputInstance } from 'react-native';

import { PrimaryButton } from '@/components/ui/Buttons';
import { CastleText } from '@/components/ui/CastleText';
import { AuthScaffold, DemoNote } from '@/features/auth/AuthScaffold';
import { requestCode } from '@/features/auth/demoSmsAdapter';
import { isCompletePhone, PHONE_ERROR } from '@/features/auth/phone';
import { PhoneField } from '@/features/auth/PhoneField';
import { showIntegrationNeeded } from '@/state/feedbackStore';

/** Телефон · Пустое поле (69:2269) · Готов к отправке (69:2340) · Ошибка номера (69:2619). */
export default function PhoneScreen() {
  const { returnTo } = useLocalSearchParams<{ returnTo?: 'library' | 'book' }>();
  const inputRef = useRef<TextInputInstance>(null);
  const [digits, setDigits] = useState('');
  const [showError, setShowError] = useState(false);
  const complete = isCompletePhone(digits);
  const error = showError && !complete;

  const validate = () => {
    if (digits.length > 0 && !complete) setShowError(true);
  };

  const submit = () => {
    if (!complete) {
      validate();
      return;
    }
    Keyboard.dismiss();
    requestCode(digits);
    router.push({ pathname: '/auth/code', params: { returnTo: returnTo ?? 'library' } });
  };

  return (
    <AuthScaffold
      title="Ваш номер телефона"
      subtitle={'Отправим SMS с кодом для входа.\nПароль не понадобится.'}
      onBack={() => router.back()}
      onClose={() => router.back()}
    >
      <View style={styles.spacing28} />
      <PhoneField
        ref={inputRef}
        digits={digits}
        onChangeDigits={(next) => {
          setDigits(next);
          if (showError) setShowError(false);
        }}
        onBlur={validate}
        onSubmit={submit}
        error={error}
      />
      <View style={styles.spacing8} />
      <CastleText
        testID="phone-helper"
        variant="small"
        tone={error ? 'feedbackDanger' : 'textTertiary'}
        accessibilityLiveRegion={error ? 'assertive' : 'none'}
        accessibilityRole={error ? 'alert' : undefined}
      >
        {error ? PHONE_ERROR : 'Номер нужен только для входа в аккаунт'}
      </CastleText>
      <View style={styles.flexSpace} />
      <DemoNote testID="demo-sms-note">Настоящая SMS не отправляется — код покажем на следующем шаге.</DemoNote>
      <View style={styles.spacing12} />
      <PrimaryButton label="Получить код" onPress={submit} disabled={!complete} testID="request-code" />
      <View style={styles.spacing12} />
      <Pressable
        onPress={() => showIntegrationNeeded('Условия сервиса', 'Юридические документы ещё не подключены.')}
        accessibilityRole="link"
        accessibilityLabel="Условия сервиса и политика конфиденциальности"
      >
        <CastleText variant="caption" tone="textTertiary" align="center">
          {'Нажимая «Получить код», вы принимаете условия\nсервиса и политику конфиденциальности.'}
        </CastleText>
      </Pressable>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  spacing28: { height: 28 },
  spacing12: { height: 12 },
  spacing8: { height: 8 },
  flexSpace: { flex: 1, minHeight: 16 },
});
