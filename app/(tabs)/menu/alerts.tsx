import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, Platform, Alert as RNAlert, FlatList,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import {
  TrendingUp, AlertTriangle, Wallet, Star, CheckCheck, Bell,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { Alert as AlertType } from '@/types/market';

const typeConfig = {
  price: { icon: TrendingUp, color: Colors.accent, label: '价格' },
  indicator: { icon: AlertTriangle, color: Colors.orange, label: '指标' },
  fund_flow: { icon: Wallet, color: Colors.purple, label: '资金' },
  news: { icon: Star, color: Colors.gold, label: '资讯' },
};

export default function AlertsScreen() {
  const router = useRouter();
  const { alertsList, markAlertRead, markAllAlertsRead, deleteAlert } = useApp();
  const unreadCount = alertsList.filter((a) => !a.isRead).length;

  const handleMarkAllRead = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    markAllAlertsRead();
  }, [markAllAlertsRead]);

  const handleAlertPress = useCallback((alert: AlertType) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    markAlertRead(alert.id);
    if (alert.stockCode) {
      router.push({ pathname: '/(tabs)/(watchlist)/stock-detail', params: { id: alert.stockCode } });
      return;
    }
    RNAlert.alert(alert.title, alert.description);
  }, [markAlertRead, router]);

  const handleDeleteAlert = useCallback((alertId: string) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    RNAlert.alert('删除预警', '确定要删除这条预警记录吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => deleteAlert(alertId) },
    ]);
  }, [deleteAlert]);

  const renderAlert = useCallback(({ item }: { item: AlertType }) => {
    const config = typeConfig[item.type];
    const Icon = config.icon;
    return (
      <Pressable
        style={[styles.alertCard, !item.isRead && styles.alertUnread]}
        onPress={() => handleAlertPress(item)}
        onLongPress={() => handleDeleteAlert(item.id)}
      >
        <View style={[styles.alertIconWrap, { backgroundColor: `${config.color}12` }]}>
          <Icon size={18} color={config.color} />
        </View>
        <View style={styles.alertContent}>
          <View style={styles.alertHeader}>
            <Text style={styles.alertTitle} numberOfLines={1}>{item.title}</Text>
            <View style={[styles.typeBadge, { backgroundColor: `${config.color}15` }]}>
              <Text style={[styles.typeText, { color: config.color }]}>{config.label}</Text>
            </View>
          </View>
          <Text style={styles.alertDesc} numberOfLines={2}>{item.description}</Text>
          <Text style={styles.alertTime}>{item.timestamp}</Text>
        </View>
        {!item.isRead && <View style={styles.unreadDot} />}
      </Pressable>
    );
  }, [handleAlertPress, handleDeleteAlert]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '预警通知', headerRight: () => unreadCount > 0 ? (
        <Pressable onPress={handleMarkAllRead} style={styles.markAllBtn}><CheckCheck size={18} color={Colors.accent} /></Pressable>
      ) : null }} />
      {alertsList.length === 0 ? (
        <View style={styles.emptyState}>
          <Bell size={40} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>暂无预警通知</Text>
          <Text style={styles.emptyDesc}>当您设置的预警条件触发时，通知将显示在这里</Text>
        </View>
      ) : (
        <FlatList
          data={alertsList}
          keyExtractor={(item) => item.id}
          renderItem={renderAlert}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={unreadCount > 0 ? <View style={styles.headerInfo}><Text style={styles.headerInfoText}>{unreadCount} 条未读预警</Text></View> : null}
          ListFooterComponent={<Text style={styles.footerHint}>长按可删除预警记录</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  markAllBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.accentDim, alignItems: 'center', justifyContent: 'center', marginRight: 4 },
  listContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 },
  headerInfo: { paddingVertical: 8, marginBottom: 4 },
  headerInfoText: { color: Colors.accent, fontSize: 13, fontWeight: '600' as const },
  alertCard: {
    flexDirection: 'row', backgroundColor: Colors.card, borderRadius: 16, padding: 16, marginBottom: 10, gap: 12,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6 }, android: { elevation: 1 }, web: {} }),
  },
  alertUnread: { borderLeftWidth: 3, borderLeftColor: Colors.accent },
  alertIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  alertContent: { flex: 1 },
  alertHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  alertTitle: { flex: 1, color: Colors.textPrimary, fontSize: 15, fontWeight: '600' as const },
  typeBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  typeText: { fontSize: 10, fontWeight: '600' as const },
  alertDesc: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19, marginBottom: 4 },
  alertTime: { color: Colors.textMuted, fontSize: 11 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent, marginTop: 4 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { color: Colors.textSecondary, fontSize: 18, fontWeight: '600' as const, marginTop: 16 },
  emptyDesc: { color: Colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 19 },
  footerHint: { color: Colors.textMuted, fontSize: 12, textAlign: 'center', paddingVertical: 16 },
});
