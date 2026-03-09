import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform, Animated, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  ArrowUpRight, ArrowDownRight, Star, StarOff, TrendingUp,
  BarChart3, Clock, Volume2, ChevronRight,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

const TIME_RANGES = ['分时', '5日', '日K', '周K', '月K'] as const;

function generateChartData(points: number, basePrice: number): number[] {
  const data: number[] = [];
  let price = basePrice;
  for (let i = 0; i < points; i++) {
    price += (Math.random() - 0.48) * basePrice * 0.008;
    data.push(Math.round(price * 100) / 100);
  }
  return data;
}

function MiniChart({ data, isPositive }: { data: number[]; isPositive: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const chartHeight = 160;
  const chartWidth = 320;
  const stepX = chartWidth / (data.length - 1);

  const points = data.map((v, i) => ({
    x: i * stepX,
    y: chartHeight - ((v - min) / range) * chartHeight,
  }));

  return (
    <View style={[localStyles.chartContainer, { height: chartHeight + 20 }]}>
      <View style={{ width: chartWidth, height: chartHeight }}>
        {points.map((point, i) => {
          if (i === 0) return null;
          const prev = points[i - 1];
          const dx = point.x - prev.x;
          const dy = point.y - prev.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          return (
            <View
              key={i}
              style={{
                position: 'absolute' as const,
                left: prev.x,
                top: prev.y,
                width: length,
                height: 2,
                backgroundColor: isPositive ? Colors.green : Colors.red,
                transform: [{ rotate: `${angle}deg` }],
                transformOrigin: 'left center',
                opacity: 0.9,
              }}
            />
          );
        })}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <View
            key={ratio}
            style={{
              position: 'absolute' as const,
              left: 0,
              right: 0,
              top: chartHeight * (1 - ratio),
              height: 0.5,
              backgroundColor: Colors.divider,
            }}
          />
        ))}
      </View>
      <View style={localStyles.chartLabels}>
        <Text style={localStyles.chartLabel}>{min.toFixed(2)}</Text>
        <Text style={localStyles.chartLabel}>{((min + max) / 2).toFixed(2)}</Text>
        <Text style={localStyles.chartLabel}>{max.toFixed(2)}</Text>
      </View>
    </View>
  );
}

