import React, { useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, SectionList, Pressable, Platform, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MoreHorizontal, Plus } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { WatchlistStock } from '@/types/market';
import { TrendingUp, AlertTriangle, Globe, ChevronRight } from 'lucide-react-native';

function TVLogo() {
  return (
    <View style={styles.logoWrap}>
      <Text style={styles.logoText}>OT</Text>
    </View>
  );
}

function StockLogo({ stock }: { stock: WatchlistStock }) {
  const isApple = stock.code === 'AAPL';
  return (
    <View style={[styles.stockLogo, { backgroundColor: stock.logoColor || Colors.accent }]}>
      {isApple ? (
        <Text style={styles.stockLogoApple}></Text>
      ) : (
        <Text style={[
          styles.stockLogoText,
          (stock.logoText?.length ?? 0) > 2 && styles.stockLogoTextSmall,
        ]}>
          {stock.logoText || stock.code.charAt(0)}
        </Text>
      )}
    </View>
  );
}

function StockRow({ stock, onPress }: { stock: WatchlistStock; onPress: () => void }) {
  const isPositive = stock.change >= 0;
  const changeColor = isPositive ? Colors.green : Colors.red;

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (price >= 100) return price.toFixed(2);
    if (price >= 10) return price.toFixed(price < 100 ? 4 : 2);
    return price.toFixed(price < 1 ? 3 : 4);
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.stockRow, pressed && styles.stockRowPressed]}
      onPress={onPress}
      testID={`stock-${stock.code}`}
    >
      <StockLogo stock={stock} />
      <View style={styles.stockInfo}>
        <View style={styles.stockCodeRow}>
          <Text style={styles.stockCode}>{stock.code}</Text>
          <View style={styles.dashSep}>
            <Text style={styles.dashText}>—</Text>
          </View>
          <View style={styles.timeframeBadge}>
            <Text style={styles.timeframeText}>{stock.timeframe || 'D'}</Text>
          </View>
        </View>
        <Text style={styles.stockName} numberOfLines={1}>{stock.name}</Text>
      </View>
      <View style={styles.priceSection}>
        <Text style={styles.stockPrice}>{formatPrice(stock.price)}</Text>
        <Text style={[styles.stockChange, { color: changeColor }]}>
          {isPositive ? '+' : ''}{stock.change.toFixed(stock.change >= 100 ? 2 : 4)}{' '}
          {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
        </Text>
      </View>
    </Pressable>
  );
}

interface SectionData {
  title: string;
  data: WatchlistStock[];
}

