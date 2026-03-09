import { Stack } from 'expo-router';
import Colors from '@/constants/colors';

export default function ExploreLayout() {
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
      <Stack.Screen name="search" options={{ title: '搜索' }} />
      <Stack.Screen name="news" options={{ title: '新闻' }} />
      <Stack.Screen name="calendar" options={{ title: '经济日历' }} />
      <Stack.Screen name="brokers" options={{ title: '经纪商' }} />
    </Stack>
  );
}
