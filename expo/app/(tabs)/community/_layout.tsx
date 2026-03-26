import { Stack } from 'expo-router';
import Colors from '@/constants/colors';

export default function CommunityLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.white },
        headerTintColor: Colors.textPrimary,
        contentStyle: { backgroundColor: Colors.white },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="post-detail" options={{ headerShown: true, title: '' }} />
      <Stack.Screen name="user-profile" options={{ headerShown: true, title: '' }} />
      <Stack.Screen name="create-post" options={{ headerShown: true, title: '发表观点' }} />
    </Stack>
  );
}
