import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { CenteredToolbar, TopInset } from '@/components/navigation/Headers';
import { PrimaryButton } from '@/components/ui/Buttons';
import { CastleText } from '@/components/ui/CastleText';
import { useTheme } from '@/theme/ThemeProvider';

export default function NotFoundScreen() {
  const { colors } = useTheme();
  return (
    <View style={[styles.screen, { backgroundColor: colors.canvas }]}>
      <TopInset />
      <CenteredToolbar title="" onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
      <View style={styles.body}>
        <CastleText variant="section" align="center">
          Такого экрана нет
        </CastleText>
        <CastleText variant="small" tone="textSecondary" align="center">
          Ссылка ведёт на раздел, которого нет в макетах Castle.
        </CastleText>
        <PrimaryButton label="На главную" onPress={() => router.replace('/')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  body: { flex: 1, justifyContent: 'center', gap: 12, padding: 24 },
});
