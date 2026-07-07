import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/utils/api';

export default function ProfileScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [orderCount, setOrderCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync('firstName').then(name => {
      if (name) setFirstName(name);
    });
    SecureStore.getItemAsync('isAdmin').then(val => {
      if (val === 'true') setIsAdmin(true);
    });
    SecureStore.getItemAsync('token').then(token => {
      if (!token) {
        setIsGuest(true);
        return;
      }
      apiFetch('/orders')
        .then(res => res.json())
        .then(data => setOrderCount(data.length))
        .catch(() => {});
    });
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            await SecureStore.deleteItemAsync('token');
            await SecureStore.deleteItemAsync('userId');
            await SecureStore.deleteItemAsync('firstName');
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
        {/* Profil Başlığı */}
        <View style={styles.header}>
        <View style={styles.avatar}>
            <Text style={styles.avatarText}>
            {isGuest ? '?' : (firstName ? firstName[0].toUpperCase() : '?')}
            </Text>
        </View>
        <Text style={styles.name}>
            {isGuest ? 'Misafir Kullanıcı' : `Merhaba, ${firstName || 'Kullanıcı'}!`}
        </Text>
        </View>

        {isGuest ? (
        // Misafir görünümü
        <>
            <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.navigate('/login')}
            >
            <Text style={styles.menuItemText}>🔐 Giriş Yap</Text>
            <Text style={{ color: '#ff6600', fontSize: 18 }}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.navigate('/register')}
            >
            <Text style={styles.menuItemText}>✨ Kayıt Ol</Text>
            <Text style={{ color: '#ff6600', fontSize: 18 }}>→</Text>
            </TouchableOpacity>
        </>
        ) : (
        // Login olmuş kullanıcı görünümü
        <>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.navigate('/orders')}
            >
            <Text style={styles.menuItemText}>📦 Siparişlerim</Text>
            <Text style={{ color: '#ff6600', fontSize: 18 }}>→</Text>
            </TouchableOpacity>

            {isAdmin && (
            <TouchableOpacity
                style={[styles.menuItem, { backgroundColor: '#1a1a1a' }]}
                onPress={() => router.navigate('/admin')}
            >
                <Text style={[styles.menuItemText, { color: '#fff' }]}>⚙️ Admin Paneli</Text>
                <Text style={{ color: '#ff6600', fontSize: 18 }}>→</Text>
            </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Çıkış Yap</Text>
            </TouchableOpacity>
        </>
        )}
    </View>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingTop: 60, paddingHorizontal: 20 },
  header: { alignItems: 'center', marginBottom: 32 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#ff6600',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  name: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  menuItem: {
    backgroundColor: '#fff', padding: 16, borderRadius: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 12, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6,
  },
  menuItemText: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  menuBadge: {
    backgroundColor: '#ff6600', width: 28, height: 28,
    borderRadius: 14, justifyContent: 'center', alignItems: 'center',
  },
  menuBadgeText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  logoutButton: {
    backgroundColor: '#e74c3c', paddingVertical: 16, borderRadius: 12,
    alignItems: 'center', marginTop: 'auto', marginBottom: 40,
  },
  logoutText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});