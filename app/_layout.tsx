import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import * as SecureStore from 'expo-secure-store';
import * as SplashScreen from 'expo-splash-screen';
import { CartProvider } from '@/context/CartContext';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Splash ekranının, biz hazır olduğumuzu söyleyene kadar açık kalmasını sağla
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        const token = await SecureStore.getItemAsync('token');
        const isGuest = await SecureStore.getItemAsync('isGuest');

        if (!token && !isGuest) {
          router.replace('/login');
        }

        // Splash ekranının en az 1.5 saniye görünmesini garanti et
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } finally {
        setAppIsReady(true);
      }
    };
    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <CartProvider>
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
        <Stack.Screen name="account" options={{
          title: 'Bilgilerim',
          headerShown: true,
          headerBackTitle: 'Profil',
          headerTintColor: '#ff6600',
          headerTitleStyle: { fontWeight: '700' }
        }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="checkout" options={{
          title: 'Teslimat Bilgileri',
          headerShown: true,
          headerBackTitle: 'Sepet',
          headerTintColor: '#ff6600',
          headerTitleStyle: { fontWeight: '700' }
        }} />
        <Stack.Screen name="order-detail/[id]" options={{
          headerShown: true,
          headerBackTitle: 'Siparişlerim',
          headerTintColor: '#ff6600',
          headerTitleStyle: { fontWeight: '700' }
        }} />
        <Stack.Screen name="complaints" options={{
          title: 'Şikayetlerim',
          headerShown: true,
          headerBackTitle: 'Profil',
          headerTintColor: '#ff6600',
          headerTitleStyle: { fontWeight: '700' }
        }} />
        <Stack.Screen name="complaint-new" options={{
          title: 'Şikayet Oluştur',
          headerShown: true,
          headerTintColor: '#ff6600',
          headerTitleStyle: { fontWeight: '700' }
        }} />
        <Stack.Screen name="complaint-detail/[id]" options={{
          headerShown: true,
          headerBackTitle: 'Şikayetlerim',
          headerTintColor: '#ff6600',
          headerTitleStyle: { fontWeight: '700' }
        }} />
        <Stack.Screen name="returns" options={{
          title: 'İadelerim',
          headerShown: true,
          headerBackTitle: 'Profil',
          headerTintColor: '#ff6600',
          headerTitleStyle: { fontWeight: '700' }
        }} />
        <Stack.Screen name="return-new" options={{
          title: 'İade Talebi Oluştur',
          headerShown: true,
          headerTintColor: '#ff6600',
          headerTitleStyle: { fontWeight: '700' }
        }} />
        <Stack.Screen name="return-detail/[id]" options={{
          headerShown: true,
          headerBackTitle: 'İadelerim',
          headerTintColor: '#ff6600',
          headerTitleStyle: { fontWeight: '700' }
        }} />
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
    </CartProvider>
    </GestureHandlerRootView>
  );
}