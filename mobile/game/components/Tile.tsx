import React from 'react';
import { View, StyleSheet } from 'react-native';

export type TileType = 'grass' | 'path' | 'water' | 'building' | 'tree' | 'flower';

interface TileProps {
  x: number;
  y: number;
  size: number;
  type: TileType;
}

const TILE_COLORS: Record<TileType, string> = {
  grass: '#7ec850',
  path: '#d4a574',
  water: '#4a9eff',
  building: '#e08040',
  tree: '#2d6b2d',
  flower: '#ff69b4',
};

export const Tile = ({ x, y, size, type }: TileProps) => {
  return (
    <View
      style={[
        styles.tile,
        {
          left: x,
          top: y,
          width: size,
          height: size,
          backgroundColor: TILE_COLORS[type],
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  tile: {
    position: 'absolute',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
});
