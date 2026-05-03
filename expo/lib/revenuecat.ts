import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

export const PRO_ENTITLEMENT_ID = 'pro';

function getRCToken(): string | undefined {
  if (Platform.OS === 'web') {
    return undefined;
  }
  return Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
    default: undefined,
  });
}

let configured = false;

export function configureRevenueCat(): void {
  if (configured) return;
  if (Platform.OS === 'web') {
    console.log('[RevenueCat] Skipping configuration on web');
    return;
  }
  const apiKey = getRCToken();
  if (!apiKey) {
    console.log('[RevenueCat] Missing API key for platform', Platform.OS);
    return;
  }
  try {
    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN);
    Purchases.configure({ apiKey });
    configured = true;
    console.log('[RevenueCat] Configured for', Platform.OS);
  } catch (err) {
    console.log('[RevenueCat] Configure error:', err);
  }
}

configureRevenueCat();
