import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { GlobalTickerItem } from '@/types/market';

const ITEM_WIDTH = 145;

function TickerItem({ item }: { item: GlobalTickerItem }) {
  const isPositive = item.changePercent >= 0;
  const changeColor = isPositive ? Colors.red : Colors.green;

  const formatPrice = (price: number) => {
    if (price >= 10000) return price.toLocaleString('en-US', { maximumFractionDigits: 0 });
    if (price >= 100) return price.toFixed(2);
    if (price >= 10) return price.toFixed(3);
    return price.toFixed(3);
  };

  const categoryColors: Record<string, string> = {
    index: '#1A73E8',
    crypto: '#F7931A',
    futures: '#C8902E',
    forex: '#2E7D32',
  };

  return (
    <View style={tickerItemStyles.container}>
      <View style={[tickerItemStyles.categoryDot, { backgroundColor: categoryColors[item.category] || Colors.accent }]} />
      <View style={tickerItemStyles.content}>
        <Text style={tickerItemStyles.code}>{item.code}</Text>
        <Text style={tickerItemStyles.price}>{formatPrice(item.price)}</Text>
      </View>
      <View style={tickerItemStyles.changeWrap}>
        {isPositive ? (
          <ArrowUpRight size={10} color={changeColor} />
        ) : (
          <ArrowDownRight size={10} color={changeColor} />
        )}
        <Text style={[tickerItemStyles.changeText, { color: changeColor }]}>
          {isPositive ? '+' : ''}{item.changePercent.toFixed(2)}%
        </Text>
      </View>
    </View>
  );
}

const tickerItemStyles = StyleSheet.create({
  container: {
    width: ITEM_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 6,
  },
  categoryDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  content: {
    gap: 1,
  },
  code: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  price: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    fontVariant: ['tabular-nums'] as const,
  },
  changeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
    marginLeft: 'auto',
  },
  changeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    fontVariant: ['tabular-nums'] as const,
  },
});

interface GlobalTickerProps {
  items: GlobalTickerItem[];
}

function GlobalTicker({ items }: GlobalTickerProps) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  const totalWidth = items.length * ITEM_WIDTH;

  const startAnimation = useCallback(() => {
    scrollX.setValue(0);
    animRef.current = Animated.loop(
      Animated.timing(scrollX, {
        toValue: -totalWidth,
        duration: items.length * 4000,
        useNativeDriver: true,
        isInteraction: false,
      })
    );
    animRef.current.start();
  }, [scrollX, totalWidth, items.length]);

  useEffect(() => {
    startAnimation();
    return () => {
      if (animRef.current) {
        animRef.current.stop();
      }
    };
  }, [startAnimation]);

  const doubledItems = [...items, ...items];

  return (
    <View style={styles.tickerContainer}>
      <View style={styles.tickerInner}>
        <Animated.View
          style={[
            styles.tickerTrack,
            {
              transform: [{ translateX: scrollX }],
              width: totalWidth * 2,
            },
          ]}
        >
          {doubledItems.map((item, index) => (
            <TickerItem key={`${item.id}-${index}`} item={item} />
          ))}
        </Animated.View>
      </View>
      <View style={styles.leftFade} pointerEvents="none" />
      <View style={styles.rightFade} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  tickerContainer: {
    height: 36,
    backgroundColor: '#0D1117',
    overflow: 'hidden',
    position: 'relative',
  },
  tickerInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tickerTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
  },
  leftFade: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 20,
    backgroundColor: 'transparent',
  },
  rightFade: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 20,
    backgroundColor: 'transparent',
  },
});

export default React.memo(GlobalTicker);
