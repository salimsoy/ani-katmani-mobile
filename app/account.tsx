import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect, Stack } from 'expo-router';
import { useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiFetch } from '@/utils/api';
import { User, MapPin, ChevronRight, Lock, Eye, EyeOff } from 'lucide-react-native';

type CurrentUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};

const MIN_PASSWORD_LENGTH = 6;

export default function AccountScreen() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      apiFetch('/auth/me')
        .then(res => res.json())
        .then(setCurrentUser)
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [])
  );

  const handleChangePassword = async () => {
    setPasswordError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Tüm alanları doldurun.');
      return;
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(`Yeni şifre en az ${MIN_PASSWORD_LENGTH} karakter olmalı.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Yeni şifreler eşleşmiyor.');
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordError('Yeni şifre mevcut şifreden farklı olmalı.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setPasswordError(data?.message ?? 'Şifre değiştirilemedi.');
        setSubmitting(false);
        return;
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess('Şifreniz değiştirildi. Güvenliğiniz için tekrar giriş yapmanız gerekiyor...');

      // Backend şifre değişince tüm oturumları geçersiz kılıyor — local oturumu temizleyip girişe yönlendir
      setTimeout(async () => {
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('refreshToken');
        await SecureStore.deleteItemAsync('userId');
        await SecureStore.deleteItemAsync('firstName');
        router.replace('/login');
      }, 2000);
    } catch {
      setPasswordError('Sunucuya bağlanılamadı.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff6600" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: 'Bilgilerim', headerBackTitle: 'Profil', headerTintColor: '#ff6600' }} />

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        {currentUser && (
          <View style={styles.userCard}>
            <View style={styles.userAvatar}>
              <User size={22} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>
                {currentUser.firstName} {currentUser.lastName}
              </Text>
              <Text style={styles.userEmail}>{currentUser.email}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.menuItem} onPress={() => router.navigate('/addresses')}>
          <View style={styles.menuItemLeft}>
            <MapPin size={20} color="#ff6600" />
            <Text style={styles.menuItemText}>Adreslerim</Text>
          </View>
          <ChevronRight size={20} color="#ff6600" />
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.menuItemLeft}>
              <Lock size={20} color="#ff6600" />
              <Text style={styles.menuItemText}>Şifre Değiştir</Text>
            </View>
            <TouchableOpacity onPress={() => setShowPasswords(prev => !prev)} hitSlop={10}>
              {showPasswords ? <EyeOff size={20} color="#999" /> : <Eye size={20} color="#999" />}
            </TouchableOpacity>
          </View>

          {passwordSuccess ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>{passwordSuccess}</Text>
            </View>
          ) : (
            <>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Mevcut şifre"
                placeholderTextColor="#aaa"
                secureTextEntry={!showPasswords}
                autoCapitalize="none"
                textContentType="password"
              />
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder={`Yeni şifre (en az ${MIN_PASSWORD_LENGTH} karakter)`}
                placeholderTextColor="#aaa"
                secureTextEntry={!showPasswords}
                autoCapitalize="none"
                textContentType="newPassword"
              />
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Yeni şifre (tekrar)"
                placeholderTextColor="#aaa"
                secureTextEntry={!showPasswords}
                autoCapitalize="none"
                textContentType="newPassword"
              />

              {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}

              <TouchableOpacity
                style={[styles.submitButton, submitting && { opacity: 0.6 }]}
                onPress={handleChangePassword}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Şifreyi Güncelle</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingTop: 20, paddingHorizontal: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  userCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  userAvatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#ff6600',
    justifyContent: 'center', alignItems: 'center',
  },
  userName: { fontSize: 15, fontWeight: '800', color: '#1a1a1a' },
  userEmail: { fontSize: 13, color: '#999', marginTop: 1 },
  menuItem: {
    backgroundColor: '#fff', padding: 16, borderRadius: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 12, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6,
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  menuItemText: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  card: {
    backgroundColor: '#fff', padding: 16, borderRadius: 14, marginBottom: 12, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  input: {
    borderWidth: 1, borderColor: '#eee', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#1a1a1a',
    backgroundColor: '#fafafa', marginBottom: 10,
  },
  errorText: { color: '#e53935', fontSize: 13, marginBottom: 10 },
  submitButton: {
    backgroundColor: '#ff6600', borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', marginTop: 4,
  },
  submitButtonText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  successBox: { backgroundColor: '#e8f5e9', borderRadius: 12, padding: 12 },
  successText: { color: '#2e7d32', fontSize: 14, fontWeight: '600' },
});
