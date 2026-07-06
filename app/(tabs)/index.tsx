// 1. React (Çekirdek kütüphane)
import { useState, useEffect, useCallback, useRef } from 'react';

// 2. React Native (Bileşenler ve araçlar)
import {
  View, Text, FlatList, ActivityIndicator, StyleSheet,
  Image, TouchableOpacity, StatusBar, Dimensions, TextInput
} from 'react-native';

// 3. Üçüncü Parti Kütüphaneler (Expo vb.)
import { useRouter, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import BottomSheet from '@gorhom/bottom-sheet';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react-native';

// 4. Yerel Dosyalar ve Araçlar
import { apiFetch } from '@/utils/api';
import FilterBottomSheet from '@/components/FilterBottomSheet';
import SortBottomSheet, { SortOption } from '@/components/SortBottomSheet';
import { Keyboard } from 'react-native';

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
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const filters = ['Tümü', 'Reçine', 'PLA'];

  // Filtre/Sıralama için bottom sheet ref'leri
  const filterBottomSheetRef = useRef<BottomSheet>(null);
  const sortBottomSheetRef = useRef<BottomSheet>(null);

  // Panel içindeki geçici değerler (henüz uygulanmamış)
  const [selectedFilter, setSelectedFilter] = useState('Tümü');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('default');

  // Gerçekten uygulanan değerler (listeye yansıyan)
  const [appliedFilter, setAppliedFilter] = useState('Tümü');
  const [appliedMinPrice, setAppliedMinPrice] = useState('');
  const [appliedMaxPrice, setAppliedMaxPrice] = useState('');
  const [appliedSort, setAppliedSort] = useState<SortOption>('default');

  // Animasyon değerleri
  const filterScale = useSharedValue(1);
  const sortScale = useSharedValue(1);

  const filterAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: filterScale.value }],
  }));
  const sortAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sortScale.value }],
  }));

  const handleFilterPressIn = () => { filterScale.value = withSpring(0.95); };
  const handleFilterPressOut = () => { filterScale.value = withSpring(1); };
  const handleSortPressIn = () => { sortScale.value = withSpring(0.95); };
  const handleSortPressOut = () => { sortScale.value = withSpring(1); };

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
  

  const filteredFigurines = figurines
    .filter(item => {
      const searchLower = searchText.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(searchLower) ||
        item.filamentType.toLowerCase().includes(searchLower);
      const matchesFilter = appliedFilter === 'Tümü' || item.filamentType === appliedFilter;
      const matchesMinPrice = !appliedMinPrice || item.price >= parseFloat(appliedMinPrice);
      const matchesMaxPrice = !appliedMaxPrice || item.price <= parseFloat(appliedMaxPrice);
      return matchesSearch && matchesFilter && matchesMinPrice && matchesMaxPrice;
    })
    .sort((a, b) => {
      switch (appliedSort) {
        case 'priceAsc': return a.price - b.price;
        case 'priceDesc': return b.price - a.price;
        case 'nameAsc': return a.name.localeCompare(b.name);
        default: return 0;
      }
  });

  const handleApplyFilters = () => {
    setAppliedFilter(selectedFilter);
    setAppliedMinPrice(minPrice);
    setAppliedMaxPrice(maxPrice);
    filterBottomSheetRef.current?.close();
  };

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
    setAppliedSort(option);
  };

  const handleResetFilters = () => {
    setSelectedFilter('Tümü');
    setMinPrice('');
    setMaxPrice('');
    setAppliedFilter('Tümü');
    setAppliedMinPrice('');
    setAppliedMaxPrice('');
  };

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
      <View style={styles.filterSortRow}>
        <Animated.View style={[{ flex: 1 }, filterAnimatedStyle]}>
          <TouchableOpacity
            style={styles.filterSortButton}
            onPress={() => {
              Keyboard.dismiss();
              filterBottomSheetRef.current?.expand();
            }}
            onPressIn={handleFilterPressIn}
            onPressOut={handleFilterPressOut}
            activeOpacity={1}
          >
            <SlidersHorizontal size={16} color="#1a1a1a" />
            <Text style={styles.filterSortButtonText}>Filtrele</Text>
            {(appliedFilter !== 'Tümü' || appliedMinPrice || appliedMaxPrice) && (
              <View style={styles.activeDot} />
            )}
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[{ flex: 1 }, sortAnimatedStyle]}>
          <TouchableOpacity
            style={styles.filterSortButton}
            onPress={() => {
              Keyboard.dismiss();
              sortBottomSheetRef.current?.expand();
            }}
            onPressIn={handleSortPressIn}
            onPressOut={handleSortPressOut}
            activeOpacity={1}
          >
            <ArrowUpDown size={16} color="#1a1a1a" />
            <Text style={styles.filterSortButtonText}>Sırala</Text>
            {appliedSort !== 'default' && <View style={styles.activeDot} />}
          </TouchableOpacity>
        </Animated.View>
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

      <FilterBottomSheet
        ref={filterBottomSheetRef}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onMinPriceChange={setMinPrice}
        onMaxPriceChange={setMaxPrice}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      <SortBottomSheet
        ref={sortBottomSheetRef}
        sortOption={sortOption}
        onSortChange={handleSortChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingTop: 50, paddingHorizontal: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  greeting: { fontSize: 12, color: '#999', fontWeight: '500' },
  headerTitle: { fontSize: 21, fontWeight: '800', color: '#1a1a1a', letterSpacing: 0.3 },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#ff6600',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 15, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 12, color: '#aaa', marginBottom: 20, marginTop: 2 },

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
  filterOpenButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', paddingVertical: 12, borderRadius: 12,
    borderWidth: 1, borderColor: '#e0e0e0', marginBottom: 16,
  },
  filterOpenButtonText: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  filterSortRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  filterSortButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', paddingVertical: 12, borderRadius: 12,
    borderWidth: 1, borderColor: '#e0e0e0', gap: 6,
  },
  filterSortButtonText: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  activeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#ff6600', marginLeft: 2 },
});