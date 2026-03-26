import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Animated, Platform,
} from 'react-native';
import {
  Radio, Zap, Shield, AlertTriangle, ChevronDown, ChevronUp,
  ArrowUpRight, ArrowDownRight, Clock, Target, TrendingUp,
  Activity, Crosshair, Globe, Brain, Power, Plus, Minus,
  X, CheckCircle, RefreshCw, BarChart3, Filter,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { TrendMapping, ExecutionStrategy, AnomalyAlert, SelfImprovementLog, USSectorKey } from '@/types/market';
import { US_SECTOR_LABELS, US_SECTOR_COLORS } from '@/mocks/market';

type TabKey = 'mapping' | 'execution' | 'anomaly' | 'evolution';

const TABS: { key: TabKey; label: string; icon: typeof Radio }[] = [
  { key: 'mapping', label: '映射引擎', icon: Radio },
  { key: 'execution', label: '自动执行', icon: Zap },
  { key: 'anomaly', label: '异常拦截', icon: Shield },
  { key: 'evolution', label: '自我进化', icon: Brain },
];

const ALL_SECTORS: USSectorKey[] = [
  'technology', 'semiconductor', 'healthcare', 'biotech', 'financials',
  'energy', 'consumer_disc', 'consumer_staples', 'industrials', 'materials',
  'communication', 'cybersecurity', 'clean_energy', 'precious_metals',
  'crypto', 'aerospace', 'utilities', 'real_estate',
];

function hapticLight() {
  if (Platform.OS !== 'web') {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 90 ? '#12B76A' : value >= 75 ? '#F59E0B' : '#F04438';
  return (
    <View style={barStyles.track}>
      <View style={[barStyles.fill, { width: `${value}%`, backgroundColor: color }]} />
    </View>
  );
}

const barStyles = StyleSheet.create({
  track: { height: 4, borderRadius: 2, backgroundColor: '#E8ECF0', flex: 1 },
  fill: { height: 4, borderRadius: 2 },
});

function SectorChip({ sector, selected, onPress }: { sector: USSectorKey; selected: boolean; onPress: () => void }) {
  const color = US_SECTOR_COLORS[sector];
  return (
    <Pressable
      onPress={onPress}
      style={[chipStyles.chip, selected && { backgroundColor: color + '18', borderColor: color }]}
    >
      <View style={[chipStyles.dot, { backgroundColor: color }]} />
      <Text style={[chipStyles.label, selected && { color }]}>{US_SECTOR_LABELS[sector]}</Text>
    </Pressable>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4E8ED',
    backgroundColor: Colors.white,
    marginRight: 6,
    marginBottom: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { fontSize: 11, fontWeight: '600' as const, color: Colors.textSecondary },
});

function MappingCard({ item }: { item: TrendMapping }) {
  const isPositive = item.usChange >= 0;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const sectorColor = US_SECTOR_COLORS[item.usSector];

  const onPressIn = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  }, [scaleAnim]);

  const onPressOut = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  }, [scaleAnim]);

  const statusBg = item.status === 'triggered' ? Colors.redDim
    : item.status === 'active' ? Colors.accentDim : Colors.surface;
  const statusColor = item.status === 'triggered' ? Colors.red
    : item.status === 'active' ? Colors.accent : Colors.textMuted;
  const statusLabel = item.status === 'triggered' ? '已触发'
    : item.status === 'active' ? '监控中' : '已过期';

  return (
    <Animated.View style={[mappingStyles.card, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable onPressIn={onPressIn} onPressOut={onPressOut} style={mappingStyles.inner}>
        <View style={mappingStyles.topRow}>
          <View style={[mappingStyles.signalBadge, { backgroundColor: sectorColor + '15' }]}>
            <Globe size={12} color={sectorColor} />
            <Text style={[mappingStyles.codeText, { color: sectorColor }]}>{item.usCode}</Text>
          </View>
          <View style={[mappingStyles.statusBadge, { backgroundColor: statusBg }]}>
            <View style={[mappingStyles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[mappingStyles.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>

        <View style={[mappingStyles.sectorTag, { backgroundColor: sectorColor + '12' }]}>
          <Text style={[mappingStyles.sectorTagText, { color: sectorColor }]}>
            {US_SECTOR_LABELS[item.usSector]}
          </Text>
        </View>

        <Text style={mappingStyles.signalTitle} numberOfLines={1}>{item.usSignal}</Text>

        <View style={mappingStyles.flowRow}>
          <View style={mappingStyles.flowLeft}>
            <Text style={mappingStyles.flowLabel}>美股信号</Text>
            <View style={mappingStyles.changeRow}>
              {isPositive ? (
                <ArrowUpRight size={14} color={Colors.red} />
              ) : (
                <ArrowDownRight size={14} color={Colors.green} />
              )}
              <Text style={[mappingStyles.changeText, { color: isPositive ? Colors.red : Colors.green }]}>
                {isPositive ? '+' : ''}{item.usChange.toFixed(2)}%
              </Text>
            </View>
            <Text style={mappingStyles.volText}>波动率 {item.usVolatility}%</Text>
          </View>

          <View style={mappingStyles.arrowCol}>
            <View style={mappingStyles.arrowLine} />
            <View style={mappingStyles.lagBadge}>
              <Clock size={10} color={Colors.textSecondary} />
              <Text style={mappingStyles.lagText}>{item.lagHours}h</Text>
            </View>
            <View style={mappingStyles.arrowLine} />
          </View>

          <View style={mappingStyles.flowRight}>
            <Text style={mappingStyles.flowLabel}>国内映射</Text>
            <Text style={mappingStyles.sectorText}>{item.domesticSector}</Text>
            <Text style={mappingStyles.oppText} numberOfLines={1}>{item.domesticOpportunity}</Text>
          </View>
        </View>

        <View style={mappingStyles.confRow}>
          <Target size={12} color={Colors.textTertiary} />
          <Text style={mappingStyles.confLabel}>置信度</Text>
          <ConfidenceBar value={item.confidence} />
          <Text style={mappingStyles.confValue}>{item.confidence}%</Text>
        </View>

        <View style={mappingStyles.hitRow}>
          <BarChart3 size={10} color={Colors.textMuted} />
          <Text style={mappingStyles.hitText}>
            命中率 {item.hitRate}% · {item.successfulTriggers}/{item.totalTriggers}次
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const mappingStyles = StyleSheet.create({
  card: {
    width: 280, marginRight: 12, backgroundColor: Colors.white, borderRadius: 16,
    borderWidth: 1, borderColor: '#EDF0F4',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  inner: { padding: 14 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  signalBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  codeText: { fontSize: 12, fontWeight: '700' as const, fontVariant: ['tabular-nums'] as const },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  statusText: { fontSize: 10, fontWeight: '600' as const },
  sectorTag: { alignSelf: 'flex-start' as const, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginBottom: 6 },
  sectorTagText: { fontSize: 10, fontWeight: '600' as const },
  signalTitle: { fontSize: 15, fontWeight: '700' as const, color: Colors.textPrimary, marginBottom: 10 },
  flowRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  flowLeft: { flex: 1 },
  flowRight: { flex: 1, alignItems: 'flex-end' as const },
  flowLabel: { fontSize: 10, color: Colors.textMuted, marginBottom: 4, fontWeight: '500' as const },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  changeText: { fontSize: 16, fontWeight: '800' as const, fontVariant: ['tabular-nums'] as const },
  volText: { fontSize: 10, color: Colors.textTertiary, marginTop: 2, fontVariant: ['tabular-nums'] as const },
  arrowCol: { width: 48, alignItems: 'center' as const, justifyContent: 'center' as const, gap: 2 },
  arrowLine: { width: 16, height: 1, backgroundColor: Colors.textMuted },
  lagBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    backgroundColor: Colors.surface, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4,
  },
  lagText: { fontSize: 9, fontWeight: '600' as const, color: Colors.textSecondary, fontVariant: ['tabular-nums'] as const },
  sectorText: { fontSize: 14, fontWeight: '700' as const, color: Colors.textPrimary },
  oppText: { fontSize: 10, color: Colors.textTertiary, marginTop: 2 },
  confRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingTop: 10, borderTopWidth: 0.5, borderTopColor: Colors.divider,
  },
  confLabel: { fontSize: 10, color: Colors.textTertiary, fontWeight: '500' as const },
  confValue: {
    fontSize: 12, fontWeight: '700' as const, color: Colors.textPrimary,
    fontVariant: ['tabular-nums'] as const, minWidth: 32, textAlign: 'right' as const,
  },
  hitRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  hitText: { fontSize: 10, color: Colors.textMuted, fontVariant: ['tabular-nums'] as const },
});

function ExecutionCard({ item, onToggle, onAdjust }: {
  item: ExecutionStrategy;
  onToggle: () => void;
  onAdjust: (delta: number) => void;
}) {
  const statusColor = item.status === 'executing' ? Colors.accent
    : item.status === 'hedged' ? Colors.orange : item.status === 'paused' ? Colors.textMuted : Colors.textSecondary;
  const statusBg = item.status === 'executing' ? Colors.accentDim
    : item.status === 'hedged' ? Colors.orangeDim : Colors.surface;
  const statusLabel = item.status === 'executing' ? '执行中'
    : item.status === 'hedged' ? '对冲中' : item.status === 'paused' ? '已暂停' : '待触发';
  const sectorColor = US_SECTOR_COLORS[item.sectorKey];

  return (
    <View style={[execStyles.card, !item.enabled && execStyles.cardDisabled]}>
      <View style={execStyles.headerRow}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <View style={[execStyles.sectorDot, { backgroundColor: sectorColor }]} />
            <Text style={execStyles.name} numberOfLines={1}>{item.name}</Text>
          </View>
          <Text style={execStyles.sectorLabel}>{US_SECTOR_LABELS[item.sectorKey]}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' as const, gap: 6 }}>
          <View style={[execStyles.statusBadge, { backgroundColor: statusBg }]}>
            <Text style={[execStyles.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
          <Pressable
            onPress={() => { hapticLight(); onToggle(); }}
            style={[execStyles.toggleBtn, item.enabled ? execStyles.toggleOn : execStyles.toggleOff]}
            testID={`exec-toggle-${item.id}`}
          >
            <Power size={12} color={item.enabled ? Colors.accent : Colors.textMuted} />
            <Text style={[execStyles.toggleText, { color: item.enabled ? Colors.accent : Colors.textMuted }]}>
              {item.enabled ? 'ON' : 'OFF'}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={execStyles.triggerBox}>
        <Crosshair size={11} color={Colors.textTertiary} />
        <Text style={execStyles.triggerText} numberOfLines={1}>{item.trigger}</Text>
      </View>

      <Text style={execStyles.actionText} numberOfLines={2}>{item.action}</Text>

      <View style={execStyles.metricsRow}>
        <View style={execStyles.metric}>
          <Text style={execStyles.metricLabel}>预算占比</Text>
          <View style={execStyles.budgetControl}>
            <Pressable
              onPress={() => { hapticLight(); onAdjust(-1); }}
              style={execStyles.budgetBtn}
            >
              <Minus size={10} color={Colors.textSecondary} />
            </Pressable>
            <Text style={execStyles.metricValue}>{item.budgetRatio}%</Text>
            <Pressable
              onPress={() => { hapticLight(); onAdjust(1); }}
              style={execStyles.budgetBtn}
            >
              <Plus size={10} color={Colors.textSecondary} />
            </Pressable>
          </View>
        </View>
        <View style={execStyles.metricDivider} />
        <View style={execStyles.metric}>
          <Text style={execStyles.metricLabel}>预算变动</Text>
          <Text style={[execStyles.metricValue, {
            color: item.budgetDelta > 0 ? Colors.red : item.budgetDelta < 0 ? Colors.green : Colors.textPrimary,
          }]}>
            {item.budgetDelta > 0 ? '+' : ''}{item.budgetDelta.toFixed(1)}%
          </Text>
        </View>
        <View style={execStyles.metricDivider} />
        <View style={execStyles.metric}>
          <Text style={execStyles.metricLabel}>确定性</Text>
          <Text style={execStyles.metricValue}>{item.certainty}%</Text>
        </View>
        <View style={execStyles.metricDivider} />
        <View style={execStyles.metric}>
          <Text style={execStyles.metricLabel}>执行次数</Text>
          <Text style={execStyles.metricValue}>{item.executionCount}</Text>
        </View>
      </View>

      {item.lastExecuted && (
        <View style={execStyles.lastExecRow}>
          <Clock size={9} color={Colors.textMuted} />
          <Text style={execStyles.lastExecText}>上次执行: {item.lastExecuted}</Text>
        </View>
      )}
    </View>
  );
}

const execStyles = StyleSheet.create({
  card: { backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#EDF0F4' },
  cardDisabled: { opacity: 0.6 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  sectorDot: { width: 8, height: 8, borderRadius: 4 },
  name: { fontSize: 14, fontWeight: '700' as const, color: Colors.textPrimary, flex: 1 },
  sectorLabel: { fontSize: 10, color: Colors.textTertiary, marginLeft: 14 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '600' as const },
  toggleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1,
  },
  toggleOn: { borderColor: Colors.accentBorder, backgroundColor: Colors.accentDim },
  toggleOff: { borderColor: '#E4E8ED', backgroundColor: Colors.surface },
  toggleText: { fontSize: 10, fontWeight: '700' as const },
  triggerBox: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surface, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 6, marginBottom: 8,
  },
  triggerText: { fontSize: 11, color: Colors.textSecondary, flex: 1, fontVariant: ['tabular-nums'] as const },
  actionText: { fontSize: 12, color: Colors.textTertiary, lineHeight: 18, marginBottom: 10 },
  metricsRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 0.5, borderTopColor: Colors.divider, paddingTop: 10 },
  metric: { flex: 1, alignItems: 'center' as const },
  metricDivider: { width: 0.5, height: 24, backgroundColor: Colors.divider },
  metricLabel: { fontSize: 9, color: Colors.textMuted, marginBottom: 2 },
  metricValue: { fontSize: 13, fontWeight: '700' as const, color: Colors.textPrimary, fontVariant: ['tabular-nums'] as const },
  budgetControl: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  budgetBtn: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.surface,
    alignItems: 'center' as const, justifyContent: 'center' as const,
  },
  lastExecRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  lastExecText: { fontSize: 9, color: Colors.textMuted, fontVariant: ['tabular-nums'] as const },
});

function AnomalyCard({ item, onIntercept, onDismiss }: {
  item: AnomalyAlert;
  onIntercept: () => void;
  onDismiss: () => void;
}) {
  const severityMap: Record<string, { bg: string; color: string; label: string }> = {
    critical: { bg: '#FEE4E2', color: '#D92D20', label: '严重' },
    high: { bg: Colors.redDim, color: Colors.red, label: '高' },
    medium: { bg: Colors.orangeDim, color: Colors.orange, label: '中' },
    low: { bg: Colors.surface, color: Colors.textTertiary, label: '低' },
  };
  const sev = severityMap[item.severity] ?? severityMap['low'];
  const typeLabel = item.type === 'divergence' ? '趋势背离' : item.type === 'irrational' ? '非理性行为' : '黑天鹅预警';
  const sectorColor = US_SECTOR_COLORS[item.sectorKey];

  return (
    <View style={[anomStyles.card, item.intercepted && anomStyles.cardIntercepted]}>
      <View style={anomStyles.topRow}>
        <View style={[anomStyles.sevBadge, { backgroundColor: sev.bg }]}>
          <AlertTriangle size={10} color={sev.color} />
          <Text style={[anomStyles.sevText, { color: sev.color }]}>{sev.label}</Text>
        </View>
        <Text style={anomStyles.typeText}>{typeLabel}</Text>
        <View style={[anomStyles.sectorPill, { backgroundColor: sectorColor + '12' }]}>
          <Text style={[anomStyles.sectorPillText, { color: sectorColor }]}>
            {US_SECTOR_LABELS[item.sectorKey]}
          </Text>
        </View>
        {item.intercepted && (
          <View style={anomStyles.interceptBadge}>
            <Shield size={10} color={Colors.green} />
            <Text style={anomStyles.interceptText}>已拦截</Text>
          </View>
        )}
      </View>
      <Text style={anomStyles.title}>{item.title}</Text>
      <Text style={anomStyles.desc} numberOfLines={2}>{item.description}</Text>
      <View style={anomStyles.anchorRow}>
        <Activity size={11} color={Colors.textMuted} />
        <Text style={anomStyles.anchorText}>{item.anchorData}</Text>
      </View>

      {item.actionTaken && (
        <View style={anomStyles.actionTakenRow}>
          <CheckCircle size={10} color={Colors.green} />
          <Text style={anomStyles.actionTakenText}>{item.actionTaken}</Text>
        </View>
      )}

      {!item.intercepted && (
        <View style={anomStyles.actionRow}>
          <Pressable
            style={anomStyles.interceptBtn}
            onPress={() => { hapticLight(); onIntercept(); }}
          >
            <Shield size={12} color={Colors.white} />
            <Text style={anomStyles.interceptBtnText}>拦截</Text>
          </Pressable>
          <Pressable
            style={anomStyles.dismissBtn}
            onPress={() => { hapticLight(); onDismiss(); }}
          >
            <X size={12} color={Colors.textSecondary} />
            <Text style={anomStyles.dismissBtnText}>忽略</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const anomStyles = StyleSheet.create({
  card: { backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#EDF0F4' },
  cardIntercepted: { borderLeftWidth: 3, borderLeftColor: Colors.green },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  sevBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  sevText: { fontSize: 10, fontWeight: '600' as const },
  typeText: { fontSize: 10, color: Colors.textTertiary, fontWeight: '500' as const },
  sectorPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  sectorPillText: { fontSize: 9, fontWeight: '600' as const },
  interceptBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3, marginLeft: 'auto',
    backgroundColor: Colors.greenDim, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  interceptText: { fontSize: 10, fontWeight: '600' as const, color: Colors.green },
  title: { fontSize: 14, fontWeight: '700' as const, color: Colors.textPrimary, marginBottom: 4 },
  desc: { fontSize: 12, color: Colors.textTertiary, lineHeight: 18, marginBottom: 8 },
  anchorRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surface, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 6,
  },
  anchorText: { fontSize: 11, color: Colors.textSecondary, fontVariant: ['tabular-nums'] as const, flex: 1 },
  actionTakenRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8,
    backgroundColor: Colors.greenDim, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 6,
  },
  actionTakenText: { fontSize: 10, color: Colors.green, fontWeight: '500' as const },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  interceptBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    backgroundColor: Colors.red, paddingVertical: 8, borderRadius: 8,
  },
  interceptBtnText: { fontSize: 12, fontWeight: '700' as const, color: Colors.white },
  dismissBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    backgroundColor: Colors.surface, paddingVertical: 8, borderRadius: 8,
  },
  dismissBtnText: { fontSize: 12, fontWeight: '600' as const, color: Colors.textSecondary },
});

function BudgetGauge({ strategies }: { strategies: ExecutionStrategy[] }) {
  const enabledStrategies = strategies.filter((s) => s.enabled);
  const totalBudget = enabledStrategies.reduce((sum, s) => sum + s.budgetRatio, 0);

  return (
    <View style={gaugeStyles.wrap}>
      <View style={gaugeStyles.titleRow}>
        <Text style={gaugeStyles.titleText}>预算对冲监控</Text>
        <Text style={gaugeStyles.totalText}>总占用 {totalBudget}%</Text>
      </View>
      <View style={gaugeStyles.barTrack}>
        {enabledStrategies.map((s) => {
          const color = US_SECTOR_COLORS[s.sectorKey];
          return (
            <View
              key={s.id}
              style={[gaugeStyles.barSegment, { width: `${s.budgetRatio}%`, backgroundColor: color }]}
            />
          );
        })}
      </View>
      <View style={gaugeStyles.legendRow}>
        {enabledStrategies.slice(0, 6).map((s) => {
          const color = US_SECTOR_COLORS[s.sectorKey];
          return (
            <View key={s.id} style={gaugeStyles.legendItem}>
              <View style={[gaugeStyles.legendDot, { backgroundColor: color }]} />
              <Text style={gaugeStyles.legendText} numberOfLines={1}>{US_SECTOR_LABELS[s.sectorKey]}</Text>
              <Text style={gaugeStyles.legendPct}>{s.budgetRatio}%</Text>
            </View>
          );
        })}
        {enabledStrategies.length > 6 && (
          <Text style={gaugeStyles.moreText}>+{enabledStrategies.length - 6}个板块</Text>
        )}
      </View>
    </View>
  );
}

const gaugeStyles = StyleSheet.create({
  wrap: { backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#EDF0F4' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  titleText: { fontSize: 13, fontWeight: '700' as const, color: Colors.textPrimary },
  totalText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' as const, fontVariant: ['tabular-nums'] as const },
  barTrack: { height: 8, borderRadius: 4, backgroundColor: Colors.surface, flexDirection: 'row', overflow: 'hidden', marginBottom: 10 },
  barSegment: { height: 8 },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { fontSize: 10, color: Colors.textTertiary },
  legendPct: { fontSize: 10, fontWeight: '600' as const, color: Colors.textSecondary, fontVariant: ['tabular-nums'] as const },
  moreText: { fontSize: 10, color: Colors.textMuted },
});

function EvolutionCard({ log }: { log: SelfImprovementLog }) {
  const typeMap: Record<string, { icon: typeof Brain; color: string; label: string }> = {
    accuracy_update: { icon: Target, color: Colors.green, label: '精度提升' },
    model_retrain: { icon: RefreshCw, color: Colors.accent, label: '模型重训' },
    threshold_adjust: { icon: Activity, color: Colors.orange, label: '阈值调整' },
    new_pattern: { icon: TrendingUp, color: Colors.purple, label: '新模式' },
  };
  const t = typeMap[log.type] ?? typeMap['accuracy_update'];
  const Icon = t.icon;
  const sectorColor = US_SECTOR_COLORS[log.sectorKey];
  const isImprovement = log.after > log.before;

  return (
    <View style={evoStyles.card}>
      <View style={evoStyles.iconWrap}>
        <View style={[evoStyles.iconCircle, { backgroundColor: t.color + '15' }]}>
          <Icon size={14} color={t.color} />
        </View>
        <View style={evoStyles.timeline} />
      </View>
      <View style={evoStyles.content}>
        <View style={evoStyles.headerRow}>
          <View style={[evoStyles.typeBadge, { backgroundColor: t.color + '15' }]}>
            <Text style={[evoStyles.typeText, { color: t.color }]}>{t.label}</Text>
          </View>
          <View style={[evoStyles.sectorBadge, { backgroundColor: sectorColor + '12' }]}>
            <Text style={[evoStyles.sectorText, { color: sectorColor }]}>{US_SECTOR_LABELS[log.sectorKey]}</Text>
          </View>
          <Text style={evoStyles.timeText}>{log.timestamp.split(' ')[1]}</Text>
        </View>
        <Text style={evoStyles.desc}>{log.description}</Text>
        {log.type !== 'new_pattern' && (
          <View style={evoStyles.deltaRow}>
            <Text style={evoStyles.deltaLabel}>{log.before}%</Text>
            <View style={evoStyles.deltaArrow}>
              <Text style={{ fontSize: 12, color: Colors.textMuted }}>→</Text>
            </View>
            <Text style={[evoStyles.deltaValue, { color: isImprovement ? Colors.green : Colors.red }]}>
              {log.after}%
            </Text>
            <Text style={[evoStyles.deltaChange, { color: isImprovement ? Colors.green : Colors.red }]}>
              ({isImprovement ? '+' : ''}{(log.after - log.before).toFixed(1)}%)
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const evoStyles = StyleSheet.create({
  card: { flexDirection: 'row', marginBottom: 4 },
  iconWrap: { width: 32, alignItems: 'center' as const },
  iconCircle: { width: 28, height: 28, borderRadius: 14, alignItems: 'center' as const, justifyContent: 'center' as const },
  timeline: { width: 1, flex: 1, backgroundColor: '#E4E8ED', marginTop: 4 },
  content: {
    flex: 1, marginLeft: 10, backgroundColor: Colors.white, borderRadius: 12, padding: 12,
    marginBottom: 8, borderWidth: 1, borderColor: '#EDF0F4',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  typeText: { fontSize: 10, fontWeight: '600' as const },
  sectorBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  sectorText: { fontSize: 9, fontWeight: '600' as const },
  timeText: { fontSize: 9, color: Colors.textMuted, marginLeft: 'auto', fontVariant: ['tabular-nums'] as const },
  desc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18, marginBottom: 6 },
  deltaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  deltaLabel: { fontSize: 12, color: Colors.textMuted, fontVariant: ['tabular-nums'] as const },
  deltaArrow: { marginHorizontal: 2 },
  deltaValue: { fontSize: 13, fontWeight: '700' as const, fontVariant: ['tabular-nums'] as const },
  deltaChange: { fontSize: 10, fontWeight: '600' as const, fontVariant: ['tabular-nums'] as const },
});

function EvolutionStats({ mappings }: { mappings: TrendMapping[] }) {
  const avgHitRate = useMemo(() => {
    const active = mappings.filter((m) => m.status !== 'expired');
    if (active.length === 0) return 0;
    return Math.round(active.reduce((sum, m) => sum + m.hitRate, 0) / active.length);
  }, [mappings]);

  const avgConfidence = useMemo(() => {
    const active = mappings.filter((m) => m.status !== 'expired');
    if (active.length === 0) return 0;
    return Math.round(active.reduce((sum, m) => sum + m.confidence, 0) / active.length);
  }, [mappings]);

  const totalTriggers = useMemo(() =>
    mappings.reduce((sum, m) => sum + m.totalTriggers, 0), [mappings]);

  return (
    <View style={statsStyles.wrap}>
      <Text style={statsStyles.title}>系统自我优化概览</Text>
      <View style={statsStyles.row}>
        <View style={statsStyles.stat}>
          <Text style={statsStyles.statValue}>{avgHitRate}%</Text>
          <Text style={statsStyles.statLabel}>平均命中率</Text>
        </View>
        <View style={statsStyles.divider} />
        <View style={statsStyles.stat}>
          <Text style={statsStyles.statValue}>{avgConfidence}%</Text>
          <Text style={statsStyles.statLabel}>平均置信度</Text>
        </View>
        <View style={statsStyles.divider} />
        <View style={statsStyles.stat}>
          <Text style={statsStyles.statValue}>{mappings.length}</Text>
          <Text style={statsStyles.statLabel}>监控板块</Text>
        </View>
        <View style={statsStyles.divider} />
        <View style={statsStyles.stat}>
          <Text style={statsStyles.statValue}>{totalTriggers}</Text>
          <Text style={statsStyles.statLabel}>累计触发</Text>
        </View>
      </View>
    </View>
  );
}

const statsStyles = StyleSheet.create({
  wrap: { backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#EDF0F4' },
  title: { fontSize: 13, fontWeight: '700' as const, color: Colors.textPrimary, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center' as const },
  statValue: { fontSize: 18, fontWeight: '800' as const, color: Colors.textPrimary, fontVariant: ['tabular-nums'] as const },
  statLabel: { fontSize: 9, color: Colors.textMuted, marginTop: 2 },
  divider: { width: 0.5, height: 28, backgroundColor: Colors.divider },
});

export default function GlobalTrendReflector() {
  const {
    gtrMappings, gtrExecutions, gtrAnomalies, gtrSILogs,
    toggleGtrExecution, interceptAnomaly, dismissAnomaly, adjustBudgetRatio,
  } = useApp();

  const [activeTab, setActiveTab] = useState<TabKey>('mapping');
  const [expanded, setExpanded] = useState(true);
  const [selectedSectors, setSelectedSectors] = useState<Set<USSectorKey>>(new Set());
  const [showSectorFilter, setShowSectorFilter] = useState(false);
  const heightAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const filteredMappings = useMemo(() => {
    if (selectedSectors.size === 0) return gtrMappings;
    return gtrMappings.filter((m) => selectedSectors.has(m.usSector));
  }, [gtrMappings, selectedSectors]);

  const filteredExecutions = useMemo(() => {
    if (selectedSectors.size === 0) return gtrExecutions;
    return gtrExecutions.filter((s) => selectedSectors.has(s.sectorKey));
  }, [gtrExecutions, selectedSectors]);

  const filteredAnomalies = useMemo(() => {
    if (selectedSectors.size === 0) return gtrAnomalies;
    return gtrAnomalies.filter((a) => selectedSectors.has(a.sectorKey));
  }, [gtrAnomalies, selectedSectors]);

  const activeCount = useMemo(() =>
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

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.4, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  const toggleExpand = useCallback(() => {
    hapticLight();
    const next = !expanded;
    setExpanded(next);
    Animated.spring(heightAnim, { toValue: next ? 1 : 0, useNativeDriver: false }).start();
    console.log(`[GTR] Toggled expand: ${next}`);
  }, [expanded, heightAnim]);

  const handleTabPress = useCallback((key: TabKey) => {
    hapticLight();
    setActiveTab(key);
    console.log(`[GTR] Tab switched: ${key}`);
  }, []);

  const toggleSectorFilter = useCallback((sector: USSectorKey) => {
    hapticLight();
    setSelectedSectors((prev) => {
      const next = new Set(prev);
      if (next.has(sector)) {
        next.delete(sector);
      } else {
        next.add(sector);
      }
      return next;
    });
  }, []);

  const contentHeight = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 520],
  });

  return (
    <View style={styles.container}>
      <Pressable style={styles.header} onPress={toggleExpand} testID="gtr-toggle">
        <View style={styles.headerLeft}>
          <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
          <View>
            <Text style={styles.headerTitle}>Global Trend Reflector</Text>
            <Text style={styles.headerSub}>全美股映射 · {sectorCount}个板块 · 实时进化</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.counterBadge}>
            <TrendingUp size={10} color={Colors.accent} />
            <Text style={styles.counterText}>{activeCount}</Text>
          </View>
          {criticalCount > 0 && (
            <View style={[styles.counterBadge, { backgroundColor: Colors.redDim }]}>
              <AlertTriangle size={10} color={Colors.red} />
              <Text style={[styles.counterText, { color: Colors.red }]}>{criticalCount}</Text>
            </View>
          )}
          {expanded ? (
            <ChevronUp size={18} color={Colors.textTertiary} />
          ) : (
            <ChevronDown size={18} color={Colors.textTertiary} />
          )}
        </View>
      </Pressable>

      <Animated.View style={[styles.expandable, { maxHeight: contentHeight, opacity: heightAnim }]}>
        <View style={styles.tabBar}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const Icon = tab.icon;
            return (
              <Pressable
                key={tab.key}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => handleTabPress(tab.key)}
                testID={`gtr-tab-${tab.key}`}
              >
                <Icon size={13} color={isActive ? Colors.accent : Colors.textMuted} />
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {activeTab !== 'evolution' && (
          <View style={styles.filterRow}>
            <Pressable
              style={[styles.filterBtn, showSectorFilter && styles.filterBtnActive]}
              onPress={() => { hapticLight(); setShowSectorFilter(!showSectorFilter); }}
            >
              <Filter size={12} color={showSectorFilter ? Colors.accent : Colors.textMuted} />
              <Text style={[styles.filterText, showSectorFilter && { color: Colors.accent }]}>
                {selectedSectors.size > 0 ? `${selectedSectors.size}个板块` : '全部板块'}
              </Text>
            </Pressable>
            {selectedSectors.size > 0 && (
              <Pressable
                style={styles.clearBtn}
                onPress={() => { hapticLight(); setSelectedSectors(new Set()); }}
              >
                <X size={12} color={Colors.textMuted} />
              </Pressable>
            )}
          </View>
        )}

        {showSectorFilter && activeTab !== 'evolution' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sectorFilterScroll}
          >
            {ALL_SECTORS.map((sector) => (
              <SectorChip
                key={sector}
                sector={sector}
                selected={selectedSectors.has(sector)}
                onPress={() => toggleSectorFilter(sector)}
              />
            ))}
          </ScrollView>
        )}

        {activeTab === 'mapping' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.mappingScroll}
          >
            {filteredMappings.map((m) => (
              <MappingCard key={m.id} item={m} />
            ))}
          </ScrollView>
        )}

        {activeTab === 'execution' && (
          <ScrollView
            style={styles.verticalScroll}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            <BudgetGauge strategies={filteredExecutions} />
            {filteredExecutions.map((s) => (
              <ExecutionCard
                key={s.id}
                item={s}
                onToggle={() => toggleGtrExecution(s.id)}
                onAdjust={(delta) => adjustBudgetRatio(s.id, delta)}
              />
            ))}
          </ScrollView>
        )}

        {activeTab === 'anomaly' && (
          <ScrollView
            style={styles.verticalScroll}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            {filteredAnomalies.map((a) => (
              <AnomalyCard
                key={a.id}
                item={a}
                onIntercept={() => interceptAnomaly(a.id)}
                onDismiss={() => dismissAnomaly(a.id)}
              />
            ))}
            {filteredAnomalies.length === 0 && (
              <View style={styles.emptyState}>
                <Shield size={24} color={Colors.textMuted} />
                <Text style={styles.emptyText}>暂无异常信号</Text>
              </View>
            )}
          </ScrollView>
        )}

        {activeTab === 'evolution' && (
          <ScrollView
            style={styles.verticalScroll}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            <EvolutionStats mappings={gtrMappings} />
            {gtrSILogs.map((log) => (
              <EvolutionCard key={log.id} log={log} />
            ))}
          </ScrollView>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16, marginTop: 8, marginBottom: 4,
    backgroundColor: '#F2F4F7', borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: '#E4E8ED',
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.red },
  headerTitle: { fontSize: 13, fontWeight: '800' as const, color: Colors.textPrimary, letterSpacing: -0.3 },
  headerSub: { fontSize: 10, color: Colors.textTertiary, marginTop: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  counterBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.accentDim, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  counterText: { fontSize: 11, fontWeight: '700' as const, color: Colors.accent, fontVariant: ['tabular-nums'] as const },
  expandable: { overflow: 'hidden' },
  tabBar: {
    flexDirection: 'row', marginHorizontal: 12, marginBottom: 8,
    backgroundColor: Colors.white, borderRadius: 12, padding: 3,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 3, paddingVertical: 7, borderRadius: 10,
  },
  tabActive: { backgroundColor: Colors.accentDim },
  tabText: { fontSize: 11, fontWeight: '600' as const, color: Colors.textMuted },
  tabTextActive: { color: Colors.accent },
  filterRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: 12, marginBottom: 6,
  },
  filterBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
    backgroundColor: Colors.white, borderWidth: 1, borderColor: '#E4E8ED',
  },
  filterBtnActive: { borderColor: Colors.accentBorder, backgroundColor: Colors.accentDim },
  filterText: { fontSize: 11, fontWeight: '600' as const, color: Colors.textSecondary },
  clearBtn: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  sectorFilterScroll: { paddingHorizontal: 12, paddingBottom: 6 },
  mappingScroll: { paddingHorizontal: 12, paddingBottom: 14 },
  verticalScroll: { maxHeight: 380, paddingHorizontal: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 30, gap: 8 },
  emptyText: { fontSize: 13, color: Colors.textMuted },
});
