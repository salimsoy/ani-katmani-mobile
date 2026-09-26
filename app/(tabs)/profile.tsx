import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useState, useCallback } from 'react';
import { apiFetch } from '@/utils/api';
import { useFocusEffect } from 'expo-router';
import { Package, User, LogOut, ChevronRight, MessageSquare, RotateCcw } from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [orderCount, setOrderCount] = useState(0);
  
  const [isGuest, setIsGuest] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      SecureStore.getItemAsync('firstName').then(name => {
        if (!cancelled) setFirstName(name ?? '');
      });
      SecureStore.getItemAsync('token').then(token => {
        if (cancelled) return;
        if (!token) {
          setIsGuest(true);
          setOrderCount(0);
          return;
        }
        setIsGuest(false);
        apiFetch('/orders')
          .then(res => res.json())
          .then(data => {
            if (!cancelled) setOrderCount(data.length);
          })
          .catch(() => {});
      });

      return () => {
        cancelled = true;
      };
    }, [])
  );

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
            const refreshToken = await SecureStore.getItemAsync('refreshToken');
            if (refreshToken) {
              try {
                await apiFetch('/auth/logout', {
                  method: 'POST',
                  body: JSON.stringify({ refreshToken }),
                });
              } catch {
                // Backend'e ulaşılamasa bile local oturumu temizlemeye devam ediyoruz
              }
            }

            await SecureStore.deleteItemAsync('token');
            await SecureStore.deleteItemAsync('refreshToken');
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
            <Text style={styles.menuItemText}>Giriş Yap</Text>
            <ChevronRight size={20} color="#ff6600" />
            </TouchableOpacity>

            <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.navigate('/register')}
            >
            <Text style={styles.menuItemText}>Kayıt Ol</Text>
            <ChevronRight size={20} color="#ff6600" />
            </TouchableOpacity>
        </>
        ) : (
        // Login olmuş kullanıcı görünümü
        <>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.navigate('/orders')}
            >
            <View style={styles.menuItemLeft}>
              <Package size={20} color="#ff6600" />
              <Text style={styles.menuItemText}>Siparişlerim</Text>
            </View>
            <ChevronRight size={20} color="#ff6600" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.navigate('/account')}
            >
            <View style={styles.menuItemLeft}>
              <User size={20} color="#ff6600" />
              <Text style={styles.menuItemText}>Bilgilerim</Text>
            </View>
            <ChevronRight size={20} color="#ff6600" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.navigate('/complaints')}
            >
            <View style={styles.menuItemLeft}>
              <MessageSquare size={20} color="#ff6600" />
              <Text style={styles.menuItemText}>Şikayetlerim</Text>
            </View>
            <ChevronRight size={20} color="#ff6600" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.navigate('/returns')}
            >
            <View style={styles.menuItemLeft}>
              <RotateCcw size={20} color="#ff6600" />
              <Text style={styles.menuItemText}>İadelerim</Text>
            </View>
            <ChevronRight size={20} color="#ff6600" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={18} color="#fff" />
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
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  menuItemText: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  menuBadge: {
    backgroundColor: '#ff6600', width: 28, height: 28,
    borderRadius: 14, justifyContent: 'center', alignItems: 'center',
  },
  menuBadgeText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  logoutButton: {
    backgroundColor: '#e74c3c', paddingVertical: 16, borderRadius: 12,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
    marginTop: 'auto', marginBottom: 40,
  },
  logoutText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});