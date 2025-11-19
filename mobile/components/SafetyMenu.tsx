import { View, Text, Modal, Pressable, StyleSheet, TextInput, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { safetyApi } from '../lib/api';

interface SafetyMenuProps {
  visible: boolean;
  userId: string;
  userName: string;
  onClose: () => void;
}

const REPORT_REASONS = [
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'inappropriate_content', label: 'Inappropriate content' },
  { value: 'spam', label: 'Spam or scam' },
  { value: 'fake_profile', label: 'Fake profile' },
  { value: 'other', label: 'Other' },
];

export default function SafetyMenu({
  visible,
  userId,
  userName,
  onClose,
}: SafetyMenuProps) {
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBlock = async () => {
    setLoading(true);
    try {
      await safetyApi.blockUser(userId);
      Alert.alert(
        'User Blocked',
        `${userName} has been blocked. You will no longer see their profile or receive messages from them.`,
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to block user');
    } finally {
      setLoading(false);
      setShowBlockConfirm(false);
    }
  };

  const handleReport = async () => {
    if (!reportReason) {
      Alert.alert('Error', 'Please select a reason for reporting');
      return;
    }

    setLoading(true);
    try {
      await safetyApi.reportUser(userId, reportReason, reportDescription);
      Alert.alert(
        'Report Submitted',
        'Thank you for helping keep our community safe. We will review this report.',
        [{ text: 'OK', onPress: onClose }]
      );
      setReportReason('');
      setReportDescription('');
      setShowReportForm(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit report');
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
            <Text style={styles.title}>🛡️ Safety & Privacy</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.content}>
            {!showBlockConfirm && !showReportForm ? (
              <>
                {/* Main Menu */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    Safety actions for {userName}
                  </Text>
                  <Text style={styles.description}>
                    These actions help keep you safe and improve the community.
                  </Text>
                </View>

                <Pressable
                  style={styles.menuButton}
                  onPress={() => setShowBlockConfirm(true)}
                >
                  <Text style={styles.menuButtonIcon}>🚫</Text>
                  <View style={styles.menuButtonContent}>
                    <Text style={styles.menuButtonTitle}>Block User</Text>
                    <Text style={styles.menuButtonDescription}>
                      You won't see each other anymore
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  style={styles.menuButton}
                  onPress={() => setShowReportForm(true)}
                >
                  <Text style={styles.menuButtonIcon}>⚠️</Text>
                  <View style={styles.menuButtonContent}>
                    <Text style={styles.menuButtonTitle}>Report User</Text>
                    <Text style={styles.menuButtonDescription}>
                      Report inappropriate behavior
                    </Text>
                  </View>
                </Pressable>

                {/* Safety Tips */}
                <View style={styles.tipsSection}>
                  <Text style={styles.tipsTitle}>💡 Safety Tips</Text>
                  <Text style={styles.tip}>• Never share personal information</Text>
                  <Text style={styles.tip}>
                    • Meet in public places for first dates
                  </Text>
                  <Text style={styles.tip}>
                    • Trust your instincts - report suspicious behavior
                  </Text>
                  <Text style={styles.tip}>
                    • Tell a friend where you're going
                  </Text>
                </View>
              </>
            ) : showBlockConfirm ? (
              <>
                {/* Block Confirmation */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Block {userName}?</Text>
                  <Text style={styles.description}>
                    This will prevent both of you from seeing each other's profiles, sending messages, or matching in the future.
                  </Text>
                  <Text style={[styles.description, { marginTop: 12, fontWeight: '600' }]}>
                    You can unblock them later from your settings.
                  </Text>
                </View>

                <Pressable
                  style={[styles.confirmButton, loading && styles.buttonDisabled]}
                  onPress={handleBlock}
                  disabled={loading}
                >
                  <Text style={styles.confirmButtonText}>
                    {loading ? 'Blocking...' : 'Yes, Block User'}
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.cancelButton}
                  onPress={() => setShowBlockConfirm(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
              </>
            ) : (
              <>
                {/* Report Form */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Report {userName}</Text>
                  <Text style={styles.description}>
                    Help us understand what's wrong. Your report is anonymous.
                  </Text>
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.label}>Reason *</Text>
                  {REPORT_REASONS.map((reason) => (
                    <Pressable
                      key={reason.value}
                      style={[
                        styles.radioButton,
                        reportReason === reason.value && styles.radioButtonSelected,
                      ]}
                      onPress={() => setReportReason(reason.value)}
                    >
                      <View style={styles.radio}>
                        {reportReason === reason.value && (
                          <View style={styles.radioInner} />
                        )}
                      </View>
                      <Text style={styles.radioLabel}>{reason.label}</Text>
                    </Pressable>
                  ))}
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.label}>Additional details (optional)</Text>
                  <TextInput
                    style={styles.textArea}
                    multiline
                    numberOfLines={4}
                    placeholder="Provide more context..."
                    value={reportDescription}
                    onChangeText={setReportDescription}
                  />
                </View>

                <Pressable
                  style={[styles.confirmButton, loading && styles.buttonDisabled]}
                  onPress={handleReport}
                  disabled={loading}
                >
                  <Text style={styles.confirmButtonText}>
                    {loading ? 'Submitting...' : 'Submit Report'}
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowReportForm(false);
                    setReportReason('');
                    setReportDescription('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    padding: 20,
    paddingTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 32,
    color: '#6b7280',
    fontWeight: 'bold',
    lineHeight: 32,
  },
  content: {
    maxHeight: 500,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  menuButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  menuButtonContent: {
    flex: 1,
  },
  menuButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  menuButtonDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  tipsSection: {
    margin: 20,
    padding: 16,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 12,
  },
  tip: {
    fontSize: 14,
    color: '#1e40af',
    marginBottom: 6,
    lineHeight: 20,
  },
  formSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  radioButtonSelected: {
    backgroundColor: '#ede9fe',
    borderColor: '#8b5cf6',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8b5cf6',
  },
  radioLabel: {
    fontSize: 14,
    color: '#374151',
  },
  textArea: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  confirmButton: {
    backgroundColor: '#ef4444',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f9fafb',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
