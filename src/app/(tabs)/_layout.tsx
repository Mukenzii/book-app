import { Tabs, type BottomTabBarProps } from 'expo-router/js-tabs';

import { BottomNavigation, TAB_ITEMS, type TabKey } from '@/components/navigation/BottomNavigation';
import { useTheme } from '@/theme/ThemeProvider';

function CastleTabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const focused = state.routes[state.index];
  return (
    <BottomNavigation
      activeKey={(focused?.name ?? 'index') as TabKey}
      onSelect={(key) => {
        const route = state.routes.find((candidate) => candidate.name === key);
        if (!route) return;
        const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
        if (route.key !== focused?.key && !event.defaultPrevented) navigateToTab(route.key);
      }}
    />
  );
}

/**
 * The Castle designs define their own bottom navigation (Castle / App / Navigation),
 * so the JS tab navigator is used with a custom bar instead of the platform tab bar.
 */
export default function TabsLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      backBehavior="history"
      tabBar={(props) => <CastleTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.canvas } }}
    >
      {TAB_ITEMS.map((item) => (
        <Tabs.Screen key={item.key} name={item.key} options={{ title: item.label }} />
      ))}
    </Tabs>
  );
}
