import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, Heart, MessageCircle, MoreHorizontal, TrendingUp, TrendingDown, Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { communityPosts, communityUsers } from '@/mocks/market';
import { CommunityPost } from '@/types/market';

const authorUserMap: Record<string, string> = {
  'KakarottoGoku': 'u1',
  'Angel-btctrader': 'u2',
  'TraderWang88': 'u3',
  'QuantMaster': 'u4',
  'CryptoNinja': 'u5',
};

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
      <View style={styles.chartOverlay}>
        <View style={styles.chartSymbolTag}>
          <View style={[styles.symbolDot, { backgroundColor: colors.primary }]} />
          <Text style={styles.symbolTagText}>MACD</Text>
        </View>
      </View>
    </View>
  );
}

function PostCard({ post, onLike, onPressPost, onPressUser, onPressComment }: {
  post: CommunityPost;
  onLike: () => void;
  onPressPost: () => void;
  onPressUser: () => void;
  onPressComment: () => void;
}) {
  const [liked, setLiked] = useState(false);
  const likeScale = useRef(new Animated.Value(1)).current;

  const handleLike = useCallback(() => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setLiked((prev) => !prev);
    Animated.sequence([
      Animated.timing(likeScale, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.timing(likeScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    onLike();
  }, [likeScale, onLike]);

  return (
    <View style={styles.postCard}>
      <Pressable style={styles.postHeader} onPress={onPressUser}>
        <View style={[styles.avatar, { backgroundColor: post.avatarColor }]}>
          <Text style={styles.avatarText}>{post.avatarText}</Text>
        </View>
        <View style={styles.postAuthorInfo}>
          <View style={styles.authorRow}>
            <Text style={styles.authorName}>{post.author}</Text>
            <Text style={styles.authorBadge}>▌</Text>
          </View>
          <Text style={styles.postDate}>{post.date}</Text>
        </View>
      </Pressable>

      <Pressable onPress={onPressPost}>
        <FakeChart colors={post.chartColors} height={200} />
      </Pressable>

      <Pressable onPress={onPressPost}>
        <View style={styles.symbolRow}>
          <View style={[styles.symbolTag, { backgroundColor: `${post.symbolColor}18` }]}>
            <View style={[styles.symbolIcon, { backgroundColor: post.symbolColor }]}>
              <Text style={styles.symbolIconText}>
                {post.symbol.charAt(0)}
              </Text>
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
      </Pressable>

      <View style={styles.postActions}>
        <Animated.View style={{ transform: [{ scale: likeScale }] }}>
          <Pressable style={styles.actionBtn} onPress={handleLike}>
            <Heart
              size={18}
              color={liked ? Colors.red : Colors.textMuted}
              fill={liked ? Colors.red : 'none'}
            />
            <Text style={[styles.actionCount, liked && { color: Colors.red }]}>
              {post.likes + (liked ? 1 : 0)}
            </Text>
          </Pressable>
        </Animated.View>
        <Pressable style={styles.actionBtn} onPress={onPressComment}>
          <MessageCircle size={18} color={Colors.textMuted} />
          <Text style={styles.actionCount}>{post.comments}</Text>
        </Pressable>
        <Pressable style={styles.moreBtn}>
          <MoreHorizontal size={18} color={Colors.textMuted} />
        </Pressable>
      </View>
    </View>
  );
}

const followedAuthors = communityUsers.filter((u) => u.isFollowed).map((u) => u.name);

const stockSymbols = ['000001', '600519', '601318', '000858', '300750'];

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('recommended');
  const fabScale = useRef(new Animated.Value(1)).current;

  const tabs = [
    { id: 'recommended', label: '为您推荐' },
    { id: 'editors', label: '编辑精选' },
    { id: 'following', label: '正在关注' },
    { id: 'stocks', label: '🇨🇳 股票' },
  ];

  const handlePressUser = useCallback((author: string) => {
    const userId = authorUserMap[author];
    if (userId) {
      console.log(`[Community] Navigate to user profile: ${author} (${userId})`);
      router.push({ pathname: '/community/user-profile', params: { userId } } as never);
    }
  }, [router]);

  const handlePressPost = useCallback((postId: string) => {
    console.log(`[Community] Navigate to post detail: ${postId}`);
    router.push({ pathname: '/community/post-detail', params: { postId } } as never);
  }, [router]);

  const handlePressComment = useCallback((postId: string) => {
    console.log(`[Community] Navigate to post comments: ${postId}`);
    router.push({ pathname: '/community/post-detail', params: { postId } } as never);
  }, [router]);

  const handleCreatePost = useCallback(() => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Animated.sequence([
      Animated.timing(fabScale, { toValue: 0.85, duration: 80, useNativeDriver: true }),
      Animated.timing(fabScale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    console.log('[Community] Navigate to create post');
    router.push('/community/create-post' as never);
  }, [fabScale, router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>社区</Text>
        <View style={styles.headerRight}>
          <Pressable style={styles.headerBtn}>
            <Search size={22} color={Colors.textPrimary} />
          </Pressable>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>W</Text>
          </View>
        </View>
      </View>

      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => {
              setActiveTab(tab.id);
              if (Platform.OS !== 'web') {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
          >
            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.feed}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContent}
      >
        {(() => {
          let filtered = communityPosts;
          if (activeTab === 'editors') {
            filtered = communityPosts.filter((p) => p.likes >= 20);
          } else if (activeTab === 'following') {
            filtered = communityPosts.filter((p) => followedAuthors.includes(p.author));
          } else if (activeTab === 'stocks') {
            filtered = communityPosts.filter((p) => stockSymbols.includes(p.symbol));
          }
          if (filtered.length === 0) {
            return (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>
                  {activeTab === 'following' ? '还没有关注任何作者' : '暂无相关内容'}
                </Text>
                <Text style={styles.emptyDesc}>
                  {activeTab === 'following'
                    ? '关注感兴趣的交易者，他们的观点将显示在这里'
                    : '切换其他标签查看更多内容'}
                </Text>
              </View>
            );
          }
          return filtered.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={() => console.log(`[Community] Liked post by ${post.author}`)}
              onPressPost={() => handlePressPost(post.id)}
              onPressUser={() => handlePressUser(post.author)}
              onPressComment={() => handlePressComment(post.id)}
            />
          ));
        })()}
        <View style={{ height: 80 }} />
      </ScrollView>

      <Animated.View style={[styles.fabContainer, { transform: [{ scale: fabScale }] }]}>
        <Pressable style={styles.fab} onPress={handleCreatePost} testID="create-post-fab">
          <Plus size={24} color={Colors.white} strokeWidth={2.5} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#8B7E74',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700' as const,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  tabActive: {
    backgroundColor: Colors.textPrimary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textTertiary,
  },
  tabTextActive: {
    color: Colors.white,
  },
  feed: {
    flex: 1,
  },
  feedContent: {
    paddingHorizontal: 16,
  },
  postCard: {
    marginBottom: 24,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  postAuthorInfo: {
    flex: 1,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    fontSize: 15,
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
    marginTop: 2,
  },
  fakeChart: {
    borderRadius: 12,
    backgroundColor: '#1C1C2E',
    overflow: 'hidden',
    marginBottom: 10,
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
    height: 40,
    flexDirection: 'row',
    paddingHorizontal: 8,
    alignItems: 'flex-end',
  },
  chartOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    gap: 6,
  },
  chartSymbolTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  symbolDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  symbolTagText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '500' as const,
  },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  symbolTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  symbolIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbolIconText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700' as const,
  },
  symbolName: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  directionTag: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    lineHeight: 24,
    marginBottom: 10,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: Colors.textTertiary,
    textAlign: 'center' as const,
    lineHeight: 22,
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 24,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
});
