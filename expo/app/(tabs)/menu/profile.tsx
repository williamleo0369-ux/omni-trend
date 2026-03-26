import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { Users, UserCheck } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

type TabId = 'followers' | 'following';

export default function ProfileScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('followers');

  const handleTabSwitch = useCallback((tab: TabId) => {
    setActiveTab(tab);
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const handleExploreAuthors = useCallback(() => {
    router.push('/(tabs)/community');
    console.log('[Profile] Navigate to community to explore authors');
  }, [router]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'williamleo0369' }} />

      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tab, activeTab === 'followers' && styles.tabActive]}
          onPress={() => handleTabSwitch('followers')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'followers' ? styles.tabTextActive : styles.tabTextDim,
          ]}>
            粉丝
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'following' && styles.tabActive]}
          onPress={() => handleTabSwitch('following')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'following' ? styles.tabTextActive : styles.tabTextDim,
          ]}>
            正在关注
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'followers' ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Users size={48} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>还没有粉丝</Text>
            <Text style={styles.emptyDesc}>
              发表观点和分析，吸引志同道合的交易者关注你！
            </Text>
            <Pressable
              style={({ pressed }) => [styles.emptyBtn, pressed && styles.emptyBtnPressed]}
              onPress={handleExploreAuthors}
            >
              <Text style={styles.emptyBtnText}>发表观点</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <UserCheck size={48} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>你没有关注任何人</Text>
            <Text style={styles.emptyDesc}>
              关注交易者，了解他们的见解和最新动态。立即探索，掌握市场趋势并获得灵感！
            </Text>
            <Pressable
              style={({ pressed }) => [styles.emptyBtn, pressed && styles.emptyBtnPressed]}
              onPress={handleExploreAuthors}
            >
              <Text style={styles.emptyBtnText}>探索作者</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabActive: {
    backgroundColor: Colors.textPrimary,
  },
  tabInactive: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  tabTextActive: {
    color: Colors.white,
  },
  tabTextInactiveLabel: {
    color: Colors.textTertiary,
  },
  tabTextDim: {
    color: Colors.textTertiary,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingBottom: 80,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 14,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyBtn: {
    backgroundColor: Colors.textPrimary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 28,
  },
  emptyBtnPressed: {
    opacity: 0.85,
  },
  emptyBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700' as const,
  },
});
