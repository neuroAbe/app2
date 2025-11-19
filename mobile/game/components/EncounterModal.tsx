import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { MockUser } from '../data/mockUsers';

interface Message {
  id: string;
  sender: 'user' | 'other';
  content: string;
  timestamp: Date;
}

interface EncounterModalProps {
  visible: boolean;
  user: MockUser | null;
  onClose: () => void;
  onMatch: (userId: string) => void;
}

export const EncounterModal = ({ visible, user, onClose, onMatch }: EncounterModalProps) => {
  const [stage, setStage] = useState<'profile' | 'chat' | 'matched'>('profile');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [matchAnimation] = useState(new Animated.Value(0));

  if (!user) return null;

  const handleSayHi = () => {
    // Transition to chat
    setStage('chat');

    // Add ice breaker as first message from other user
    const initialMessage: Message = {
      id: 'msg_0',
      sender: 'other',
      content: user.iceBreaker,
      timestamp: new Date(),
    };
    setMessages([initialMessage]);
  };

  const handleSendMessage = () => {
    if (inputText.trim() === '') return;

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      content: inputText,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputText('');

    // Simple auto-reply for prototype
    setTimeout(() => {
      const replies = [
        "That's interesting! Tell me more.",
        "I totally agree!",
        "Haha, that's funny!",
        "Same here!",
        "I'd love to hear more about that.",
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];

      const replyMessage: Message = {
        id: `msg_${Date.now()}_reply`,
        sender: 'other',
        content: randomReply,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, replyMessage]);
    }, 1000);
  };

  const handleMatch = () => {
    setStage('matched');

    // Trigger animation
    Animated.sequence([
      Animated.spring(matchAnimation, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();

    // Call parent callback
    setTimeout(() => {
      onMatch(user.id);
      // Auto-close after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    }, 1000);
  };

  const handleClose = () => {
    // Reset state
    setStage('profile');
    setMessages([]);
    setInputText('');
    matchAnimation.setValue(0);
    onClose();
  };

  const renderProfileStage = () => (
    <View style={styles.content}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: user.avatarColor }]}>
          <Text style={styles.avatarText}>
            {user.displayName.charAt(0).toUpperCase()}
          </Text>
        </View>

        {/* Basic Info */}
        <Text style={styles.name}>{user.displayName}, {user.age}</Text>
        <Text style={styles.distance}>📍 {user.distance}m away</Text>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bio}>{user.bio}</Text>
        </View>

        {/* Interests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.interestContainer}>
            {user.interests.map((interest, index) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Ice Breaker */}
        <View style={styles.iceBreakerBox}>
          <Text style={styles.iceBreakerLabel}>Ice Breaker 💬</Text>
          <Text style={styles.iceBreakerText}>{user.iceBreaker}</Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.skipButton} onPress={handleClose}>
          <Text style={styles.skipButtonText}>Keep Walking 👋</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.hiButton} onPress={handleSayHi}>
          <Text style={styles.hiButtonText}>Say Hi 💬</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderChatStage = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.chatContainer}
    >
      {/* Header */}
      <View style={styles.chatHeader}>
        <View style={[styles.miniAvatar, { backgroundColor: user.avatarColor }]}>
          <Text style={styles.miniAvatarText}>
            {user.displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.chatHeaderText}>
          <Text style={styles.chatHeaderName}>{user.displayName}</Text>
          <Text style={styles.chatHeaderStatus}>Online</Text>
        </View>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageBubble,
              msg.sender === 'user' ? styles.userMessage : styles.otherMessage,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                msg.sender === 'user' ? styles.userMessageText : styles.otherMessageText,
              ]}
            >
              {msg.content}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSendMessage}
          returnKeyType="send"
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      {/* Match Button */}
      {messages.length >= 3 && (
        <View style={styles.matchPrompt}>
          <Text style={styles.matchPromptText}>Enjoying the conversation?</Text>
          <TouchableOpacity style={styles.matchButton} onPress={handleMatch}>
            <Text style={styles.matchButtonText}>💕 Match with {user.displayName}</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );

  const renderMatchedStage = () => (
    <Animated.View
      style={[
        styles.matchedContainer,
        {
          opacity: matchAnimation,
          transform: [
            {
              scale: matchAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={styles.matchedEmoji}>💕</Text>
      <Text style={styles.matchedTitle}>It's a Match!</Text>
      <Text style={styles.matchedText}>
        You and {user.displayName} have connected!
      </Text>
      <Text style={styles.matchedSubtext}>
        You can now plan activities together
      </Text>
    </Animated.View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {stage === 'profile' && renderProfileStage()}
        {stage === 'chat' && renderChatStage()}
        {stage === 'matched' && renderMatchedStage()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1f2937',
    marginBottom: 4,
  },
  distance: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bio: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  interestContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  iceBreakerBox: {
    backgroundColor: '#8b5cf6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  iceBreakerLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    opacity: 0.9,
  },
  iceBreakerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 20,
  },
  skipButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  hiButton: {
    flex: 1,
    backgroundColor: '#8b5cf6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  hiButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  miniAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  miniAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  chatHeaderText: {
    flex: 1,
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  chatHeaderStatus: {
    fontSize: 12,
    color: '#10b981',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#6b7280',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userMessage: {
    backgroundColor: '#8b5cf6',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#1f2937',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  matchPrompt: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#fbbf24',
    alignItems: 'center',
  },
  matchPromptText: {
    fontSize: 14,
    color: '#92400e',
    marginBottom: 8,
    fontWeight: '500',
  },
  matchButton: {
    backgroundColor: '#ec4899',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  matchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  matchedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8b5cf6',
    padding: 40,
  },
  matchedEmoji: {
    fontSize: 100,
    marginBottom: 24,
  },
  matchedTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  matchedText: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  matchedSubtext: {
    fontSize: 16,
    color: '#e9d5ff',
    textAlign: 'center',
  },
});
