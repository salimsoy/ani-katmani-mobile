import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { apiFetch } from '@/utils/api';

type OrderItem = {
  id: number;
  figurineId: number;
  quantity: number;
  unitPrice: number;
  figurine: { name: string; imageUrl: string };
};

type Order = {
  id: number;
  fullName: string;
  address: string;
  phoneNumber: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  orderItems: OrderItem[];
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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
      <View style={styles.center}>
        <Text style={styles.emptyText}>Henüz hiç sipariş vermediniz.</Text>
      </View>
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
          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>Sipariş #{item.id}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>

            <Text style={styles.orderDate}>
              {new Date(item.createdAt).toLocaleDateString('tr-TR', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </Text>

            {item.orderItems.map(oi => (
              <Text key={oi.id} style={styles.orderItem}>
                • {oi.figurine?.name} x{oi.quantity} — {oi.unitPrice * oi.quantity} ₺
              </Text>
            ))}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Toplam</Text>
              <Text style={styles.orderTotal}>{item.totalPrice} ₺</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingHorizontal: 20, paddingTop: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#999' },
  orderCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginBottom: 12, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  orderId: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  statusBadge: { backgroundColor: '#fff3e0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '600', color: '#ff6600' },
  orderDate: { fontSize: 13, color: '#999', marginBottom: 10 },
  orderItem: { fontSize: 14, color: '#4a4a4a', marginBottom: 4 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  totalLabel: { fontSize: 14, color: '#999' },
  orderTotal: { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },
});