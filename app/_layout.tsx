import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
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
          headerBackTitle: 'Admin',
          headerTintColor: '#ff6600',
          headerTitleStyle: { fontWeight: '700' }
        }} />
      </Stack>
      
      <StatusBar style="auto" />
    </ThemeProvider>
    </GestureHandlerRootView>
  );
}
