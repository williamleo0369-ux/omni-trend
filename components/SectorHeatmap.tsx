import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { ArrowUpRight, ArrowDownRight, Minus, GitCompare, AlertTriangle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { SectorCorrelation } from '@/types/market';
import { US_SECTOR_COLORS } from '@/mocks/market';

const SIGNAL_CONFIG: Record<SectorCorrelation['signal'], { label: string; color: string; bg: string }> = {
  aligned: { label: '同步', color: '#12B76A', bg: 'rgba(18,183,106,0.08)' },
  diverging: { label: '背离', color: '#F04438', bg: 'rgba(240,68,56,0.08)' },
  leading: { label: '领先', color: '#1A73E8', bg: 'rgba(26,115,232,0.08)' },
  lagging: { label: '滞后', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
};

function getCorrelationColor(correlation: number): string {
  if (correlation >= 0.8) return '#12B76A';
  if (correlation >= 0.6) return '#F59E0B';
  if (correlation >= 0.4) return '#FF6B35';
  return '#F04438';
}

function HeatmapCell({ item }: { item: SectorCorrelation }) {
  const sectorColor = US_SECTOR_COLORS[item.usSector];
  const signalCfg = SIGNAL_CONFIG[item.signal];
  const correlColor = getCorrelationColor(item.correlation);
  const usPositive = item.usChange >= 0;
  const cnPositive = item.cnChange >= 0;
  const isDiverging = item.signal === 'diverging';

  return (
    <View style={[cellStyles.cell, { borderLeftColor: sectorColor, borderLeftWidth: 3 }]}>
      <View style={cellStyles.headerRow}>
        <View style={cellStyles.nameCol}>
          <Text style={cellStyles.usEtf}>{item.usEtf}</Text>
          <Text style={cellStyles.cnEtf}>{item.cnSector}</Text>
        </View>
        <View style={[cellStyles.signalBadge, { backgroundColor: signalCfg.bg }]}>
          <Text style={[cellStyles.signalText, { color: signalCfg.color }]}>{signalCfg.label}</Text>
        </View>
      </View>

      <View style={cellStyles.dataRow}>
        <View style={cellStyles.changeCol}>
          <Text style={cellStyles.changeLabel}>美股</Text>
          <View style={cellStyles.changeValRow}>
            {usPositive ? (
              <ArrowUpRight size={11} color={Colors.red} />
            ) : (
              <ArrowDownRight size={11} color={Colors.green} />
            )}
            <Text style={[cellStyles.changeVal, { color: usPositive ? Colors.red : Colors.green }]}>
              {usPositive ? '+' : ''}{item.usChange.toFixed(2)}%
            </Text>
          </View>
        </View>

        <View style={cellStyles.corrCol}>
          <View style={[cellStyles.corrCircle, { borderColor: correlColor }]}>
            <Text style={[cellStyles.corrValue, { color: correlColor }]}>
              {(item.correlation * 100).toFixed(0)}
            </Text>
          </View>
        </View>

        <View style={[cellStyles.changeCol, { alignItems: 'flex-end' as const }]}>
          <Text style={cellStyles.changeLabel}>A股</Text>
          <View style={cellStyles.changeValRow}>
            {cnPositive ? (
              <ArrowUpRight size={11} color={Colors.red} />
            ) : (
              <ArrowDownRight size={11} color={Colors.green} />
            )}
            <Text style={[cellStyles.changeVal, { color: cnPositive ? Colors.red : Colors.green }]}>
              {cnPositive ? '+' : ''}{item.cnChange.toFixed(2)}%
            </Text>
          </View>
        </View>
      </View>

      {isDiverging && (
        <View style={cellStyles.divergeRow}>
          <AlertTriangle size={10} color={Colors.red} />
          <Text style={cellStyles.divergeText}>
            背离度 {Math.abs(item.divergence).toFixed(2)}%
          </Text>
        </View>
      )}
    </View>
  );
}

const cellStyles = StyleSheet.create({
  cell: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EDF0F4',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  nameCol: {
    gap: 2,
  },
  usEtf: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'] as const,
  },
  cnEtf: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  signalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  signalText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeCol: {
    flex: 1,
    gap: 2,
  },
  changeLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '500' as const,
  },
  changeValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  changeVal: {
    fontSize: 15,
    fontWeight: '800' as const,
    fontVariant: ['tabular-nums'] as const,
  },
  corrCol: {
    width: 48,
    alignItems: 'center' as const,
  },
  corrCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  corrValue: {
    fontSize: 12,
    fontWeight: '800' as const,
    fontVariant: ['tabular-nums'] as const,
  },
  divergeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: Colors.divider,
  },
  divergeText: {
    fontSize: 11,
    color: Colors.red,
    fontWeight: '600' as const,
    fontVariant: ['tabular-nums'] as const,
  },
});

type SortMode = 'correlation' | 'divergence' | 'usChange';

interface SectorHeatmapProps {
  correlations: SectorCorrelation[];
}

