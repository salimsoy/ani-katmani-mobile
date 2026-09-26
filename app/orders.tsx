import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { apiFetch } from '@/utils/api';
import { Package } from 'lucide-react-native';
import EmptyState from '@/components/EmptyState';

const STATUS_COLORS: Record<string, string> = {
  'Beklemede': '#ff9800',
  'Hazırlanıyor': '#2196f3',
  'Kargoda': '#9c27b0',
  'Teslim Edildi': '#27ae60',
  'İptal Edildi': '#e74c3c',
  'Sipariş Tamamlandı': '#999',
};

type Order = {
  id: number;
  totalPrice: number;
  overallStatus: string;
  createdAt: string;
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      apiFetch('/orders')
        .then(res => res.json())
        .then(data => {
          setOrders(data);
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

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<Package size={56} color="#ccc" />}
        title="Henüz hiç sipariş vermediniz"
        subtitle="Verdiğiniz siparişler burada görünecek"
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.orderCard}
            activeOpacity={0.8}
            onPress={() => router.navigate(`/order-detail/${item.id}`)}
          >
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>Sipariş #{item.id}</Text>
              <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[item.overallStatus] || '#999') + '22' }]}>
                <Text style={[styles.statusText, { color: STATUS_COLORS[item.overallStatus] || '#999' }]}>
                  {item.overallStatus}
                </Text>
              </View>
            </View>

            <Text style={styles.orderDate}>
              {new Date(item.createdAt).toLocaleDateString('tr-TR', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </Text>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Toplam</Text>
              <Text style={styles.orderTotal}>{item.totalPrice.toFixed(2)} ₺</Text>
            </View>

            <Text style={styles.detailLink}>Detayları Gör →</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingHorizontal: 20, paddingTop: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  orderCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginBottom: 12, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  orderId: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '600' },
  orderDate: { fontSize: 13, color: '#999', marginBottom: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  totalLabel: { fontSize: 14, color: '#999' },
  orderTotal: { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },
  detailLink: { fontSize: 13, color: '#ff6600', fontWeight: '600', marginTop: 10, textAlign: 'right' },
});