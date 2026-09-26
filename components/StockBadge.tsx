import { View, Text, StyleSheet } from 'react-native';

interface StockBadgeProps {
  stock: number;
  lowStockThreshold?: number;
}

export default function StockBadge({ stock, lowStockThreshold = 10 }: StockBadgeProps) {
  if (stock === 0) {
    return (
      <View style={[styles.badge, styles.outOfStockBg]}>
        <View style={[styles.dot, styles.outOfStockDot]} />
        <Text style={styles.outOfStockText}>Stokta Yok</Text>
      </View>
    );
  }

  if (stock < lowStockThreshold) {
    return (
      <View style={[styles.badge, styles.lowStockBg]}>
        <View style={[styles.dot, styles.lowStockDot]} />
        <Text style={styles.lowStockText}>Son {stock} adet!</Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, styles.inStockBg]}>
      <View style={[styles.dot, styles.inStockDot]} />
      <Text style={styles.inStockText}>Stokta</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  outOfStockBg: { backgroundColor: '#fdecea' },
  outOfStockDot: { backgroundColor: '#e74c3c' },
  outOfStockText: { fontSize: 12, fontWeight: '700', color: '#c0392b' },
  lowStockBg: { backgroundColor: '#fff8e1' },
  lowStockDot: { backgroundColor: '#f39c12' },
  lowStockText: { fontSize: 12, fontWeight: '700', color: '#b7791f' },
  inStockBg: { backgroundColor: '#e8f8f0' },
  inStockDot: { backgroundColor: '#27ae60' },
  inStockText: { fontSize: 12, fontWeight: '700', color: '#1e874b' },
});