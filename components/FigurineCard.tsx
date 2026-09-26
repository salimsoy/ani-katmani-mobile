import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Heart, Ruler } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export type Figurine = {
  id: number;
  name: string;
  price: number;
  filamentType: string;
  scale: string;
  printTimeInHours: number;
  imageUrl: string;
  stock: number;
};

interface FigurineCardProps {
  figurine: Figurine;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
}

export default function FigurineCard({
  figurine,
  isFavorite,
  onPress,
  onToggleFavorite,
}: FigurineCardProps) {
  const outOfStock = (figurine.stock ?? 0) === 0;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: figurine.imageUrl || 'https://via.placeholder.com/300x300?text=Resim+Yok',
          }}
          style={[styles.cardImage, outOfStock && styles.cardImageDimmed]}
          resizeMode="cover"
        />

        {outOfStock && (
          <View style={styles.outOfStockOverlay}>
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockText}>Tükendi</Text>
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.favoriteIconButton}
        onPress={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
      >
        <Heart
          size={16}
          color={isFavorite ? '#e74c3c' : '#999'}
          fill={isFavorite ? '#e74c3c' : 'none'}
        />
      </TouchableOpacity>

      <View style={styles.floatingBadge}>
        <Text style={styles.floatingBadgeText}>{figurine.filamentType}</Text>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.name} numberOfLines={2}>
          {figurine.name}
        </Text>
        <Text style={styles.price}>{figurine.price} ₺</Text>
        <View style={styles.metaRow}>
          <Ruler size={11} color="#aaa" />
          <Text style={styles.metaText}>{figurine.scale}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
  imageContainer: { position: 'relative' },
  cardImage: { width: '100%', height: CARD_WIDTH, backgroundColor: '#eeeeee' },
  cardImageDimmed: { opacity: 0.5 },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockBadge: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  outOfStockText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  floatingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  floatingBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  cardContent: { padding: 10 },
  name: { fontSize: 13, fontWeight: '700', color: '#1a1a1a', marginBottom: 4, lineHeight: 18 },
  price: { fontSize: 15, fontWeight: '800', color: '#ff6600', marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: '#aaa' },
  favoriteIconButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});