import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'http://192.168.1.53:5059';

// Aynı anda birden fazla istek 401 alırsa, hepsi tek bir refresh isteğini paylaşsın diye
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await SecureStore.getItemAsync('refreshToken');
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    await SecureStore.setItemAsync('token', data.accessToken);
    return data.accessToken as string;
  } catch {
    return null;
  }
}
async function clearAuthStorage() {
  await SecureStore.deleteItemAsync('token');
  await SecureStore.deleteItemAsync('refreshToken');
  await SecureStore.deleteItemAsync('userId');
  await SecureStore.deleteItemAsync('firstName');
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false
): Promise<Response> {
  const token = await SecureStore.getItemAsync('token');

  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Access token süresi dolmuş olabilir — bir kez yenilemeyi dene, sonra isteği tekrarla
  if (response.status === 401 && token && !isRetry) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }
    const newToken = await refreshPromise;

    if (newToken) {
      return apiFetch(endpoint, options, true);
    }

    // Refresh de başarısız oldu — oturum gerçekten bitmiş
    await clearAuthStorage();
    // Not: burada router.replace('/login') çağıramıyoruz çünkü bu bir hook değil,
    // çağıran ekranlar 401'i kendi response.ok kontrolünde fark edip yönlendirme yapmalı
  }

  return response;
}