function SectorHeatmap({ correlations }: SectorHeatmapProps) {
  const [sortMode, setSortMode] = React.useState<SortMode>('divergence');
  const [filterSignal, setFilterSignal] = React.useState<SectorCorrelation['signal'] | 'all'>('all');

  const filteredAndSorted = useMemo(() => {
    let result = [...correlations];
    if (filterSignal !== 'all') {
      result = result.filter((c) => c.signal === filterSignal);
    }
    switch (sortMode) {
      case 'correlation':
        result.sort((a, b) => b.correlation - a.correlation);
        break;
      case 'divergence':
        result.sort((a, b) => Math.abs(b.divergence) - Math.abs(a.divergence));
        break;
      case 'usChange':
        result.sort((a, b) => Math.abs(b.usChange) - Math.abs(a.usChange));
        break;
    }
    return result;
  }, [correlations, sortMode, filterSignal]);

  const signalCounts = useMemo(() => ({
    all: correlations.length,
    aligned: correlations.filter((c) => c.signal === 'aligned').length,
    diverging: correlations.filter((c) => c.signal === 'diverging').length,
    leading: correlations.filter((c) => c.signal === 'leading').length,
    lagging: correlations.filter((c) => c.signal === 'lagging').length,
  }), [correlations]);

  const avgCorrelation = useMemo(() => {
    if (correlations.length === 0) return 0;
    return correlations.reduce((s, c) => s + c.correlation, 0) / correlations.length;
  }, [correlations]);

  const handleSortPress = useCallback((mode: SortMode) => {
    if (Platform.OS !== 'web') void Haptics.selectionAsync();
    setSortMode(mode);
  }, []);

  const handleFilterPress = useCallback((signal: SectorCorrelation['signal'] | 'all') => {
    if (Platform.OS !== 'web') void Haptics.selectionAsync();
    setFilterSignal(signal);
  }, []);

  const SORT_OPTIONS: { key: SortMode; label: string }[] = [
    { key: 'divergence', label: '背离度' },
    { key: 'correlation', label: '相关性' },
    { key: 'usChange', label: '美股涨幅' },
  ];

  const SIGNAL_FILTERS: { key: SectorCorrelation['signal'] | 'all'; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'aligned', label: '同步' },
    { key: 'diverging', label: '背离' },
    { key: 'leading', label: '领先' },
    { key: 'lagging', label: '滞后' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{correlations.length}</Text>
            <Text style={styles.summaryLabel}>监控赛道</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: getCorrelationColor(avgCorrelation) }]}>
              {(avgCorrelation * 100).toFixed(0)}%
            </Text>
            <Text style={styles.summaryLabel}>平均相关性</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, signalCounts.diverging > 0 && { color: Colors.red }]}>
              {signalCounts.diverging}
            </Text>
            <Text style={styles.summaryLabel}>背离信号</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: Colors.accent }]}>
              {signalCounts.leading}
            </Text>
            <Text style={styles.summaryLabel}>领先信号</Text>
          </View>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
        {SIGNAL_FILTERS.map((f) => {
          const isActive = filterSignal === f.key;
          const cfg = f.key !== 'all' ? SIGNAL_CONFIG[f.key] : null;
          return (
            <Pressable
              key={f.key}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => handleFilterPress(f.key)}
            >
              {cfg && <View style={[styles.filterDot, { backgroundColor: cfg.color }]} />}
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {f.label} ({signalCounts[f.key]})
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.sortRow}>
        <GitCompare size={12} color={Colors.textMuted} />
        {SORT_OPTIONS.map((opt) => (
          <Pressable
            key={opt.key}
            style={[styles.sortBtn, sortMode === opt.key && styles.sortBtnActive]}
            onPress={() => handleSortPress(opt.key)}
          >
            <Text style={[styles.sortBtnText, sortMode === opt.key && styles.sortBtnTextActive]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {filteredAndSorted.map((item) => (
        <HeatmapCell key={item.id} item={item} />
      ))}

      {filteredAndSorted.length === 0 && (
        <View style={styles.emptyState}>
          <Minus size={24} color={Colors.textMuted} />
          <Text style={styles.emptyText}>暂无匹配数据</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EDF0F4',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center' as const,
    gap: 3,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'] as const,
  },
  summaryLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '500' as const,
  },
  summaryDivider: {
    width: 0.5,
    height: 32,
    backgroundColor: Colors.divider,
  },
  filterScroll: {
    marginBottom: 10,
  },
  filterContent: {
    gap: 6,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E4E8ED',
    backgroundColor: Colors.white,
  },
  filterChipActive: {
    backgroundColor: Colors.accentDim,
    borderColor: Colors.accentBorder,
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.accent,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sortBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E4E8ED',
  },
  sortBtnActive: {
    backgroundColor: Colors.accentDim,
    borderColor: Colors.accentBorder,
  },
  sortBtnText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
  sortBtnTextActive: {
    color: Colors.accent,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
});

export default React.memo(SectorHeatmap);
