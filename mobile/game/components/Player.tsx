import React from 'react';
import { View, StyleSheet } from 'react-native';

interface PlayerProps {
  x: number;
  y: number;
  size: number;
  color: string;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export const Player = ({ x, y, size, color, direction = 'down' }: PlayerProps) => {
  return (
    <View
      style={[
        styles.player,
        {
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          backgroundColor: color,
        },
      ]}
    >
      {/* Direction indicator */}
      <View style={[styles.directionIndicator, getDirectionStyle(direction)]} />
    </View>
  );
};

const getDirectionStyle = (direction: string) => {
  switch (direction) {
    case 'up':
      return { top: 2 };
    case 'down':
      return { bottom: 2 };
    case 'left':
      return { left: 2 };
    case 'right':
      return { right: 2 };
    default:
      return { bottom: 2 };
  }
};

const styles = StyleSheet.create({
  player: {
    position: 'absolute',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  directionIndicator: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
});
