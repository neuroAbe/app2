import { TileType } from '../components/Tile';

export interface WorldTile {
  id: string;
  x: number;
  y: number;
  type: TileType;
  walkable: boolean;
}

export interface WorldMap {
  width: number;
  height: number;
  tileSize: number;
  tiles: WorldTile[];
}

/**
 * Generate a starter town world map
 */
export const generateStarterTown = (tileSize: number = 40): WorldMap => {
  const width = 20; // tiles
  const height = 20; // tiles

  const tiles: WorldTile[] = [];

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const id = `tile-${row}-${col}`;
      const x = col * tileSize;
      const y = row * tileSize;

      let type: TileType = 'grass';
      let walkable = true;

      // Create a path through the middle
      if (row === Math.floor(height / 2) || col === Math.floor(width / 2)) {
        type = 'path';
        walkable = true;
      }

      // Add some buildings
      if (
        (row >= 3 && row <= 5 && col >= 3 && col <= 5) ||
        (row >= 3 && row <= 5 && col >= 14 && col <= 16) ||
        (row >= 14 && row <= 16 && col >= 8 && col <= 10)
      ) {
        type = 'building';
        walkable = false;
      }

      // Add some trees
      if (
        (row <= 2 && col <= 2) ||
        (row <= 2 && col >= width - 3) ||
        (row >= height - 3 && col <= 2) ||
        (row >= height - 3 && col >= width - 3)
      ) {
        if (Math.random() > 0.5) {
          type = 'tree';
          walkable = false;
        }
      }

      // Add water features
      if (row >= 7 && row <= 9 && col >= 15 && col <= 18) {
        type = 'water';
        walkable = false;
      }

      // Add some flowers
      if (type === 'grass' && Math.random() > 0.9) {
        type = 'flower';
      }

      tiles.push({ id, x, y, type, walkable });
    }
  }

  return {
    width: width * tileSize,
    height: height * tileSize,
    tileSize,
    tiles,
  };
};

/**
 * Check if a position collides with non-walkable tiles
 */
export const checkCollision = (
  x: number,
  y: number,
  playerSize: number,
  worldMap: WorldMap
): boolean => {
  const tiles = worldMap.tiles.filter((tile) => !tile.walkable);

  for (const tile of tiles) {
    // Simple AABB collision
    if (
      x - playerSize / 2 < tile.x + worldMap.tileSize &&
      x + playerSize / 2 > tile.x &&
      y - playerSize / 2 < tile.y + worldMap.tileSize &&
      y + playerSize / 2 > tile.y
    ) {
      return true; // Collision detected
    }
  }

  return false; // No collision
};
