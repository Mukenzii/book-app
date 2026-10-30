import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/icons/Icon';
import { CastleText } from '@/components/ui/CastleText';
import { useTheme } from '@/theme/ThemeProvider';

export type TabKey = 'index' | 'catalog' | 'library' | 'profile';

export const TAB_ITEMS: { key: TabKey; label: string; icon: IconName }[] = [
  { key: 'index', label: 'Главная', icon: 'home' },
  { key: 'catalog', label: 'Каталог', icon: 'search' },
  { key: 'library', label: 'Мои книги', icon: 'book' },
  { key: 'profile', label: 'Профиль', icon: 'person' },
];

type BottomNavigationProps = {
  activeKey: TabKey;
  onSelect: (key: TabKey) => void;
};

/** Castle / App / Navigation — 60pt tab row on a surface, plus the bottom safe area. */
export function BottomNavigation({ activeKey, onSelect }: BottomNavigationProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.bar,
        { backgroundColor: colors.surface, borderTopColor: colors.borderDefault, paddingBottom: Math.max(insets.bottom, 8) },
      ]}
    >
      {TAB_ITEMS.map((item) => {
        const active = item.key === activeKey;
        const tint = active ? colors.actionAccent : colors.textTertiary;
        return (
          <Pressable
            key={item.key}
            testID={`tab-${item.key}`}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(item.key)}
            style={({ pressed }) => [styles.item, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Icon name={item.icon} size={24} color={tint} />
            <CastleText variant="tab" style={{ color: tint }} numberOfLines={1} maxFontSizeMultiplier={1.3}>
              {item.label}
            </CastleText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  item: {
    flex: 1,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
});
