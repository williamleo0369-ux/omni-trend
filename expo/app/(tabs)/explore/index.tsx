import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Newspaper, Calendar, UserCheck, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { exploreCategories, exploreMarketCards, fullNewsItems } from '@/mocks/market';
import { MarketCard, NewsItem } from '@/types/market';

function MiniSparkline({ data, isPositive }: { data: number[]; isPositive: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const chartH = 40;
  const chartW = 120;
  const step = chartW / (data.length - 1);

  const points = data.map((v, i) => ({
    x: i * step,
    y: chartH - ((v - min) / range) * chartH,
  }));

  return (
    <View style={{ width: chartW, height: chartH, marginTop: 8 }}>
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
              height: 1.5,
              backgroundColor: isPositive ? Colors.green : Colors.red,
              transform: [{ rotate: `${angle}deg` }],
              transformOrigin: 'left center',
            }}
          />
        );
      })}
      <View
        style={{
          position: 'absolute' as const,
          right: 0,
          top: points[points.length - 1]?.y ?? 0,
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: isPositive ? Colors.green : Colors.red,
          marginTop: -3,
        }}
      />
    </View>
  );
}

function MarketCardItem({ card, onPress }: { card: MarketCard; onPress: () => void }) {
  const isPositive = card.changePercent >= 0;
  return (
    <Pressable
      style={({ pressed }) => [styles.marketCard, pressed && styles.marketCardPressed]}
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.cardLogo, { backgroundColor: card.logoColor }]}>
          <Text style={[styles.cardLogoText, card.logoText.length > 2 && styles.cardLogoTextSmall]}>
            {card.logoText}
          </Text>
        </View>
        <Text style={styles.cardCode} numberOfLines={1}>{card.code}</Text>
        <View style={styles.cardDash}>
          <Text style={styles.cardDashText}>—</Text>
        </View>
        <View style={styles.cardBadge}>
          <Text style={styles.cardBadgeText}>D</Text>
        </View>
      </View>
      <Text style={styles.cardPrice}>
        {card.price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
      </Text>
      <Text style={styles.cardCurrency}>{card.currency}</Text>
      <Text style={[styles.cardChange, { color: isPositive ? Colors.green : Colors.red }]}>
        {isPositive ? '+' : ''}{card.changePercent.toFixed(2)}% 今天
      </Text>
      <MiniSparkline data={card.chartData} isPositive={isPositive} />
    </Pressable>
  );
}

function NewsRow({ item }: { item: NewsItem }) {
  return (
    <Pressable style={styles.newsRow}>
      <View style={styles.newsTimeCol}>
        <Text style={styles.newsTime}>{item.time}</Text>
        <Text style={styles.newsDate}>· {item.date}</Text>
        <Text style={styles.newsSource}>· {item.source}</Text>
      </View>
      <Text style={styles.newsTitle}>{item.title}</Text>
    </Pressable>
  );
}

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('1');
  const liveCards = useMemo(() => exploreMarketCards, []);

  const handleSearch = useCallback(() => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/(tabs)/explore/search');
    console.log('[Explore] Navigate to search');
  }, [router]);

  const handleCardPress = useCallback((card: MarketCard) => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    console.log(`[Explore] Card pressed: ${card.name}`);
  }, []);

  const handleQuickAction = useCallback((actionId: string) => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    switch (actionId) {
      case 'news':
        router.push('/(tabs)/explore/news');
        break;
      case 'calendar':
        router.push('/(tabs)/explore/calendar');
        break;
      case 'broker':
        router.push('/(tabs)/explore/brokers');
        break;
    }
    console.log(`[Explore] Quick action: ${actionId}`);
  }, [router]);

  const quickActions = useMemo(() => [
    { id: 'news', label: '新闻', Icon: Newspaper, color: '#E8731A' },
    { id: 'calendar', label: '日历', Icon: Calendar, color: '#1A73E8' },
    { id: 'broker', label: '经纪商', Icon: UserCheck, color: '#5F6B7A' },
  ], []);

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Pressable style={styles.searchIcon} onPress={handleSearch}>
          <Search size={22} color={Colors.textPrimary} />
        </Pressable>
      </View>

      <Text style={styles.pageTitle}>探索</Text>

      <View style={styles.quickActions}>
        {quickActions.map((action) => (
          <Pressable
            key={action.id}
            style={({ pressed }) => [styles.quickAction, pressed && styles.quickActionPressed]}
            onPress={() => handleQuickAction(action.id)}
          >
            <action.Icon size={24} color={action.color} />
            <Text style={styles.quickActionLabel}>{action.label}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {exploreCategories.map((cat) => (
          <Pressable
            key={cat.id}
            style={[
              styles.categoryChip,
              selectedCategory === cat.id && styles.categoryChipActive,
            ]}
            onPress={() => {
              setSelectedCategory(cat.id);
              if (Platform.OS !== 'web') {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === cat.id && styles.categoryTextActive,
            ]}>
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.cardsGrid}>
        {liveCards.map((card) => (
          <MarketCardItem
            key={card.id}
            card={card}
            onPress={() => handleCardPress(card)}
          />
        ))}
      </View>

      <Pressable
        style={styles.newsSectionHeader}
        onPress={() => router.push('/(tabs)/explore/news')}
      >
        <Text style={styles.newsSectionTitle}>新闻流</Text>
        <ChevronRight size={20} color={Colors.textPrimary} />
      </Pressable>

      <View style={styles.newsSection}>
        {fullNewsItems.slice(0, 5).map((item) => (
          <NewsRow key={item.id} item={item} />
        ))}
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  searchIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    paddingHorizontal: 20,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  quickAction: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 8,
  },
  quickActionPressed: {
    backgroundColor: Colors.surface,
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Colors.white,
  },
  categoryChipActive: {
    backgroundColor: Colors.textPrimary,
    borderColor: Colors.textPrimary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  categoryTextActive: {
    color: Colors.white,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 24,
  },
  marketCard: {
    width: '48%' as const,
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 14,
  },
  marketCardPressed: {
    backgroundColor: Colors.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  cardLogo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLogoText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800' as const,
  },
  cardLogoTextSmall: {
    fontSize: 7,
  },
  cardCode: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    flex: 1,
  },
  cardDash: {
    marginHorizontal: 2,
  },
  cardDashText: {
    color: Colors.textMuted,
    fontSize: 8,
  },
  cardBadge: {
    backgroundColor: Colors.white,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cardBadgeText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'] as const,
  },
  cardCurrency: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  cardChange: {
    fontSize: 12,
    fontWeight: '600' as const,
    marginTop: 4,
    fontVariant: ['tabular-nums'] as const,
  },
  newsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  newsSectionTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    marginRight: 4,
  },
  newsSection: {
    paddingHorizontal: 20,
  },
  newsRow: {
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.divider,
  },
  newsTimeCol: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  newsTime: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontVariant: ['tabular-nums'] as const,
  },
  newsDate: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  newsSource: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
});
