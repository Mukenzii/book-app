import { Image } from 'expo-image';
import { memo, useCallback, useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Icon } from '@/components/icons/Icon';
import { CastleText } from '@/components/ui/CastleText';
import { getBook, promoAssets } from '@/data/books';
import { useTheme } from '@/theme/ThemeProvider';
import { dimension } from '@/theme/tokens';

import { dotEmphasis, dotWidth, pageForOffset } from './carouselMath';

export type PromoAction = 'exclusive' | 'subscription' | 'formats';

type Slide = {
  id: PromoAction;
  /** Figma nodes 124:376 / 124:377 / 124:378 */
  node: string;
  title: string;
  description: string;
  cta: string;
};

export const PROMO_SLIDES: Slide[] = [
  {
    id: 'exclusive',
    node: '124:376',
    title: '«Файл надежды»\nтолько у нас',
    description: 'История про любовь,\nсмерть и робота',
    cta: 'Подробнее',
  },
  {
    id: 'subscription',
    node: '124:377',
    title: 'Читайте больше\nс подпиской',
    description: 'Большой книжный каталог\nв одном приложении',
    cta: 'О подписке',
  },
  {
    id: 'formats',
    node: '124:378',
    title: 'Книги в удобном\nформате',
    description: 'Электронные и аудиокниги.\nВыбирайте свою историю.',
    cta: 'Выбрать книгу',
  },
];

const Artwork = memo(function Artwork({ id }: { id: PromoAction }) {
  const { colors } = useTheme();
  if (id === 'exclusive') {
    return (
      <View style={styles.artwork}>
        <Image source={promoAssets.authorPortrait} style={styles.portrait} contentFit="cover" />
        <Image source={getBook('file-nadezhdy')?.cover} style={styles.exclusiveBook} contentFit="contain" />
      </View>
    );
  }
  if (id === 'subscription') {
    return (
      <View style={styles.artwork}>
        <Image source={getBook('stan-svetom')?.cover} style={[styles.subscriptionBook, { left: 0, top: 8 }]} contentFit="contain" />
        <Image source={getBook('chetvertoe-krylo')?.cover} style={[styles.subscriptionBook, { left: 40, top: 54 }]} contentFit="contain" />
      </View>
    );
  }
  return (
    <View style={styles.artwork}>
      <View style={[styles.formatSymbol, { left: 0, top: 0, backgroundColor: colors.surface }]}>
        <Icon name="bookTwoTone" size={40} color={colors.actionAccent} />
      </View>
      <View style={[styles.formatSymbol, { left: 44, top: 88, backgroundColor: colors.surface }]}>
        <Icon name="headphone" size={40} color={colors.actionAccent} />
      </View>
    </View>
  );
});

const SLIDE_COUNT = PROMO_SLIDES.length;

type PromoSlideProps = {
  slide: Slide;
  width: number;
  hidden: boolean;
  onAction: (action: PromoAction) => void;
};

/** Memoized so page changes only touch accessibility props, never the artwork. */
const PromoSlide = memo(function PromoSlide({ slide, width, hidden, onAction }: PromoSlideProps) {
  return (
    <View
      testID={`promo-slide-${slide.id}`}
      style={[styles.slide, { width }]}
      accessibilityElementsHidden={hidden}
      importantForAccessibility={hidden ? 'no-hide-descendants' : 'auto'}
    >
      <View style={styles.copy}>
        <CastleText variant="section">{slide.title}</CastleText>
        <CastleText variant="small" tone="textSecondary">
          {slide.description}
        </CastleText>
        <Pressable
          testID={`promo-cta-${slide.id}`}
          onPress={() => onAction(slide.id)}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={`${slide.cta}: ${slide.title.replace('\n', ' ')}`}
        >
          {({ pressed }) => (
            <CastleText variant="small" tone="actionAccent" style={{ opacity: pressed ? 0.6 : 1 }}>
              {slide.cta}
            </CastleText>
          )}
        </Pressable>
      </View>
      <Artwork id={slide.id} />
    </View>
  );
});

