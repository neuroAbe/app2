import React, { useState, useRef } from 'react';
import { View, StyleSheet, PanResponder, Animated } from 'react-native';

interface VirtualJoystickProps {
  onMove: (vector: { x: number; y: number }) => void;
  onStop: () => void;
}

const JOYSTICK_SIZE = 120;
const KNOB_SIZE = 50;
const MAX_DISTANCE = (JOYSTICK_SIZE - KNOB_SIZE) / 2;

export const VirtualJoystick = ({ onMove, onStop }: VirtualJoystickProps) => {
  const [active, setActive] = useState(false);
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        setActive(true);
      },

      onPanResponderMove: (_, gesture) => {
        const { dx, dy } = gesture;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= MAX_DISTANCE) {
          pan.setValue({ x: dx, y: dy });
        } else {
          const angle = Math.atan2(dy, dx);
          pan.setValue({
            x: MAX_DISTANCE * Math.cos(angle),
            y: MAX_DISTANCE * Math.sin(angle),
          });
        }

        // Normalize vector for movement
        const normalizedX = Math.max(-1, Math.min(1, dx / MAX_DISTANCE));
        const normalizedY = Math.max(-1, Math.min(1, dy / MAX_DISTANCE));

        onMove({ x: normalizedX, y: normalizedY });
      },

      onPanResponderRelease: () => {
        setActive(false);
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
        onStop();
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <View style={[styles.base, active && styles.baseActive]}>
        <Animated.View
          style={[
            styles.knob,
            {
              transform: [
                { translateX: pan.x },
                { translateY: pan.y },
              ],
            },
          ]}
          {...panResponder.panHandlers}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    width: JOYSTICK_SIZE,
    height: JOYSTICK_SIZE,
    zIndex: 1000,
  },
  base: {
    width: JOYSTICK_SIZE,
    height: JOYSTICK_SIZE,
    borderRadius: JOYSTICK_SIZE / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  baseActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: 'rgba(139, 92, 246, 0.8)',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
