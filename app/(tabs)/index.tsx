// 1. React (Çekirdek kütüphane)
import { useState, useEffect, useCallback } from 'react';

// 2. React Native (Bileşenler ve araçlar)
import {
  View, Text, FlatList, ActivityIndicator, StyleSheet,
  Image, TouchableOpacity, StatusBar, Dimensions, TextInput
} from 'react-native';

// 3. Üçüncü Parti Kütüphaneler (Expo vb.)
import { useRouter, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

// 4. Yerel Dosyalar ve Araçlar
import { apiFetch } from '@/utils/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 20 padding her iki yandan + 8 gap ortada


type Figurine = {
  id: number;
  name: string;
  price: number;
  filamentType: string;
  scale: string;
  printTimeInHours: number;
  imageUrl: string;
};

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [figurines, setFigurines] = useState<Figurine[]>([]);
  const [firstName, setFirstName] = useState('');
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Tümü');
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const filters = ['Tümü', 'Reçine', 'PLA'];

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      
      SecureStore.getItemAsync('firstName').then(name => {
        if (name) setFirstName(name);
      });

      apiFetch('/figurines')
        .then(res => res.json())
        .then(data => {
          setFigurines(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Hata:", err);
          setLoading(false);
        });

      // Favori ID'lerini çek
      SecureStore.getItemAsync('token').then(token => {
        if (!token) {
          setFavoriteIds([]);
          return;
        }
        apiFetch('/favorites')
          .then(res => res.json())
          .then(data => {
            setFavoriteIds(data.map((f: any) => f.figurineId));
          })
          .catch(() => {});
      });
    }, [])
  );
  const toggleFavorite = async (figurineId: number) => {
    const token = await SecureStore.getItemAsync('token');

    if (!token) {
      router.push('/login');
      return;
    }

    const isFav = favoriteIds.includes(figurineId);

    if (isFav) {
      apiFetch(`/favorites/${figurineId}`, { method: 'DELETE' })
        .then(res => {
          if (res.ok) {
            setFavoriteIds(prev => prev.filter(id => id !== figurineId));
          }
        });
    } else {
      apiFetch('/favorites', {
        method: 'POST',
        body: JSON.stringify({ figurineId })
      })
        .then(res => {
          if (res.ok) {
            setFavoriteIds(prev => [...prev, figurineId]);
          }
        });
    }
  };
  

  const filteredFigurines = figurines.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesFilter = selectedFilter === 'Tümü' || item.filamentType === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff6600" />
      </View>
    );
  }


  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Merhaba, {firstName || 'Misafir'} 👋</Text>
          <Text style={styles.headerTitle}>Anı Katmanı 3D</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {firstName ? firstName[0].toUpperCase() : '?'}
          </Text>
        </View>
      </View>

      <Text style={styles.subtitle}>Sana özel 3D figürler</Text>

      {/* Arama Kutusu */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Figür ara..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#bbb"
        />
      </View>

      {/* Filtre Butonları */}
      <View style={styles.filterRow}>
        {filters.map(filter => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterButton, selectedFilter === filter && styles.filterButtonActive]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text style={[styles.filterButtonText, selectedFilter === filter && styles.filterButtonTextActive]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Grid Listesi */}
      <FlatList
        data={filteredFigurines}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.9}
          onPress={() => router.push(`/${item.id}`)}
        >
          <Image
            source={{ uri: item.imageUrl || 'https://via.placeholder.com/300x300?text=Resim+Yok' }}
            style={styles.cardImage}
            resizeMode="cover"
          />

          {/* Favori Butonu - sol üst */}
          <TouchableOpacity
            style={styles.favoriteIconButton}
            onPress={(e) => {
              e.stopPropagation();
              toggleFavorite(item.id);
            }}
          >
            <Text style={styles.favoriteIconText}>
              {favoriteIds.includes(item.id) ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>

          {/* Filament Badge - sağ üst */}
          <View style={styles.floatingBadge}>
            <Text style={styles.floatingBadgeText}>{item.filamentType}</Text>
          </View>

          {/* Kart İçeriği */}
          <View style={styles.cardContent}>
            <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.price}>{item.price} ₺</Text>
            <Text style={styles.metaText}>📐 {item.scale}</Text>
          </View>
        </TouchableOpacity>
      )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingTop: 56, paddingHorizontal: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  greeting: { fontSize: 14, color: '#999', fontWeight: '500' },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#1a1a1a', letterSpacing: 0.3 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#ff6600',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#aaa', marginBottom: 20, marginTop: 2 },

  // Grid
  row: { justifyContent: 'space-between', marginBottom: 12 },

  // Kart
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: CARD_WIDTH, // Kare görünüm
    backgroundColor: '#eeeeee',
  },

  // Resim üzerindeki badge
  floatingBadge: {
    position: 'absolute',
    top: 8, left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  floatingBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  // Kart içeriği
  cardContent: { padding: 10 },
  name: { fontSize: 13, fontWeight: '700', color: '#1a1a1a', marginBottom: 4, lineHeight: 18 },
  price: { fontSize: 15, fontWeight: '800', color: '#ff6600', marginBottom: 4 },
  metaText: { fontSize: 11, color: '#aaa' },
  searchContainer: {
  backgroundColor: '#fff',
  borderRadius: 12,
  paddingHorizontal: 14,
  marginBottom: 10,
  borderWidth: 1,
  borderColor: '#e0e0e0',
  elevation: 2,
},
  searchInput: {
    fontSize: 15,
    color: '#1a1a1a',
    paddingVertical: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonActive: {
    backgroundColor: '#ff6600',
    borderColor: '#ff6600',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  favoriteIconButton: {
    position: 'absolute',
    top: 8, right: 8,
    width: 30, height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center', alignItems: 'center',
    zIndex: 10,
  },
  favoriteIconText: { fontSize: 15 },
});