// src/components/enhanced/ResponsiveLayout.tsx
// Mobile-first responsive layout system

import React from 'react';
import { Dimensions, Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { breakpoints, colors, spacing } from '../../theme/design-system';

const { width, height } = Dimensions.get('window');

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  variant?: 'mobile' | 'tablet' | 'desktop' | 'auto';
  padding?: keyof typeof spacing;
  maxWidth?: number;
  centered?: boolean;
  style?: ViewStyle;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  variant = 'auto',
  padding = 4,
  maxWidth,
  centered = false,
  style,
}) => {
  const getLayoutVariant = () => {
    if (variant !== 'auto') return variant;

    if (width >= breakpoints.lg) return 'desktop';
    if (width >= breakpoints.md) return 'tablet';
    return 'mobile';
  };

  const currentVariant = getLayoutVariant();

  const containerStyles = [
    styles.container,
    styles[currentVariant],
    {
      padding: spacing[padding],
      maxWidth: maxWidth || (currentVariant === 'desktop' ? 1200 : undefined),
    },
    centered && styles.centered,
    style,
  ].filter(Boolean);

  return <View style={containerStyles}>{children}</View>;
};

interface GridProps {
  children: React.ReactNode;
  columns?: number;
  cols?: number; // Alias for columns for backward compatibility
  gap?: keyof typeof spacing;
  spacing?: keyof typeof spacing; // Alias for gap for backward compatibility
  responsive?: boolean;
  style?: ViewStyle;
}

export const Grid: React.FC<GridProps> = ({
  children,
  columns,
  cols,
  gap,
  spacing: spacingProp,
  responsive = true,
  style,
}) => {
  const columnCount = columns || cols || 2;
  const actualGap = gap || spacingProp || 3;

  const getColumns = () => {
    if (!responsive) return columnCount;

    if (width >= breakpoints.lg) return Math.min(columnCount, 4);
    if (width >= breakpoints.md) return Math.min(columnCount, 3);
    if (width >= breakpoints.sm) return Math.min(columnCount, 2);
    return 1;
  };

  const finalColumns = getColumns();
  const gapSize = spacing[actualGap];

  return (
    <View style={[styles.grid, { gap: gapSize }, style]}>
      {React.Children.map(children, (child, index) => (
        <View
          style={[
            styles.gridItem,
            {
              width: `${100 / finalColumns}%`,
              marginBottom: gapSize,
            },
          ]}
        >
          {child}
        </View>
      ))}
    </View>
  );
};

interface FlexLayoutProps {
  children: React.ReactNode;
  direction?: 'row' | 'column';
  justify?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  align?: 'flex-start' | 'flex-end' | 'center' | 'stretch';
  wrap?: boolean;
  gap?: keyof typeof spacing;
  flex?: number;
}

export const FlexLayout: React.FC<FlexLayoutProps> = ({
  children,
  direction = 'row',
  justify = 'flex-start',
  align = 'flex-start',
  wrap = false,
  gap = 0,
  flex,
}) => {
  return (
    <View
      style={[
        {
          flexDirection: direction,
          justifyContent: justify,
          alignItems: align,
          flexWrap: wrap ? 'wrap' : 'nowrap',
          gap: spacing[gap],
          flex,
        },
      ]}
    >
      {children}
    </View>
  );
};

interface SafeAreaProps {
  children: React.ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  backgroundColor?: string;
}

export const SafeArea: React.FC<SafeAreaProps> = ({
  children,
  edges = ['top', 'bottom'],
  backgroundColor = colors.background,
}) => {
  // Simple safe area implementation
  // In production, use react-native-safe-area-context
  const safePadding = Platform.select({
    ios: {
      paddingTop: edges.includes('top') ? 44 : 0,
      paddingBottom: edges.includes('bottom') ? 34 : 0,
    },
    android: {
      paddingTop: edges.includes('top') ? 24 : 0,
    },
    default: {},
  });

  return <View style={[styles.safeArea, { backgroundColor }, safePadding]}>{children}</View>;
};

