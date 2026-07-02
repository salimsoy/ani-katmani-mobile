import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'http://192.168.1.53:5059';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = await SecureStore.getItemAsync('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}