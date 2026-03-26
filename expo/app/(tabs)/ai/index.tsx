import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Send,
  Bot,
  ArrowRight,
  Trash2,
  TrendingUp,
  BarChart3,
  Brain,
  Lightbulb,
  BookOpen,
  Target,
  Sparkles,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRorkAgent } from '@rork-ai/toolkit-sdk';
import Colors from '@/constants/colors';

interface QuickPrompt {
  id: string;
  text: string;
  icon: React.ReactNode;
  category: string;
}

const quickPrompts: QuickPrompt[] = [
  {
    id: '1',
    text: '分析贵州茅台的基本面情况',
    icon: <TrendingUp size={16} color={Colors.accent} />,
    category: '个股分析',
  },
  {
    id: '2',
    text: '比较宁德时代和比亚迪的估值',
    icon: <BarChart3 size={16} color="#E67E22" />,
    category: '对比分析',
  },
  {
    id: '3',
    text: '推荐当前市场热门概念板块',
    icon: <Target size={16} color={Colors.green} />,
    category: '市场热点',
  },
  {
    id: '4',
    text: '解释什么是夏普比率',
    icon: <BookOpen size={16} color="#8B5CF6" />,
    category: '知识问答',
  },
  {
    id: '5',
    text: '生成一个简单的双均线策略',
    icon: <Brain size={16} color={Colors.red} />,
    category: '策略生成',
  },
  {
    id: '6',
    text: '什么是量化投资的Alpha和Beta',
    icon: <Lightbulb size={16} color="#F59E0B" />,
    category: '知识问答',
  },
  {
    id: '7',
    text: '如何构建一个多因子选股模型',
    icon: <Sparkles size={16} color={Colors.accent} />,
    category: '策略生成',
  },
];

function WelcomeView({ onSelectPrompt }: { onSelectPrompt: (text: string) => void }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={[
        styles.welcomeContainer,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.botIconWrapper}>
        <View style={styles.botIconGradient}>
          <Bot size={36} color={Colors.accent} strokeWidth={1.8} />
        </View>
      </View>

      <Text style={styles.welcomeTitle}>您好，我是AI投研助理</Text>
      <Text style={styles.welcomeSubtitle}>
        我可以帮您进行市场分析、策略研究、投资知识问答。
      </Text>

      <View style={styles.promptsGrid}>
        {quickPrompts.map((prompt) => (
          <Pressable
            key={prompt.id}
            style={({ pressed }) => [
              styles.promptCard,
              pressed && styles.promptCardPressed,
            ]}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              onSelectPrompt(prompt.text);
            }}
          >
            <View style={styles.promptIconRow}>
              <ArrowRight size={14} color={Colors.accent} />
            </View>
            <Text style={styles.promptText} numberOfLines={2}>
              {prompt.text}
            </Text>
          </Pressable>
        ))}
      </View>
    </Animated.View>
  );
}

function MessageBubble({
  role,
  content,
  isStreaming,
}: {
  role: string;
  content: string;
  isStreaming?: boolean;
}) {
  const isUser = role === 'user';

  return (
    <View
      style={[
        styles.messageBubbleRow,
        isUser ? styles.messageBubbleRowUser : styles.messageBubbleRowAI,
      ]}
    >
      {!isUser && (
        <View style={styles.aiBubbleAvatar}>
          <Bot size={16} color={Colors.accent} strokeWidth={2} />
        </View>
      )}
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.aiMessageText,
          ]}
          selectable
        >
          {content}
          {isStreaming && !content && '思考中...'}
        </Text>
        {isStreaming && !!content && (
          <View style={styles.streamingDot}>
            <View style={styles.dot} />
          </View>
        )}
      </View>
    </View>
  );
}

