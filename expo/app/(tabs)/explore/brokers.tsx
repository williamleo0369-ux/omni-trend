import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable, Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import { Star, ChevronDown, MessageSquare, Users, Shield } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { brokers } from '@/mocks/market';
import { Broker } from '@/types/market';

const BROKER_CATEGORIES = [
  { key: 'all', label: '所有经纪商' },
  { key: 'stock', label: '股票' },
  { key: 'crypto', label: '加密' },
  { key: 'forex', label: '外汇' },
  { key: 'futures', label: '期货' },
] as const;

type CategoryKey = typeof BROKER_CATEGORIES[number]['key'];

function getTierColor(tier: Broker['tier']): { bg: string; text: string } {
  switch (tier) {
    case 'PLATINUM': return { bg: '#1A73E8', text: '#FFFFFF' };
    case 'GOLD': return { bg: '#C8902E', text: '#FFFFFF' };
    case 'SILVER': return { bg: '#8896A6', text: '#FFFFFF' };
  }
}

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.3;
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          color="#F0B90B"
          fill={i <= fullStars ? '#F0B90B' : (i === fullStars + 1 && hasHalf ? '#F0B90B' : 'transparent')}
        />
      ))}
    </View>
  );
}

function BrokerCard({ item }: { item: Broker }) {
  const tierStyle = getTierColor(item.tier);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.brokerCard,
        item.featured && styles.brokerCardFeatured,
        pressed && styles.brokerCardPressed,
      ]}
      testID={`broker-${item.id}`}
    >
      {item.featured && (
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredBadgeText}>精选</Text>
        </View>
      )}

      <View style={styles.brokerHeader}>
        <View style={[styles.brokerLogo, { backgroundColor: item.logoColor }]}>
          <Text style={[styles.brokerLogoText, item.logoText.length > 1 && styles.brokerLogoTextSmall]}>
            {item.logoText}
          </Text>
        </View>
        <View style={styles.brokerNameCol}>
          <Text style={styles.brokerName}>{item.name}</Text>
          <View style={[styles.tierBadge, { backgroundColor: tierStyle.bg }]}>
            <Text style={[styles.tierText, { color: tierStyle.text }]}>{item.tier}</Text>
          </View>
          <Text style={styles.brokerCategory}>{item.category}</Text>
        </View>
      </View>

      <View style={styles.ratingRow}>
        <Text style={styles.ratingValue}>{item.rating}</Text>
        <StarRating rating={item.rating} />
        <Shield size={14} color={Colors.accent} style={{ marginLeft: 6 }} />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <MessageSquare size={12} color={Colors.textTertiary} />
          <Text style={styles.statText}>{item.reviews}</Text>
        </View>
        <View style={styles.statItem}>
          <Users size={12} color={Colors.textTertiary} />
          <Text style={styles.statText}>{item.users}</Text>
        </View>
      </View>

      <View style={styles.leverageRow}>
        <Text style={styles.leverageValue}>{item.maxLeverage}</Text>
        <Text style={styles.leverageLabel}>最大杠杆</Text>
      </View>

      <Pressable style={styles.openAccountBtn}>
        <Text style={styles.openAccountText}>开设账户</Text>
      </Pressable>
    </Pressable>
  );
}

export default function BrokersScreen() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all');


  const handleCategoryPress = useCallback((key: CategoryKey) => {
    setActiveCategory(key);
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    console.log(`[Brokers] Category: ${key}`);
  }, []);

  const filteredBrokers = useMemo(() => {
    if (activeCategory === 'all') return brokers;
    const categoryMap: Record<string, string> = {
      stock: '股票',
      crypto: '加密货币',
      forex: '外汇',
      futures: '期货',
    };
    const target = categoryMap[activeCategory] || activeCategory;
    return brokers.filter((b) => b.category.includes(target));
  }, [activeCategory]);

  const renderItem = useCallback(({ item }: { item: Broker }) => (
    <BrokerCard item={item} />
  ), []);

  const orderCount = useMemo(() => {
    return Math.floor(376000000 + Math.random() * 1000000);
  }, []);

  const formatOrderCount = (n: number): string => {
    return n.toLocaleString('en-US');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '', headerBackTitle: '返回' }} />

      <FlatList
        data={filteredBrokers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <LinearGradient
              colors={['#1A1D26', '#2D1B4E', '#1A3A5F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroBanner}
            >
              <Text style={styles.heroTitle}>为交易而生</Text>
              <Text style={styles.heroCount}>{formatOrderCount(orderCount)}</Text>
              <Text style={styles.heroSubtitle}>已执行真实订单</Text>
            </LinearGradient>

            <View style={styles.categoryRow}>
              {BROKER_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.key;
                return (
                  <Pressable
                    key={cat.key}
                    style={[styles.catChip, isActive && styles.catChipActive]}
                    onPress={() => handleCategoryPress(cat.key)}
                  >
                    <Text style={[styles.catChipText, isActive && styles.catChipTextActive]}>
                      {cat.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable style={styles.sortRow}>
              <Text style={styles.sortLabel}>排序方式</Text>
              <Text style={styles.sortValue}>最佳排名</Text>
              <ChevronDown size={14} color={Colors.textSecondary} />
            </Pressable>
          </View>
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
  listContent: {
    paddingBottom: 40,
  },
  heroBanner: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  heroCount: {
    fontSize: 36,
    fontWeight: '900' as const,
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'] as const,
    letterSpacing: 1,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  categoryRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
    flexWrap: 'wrap',
  },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
  },
  catChipActive: {
    backgroundColor: Colors.textPrimary,
  },
  catChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  catChipTextActive: {
    color: Colors.white,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 4,
  },
  sortLabel: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
  sortValue: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  brokerCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  brokerCardFeatured: {
    borderColor: Colors.accent,
    borderWidth: 1.5,
  },
  brokerCardPressed: {
    backgroundColor: Colors.background,
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 1,
  },
  featuredBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  brokerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
    marginTop: 8,
  },
  brokerLogo: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brokerLogoText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800' as const,
  },
  brokerLogoTextSmall: {
    fontSize: 14,
  },
  brokerNameCol: {
    flex: 1,
    gap: 4,
  },
  brokerName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  tierBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  tierText: {
    fontSize: 10,
    fontWeight: '800' as const,
    letterSpacing: 0.5,
  },
  brokerCategory: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontVariant: ['tabular-nums'] as const,
  },
  leverageRow: {
    marginBottom: 16,
  },
  leverageValue: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'] as const,
  },
  leverageLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  openAccountBtn: {
    backgroundColor: Colors.textPrimary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  openAccountText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700' as const,
  },
});
