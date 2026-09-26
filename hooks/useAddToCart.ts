import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { apiFetch } from '@/utils/api';
import { addToLocalCart } from '@/utils/cart';
import { useCart } from '@/context/CartContext';

interface AddToCartFigurine {
  id: number;
  name: string;
  price: number;
  filamentType: string;
  scale: string;
  imageUrl: string;
  stock: number;
}

export function useAddToCart() {
  const router = useRouter();
  const { refreshCartCount } = useCart();
  const [adding, setAdding] = useState(false);

  async function addToCart(figurine: AddToCartFigurine, quantity: number) {
    setAdding(true);
    const token = await SecureStore.getItemAsync('token');

    try {
      if (token) {
        // Üye - backend'e istek at
        const res = await apiFetch('/cart', {
          method: 'POST',
          body: JSON.stringify({
            figurineId: figurine.id,
            quantity,
          }),
        });

        if (res.status === 201) {
          refreshCartCount();
          showSuccessAlert(router);
        } else {
          let errorMessage = 'Sepete eklenirken bir hata oluştu.';
          try {
            const data = await res.json();
            errorMessage = data.message || errorMessage;
          } catch {
            // JSON parse edilemezse varsayılan mesaj kalır
          }
          Alert.alert('Sepete Eklenemedi', errorMessage);
        }
      } else {
        // Misafir - client-side stok kontrolü
        if (quantity > (figurine.stock ?? 0)) {
          Alert.alert(
            'Yeterli Stok Yok',
            `'${figurine.name}' için sadece ${figurine.stock} adet stokta var.`
          );
          return;
        }

        await addToLocalCart({
          figurineId: figurine.id,
          quantity,
          figurine: {
            id: figurine.id,
            name: figurine.name,
            price: figurine.price,
            filamentType: figurine.filamentType,
            scale: figurine.scale,
            imageUrl: figurine.imageUrl || '',
          },
        });
        await refreshCartCount();
        showSuccessAlert(router);
      }
    } catch {
      Alert.alert('Hata', 'Sunucuya bağlanılamadı.');
    } finally {
      setAdding(false);
    }
  }

  return { addToCart, adding };
}

function showSuccessAlert(router: ReturnType<typeof useRouter>) {
  Alert.alert('Sepete Eklendi', 'Ürün sepetinize başarıyla eklendi.', [
    { text: 'Alışverişe Devam Et', style: 'cancel' },
    {
      text: 'Sepete Git',
      onPress: () => router.navigate('/(tabs)/cart'),
    },
  ]);
}