type PaginationDotProps = {
  index: number;
  selected: boolean;
  scrollX: SharedValue<number>;
  pageWidth: SharedValue<number>;
  activeColor: string;
  inactiveColor: string;
  onPress: (index: number) => void;
};

/**
 * The pill stretches 8 → 24 → 8pt and blends its colour as the neighbouring page
 * scrolls in, driven by the scroll offset on the UI thread (no React renders).
 */
const PaginationDot = memo(function PaginationDot({
  index,
  selected,
  scrollX,
  pageWidth,
  activeColor,
  inactiveColor,
  onPress,
}: PaginationDotProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const progress = pageWidth.value > 0 ? scrollX.value / pageWidth.value : 0;
    const emphasis = dotEmphasis(progress, index);
    return {
      width: dotWidth(emphasis),
      backgroundColor: interpolateColor(emphasis, [0, 1], [inactiveColor, activeColor]),
    };
  });
  return (
    <Pressable
      testID={`promo-dot-${index}`}
      onPress={() => onPress(index)}
      hitSlop={{ top: 18, bottom: 18, left: 4, right: 4 }}
      accessibilityRole="button"
      accessibilityLabel={`Слайд ${index + 1} из ${SLIDE_COUNT}`}
      accessibilityState={{ selected }}
    >
      <Animated.View style={[styles.dot, animatedStyle]} />
    </Pressable>
  );
});

export function PromoCarousel({ onAction }: { onAction: (action: PromoAction) => void }) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollX = useSharedValue(0);
  const pageWidth = useSharedValue(0);

  const onLayout = (event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.width;
    pageWidth.value = next;
    setWidth(next);
  };

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  // The visible page only feeds accessibility (which slide is exposed) and the dots'
  // selected state, so React hears about it once per page, not once per frame.
  useAnimatedReaction(
    () => pageForOffset(scrollX.value, pageWidth.value, SLIDE_COUNT),
    (page, previous) => {
      if (page !== previous) scheduleOnRN(setIndex, page);
    },
  );

  const goTo = useCallback(
    (next: number) => {
      setIndex(next);
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
    },
    [scrollRef, width],
  );

  return (
    <View
      testID="promo-carousel"
      onLayout={onLayout}
      style={[styles.card, { backgroundColor: colors.actionTint }]}
    >
      <Animated.ScrollView
        ref={scrollRef}
        testID="promo-pager"
        horizontal
        pagingEnabled
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={styles.pager}
      >
        {PROMO_SLIDES.map((slide, slideIndex) => (
          <PromoSlide
            key={slide.id}
            slide={slide}
            width={width || 358}
            hidden={slideIndex !== index}
            onAction={onAction}
          />
        ))}
      </Animated.ScrollView>
      <View style={styles.pagination}>
        {PROMO_SLIDES.map((slide, dotIndex) => (
          <PaginationDot
            key={slide.id}
            index={dotIndex}
            selected={dotIndex === index}
            scrollX={scrollX}
            pageWidth={pageWidth}
            activeColor={colors.actionAccent}
            inactiveColor={colors.borderDefault}
            onPress={goTo}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 252,
    borderRadius: dimension.d24,
    overflow: 'hidden',
    paddingVertical: 20,
    gap: 12,
  },
  pager: {
    flexGrow: 0,
    height: 192,
  },
  slide: {
    height: 192,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: dimension.d12,
  },
  copy: {
    flex: 1,
    gap: dimension.d12,
  },
  artwork: {
    width: 116,
    height: 168,
  },
  portrait: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 116,
    height: 132,
    borderRadius: 16,
  },
  exclusiveBook: {
    position: 'absolute',
    left: -8,
    top: 78,
    width: 58,
    height: 87,
    borderRadius: 4,
  },
  subscriptionBook: {
    position: 'absolute',
    width: 76,
    height: 112,
    borderRadius: 6,
  },
  formatSymbol: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: dimension.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pagination: {
    height: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: dimension.d8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
