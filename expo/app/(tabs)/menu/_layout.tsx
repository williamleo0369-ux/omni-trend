import { Stack } from 'expo-router';
import Colors from '@/constants/colors';

export default function MenuLayout() {
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
      <Stack.Screen name="settings" options={{ title: '系统设置' }} />
      <Stack.Screen name="alerts" options={{ title: '预警通知' }} />
      <Stack.Screen name="profile" options={{ title: 'williamleo0369' }} />
    </Stack>
  );
}
