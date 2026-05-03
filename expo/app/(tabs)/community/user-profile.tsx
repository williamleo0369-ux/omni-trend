import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform, Animated, ActionSheetIOS, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, MoreHorizontal, Heart, MessageCircle, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { communityUsers, communityPosts } from '@/mocks/market';
import { CommunityPost } from '@/types/market';

function FakeChart({ colors, height }: { colors: { primary: string; secondary: string }; height: number }) {
  const bars = useRef(
    Array.from({ length: 40 }, () => ({
      h: Math.random() * 0.7 + 0.3,
      isUp: Math.random() > 0.45,
    }))
  ).current;

  const candleLines = useRef(
    Array.from({ length: 40 }, (_, i) => ({
      y: 30 + Math.sin(i * 0.15) * 20 + (Math.random() - 0.5) * 15,
      bodyH: 3 + Math.random() * 8,
      isUp: Math.random() > 0.45,
    }))
  ).current;

  return (
    <View style={[styles.fakeChart, { height }]}>
      <View style={styles.chartCandles}>
        {candleLines.map((c, i) => (
          <View key={`c-${i}`} style={styles.candleCol}>
            <View style={{
              position: 'absolute' as const,
              bottom: `${c.y - 2}%`,
              width: 1,
              height: c.bodyH + 6,
              backgroundColor: c.isUp ? colors.primary : colors.secondary,
              opacity: 0.6,
              alignSelf: 'center' as const,
            }} />
            <View style={{
              position: 'absolute' as const,
              bottom: `${c.y}%`,
              width: 4,
              height: c.bodyH,
              backgroundColor: c.isUp ? colors.primary : colors.secondary,
              borderRadius: 1,
              alignSelf: 'center' as const,
            }} />
          </View>
        ))}
      </View>
      <View style={styles.volumeBars}>
        {bars.map((bar, i) => (
          <View
            key={`v-${i}`}
            style={{
              flex: 1,
              height: `${bar.h * 100}%`,
              backgroundColor: bar.isUp
                ? `${colors.primary}60`
                : `${colors.secondary}60`,
              marginHorizontal: 0.5,
              borderRadius: 1,
              alignSelf: 'flex-end' as const,
            }}
          />
        ))}
      </View>
    </View>
  );
}

function UserPostCard({ post, onPress }: { post: CommunityPost; onPress: () => void }) {
  return (
    <Pressable style={styles.userPostCard} onPress={onPress}>
      <View style={styles.userPostHeader}>
        <View style={[styles.smallAvatar, { backgroundColor: post.avatarColor }]}>
          <Text style={styles.smallAvatarText}>{post.avatarText}</Text>
        </View>
        <View style={styles.userPostAuthor}>
          <View style={styles.authorRow}>
            <Text style={styles.authorName}>{post.author}</Text>
            <Text style={styles.authorBadge}>▌</Text>
          </View>
          <Text style={styles.postDate}>{post.date}</Text>
        </View>
      </View>
      <FakeChart colors={post.chartColors} height={180} />
      <View style={styles.symbolRow}>
        <View style={[styles.symbolTag, { backgroundColor: `${post.symbolColor}18` }]}>
          <View style={[styles.symbolIcon, { backgroundColor: post.symbolColor }]}>
            <Text style={styles.symbolIconText}>{post.symbol.charAt(0)}</Text>
          </View>
          <Text style={[styles.symbolName, { color: post.symbolColor }]}>{post.symbol}</Text>
        </View>
        <View style={[
          styles.directionTag,
          { backgroundColor: post.direction === 'up' ? Colors.greenDim : Colors.redDim },
        ]}>
          {post.direction === 'up' ? (
            <TrendingUp size={14} color={Colors.green} />
          ) : (
            <TrendingDown size={14} color={Colors.red} />
          )}
        </View>
      </View>
      <Text style={styles.postTitle}>{post.title}</Text>
      <View style={styles.postActions}>
        <View style={styles.actionBtn}>
          <Heart size={16} color={Colors.textMuted} />
          <Text style={styles.actionCount}>{post.likes}</Text>
        </View>
        <View style={styles.actionBtn}>
          <MessageCircle size={16} color={Colors.textMuted} />
          <Text style={styles.actionCount}>{post.comments}</Text>
        </View>
        <View style={styles.moreBtn}>
          <MoreHorizontal size={16} color={Colors.textMuted} />
        </View>
      </View>
    </Pressable>
  );
}

