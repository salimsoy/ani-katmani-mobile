import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AlertCircle } from 'lucide-react-native';

interface StockWarningBannerProps {
  stockError: string | null;
  onGoToCart: () => void;
}

export default function StockWarningBanner({
  stockError,
  onGoToCart,
}: StockWarningBannerProps) {
  if (!stockError) return null;

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <AlertCircle size={20} color="#c0392b" />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Stok Sorunu</Text>
        <Text style={styles.message}>{stockError}</Text>
        <TouchableOpacity onPress={onGoToCart}>
          <Text style={styles.link}>Sepete Dön ve Düzenle →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#fdecea',
    borderWidth: 1.5,
    borderColor: '#f5c6cb',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  iconWrap: { paddingTop: 2 },
  content: { flex: 1 },
  title: { fontSize: 14, fontWeight: '800', color: '#c0392b', marginBottom: 4 },
  message: { fontSize: 13, color: '#c0392b', lineHeight: 18, marginBottom: 8 },
  link: { fontSize: 13, fontWeight: '700', color: '#c0392b', textDecorationLine: 'underline' },
});