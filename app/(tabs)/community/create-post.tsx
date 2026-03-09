import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, Pressable, Platform, Animated, TextInput, KeyboardAvoidingView, ScrollView, Image, Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft, ChevronDown, TrendingUp, TrendingDown, Send, ImagePlus, X, Search } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

interface SymbolCategory {
  title: string;
  items: { label: string; color: string }[];
}

const SYMBOL_CATEGORIES: SymbolCategory[] = [
  {
    title: '加密货币',
    items: [
      { label: 'BTCUSDT', color: '#F7931A' },
      { label: 'ETHUSDT', color: '#627EEA' },
      { label: 'BNBUSDT', color: '#F3BA2F' },
      { label: 'SOLUSDT', color: '#9945FF' },
      { label: 'XRPUSDT', color: '#23292F' },
      { label: 'ADAUSDT', color: '#0033AD' },
      { label: 'DOGEUSDT', color: '#C2A633' },
      { label: 'DOTUSDT', color: '#E6007A' },
    ],
  },
  {
    title: '外汇',
    items: [
      { label: 'EURUSD', color: '#1A73E8' },
      { label: 'GBPUSD', color: '#003DA5' },
      { label: 'USDJPY', color: '#BC002D' },
      { label: 'AUDUSD', color: '#00843D' },
      { label: 'USDCAD', color: '#FF0000' },
      { label: 'USDCHF', color: '#D52B1E' },
    ],
  },
  {
    title: '贵金属 & 商品',
    items: [
      { label: 'XAUUSD', color: '#C8902E' },
      { label: 'XAGUSD', color: '#9E9E9E' },
      { label: 'WTI原油', color: '#4A4A4A' },
      { label: '天然气', color: '#2196F3' },
      { label: '铜', color: '#B87333' },
    ],
  },
  {
    title: '美股',
    items: [
      { label: 'AAPL', color: '#1C1C1E' },
      { label: 'TSLA', color: '#CC0000' },
      { label: 'NVDA', color: '#76B900' },
      { label: 'MSFT', color: '#00A4EF' },
      { label: 'GOOGL', color: '#4285F4' },
      { label: 'AMZN', color: '#FF9900' },
      { label: 'META', color: '#0668E1' },
      { label: 'QQQ', color: '#6A5ACD' },
      { label: 'SPY', color: '#E8731A' },
    ],
  },
  {
    title: 'A股',
    items: [
      { label: '000001', color: '#C41E3A' },
      { label: '600519', color: '#B71C1C' },
      { label: '601318', color: '#1565C0' },
      { label: '000858', color: '#D84315' },
      { label: '300750', color: '#2E7D32' },
    ],
  },
  {
    title: '港股',
    items: [
      { label: '00700', color: '#00A3A3' },
      { label: '09988', color: '#E85D1A' },
      { label: '03690', color: '#FF6A00' },
      { label: '01810', color: '#FF6900' },
      { label: '09999', color: '#18A058' },
    ],
  },
  {
    title: '指数',
    items: [
      { label: '上证指数', color: '#1E3A5F' },
      { label: '深证成指', color: '#2D5F9A' },
      { label: '恒生指数', color: '#C41E3A' },
      { label: '纳斯达克', color: '#0097A7' },
      { label: '标普500', color: '#E8731A' },
      { label: '道琼斯', color: '#003DA5' },
    ],
  },
];

const ALL_SYMBOLS = SYMBOL_CATEGORIES.flatMap((c) => c.items);
const MAX_IMAGES = 9;

