import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { apiFetch } from '@/utils/api';
import { RotateCcw, ChevronRight } from 'lucide-react-native';
import EmptyState from '@/components/EmptyState';
import type { Return } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  'Talep Edildi': '#ff9800',
  'Onaylandı': '#2196f3',
  'Reddedildi': '#e74c3c',
  'Kargoya Verildi': '#9c27b0',
  'Satıcıya Ulaştı': '#3f51b5',
  'Ücret İadesi Yapıldı': '#27ae60',
};

export default function ReturnsScreen() {
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      apiFetch('/returns/mine')
        .then((res) => res.json())
        .then((data) => {
          setReturns(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff6600" />
      </View>
    );
  }

  if (returns.length === 0) {
    return (
      <EmptyState
        icon={<RotateCcw size={56} color="#ccc" />}
        title="Henüz iade talebiniz yok"
        subtitle="Oluşturduğunuz iade talepleri burada görünecek"
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={returns}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => router.navigate(`/return-detail/${item.id}`)}
          >
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.figurineName} numberOfLines={1}>{item.figurineName}</Text>
                <Text style={styles.orderId}>Sipariş #{item.orderId}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[item.status] || '#999') + '22' }]}>
                <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] || '#999' }]}>
                  {item.status}
                </Text>
              </View>
            </View>

            <View style={styles.tagsRow}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{item.reason}</Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{item.refundAmount.toFixed(2)} ₺</Text>
              </View>
            </View>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>
                {new Date(item.createdAt).toLocaleDateString('tr-TR', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </Text>
              <ChevronRight size={16} color="#ff6600" />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingHorizontal: 20, paddingTop: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginBottom: 12, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 8 },
  figurineName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  orderId: { fontSize: 13, color: '#999', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '700' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  tag: { backgroundColor: '#f0f0f0', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagText: { fontSize: 11, color: '#666', fontWeight: '600' },
  footerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0',
  },
  footerText: { fontSize: 12, color: '#999' },
});
