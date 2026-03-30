import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { Clock, WifiOff, RefreshCw } from 'lucide-react-native';
import Colors from '@/constants/colors';

export type MarketStatus = 'open' | 'closed' | 'error' | 'loading';

interface MarketStatusBannerProps {
  status: MarketStatus;
  onRetry?: () => void;
}

export function isUSMarketOpen(): boolean {
  const now = new Date();
  const utcDay = now.getUTCDay();
  if (utcDay === 0 || utcDay === 6) return false;

  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  const totalMinutes = utcHours * 60 + utcMinutes;

  const marketOpenUTC = 13 * 60 + 30;
  const marketCloseUTC = 20 * 60;

  return totalMinutes >= marketOpenUTC && totalMinutes < marketCloseUTC;
}

export default function MarketStatusBanner({ status, onRetry }: MarketStatusBannerProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === 'open') {
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
      return;
    }

    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();

    if (status === 'error') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.6, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [status, fadeAnim, pulseAnim]);

  if (status === 'open' || status === 'loading') return null;

  const isClosed = status === 'closed';
  const bgColor = isClosed ? '#FFF8E1' : '#FFF0F0';
  const borderColor = isClosed ? '#FFE082' : '#FFCDD2';
  const iconColor = isClosed ? '#F59E0B' : '#F04438';
  const textColor = isClosed ? '#7B6B2E' : '#C62828';
  const subtitleColor = isClosed ? '#A09060' : '#E57373';

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, backgroundColor: bgColor, borderColor }]}>
      <View style={styles.content}>
        <Animated.View style={{ opacity: status === 'error' ? pulseAnim : 1 }}>
          {isClosed ? (
            <Clock size={20} color={iconColor} />
          ) : (
            <WifiOff size={20} color={iconColor} />
          )}
        </Animated.View>
        <View style={styles.textWrap}>
          <Text style={[styles.title, { color: textColor }]}>
            {isClosed ? 'Market Closed' : 'Data Unavailable'}
          </Text>
          <Text style={[styles.subtitle, { color: subtitleColor }]}>
            {isClosed
              ? 'US market hours: Mon–Fri 9:30 AM – 4:00 PM ET'
              : 'Please check your connection'}
          </Text>
        </View>
        {status === 'error' && onRetry && (
          <Pressable onPress={onRetry} style={styles.retryBtn} testID="retry-btn">
            <RefreshCw size={16} color={Colors.accent} />
          </Pressable>
        )}
      </View>
      <Text style={[styles.note, { color: subtitleColor }]}>
        {isClosed
          ? 'Showing last available data'
          : 'Showing cached data · Pull to refresh'}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500' as const,
  },
  retryBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  note: {
    fontSize: 11,
    marginTop: 8,
    fontWeight: '400' as const,
    fontStyle: 'italic' as const,
  },
});
