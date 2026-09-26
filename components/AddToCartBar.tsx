import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface AddToCartBarProps {
  price: number;
  quantity: number;
  outOfStock: boolean;
  adding: boolean;
  onAdd: () => void;
}

export default function AddToCartBar({
  price,
  quantity,
  outOfStock,
  adding,
  onAdd,
}: AddToCartBarProps) {
  const disabled = outOfStock || adding;

  return (
    <View style={styles.bottomBar}>
      <View>
        <Text style={styles.bottomBarLabel}>Toplam</Text>
        <Text style={styles.bottomBarPrice}>{(price * quantity).toFixed(2)} ₺</Text>
        <Text style={styles.bottomBarCalc}>
          {quantity} x {price} ₺
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        activeOpacity={0.8}
        onPress={onAdd}
        disabled={disabled}
      >
        <Text style={styles.buttonText}>
          {outOfStock ? 'Stokta Yok' : adding ? 'Ekleniyor...' : 'Sepete Ekle'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    elevation: 10,
  },
  bottomBarLabel: { fontSize: 12, color: '#999' },
  bottomBarPrice: { fontSize: 20, fontWeight: '800', color: '#1a1a1a' },
  bottomBarCalc: { fontSize: 11, color: '#bbb', marginTop: 2 },
  button: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  buttonDisabled: { backgroundColor: '#999', opacity: 0.7 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
});