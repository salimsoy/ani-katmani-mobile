import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Trash2, AlertCircle } from 'lucide-react-native';

interface CartItemCardProps {
  item: {
    id: number;
    figurineId: number;
    quantity: number;
    figurine?: {
      name?: string;
      price?: number;
      imageUrl?: string;
      stock?: number;
    };
  };
  onUpdateQuantity: (change: number) => void;
  onRemove: () => void;
}

export default function CartItemCard({ item, onUpdateQuantity, onRemove }: CartItemCardProps) {
  const stock = item.figurine?.stock ?? Infinity;
  const outOfStock = stock === 0;
  const overStock = item.quantity > stock && stock > 0;
  const canIncrease = item.quantity < stock;
  const hasIssue = outOfStock || overStock;

  return (
    <View style={[styles.card, hasIssue && styles.cardWithIssue]}>
      <Image
        source={{ uri: item.figurine?.imageUrl || 'https://via.placeholder.com/150' }}
        style={[styles.image, outOfStock && styles.imageDimmed]}
      />
      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={2}>
          {item.figurine?.name}
        </Text>
        <Text style={styles.price}>
          {((item.figurine?.price ?? 0) * item.quantity).toFixed(2)} ₺
        </Text>
        <Text style={styles.unitPrice}>{item.figurine?.price} ₺ / adet</Text>

        {outOfStock && (
          <View style={styles.warningRow}>
            <AlertCircle size={12} color="#c0392b" />
            <Text style={styles.warningTextRed}>Bu ürün stokta yok</Text>
          </View>
        )}
        {overStock && (
          <View style={styles.warningRow}>
            <AlertCircle size={12} color="#b7791f" />
            <Text style={styles.warningTextYellow}>Stokta sadece {stock} adet var</Text>
          </View>
        )}

        <View style={styles.controlsRow}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity style={styles.qtyButton} onPress={() => onUpdateQuantity(-1)}>
              <Text style={styles.qtyButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <TouchableOpacity
              style={[styles.qtyButton, !canIncrease && styles.qtyButtonDisabled]}
              onPress={() => onUpdateQuantity(1)}
              disabled={!canIncrease}
            >
              <Text style={[styles.qtyButtonText, !canIncrease && styles.qtyButtonTextDisabled]}>+</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
            <Trash2 size={14} color="#e74c3c" />
            <Text style={styles.removeButtonText}>Kaldır</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardWithIssue: { borderWidth: 1.5, borderColor: '#f5c6cb' },
  image: { width: 85, height: 85, borderRadius: 12, backgroundColor: '#eee', marginRight: 14 },
  imageDimmed: { opacity: 0.5 },
  details: { flex: 1, justifyContent: 'center' },
  name: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginBottom: 2 },
  price: { fontSize: 16, fontWeight: '800', color: '#ff6600', marginBottom: 2 },
  unitPrice: { fontSize: 11, color: '#bbb', marginBottom: 6 },
  warningRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  warningTextRed: { fontSize: 11, fontWeight: '600', color: '#c0392b' },
  warningTextYellow: { fontSize: 11, fontWeight: '600', color: '#b7791f' },
  controlsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 2,
  },
  qtyButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
    elevation: 1,
  },
  qtyButtonDisabled: { backgroundColor: '#eee', opacity: 0.5 },
  qtyButtonText: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
  qtyButtonTextDisabled: { color: '#ccc' },
  quantityText: { fontSize: 15, fontWeight: '700', minWidth: 30, textAlign: 'center' },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  removeButtonText: { color: '#e74c3c', fontSize: 12, fontWeight: '600' },
});