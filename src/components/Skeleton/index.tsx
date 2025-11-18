import React, {memo, useEffect, useRef, useState} from 'react';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import type {DimensionValue} from 'react-native';

export type SkeletonPalette = {
  base: string;
  highlight: string;
};

export type SkeletonBlockProps = {
  height: number;
  width?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  colors: SkeletonPalette;
};

const luminance = (hexColor: string) => {
  const sanitized = hexColor.replace('#', '');
  if (sanitized.length !== 6) {
    return 1;
  }

  const r = parseInt(sanitized.substring(0, 2), 16) / 255;
  const g = parseInt(sanitized.substring(2, 4), 16) / 255;
  const b = parseInt(sanitized.substring(4, 6), 16) / 255;

  const adjust = (channel: number) =>
    channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);

  const rLin = adjust(r);
  const gLin = adjust(g);
  const bLin = adjust(b);

  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
};

export const resolveSkeletonPalette = (
  backgroundColor: string,
): SkeletonPalette => {
  if (backgroundColor.startsWith('#')) {
    const isDark = luminance(backgroundColor) < 0.4;
    return isDark
      ? {base: '#1F1F1F', highlight: '#2D2D2D'}
      : {base: '#E6EDF7', highlight: '#F2F6FC'};
  }

  return {base: '#E6EDF7', highlight: '#F2F6FC'};
};

const SkeletonBlockComponent: React.FC<SkeletonBlockProps> = ({
  height,
  width = '100%',
  borderRadius = 12,
  style,
  colors,
}) => {
  const shimmer = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1300,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    animation.start();
    return () => {
      animation.stop();
    };
  }, [shimmer]);

  const onLayout = (event: LayoutChangeEvent) => {
    const {width: layoutWidth} = event.nativeEvent.layout;
    if (layoutWidth !== containerWidth) {
      setContainerWidth(layoutWidth);
    }
  };

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-containerWidth || -150, containerWidth || 150],
  });

  const shimmerWidth = containerWidth
    ? Math.max(containerWidth * 0.45, 80)
    : 150;

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.block,
        {
          height,
          width,
          borderRadius,
          backgroundColor: colors.base,
        },
        style,
      ]}>
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          styles.shimmerBase,
          {
            transform: [{translateX}],
            width: shimmerWidth,
            backgroundColor: colors.highlight,
          },
        ]}
      />
    </View>
  );
};

export const SkeletonBlock = memo(SkeletonBlockComponent);

export default SkeletonBlock;

const styles = StyleSheet.create({
  block: {
    overflow: 'hidden',
  },
  shimmerBase: {
    opacity: 0.6,
  },
});
