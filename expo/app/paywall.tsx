import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Crown, Sparkles, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import Colors from '@/constants/colors';
import { configureRevenueCat, PRO_ENTITLEMENT_ID } from '@/lib/revenuecat';
import { useApp } from '@/contexts/AppContext';

configureRevenueCat();

const FEATURES: { title: string; desc: string }[] = [
  { title: '全部量化策略', desc: '解锁专业量化模型与回测工具' },
  { title: 'AI 无限对话', desc: '7×24 小时智能投研助手' },
  { title: '实时预警推送', desc: '价格、指标、资金流秒级提醒' },
  { title: '专属数据源', desc: 'Alpha Vantage 与 Finnhub 实时报价' },
];

type PackageKey = 'monthly' | 'yearly';

type DisplayPackage = {
  key: PackageKey;
  pkg: PurchasesPackage;
  title: string;
  priceString: string;
  unit: string;
  badge?: string;
};

export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { subscribe } = useApp();
  const [selected, setSelected] = useState<PackageKey>('yearly');

  const offeringsQuery = useQuery({
    queryKey: ['rc-offerings'],
    queryFn: async () => {
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    },
  });

  const packages = useMemo<DisplayPackage[]>(() => {
    const current = offeringsQuery.data;
    if (!current) return [];
    const monthly = current.monthly ?? current.availablePackages.find((p) => p.packageType === 'MONTHLY');
    const yearly = current.annual ?? current.availablePackages.find((p) => p.packageType === 'ANNUAL');
    const list: DisplayPackage[] = [];
    if (monthly) {
      list.push({
        key: 'monthly',
        pkg: monthly,
        title: '月度订阅',
        priceString: monthly.product.priceString,
        unit: '/ 月',
      });
    }
    if (yearly) {
      list.push({
        key: 'yearly',
        pkg: yearly,
        title: '年度订阅',
        priceString: yearly.product.priceString,
        unit: '/ 年',
        badge: '最划算',
      });
    }
    return list;
  }, [offeringsQuery.data]);

  const purchaseMutation = useMutation({
    mutationFn: async (pkg: PurchasesPackage) => {
      const result = await Purchases.purchasePackage(pkg);
      return result;
    },
    onSuccess: (result) => {
      const isPro = result.customerInfo.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined;
      if (isPro) {
        subscribe();
        if (Platform.OS !== 'web') {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        Alert.alert('订阅成功', '欢迎加入 Pro 会员，全部高级功能已解锁');
        router.back();
      }
      void queryClient.invalidateQueries({ queryKey: ['rc-customer-info'] });
    },
    onError: (err: unknown) => {
      const e = err as { userCancelled?: boolean; message?: string };
      if (e?.userCancelled) {
        console.log('[Paywall] User cancelled');
        return;
      }
      console.log('[Paywall] Purchase error:', e?.message);
      Alert.alert('购买失败', e?.message ?? '请稍后重试');
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      const info = await Purchases.restorePurchases();
      return info;
    },
    onSuccess: (info) => {
      const isPro = info.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined;
      if (isPro) {
        subscribe();
        Alert.alert('恢复成功', '已恢复您的 Pro 会员');
        router.back();
      } else {
        Alert.alert('未发现可恢复的订阅', '当前账号下没有有效的 Pro 订阅');
      }
      void queryClient.invalidateQueries({ queryKey: ['rc-customer-info'] });
    },
    onError: (err: unknown) => {
      const e = err as { message?: string };
      console.log('[Paywall] Restore error:', e?.message);
      Alert.alert('恢复失败', e?.message ?? '请稍后重试');
    },
  });

  const handleContinue = useCallback(() => {
    const target = packages.find((p) => p.key === selected);
    if (!target) {
      Alert.alert('暂无可用套餐', '请稍后再试');
      return;
    }
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    purchaseMutation.mutate(target.pkg);
  }, [packages, selected, purchaseMutation]);

  const isLoading = offeringsQuery.isLoading;
  const isPurchasing = purchaseMutation.isPending;
  const isRestoring = restoreMutation.isPending;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#1A1530', '#2D1B4E', '#0F0B1F']}
        style={StyleSheet.absoluteFill}
      />

      <Pressable style={styles.closeBtn} onPress={() => router.back()} testID="paywall-close">
        <X size={22} color={Colors.white} />
      </Pressable>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 220 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroIcon}>
          <Crown size={36} color="#F5E6D0" />
        </View>
        <Text style={styles.title}>升级 Omni Trend Pro</Text>
        <Text style={styles.subtitle}>解锁专业量化分析与实时市场情报</Text>

        <View style={styles.featureList}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.featureRow}>
              <View style={styles.featureCheck}>
                <Check size={14} color="#1A1530" strokeWidth={3} />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.packagesWrap}>
          {isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={Colors.white} />
              <Text style={styles.loadingText}>正在加载套餐…</Text>
            </View>
          ) : packages.length === 0 ? (
            <View style={styles.loadingBox}>
              <Text style={styles.loadingText}>
                暂无可用套餐{'\n'}请检查网络后重试
              </Text>
            </View>
          ) : (
            packages.map((p) => {
              const active = p.key === selected;
              return (
                <Pressable
                  key={p.key}
                  onPress={() => {
                    setSelected(p.key);
                    if (Platform.OS !== 'web') {
                      void Haptics.selectionAsync();
                    }
                  }}
                  style={[styles.packageCard, active && styles.packageCardActive]}
                  testID={`paywall-package-${p.key}`}
                >
                  <View style={styles.packageHeader}>
                    <Text style={[styles.packageTitle, active && styles.packageTitleActive]}>
                      {p.title}
                    </Text>
                    {p.badge ? (
                      <View style={styles.packageBadge}>
                        <Sparkles size={10} color="#1A1530" />
                        <Text style={styles.packageBadgeText}>{p.badge}</Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={styles.packagePriceRow}>
                    <Text style={[styles.packagePrice, active && styles.packagePriceActive]}>
                      {p.priceString}
                    </Text>
                    <Text style={[styles.packageUnit, active && styles.packageUnitActive]}>
                      {p.unit}
                    </Text>
                  </View>
                  <View style={[styles.radio, active && styles.radioActive]}>
                    {active ? <View style={styles.radioDot} /> : null}
                  </View>
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          style={({ pressed }) => [
            styles.ctaBtn,
            (isPurchasing || packages.length === 0) && styles.ctaBtnDisabled,
            pressed && styles.ctaBtnPressed,
          ]}
          disabled={isPurchasing || packages.length === 0}
          onPress={handleContinue}
          testID="paywall-continue"
        >
          {isPurchasing ? (
            <ActivityIndicator color="#1A1530" />
          ) : (
            <Text style={styles.ctaBtnText}>立即开通</Text>
          )}
        </Pressable>

        <Pressable
          style={styles.restoreBtn}
          disabled={isRestoring}
          onPress={() => restoreMutation.mutate()}
          testID="paywall-restore"
        >
          <Text style={styles.restoreText}>
            {isRestoring ? '正在恢复…' : '恢复购买'}
          </Text>
        </Pressable>

        <Text style={styles.disclaimer}>
          订阅会在期满前 24 小时自动续费，可随时在系统设置中取消。
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1530' },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 60 },
  heroIcon: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: 'rgba(245,230,208,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 28,
  },
  featureList: { gap: 14, marginBottom: 28 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F5E6D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { flex: 1 },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.white,
    marginBottom: 2,
  },
  featureDesc: { fontSize: 12, color: 'rgba(255,255,255,0.55)' },
  packagesWrap: { gap: 12 },
  loadingBox: {
    paddingVertical: 32,
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
  },
  loadingText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  packageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    gap: 14,
  },
  packageCardActive: {
    borderColor: '#F5E6D0',
    backgroundColor: 'rgba(245,230,208,0.10)',
  },
  packageHeader: { flex: 1 },
  packageTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 4,
  },
  packageTitleActive: { color: Colors.white },
  packageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start' as const,
    backgroundColor: '#F5E6D0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  packageBadgeText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: '#1A1530',
    letterSpacing: 0.5,
  },
  packagePriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  packagePrice: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: 'rgba(255,255,255,0.85)',
    fontVariant: ['tabular-nums'] as const,
  },
  packagePriceActive: { color: Colors.white },
  packageUnit: { fontSize: 13, color: 'rgba(255,255,255,0.55)' },
  packageUnitActive: { color: 'rgba(255,255,255,0.8)' },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: '#F5E6D0' },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F5E6D0',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: 'rgba(15,11,31,0.95)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  ctaBtn: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#F5E6D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  ctaBtnPressed: { opacity: 0.85 },
  ctaBtnDisabled: { opacity: 0.5 },
  ctaBtnText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#1A1530',
    letterSpacing: 0.3,
  },
  restoreBtn: { alignItems: 'center', paddingVertical: 8 },
  restoreText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500' as const,
  },
  disclaimer: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 16,
  },
});
