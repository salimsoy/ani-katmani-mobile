import { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { apiFetch } from '@/utils/api';
import * as SecureStore from 'expo-secure-store';
import { addToLocalCart } from '@/utils/cart';

export default function FigurineDetail() {
  const { id } = useLocalSearchParams();
  const [figurine, setFigurine] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    apiFetch(`/figurines/${id}`)
      .then(res => res.json())
      .then(data => {
        setFigurine(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Detay çekilemedi:", err);
        setLoading(false);
      });

    checkIfFavorite();
  }, [id]);

  const checkIfFavorite = async () => {
    const token = await SecureStore.getItemAsync('token');
    if (!token) return;

    apiFetch('/favorites')
      .then(res => res.json())
      .then(favorites => {
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
        .then(res => {
          if (res.ok) setIsFavorite(false);
          setFavoriteLoading(false);
        })
        .catch(() => setFavoriteLoading(false));
    } else {
      apiFetch('/favorites', {
        method: 'POST',
        body: JSON.stringify({ figurineId: Number(id) })
      })
        .then(res => {
          if (res.ok) setIsFavorite(true);
          setFavoriteLoading(false);
        })
        .catch(() => setFavoriteLoading(false));
    }
  };

  const addToCart = async () => {
    const token = await SecureStore.getItemAsync('token');

    if (token) {
      apiFetch('/cart', {
        method: 'POST',
        body: JSON.stringify({
          figurineId: Number(id),
          quantity: quantity
        }),
      })
        .then(res => {
          if (res.status === 201) {
            alert('Ürün sepetinize başarıyla eklendi! 🎉');
          } else {
            alert('Sepete eklenirken bir hata oluştu.');
          }
        })
        .catch(() => alert('Sunucuya bağlanılamadı.'));
    } else {
      await addToLocalCart({
        figurineId: Number(id),
        quantity: quantity,
        figurine: {
          id: figurine.id,
          name: figurine.name,
          price: figurine.price,
          filamentType: figurine.filamentType,
          scale: figurine.scale,
          imageUrl: figurine.imageUrl || ''
        }
      });
      alert('Ürün sepetinize eklendi! 🎉');
    }
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

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Ürün Detayı',
          headerBackTitle: 'Geri',
          headerTintColor: '#ff6600'
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Ürün Görseli + Favori Butonu */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: figurine.imageUrl || 'https://via.placeholder.com/500x500?text=Resim+Yok' }}
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={toggleFavorite}
            disabled={favoriteLoading}
          >
            <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.detailsContainer}>
          {/* Kategori Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{figurine.filamentType}</Text>
          </View>

          <Text style={styles.name}>{figurine.name}</Text>

          <Text style={styles.price}>{figurine.price} ₺</Text>

          <View style={styles.divider} />

          {/* Adet Seçici */}
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Adet</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => setQuantity(q => Math.max(1, q - 1))}
              >
                <Text style={styles.qtyButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => setQuantity(q => q + 1)}
              >
                <Text style={styles.qtyButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Üretim Teknik Detayları */}
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>Ürün Detayları</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🛠 Malzeme</Text>
              <Text style={styles.infoValue}>{figurine.filamentType}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📐 Ölçek</Text>
              <Text style={styles.infoValue}>{figurine.scale}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>⏱ Üretim Süresi</Text>
              <Text style={styles.infoValue}>{figurine.printTimeInHours} Saat</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Alt Sabit Sepete Ekle Barı */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomBarLabel}>Toplam</Text>
          <Text style={styles.bottomBarPrice}>{(figurine.price * quantity).toFixed(2)} ₺</Text>
          <Text style={styles.bottomBarCalc}>{quantity} x {figurine.price} ₺</Text>
        </View>
        <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={addToCart}>
          <Text style={styles.buttonText}>Sepete Ekle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  imageContainer: { position: 'relative' },
  image: { width: '100%', height: 380, backgroundColor: '#eeeeee' },
  favoriteButton: {
    position: 'absolute',
    top: 16, right: 16,
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center', alignItems: 'center',
    elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4,
  },
  favoriteIcon: { fontSize: 22 },

  detailsContainer: { padding: 24 },
  name: { fontSize: 26, fontWeight: '800', color: '#1a1a1a', marginBottom: 8 },

  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff3e8',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, marginBottom: 10,
  },
  categoryBadgeText: { fontSize: 12, fontWeight: '700', color: '#ff6600' },

  stockRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  stockDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#27ae60', marginRight: 6 },
  stockText: { fontSize: 13, color: '#27ae60', fontWeight: '600' },

  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 16 },
  price: { fontSize: 26, fontWeight: '800', color: '#1a1a1a' },
  priceNote: { fontSize: 12, color: '#999' },

  divider: { height: 1, backgroundColor: '#f0f0f0', marginBottom: 16 },

  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  quantityLabel: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 4,
  },
  qtyButton: {
    width: 36, height: 36,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 1,
  },
  qtyButtonText: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a' },
  qtyValue: { fontSize: 18, fontWeight: '700', minWidth: 40, textAlign: 'center' },

  infoBox: {
    backgroundColor: '#f8f9fa',
    padding: 16, borderRadius: 12,
    borderWidth: 1, borderColor: '#eeeeee'
  },
  infoBoxTitle: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginBottom: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  infoLabel: { fontSize: 14, color: '#888' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderTopWidth: 1, borderTopColor: '#f0f0f0',
    elevation: 10,
  },
  bottomBarLabel: { fontSize: 12, color: '#999' },
  bottomBarPrice: { fontSize: 20, fontWeight: '800', color: '#1a1a1a' },
  button: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 14, paddingHorizontal: 28,
    borderRadius: 12,
  },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  bottomBarCalc: { fontSize: 11, color: '#bbb', marginTop: 2 },
});