import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

interface CheckoutSummaryProps {
  rawTotal: number;
  discountAmount: number;
  shippingCost: number;
  finalPrice: number;
  selectedShippingName: string | null;
  hasShippingOptions: boolean;
  expanded: boolean;
  onToggleExpanded: () => void;
}

export default function CheckoutSummary({
  rawTotal,
  discountAmount,
  shippingCost,
  finalPrice,
  selectedShippingName,
  hasShippingOptions,
  expanded,
  onToggleExpanded,
}: CheckoutSummaryProps) {
  return (
    <View style={styles.box}>
      <TouchableOpacity onPress={onToggleExpanded} activeOpacity={0.7} style={styles.toggleRow}>
        <Text style={styles.totalLabel}>Toplam</Text>
        <View style={styles.toggleRight}>
          <View style={{ alignItems: 'flex-end' }}>
            {discountAmount > 0 && (
              <Text style={styles.oldTotal}>{(rawTotal + shippingCost).toFixed(2)} ₺</Text>
            )}
            <Text style={styles.totalPrice}>{finalPrice.toFixed(2)} ₺</Text>
          </View>
          <ChevronDown
            size={18}
            color="#999"
            style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.details}>
          <View style={styles.row}>
            <Text style={styles.label}>Ara Toplam</Text>
            <Text style={styles.value}>{rawTotal.toFixed(2)} ₺</Text>
          </View>
          {discountAmount > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>İndirim</Text>
              <Text style={[styles.value, { color: '#e74c3c' }]}>
                - {discountAmount.toFixed(2)} ₺
              </Text>
            </View>
          )}
          <View style={[styles.row, { marginBottom: 0 }]}>
            <Text style={styles.label}>
              Kargo{selectedShippingName ? ` (${selectedShippingName})` : ''}
            </Text>
            <Text style={styles.value}>
              {!hasShippingOptions ? '—' : `${shippingCost.toFixed(2)} ₺`}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  totalLabel: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  totalPrice: { fontSize: 22, fontWeight: '800', color: '#ff6600' },
  oldTotal: { fontSize: 13, color: '#bbb', textDecorationLine: 'line-through' },
  details: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label: { fontSize: 14, color: '#888' },
  value: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
});