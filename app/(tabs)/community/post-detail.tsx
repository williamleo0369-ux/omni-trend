import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform, Animated, TextInput, KeyboardAvoidingView,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, Heart, MessageCircle, MoreHorizontal, TrendingUp, TrendingDown, Send, UserPlus, UserCheck } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { communityPosts, postComments } from '@/mocks/market';
import { PostComment } from '@/types/market';

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

function CommentItem({ comment, onLike, onUserPress, onFollow }: {
  comment: PostComment;
  onLike: () => void;
  onUserPress: (userId: string) => void;
  onFollow: (userId: string) => void;
}) {
  const [liked, setLiked] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);
  const likeScale = useRef(new Animated.Value(1)).current;

  const handleLike = useCallback(() => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setLiked((prev) => !prev);
    Animated.sequence([
      Animated.timing(likeScale, { toValue: 1.3, duration: 80, useNativeDriver: true }),
      Animated.timing(likeScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    onLike();
  }, [likeScale, onLike]);

  const handleFollow = useCallback(() => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsFollowed((prev) => !prev);
    onFollow(comment.userId);
  }, [comment.userId, onFollow]);

  return (
    <View style={styles.commentItem}>
      <Pressable onPress={() => onUserPress(comment.userId)}>
        <View style={[styles.commentAvatar, { backgroundColor: comment.avatarColor }]}>
          <Text style={styles.commentAvatarText}>{comment.avatarText}</Text>
        </View>
      </Pressable>
      <View style={styles.commentBody}>
        <View style={styles.commentTopRow}>
          <Pressable onPress={() => onUserPress(comment.userId)}>
            <Text style={styles.commentUserName}>{comment.userName}</Text>
          </Pressable>
          <Text style={styles.commentDate}>{comment.date}</Text>
        </View>
        <Text style={styles.commentContent}>{comment.content}</Text>
        <View style={styles.commentActionsRow}>
          <Animated.View style={{ transform: [{ scale: likeScale }] }}>
            <Pressable style={styles.commentAction} onPress={handleLike}>
              <Heart
                size={14}
                color={liked ? Colors.red : Colors.textMuted}
                fill={liked ? Colors.red : 'none'}
              />
              <Text style={[styles.commentActionText, liked && { color: Colors.red }]}>
                {comment.likes + (liked ? 1 : 0)}
              </Text>
            </Pressable>
          </Animated.View>
          <Pressable style={styles.commentAction} onPress={handleFollow}>
            {isFollowed ? (
              <UserCheck size={14} color={Colors.accent} />
            ) : (
              <UserPlus size={14} color={Colors.textMuted} />
            )}
            <Text style={[styles.commentActionText, isFollowed && { color: Colors.accent }]}>
              {isFollowed ? '已关注' : '关注'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function PostDetailScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [localComments, setLocalComments] = useState<PostComment[]>(() =>
    postComments.filter((c) => c.postId === postId)
  );
  const likeScale = useRef(new Animated.Value(1)).current;
  const sendScale = useRef(new Animated.Value(1)).current;

  const post = communityPosts.find((p) => p.id === postId);

  const authorUserMap: Record<string, string> = {
    'KakarottoGoku': 'u1', 'Angel-btctrader': 'u2', 'TraderWang88': 'u3',
    'QuantMaster': 'u4', 'CryptoNinja': 'u5',
  };

  const handleLikePost = useCallback(() => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setLiked((prev) => !prev);
    Animated.sequence([
      Animated.timing(likeScale, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.timing(likeScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    console.log(`[PostDetail] Liked post ${postId}`);
  }, [likeScale, postId]);

  const handleSendComment = useCallback(() => {
    if (!commentText.trim()) return;
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Animated.sequence([
      Animated.timing(sendScale, { toValue: 0.85, duration: 60, useNativeDriver: true }),
      Animated.timing(sendScale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    const newComment: PostComment = {
      id: `new-${Date.now()}`,
      postId: postId ?? '',
      userId: 'me',
      userName: '我',
      avatarColor: '#8B7E74',
      avatarText: 'W',
      content: commentText.trim(),
      date: '刚刚',
      likes: 0,
    };
    setLocalComments((prev) => [...prev, newComment]);
    setCommentText('');
    console.log(`[PostDetail] Sent comment on post ${postId}: ${newComment.content}`);
  }, [commentText, postId, sendScale]);

  const navigateToUser = useCallback((userId: string) => {
    router.push({ pathname: '/community/user-profile', params: { userId } } as never);
  }, [router]);

  if (!post) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: '帖子', headerShown: true }} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>帖子不存在</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
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
        }}
      />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Pressable
          style={styles.postHeader}
          onPress={() => {
            const uid = authorUserMap[post.author];
            if (uid) navigateToUser(uid);
          }}
        >
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

        <FakeChart colors={post.chartColors} height={220} />

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
          <Animated.View style={{ transform: [{ scale: likeScale }] }}>
            <Pressable style={styles.actionBtn} onPress={handleLikePost}>
              <Heart
                size={20}
                color={liked ? Colors.red : Colors.textMuted}
                fill={liked ? Colors.red : 'none'}
              />
              <Text style={[styles.actionCount, liked && { color: Colors.red }]}>
                {post.likes + (liked ? 1 : 0)}
              </Text>
            </Pressable>
          </Animated.View>
          <View style={styles.actionBtn}>
            <MessageCircle size={20} color={Colors.textMuted} />
            <Text style={styles.actionCount}>{localComments.length}</Text>
          </View>
          <Pressable style={styles.moreBtn}>
            <MoreHorizontal size={20} color={Colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.commentDivider} />

        <Text style={styles.commentSectionTitle}>评论 ({localComments.length})</Text>

        {localComments.length === 0 ? (
          <View style={styles.noComments}>
            <Text style={styles.noCommentsText}>暂无评论，快来发表第一条吧</Text>
          </View>
        ) : (
          localComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onLike={() => console.log(`[PostDetail] Liked comment ${comment.id}`)}
              onUserPress={navigateToUser}
              onFollow={(uid) => console.log(`[PostDetail] Follow user ${uid}`)}
            />
          ))
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={styles.inputBar}>
        <TextInput
          style={styles.commentInput}
          placeholder="写评论..."
          placeholderTextColor={Colors.textMuted}
          value={commentText}
          onChangeText={setCommentText}
          multiline
          maxLength={500}
          testID="comment-input"
        />
        <Animated.View style={{ transform: [{ scale: sendScale }] }}>
          <Pressable
            style={[styles.sendBtn, commentText.trim() ? styles.sendBtnActive : null]}
            onPress={handleSendComment}
            disabled={!commentText.trim()}
          >
            <Send size={18} color={commentText.trim() ? Colors.white : Colors.textMuted} />
          </Pressable>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
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
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 4,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: Colors.white,
    fontSize: 18,
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
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  authorBadge: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  postDate: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  fakeChart: {
    borderRadius: 14,
    backgroundColor: '#1C1C2E',
    overflow: 'hidden',
    marginBottom: 12,
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
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    lineHeight: 26,
    marginBottom: 14,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  actionCount: {
    fontSize: 14,
    color: Colors.textTertiary,
    fontWeight: '600' as const,
    fontVariant: ['tabular-nums'] as const,
  },
  moreBtn: {
    marginLeft: 'auto',
    padding: 4,
  },
  commentDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 16,
  },
  commentSectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  commentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  commentAvatarText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700' as const,
  },
  commentBody: {
    flex: 1,
  },
  commentTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  commentDate: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  commentContent: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginBottom: 8,
  },
  commentActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentActionText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500' as const,
  },
  noComments: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  noCommentsText: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    backgroundColor: Colors.white,
    gap: 10,
  },
  commentInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
    maxHeight: 100,
    minHeight: 40,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnActive: {
    backgroundColor: Colors.accent,
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
});
