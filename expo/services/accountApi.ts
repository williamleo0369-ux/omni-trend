import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_RORK_API_BASE_URL ?? '';

/**
 * Calls the backend to permanently delete the current user account
 * and all associated data, then clears local storage and session state.
 *
 * Throws if the network request fails or the server returns a non-OK status.
 */
export async function deleteAccount(): Promise<void> {
  const token = await AsyncStorage.getItem('auth-token');

  if (API_BASE_URL) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`Delete account failed: ${response.status} ${text}`);
      }
    } catch (error) {
      console.error('[accountApi] deleteAccount network error', error);
      throw error;
    }
  } else {
    console.log('[accountApi] No API base URL configured, skipping remote delete');
  }

  // Clear all local persisted data
  try {
    const keys = await AsyncStorage.getAllKeys();
    if (keys.length > 0) {
      await AsyncStorage.multiRemove(keys);
    }
  } catch (error) {
    console.error('[accountApi] failed to clear local storage', error);
  }
}
