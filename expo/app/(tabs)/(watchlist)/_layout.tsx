import { Stack } from 'expo-router';
import Colors from '@/constants/colors';

export default function WatchlistLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.white },
        headerTintColor: Colors.textPrimary,
        headerTitleStyle: { fontWeight: '700' as const },
        contentStyle: { backgroundColor: Colors.background },
        headerBackTitle: '返回',
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="stock-detail" options={{ title: '股票详情' }} />
      <Stack.Screen name="global-trend" options={{ headerShown: true, title: '' }} />
    </Stack>
  );
}
