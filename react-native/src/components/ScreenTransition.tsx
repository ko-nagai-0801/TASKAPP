import React, { ReactNode, useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";

type ScreenTransitionProps = {
  screenKey: string;
  children: ReactNode;
};

export function ScreenTransition({ screenKey, children }: ScreenTransitionProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(8);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true
      })
    ]).start();
  }, [opacity, screenKey, translateY]);

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
