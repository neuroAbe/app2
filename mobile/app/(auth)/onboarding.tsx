import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';

const INTERESTS_OPTIONS = [
  'Gaming', 'Music', 'Art', 'Travel', 'Fitness', 'Cooking',
  'Movies', 'Reading', 'Sports', 'Photography', 'Dancing', 'Tech'
];

const AVATAR_COLORS = [
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);

  const handleNext = () => {
    if (step === 1) {
      if (!displayName || !age || !gender || !lookingFor) {
        setError('Please fill in all fields');
        return;
      }
      if (parseInt(age) < 18) {
        setError('You must be 18 or older');
        return;
      }
      setError('');
      setStep(2);
    } else if (step === 2) {
      if (!bio || interests.length === 0) {
        setError('Please add a bio and select at least one interest');
        return;
      }
      setError('');
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const { error: dbError } = await supabase
        .from('user_profiles')
        .insert({
          clerk_user_id: user.id,
          display_name: displayName,
          age: parseInt(age),
          gender,
          looking_for: lookingFor,
          bio,
          interests,
          avatar_color: avatarColor,
          email_verified: true,
          current_town: 'starter_town',
          position_x: 400,
          position_y: 300,
        });

      if (dbError) throw dbError;

      router.replace('/(tabs)/game');
    } catch (err: any) {
      setError(err.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  return (
    <LinearGradient
      colors={['#ec4899', '#8b5cf6']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Progress */}
          <View style={styles.progress}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>Step {step} of 3</Text>
          </View>

          <View style={styles.form}>
            {step === 1 && (
              <>
                <Text style={styles.formTitle}>Basic Info</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Display Name</Text>
                  <TextInput
                    style={styles.input}
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="What should we call you?"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Age</Text>
                  <TextInput
                    style={styles.input}
                    value={age}
                    onChangeText={setAge}
                    placeholder="18+"
                    placeholderTextColor="#999"
                    keyboardType="number-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Gender</Text>
                  <View style={styles.buttonGroup}>
                    {['Male', 'Female', 'Non-binary'].map((option) => (
                      <Pressable
                        key={option}
                        style={[
                          styles.optionButton,
                          gender === option && styles.optionButtonActive
                        ]}
                        onPress={() => setGender(option)}
                      >
                        <Text style={[
                          styles.optionText,
                          gender === option && styles.optionTextActive
                        ]}>
                          {option}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Looking For</Text>
                  <View style={styles.buttonGroup}>
                    {['Men', 'Women', 'Everyone'].map((option) => (
                      <Pressable
                        key={option}
                        style={[
                          styles.optionButton,
                          lookingFor === option && styles.optionButtonActive
                        ]}
                        onPress={() => setLookingFor(option)}
                      >
                        <Text style={[
                          styles.optionText,
                          lookingFor === option && styles.optionTextActive
                        ]}>
                          {option}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </>
            )}

            {step === 2 && (
              <>
                <Text style={styles.formTitle}>About You</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Bio</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={bio}
                    onChangeText={setBio}
                    placeholder="Tell us about yourself..."
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Interests (select at least 1)</Text>
                  <View style={styles.interestsGrid}>
                    {INTERESTS_OPTIONS.map((interest) => (
                      <Pressable
                        key={interest}
                        style={[
                          styles.interestChip,
                          interests.includes(interest) && styles.interestChipActive
                        ]}
                        onPress={() => toggleInterest(interest)}
                      >
                        <Text style={[
                          styles.interestText,
                          interests.includes(interest) && styles.interestTextActive
                        ]}>
                          {interest}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </>
            )}

            {step === 3 && (
              <>
                <Text style={styles.formTitle}>Choose Avatar Color</Text>

                <View style={styles.avatarPreview}>
                  <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                    <Text style={styles.avatarText}>
                      {displayName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.avatarName}>{displayName}</Text>
                </View>

                <View style={styles.colorGrid}>
                  {AVATAR_COLORS.map((color) => (
                    <Pressable
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        avatarColor === color && styles.colorOptionActive
                      ]}
                      onPress={() => setAvatarColor(color)}
                    >
                      {avatarColor === color && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.buttons}>
              {step > 1 && (
                <Pressable
                  style={styles.backButton}
                  onPress={() => setStep(step - 1)}
                >
                  <Text style={styles.backButtonText}>← Back</Text>
                </Pressable>
              )}

              {step < 3 ? (
                <Pressable style={styles.nextButton} onPress={handleNext}>
                  <Text style={styles.nextButtonText}>Next →</Text>
                </Pressable>
              ) : (
                <Pressable
                  style={[styles.nextButton, loading && styles.buttonDisabled]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  <Text style={styles.nextButtonText}>
                    {loading ? 'Creating Profile...' : 'Complete'}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  progress: {
    marginBottom: 24,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
  },
  progressText: {
    color: '#ffffff',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 90,
  },
  optionButtonActive: {
    backgroundColor: '#ede9fe',
    borderColor: '#8b5cf6',
  },
  optionText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  optionTextActive: {
    color: '#8b5cf6',
    fontWeight: 'bold',
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  interestChipActive: {
    backgroundColor: '#ede9fe',
    borderColor: '#8b5cf6',
  },
  interestText: {
    fontSize: 14,
    color: '#6b7280',
  },
  interestTextActive: {
    color: '#8b5cf6',
    fontWeight: '600',
  },
  avatarPreview: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 40,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  avatarName: {
    fontSize: 18,
    color: '#111827',
    fontWeight: '600',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  colorOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionActive: {
    borderColor: '#111827',
  },
  checkmark: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  error: {
    color: '#ef4444',
    fontSize: 14,
    marginBottom: 16,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#8b5cf6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
