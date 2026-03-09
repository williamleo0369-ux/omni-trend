import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable, Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { fullNewsItems } from '@/mocks/market';
import { NewsItem } from '@/types/market';

const NEWS_FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'stock', label: '股票', flag: '🇨🇳' },
  { key: 'etf', label: 'ETF' },
  { key: 'crypto', label: '加密' },
  { key: 'forex', label: '外汇' },
] as const;

type FilterKey = typeof NEWS_FILTERS[number]['key'];

function getSourceIcon(source: string): string {
  switch (source) {
    case 'Reuters': return '🌐';
    case 'PANews': return '📰';
    case 'Bloomberg': return '💹';
    case 'CNBC': return '📺';
    case '财联社': return '🇨🇳';
    case '证券时报': return '🇨🇳';
    case '新浪财经': return '🇨🇳';
    default: return '📄';
  }
}

function NewsRowItem({ item }: { item: NewsItem }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.newsRow, pressed && styles.newsRowPressed]}
      testID={`news-${item.id}`}
    >
      <View style={styles.newsMetaRow}>
        <Text style={styles.sourceIcon}>{getSourceIcon(item.source)}</Text>
        <Text style={styles.newsTime}>{item.time}</Text>
        <Text style={styles.newsDot}>·</Text>
        <Text style={styles.newsDate}>{item.date}</Text>
        <Text style={styles.newsDot}>·</Text>
        <Text style={styles.newsSource}>{item.source}</Text>
      </View>
      <Text style={styles.newsTitle}>{item.title}</Text>
    </Pressable>
  );
}

export default function NewsScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const handleFilterPress = useCallback((key: FilterKey) => {
    setActiveFilter(key);
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    console.log(`[News] Filter changed to: ${key}`);
  }, []);

  const filteredNews = useMemo(() => {
    return fullNewsItems;
  }, []);

  const renderItem = useCallback(({ item }: { item: NewsItem }) => (
    <NewsRowItem item={item} />
  ), []);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '新闻', headerBackTitle: '探索' }} />

      <View style={styles.filterRow}>
        {NEWS_FILTERS.map((filter) => {
          const isActive = activeFilter === filter.key;
          return (
            <Pressable
              key={filter.key}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => handleFilterPress(filter.key)}
            >
              {'flag' in filter && filter.flag ? (
                <Text style={styles.filterFlag}>{filter.flag}</Text>
              ) : null}
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={filteredNews}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.divider,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Colors.white,
    gap: 4,
  },
  filterChipActive: {
    backgroundColor: Colors.textPrimary,
    borderColor: Colors.textPrimary,
  },
  filterFlag: {
    fontSize: 14,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.white,
  },
  listContent: {
    paddingBottom: 30,
  },
  newsRow: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.divider,
  },
  newsRowPressed: {
    backgroundColor: Colors.background,
  },
  newsMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  sourceIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  newsTime: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontVariant: ['tabular-nums'] as const,
  },
  newsDot: {
    fontSize: 12,
    color: Colors.textMuted,
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
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    lineHeight: 26,
  },
});
