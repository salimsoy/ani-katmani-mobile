import { useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { apiFetch } from '@/utils/api';
import * as SecureStore from 'expo-secure-store';
import { getLocalCart, updateLocalCartItem, removeFromLocalCart } from '@/utils/cart';

export default function CartScreen() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const router = useRouter();

  const fetchCart = async () => {
    const token = await SecureStore.getItemAsync('token');
    if (!token) {
      setIsGuest(true);
      const localCart = await getLocalCart();
      const formatted = localCart.map((item, index) => ({
        id: index,
        figurineId: item.figurineId,
        quantity: item.quantity,
        figurine: item.figurine
      }));
      setCartItems(formatted);
      setLoading(false);
    } else {
      setIsGuest(false);
      apiFetch('/cart')
        .then(res => res.json())
        .then(data => {
          setCartItems(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Sepet çekilemedi:", err);
          setLoading(false);
        });
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchCart();
    }, [])
  );

  const updateQuantity = async (id: number, figurineId: number, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (isGuest) {
      await updateLocalCartItem(figurineId, newQuantity);
      fetchCart();
    } else {
      if (newQuantity <= 0) {
        removeFromCart(id, figurineId);
        return;
      }
      apiFetch(`/cart/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity: newQuantity })
      }).then(res => { if (res.ok) fetchCart(); });
    }
  };

  const removeFromCart = async (id: number, figurineId: number) => {
    if (isGuest) {
      await removeFromLocalCart(figurineId);
      fetchCart();
    } else {
      apiFetch(`/cart/${id}`, { method: 'DELETE' })
        .then(res => { if (res.ok) fetchCart(); });
    }
  };

  const totalPrice = cartItems.reduce((total, item) => total + (item.figurine?.price * item.quantity), 0);

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#ff6600" />
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Sepetim</Text>

        {cartItems.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyEmoji}>🛒</Text>
            <Text style={styles.emptyText}>Sepetiniz şu an boş</Text>
            <Text style={styles.emptySubText}>Figürlerimize göz atın</Text>
            <TouchableOpacity style={styles.browseButton} onPress={() => router.push('/(tabs)')}>
              <Text style={styles.browseButtonText}>Alışverişe Başla</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {cartItems.map((item, index) => (
              <View key={index} style={styles.cartCard}>
                <Image
                  source={{ uri: item.figurine?.imageUrl || 'https://via.placeholder.com/150' }}
                  style={styles.cartImage}
                />
                <View style={styles.cartDetails}>
                  <Text style={styles.itemName} numberOfLines={2}>{item.figurine?.name}</Text>
                  <Text style={styles.itemPrice}>{(item.figurine?.price * item.quantity).toFixed(2)} ₺</Text>
                  <Text style={styles.unitPrice}>{item.figurine?.price} ₺ / adet</Text>
                  <View style={styles.controlsRow}>
                    <View style={styles.quantityContainer}>
                      <TouchableOpacity style={styles.qtyButton} onPress={() => updateQuantity(item.id, item.figurineId, item.quantity, -1)}>
                        <Text style={styles.qtyButtonText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <TouchableOpacity style={styles.qtyButton} onPress={() => updateQuantity(item.id, item.figurineId, item.quantity, 1)}>
                        <Text style={styles.qtyButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.removeButton} onPress={() => removeFromCart(item.id, item.figurineId)}>
                      <Text style={styles.removeButtonText}>🗑 Kaldır</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>Sipariş Özeti</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Ürünler ({cartItems.length})</Text>
                <Text style={styles.summaryValue}>{totalPrice.toFixed(2)} ₺</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Kargo</Text>
                <Text style={[styles.summaryValue, { color: '#27ae60' }]}>Ücretsiz</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Toplam</Text>
                <Text style={styles.totalPrice}>{totalPrice.toFixed(2)} ₺</Text>
              </View>
            </View>

            {isGuest ? (
              <View style={styles.guestWarning}>
                <Text style={styles.guestEmoji}>🔐</Text>
                <Text style={styles.guestWarningTitle}>Giriş Yapmanız Gerekiyor</Text>
                <Text style={styles.guestWarningText}>Sipariş verebilmek için hesabınıza giriş yapın.</Text>
                <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
                  <Text style={styles.loginButtonText}>Giriş Yap</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={() => router.push({ pathname: '/checkout', params: { total: totalPrice.toFixed(2) } })}
                activeOpacity={0.8}
              >
                <Text style={styles.checkoutButtonText}>Siparişi Onayla →</Text>
              </TouchableOpacity>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingTop: 60, paddingHorizontal: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#1a1a1a', marginBottom: 20 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 22, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  emptySubText: { fontSize: 15, color: '#999', marginBottom: 24 },
  browseButton: { backgroundColor: '#ff6600', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12 },
  browseButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cartCard: {
    flexDirection: 'row', backgroundColor: '#fff',
    padding: 14, borderRadius: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  cartImage: { width: 85, height: 85, borderRadius: 12, backgroundColor: '#eee', marginRight: 14 },
  cartDetails: { flex: 1, justifyContent: 'center' },
  itemName: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginBottom: 2 },
  itemPrice: { fontSize: 16, fontWeight: '800', color: '#ff6600', marginBottom: 2 },
  unitPrice: { fontSize: 11, color: '#bbb', marginBottom: 8 },
  controlsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 8, padding: 2 },
  qtyButton: { width: 30, height: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', borderRadius: 6, elevation: 1 },
  qtyButtonText: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
  quantityText: { fontSize: 15, fontWeight: '700', minWidth: 30, textAlign: 'center' },
  removeButton: { paddingHorizontal: 8, paddingVertical: 4 },
  removeButtonText: { color: '#e74c3c', fontSize: 12, fontWeight: '600' },
  summaryBox: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginBottom: 20, marginTop: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: '#888' },
  summaryValue: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 12, marginTop: 4 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  totalPrice: { fontSize: 20, fontWeight: '800', color: '#ff6600' },
  checkoutButton: { backgroundColor: '#ff6600', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  checkoutButtonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  guestWarning: {
    backgroundColor: '#fff', padding: 24, borderRadius: 20,
    alignItems: 'center', marginTop: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  guestEmoji: { fontSize: 40, marginBottom: 12 },
  guestWarningTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  guestWarningText: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  loginButton: { backgroundColor: '#ff6600', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12 },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});