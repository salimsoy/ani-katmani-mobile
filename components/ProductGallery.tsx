import { useRef } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Heart } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = 380;

interface ProductGalleryProps {
  images: string[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  isFavorite: boolean;
  favoriteLoading: boolean;
  onToggleFavorite: () => void;
  outOfStock: boolean;
}

export default function ProductGallery({
  images,
  activeIndex,
  onActiveIndexChange,
  isFavorite,
  favoriteLoading,
  onToggleFavorite,
  outOfStock,
}: ProductGalleryProps) {
  const listRef = useRef<FlatList>(null);

  return (
    <>
      <View style={styles.imageContainer}>
        <FlatList
          ref={listRef}
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, index) => index.toString()}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            onActiveIndexChange(index);
          }}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={[
                styles.image,
                { width: SCREEN_WIDTH },
                outOfStock && styles.imageDimmed,
              ]}
              resizeMode="cover"
            />
          )}
        />

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={onToggleFavorite}
          disabled={favoriteLoading}
        >
          <Heart
            size={20}
            color={isFavorite ? '#e74c3c' : '#999'}
            fill={isFavorite ? '#e74c3c' : 'none'}
          />
        </TouchableOpacity>

        {outOfStock && (
          <View style={styles.outOfStockOverlay} pointerEvents="none">
            <View style={styles.outOfStockOverlayBadge}>
              <Text style={styles.outOfStockOverlayText}>Tükendi</Text>
            </View>
          </View>
        )}

        {images.length > 1 && (
          <View style={styles.dotsRow}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, index === activeIndex && styles.dotActive]}
              />
            ))}
          </View>
        )}
      </View>

      {images.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailRow}
        >
          {images.map((url, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                onActiveIndexChange(index);
                listRef.current?.scrollToIndex({ index, animated: true });
              }}
              style={[
                styles.thumbnail,
                index === activeIndex && styles.thumbnailActive,
              ]}
            >
              <Image source={{ uri: url }} style={styles.thumbnailImage} resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  imageContainer: { position: 'relative' },
  image: { width: '100%', height: IMAGE_HEIGHT, backgroundColor: '#eeeeee' },
  imageDimmed: { opacity: 0.5 },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: IMAGE_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockOverlayBadge: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  outOfStockOverlayText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    zIndex: 10,
  },
  dotsRow: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  dotActive: { backgroundColor: '#ff6600', width: 18 },
  thumbnailRow: { paddingHorizontal: 24, paddingVertical: 12, gap: 8 },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: { borderColor: '#ff6600' },
  thumbnailImage: { width: '100%', height: '100%' },
});