import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform, Animated, TouchableOpacity } from 'react-native';
import { Screen } from '../components/Screen';
import { Theme } from '../constants/Theme';
import { GlassContainer } from '../components/GlassContainer';
import { Button } from '../components/Button';
import { Send, Sparkles } from 'lucide-react-native';

const ConciergeScreen = () => {
  const [messages, setMessages] = useState([
    { id: '1', role: 'ai', text: 'How can I help, Marcus?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMsg = { id: Date.now().toString(), role: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI thinking and response
    setTimeout(() => {
      setIsTyping(false);
      const aiResponse = { 
        id: (Date.now() + 1).toString(), 
        role: 'ai', 
        text: 'Based on real-time sensor data, Section 204 is currently busy. However, Prime Pit BBQ just 20 meters away has a 4-minute wait time—the shortest in the West Wing.' 
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 2000);
  };

  return (
    <Screen style={styles.screen}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboard}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          {messages.map((msg) => (
            <View key={msg.id} style={msg.role === 'ai' ? styles.aiContainer : styles.userMessage}>
              {msg.role === 'ai' && (
                <GlassContainer style={styles.aiMessage}>
                  <View style={styles.aiHeader}>
                    <Sparkles size={16} color={Theme.colors.primary} />
                    <Text style={styles.aiLabel}>SwiftSeat AI</Text>
                  </View>
                  <Text style={styles.messageText}>{msg.text}</Text>
                  
                  {msg.text.includes('BBQ') && (
                    <View style={styles.suggestionCard}>
                      <View style={styles.suggestionHeader}>
                        <Text style={styles.suggestionTitle}>Prime Pit BBQ</Text>
                        <Text style={styles.waitBadge}>4m Wait</Text>
                      </View>
                      <Text style={styles.suggestionSub}>Guided Path: Follow blue floor lights</Text>
                      <Button title="Get Directions" onPress={() => {}} variant="primary" style={styles.actionButton} />
                    </View>
                  )}
                </GlassContainer>
              )}
              {msg.role === 'user' && (
                <Text style={styles.userMessageText}>{msg.text}</Text>
              )}
            </View>
          ))}
          
          {isTyping && (
            <View style={styles.aiContainer}>
              <GlassContainer style={styles.typingIndicator}>
                <Text style={styles.typingText}>Concierge is thinking...</Text>
              </GlassContainer>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputArea}>
          <GlassContainer style={styles.inputContainer} intensity={90}>
            <TextInput 
              placeholder="Ask the Concierge..." 
              placeholderTextColor={Theme.colors.textVariant}
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
              <Send size={20} color={Theme.colors.onPrimary} />
            </TouchableOpacity>
          </GlassContainer>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  keyboard: { flex: 1 },
  scroll: { padding: Theme.spacing.lg, paddingBottom: 100 },
  aiContainer: { marginBottom: Theme.spacing.xl },
  aiMessage: { width: '100%' },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Theme.spacing.sm, gap: 8 },
  aiLabel: { ...Theme.typography.label, color: Theme.colors.primary },
  messageText: { ...Theme.typography.body, color: Theme.colors.text, lineHeight: 24 },
  suggestionCard: { marginTop: Theme.spacing.md, backgroundColor: Theme.colors.surfaceHigh, padding: Theme.spacing.md, borderRadius: Theme.roundness.lg },
  suggestionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  suggestionTitle: { ...Theme.typography.title, color: Theme.colors.text },
  waitBadge: { ...Theme.typography.label, color: Theme.colors.tertiary, backgroundColor: 'rgba(74, 225, 131, 0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  suggestionSub: { ...Theme.typography.body, fontSize: 14, color: Theme.colors.textVariant, marginBottom: Theme.spacing.md },
  actionButton: { paddingVertical: Theme.spacing.sm },
  userMessage: { alignSelf: 'flex-end', backgroundColor: Theme.colors.surfaceLow, padding: Theme.spacing.md, borderRadius: Theme.roundness.xl, borderBottomRightRadius: 4, maxWidth: '80%', marginBottom: Theme.spacing.md },
  userMessageText: { ...Theme.typography.body, color: Theme.colors.text },
  typingIndicator: { padding: Theme.spacing.sm, paddingHorizontal: Theme.spacing.md, alignSelf: 'flex-start' },
  typingText: { ...Theme.typography.label, color: Theme.colors.textVariant, textTransform: 'none' },
  inputArea: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Theme.spacing.lg, backgroundColor: Theme.colors.background },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: Theme.spacing.sm, paddingLeft: Theme.spacing.md },
  input: { flex: 1, color: Theme.colors.text, height: 44 },
  sendButton: { backgroundColor: Theme.colors.primary, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});

export default ConciergeScreen;
