import { useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Image, TouchableOpacity, TextInput } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { apiFetch } from '@/utils/api';
import { Heart, Search } from 'lucide-react-native';
import EmptyState from '@/components/EmptyState';

type FavoriteItem = {
  id: number;
  figurineId: number;
  figurine: {
    id: number;
    name: string;
    price: number;
    filamentType: string;
    scale: string;
    imageUrl: string;
  } | null;
};

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const router = useRouter();

  const fetchFavorites = () => {
    setLoading(true);
    apiFetch('/favorites')
      .then(res => res.json())
      .then(data => {
        setFavorites(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [])
  );

  const removeFavorite = (figurineId: number) => {
    apiFetch(`/favorites/${figurineId}`, { method: 'DELETE' })
      .then(res => {
        if (res.ok) {
          setFavorites(prev => prev.filter(f => f.figurineId !== figurineId));
        }
      });
  };

  const filteredFavorites = favorites.filter(item => {
    const searchLower = searchText.toLowerCase();
    return item.figurine?.name.toLowerCase().includes(searchLower) ||
           item.figurine?.filamentType.toLowerCase().includes(searchLower);
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff6600" />
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.pageTitle}>Favorilerim</Text>
        <EmptyState
          icon={<Heart size={56} color="#ccc" />}
          title="Henüz favori ürününüz yok"
          subtitle="Beğendiğiniz ürünlere kalp ikonuna dokunun"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Favorilerim</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Favorilerimde ara..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#bbb"
        />
      </View>

      {filteredFavorites.length === 0 ? (
        <EmptyState
          icon={<Search size={56} color="#ccc" />}
          title="Arama sonucu bulunamadı"
          subtitle="Farklı bir kelime deneyin"
        />
      ) : (
        <FlatList
          data={filteredFavorites}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => router.push(`/${item.figurineId}`)}
            >
              <Image
                source={{ uri: item.figurine?.imageUrl || 'https://via.placeholder.com/150' }}
                style={styles.image}
              />
              <View style={styles.details}>
                <Text style={styles.name} numberOfLines={2}>
                  {item.figurine?.name || 'Bu ürün artık mevcut değil'}
                </Text>
                {item.figurine && (
                  <>
                    <Text style={styles.price}>{item.figurine.price} ₺</Text>
                    <Text style={styles.meta}>{item.figurine.filamentType} • {item.figurine.scale}</Text>
                  </>
                )}
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeFavorite(item.figurineId)}
              >
                <Heart size={20} color="#e74c3c" fill="#e74c3c" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingHorizontal: 20, paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa', paddingHorizontal: 40 },
  card: {
    flexDirection: 'row', backgroundColor: '#fff',
    padding: 12, borderRadius: 16, marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  image: { width: 70, height: 70, borderRadius: 12, backgroundColor: '#eee', marginRight: 14 },
  details: { flex: 1 },
  name: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  price: { fontSize: 15, fontWeight: '800', color: '#ff6600', marginBottom: 2 },
  meta: { fontSize: 12, color: '#999' },
  removeButton: { padding: 8 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a1a', marginBottom: 16 },
  searchContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
  },
  searchInput: {
    fontSize: 15,
    color: '#1a1a1a',
    paddingVertical: 12,
  },
});