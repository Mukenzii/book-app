import { memo } from 'react';
import { Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '@/theme/ThemeProvider';

import { iconDefinitions, type IconName, type IconPath, type IconTone } from './paths';

/** Icons are decorative: the pressable around them carries the accessible label. */
const DECORATIVE =
  Platform.OS === 'web'
    ? ({ 'aria-hidden': true } as const)
    : ({ accessible: false, importantForAccessibility: 'no-hide-descendants' } as const);

type IconProps = {
  name: IconName;
  size?: number;
  /** Main tone. Defaults to text-primary. */
  color?: string;
  /** Second tone of two-tone icons (genres, formats). Defaults to action-accent. */
  accentColor?: string;
};

export const Icon = memo(function Icon({ name, size = 24, color, accentColor }: IconProps) {
  const { colors } = useTheme();
  const definition = iconDefinitions[name];
  const paths: IconPath[] = definition.paths;
  const toneColor: Record<IconTone, string> = {
    fg: color ?? colors.textPrimary,
    accent: accentColor ?? colors.actionAccent,
    success: colors.feedbackSuccess,
  };
  return (
    <Svg
      width={size}
      height={size}
      viewBox={definition.viewBox}
      {...DECORATIVE}
      pointerEvents="none"
    >
      {paths.map((path, index) => (
        <Path
          key={index}
          d={path.d}
          fill={path.fill ? toneColor[path.fill] : 'none'}
          fillRule={path.fillRule}
        />
      ))}
    </Svg>
  );
});

export type { IconName };
