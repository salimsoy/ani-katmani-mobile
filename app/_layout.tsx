import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import 'react-native-reanimated';
import * as SecureStore from 'expo-secure-store';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    const checkToken = async () => {
      const token = await SecureStore.getItemAsync('token');
      const isGuest = await SecureStore.getItemAsync('isGuest');

      if (!token && !isGuest) {
        router.replace('/login');
      }
    };
    checkToken();
  }, []);

  // Native geri butonu yerine kendi butonumuz:
  // back() çalışmazsa dismissTo ile hedefe zorla döner
  const customBack = (fallback: '/admin' | '/(tabs)/profile') => () => (
    <TouchableOpacity
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      style={{ paddingRight: 8 }}
      onPress={() => {
        if (router.canGoBack()) router.back();
        else router.dismissTo(fallback);
      }}
    >
      <Ionicons name="chevron-back" size={28} color="#ff6600" />
    </TouchableOpacity>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="orders" options={{
          title: 'Siparişlerim',
          headerShown: true,
          headerBackTitle: 'Profil',
          headerTintColor: '#ff6600',
          headerTitleStyle: { fontWeight: '700' }
        }} />
        <Stack.Screen name="admin" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="checkout" options={{
          title: 'Teslimat Bilgileri',
          headerShown: true,
          headerBackTitle: 'Sepet',
          headerTintColor: '#ff6600',
          headerTitleStyle: { fontWeight: '700' }
        }} />
        <Stack.Screen name="admin-orders" options={{
          title: 'Sipariş Yönetimi',
          headerShown: true,
          headerTintColor: '#ff6600',
          headerTitleStyle: { fontWeight: '700' },
          headerLeft: customBack('/admin'),
        }} />
        <Stack.Screen name="admin-coupons" options={{
          title: 'Kupon Yönetimi',
          headerShown: true,
          headerTintColor: '#ff6600',
          headerTitleStyle: { fontWeight: '700' },
          headerLeft: customBack('/admin'),
        }} />
        <Stack.Screen name="order-detail/[id]" options={{
          headerShown: true,
          headerBackTitle: 'Siparişlerim',
          headerTintColor: '#ff6600',
          headerTitleStyle: { fontWeight: '700' }
        }} />
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
    </GestureHandlerRootView>
  );
}