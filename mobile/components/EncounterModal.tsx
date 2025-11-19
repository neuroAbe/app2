import { View, Text, Modal, Pressable, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useState } from 'react';

interface EncounteredUser {
  id: string;
  display_name: string;
  age: number;
  gender: string;
  bio: string;
  interests: string[];
  avatar_color: string;
  distance: number;
}

interface EncounterModalProps {
  visible: boolean;
  user: EncounteredUser | null;
  onAccept: () => void;
  onReject: () => void;
  onClose: () => void;
  onReportOrBlock?: () => void;
}

export default function EncounterModal({
  visible,
  user,
  onAccept,
  onReject,
  onClose,
  onReportOrBlock,
}: EncounterModalProps) {
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleAccept = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        'https://rcdzetszicqyfxtkflih.supabase.co/rest/v1/rpc/create_match',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
          },
          body: JSON.stringify({
            other_user_id: user.id,
            encounter_location: 'starter_town',
          }),
        }
      );

      if (response.ok) {
        onAccept();
      } else {
        alert('Failed to create match. Please try again.');
      }
    } catch (error) {
      console.error('Error creating match:', error);
      alert('Failed to create match. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>✨ Wild encounter!</Text>
            <Text style={styles.subtitle}>
              Someone is nearby ({Math.round(user.distance)}px away)
            </Text>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>×</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.content}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: user.avatar_color },
                ]}
              >
                <Text style={styles.avatarText}>
                  {user.display_name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.name}>{user.display_name}</Text>
              <Text style={styles.info}>
                {user.age} • {user.gender}
              </Text>
            </View>

            {/* Bio */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.bio}>{user.bio}</Text>
            </View>

            {/* Interests */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Interests</Text>
              <View style={styles.interestsContainer}>
                {user.interests.map((interest) => (
                  <View key={interest} style={styles.interestChip}>
                    <Text style={styles.interestText}>{interest}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable
              style={[styles.acceptButton, loading && styles.buttonDisabled]}
              onPress={handleAccept}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.acceptButtonText}>💜 Say Hi!</Text>
              )}
            </Pressable>

            <Pressable
              style={[styles.rejectButton, loading && styles.buttonDisabled]}
              onPress={onReject}
              disabled={loading}
            >
              <Text style={styles.rejectButtonText}>👋 Maybe later</Text>
            </Pressable>

            {onReportOrBlock && (
              <Pressable
                style={styles.safetyButton}
                onPress={onReportOrBlock}
              >
                <Text style={styles.safetyButtonText}>
                  🛡️ Report or Block
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    background: 'linear-gradient(to right, #9333ea, #ec4899)',
    backgroundColor: '#9333ea',
    padding: 20,
    paddingTop: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#e9d5ff',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
    lineHeight: 32,
  },
  content: {
    maxHeight: 400,
  },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  info: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  bio: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    backgroundColor: '#ede9fe',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  interestText: {
    fontSize: 13,
    color: '#8b5cf6',
    fontWeight: '600',
  },
  actions: {
    padding: 20,
    gap: 12,
  },
  acceptButton: {
    backgroundColor: '#9333ea',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rejectButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: 'bold',
  },
  safetyButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  safetyButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
