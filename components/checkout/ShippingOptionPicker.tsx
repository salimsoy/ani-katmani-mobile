import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Truck } from 'lucide-react-native';

interface ShippingOption {
  id: number;
  name: string;
  price: number;
  isActive: boolean;
}

interface ShippingOptionPickerProps {
  shippingOptions: ShippingOption[];
  selectedShippingId: number | null;
  loading: boolean;
  onSelect: (id: number) => void;
}

export default function ShippingOptionPicker({
  shippingOptions,
  selectedShippingId,
  loading,
  onSelect,
}: ShippingOptionPickerProps) {
  return (
    <>
      <View style={styles.header}>
        <Truck size={16} color="#ff6600" />
        <Text style={styles.headerText}>Kargo Seçeneği</Text>
      </View>

      {loading ? (
        <Text style={styles.infoText}>Kargo seçenekleri yükleniyor...</Text>
      ) : shippingOptions.length === 0 ? (
        <Text style={styles.errorText}>Şu anda kullanılabilir kargo seçeneği yok.</Text>
      ) : (
        <View style={styles.list}>
          {shippingOptions.map((option) => {
            const isSelected = selectedShippingId === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                style={[styles.option, isSelected && styles.optionSelected]}
                onPress={() => onSelect(option.id)}
                activeOpacity={0.7}
              >
                <View style={styles.optionLeft}>
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                  <Text style={styles.optionName}>{option.name}</Text>
                </View>
                <Text style={styles.optionPrice}>{option.price} ₺</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    marginTop: 8,
  },
  headerText: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  infoText: { fontSize: 13, color: '#999', marginBottom: 16 },
  errorText: { fontSize: 13, color: '#e74c3c', marginBottom: 16 },
  list: { marginBottom: 16 },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  optionSelected: { borderColor: '#ff6600', backgroundColor: '#fff5ee' },
  optionLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: { borderColor: '#ff6600' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ff6600' },
  optionName: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  optionPrice: { fontSize: 14, fontWeight: '800', color: '#ff6600' },
});