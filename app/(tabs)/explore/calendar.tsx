import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable, Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import { BarChart3, ChevronRight, ChevronDown } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { calendarEvents } from '@/mocks/market';
import { CalendarEvent } from '@/types/market';

const TIME_FILTERS = [
  { key: 'upcoming', label: '即将到来' },
  { key: 'today', label: '今天' },
  { key: 'week', label: '本周' },
] as const;

type TimeKey = typeof TIME_FILTERS[number]['key'];

function ImportanceBar({ level }: { level: CalendarEvent['importance'] }) {
  const bars = level === 'high' ? 3 : level === 'medium' ? 2 : 1;
  return (
    <View style={styles.importanceBars}>
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          style={[
            styles.importanceBar,
            { height: 6 + i * 3 },
            i <= bars ? styles.importanceBarActive : styles.importanceBarInactive,
          ]}
        />
      ))}
    </View>
  );
}

function CalendarRow({ item }: { item: CalendarEvent }) {
  const isUpcoming = item.status === 'upcoming';
  return (
    <Pressable
      style={({ pressed }) => [styles.eventRow, pressed && styles.eventRowPressed]}
      testID={`calendar-${item.id}`}
    >
      <View style={styles.eventLeft}>
        <View style={[styles.timeBadge, item.importance === 'high' && styles.timeBadgeHigh]}>
          <Text style={[styles.timeText, item.importance === 'high' && styles.timeTextHigh]}>
            {item.time}
          </Text>
        </View>
        <View style={styles.eventMeta}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <View style={styles.eventSubRow}>
            <Text style={styles.countryFlag}>{item.countryFlag}</Text>
            <ImportanceBar level={item.importance} />
            <View style={styles.eventValues}>
              <Text style={styles.valueLabel}>实际：</Text>
              <Text style={[styles.valueText, isUpcoming && styles.valueUpcoming]}>
                {item.actual || (isUpcoming ? '即将' : '—')}
              </Text>
              <Text style={styles.valueLabel}>预测：</Text>
              <Text style={styles.valueText}>{item.forecast || '—'}</Text>
              <Text style={styles.valueLabel}>之前：</Text>
              <Text style={styles.valueText}>{item.previous}</Text>
            </View>
          </View>
        </View>
      </View>
      <ChevronRight size={18} color={Colors.textMuted} />
    </Pressable>
  );
}

export default function CalendarScreen() {
  const [timeFilter, setTimeFilter] = useState<TimeKey>('upcoming');
  const [showCategories, setShowCategories] = useState(false);

  const handleTimeFilter = useCallback((key: TimeKey) => {
    setTimeFilter(key);
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    console.log(`[Calendar] Time filter: ${key}`);
  }, []);

  const sortedEvents = useMemo(() => {
    return [...calendarEvents].sort((a, b) => {
      if (a.importance === 'high' && b.importance !== 'high') return -1;
      if (a.importance !== 'high' && b.importance === 'high') return 1;
      return a.time.localeCompare(b.time);
    });
  }, []);

  const renderItem = useCallback(({ item }: { item: CalendarEvent }) => (
    <CalendarRow item={item} />
  ), []);

  const todayStr = useMemo(() => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return `${month}月${day}日 ${weekdays[now.getDay()]}`;
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '', headerBackTitle: '探索' }} />

      <Text style={styles.pageTitle}>经济日历</Text>

      <View style={styles.filterRow}>
        <Pressable style={styles.importanceFilter}>
          <BarChart3 size={16} color={Colors.textPrimary} />
          <Text style={styles.importanceFilterText}>重要</Text>
        </Pressable>

        {TIME_FILTERS.map((filter) => {
          const isActive = timeFilter === filter.key;
          return (
            <Pressable
              key={filter.key}
              style={[styles.timeChip, isActive && styles.timeChipActive]}
              onPress={() => handleTimeFilter(filter.key)}
            >
              <Text style={[styles.timeChipText, isActive && styles.timeChipTextActive]}>
                {filter.label}
              </Text>
              {filter.key !== 'upcoming' ? null : (
                <ChevronDown size={14} color={isActive ? Colors.textPrimary : Colors.textSecondary} />
              )}
            </Pressable>
          );
        })}

        <Pressable
          style={[styles.timeChip]}
          onPress={() => setShowCategories(!showCategories)}
        >
          <Text style={styles.timeChipText}>所有类别</Text>
          <ChevronDown size={14} color={Colors.textSecondary} />
        </Pressable>

        <View style={styles.flagRow}>
          <Text style={styles.flagEmoji}>🇺🇸</Text>
          <Text style={styles.flagEmoji}>🇨🇳</Text>
          <Text style={styles.flagEmoji}>🇪🇺</Text>
        </View>
      </View>

      <View style={styles.dateHeader}>
        <View style={styles.dateHeaderLine} />
        <Text style={styles.dateHeaderText}>{todayStr}</Text>
      </View>

      <FlatList
        data={sortedEvents}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    paddingHorizontal: 20,
    paddingTop: 4,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  importanceFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.divider,
    gap: 6,
  },
  importanceFilterText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.divider,
    gap: 4,
  },
  timeChipActive: {
    backgroundColor: Colors.background,
    borderColor: Colors.textSecondary,
  },
  timeChipText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  timeChipTextActive: {
    color: Colors.textPrimary,
    fontWeight: '600' as const,
  },
  flagRow: {
    flexDirection: 'row',
    gap: 4,
    marginLeft: 'auto',
  },
  flagEmoji: {
    fontSize: 20,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  dateHeaderLine: {
    width: 3,
    height: 16,
    backgroundColor: Colors.textPrimary,
    borderRadius: 2,
    marginRight: 10,
  },
  dateHeaderText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  listContent: {
    paddingBottom: 30,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  eventRowPressed: {
    backgroundColor: Colors.background,
  },
  eventLeft: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  timeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: Colors.background,
    alignSelf: 'flex-start',
  },
  timeBadgeHigh: {
    backgroundColor: Colors.redDim,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    fontVariant: ['tabular-nums'] as const,
  },
  timeTextHigh: {
    color: Colors.red,
  },
  timeHighImportance: {},
  timeNormal: {},
  eventMeta: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  eventSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  countryFlag: {
    fontSize: 16,
  },
  importanceBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  importanceBar: {
    width: 4,
    borderRadius: 1,
  },
  importanceBarActive: {
    backgroundColor: Colors.textPrimary,
  },
  importanceBarInactive: {
    backgroundColor: Colors.divider,
  },
  eventValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  valueLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  valueText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'] as const,
    marginRight: 8,
  },
  valueUpcoming: {
    color: Colors.red,
    fontWeight: '700' as const,
  },
  separator: {
    height: 0.5,
    backgroundColor: Colors.divider,
    marginLeft: 20,
  },
});
