import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface QuantitySelectorProps {
  quantity: number;
  maxQuantity: number;
  disabled?: boolean;
  onChange: (newQuantity: number) => void;
}

export default function QuantitySelector({
  quantity,
  maxQuantity,
  disabled = false,
  onChange,
}: QuantitySelectorProps) {
  const canDecrease = quantity > 1 && !disabled;
  const canIncrease = quantity < maxQuantity && !disabled;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, !canDecrease && styles.buttonDisabled]}
        onPress={() => onChange(Math.max(1, quantity - 1))}
        disabled={!canDecrease}
      >
        <Text style={[styles.buttonText, !canDecrease && styles.buttonTextDisabled]}>−</Text>
      </TouchableOpacity>
      <Text style={styles.value}>{quantity}</Text>
      <TouchableOpacity
        style={[styles.button, !canIncrease && styles.buttonDisabled]}
        onPress={() => onChange(Math.min(maxQuantity, quantity + 1))}
        disabled={!canIncrease}
      >
        <Text style={[styles.buttonText, !canIncrease && styles.buttonTextDisabled]}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 4,
  },
  button: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 1,
  },
  buttonDisabled: { backgroundColor: '#eee', opacity: 0.5 },
  buttonText: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a' },
  buttonTextDisabled: { color: '#ccc' },
  value: { fontSize: 18, fontWeight: '700', minWidth: 40, textAlign: 'center' },
});