function formatNumber(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

const platformIcons: Record<string, string> = {
  X: '𝕏',
  YouTube: '▶',
  Web: '🌐',
};

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const [isFollowed, setIsFollowed] = useState(false);
  const followScale = useRef(new Animated.Value(1)).current;

  const user = communityUsers.find((u) => u.id === userId);
  const userPosts = communityPosts.filter((p) => {
    const userMap: Record<string, string> = {
      'u1': 'KakarottoGoku', 'u2': 'Angel-btctrader', 'u3': 'TraderWang88',
      'u4': 'QuantMaster', 'u5': 'CryptoNinja',
    };
    return p.author === userMap[userId ?? ''];
  });

  const handleMore = useCallback(() => {
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
    const options = ['屏蔽', '举报', '分享', '取消'];
    const handle = (index: number) => {
      if (index === 0) console.log('[Profile] Block user', userId);
      else if (index === 1) console.log('[Profile] Report user', userId);
      else if (index === 2) console.log('[Profile] Share user', userId);
    };
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, destructiveButtonIndex: 1, cancelButtonIndex: 3 },
        handle,
      );
    } else {
      Alert.alert('更多操作', undefined, [
        { text: '屏蔽', onPress: () => handle(0) },
        { text: '举报', style: 'destructive', onPress: () => handle(1) },
        { text: '分享', onPress: () => handle(2) },
        { text: '取消', style: 'cancel' },
      ]);
    }
  }, [userId]);

  const handleMessage = useCallback(() => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    console.log('[Profile] Open message with user', userId);
    Alert.alert('私信功能', '私信功能即将上线，敬请期待。');
  }, [userId]);

  const handleFollow = useCallback(() => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsFollowed((prev) => !prev);
    Animated.sequence([
      Animated.timing(followScale, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.timing(followScale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    console.log(`[Profile] ${isFollowed ? 'Unfollowed' : 'Followed'} user ${userId}`);
  }, [followScale, isFollowed, userId]);

  if (!user) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: '用户', headerShown: true }} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>用户不存在</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: '',
          headerShown: true,
          headerStyle: { backgroundColor: Colors.white },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
              <ArrowLeft size={22} color={Colors.textPrimary} />
              <Text style={styles.backText}>返回</Text>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable hitSlop={12} style={styles.headerMoreBtn} onPress={handleMore}>
              <MoreHorizontal size={22} color={Colors.textPrimary} />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.profileHeader}>
          <View style={[styles.profileAvatar, { backgroundColor: user.avatarColor }]}>
            <Text style={styles.profileAvatarText}>{user.avatarText}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user.name}</Text>
            {user.badge && (
              <View style={styles.badgeTag}>
                <Text style={styles.badgeText}>{user.badge}</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.bioText}>{user.bio}</Text>

        <View style={styles.actionRow}>
          <Animated.View style={[styles.followBtnWrap, { transform: [{ scale: followScale }] }]}>
            <Pressable
              style={[styles.followBtn, isFollowed && styles.followedBtn]}
              onPress={handleFollow}
            >
              <Text style={[styles.followBtnText, isFollowed && styles.followedBtnText]}>
                {isFollowed ? '已关注' : '关注'}
              </Text>
            </Pressable>
          </Animated.View>
          <Pressable style={styles.messageBtn} onPress={handleMessage}>
            <Text style={styles.messageBtnText}>消息</Text>
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.postsCount}</Text>
            <Text style={styles.statLabel}>已发表</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{formatNumber(user.followers)}</Text>
            <Text style={styles.statLabel}>粉丝</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.following}</Text>
            <Text style={styles.statLabel}>正在关注</Text>
          </View>
        </View>

        {user.socialLinks.length > 0 && (
          <View style={styles.socialLinks}>
            {user.socialLinks.map((link, index) => (
              <View key={index} style={styles.socialLinkRow}>
                <Text style={styles.socialIcon}>{platformIcons[link.platform] || '🔗'}</Text>
                <Text style={styles.socialHandle}>{link.handle}</Text>
                <ExternalLink size={12} color={Colors.accent} style={styles.linkIcon} />
              </View>
            ))}
          </View>
        )}

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>发表观点</Text>

        {userPosts.length > 0 ? userPosts.map((post) => (
          <UserPostCard
            key={post.id}
            post={post}
            onPress={() => router.push({ pathname: '/community/post-detail', params: { postId: post.id } } as never)}
          />
        )) : (
          <View style={styles.emptyPosts}>
            <Text style={styles.emptyPostsText}>暂无发表内容</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  headerMoreBtn: {
    padding: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileAvatarText: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: '700' as const,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  badgeTag: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  bioText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  followBtnWrap: {
    flex: 1,
  },
  followBtn: {
    backgroundColor: Colors.textPrimary,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  followedBtn: {
    backgroundColor: Colors.surface,
  },
  followBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700' as const,
  },
  followedBtnText: {
    color: Colors.textSecondary,
  },
  messageBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  messageBtnText: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '700' as const,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 32,
  },
  statItem: {
    alignItems: 'flex-start',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'] as const,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  socialLinks: {
    marginBottom: 20,
    gap: 10,
  },
  socialLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  socialIcon: {
    fontSize: 16,
    width: 24,
    textAlign: 'center' as const,
  },
  socialHandle: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '500' as const,
  },
  linkIcon: {
    marginLeft: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  userPostCard: {
    marginBottom: 24,
  },
  userPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  smallAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  smallAvatarText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700' as const,
  },
  userPostAuthor: {
    flex: 1,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  authorBadge: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  postDate: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  fakeChart: {
    borderRadius: 12,
    backgroundColor: '#1C1C2E',
    overflow: 'hidden',
    marginBottom: 8,
  },
  chartCandles: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  candleCol: {
    flex: 1,
    position: 'relative',
  },
  volumeBars: {
    height: 35,
    flexDirection: 'row',
    paddingHorizontal: 8,
    alignItems: 'flex-end',
  },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  symbolTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  symbolIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbolIconText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '700' as const,
  },
  symbolName: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  directionTag: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    lineHeight: 22,
    marginBottom: 8,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
  },
  actionCount: {
    fontSize: 13,
    color: Colors.textTertiary,
    fontWeight: '500' as const,
    fontVariant: ['tabular-nums'] as const,
  },
  moreBtn: {
    marginLeft: 'auto',
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textTertiary,
  },
  emptyPosts: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyPostsText: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
});
