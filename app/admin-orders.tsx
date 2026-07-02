import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { apiFetch } from '@/utils/api';

type OrderItem = {
  id: number;
  quantity: number;
  unitPrice: number;
  figurine: { name: string };
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
  user?: { email: string };
};

const STATUS_OPTIONS = ['Beklemede', 'Hazırlanıyor', 'Kargoda', 'Teslim Edildi'];

const STATUS_COLORS: Record<string, string> = {
  'Beklemede': '#ff9800',
  'Hazırlanıyor': '#2196f3',
  'Kargoda': '#9c27b0',
  'Teslim Edildi': '#27ae60',
};

export default function AdminOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    apiFetch('/orders/admin')
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

    const updateStatus = async (orderId: number, newStatus: string) => {
        const response = await apiFetch(`/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            // Tüm listeyi yeniden çekme — sadece o siparişi güncelle
            setOrders(prevOrders =>
            prevOrders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            )
            );
        } else {
            Alert.alert('Hata', 'Durum güncellenemedi.');
        }
        };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#ff6600" /></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Sipariş Yönetimi</Text>

      {orders.length === 0 ? (
        <Text style={styles.emptyText}>Henüz sipariş yok.</Text>
      ) : (
        orders.map(order => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>Sipariş #{order.id}</Text>
              <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[order.status] || '#999') + '22' }]}>
                <Text style={[styles.statusText, { color: STATUS_COLORS[order.status] || '#999' }]}>
                  {order.status}
                </Text>
              </View>
            </View>

            <Text style={styles.customerName}>{order.fullName}</Text>
            <Text style={styles.customerInfo}>{order.phoneNumber}</Text>
            <Text style={styles.customerInfo}>{order.address}</Text>
            {order.user?.email && <Text style={styles.customerEmail}>{order.user.email}</Text>}

            <View style={styles.divider} />

            {order.orderItems.map(item => (
              <Text key={item.id} style={styles.itemText}>
                • {item.figurine?.name} x{item.quantity} — {(item.unitPrice * item.quantity).toFixed(2)} ₺
              </Text>
            ))}

            <Text style={styles.orderTotal}>Toplam: {order.totalPrice.toFixed(2)} ₺</Text>

            <View style={styles.divider} />

            {/* Durum Değiştirme Butonları */}
            <Text style={styles.statusLabel}>Durumu Değiştir:</Text>
            <View style={styles.statusButtons}>
              {STATUS_OPTIONS.map(status => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusButton,
                    order.status === status && { backgroundColor: STATUS_COLORS[status], borderColor: STATUS_COLORS[status] }
                  ]}
                  onPress={() => updateStatus(order.id, status)}
                >
                  <Text style={[
                    styles.statusButtonText,
                    order.status === status && { color: '#fff' }
                  ]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingHorizontal: 20, paddingTop: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', marginBottom: 16 },
  emptyText: { fontSize: 16, color: '#999', textAlign: 'center', marginTop: 40 },
  orderCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderId: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '700' },
  customerName: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 2 },
  customerInfo: { fontSize: 13, color: '#888', marginBottom: 1 },
  customerEmail: { fontSize: 13, color: '#ff6600', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 12 },
  itemText: { fontSize: 14, color: '#4a4a4a', marginBottom: 4 },
  orderTotal: { fontSize: 16, fontWeight: '800', color: '#1a1a1a', marginTop: 8 },
  statusLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 8 },
  statusButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusButton: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
    borderWidth: 1, borderColor: '#e0e0e0', backgroundColor: '#fff',
  },
  statusButtonText: { fontSize: 12, fontWeight: '600', color: '#888' },
});