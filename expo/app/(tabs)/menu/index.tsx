import React, { useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform, Alert, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MessageSquare, Settings, Crown, ChevronRight, Star,
  HelpCircle, Info, LogOut, UserPlus, CreditCard,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

export default function MenuScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isSubscribed, subscribe, alertsList } = useApp();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const unreadAlerts = alertsList.filter((a) => !a.isRead).length;

  const handleSubscribe = useCallback(() => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.97, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    if (isSubscribed) {
      Alert.alert('已是Pro会员', '您已开通Pro会员，享受全部高级功能');
      return;
    }

    Alert.alert(
      '开通 Pro 会员',
      '30天免费试用，之后 ¥198/年\n\n包含：\n• 全部量化策略\n• AI 无限对话\n• 实时预警推送\n• 专属数据源',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '开始免费试用',
          onPress: () => {
            subscribe();
            if (Platform.OS !== 'web') {
              void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            Alert.alert('订阅成功', '恭喜！您已成功开通Pro会员，30天免费试用已激活');
            console.log('[Menu] Subscription activated');
          },
        },
      ]
    );
  }, [isSubscribed, subscribe, scaleAnim]);

  const handleSettings = useCallback(() => {
    router.push('/(tabs)/menu/settings');
    console.log('[Menu] Navigate to settings');
  }, [router]);

  const handleAlerts = useCallback(() => {
    router.push('/(tabs)/menu/alerts');
    console.log('[Menu] Navigate to alerts');
  }, [router]);

  const handleLogout = useCallback(() => {
    Alert.alert('退出登录', '确定要退出当前账号吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '退出',
        style: 'destructive',
        onPress: () => {
          console.log('[Menu] User logged out');
          Alert.alert('已退出', '您已成功退出登录');
        },
      },
    ]);
  }, []);

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Pressable style={styles.headerBtn}>
          <MessageSquare size={22} color={Colors.textPrimary} />
        </Pressable>
        <Pressable style={styles.headerBtn} onPress={handleSettings}>
          <Settings size={22} color={Colors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.profileCard}>
        <Pressable
          style={styles.profileRow}
          onPress={() => {
            router.push('/(tabs)/menu/profile');
            console.log('[Menu] Navigate to profile');
          }}
        >
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>W</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>williamleo0369</Text>
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>{isSubscribed ? 'PRO' : 'BASIC'}</Text>
            </View>
          </View>
          <ChevronRight size={20} color={Colors.textMuted} />
        </Pressable>

        <View style={styles.statsRow}>
          <Pressable
            style={styles.statItem}
            onPress={() => {
              router.push('/(tabs)/menu/profile');
              console.log('[Menu] Navigate to profile - posts/followers');
            }}
          >
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>已发表</Text>
          </Pressable>
          <Pressable
            style={styles.statItem}
            onPress={() => {
              router.push('/(tabs)/menu/profile');
              console.log('[Menu] Navigate to profile - followers');
            }}
          >
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>粉丝</Text>
          </Pressable>
          <Pressable
            style={styles.statItem}
            onPress={() => {
              router.push('/(tabs)/community');
              console.log('[Menu] Navigate to community - following');
            }}
          >
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>正在关注</Text>
          </Pressable>
        </View>
      </View>

      <Animated.View style={[styles.subscriptionBanner, { transform: [{ scale: scaleAnim }] }]}>
        <Pressable onPress={handleSubscribe}>
          <LinearGradient
            colors={['#E8D5F5', '#F5E6D0', '#F0D5E5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bannerGradient}
          >
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>
                {isSubscribed ? 'Pro会员已激活' : '30天免费试用'}
              </Text>
              <Text style={styles.bannerSubtitle}>
                {isSubscribed ? '感谢您的支持' : '立即升级'}
              </Text>
            </View>
            <View style={styles.bannerLogo}>
              <Text style={styles.bannerLogoText}>OT</Text>
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>

      <View style={styles.actionCards}>
        <Pressable
          style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
          onPress={handleSubscribe}
        >
          <Crown size={22} color={Colors.textSecondary} />
          <Text style={styles.actionCardTitle}>订阅</Text>
          <Text style={styles.actionCardDesc}>充分发挥 OT 的强大功能</Text>
          <ChevronRight size={18} color={Colors.textMuted} style={styles.actionCardArrow} />
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
          onPress={() => Alert.alert('推荐朋友', '分享您的专属邀请链接给好友')}
        >
          <UserPlus size={22} color={Colors.textSecondary} />
          <Text style={styles.actionCardTitle}>推荐朋友</Text>
          <Text style={styles.actionCardDesc}>分享您的喜爱</Text>
          <ChevronRight size={18} color={Colors.textMuted} style={styles.actionCardArrow} />
        </Pressable>
      </View>

      <View style={styles.menuSection}>
        <Pressable style={styles.menuRow} onPress={handleAlerts}>
          <View style={styles.menuIconRow}>
            <Star size={20} color={Colors.textSecondary} />
            <Text style={styles.menuLabel}>预警通知</Text>
          </View>
          {unreadAlerts > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadAlerts}</Text>
            </View>
          )}
        </Pressable>
        <View style={styles.menuDivider} />
        <Pressable style={styles.menuRow} onPress={() => Alert.alert('评分', '感谢您的反馈！')}>
          <Star size={20} color={Colors.textSecondary} />
          <Text style={styles.menuLabel}>给我们评分</Text>
        </Pressable>
        <View style={styles.menuDivider} />
        <Pressable style={styles.menuRow} onPress={() => Alert.alert('帮助中心', '如有问题，请联系 support@tv.com')}>
          <HelpCircle size={20} color={Colors.textSecondary} />
          <Text style={styles.menuLabel}>帮助中心</Text>
        </Pressable>
        <View style={styles.menuDivider} />
        <Pressable style={styles.menuRow} onPress={() => Alert.alert('恢复购买', '正在恢复您之前的购买记录...')}>
          <CreditCard size={20} color={Colors.textSecondary} />
          <Text style={styles.menuLabel}>恢复购买</Text>
        </Pressable>
        <View style={styles.menuDivider} />
        <Pressable style={styles.menuRow} onPress={() => Alert.alert('关于', '智能投研 OT v1.0.0\n\nAI驱动的量化投资监控工具')}>
          <Info size={20} color={Colors.textSecondary} />
          <Text style={styles.menuLabel}>关于</Text>
          <ChevronRight size={18} color={Colors.textMuted} style={{ marginLeft: 'auto' }} />
        </Pressable>
      </View>

      <Pressable style={styles.logoutRow} onPress={handleLogout}>
        <LogOut size={20} color={Colors.red} />
        <Text style={styles.logoutText}>退出</Text>
      </Pressable>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscriptionBanner: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  bannerLogo: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerLogoText: {
    fontSize: 24,
    fontWeight: '900' as const,
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  profileCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 18,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#8B7E74',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  profileAvatarText: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '700' as const,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  planBadge: {
    alignSelf: 'flex-start' as const,
    borderWidth: 1,
    borderColor: Colors.textMuted,
    borderStyle: 'dashed' as const,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'] as const,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  actionCards: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
  },
  actionCardPressed: {
    backgroundColor: Colors.surface,
  },
  actionCardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginTop: 10,
  },
  actionCardDesc: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 4,
    lineHeight: 18,
  },
  actionCardArrow: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  menuSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 14,
  },
  menuIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '500' as const,
  },
  menuDivider: {
    height: 0.5,
    backgroundColor: Colors.divider,
  },
  badge: {
    backgroundColor: Colors.red,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700' as const,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingVertical: 16,
    gap: 14,
    borderTopWidth: 0.5,
    borderTopColor: Colors.divider,
  },
  logoutText: {
    fontSize: 16,
    color: Colors.red,
    fontWeight: '500' as const,
  },
});
