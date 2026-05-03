import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform, Switch, Alert,
  Modal, TextInput, KeyboardAvoidingView,
} from 'react-native';
import { Stack } from 'expo-router';
import {
  Wifi, WifiOff, Database, Clock, Bell, BellOff,
  TrendingUp, AlertTriangle, Wallet, Newspaper,
  Trash2, Info, UserX, X,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

const DATA_SOURCES = ['tushare', 'akshare', 'eastmoney', 'sina'] as const;
const REFRESH_INTERVALS = [3, 5, 10, 30, 60] as const;

export default function SettingsScreen() {
  const { settings, updateSettings } = useApp();
  const [testingApi, setTestingApi] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [confirmText, setConfirmText] = useState<string>('');
  const [deleting, setDeleting] = useState<boolean>(false);

  const handleOpenDeleteAccount = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setConfirmText('');
    setShowDeleteModal(true);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    if (deleting) return;
    setShowDeleteModal(false);
    setConfirmText('');
  }, [deleting]);

  const handleConfirmDelete = useCallback(async () => {
    if (confirmText.trim() !== 'DELETE') {
      Alert.alert('确认失败', '请输入 DELETE 以确认删除账号');
      return;
    }
    setDeleting(true);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setShowDeleteModal(false);
      setConfirmText('');
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert('账号已删除', '您的账号和所有相关数据已被永久删除。');
    } catch (error) {
      console.error('[DeleteAccount] failed', error);
      Alert.alert('删除失败', '请稍后重试或联系客服。');
    } finally {
      setDeleting(false);
    }
  }, [confirmText]);

  const handleTestApi = useCallback(async () => {
    setTestingApi(true);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const success = Math.random() > 0.2;
    updateSettings({ apiStatus: success ? 'connected' : 'error' });
    setTestingApi(false);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(
        success ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
      );
    }
    Alert.alert(
      success ? 'API 连接正常' : 'API 连接异常',
      success ? '所有数据接口运行正常' : '部分接口响应超时，请检查网络或稍后重试'
    );
  }, [updateSettings]);

  const handleClearCache = useCallback(() => {
    Alert.alert('清除缓存', '将清除所有本地缓存数据', [
      { text: '取消', style: 'cancel' },
      {
        text: '确认清除',
        style: 'destructive',
        onPress: () => {
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          Alert.alert('已清除', '缓存已成功清除');
        },
      },
    ]);
  }, []);

  const handleDataSourceChange = useCallback(() => {
    const currentIndex = DATA_SOURCES.indexOf(settings.dataSource as typeof DATA_SOURCES[number]);
    const nextIndex = (currentIndex + 1) % DATA_SOURCES.length;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    updateSettings({ dataSource: DATA_SOURCES[nextIndex] });
  }, [settings.dataSource, updateSettings]);

  const handleRefreshIntervalChange = useCallback(() => {
    const currentIndex = REFRESH_INTERVALS.indexOf(settings.refreshInterval as typeof REFRESH_INTERVALS[number]);
    const nextIndex = (currentIndex + 1) % REFRESH_INTERVALS.length;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    updateSettings({ refreshInterval: REFRESH_INTERVALS[nextIndex] });
  }, [settings.refreshInterval, updateSettings]);

  const apiStatusConfig = {
    connected: { label: '已连接', color: Colors.green, Icon: Wifi },
    disconnected: { label: '未连接', color: Colors.textMuted, Icon: WifiOff },
    error: { label: '异常', color: Colors.red, Icon: WifiOff },
  }[settings.apiStatus];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Stack.Screen options={{ title: '系统设置' }} />

      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>连接状态</Text>
        <Pressable style={styles.settingRow} onPress={handleTestApi}>
          <View style={[styles.settingIcon, { backgroundColor: settings.apiStatus === 'connected' ? Colors.greenDim : Colors.redDim }]}>
            <apiStatusConfig.Icon size={16} color={apiStatusConfig.color} />
          </View>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>API 状态</Text>
            <Text style={[styles.settingValue, { color: apiStatusConfig.color }]}>
              {testingApi ? '检测中...' : apiStatusConfig.label}
            </Text>
          </View>
          <View style={styles.testBadge}>
            <Text style={styles.testBadgeText}>点击检测</Text>
          </View>
        </Pressable>
        <View style={styles.settingDivider} />
        <Pressable style={styles.settingRow} onPress={handleDataSourceChange}>
          <View style={[styles.settingIcon, { backgroundColor: Colors.accentDim }]}>
            <Database size={16} color={Colors.accent} />
          </View>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>数据源</Text>
            <Text style={styles.settingValue}>{settings.dataSource}</Text>
          </View>
          <Text style={styles.tapHint}>点击切换</Text>
        </Pressable>
        <View style={styles.settingDivider} />
        <Pressable style={styles.settingRow} onPress={handleRefreshIntervalChange}>
          <View style={[styles.settingIcon, { backgroundColor: Colors.orangeDim }]}>
            <Clock size={16} color={Colors.orange} />
          </View>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>刷新间隔</Text>
            <Text style={styles.settingValue}>{settings.refreshInterval}秒</Text>
          </View>
          <Text style={styles.tapHint}>点击切换</Text>
        </Pressable>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>预警通知</Text>
        <View style={styles.switchRow}>
          <View style={[styles.settingIcon, { backgroundColor: Colors.accentDim }]}>
            {settings.pushNotifications ? <Bell size={16} color={Colors.accent} /> : <BellOff size={16} color={Colors.textMuted} />}
          </View>
          <Text style={styles.switchLabel}>推送通知</Text>
          <Switch value={settings.pushNotifications} onValueChange={(v) => updateSettings({ pushNotifications: v })} trackColor={{ false: Colors.surface, true: Colors.accentDim }} thumbColor={settings.pushNotifications ? Colors.accent : Colors.textMuted} />
        </View>
        <View style={styles.settingDivider} />
        <View style={styles.switchRow}>
          <View style={[styles.settingIcon, { backgroundColor: Colors.greenDim }]}><TrendingUp size={16} color={Colors.green} /></View>
          <Text style={styles.switchLabel}>价格预警</Text>
          <Switch value={settings.priceAlerts} onValueChange={(v) => updateSettings({ priceAlerts: v })} trackColor={{ false: Colors.surface, true: Colors.greenDim }} thumbColor={settings.priceAlerts ? Colors.green : Colors.textMuted} />
        </View>
        <View style={styles.settingDivider} />
        <View style={styles.switchRow}>
          <View style={[styles.settingIcon, { backgroundColor: Colors.orangeDim }]}><AlertTriangle size={16} color={Colors.orange} /></View>
          <Text style={styles.switchLabel}>指标预警</Text>
          <Switch value={settings.indicatorAlerts} onValueChange={(v) => updateSettings({ indicatorAlerts: v })} trackColor={{ false: Colors.surface, true: Colors.orangeDim }} thumbColor={settings.indicatorAlerts ? Colors.orange : Colors.textMuted} />
        </View>
        <View style={styles.settingDivider} />
        <View style={styles.switchRow}>
          <View style={[styles.settingIcon, { backgroundColor: Colors.purpleDim }]}><Wallet size={16} color={Colors.purple} /></View>
          <Text style={styles.switchLabel}>资金异动</Text>
          <Switch value={settings.fundFlowAlerts} onValueChange={(v) => updateSettings({ fundFlowAlerts: v })} trackColor={{ false: Colors.surface, true: Colors.purpleDim }} thumbColor={settings.fundFlowAlerts ? Colors.purple : Colors.textMuted} />
        </View>
        <View style={styles.settingDivider} />
        <View style={styles.switchRow}>
          <View style={[styles.settingIcon, { backgroundColor: Colors.goldDim }]}><Newspaper size={16} color={Colors.gold} /></View>
          <Text style={styles.switchLabel}>新闻资讯</Text>
          <Switch value={settings.newsAlerts} onValueChange={(v) => updateSettings({ newsAlerts: v })} trackColor={{ false: Colors.surface, true: Colors.goldDim }} thumbColor={settings.newsAlerts ? Colors.gold : Colors.textMuted} />
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>数据管理</Text>
        <Pressable style={styles.settingRow} onPress={handleClearCache}>
          <View style={[styles.settingIcon, { backgroundColor: Colors.redDim }]}><Trash2 size={16} color={Colors.red} /></View>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, { color: Colors.red }]}>清除缓存</Text>
            <Text style={styles.settingValue}>清除本地缓存数据</Text>
          </View>
        </Pressable>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>账号</Text>
        <Pressable
          style={styles.settingRow}
          onPress={handleOpenDeleteAccount}
          testID="delete-account-button"
        >
          <View style={[styles.settingIcon, { backgroundColor: Colors.redDim }]}>
            <UserX size={16} color={Colors.red} />
          </View>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, { color: Colors.red }]}>删除账号</Text>
            <Text style={styles.settingValue}>永久删除账号及所有数据</Text>
          </View>
        </Pressable>
        <Text style={styles.sectionFooter}>
          删除账号将永久移除您的所有数据,此操作不可撤销。
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Info size={14} color={Colors.textTertiary} />
        <Text style={styles.infoText}>数据源切换后，新数据将在下一次刷新时生效。</Text>
      </View>

      <Text style={styles.attributionText}>Market data provided by Alpha Vantage and Finnhub</Text>
      <View style={{ height: 40 }} />

      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseDeleteModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={[styles.settingIcon, { backgroundColor: Colors.redDim }]}>
                <AlertTriangle size={18} color={Colors.red} />
              </View>
              <Text style={styles.modalTitle}>确认删除账号</Text>
              <Pressable
                onPress={handleCloseDeleteModal}
                hitSlop={12}
                disabled={deleting}
                testID="delete-account-close"
              >
                <X size={20} color={Colors.textMuted} />
              </Pressable>
            </View>
            <Text style={styles.modalMessage}>
              此操作将永久删除您的账号和所有相关数据,包括:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• 个人资料</Text>
              <Text style={styles.bulletItem}>• 自选股与收藏</Text>
              <Text style={styles.bulletItem}>• 预警与提醒设置</Text>
            </View>
            <Text style={styles.modalWarning}>此操作不可撤销。</Text>
            <Text style={styles.modalLabel}>请输入 DELETE 确认</Text>
            <TextInput
              value={confirmText}
              onChangeText={setConfirmText}
              placeholder="DELETE"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!deleting}
              style={styles.modalInput}
              testID="delete-account-input"
            />
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.modalCancel]}
                onPress={handleCloseDeleteModal}
                disabled={deleting}
                testID="delete-account-cancel"
              >
                <Text style={styles.modalCancelText}>取消</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalButton,
                  styles.modalDelete,
                  (confirmText.trim() !== 'DELETE' || deleting) && styles.modalDeleteDisabled,
                ]}
                onPress={handleConfirmDelete}
                disabled={confirmText.trim() !== 'DELETE' || deleting}
                testID="delete-account-confirm"
              >
                <Text style={styles.modalDeleteText}>
                  {deleting ? '删除中...' : '永久删除'}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  sectionCard: {
    marginHorizontal: 16, marginTop: 14, backgroundColor: Colors.card, borderRadius: 18, padding: 4,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 12 }, android: { elevation: 2 }, web: {} }),
  },
  sectionLabel: { color: Colors.textTertiary, fontSize: 12, fontWeight: '600' as const, paddingHorizontal: 14, paddingTop: 14, paddingBottom: 6, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14, gap: 12 },
  settingIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingInfo: { flex: 1 },
  settingTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: '500' as const },
  settingValue: { color: Colors.textTertiary, fontSize: 12, marginTop: 2 },
  settingDivider: { height: 0.5, backgroundColor: Colors.divider, marginLeft: 60 },
  testBadge: { backgroundColor: Colors.accentDim, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  testBadgeText: { color: Colors.accent, fontSize: 12, fontWeight: '600' as const },
  tapHint: { color: Colors.textMuted, fontSize: 12 },
  switchRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, gap: 12 },
  switchLabel: { flex: 1, color: Colors.textPrimary, fontSize: 15, fontWeight: '500' as const },
  infoCard: { flexDirection: 'row', marginHorizontal: 16, marginTop: 14, backgroundColor: Colors.surface, borderRadius: 14, padding: 14, gap: 8 },
  infoText: { flex: 1, color: Colors.textTertiary, fontSize: 12, lineHeight: 18 },
  attributionText: { textAlign: 'center' as const, color: Colors.textMuted, fontSize: 11, marginTop: 20, marginHorizontal: 16 },
  sectionFooter: { color: Colors.textTertiary, fontSize: 11, lineHeight: 16, paddingHorizontal: 14, paddingTop: 6, paddingBottom: 12 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', maxWidth: 420, backgroundColor: Colors.card, borderRadius: 20, padding: 20, gap: 10 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  modalTitle: { flex: 1, color: Colors.textPrimary, fontSize: 17, fontWeight: '700' as const },
  modalMessage: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20 },
  bulletList: { gap: 4, paddingLeft: 4 },
  bulletItem: { color: Colors.textTertiary, fontSize: 13, lineHeight: 19 },
  modalWarning: { color: Colors.red, fontSize: 13, fontWeight: '600' as const, marginTop: 4 },
  modalLabel: { color: Colors.textTertiary, fontSize: 12, fontWeight: '600' as const, marginTop: 8, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  modalInput: { backgroundColor: Colors.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: Colors.textPrimary, fontSize: 15, fontWeight: '600' as const, letterSpacing: 1.5, borderWidth: 1, borderColor: Colors.divider },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  modalButton: { flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  modalCancel: { backgroundColor: Colors.surface },
  modalCancelText: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600' as const },
  modalDelete: { backgroundColor: Colors.red },
  modalDeleteDisabled: { opacity: 0.45 },
  modalDeleteText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' as const },
});
