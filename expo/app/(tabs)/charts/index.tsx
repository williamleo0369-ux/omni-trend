import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, Pressable, Platform, ScrollView, Dimensions,
  Modal, TextInput, FlatList, Animated, Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pencil, Layers, MoreHorizontal, Search, X, ArrowUpRight, ArrowDownRight, Plus, TrendingUp, Minus, ArrowUp, BarChart3, GitBranch, Trash2, Eye, EyeOff, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { generateCandleData, etfStocks, watchlistStocks } from '@/mocks/market';
import { CandleData, WatchlistStock } from '@/types/market';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_PADDING = 12;
const PRICE_LABEL_WIDTH = 56;
const CHART_WIDTH = SCREEN_WIDTH - CHART_PADDING * 2 - PRICE_LABEL_WIDTH;
const CHART_HEIGHT = 340;
const VOLUME_HEIGHT = 80;

interface DrawingTool {
  id: string;
  name: string;
  icon: 'trend' | 'horizontal' | 'vertical' | 'fibonacci' | 'ray' | 'channel';
  description: string;
}

interface ChartIndicator {
  id: string;
  name: string;
  shortName: string;
  category: 'trend' | 'oscillator' | 'volume' | 'volatility';
  description: string;
  color: string;
  params?: string;
}

interface DrawnItem {
  id: string;
  toolId: string;
  toolName: string;
  visible: boolean;
  timestamp: number;
}

const DRAWING_TOOLS: DrawingTool[] = [
  { id: 'trendline', name: '趋势线', icon: 'trend', description: '连接两点绘制趋势线' },
  { id: 'horizontal', name: '水平线', icon: 'horizontal', description: '在指定价位绘制水平线' },
  { id: 'vertical', name: '垂直线', icon: 'vertical', description: '在指定时间绘制垂直线' },
  { id: 'fibonacci', name: '斐波那契', icon: 'fibonacci', description: '斐波那契回撤线' },
  { id: 'ray', name: '射线', icon: 'ray', description: '从一点出发的射线' },
  { id: 'channel', name: '平行通道', icon: 'channel', description: '绘制平行通道线' },
];

const CHART_INDICATORS: ChartIndicator[] = [
  { id: 'ma5', name: '移动平均线 (5)', shortName: 'MA5', category: 'trend', description: '5日均线', color: '#FF6B6B', params: '周期: 5' },
  { id: 'ma10', name: '移动平均线 (10)', shortName: 'MA10', category: 'trend', description: '10日均线', color: '#4ECDC4', params: '周期: 10' },
  { id: 'ma20', name: '移动平均线 (20)', shortName: 'MA20', category: 'trend', description: '20日均线', color: '#FFE66D', params: '周期: 20' },
  { id: 'ma60', name: '移动平均线 (60)', shortName: 'MA60', category: 'trend', description: '60日均线', color: '#A78BFA', params: '周期: 60' },
  { id: 'ema12', name: '指数均线 (12)', shortName: 'EMA12', category: 'trend', description: '12日指数移动平均', color: '#F472B6', params: '周期: 12' },
  { id: 'ema26', name: '指数均线 (26)', shortName: 'EMA26', category: 'trend', description: '26日指数移动平均', color: '#34D399', params: '周期: 26' },
  { id: 'boll', name: '布林带', shortName: 'BOLL', category: 'volatility', description: '布林带 (20,2)', color: '#60A5FA', params: '周期: 20, 偏差: 2' },
  { id: 'macd', name: 'MACD', shortName: 'MACD', category: 'oscillator', description: '指数平滑异同平均', color: '#F59E0B', params: '12, 26, 9' },
  { id: 'rsi', name: 'RSI', shortName: 'RSI', category: 'oscillator', description: '相对强弱指标', color: '#8B5CF6', params: '周期: 14' },
  { id: 'kdj', name: 'KDJ', shortName: 'KDJ', category: 'oscillator', description: '随机指标', color: '#EC4899', params: '9, 3, 3' },
  { id: 'vol', name: '成交量', shortName: 'VOL', category: 'volume', description: '成交量柱状图', color: '#6EE7B7', params: '默认' },
  { id: 'obv', name: 'OBV', shortName: 'OBV', category: 'volume', description: '能量潮指标', color: '#93C5FD', params: '默认' },
  { id: 'atr', name: 'ATR', shortName: 'ATR', category: 'volatility', description: '平均真实波幅', color: '#FCA5A5', params: '周期: 14' },
  { id: 'cci', name: 'CCI', shortName: 'CCI', category: 'oscillator', description: '商品通道指数', color: '#A5B4FC', params: '周期: 20' },
];

const INDICATOR_CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: 'trend', label: '趋势' },
  { key: 'oscillator', label: '震荡' },
  { key: 'volume', label: '成交量' },
  { key: 'volatility', label: '波动率' },
] as const;

type IndicatorCategoryKey = typeof INDICATOR_CATEGORIES[number]['key'];

