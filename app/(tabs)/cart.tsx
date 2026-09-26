import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { AlertCircle } from 'lucide-react-native';

import { apiFetch } from '@/utils/api';
import { getLocalCart, updateLocalCartItem, removeFromLocalCart } from '@/utils/cart';
import { useCart } from '@/context/CartContext';

import CartItemCard from '@/components/CartItemCard';
import CartEmptyState from '@/components/CartEmptyState';
import CartSummary from '@/components/CartSummary';
import GuestLoginPrompt from '@/components/GuestLoginPrompt';

export default function CartScreen() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const router = useRouter();
  const { setItemCount } = useCart();

  const fetchCart = async () => {
    const token = await SecureStore.getItemAsync('token');
    if (!token) {
      setIsGuest(true);
      const localCart = await getLocalCart();
      const formatted = localCart.map((item, index) => ({
        id: index,
        figurineId: item.figurineId,
        quantity: item.quantity,
        figurine: item.figurine,
      }));
      setCartItems(formatted);
      setLoading(false);
    } else {
      setIsGuest(false);
      apiFetch('/cart')
        .then((res) => res.json())
        .then((data) => {
          setCartItems(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Sepet çekilemedi:', err);
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

  useEffect(() => {
    const total = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    setItemCount(total);
  }, [cartItems, setItemCount]);

  const updateQuantity = async (
    id: number,
    figurineId: number,
    currentQuantity: number,
    change: number
  ) => {
    const newQuantity = currentQuantity + change;

    if (isGuest) {
      // Misafir - client-side stok kontrolü
      if (change > 0) {
        const item = cartItems.find((c) => c.figurineId === figurineId);
        const stock = item?.figurine?.stock ?? Infinity;
        if (newQuantity > stock) {
          Alert.alert(
            'Yeterli Stok Yok',
            `Bu ürün için sadece ${stock} adet stokta var.`
          );
          return;
        }
      }
      await updateLocalCartItem(figurineId, newQuantity);
      fetchCart();
    } else {
      if (newQuantity <= 0) {
        removeFromCart(id, figurineId);
        return;
      }

      try {
        const res = await apiFetch(`/cart/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ quantity: newQuantity }),
        });

        if (res.ok) {
          fetchCart();
        } else {
          let errorMessage = 'Miktar güncellenemedi.';
          try {
            const data = await res.json();
            errorMessage = data.message || errorMessage;
          } catch {
            // JSON parse edilemezse varsayılan mesaj kalır
          }
          Alert.alert('Güncellenemedi', errorMessage);
        }
      } catch {
        Alert.alert('Hata', 'Sunucuya bağlanılamadı.');
      }
    }
  };

  const removeFromCart = async (id: number, figurineId: number) => {
    if (isGuest) {
      await removeFromLocalCart(figurineId);
      fetchCart();
    } else {
      apiFetch(`/cart/${id}`, { method: 'DELETE' }).then((res) => {
        if (res.ok) fetchCart();
      });
    }
  };

  const totalPrice = cartItems.reduce(
    (total, item) => total + (item.figurine?.price ?? 0) * item.quantity,
    0
  );

  // Sepette stok sorunu var mı?
  const hasStockIssues = cartItems.some((item) => {
    const stock = item.figurine?.stock ?? Infinity;
    return item.quantity > stock;
  });

  const handleCheckoutPress = () => {
    if (hasStockIssues) {
      Alert.alert(
        'Stok Sorunu',
        'Sepetinizde stok sorunu olan ürünler var. Devam etmeden önce miktarları düzenleyin veya ürünleri kaldırın.'
      );
      return;
    }
    router.push({
      pathname: '/checkout',
      params: { total: totalPrice.toFixed(2) },
    });
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
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Sepetim</Text>

        {cartItems.length === 0 ? (
          <CartEmptyState onBrowse={() => router.push('/(tabs)')} />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {cartItems.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                onUpdateQuantity={(change) =>
                  updateQuantity(item.id, item.figurineId, item.quantity, change)
                }
                onRemove={() => removeFromCart(item.id, item.figurineId)}
              />
            ))}

            <CartSummary itemCount={cartItems.length} totalPrice={totalPrice} />

            {hasStockIssues && (
              <View style={styles.stockWarningBox}>
                <AlertCircle size={18} color="#c0392b" />
                <Text style={styles.stockWarningText}>
                  Sepetinizde stok sorunu olan ürünler var. Devam etmeden önce miktarları
                  düzenleyin veya ürünleri kaldırın.
                </Text>
              </View>
            )}

            {isGuest ? (
              <GuestLoginPrompt onLogin={() => router.push('/login')} />
            ) : (
              <TouchableOpacity
                style={[styles.checkoutButton, hasStockIssues && styles.checkoutButtonDisabled]}
                onPress={handleCheckoutPress}
                activeOpacity={0.8}
                disabled={hasStockIssues}
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
  stockWarningBox: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: '#fdecea',
    borderWidth: 1,
    borderColor: '#f5c6cb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  stockWarningText: {
    flex: 1,
    fontSize: 13,
    color: '#c0392b',
    lineHeight: 18,
    fontWeight: '600',
  },
  checkoutButton: {
    backgroundColor: '#ff6600',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  checkoutButtonDisabled: { backgroundColor: '#bbb' },
  checkoutButtonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});