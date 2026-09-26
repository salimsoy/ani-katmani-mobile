import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { apiFetch } from '@/utils/api';
import * as SecureStore from 'expo-secure-store';

import StockBadge from '@/components/StockBadge';
import QuantitySelector from '@/components/QuantitySelector';
import ProductGallery from '@/components/ProductGallery';
import ProductInfoBox from '@/components/ProductInfoBox';
import AddToCartBar from '@/components/AddToCartBar';
import { useAddToCart } from '@/hooks/useAddToCart';

export default function FigurineDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [figurine, setFigurine] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const { addToCart, adding } = useAddToCart();

  useEffect(() => {
    setQuantity(1);
    setActiveImageIndex(0);
    apiFetch(`/figurines/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setFigurine(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Detay çekilemedi:', err);
        setLoading(false);
      });

    checkIfFavorite();
  }, [id]);

  const checkIfFavorite = async () => {
    const token = await SecureStore.getItemAsync('token');
    if (!token) return;

    apiFetch('/favorites')
      .then((res) => res.json())
      .then((favorites) => {
        const found = favorites.some((f: any) => f.figurineId === Number(id));
        setIsFavorite(found);
      })
      .catch(() => {});
  };

  const toggleFavorite = async () => {
    const token = await SecureStore.getItemAsync('token');
    if (!token) {
      router.push('/login');
      return;
    }

    setFavoriteLoading(true);

    if (isFavorite) {
      apiFetch(`/favorites/${id}`, { method: 'DELETE' })
        .then((res) => {
          if (res.ok) setIsFavorite(false);
          setFavoriteLoading(false);
        })
        .catch(() => setFavoriteLoading(false));
    } else {
      apiFetch('/favorites', {
        method: 'POST',
        body: JSON.stringify({ figurineId: Number(id) }),
      })
        .then((res) => {
          if (res.ok) setIsFavorite(true);
          setFavoriteLoading(false);
        })
        .catch(() => setFavoriteLoading(false));
    }
  };

  const handleAddToCart = () => {
    if (!figurine) return;
    addToCart(
      {
        id: figurine.id,
        name: figurine.name,
        price: figurine.price,
        filamentType: figurine.filamentType,
        scale: figurine.scale,
        imageUrl: figurine.imageUrl || '',
        stock: figurine.stock ?? 0,
      },
      quantity
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff6600" />
      </View>
    );
  }

  if (!figurine) {
    return (
      <View style={styles.center}>
        <Text>Figür bulunamadı!</Text>
      </View>
    );
  }

  const galleryImages: string[] = [
    figurine.imageUrl || 'https://via.placeholder.com/500x500?text=Resim+Yok',
    ...(figurine.images ?? []).map((img: any) => img.imageUrl),
  ];

  const stock = figurine.stock ?? 0;
  const outOfStock = stock === 0;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Ürün Detayı',
          headerBackTitle: 'Geri',
          headerTintColor: '#ff6600',
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <ProductGallery
          images={galleryImages}
          activeIndex={activeImageIndex}
          onActiveIndexChange={setActiveImageIndex}
          isFavorite={isFavorite}
          favoriteLoading={favoriteLoading}
          onToggleFavorite={toggleFavorite}
          outOfStock={outOfStock}
        />

        <View style={styles.detailsContainer}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{figurine.filamentType}</Text>
          </View>

          <Text style={styles.name}>{figurine.name}</Text>
          <Text style={styles.price}>{figurine.price} ₺</Text>

          <View style={{ marginTop: 8, marginBottom: 16 }}>
            <StockBadge stock={stock} />
          </View>

          <View style={styles.divider} />

          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Adet</Text>
            <QuantitySelector
              quantity={quantity}
              maxQuantity={stock}
              disabled={outOfStock}
              onChange={setQuantity}
            />
          </View>

          <ProductInfoBox
            filamentType={figurine.filamentType}
            scale={figurine.scale}
            printTimeInHours={figurine.printTimeInHours}
          />
        </View>
      </ScrollView>

      <AddToCartBar
        price={figurine.price}
        quantity={quantity}
        outOfStock={outOfStock}
        adding={adding}
        onAdd={handleAddToCart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  detailsContainer: { padding: 24 },
  name: { fontSize: 26, fontWeight: '800', color: '#1a1a1a', marginBottom: 8 },
  price: { fontSize: 26, fontWeight: '800', color: '#1a1a1a' },

  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff3e8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  categoryBadgeText: { fontSize: 12, fontWeight: '700', color: '#ff6600' },

  divider: { height: 1, backgroundColor: '#f0f0f0', marginBottom: 16 },

  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  quantityLabel: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
});