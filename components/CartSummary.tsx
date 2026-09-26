import { View, Text, StyleSheet } from 'react-native';

interface CartSummaryProps {
  itemCount: number;
  totalPrice: number;
}

export default function CartSummary({ itemCount, totalPrice }: CartSummaryProps) {
  return (
    <View style={styles.summaryBox}>
      <Text style={styles.summaryTitle}>Sipariş Özeti</Text>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Ürünler ({itemCount})</Text>
        <Text style={styles.summaryValue}>{totalPrice.toFixed(2)} ₺</Text>
      </View>
      <Text style={styles.shippingNote}>Kargo ücreti bir sonraki adımda hesaplanacak</Text>

      <View style={[styles.summaryRow, styles.totalRow]}>
        <Text style={styles.totalLabel}>Ara Toplam</Text>
        <Text style={styles.totalPrice}>{totalPrice.toFixed(2)} ₺</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: '#888' },
  summaryValue: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  shippingNote: { fontSize: 12, color: '#bbb', marginBottom: 8 },
  totalRow: { borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 12, marginTop: 4 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  totalPrice: { fontSize: 20, fontWeight: '800', color: '#ff6600' },
});