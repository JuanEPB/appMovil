import React, { useEffect, useRef } from "react";
import { Animated, Easing, ViewStyle } from "react-native";

type Props = {
  duration?: number;
  delay?: number;
  offset?: number;
  style?: ViewStyle | ViewStyle[];
  children: React.ReactNode;
};

export const FadeSlideIn: React.FC<Props> = ({
  duration = 420,
  delay = 60,
  offset = 12,
  style,
  children,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(offset)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    Animated.timing(translateY, {
      toValue: 0,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [opacity, translateY, duration, delay, offset]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};