export default function StockDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist } = useApp();

  const stock = useMemo(() => {
    return watchlist.find((s) => s.id === params.id) ?? null;
  }, [watchlist, params.id]);

  const [selectedRange, setSelectedRange] = useState<typeof TIME_RANGES[number]>('分时');
  const [chartData, setChartData] = useState<number[]>([]);
  const starScale = useRef(new Animated.Value(1)).current;
  const inWatchlist = stock ? isInWatchlist(stock.id) : false;

  useEffect(() => {
    if (stock) {
      const points = selectedRange === '分时' ? 60 : selectedRange === '5日' ? 120 : 90;
      setChartData(generateChartData(points, stock.price));
      console.log(`[StockDetail] Generated chart for ${stock.name}, range: ${selectedRange}`);
    }
  }, [stock, selectedRange]);

  const toggleWatchlist = useCallback(() => {
    if (!stock) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Animated.sequence([
      Animated.timing(starScale, { toValue: 1.3, duration: 120, useNativeDriver: true }),
      Animated.timing(starScale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();

    if (inWatchlist) {
      removeFromWatchlist(stock.id);
    } else {
      addToWatchlist(stock);
    }
  }, [stock, inWatchlist, addToWatchlist, removeFromWatchlist, starScale]);

  const handleSetAlert = useCallback(() => {
    if (!stock) return;
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert(
      '设置价格预警',
      `当 ${stock.name}(${stock.code}) 价格达到目标时通知您`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确认设置',
          onPress: () => {
            Alert.alert('预警已设置', `将在 ${stock.name} 价格异动时通知您`);
          },
        },
      ]
    );
  }, [stock]);

  if (!stock) {
    return (
      <View style={localStyles.emptyContainer}>
        <Stack.Screen options={{ title: '股票详情' }} />
        <Text style={localStyles.emptyText}>未找到该股票信息</Text>
        <Pressable style={localStyles.backBtn} onPress={() => router.back()}>
          <Text style={localStyles.backBtnText}>返回</Text>
        </Pressable>
      </View>
    );
  }

  const isPositive = stock.change >= 0;

  return (
    <ScrollView style={localStyles.container} showsVerticalScrollIndicator={false}>
      <Stack.Screen options={{ title: `${stock.code} ${stock.name}` }} />

      <View style={localStyles.priceSection}>
        <View style={localStyles.priceRow}>
          <Text style={[localStyles.currentPrice, { color: isPositive ? Colors.green : Colors.red }]}>
            {stock.price.toFixed(2)}
          </Text>
          <Animated.View style={{ transform: [{ scale: starScale }] }}>
            <Pressable onPress={toggleWatchlist} style={localStyles.starBtn} testID="toggle-watchlist">
              {inWatchlist ? (
                <Star size={22} color={Colors.gold} fill={Colors.gold} />
              ) : (
                <StarOff size={22} color={Colors.textMuted} />
              )}
            </Pressable>
          </Animated.View>
        </View>
        <View style={localStyles.changeRow}>
          {isPositive ? (
            <ArrowUpRight size={16} color={Colors.green} />
          ) : (
            <ArrowDownRight size={16} color={Colors.red} />
          )}
          <Text style={[localStyles.changeText, { color: isPositive ? Colors.green : Colors.red }]}>
            {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
          </Text>
        </View>
      </View>

      <View style={localStyles.timeRangeBar}>
        {TIME_RANGES.map((range) => (
          <Pressable
            key={range}
            style={[localStyles.rangeBtn, selectedRange === range && localStyles.rangeBtnActive]}
            onPress={() => setSelectedRange(range)}
          >
            <Text style={[localStyles.rangeBtnText, selectedRange === range && localStyles.rangeBtnTextActive]}>
              {range}
            </Text>
          </Pressable>
        ))}
      </View>

      {chartData.length > 0 && (
        <View style={localStyles.chartCard}>
          <MiniChart data={chartData} isPositive={isPositive} />
        </View>
      )}

      <View style={localStyles.infoCard}>
        <View style={localStyles.infoGrid}>
          <View style={localStyles.infoItem}>
            <Text style={localStyles.infoLabel}>成交量</Text>
            <Text style={localStyles.infoValue}>{stock.volume}</Text>
          </View>
          <View style={localStyles.infoItem}>
            <Text style={localStyles.infoLabel}>涨跌额</Text>
            <Text style={[localStyles.infoValue, { color: isPositive ? Colors.green : Colors.red }]}>
              {isPositive ? '+' : ''}{stock.change.toFixed(2)}
            </Text>
          </View>
          <View style={localStyles.infoItem}>
            <Text style={localStyles.infoLabel}>涨跌幅</Text>
            <Text style={[localStyles.infoValue, { color: isPositive ? Colors.green : Colors.red }]}>
              {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
            </Text>
          </View>
          <View style={localStyles.infoItem}>
            <Text style={localStyles.infoLabel}>今开</Text>
            <Text style={localStyles.infoValue}>{(stock.price - stock.change + (Math.random() * 2 - 1)).toFixed(2)}</Text>
          </View>
          <View style={localStyles.infoItem}>
            <Text style={localStyles.infoLabel}>最高</Text>
            <Text style={[localStyles.infoValue, { color: Colors.green }]}>
              {(stock.price + Math.abs(stock.change) * 1.2).toFixed(2)}
            </Text>
          </View>
          <View style={localStyles.infoItem}>
            <Text style={localStyles.infoLabel}>最低</Text>
            <Text style={[localStyles.infoValue, { color: Colors.red }]}>
              {(stock.price - Math.abs(stock.change) * 1.5).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      <View style={localStyles.actionsCard}>
        <Pressable style={localStyles.actionRow} onPress={handleSetAlert} testID="set-alert">
          <View style={[localStyles.actionIcon, { backgroundColor: Colors.orangeDim }]}>
            <Volume2 size={16} color={Colors.orange} />
          </View>
          <Text style={localStyles.actionLabel}>设置价格预警</Text>
          <ChevronRight size={16} color={Colors.textMuted} />
        </Pressable>
        <View style={localStyles.actionDivider} />
        <Pressable style={localStyles.actionRow} onPress={() => {
          Alert.alert('技术分析', '即将跳转到完整的K线图和技术指标分析');
        }}>
          <View style={[localStyles.actionIcon, { backgroundColor: Colors.accentDim }]}>
            <BarChart3 size={16} color={Colors.accent} />
          </View>
          <Text style={localStyles.actionLabel}>技术指标分析</Text>
          <ChevronRight size={16} color={Colors.textMuted} />
        </Pressable>
        <View style={localStyles.actionDivider} />
        <Pressable style={localStyles.actionRow} onPress={() => {
          Alert.alert('查看详情', '查看该股票的完整走势图');
        }}>
          <View style={[localStyles.actionIcon, { backgroundColor: Colors.greenDim }]}>
            <TrendingUp size={16} color={Colors.green} />
          </View>
          <Text style={localStyles.actionLabel}>查看图表</Text>
          <ChevronRight size={16} color={Colors.textMuted} />
        </Pressable>
        <View style={localStyles.actionDivider} />
        <Pressable style={localStyles.actionRow} onPress={() => {
          Alert.alert('历史记录', '查看该股票的历史交易和涨跌记录');
        }}>
          <View style={[localStyles.actionIcon, { backgroundColor: Colors.purpleDim }]}>
            <Clock size={16} color={Colors.purple} />
          </View>
          <Text style={localStyles.actionLabel}>历史交易记录</Text>
          <ChevronRight size={16} color={Colors.textMuted} />
        </Pressable>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: Colors.textPrimary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600' as const,
  },
  priceSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentPrice: {
    fontSize: 38,
    fontWeight: '800' as const,
    fontVariant: ['tabular-nums'] as const,
    letterSpacing: -1,
  },
  starBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  changeText: {
    fontSize: 15,
    fontWeight: '600' as const,
    fontVariant: ['tabular-nums'] as const,
  },
  timeRangeBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 3,
  },
  rangeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  rangeBtnActive: {
    backgroundColor: Colors.card,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
      android: { elevation: 2 },
      web: {},
    }),
  },
  rangeBtnText: {
    color: Colors.textTertiary,
    fontSize: 13,
    fontWeight: '600' as const,
  },
  rangeBtnTextActive: {
    color: Colors.textPrimary,
  },
  chartCard: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 12 },
      android: { elevation: 2 },
      web: {},
    }),
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartLabels: {
    justifyContent: 'space-between',
    height: '100%',
    marginLeft: 8,
    paddingVertical: 2,
  },
  chartLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontVariant: ['tabular-nums'] as const,
  },
  infoCard: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 18,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 12 },
      android: { elevation: 2 },
      web: {},
    }),
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    width: '33.3%',
    paddingVertical: 10,
    alignItems: 'center',
  },
  infoLabel: {
    color: Colors.textTertiary,
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '700' as const,
    fontVariant: ['tabular-nums'] as const,
  },
  actionsCard: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 4,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 12 },
      android: { elevation: 2 },
      web: {},
    }),
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  actionIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '500' as const,
  },
  actionDivider: {
    height: 0.5,
    backgroundColor: Colors.divider,
    marginLeft: 60,
  },
});