export default function AIAssistantScreen() {
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const sendScale = useRef(new Animated.Value(1)).current;

  const { messages, sendMessage, setMessages } = useRorkAgent({
    tools: {},
  });

  const hasMessages = messages.length > 0;

  const handleSend = useCallback(
    (text?: string) => {
      const messageText = text || input.trim();
      if (!messageText) return;

      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      Animated.sequence([
        Animated.timing(sendScale, {
          toValue: 0.85,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(sendScale, {
          toValue: 1,
          duration: 80,
          useNativeDriver: true,
        }),
      ]).start();

      sendMessage(messageText);
      setInput('');

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      console.log('[AI Assistant] Sent message:', messageText);
    },
    [input, sendMessage, sendScale],
  );

  const handleClearChat = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setMessages([]);
    console.log('[AI Assistant] Chat cleared');
  }, [setMessages]);

  const handleSelectPrompt = useCallback(
    (text: string) => {
      handleSend(text);
    },
    [handleSend],
  );

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  }, [messages]);

  const renderMessageContent = useCallback(() => {
    return messages.map((m) => {
      const textParts = m.parts.filter((p) => p.type === 'text');
      const fullText = textParts
        .map((p) => (p.type === 'text' ? p.text : ''))
        .join('');

      const isLastAssistant =
        m.role === 'assistant' &&
        m.id === messages[messages.length - 1]?.id;

      const isStreaming = isLastAssistant && !fullText;

      if (m.role === 'user' || m.role === 'assistant') {
        return (
          <MessageBubble
            key={m.id}
            role={m.role}
            content={fullText}
            isStreaming={isStreaming}
          />
        );
      }

      return null;
    });
  }, [messages]);

  const isLastMessageStreaming =
    messages.length > 0 &&
    messages[messages.length - 1]?.role === 'assistant' &&
    messages[messages.length - 1]?.parts.filter((p) => p.type === 'text').length === 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Bot size={20} color={Colors.accent} strokeWidth={2} />
          </View>
          <Text style={styles.headerTitle}>AI投研助理</Text>
        </View>
        {hasMessages && (
          <Pressable
            style={styles.clearBtn}
            onPress={handleClearChat}
            hitSlop={8}
          >
            <Trash2 size={18} color={Colors.textTertiary} />
          </Pressable>
        )}
      </View>

      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesList}
          contentContainerStyle={[
            styles.messagesContent,
            !hasMessages && styles.messagesContentEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {!hasMessages ? (
            <WelcomeView onSelectPrompt={handleSelectPrompt} />
          ) : (
            <>
              {renderMessageContent()}
              {isLastMessageStreaming && (
                <View style={styles.loadingRow}>
                  <View style={styles.aiBubbleAvatar}>
                    <Bot size={16} color={Colors.accent} strokeWidth={2} />
                  </View>
                  <View style={styles.loadingBubble}>
                    <ActivityIndicator size="small" color={Colors.accent} />
                    <Text style={styles.loadingText}>正在思考...</Text>
                  </View>
                </View>
              )}
              <View style={{ height: 20 }} />
            </>
          )}
        </ScrollView>

        <View
          style={[
            styles.inputArea,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="输入您的投研问题..."
              placeholderTextColor={Colors.textMuted}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={2000}
              returnKeyType="default"
              testID="ai-input"
            />
            <Animated.View style={{ transform: [{ scale: sendScale }] }}>
              <Pressable
                style={[
                  styles.sendBtn,
                  !input.trim() && styles.sendBtnDisabled,
                ]}
                onPress={() => handleSend()}
                disabled={!input.trim()}
                testID="ai-send-btn"
              >
                <Send
                  size={18}
                  color={input.trim() ? '#FFFFFF' : Colors.textMuted}
                />
              </Pressable>
            </Animated.View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.divider,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  clearBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: Colors.surface,
  },
  chatArea: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  messagesContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 40,
  },
  botIconWrapper: {
    marginBottom: 20,
  },
  botIconGradient: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    maxWidth: 280,
  },
  promptsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  promptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    width: '47%',
    minWidth: 150,
  },
  promptCardPressed: {
    backgroundColor: Colors.surface,
    borderColor: Colors.accent,
  },
  promptIconRow: {
    flexShrink: 0,
  },
  promptText: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '500' as const,
    lineHeight: 18,
    flex: 1,
  },
  messageBubbleRow: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '100%',
  },
  messageBubbleRowUser: {
    justifyContent: 'flex-end',
  },
  messageBubbleRowAI: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  aiBubbleAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 2,
    flexShrink: 0,
  },
  messageBubble: {
    maxWidth: '78%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: Colors.accent,
    borderBottomRightRadius: 6,
  },
  aiBubble: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 6,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  aiMessageText: {
    color: Colors.textPrimary,
  },
  streamingDot: {
    marginTop: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
    opacity: 0.6,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 6,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
  inputArea: {
    backgroundColor: Colors.white,
    borderTopWidth: 0.5,
    borderTopColor: Colors.divider,
    paddingTop: 10,
    paddingHorizontal: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'ios' ? 12 : 10,
    paddingBottom: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 15,
    color: Colors.textPrimary,
    maxHeight: 120,
    minHeight: 44,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.surface,
  },
});