interface StackProps {
  children: React.ReactNode;
  spacing?: keyof typeof spacing;
  alignment?: 'leading' | 'center' | 'trailing';
  align?: 'leading' | 'center' | 'trailing'; // Alias for alignment for backward compatibility
  style?: ViewStyle;
  onPress?: () => void;
}

export const Stack: React.FC<StackProps> = ({
  children,
  spacing: stackSpacing = 3,
  alignment,
  align,
  style,
  onPress,
}) => {
  const actualAlignment = alignment || align || 'leading';
  const alignItems = {
    leading: 'flex-start',
    center: 'center',
    trailing: 'flex-end',
  }[actualAlignment] as any;

  const containerProps = onPress ? { onTouchEnd: onPress } : {};

  return (
    <View
      style={[
        styles.stack,
        {
          gap: spacing[stackSpacing],
          alignItems,
        },
        style,
      ]}
      {...containerProps}
    >
      {children}
    </View>
  );
};

interface HStackProps {
  children: React.ReactNode;
  spacing?: keyof typeof spacing;
  alignment?: 'top' | 'center' | 'bottom';
  align?: 'top' | 'center' | 'bottom'; // Alias for alignment for backward compatibility
  distribution?: 'leading' | 'center' | 'trailing' | 'space-between' | 'space-around';
  justify?: 'leading' | 'center' | 'trailing' | 'space-between' | 'space-around'; // Alias for distribution
  style?: ViewStyle;
}

export const HStack: React.FC<HStackProps> = ({
  children,
  spacing: stackSpacing = 3,
  alignment,
  align,
  distribution,
  justify,
  style,
}) => {
  const actualAlignment = alignment || align || 'center';
  const actualDistribution = distribution || justify || 'leading';

  const alignItems = {
    top: 'flex-start',
    center: 'center',
    bottom: 'flex-end',
  }[actualAlignment] as any;

  const justifyContent = {
    leading: 'flex-start',
    center: 'center',
    trailing: 'flex-end',
    'space-between': 'space-between',
    'space-around': 'space-around',
  }[actualDistribution] as any;

  return (
    <View
      style={[
        styles.hstack,
        {
          gap: spacing[stackSpacing],
          alignItems,
          justifyContent,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  mobile: {
    minWidth: 0,
  },

  tablet: {
    minWidth: breakpoints.md,
  },

  desktop: {
    minWidth: breakpoints.lg,
  },

  centered: {
    alignSelf: 'center',
    width: '100%',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing[1],
  },

  gridItem: {
    paddingHorizontal: spacing[1],
  },

  safeArea: {
    flex: 1,
  },

  stack: {
    flexDirection: 'column',
  },

  hstack: {
    flexDirection: 'row',
  },
});

// Hook for responsive values
export function useResponsiveValue<T>(values: {
  mobile?: T;
  tablet?: T;
  desktop?: T;
  default: T;
}): T {
  if (width >= breakpoints.lg && values.desktop !== undefined) {
    return values.desktop;
  }

  if (width >= breakpoints.md && values.tablet !== undefined) {
    return values.tablet;
  }

  if (values.mobile !== undefined) {
    return values.mobile;
  }

  return values.default;
}

// Hook for screen size detection
export const useScreenSize = () => {
  const [screenData, setScreenData] = React.useState({
    width,
    height,
    isMobile: width < breakpoints.md,
    isTablet: width >= breakpoints.md && width < breakpoints.lg,
    isDesktop: width >= breakpoints.lg,
  });

  React.useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData({
        width: window.width,
        height: window.height,
        isMobile: window.width < breakpoints.md,
        isTablet: window.width >= breakpoints.md && window.width < breakpoints.lg,
        isDesktop: window.width >= breakpoints.lg,
      });
    });

    return () => subscription?.remove();
  }, []);

  return screenData;
};

export default {
  ResponsiveLayout,
  Grid,
  FlexLayout,
  SafeArea,
  Stack,
  HStack,
  useResponsiveValue,
  useScreenSize,
};
