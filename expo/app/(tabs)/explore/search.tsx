import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, FlatList, Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Search, X, ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

type SearchResult = {
  type: 'stock' | 'sector';
  id: string;
  name: string;
  code?: string;
  price?: number;
  changePercent: number;
};

export default function SearchScreen() {
  const router = useRouter();
  const { watchlist, sectors } = useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef<TextInput>(null);

  const allItems = useMemo((): SearchResult[] => {
    const stockItems: SearchResult[] = watchlist.map((s) => ({
      type: 'stock' as const,
      id: s.id,
      name: s.name,
      code: s.code,
      price: s.price,
      changePercent: s.changePercent,
    }));
    const sectorItems: SearchResult[] = sectors.map((s) => ({
      type: 'sector' as const,
      id: s.id,
      name: s.name,
      changePercent: s.changePercent,
    }));
    return [...stockItems, ...sectorItems];
  }, [watchlist, sectors]);

  const results = useMemo(() => {
    if (!query.trim()) return allItems;
    const q = query.toLowerCase();
    return allItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.code && item.code.toLowerCase().includes(q))
    );
  }, [query, allItems]);

  const handleSelect = useCallback((item: SearchResult) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (item.type === 'stock') {
      router.push({ pathname: '/(tabs)/(watchlist)/stock-detail', params: { id: item.id } });
    }
    console.log(`[Search] Selected: ${item.name}`);
  }, [router]);

  const renderItem = useCallback(({ item }: { item: SearchResult }) => {
    const isPositive = item.changePercent >= 0;
    return (
      <Pressable
        style={({ pressed }) => [styles.resultRow, pressed && styles.resultRowPressed]}
        onPress={() => handleSelect(item)}
      >
        <View style={[styles.typeTag, { backgroundColor: item.type === 'stock' ? Colors.accentDim : Colors.greenDim }]}>
          <Text style={[styles.typeTagText, { color: item.type === 'stock' ? Colors.accent : Colors.green }]}>
            {item.type === 'stock' ? '股票' : '板块'}
          </Text>
        </View>
        <View style={styles.resultInfo}>
          <Text style={styles.resultName}>{item.name}</Text>
          {item.code && <Text style={styles.resultCode}>{item.code}</Text>}
        </View>
        {item.price != null && (
          <Text style={[styles.resultPrice, { color: isPositive ? Colors.green : Colors.red }]}>
            {item.price.toFixed(2)}
          </Text>
        )}
        <View style={[styles.changeBadge, { backgroundColor: isPositive ? Colors.greenDim : Colors.redDim }]}>
          {isPositive ? (
            <ArrowUpRight size={11} color={Colors.green} />
          ) : (
            <ArrowDownRight size={11} color={Colors.red} />
          )}
          <Text style={[styles.changeText, { color: isPositive ? Colors.green : Colors.red }]}>
            {isPositive ? '+' : ''}{item.changePercent.toFixed(2)}%
          </Text>
        </View>
      </Pressable>
    );
  }, [handleSelect]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '搜索', headerShown: true }} />

      <View style={styles.searchBar}>
        <Search size={18} color={Colors.textMuted} />
        <TextInput
          ref={inputRef}
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="搜索股票代码或名称..."
          placeholderTextColor={Colors.textMuted}
          autoFocus
          returnKeyType="search"
          testID="search-input"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} style={styles.clearBtn}>
            <X size={16} color={Colors.textMuted} />
          </Pressable>
        )}
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>未找到匹配结果</Text>
            <Text style={styles.emptyHint}>请尝试其他关键词</Text>
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: Colors.background,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 10,
  },
  resultRowPressed: {
    backgroundColor: Colors.surface,
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeTagText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '600' as const,
  },
  resultCode: {
    color: Colors.textTertiary,
    fontSize: 11,
    marginTop: 2,
    fontVariant: ['tabular-nums'] as const,
  },
  resultPrice: {
    fontSize: 15,
    fontWeight: '700' as const,
    fontVariant: ['tabular-nums'] as const,
    marginRight: 8,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 2,
    minWidth: 70,
    justifyContent: 'center',
  },
  changeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    fontVariant: ['tabular-nums'] as const,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  emptyHint: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 6,
  },
});
