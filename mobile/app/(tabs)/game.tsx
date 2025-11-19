import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Player } from '../../game/components/Player';
import { Tile } from '../../game/components/Tile';
import { VirtualJoystick } from '../../game/components/VirtualJoystick';
import { generateStarterTown, WorldMap, checkCollision } from '../../game/utils/worldGenerator';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const PLAYER_SIZE = 40;

export default function GameScreen() {
  const { user } = useUser();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Game state
  const [playerPosition, setPlayerPosition] = useState({ x: 400, y: 300 });
  const [playerDirection, setPlayerDirection] = useState<'up' | 'down' | 'left' | 'right'>('down');
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });
  const [worldMap, setWorldMap] = useState<WorldMap | null>(null);
  const [inputVector, setInputVector] = useState({ x: 0, y: 0 });

  const animationFrameRef = useRef<number>();

  useEffect(() => {
    loadProfile();
    initializeWorld();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [user]);

  // Game loop
  useEffect(() => {
    const gameLoop = () => {
      if (inputVector.x !== 0 || inputVector.y !== 0) {
        updatePlayerPosition();
      }
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [inputVector, playerPosition, worldMap]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('clerk_user_id', user.id)
        .single();

      if (error) {
        // PGRST116 means no rows found
        if (error.code === 'PGRST116') {
          console.log('No profile found for user');
          setProfile(null);
        } else {
          throw error;
        }
      } else {
        setProfile(data);

        // Set initial player position from profile
        if (data.position_x && data.position_y) {
          setPlayerPosition({ x: data.position_x, y: data.position_y });
        }
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const initializeWorld = () => {
    const map = generateStarterTown(40);
    setWorldMap(map);
  };

  const updatePlayerPosition = () => {
    if (!worldMap) return;

    const speed = 3;
    const newX = playerPosition.x + inputVector.x * speed;
    const newY = playerPosition.y + inputVector.y * speed;

    // Check collision
    if (!checkCollision(newX, newY, PLAYER_SIZE, worldMap)) {
      setPlayerPosition({ x: newX, y: newY });

      // Update camera to follow player
      const camX = SCREEN_WIDTH / 2 - newX;
      const camY = SCREEN_HEIGHT / 2 - newY;
      setCameraOffset({ x: camX, y: camY });

      // Update direction
      if (Math.abs(inputVector.x) > Math.abs(inputVector.y)) {
        setPlayerDirection(inputVector.x > 0 ? 'right' : 'left');
      } else if (inputVector.y !== 0) {
        setPlayerDirection(inputVector.y > 0 ? 'down' : 'up');
      }

      // Save position to database (debounced in real app)
      savePositionToDatabase(newX, newY);
    }
  };

  const savePositionToDatabase = async (x: number, y: number) => {
    if (!user) return;

    // Simple debounce - only save every 2 seconds
    // In production, use a proper debounce function
    if (Math.random() > 0.95) {
      try {
        await supabase
          .from('user_profiles')
          .update({
            position_x: Math.round(x),
            position_y: Math.round(y),
          })
          .eq('clerk_user_id', user.id);
      } catch (err) {
        console.error('Failed to save position:', err);
      }
    }
  };

  const handleJoystickMove = (vector: { x: number; y: number }) => {
    setInputVector(vector);
  };

  const handleJoystickStop = () => {
    setInputVector({ x: 0, y: 0 });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading world...</Text>
      </View>
    );
  }

  if (!profile || !worldMap) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Failed to load game</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Game World */}
      <View style={styles.gameWorld}>
        <View
          style={[
            styles.worldContainer,
            {
              transform: [
                { translateX: cameraOffset.x },
                { translateY: cameraOffset.y },
              ],
            },
          ]}
        >
          {/* Render tiles */}
          {worldMap.tiles.map((tile) => (
            <Tile
              key={tile.id}
              x={tile.x}
              y={tile.y}
              size={worldMap.tileSize}
              type={tile.type}
            />
          ))}

          {/* Render player */}
          <Player
            x={playerPosition.x}
            y={playerPosition.y}
            size={PLAYER_SIZE}
            color={profile.avatar_color}
            direction={playerDirection}
          />
        </View>
      </View>

      {/* HUD - Top Info Bar */}
      <View style={styles.hud}>
        <View style={styles.hudInfo}>
          <View style={[styles.miniAvatar, { backgroundColor: profile.avatar_color }]}>
            <Text style={styles.miniAvatarText}>
              {profile.display_name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.hudName}>{profile.display_name}</Text>
            <Text style={styles.hudLocation}>📍 {profile.current_town}</Text>
          </View>
        </View>

        <View style={styles.hudStats}>
          <Text style={styles.hudStat}>Lvl 1</Text>
        </View>
      </View>

      {/* Virtual Joystick */}
      <VirtualJoystick onMove={handleJoystickMove} onStop={handleJoystickStop} />

      {/* Instructions (show only first time) */}
      {playerPosition.x === 400 && playerPosition.y === 300 && (
        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>
            👆 Use the joystick to move around!
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7ec850',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
  },
  gameWorld: {
    flex: 1,
    overflow: 'hidden',
  },
  worldContainer: {
    position: 'absolute',
    width: 800, // 20 tiles * 40px
    height: 800, // 20 tiles * 40px
  },
  hud: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  hudInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  miniAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  miniAvatarText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  hudName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  hudLocation: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
  hudStats: {
    backgroundColor: 'rgba(139, 92, 246, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  hudStat: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  instructions: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.95)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  instructionsText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
});
