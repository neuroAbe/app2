interface Entity {
  id: string;
  x: number;
  y: number;
  velocity?: { x: number; y: number };
  speed?: number;
}

interface Entities {
  [key: string]: Entity;
}

export const MovementSystem = (entities: Entities, { input }: any) => {
  const player = entities.player;

  if (!player) return entities;

  const speed = player.speed || 3;

  // Apply velocity from input
  if (input && (input.x !== 0 || input.y !== 0)) {
    player.x += input.x * speed;
    player.y += input.y * speed;

    // Determine direction
    if (Math.abs(input.x) > Math.abs(input.y)) {
      player.direction = input.x > 0 ? 'right' : 'left';
    } else {
      player.direction = input.y > 0 ? 'down' : 'up';
    }
  }

  return entities;
};