const CATEGORY_FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'index', label: '指数' },
  { key: 'stock', label: '股票' },
  { key: 'etf', label: 'ETF' },
  { key: 'futures', label: '期货' },
] as const;

type CategoryKey = typeof CATEGORY_FILTERS[number]['key'];

const allSearchableStocks: WatchlistStock[] = [...watchlistStocks, ...etfStocks];

function getCategoryLabel(cat?: string): string {
  switch (cat) {
    case 'index': return '指数';
    case 'stock': return '股票';
    case 'etf': return 'ETF';
    case 'futures': return '期货';
    case 'crypto': return '加密';
    case 'forex': return '外汇';
    default: return '其他';
  }
}

function getCategoryColor(cat?: string): { bg: string; text: string } {
  switch (cat) {
    case 'index': return { bg: Colors.accentDim, text: Colors.accent };
    case 'stock': return { bg: Colors.redDim, text: Colors.red };
    case 'etf': return { bg: Colors.purpleDim, text: Colors.purple };
    case 'futures': return { bg: Colors.goldDim, text: Colors.gold };
    default: return { bg: Colors.greenDim, text: Colors.green };
  }
}

function CandlestickChart({ candles }: { candles: CandleData[] }) {
  const displayCandles = candles.slice(-60);
  const allPrices = displayCandles.flatMap((c) => [c.high, c.low]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice || 1;
  const maxVolume = Math.max(...displayCandles.map((c) => c.volume));

  const candleWidth = Math.max(2, (CHART_WIDTH / displayCandles.length) * 0.6);
  const candleGap = (CHART_WIDTH - candleWidth * displayCandles.length) / displayCandles.length;

  const priceToY = (price: number) => {
    return CHART_HEIGHT - ((price - minPrice) / priceRange) * CHART_HEIGHT;
  };

  const gridPrices = [0, 0.25, 0.5, 0.75, 1].map(
    (r) => Math.round((minPrice + priceRange * r) * 100) / 100
  );

  const lastCandle = displayCandles[displayCandles.length - 1];
  const lastPriceY = lastCandle ? priceToY(lastCandle.close) : 0;

  return (
    <View>
      <View style={styles.chartArea}>
        {gridPrices.map((price, i) => (
          <View key={i} style={[styles.gridLine, { top: priceToY(price) }]} />
        ))}

        {lastCandle && (
          <View style={[styles.currentPriceLine, { top: lastPriceY }]}>
            <View style={styles.dashedLine} />
            <View style={styles.currentPriceTag}>
              <Text style={styles.currentPriceTagText}>{lastCandle.close.toFixed(2)}</Text>
              <Text style={styles.currentPriceTime}>05:48:17</Text>
            </View>
          </View>
        )}

        {displayCandles.map((candle, i) => {
          const isUp = candle.close >= candle.open;
          const color = isUp ? Colors.green : Colors.red;
          const bodyTop = priceToY(Math.max(candle.open, candle.close));
          const bodyBottom = priceToY(Math.min(candle.open, candle.close));
          const bodyHeight = Math.max(1, bodyBottom - bodyTop);
          const wickTop = priceToY(candle.high);
          const wickBottom = priceToY(candle.low);
          const x = i * (candleWidth + candleGap) + candleGap / 2;

          return (
            <View key={i}>
              <View
                style={{
                  position: 'absolute' as const,
                  left: x + candleWidth / 2 - 0.5,
                  top: wickTop,
                  width: 1,
                  height: wickBottom - wickTop,
                  backgroundColor: color,
                }}
              />
              <View
                style={{
                  position: 'absolute' as const,
                  left: x,
                  top: bodyTop,
                  width: candleWidth,
                  height: bodyHeight,
                  backgroundColor: color,
                  borderRadius: candleWidth > 4 ? 1 : 0,
                }}
              />
            </View>
          );
        })}

        <View style={styles.priceLabels}>
          {[...gridPrices].reverse().map((price, i) => (
            <Text key={i} style={styles.priceLabel}>{price.toFixed(2)}</Text>
          ))}
        </View>
      </View>

      <View style={styles.volumeArea}>
        {displayCandles.map((candle, i) => {
          const isUp = candle.close >= candle.open;
          const color = isUp ? 'rgba(18, 183, 106, 0.5)' : 'rgba(240, 68, 56, 0.5)';
          const height = (candle.volume / maxVolume) * VOLUME_HEIGHT;
          const x = i * (candleWidth + candleGap) + candleGap / 2;

          return (
            <View
              key={i}
              style={{
                position: 'absolute' as const,
                left: x,
                bottom: 0,
                width: candleWidth,
                height,
                backgroundColor: color,
              }}
            />
          );
        })}
        <View style={styles.volumeLabel}>
          <Text style={styles.volumeLabelText}>
            {lastCandle ? `${(lastCandle.volume / 1000).toFixed(2)} K` : ''}
          </Text>
        </View>
      </View>

      <View style={styles.dateLabels}>
        {displayCandles
          .filter((_, i) => i % 20 === 0 || i === displayCandles.length - 1)
          .map((candle, i) => (
            <Text key={i} style={styles.dateLabel}>{candle.date}</Text>
          ))}
      </View>
    </View>
  );
}

function SearchResultItem({ item, onSelect }: { item: WatchlistStock; onSelect: (s: WatchlistStock) => void }) {
  const isPositive = item.changePercent >= 0;
  const catStyle = getCategoryColor(item.category);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 4 }).start();
  }, [scaleAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        style={styles.searchResultRow}
        onPress={() => onSelect(item)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={[styles.logoCircle, { backgroundColor: item.logoColor || Colors.accent }]}>
          <Text style={styles.logoCircleText}>{item.logoText || item.code.charAt(0)}</Text>
        </View>
        <View style={styles.searchResultInfo}>
          <View style={styles.searchResultNameRow}>
            <Text style={styles.searchResultName} numberOfLines={1}>{item.name}</Text>
            <View style={[styles.catBadge, { backgroundColor: catStyle.bg }]}>
              <Text style={[styles.catBadgeText, { color: catStyle.text }]}>{getCategoryLabel(item.category)}</Text>
            </View>
          </View>
          <Text style={styles.searchResultCode}>{item.code}</Text>
        </View>
        <View style={styles.searchResultRight}>
          <Text style={[styles.searchResultPrice, { color: isPositive ? Colors.red : Colors.green }]}>
            {item.price.toFixed(item.price >= 100 ? 2 : 3)}
          </Text>
          <View style={[styles.searchChangeBadge, { backgroundColor: isPositive ? Colors.redDim : Colors.greenDim }]}>
            {isPositive ? (
              <ArrowUpRight size={10} color={Colors.red} />
            ) : (
              <ArrowDownRight size={10} color={Colors.green} />
            )}
            <Text style={[styles.searchChangeText, { color: isPositive ? Colors.red : Colors.green }]}>
              {isPositive ? '+' : ''}{item.changePercent.toFixed(2)}%
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function DrawingToolIcon({ type, size, color }: { type: DrawingTool['icon']; size: number; color: string }) {
  switch (type) {
    case 'trend': return <TrendingUp size={size} color={color} />;
    case 'horizontal': return <Minus size={size} color={color} />;
    case 'vertical': return <ArrowUp size={size} color={color} />;
    case 'fibonacci': return <GitBranch size={size} color={color} />;
    case 'ray': return <ArrowUpRight size={size} color={color} />;
    case 'channel': return <BarChart3 size={size} color={color} />;
    default: return <Pencil size={size} color={color} />;
  }
}

export default function ChartsScreen() {
  const insets = useSafeAreaInsets();
  const { watchlist } = useApp();
  const [selectedStock, setSelectedStock] = useState<WatchlistStock>(watchlist[0] || allSearchableStocks[0]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1天');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState<CategoryKey>('all');
  const slideAnim = useRef(new Animated.Value(0)).current;

  const [showDrawingTools, setShowDrawingTools] = useState(false);
  const [showIndicators, setShowIndicators] = useState(false);
  const [activeDrawingTool, setActiveDrawingTool] = useState<string | null>(null);
  const [drawnItems, setDrawnItems] = useState<DrawnItem[]>([]);
  const [activeIndicators, setActiveIndicators] = useState<string[]>(['ma5', 'ma10', 'vol']);
  const [indicatorCategory, setIndicatorCategory] = useState<IndicatorCategoryKey>('all');
  const drawingSlideAnim = useRef(new Animated.Value(0)).current;
  const indicatorSlideAnim = useRef(new Animated.Value(0)).current;

  const timeframes = ['1天', '1周', '1月', '3月', '1年'];

  const allStocksForChips = useMemo(() => {
    const ids = new Set(watchlist.map((s) => s.id));
    const extras = allSearchableStocks.filter((s) => !ids.has(s.id));
    return [...watchlist, ...extras];
  }, [watchlist]);

  const liveStock = useMemo(() => {
    if (!selectedStock) return null;
    const found = watchlist.find((s) => s.id === selectedStock.id);
    return found ?? selectedStock;
  }, [watchlist, selectedStock]);

  const isPositive = liveStock ? liveStock.change >= 0 : true;

  const candles = useMemo(() => {
    if (!selectedStock) return [];
    const days = selectedTimeframe === '1天' ? 60 : selectedTimeframe === '1周' ? 90 : 120;
    return generateCandleData(days, selectedStock.price);
  }, [selectedStock, selectedTimeframe]);

  const searchResults = useMemo(() => {
    let filtered = allSearchableStocks;
    if (searchCategory !== 'all') {
      filtered = filtered.filter((s) => s.category === searchCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          (s.fullName && s.fullName.toLowerCase().includes(q))
      );
    }
    return filtered;
  }, [searchQuery, searchCategory]);

  const openDrawingTools = useCallback(() => {
    setShowDrawingTools(true);
    drawingSlideAnim.setValue(0);
    Animated.spring(drawingSlideAnim, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 2 }).start();
    if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log('[Charts] Drawing tools opened');
  }, [drawingSlideAnim]);

  const closeDrawingTools = useCallback(() => {
    Animated.timing(drawingSlideAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setShowDrawingTools(false));
  }, [drawingSlideAnim]);

  const selectDrawingTool = useCallback((toolId: string) => {
    const tool = DRAWING_TOOLS.find(t => t.id === toolId);
    if (!tool) return;
    setActiveDrawingTool(toolId);
    const newItem: DrawnItem = {
      id: `${toolId}_${Date.now()}`,
      toolId,
      toolName: tool.name,
      visible: true,
      timestamp: Date.now(),
    };
    setDrawnItems(prev => [...prev, newItem]);
    if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log(`[Charts] Drawing tool selected: ${tool.name}`);
  }, []);

  const toggleDrawnItemVisibility = useCallback((itemId: string) => {
    setDrawnItems(prev => prev.map(item => item.id === itemId ? { ...item, visible: !item.visible } : item));
    if (Platform.OS !== 'web') void Haptics.selectionAsync();
  }, []);

  const removeDrawnItem = useCallback((itemId: string) => {
    setDrawnItems(prev => prev.filter(item => item.id !== itemId));
    if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const clearAllDrawings = useCallback(() => {
    setDrawnItems([]);
    setActiveDrawingTool(null);
    if (Platform.OS !== 'web') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    console.log('[Charts] All drawings cleared');
  }, []);

  const openIndicators = useCallback(() => {
    setShowIndicators(true);
    setIndicatorCategory('all');
    indicatorSlideAnim.setValue(0);
    Animated.spring(indicatorSlideAnim, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 2 }).start();
    if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log('[Charts] Indicators panel opened');
  }, [indicatorSlideAnim]);

  const closeIndicators = useCallback(() => {
    Animated.timing(indicatorSlideAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setShowIndicators(false));
  }, [indicatorSlideAnim]);

  const toggleIndicator = useCallback((indicatorId: string) => {
    setActiveIndicators(prev => {
      const exists = prev.includes(indicatorId);
      if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const updated = exists ? prev.filter(id => id !== indicatorId) : [...prev, indicatorId];
      console.log(`[Charts] Indicator ${indicatorId} ${exists ? 'removed' : 'added'}. Active: ${updated.join(', ')}`);
      return updated;
    });
  }, []);

  const filteredIndicators = useMemo(() => {
    if (indicatorCategory === 'all') return CHART_INDICATORS;
    return CHART_INDICATORS.filter(ind => ind.category === indicatorCategory);
  }, [indicatorCategory]);

  const openSearch = useCallback(() => {
    setShowSearch(true);
    setSearchQuery('');
    setSearchCategory('all');
    slideAnim.setValue(0);
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 14,
      bounciness: 2,
    }).start();
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    console.log('[Charts] Search opened');
  }, [slideAnim]);

  const closeSearch = useCallback(() => {
    Keyboard.dismiss();
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowSearch(false);
    });
    console.log('[Charts] Search closed');
  }, [slideAnim]);

  const handleSelectFromSearch = useCallback((stock: WatchlistStock) => {
    setSelectedStock(stock);
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    closeSearch();
    console.log(`[Charts] Selected stock from search: ${stock.name} (${stock.code})`);
  }, [closeSearch]);

  const handleChipSelect = useCallback((stock: WatchlistStock) => {
    setSelectedStock(stock);
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    console.log(`[Charts] Selected stock from chip: ${stock.code}`);
  }, []);

  const renderSearchItem = useCallback(({ item }: { item: WatchlistStock }) => {
    return <SearchResultItem item={item} onSelect={handleSelectFromSearch} />;
  }, [handleSelectFromSearch]);

  if (!selectedStock || !liveStock) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.emptyText}>请先添加自选股</Text>
      </View>
    );
  }

  const modalTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.stockHeader}>
        <Pressable onPress={openSearch} style={styles.stockNameRow}>
          <Text style={styles.stockName}>{liveStock.name}</Text>
          <View style={styles.indicatorDots}>
            <View style={[styles.dot, { backgroundColor: Colors.green }]} />
            <View style={[styles.dot, { backgroundColor: '#FFB6C1' }]} />
          </View>
        </Pressable>
        <View style={styles.priceInfo}>
          <Text style={[styles.stockPrice, { color: isPositive ? Colors.red : Colors.green }]}>
            {liveStock.price.toFixed(2)}
          </Text>
          <Text style={[styles.stockChange, { color: isPositive ? Colors.red : Colors.green }]}>
            {isPositive ? '+' : ''}{liveStock.change.toFixed(2)} ({isPositive ? '+' : ''}{liveStock.changePercent.toFixed(2)}%)
          </Text>
        </View>
      </View>

      <ScrollView style={styles.chartScroll} showsVerticalScrollIndicator={false}>
        <CandlestickChart candles={candles} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stockList} contentContainerStyle={styles.stockListContent}>
          {allStocksForChips.map((stock) => {
            const isActive = stock.id === selectedStock.id;
            const chipColor = stock.changePercent >= 0 ? Colors.red : Colors.green;
            return (
              <Pressable
                key={stock.id}
                style={[styles.stockChip, isActive && styles.stockChipActive]}
                onPress={() => handleChipSelect(stock)}
                testID={`chart-chip-${stock.code}`}
              >
                <Text style={[
                  styles.stockChipText,
                  isActive && { color: chipColor, fontWeight: '700' as const },
                ]}>
                  {stock.code}
                </Text>
              </Pressable>
            );
          })}
          <Pressable style={styles.addChip} onPress={openSearch} testID="chart-add-stock">
            <Plus size={14} color={Colors.accent} />
          </Pressable>
        </ScrollView>

        <View style={styles.timeframeRow}>
          <Pressable style={styles.codeBtn} onPress={openSearch} testID="chart-code-btn">
            <Text style={styles.selectedStockCode}>{selectedStock.code}</Text>
            <Search size={12} color={Colors.textTertiary} style={{ marginLeft: 4 }} />
          </Pressable>
          {timeframes.map((tf) => (
            <Pressable
              key={tf}
              style={[styles.tfBtn, selectedTimeframe === tf && styles.tfBtnActive]}
              onPress={() => setSelectedTimeframe(tf)}
            >
              <Text style={[styles.tfText, selectedTimeframe === tf && styles.tfTextActive]}>
                {tf}
              </Text>
            </Pressable>
          ))}
          <View style={styles.toolIcons}>
            <Pressable style={[styles.toolBtn, activeDrawingTool ? styles.toolBtnActive : null]} onPress={openDrawingTools} testID="chart-drawing-btn">
              <Pencil size={16} color={activeDrawingTool ? Colors.accent : Colors.textSecondary} />
            </Pressable>
            <Pressable style={[styles.toolBtn, activeIndicators.length > 0 ? styles.toolBtnActive : null]} onPress={openIndicators} testID="chart-indicators-btn">
              <Layers size={16} color={activeIndicators.length > 0 ? Colors.accent : Colors.textSecondary} />
            </Pressable>
            <Pressable style={styles.toolBtn}>
              <MoreHorizontal size={16} color={Colors.textSecondary} />
            </Pressable>
          </View>
        </View>
      </View>

      {activeIndicators.length > 0 && (
        <View style={styles.activeIndicatorBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeIndicatorContent}>
            {activeIndicators.map(id => {
              const ind = CHART_INDICATORS.find(i => i.id === id);
              if (!ind) return null;
              return (
                <View key={id} style={[styles.activeIndicatorChip, { borderColor: ind.color + '60' }]}>
                  <View style={[styles.indicatorDot, { backgroundColor: ind.color }]} />
                  <Text style={[styles.activeIndicatorText, { color: ind.color }]}>{ind.shortName}</Text>
                  <Pressable onPress={() => toggleIndicator(id)} hitSlop={8}>
                    <X size={10} color={ind.color} />
                  </Pressable>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {activeDrawingTool && (
        <View style={styles.drawingActiveBar}>
          <View style={styles.drawingActiveInfo}>
            <Pencil size={14} color={Colors.accent} />
            <Text style={styles.drawingActiveText}>
              {DRAWING_TOOLS.find(t => t.id === activeDrawingTool)?.name ?? '画图工具'} - 在图表上拖动绘制
            </Text>
          </View>
          <Pressable onPress={() => setActiveDrawingTool(null)} style={styles.drawingCancelBtn}>
            <Text style={styles.drawingCancelText}>完成</Text>
          </Pressable>
        </View>
      )}

      {drawnItems.length > 0 && (
        <View style={styles.drawnOverlays}>
          {drawnItems.filter(d => d.visible).map(item => {
            const tool = DRAWING_TOOLS.find(t => t.id === item.toolId);
            const yPos = 30 + (drawnItems.indexOf(item) * 25) % (CHART_HEIGHT - 60);
            return (
              <View key={item.id} style={[styles.drawnLine, { top: yPos }]}>
                <View style={styles.drawnLineDash} />
                <Text style={styles.drawnLineLabel}>{tool?.name}</Text>
              </View>
            );
          })}
        </View>
      )}

      <Modal visible={showDrawingTools} animationType="none" transparent onRequestClose={closeDrawingTools}>
        <Pressable style={styles.modalOverlay} onPress={closeDrawingTools}>
          <Animated.View style={[
            styles.toolModalContent,
            { paddingBottom: insets.bottom + 12, transform: [{ translateY: drawingSlideAnim.interpolate({ inputRange: [0, 1], outputRange: [500, 0] }) }] },
          ]}>
            <Pressable onPress={() => {}}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>画图工具</Text>
                <Pressable onPress={closeDrawingTools} style={styles.modalCloseBtn}>
                  <X size={20} color={Colors.textSecondary} />
                </Pressable>
              </View>

              <View style={styles.drawingToolGrid}>
                {DRAWING_TOOLS.map(tool => {
                  const isActive = activeDrawingTool === tool.id;
                  return (
                    <Pressable
                      key={tool.id}
                      style={[styles.drawingToolCard, isActive && styles.drawingToolCardActive]}
                      onPress={() => { selectDrawingTool(tool.id); closeDrawingTools(); }}
                      testID={`drawing-tool-${tool.id}`}
                    >
                      <View style={[styles.drawingToolIconWrap, isActive && styles.drawingToolIconWrapActive]}>
                        <DrawingToolIcon type={tool.icon} size={22} color={isActive ? Colors.white : Colors.textSecondary} />
                      </View>
                      <Text style={[styles.drawingToolName, isActive && styles.drawingToolNameActive]}>{tool.name}</Text>
                      <Text style={styles.drawingToolDesc} numberOfLines={1}>{tool.description}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {drawnItems.length > 0 && (
                <View style={styles.drawnItemsSection}>
                  <View style={styles.drawnItemsHeader}>
                    <Text style={styles.drawnItemsTitle}>已绘制 ({drawnItems.length})</Text>
                    <Pressable onPress={clearAllDrawings} style={styles.clearAllBtn}>
                      <Trash2 size={14} color={Colors.red} />
                      <Text style={styles.clearAllText}>全部清除</Text>
                    </Pressable>
                  </View>
                  <ScrollView style={styles.drawnItemsList} showsVerticalScrollIndicator={false}>
                    {drawnItems.map(item => (
                      <View key={item.id} style={styles.drawnItemRow}>
                        <Pressable onPress={() => toggleDrawnItemVisibility(item.id)} style={styles.drawnItemVisBtn}>
                          {item.visible ? <Eye size={16} color={Colors.accent} /> : <EyeOff size={16} color={Colors.textMuted} />}
                        </Pressable>
                        <Text style={[styles.drawnItemName, !item.visible && styles.drawnItemNameHidden]}>{item.toolName}</Text>
                        <Text style={styles.drawnItemTime}>{new Date(item.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</Text>
                        <Pressable onPress={() => removeDrawnItem(item.id)} style={styles.drawnItemDeleteBtn}>
                          <X size={14} color={Colors.red} />
                        </Pressable>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>

      <Modal visible={showIndicators} animationType="none" transparent onRequestClose={closeIndicators}>
        <Pressable style={styles.modalOverlay} onPress={closeIndicators}>
          <Animated.View style={[
            styles.toolModalContent,
            { paddingBottom: insets.bottom + 12, transform: [{ translateY: indicatorSlideAnim.interpolate({ inputRange: [0, 1], outputRange: [600, 0] }) }] },
          ]}>
            <Pressable onPress={() => {}}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>技术指标</Text>
                <Pressable onPress={closeIndicators} style={styles.modalCloseBtn}>
                  <X size={20} color={Colors.textSecondary} />
                </Pressable>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.indicatorCatScroll} contentContainerStyle={styles.indicatorCatContent}>
                {INDICATOR_CATEGORIES.map(cat => {
                  const isActive = indicatorCategory === cat.key;
                  return (
                    <Pressable
                      key={cat.key}
                      style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                      onPress={() => { setIndicatorCategory(cat.key); if (Platform.OS !== 'web') void Haptics.selectionAsync(); }}
                    >
                      <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>{cat.label}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <View style={styles.activeCountRow}>
                <Text style={styles.activeCountText}>已启用 {activeIndicators.length} 个指标</Text>
              </View>
            </Pressable>

            <ScrollView style={styles.indicatorList} showsVerticalScrollIndicator={false} contentContainerStyle={styles.indicatorListContent}>
              {filteredIndicators.map(ind => {
                const isActive = activeIndicators.includes(ind.id);
                return (
                  <Pressable
                    key={ind.id}
                    style={[styles.indicatorRow, isActive && styles.indicatorRowActive]}
                    onPress={() => toggleIndicator(ind.id)}
                    testID={`indicator-${ind.id}`}
                  >
                    <View style={[styles.indicatorColorBar, { backgroundColor: ind.color }]} />
                    <View style={styles.indicatorInfo}>
                      <View style={styles.indicatorNameRow}>
                        <Text style={[styles.indicatorShortName, { color: ind.color }]}>{ind.shortName}</Text>
                        <Text style={styles.indicatorFullName}>{ind.name}</Text>
                      </View>
                      <Text style={styles.indicatorDesc}>{ind.description} · {ind.params}</Text>
                    </View>
                    <View style={[styles.indicatorToggle, isActive && styles.indicatorToggleActive]}>
                      {isActive && <Check size={14} color={Colors.white} />}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>
        </Pressable>
      </Modal>

      <Modal
        visible={showSearch}
        animationType="none"
        transparent
        onRequestClose={closeSearch}
      >
        <Pressable style={styles.modalOverlay} onPress={closeSearch}>
          <Animated.View
            style={[
              styles.modalContent,
              { paddingBottom: insets.bottom + 12, transform: [{ translateY: modalTranslateY }] },
            ]}
          >
            <Pressable onPress={() => {}}>
              <View style={styles.modalHandle} />

              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>搜索品种</Text>
                <Pressable onPress={closeSearch} style={styles.modalCloseBtn} testID="search-close">
                  <X size={20} color={Colors.textSecondary} />
                </Pressable>
              </View>

              <View style={styles.searchInputRow}>
                <Search size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="输入代码、名称搜索..."
                  placeholderTextColor={Colors.textMuted}
                  autoFocus
                  returnKeyType="search"
                  testID="chart-search-input"
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
                    <X size={14} color={Colors.textMuted} />
                  </Pressable>
                )}
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={styles.categoryContent}>
                {CATEGORY_FILTERS.map((cat) => {
                  const isActive = searchCategory === cat.key;
                  return (
                    <Pressable
                      key={cat.key}
                      style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                      onPress={() => {
                        setSearchCategory(cat.key);
                        if (Platform.OS !== 'web') {
                          void Haptics.selectionAsync();
                        }
                      }}
                    >
                      <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>
                        {cat.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <View style={styles.resultCountRow}>
                <Text style={styles.resultCount}>{searchResults.length} 个结果</Text>
              </View>
            </Pressable>

            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={renderSearchItem}
              contentContainerStyle={styles.searchListContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={styles.searchList}
              ListEmptyComponent={
                <View style={styles.emptySearchState}>
                  <Text style={styles.emptySearchText}>未找到匹配品种</Text>
                  <Text style={styles.emptySearchHint}>尝试其他关键词或切换分类</Text>
                </View>
              }
            />
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  stockHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.divider,
  },
  stockNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  stockName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  indicatorDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  stockPrice: {
    fontSize: 16,
    fontWeight: '700' as const,
    fontVariant: ['tabular-nums'] as const,
  },
  stockChange: {
    fontSize: 13,
    fontWeight: '500' as const,
    fontVariant: ['tabular-nums'] as const,
  },
  chartScroll: {
    flex: 1,
  },
  chartArea: {
    height: CHART_HEIGHT,
    marginHorizontal: CHART_PADDING,
    marginTop: 8,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: PRICE_LABEL_WIDTH,
    height: 0.5,
    backgroundColor: Colors.divider,
  },
  currentPriceLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderStyle: 'dotted' as const,
    borderWidth: 0.5,
    borderColor: Colors.accent,
  },
  currentPriceTag: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    alignItems: 'center',
  },
  currentPriceTagText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700' as const,
    fontVariant: ['tabular-nums'] as const,
  },
  currentPriceTime: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 8,
    fontVariant: ['tabular-nums'] as const,
  },
  priceLabels: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: PRICE_LABEL_WIDTH,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  priceLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    textAlign: 'right',
    fontVariant: ['tabular-nums'] as const,
  },
  volumeArea: {
    height: VOLUME_HEIGHT,
    marginHorizontal: CHART_PADDING,
    marginTop: 4,
    position: 'relative',
    borderTopWidth: 0.5,
    borderTopColor: Colors.divider,
  },
  volumeLabel: {
    position: 'absolute',
    right: 0,
    bottom: 4,
  },
  volumeLabelText: {
    fontSize: 9,
    color: Colors.green,
    fontWeight: '600' as const,
    fontVariant: ['tabular-nums'] as const,
    backgroundColor: Colors.greenDim,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    overflow: 'hidden',
  },
  dateLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: CHART_PADDING,
    paddingTop: 4,
    paddingRight: PRICE_LABEL_WIDTH,
  },
  dateLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontVariant: ['tabular-nums'] as const,
  },
  bottomBar: {
    borderTopWidth: 0.5,
    borderTopColor: Colors.divider,
    backgroundColor: Colors.white,
  },
  stockList: {
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.divider,
    paddingVertical: 6,
  },
  stockListContent: {
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  stockChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 6,
  },
  stockChipActive: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  stockChipText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500' as const,
    fontVariant: ['tabular-nums'] as const,
  },
  addChip: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: Colors.accentBorder,
    borderStyle: 'dashed' as const,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeframeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  codeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.divider,
    marginRight: 4,
  },
  selectedStockCode: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'] as const,
  },
  tfBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tfBtnActive: {
    backgroundColor: Colors.background,
  },
  tfText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500' as const,
  },
  tfTextActive: {
    color: Colors.textPrimary,
    fontWeight: '600' as const,
  },
  toolIcons: {
    flexDirection: 'row',
    marginLeft: 'auto',
    gap: 4,
  },
  toolBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '55%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.divider,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  clearSearchBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryScroll: {
    marginTop: 12,
  },
  categoryContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: Colors.accentDim,
    borderColor: Colors.accent,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  categoryChipTextActive: {
    color: Colors.accent,
    fontWeight: '600' as const,
  },
  resultCountRow: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 6,
  },
  resultCount: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500' as const,
  },
  searchList: {
    flex: 1,
  },
  searchListContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.divider,
    gap: 12,
  },
  logoCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircleText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700' as const,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  searchResultName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  catBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  catBadgeText: {
    fontSize: 10,
    fontWeight: '600' as const,
  },
  searchResultCode: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontVariant: ['tabular-nums'] as const,
  },
  searchResultRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  searchResultPrice: {
    fontSize: 15,
    fontWeight: '700' as const,
    fontVariant: ['tabular-nums'] as const,
  },
  searchChangeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
  },
  searchChangeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    fontVariant: ['tabular-nums'] as const,
  },
  emptySearchState: {
    alignItems: 'center',
    paddingTop: 48,
  },
  emptySearchText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '600' as const,
  },
  emptySearchHint: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 6,
  },
  toolBtnActive: {
    backgroundColor: Colors.accentDim,
    borderRadius: 8,
  },
  toolModalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    minHeight: '40%',
  },
  drawingToolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  drawingToolCard: {
    width: (SCREEN_WIDTH - 52) / 3,
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  drawingToolCardActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentDim,
  },
  drawingToolIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  drawingToolIconWrapActive: {
    backgroundColor: Colors.accent,
  },
  drawingToolName: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  drawingToolNameActive: {
    color: Colors.accent,
  },
  drawingToolDesc: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  drawnItemsSection: {
    borderTopWidth: 0.5,
    borderTopColor: Colors.divider,
    paddingTop: 12,
    marginHorizontal: 16,
  },
  drawnItemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  drawnItemsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: Colors.redDim,
  },
  clearAllText: {
    fontSize: 12,
    color: Colors.red,
    fontWeight: '600' as const,
  },
  drawnItemsList: {
    maxHeight: 160,
  },
  drawnItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.divider,
    gap: 10,
  },
  drawnItemVisBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawnItemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textPrimary,
  },
  drawnItemNameHidden: {
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  drawnItemTime: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontVariant: ['tabular-nums'] as const,
  },
  drawnItemDeleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.redDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawingActiveBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.accentDim,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 0.5,
    borderTopColor: Colors.accentBorder,
  },
  drawingActiveInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  drawingActiveText: {
    fontSize: 13,
    color: Colors.accent,
    fontWeight: '500' as const,
  },
  drawingCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    backgroundColor: Colors.accent,
    borderRadius: 6,
  },
  drawingCancelText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '600' as const,
  },
  activeIndicatorBar: {
    borderTopWidth: 0.5,
    borderTopColor: Colors.divider,
    backgroundColor: Colors.background,
    paddingVertical: 6,
  },
  activeIndicatorContent: {
    paddingHorizontal: 12,
    gap: 6,
    alignItems: 'center',
  },
  activeIndicatorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: Colors.white,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeIndicatorText: {
    fontSize: 11,
    fontWeight: '700' as const,
    fontVariant: ['tabular-nums'] as const,
  },
  indicatorCatScroll: {
    marginBottom: 8,
  },
  indicatorCatContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  activeCountRow: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  activeCountText: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '600' as const,
  },
  indicatorList: {
    flex: 1,
  },
  indicatorListContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: Colors.background,
    gap: 10,
  },
  indicatorRowActive: {
    backgroundColor: Colors.accentDim,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
  },
  indicatorColorBar: {
    width: 4,
    height: 36,
    borderRadius: 2,
  },
  indicatorInfo: {
    flex: 1,
  },
  indicatorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  indicatorShortName: {
    fontSize: 14,
    fontWeight: '800' as const,
    fontVariant: ['tabular-nums'] as const,
  },
  indicatorFullName: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  indicatorDesc: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  indicatorToggle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: Colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  indicatorToggleActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  drawnOverlays: {
    position: 'absolute',
    top: 0,
    left: CHART_PADDING,
    right: CHART_PADDING + PRICE_LABEL_WIDTH,
    height: CHART_HEIGHT,
    pointerEvents: 'none',
  },
  drawnLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawnLineDash: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed' as const,
    borderWidth: 0.5,
    borderColor: Colors.accent,
    opacity: 0.6,
  },
  drawnLineLabel: {
    fontSize: 9,
    color: Colors.accent,
    backgroundColor: Colors.accentDim,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    overflow: 'hidden',
    marginLeft: 4,
  },
});
