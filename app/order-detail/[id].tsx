import { useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useFocusEffect, useRouter, Stack } from 'expo-router';
import { AlertCircle, RotateCcw } from 'lucide-react-native';
import { apiFetch } from '@/utils/api';

type OrderItem = {
  id: number;
  figurineId: number;
  quantity: number;
  unitPrice: number;
  status: string;
  figurine: {
    name: string;
    imageUrl: string;
    filamentType: string;
    scale: string;
  };
};

type Order = {
  id: number;
  fullName: string;
  address: string;
  phoneNumber: string;
  totalPrice: number;
  discountAmount: number;
  createdAt: string;
  orderItems: OrderItem[];
};

const STATUS_COLORS: Record<string, string> = {
  'Beklemede': '#ff9800',
  'Hazırlanıyor': '#2196f3',
  'Kargoda': '#9c27b0',
  'Teslim Edildi': '#27ae60',
  'İptal Edildi': '#e74c3c',
  'Sipariş Tamamlandı': '#999',
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      apiFetch(`/orders/${id}`)
        .then(res => res.json())
        .then(data => {
          setOrder(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, [id])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff6600" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Sipariş bulunamadı.</Text>
      </View>
    );
  }

  const originalPrice = order.totalPrice + (order.discountAmount || 0);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: `Sipariş #${order.id}`,
          headerTintColor: '#ff6600',
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Tarih */}
        <View style={styles.statusCard}>
          <Text style={styles.orderDate}>
            {new Date(order.createdAt).toLocaleDateString('tr-TR', {
              day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </Text>
        </View>

        {/* Ürünler */}
        <Text style={styles.sectionTitle}>Ürünler</Text>
        {order.orderItems.map(item => (
          <View key={item.id} style={styles.itemCard}>
            <Image
              source={{ uri: item.figurine?.imageUrl || 'https://via.placeholder.com/100' }}
              style={styles.itemImage}
            />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName} numberOfLines={2}>{item.figurine?.name}</Text>
              <Text style={styles.itemMeta}>{item.figurine?.filamentType} • {item.figurine?.scale}</Text>
              <View style={[styles.itemStatusBadge, { backgroundColor: (STATUS_COLORS[item.status] || '#999') + '22' }]}>
                <Text style={[styles.itemStatusText, { color: STATUS_COLORS[item.status] || '#999' }]}>
                  {item.status}
                </Text>
              </View>
              <View style={styles.itemPriceRow}>
                <Text style={styles.itemQuantity}>{item.quantity} adet</Text>
                <Text style={styles.itemPrice}>{(item.unitPrice * item.quantity).toFixed(2)} ₺</Text>
              </View>

              <View style={styles.itemActionsRow}>
                <TouchableOpacity
                  style={styles.itemActionButton}
                  onPress={() =>
                    router.push({
                      pathname: '/complaint-new',
                      params: { orderItemId: String(item.id), figurineName: item.figurine?.name ?? 'Ürün' },
                    })
                  }
                >
                  <AlertCircle size={12} color="#999" />
                  <Text style={styles.itemActionText}>Sorun Bildir</Text>
                </TouchableOpacity>

                {item.status === 'Teslim Edildi' && (
                  <TouchableOpacity
                    style={styles.itemActionButton}
                    onPress={() =>
                      router.push({
                        pathname: '/return-new',
                        params: { orderItemId: String(item.id), figurineName: item.figurine?.name ?? 'Ürün' },
                      })
                    }
                  >
                    <RotateCcw size={12} color="#999" />
                    <Text style={styles.itemActionText}>İade Talebi</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        ))}

        {/* Teslimat Bilgileri */}
        <Text style={styles.sectionTitle}>Teslimat Bilgileri</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ad Soyad</Text>
            <Text style={styles.infoValue}>{order.fullName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Telefon</Text>
            <Text style={styles.infoValue}>{order.phoneNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Adres</Text>
            <Text style={[styles.infoValue, { flex: 1, textAlign: 'right' }]}>{order.address}</Text>
          </View>
        </View>

        {/* Fiyat Özeti */}
        <Text style={styles.sectionTitle}>Ödeme Özeti</Text>
        <View style={styles.infoCard}>
          {order.discountAmount > 0 && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ara Toplam</Text>
                <Text style={[styles.infoValue, styles.strikethrough]}>{originalPrice.toFixed(2)} ₺</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>İndirim</Text>
                <Text style={[styles.infoValue, { color: '#e74c3c' }]}>- {order.discountAmount.toFixed(2)} ₺</Text>
              </View>
            </>
          )}
          <View style={[styles.infoRow, { marginBottom: 0 }]}>
            <Text style={styles.totalLabel}>Toplam</Text>
            <Text style={styles.totalPrice}>{order.totalPrice.toFixed(2)} ₺</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingHorizontal: 20, paddingTop: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#999' },

  statusCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  orderDate: { fontSize: 13, color: '#999' },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 10, marginTop: 4 },

  itemCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 12,
    marginBottom: 10, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  itemImage: { width: 60, height: 60, borderRadius: 10, backgroundColor: '#eee', marginRight: 12 },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginBottom: 2 },
  itemMeta: { fontSize: 12, color: '#999', marginBottom: 6 },
  itemStatusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginBottom: 8 },
  itemStatusText: { fontSize: 11, fontWeight: '700' },
  itemPriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemActionsRow: { flexDirection: 'row', gap: 16, marginTop: 8 },
  itemActionButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  itemActionText: { fontSize: 11, fontWeight: '600', color: '#999' },
  itemQuantity: { fontSize: 13, color: '#888' },
  itemPrice: { fontSize: 14, fontWeight: '700', color: '#ff6600' },

  infoCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  infoLabel: { fontSize: 14, color: '#888' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  strikethrough: { textDecorationLine: 'line-through', color: '#bbb' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  totalPrice: { fontSize: 20, fontWeight: '800', color: '#ff6600' },
});