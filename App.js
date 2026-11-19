import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAIResponse } from './services/ai';

const MOOD_PROMPTS = [
  { label: '😔 Overwhelmed', prompt: "I'm feeling really overwhelmed right now and just need to vent." },
  { label: '😰 Anxious', prompt: "My anxiety is acting up and I'm having trouble calming down." },
  { label: '🥺 Lonely', prompt: "I'm feeling pretty lonely right now and just wanted someone to talk to." },
  { label: '😤 Frustrated', prompt: "I'm really frustrated about something that happened today." },
];

export default function App() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      text: "Hey there. I'm glad you reached out. Whether you want to vent, talk through something heavy, or just need some company, I'm here to listen. How are you feeling right now?",
      sender: 'ai',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);

  const openCrisisResources = () => {
    Alert.alert(
      'Immediate Support Available',
      'If you are in crisis or need immediate human support, free and confidential help is available 24/7.\n\n• US & Canada: Call or text 988\n• UK: Call 111\n• International: findahelpline.com',
      [
        { text: 'Call 988 (US/CA)', onPress: () => Linking.openURL('tel:988') },
        { text: 'Global Helplines', onPress: () => Linking.openURL('https://findahelpline.com/') },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  const handleSend = async (customText = null) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
    };

    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    if (!customText) setInputText('');
    setIsLoading(true);

    // Send full conversation history so the AI understands context
    const aiReplyText = await getAIResponse(updatedHistory);

    const aiMessage = {
      id: (Date.now() + 1).toString(),
      text: aiReplyText,
      sender: 'ai',
    };

    setMessages((prev) => [...prev, aiMessage]);
    setIsLoading(false);
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';
    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>SafeSpace</Text>
          <Text style={styles.headerSubtitle}>AI Listening Companion • Not a therapist</Text>
        </View>
        <TouchableOpacity style={styles.helpButton} onPress={openCrisisResources}>
          <Ionicons name="heart-circle-outline" size={18} color="#D9534F" />
          <Text style={styles.helpButtonText}>Crisis Help</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Mood Check-in Bar */}
      {messages.length === 1 && (
        <View style={styles.moodContainer}>
          <Text style={styles.moodTitle}>Not sure where to start? Tap a mood:</Text>
          <View style={styles.moodGrid}>
            {MOOD_PROMPTS.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.moodChip}
                onPress={() => handleSend(item.prompt)}
              >
                <Text style={styles.moodChipText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Chat Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Typing Indicator */}
      {isLoading && (
        <View style={styles.typingIndicator}>
          <ActivityIndicator size="small" color="#5C8D89" />
          <Text style={styles.typingText}>Thinking...</Text>
        </View>
      )}

      {/* Input Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Share whatever is on your mind..."
            placeholderTextColor="#8E9B97"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E3EAE8',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E3A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6E827D',
    marginTop: 2,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDEDEC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F5B7B1',
  },
  helpButtonText: {
    color: '#C0392B',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  moodContainer: {
    padding: 16,
    backgroundColor: '#EAF2F0',
    borderBottomWidth: 1,
    borderBottomColor: '#D5E5E1',
  },
  moodTitle: {
    fontSize: 13,
    color: '#4A635D',
    marginBottom: 10,
    fontWeight: '500',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C5DBD6',
  },
  moodChipText: {
    fontSize: 13,
    color: '#2C3E3A',
    fontWeight: '500',
  },
  chatList: {
    padding: 16,
    paddingBottom: 24,
  },
  messageBubble: {
    maxWidth: '82%',
    padding: 14,
    borderRadius: 18,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#5C8D89',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E3EAE8',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  botText: {
    color: '#2C3E3A',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  typingText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#6E827D',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E3EAE8',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F4F7F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    maxHeight: 110,
    fontSize: 15,
    color: '#2C3E3A',
  },
  sendButton: {
    backgroundColor: '#5C8D89',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#B8CCC7',
  },
});
