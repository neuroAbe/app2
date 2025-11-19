import { View, Text, StyleSheet } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function GameScreen() {
  const { user } = useUser();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('clerk_user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Profile not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: profile.avatar_color }]}>
        <Text style={styles.avatarText}>
          {profile.display_name.charAt(0).toUpperCase()}
        </Text>
      </View>

      {/* Welcome */}
      <Text style={styles.title}>Welcome, {profile.display_name}!</Text>
      <Text style={styles.subtitle}>Game world coming soon...</Text>

      {/* Placeholder */}
      <View style={styles.gameArea}>
        <Text style={styles.gameText}>🎮</Text>
        <Text style={styles.infoText}>
          The Pokemon-style game world will be added here next!
        </Text>
        <Text style={styles.infoText}>
          Location: {profile.current_town}
        </Text>
        <Text style={styles.infoText}>
          Position: ({profile.position_x}, {profile.position_y})
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <StatItem label="Age" value={profile.age} />
        <StatItem label="Interests" value={profile.interests.length} />
        <StatItem label="Verification" value={profile.verification_level} />
      </View>
    </View>
  );
}

function StatItem({ label, value }: { label: string; value: any }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
  },
  gameArea: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  gameText: {
    fontSize: 64,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
});
