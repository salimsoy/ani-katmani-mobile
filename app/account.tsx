import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect, Stack } from 'expo-router';
import { useState, useCallback } from 'react';
import { apiFetch } from '@/utils/api';
import { User, MapPin, ChevronRight } from 'lucide-react-native';

type CurrentUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};

export default function AccountScreen() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      apiFetch('/auth/me')
        .then(res => res.json())
        .then(setCurrentUser)
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff6600" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Bilgilerim', headerBackTitle: 'Profil', headerTintColor: '#ff6600' }} />

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
    </View>
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
});