export default function WatchlistScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { watchlist, isRefreshing, refreshMarketData, gtrMappings, gtrAnomalies } = useApp();

  const activeSignals = useMemo(() =>
    gtrMappings.filter((m) => m.status === 'active' || m.status === 'triggered').length,
    [gtrMappings]
  );
  const criticalCount = useMemo(() =>
    gtrAnomalies.filter((a) => a.severity === 'critical' || a.severity === 'high').length,
    [gtrAnomalies]
  );
  const sectorCount = useMemo(() => {
    const sectors = new Set(gtrMappings.map((m) => m.usSector));
    return sectors.size;
  }, [gtrMappings]);

  const sections = useMemo((): SectionData[] => {
    const indices = watchlist.filter((s) => s.category === 'index');
    const stocks = watchlist.filter((s) => s.category === 'stock');
    const futures = watchlist.filter((s) => s.category === 'futures');
    const others = watchlist.filter((s) => !s.category || !['index', 'stock', 'futures'].includes(s.category));

    const result: SectionData[] = [];
    if (indices.length > 0) result.push({ title: '指数', data: indices });
    if (stocks.length > 0) result.push({ title: '股票', data: stocks });
    if (futures.length > 0) result.push({ title: '期货', data: futures });
    if (others.length > 0) result.push({ title: '其他', data: others });
    return result;
  }, [watchlist]);

  const handleStockPress = useCallback((stock: WatchlistStock) => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({ pathname: '/(tabs)/(watchlist)/stock-detail', params: { id: stock.id } });
    console.log(`[Watchlist] Navigate to stock: ${stock.name}`);
  }, [router]);

  const handleGTRPress = useCallback(() => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/(tabs)/(watchlist)/global-trend');
    console.log('[Watchlist] Navigate to Global Trend Reflector');
  }, [router]);

  const handleAdd = useCallback(() => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/(tabs)/explore/search');
    console.log('[Watchlist] Navigate to add stock');
  }, [router]);

  const renderSectionHeader = useCallback(({ section }: { section: SectionData }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  ), []);

  const renderItem = useCallback(({ item }: { item: WatchlistStock }) => (
    <StockRow stock={item} onPress={() => handleStockPress(item)} />
  ), [handleStockPress]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={styles.headerBtn} onPress={() => console.log('[Watchlist] More options')}>
          <MoreHorizontal size={22} color={Colors.textPrimary} />
        </Pressable>
        <TVLogo />
        <Pressable style={styles.headerBtn} onPress={handleAdd} testID="add-stock-btn">
          <Plus size={22} color={Colors.textPrimary} />
        </Pressable>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={renderSectionHeader}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Pressable
            style={({ pressed }) => [styles.gtrCard, pressed && styles.gtrCardPressed]}
            onPress={handleGTRPress}
            testID="gtr-entry"
          >
            <View style={styles.gtrTopRow}>
              <View style={styles.gtrLiveDot} />
              <View style={styles.gtrTitleWrap}>
                <Text style={styles.gtrTitle}>Global Trend Reflector</Text>
                <Text style={styles.gtrSub}>全美股映射 · {sectorCount}个板块 · 实时进化</Text>
              </View>
              <ChevronRight size={18} color={Colors.textTertiary} />
            </View>
            <View style={styles.gtrStatsRow}>
              <View style={styles.gtrStatItem}>
                <TrendingUp size={12} color={Colors.accent} />
                <Text style={styles.gtrStatValue}>{activeSignals}</Text>
                <Text style={styles.gtrStatLabel}>活跃信号</Text>
              </View>
              <View style={styles.gtrStatDivider} />
              <View style={styles.gtrStatItem}>
                <AlertTriangle size={12} color={criticalCount > 0 ? Colors.red : Colors.textMuted} />
                <Text style={[styles.gtrStatValue, criticalCount > 0 && { color: Colors.red }]}>{criticalCount}</Text>
                <Text style={styles.gtrStatLabel}>风险预警</Text>
              </View>
              <View style={styles.gtrStatDivider} />
              <View style={styles.gtrStatItem}>
                <Globe size={12} color={Colors.accent} />
                <Text style={styles.gtrStatValue}>{sectorCount}</Text>
                <Text style={styles.gtrStatLabel}>监控板块</Text>
              </View>
            </View>
          </Pressable>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshMarketData}
            tintColor={Colors.textPrimary}
            colors={[Colors.textPrimary]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.divider,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '900' as const,
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  listContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    backgroundColor: Colors.white,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.white,
  },
  stockRowPressed: {
    backgroundColor: Colors.background,
  },
  stockLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stockLogoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800' as const,
  },
  stockLogoTextSmall: {
    fontSize: 9,
    fontWeight: '700' as const,
  },
  stockLogoApple: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  stockInfo: {
    flex: 1,
    marginRight: 12,
  },
  stockCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  stockCode: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'] as const,
  },
  dashSep: {
    marginHorizontal: 6,
  },
  dashText: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  timeframeBadge: {
    backgroundColor: Colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  timeframeText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  stockName: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  stockPrice: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'] as const,
    marginBottom: 3,
  },
  stockChange: {
    fontSize: 12,
    fontWeight: '500' as const,
    fontVariant: ['tabular-nums'] as const,
  },
  separator: {
    height: 0.5,
    backgroundColor: Colors.divider,
    marginLeft: 76,
  },
  gtrCard: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    backgroundColor: '#F2F4F7',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E4E8ED',
  },
  gtrCardPressed: {
    opacity: 0.85,
  },
  gtrTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  gtrLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.red,
  },
  gtrTitleWrap: {
    flex: 1,
  },
  gtrTitle: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  gtrSub: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  gtrStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  gtrStatItem: {
    flex: 1,
    alignItems: 'center' as const,
    gap: 3,
  },
  gtrStatValue: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'] as const,
  },
  gtrStatLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '500' as const,
  },
  gtrStatDivider: {
    width: 0.5,
    height: 28,
    backgroundColor: Colors.divider,
  },
});