export default function CreatePostScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState(ALL_SYMBOLS[0]);
  const [direction, setDirection] = useState<'up' | 'down'>('up');
  const [showSymbolPicker, setShowSymbolPicker] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [symbolSearch, setSymbolSearch] = useState('');
  const publishScale = useRef(new Animated.Value(1)).current;

  const handlePublish = useCallback(() => {
    if (!title.trim()) return;
    if (Platform.OS !== 'web') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Animated.sequence([
      Animated.timing(publishScale, { toValue: 0.9, duration: 80, useNativeDriver: true }),
      Animated.timing(publishScale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start(() => {
      console.log(`[CreatePost] Published: symbol=${selectedSymbol.label}, direction=${direction}, title=${title}, images=${images.length}`);
      router.back();
    });
  }, [title, selectedSymbol, direction, publishScale, router, images]);

  const pickImage = useCallback(async () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert('提示', `最多上传${MAX_IMAGES}张图片`);
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: MAX_IMAGES - images.length,
        quality: 0.8,
      });
      if (!result.canceled && result.assets.length > 0) {
        const newUris = result.assets.map((a) => a.uri).slice(0, MAX_IMAGES - images.length);
        setImages((prev) => [...prev, ...newUris]);
        console.log(`[CreatePost] Picked ${newUris.length} images`);
        if (Platform.OS !== 'web') {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }
    } catch (e) {
      console.log('[CreatePost] Image pick error:', e);
    }
  }, [images]);

  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const filteredCategories = symbolSearch.trim()
    ? SYMBOL_CATEGORIES.map((cat) => ({
        ...cat,
        items: cat.items.filter((s) => s.label.toLowerCase().includes(symbolSearch.toLowerCase())),
      })).filter((cat) => cat.items.length > 0)
    : SYMBOL_CATEGORIES;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen
        options={{
          title: '发表观点',
          headerShown: true,
          headerStyle: { backgroundColor: Colors.white },
          headerShadowVisible: false,
          headerTitleStyle: { fontSize: 17, fontWeight: '700' as const, color: Colors.textPrimary },
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
              <ArrowLeft size={22} color={Colors.textPrimary} />
            </Pressable>
          ),
          headerRight: () => (
            <Animated.View style={{ transform: [{ scale: publishScale }] }}>
              <Pressable
                style={[styles.publishBtn, title.trim() ? styles.publishBtnActive : null]}
                onPress={handlePublish}
                disabled={!title.trim()}
              >
                <Send size={16} color={title.trim() ? Colors.white : Colors.textMuted} />
                <Text style={[styles.publishText, title.trim() && styles.publishTextActive]}>
                  发布
                </Text>
              </Pressable>
            </Animated.View>
          ),
        }}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.symbolSection}>
          <Text style={styles.sectionLabel}>交易品种</Text>
          <Pressable
            style={styles.symbolSelector}
            onPress={() => {
              if (Platform.OS !== 'web') {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setShowSymbolPicker((v) => !v);
            }}
          >
            <View style={[styles.symbolDot, { backgroundColor: selectedSymbol.color }]} />
            <Text style={styles.symbolSelectorText}>{selectedSymbol.label}</Text>
            <ChevronDown size={16} color={Colors.textTertiary} />
          </Pressable>

          {showSymbolPicker && (
            <View style={styles.symbolPickerContainer}>
              <View style={styles.symbolSearchBar}>
                <Search size={14} color={Colors.textMuted} />
                <TextInput
                  style={styles.symbolSearchInput}
                  placeholder="搜索品种..."
                  placeholderTextColor={Colors.textMuted}
                  value={symbolSearch}
                  onChangeText={setSymbolSearch}
                />
              </View>
              <ScrollView style={styles.symbolPickerScroll} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                {filteredCategories.map((cat) => (
                  <View key={cat.title} style={styles.symbolCategoryBlock}>
                    <Text style={styles.symbolCategoryTitle}>{cat.title}</Text>
                    <View style={styles.symbolPickerGrid}>
                      {cat.items.map((s) => (
                        <Pressable
                          key={s.label}
                          style={[
                            styles.symbolOption,
                            selectedSymbol.label === s.label && styles.symbolOptionActive,
                          ]}
                          onPress={() => {
                            setSelectedSymbol(s);
                            setShowSymbolPicker(false);
                            setSymbolSearch('');
                            if (Platform.OS !== 'web') {
                              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            }
                          }}
                        >
                          <View style={[styles.symbolOptionDot, { backgroundColor: s.color }]} />
                          <Text style={[
                            styles.symbolOptionText,
                            selectedSymbol.label === s.label && styles.symbolOptionTextActive,
                          ]}>
                            {s.label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ))}
                {filteredCategories.length === 0 && (
                  <Text style={styles.noResultText}>未找到匹配品种</Text>
                )}
              </ScrollView>
            </View>
          )}
        </View>

        <View style={styles.directionSection}>
          <Text style={styles.sectionLabel}>方向</Text>
          <View style={styles.directionRow}>
            <Pressable
              style={[styles.directionBtn, direction === 'up' && styles.directionBtnUp]}
              onPress={() => {
                setDirection('up');
                if (Platform.OS !== 'web') {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
            >
              <TrendingUp size={18} color={direction === 'up' ? Colors.green : Colors.textMuted} />
              <Text style={[styles.directionText, direction === 'up' && { color: Colors.green }]}>看涨</Text>
            </Pressable>
            <Pressable
              style={[styles.directionBtn, direction === 'down' && styles.directionBtnDown]}
              onPress={() => {
                setDirection('down');
                if (Platform.OS !== 'web') {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
            >
              <TrendingDown size={18} color={direction === 'down' ? Colors.red : Colors.textMuted} />
              <Text style={[styles.directionText, direction === 'down' && { color: Colors.red }]}>看跌</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.sectionLabel}>观点内容</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="分享你的交易观点、技术分析或市场洞察..."
            placeholderTextColor={Colors.textMuted}
            value={title}
            onChangeText={setTitle}
            multiline
            maxLength={500}
            textAlignVertical="top"
            testID="post-title-input"
          />
          <Text style={styles.charCount}>{title.length}/500</Text>
        </View>

        <View style={styles.imageSection}>
          <Text style={styles.sectionLabel}>图片 ({images.length}/{MAX_IMAGES})</Text>
          <View style={styles.imageGrid}>
            {images.map((uri, idx) => (
              <View key={`img-${idx}`} style={styles.imageItem}>
                <Image source={{ uri }} style={styles.imageThumb} />
                <Pressable
                  style={styles.imageRemoveBtn}
                  onPress={() => removeImage(idx)}
                  hitSlop={8}
                >
                  <X size={12} color={Colors.white} />
                </Pressable>
              </View>
            ))}
            {images.length < MAX_IMAGES && (
              <Pressable style={styles.imageAddBtn} onPress={pickImage} testID="pick-image-btn">
                <ImagePlus size={24} color={Colors.textMuted} />
                <Text style={styles.imageAddText}>添加图片</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.previewSection}>
          <Text style={styles.sectionLabel}>预览</Text>
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <View style={styles.previewAvatar}>
                <Text style={styles.previewAvatarText}>W</Text>
              </View>
              <View>
                <Text style={styles.previewName}>我</Text>
                <Text style={styles.previewDate}>刚刚</Text>
              </View>
            </View>
            <View style={styles.previewSymbolRow}>
              <View style={[styles.previewSymbolTag, { backgroundColor: `${selectedSymbol.color}18` }]}>
                <View style={[styles.previewSymbolIcon, { backgroundColor: selectedSymbol.color }]}>
                  <Text style={styles.previewSymbolIconText}>{selectedSymbol.label.charAt(0)}</Text>
                </View>
                <Text style={[styles.previewSymbolName, { color: selectedSymbol.color }]}>
                  {selectedSymbol.label}
                </Text>
              </View>
              <View style={[
                styles.previewDirection,
                { backgroundColor: direction === 'up' ? Colors.greenDim : Colors.redDim },
              ]}>
                {direction === 'up' ? (
                  <TrendingUp size={12} color={Colors.green} />
                ) : (
                  <TrendingDown size={12} color={Colors.red} />
                )}
              </View>
            </View>
            <Text style={styles.previewTitle}>
              {title.trim() || '在这里输入你的观点...'}
            </Text>
            {images.length > 0 && (
              <View style={styles.previewImageRow}>
                {images.slice(0, 3).map((uri, idx) => (
                  <Image key={`prev-${idx}`} source={{ uri }} style={styles.previewImage} />
                ))}
                {images.length > 3 && (
                  <View style={styles.previewImageMore}>
                    <Text style={styles.previewImageMoreText}>+{images.length - 3}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  backBtn: {
    padding: 4,
  },
  publishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  publishBtnActive: {
    backgroundColor: Colors.accent,
  },
  publishText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textMuted,
  },
  publishTextActive: {
    color: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textTertiary,
    marginBottom: 10,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  symbolSection: {
    marginBottom: 24,
  },
  symbolSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  symbolDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  symbolSelectorText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    flex: 1,
  },
  symbolPickerContainer: {
    marginTop: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    maxHeight: 320,
  },
  symbolSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
    marginBottom: 10,
  },
  symbolSearchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    padding: 0,
  },
  symbolPickerScroll: {
    maxHeight: 250,
  },
  symbolCategoryBlock: {
    marginBottom: 12,
  },
  symbolCategoryTitle: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textTertiary,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  symbolPickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  noResultText: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center' as const,
    paddingVertical: 20,
  },
  symbolOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: Colors.surface,
  },
  symbolOptionActive: {
    backgroundColor: Colors.textPrimary,
  },
  symbolOptionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  symbolOptionText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  symbolOptionTextActive: {
    color: Colors.white,
  },
  directionSection: {
    marginBottom: 24,
  },
  directionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  directionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  directionBtnUp: {
    borderColor: Colors.green,
    backgroundColor: Colors.greenDim,
  },
  directionBtnDown: {
    borderColor: Colors.red,
    backgroundColor: Colors.redDim,
  },
  directionText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textMuted,
  },
  titleSection: {
    marginBottom: 24,
  },
  titleInput: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'right' as const,
    marginTop: 6,
    fontVariant: ['tabular-nums'] as const,
  },
  previewSection: {
    marginBottom: 24,
  },
  previewCard: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 16,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  previewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8B7E74',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewAvatarText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700' as const,
  },
  previewName: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  previewDate: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  previewSymbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  previewSymbolTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 5,
  },
  previewSymbolIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewSymbolIconText: {
    color: Colors.white,
    fontSize: 8,
    fontWeight: '700' as const,
  },
  previewSymbolName: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  previewDirection: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  previewImageRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  previewImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: Colors.surface,
  },
  previewImageMore: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImageMoreText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textTertiary,
  },
  imageSection: {
    marginBottom: 24,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  imageItem: {
    width: 96,
    height: 96,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageThumb: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },
  imageRemoveBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageAddBtn: {
    width: 96,
    height: 96,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.divider,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: Colors.background,
  },
  imageAddText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
});
