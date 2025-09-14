// src/components/enhanced/EnhancedLoading.tsx
// Advanced loading component with various animations and states

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions, Easing } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme/design-system';

export interface LoadingProps {
  visible?: boolean;
  type?: 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'progress' | 'wave';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
  overlay?: boolean;
  fullScreen?: boolean;
  progress?: number; // 0-100 for progress type
  style?: any;
}

const { width: screenWidth } = Dimensions.get('window');

export const EnhancedLoading: React.FC<LoadingProps> = ({
  visible = true,
  type = 'spinner',
  size = 'md',
  color = colors.primary[600],
  text,
  overlay = false,
  fullScreen = false,
  progress = 0,
  style,
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const waveValue = useRef(new Animated.Value(0)).current;
  const dotValues = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    if (!visible) return;

    let animation: Animated.CompositeAnimation;

    switch (type) {
      case 'spinner':
        animation = Animated.loop(
          Animated.timing(spinValue, {
            toValue: 1,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        );
        break;

      case 'pulse':
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseValue, {
              toValue: 1.2,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(pulseValue, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        );
        break;

      case 'dots':
        const dotAnimations = dotValues.map((dotValue, index) =>
          Animated.loop(
            Animated.sequence([
              Animated.delay(index * 200),
              Animated.timing(dotValue, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
              }),
              Animated.timing(dotValue, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
              }),
            ])
          )
        );
        animation = Animated.parallel(dotAnimations);
        break;

      case 'wave':
        animation = Animated.loop(
          Animated.timing(waveValue, {
            toValue: 1,
            duration: 1500,
            easing: Easing.ease,
            useNativeDriver: true,
          })
        );
        break;
    }

    if (animation) {
      animation.start();
      return () => animation.stop();
    }
  }, [visible, type]);

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { width: 20, height: 20 };
      case 'lg':
        return { width: 60, height: 60 };
      default:
        return { width: 40, height: 40 };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return typography.sizes.sm;
      case 'lg':
        return typography.sizes.lg;
      default:
        return typography.sizes.base;
    }
  };

  const renderSpinner = () => {
    const spin = spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    const sizeStyles = getSizeStyles();

    return (
      <Animated.View
        style={[
          styles.spinner,
          sizeStyles,
          { borderColor: `${color}20`, borderTopColor: color },
          { transform: [{ rotate: spin }] },
        ]}
      />
    );
  };

  const renderDots = () => {
    const sizeStyles = getSizeStyles();
    const dotSize = sizeStyles.width / 4;

    return (
      <View style={[styles.dotsContainer, { width: sizeStyles.width }]}>
        {dotValues.map((dotValue, index) => {
          const scale = dotValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1.2],
          });

          const opacity = dotValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: dotSize,
                  height: dotSize,
                  backgroundColor: color,
                  transform: [{ scale }],
                  opacity,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  const renderPulse = () => {
    const sizeStyles = getSizeStyles();

    return (
      <Animated.View
        style={[
          styles.pulse,
          sizeStyles,
          {
            backgroundColor: color,
            transform: [{ scale: pulseValue }],
          },
        ]}
      />
    );
  };

  const renderSkeleton = () => {
    return (
      <View style={styles.skeletonContainer}>
        <View style={[styles.skeletonLine, styles.skeletonTitle]} />
        <View style={[styles.skeletonLine, styles.skeletonText]} />
        <View style={[styles.skeletonLine, styles.skeletonText, { width: '70%' }]} />
        <View style={[styles.skeletonLine, styles.skeletonText, { width: '85%' }]} />
      </View>
    );
  };

  const renderProgress = () => {
    const sizeStyles = getSizeStyles();

    return (
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { height: sizeStyles.height / 2 }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.max(0, Math.min(100, progress))}%`,
                backgroundColor: color,
              },
            ]}
          />
        </View>
        {text && (
          <Text style={[styles.progressText, { fontSize: getTextSize() }]}>
            {text} {Math.round(progress)}%
          </Text>
        )}
      </View>
    );
  };

  const renderWave = () => {
    const translateX = waveValue.interpolate({
      inputRange: [0, 1],
      outputRange: [-screenWidth, screenWidth],
    });

    return (
      <View style={styles.waveContainer}>
        <Animated.View
          style={[
            styles.wave,
            {
              backgroundColor: color,
              transform: [{ translateX }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.wave,
            styles.waveSecondary,
            {
              backgroundColor: `${color}60`,
              transform: [{ translateX }],
            },
          ]}
        />
      </View>
    );
  };

  const renderLoadingContent = () => {
    let loadingElement;

    switch (type) {
      case 'dots':
        loadingElement = renderDots();
        break;
      case 'pulse':
        loadingElement = renderPulse();
        break;
      case 'skeleton':
        loadingElement = renderSkeleton();
        break;
      case 'progress':
        loadingElement = renderProgress();
        break;
      case 'wave':
        loadingElement = renderWave();
        break;
      default:
        loadingElement = renderSpinner();
    }

    return (
      <View style={[styles.loadingContent, type !== 'skeleton' && styles.centeredContent]}>
        {loadingElement}
        {text && type !== 'progress' && type !== 'skeleton' && (
          <Text style={[styles.loadingText, { fontSize: getTextSize() }]}>{text}</Text>
        )}
      </View>
    );
  };

  if (!visible) return null;

  const containerStyle = [
    styles.container,
    overlay && styles.overlay,
    fullScreen && styles.fullScreen,
    style,
  ];

  return <View style={containerStyle}>{renderLoadingContent()}</View>;
};

// Skeleton Loading Components
interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
  animated?: boolean;
}

export const SkeletonLine: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius: borderRadiusValue = borderRadius.base,
  style,
  animated = true,
}) => {
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;

    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );

    shimmerAnimation.start();
    return () => shimmerAnimation.stop();
  }, [animated]);

  const translateX = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View
      style={[
        styles.skeletonLine,
        {
          width,
          height,
          borderRadius: borderRadiusValue,
        },
        style,
      ]}
    >
      {animated && (
        <Animated.View
          style={[
            styles.skeletonShimmer,
            {
              transform: [{ translateX }],
            },
          ]}
        />
      )}
    </View>
  );
};

export const SkeletonCircle: React.FC<SkeletonProps> = ({
  width = 40,
  height,
  style,
  animated = true,
}) => {
  const circleHeight = height || (typeof width === 'number' ? width : 40);

  return (
    <SkeletonLine
      width={width}
      height={circleHeight}
      borderRadius={typeof width === 'number' ? width / 2 : 20}
      style={style}
      animated={animated}
    />
  );
};

// Loading Card Component
interface LoadingCardProps {
  rows?: number;
  showAvatar?: boolean;
  showImage?: boolean;
  style?: any;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  rows = 3,
  showAvatar = false,
  showImage = false,
  style,
}) => {
  return (
    <View style={[styles.loadingCard, style]}>
      {showImage && <SkeletonLine height={200} style={styles.loadingCardImage} />}

      <View style={styles.loadingCardContent}>
        {showAvatar && (
          <View style={styles.loadingCardHeader}>
            <SkeletonCircle width={40} />
            <View style={styles.loadingCardHeaderText}>
              <SkeletonLine height={16} width="60%" />
              <SkeletonLine height={12} width="40%" style={{ marginTop: spacing[1] }} />
            </View>
          </View>
        )}

        <SkeletonLine height={20} width="80%" style={{ marginBottom: spacing[2] }} />

        {Array.from({ length: rows }).map((_, index) => (
          <SkeletonLine
            key={index}
            height={14}
            width={index === rows - 1 ? '70%' : '100%'}
            style={{ marginBottom: spacing[1] }}
          />
        ))}
      </View>
    </View>
  );
};

// Global Loading Context
interface LoadingContextType {
  showLoading: (options?: Partial<LoadingProps>) => void;
  hideLoading: () => void;
  isLoading: boolean;
}

const LoadingContext = React.createContext<LoadingContextType>({
  showLoading: () => {},
  hideLoading: () => {},
  isLoading: false,
});

export const useLoading = () => React.useContext(LoadingContext);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = React.useState<LoadingProps | null>(null);

  const showLoading = (options: Partial<LoadingProps> = {}) => {
    setLoading({
      visible: true,
      overlay: true,
      fullScreen: true,
      ...options,
    });
  };

  const hideLoading = () => {
    setLoading(null);
  };

  return (
    <LoadingContext.Provider
      value={{
        showLoading,
        hideLoading,
        isLoading: loading?.visible || false,
      }}
    >
      {children}
      {loading && <EnhancedLoading {...loading} />}
    </LoadingContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1000,
  },

  fullScreen: {
    flex: 1,
  },

  loadingContent: {
    alignItems: 'center',
  },

  centeredContent: {
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: spacing[3],
    color: colors.text.secondary,
    textAlign: 'center',
  },

  // Spinner styles
  spinner: {
    borderWidth: 3,
    borderRadius: 50,
    borderStyle: 'solid',
  },

  // Dots styles
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  dot: {
    borderRadius: 50,
  },

  // Pulse styles
  pulse: {
    borderRadius: 50,
  },

  // Skeleton styles
  skeletonContainer: {
    padding: spacing[4],
    width: '100%',
  },

  skeletonLine: {
    backgroundColor: colors.gray[200],
    marginBottom: spacing[2],
    overflow: 'hidden',
    position: 'relative',
  },

  skeletonTitle: {
    height: 20,
    width: '60%',
    marginBottom: spacing[3],
  },

  skeletonText: {
    height: 14,
  },

  skeletonShimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    width: 200,
  },

  // Progress styles
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },

  progressBar: {
    width: '100%',
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing[2],
  },

  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },

  progressText: {
    color: colors.text.secondary,
    textAlign: 'center',
  },

  // Wave styles
  waveContainer: {
    width: '100%',
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    position: 'relative',
  },

  wave: {
    position: 'absolute',
    top: 0,
    left: -50,
    right: -50,
    height: '100%',
    width: 100,
    borderRadius: borderRadius.full,
  },

  waveSecondary: {
    width: 50,
    left: -25,
    right: -25,
  },

  // Loading Card styles
  loadingCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing[4],
  },

  loadingCardImage: {
    marginBottom: 0,
  },

  loadingCardContent: {
    padding: spacing[4],
  },

  loadingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },

  loadingCardHeaderText: {
    flex: 1,
    marginLeft: spacing[3],
  },
});

export default EnhancedLoading;
