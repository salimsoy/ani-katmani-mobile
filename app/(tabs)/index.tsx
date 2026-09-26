import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Keyboard,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import BottomSheet from '@gorhom/bottom-sheet';

import { apiFetch } from '@/utils/api';
import FilterBottomSheet from '@/components/FilterBottomSheet';
import SortBottomSheet, { SortOption } from '@/components/SortBottomSheet';
import HomeHeader from '@/components/HomeHeader';
import SearchBar from '@/components/SearchBar';
import FilterSortBar from '@/components/FilterSortBar';
import FigurineCard, { Figurine } from '@/components/FigurineCard';

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [figurines, setFigurines] = useState<Figurine[]>([]);
  const [firstName, setFirstName] = useState('');
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  const filterBottomSheetRef = useRef<BottomSheet>(null);
  const sortBottomSheetRef = useRef<BottomSheet>(null);

  const [selectedFilter, setSelectedFilter] = useState('Tümü');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('default');

  const [appliedFilter, setAppliedFilter] = useState('Tümü');
  const [appliedMinPrice, setAppliedMinPrice] = useState('');
  const [appliedMaxPrice, setAppliedMaxPrice] = useState('');
  const [appliedSort, setAppliedSort] = useState<SortOption>('default');

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchFigurines = async (
    pageToFetch: number,
    isNewSearch: boolean,
    searchOverride?: string
  ) => {
    if (isNewSearch) setLoading(true);
    else setLoadingMore(true);

    const effectiveSearch = searchOverride !== undefined ? searchOverride : searchText;

    const params = new URLSearchParams();
    if (effectiveSearch) params.append('search', effectiveSearch);
    if (appliedFilter !== 'Tümü') params.append('filamentType', appliedFilter);
    if (appliedMinPrice) params.append('minPrice', appliedMinPrice);
    if (appliedMaxPrice) params.append('maxPrice', appliedMaxPrice);
    if (appliedSort !== 'default') params.append('sortBy', appliedSort);
    params.append('page', pageToFetch.toString());
    params.append('pageSize', '20');

    try {
      const res = await apiFetch(`/figurines?${params.toString()}`);
      const data = await res.json();

      setFigurines((prev) => {
        const updated = isNewSearch ? data.items : [...prev, ...data.items];
        setHasMore(updated.length < data.totalCount);
        return updated;
      });

      setPage(pageToFetch);
    } catch (err) {
      console.error('Figürinler çekilemedi:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearch = () => {
    Keyboard.dismiss();
    fetchFigurines(1, true);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFigurines(1, true);
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilter, appliedMinPrice, appliedMaxPrice, appliedSort]);

  useFocusEffect(
    useCallback(() => {
      SecureStore.getItemAsync('firstName').then((name) => {
        if (name) setFirstName(name);
      });

      SecureStore.getItemAsync('token').then((token) => {
        if (!token) {
          setFavoriteIds([]);
          return;
        }
        apiFetch('/favorites')
          .then((res) => res.json())
          .then((data) => {
            setFavoriteIds(data.map((f: any) => f.figurineId));
          })
          .catch(() => {});
      });
    }, [])
  );

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchFigurines(page + 1, false);
    }
  };

  const toggleFavorite = async (figurineId: number) => {
    const token = await SecureStore.getItemAsync('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const isFav = favoriteIds.includes(figurineId);

    if (isFav) {
      apiFetch(`/favorites/${figurineId}`, { method: 'DELETE' }).then((res) => {
        if (res.ok) setFavoriteIds((prev) => prev.filter((id) => id !== figurineId));
      });
    } else {
      apiFetch('/favorites', {
        method: 'POST',
        body: JSON.stringify({ figurineId }),
      }).then((res) => {
        if (res.ok) setFavoriteIds((prev) => [...prev, figurineId]);
      });
    }
  };

  const handleApplyFilters = () => {
    Keyboard.dismiss();
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

  const hasActiveFilter =
    appliedFilter !== 'Tümü' || !!appliedMinPrice || !!appliedMaxPrice;
  const hasActiveSort = appliedSort !== 'default';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <HomeHeader firstName={firstName} />

      <SearchBar
        value={searchText}
        onChangeText={setSearchText}
        onSubmit={handleSearch}
        onClear={() => fetchFigurines(1, true, '')}
      />

      <FilterSortBar
        hasActiveFilter={hasActiveFilter}
        hasActiveSort={hasActiveSort}
        onFilterPress={() => filterBottomSheetRef.current?.expand()}
        onSortPress={() => sortBottomSheetRef.current?.expand()}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#ff6600" />
        </View>
      ) : (
        <FlatList
          data={figurines}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color="#ff6600" style={{ margin: 20 }} />
            ) : null
          }
          renderItem={({ item }) => (
            <FigurineCard
              figurine={item}
              isFavorite={favoriteIds.includes(item.id)}
              onPress={() => router.push(`/${item.id}`)}
              onToggleFavorite={() => toggleFavorite(item.id)}
            />
          )}
        />
      )}

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
  row: { justifyContent: 'space-between', marginBottom: 12 },
});