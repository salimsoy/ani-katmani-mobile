import { View, Text, StyleSheet } from 'react-native';
import { Wrench, Ruler, Clock } from 'lucide-react-native';

interface ProductInfoBoxProps {
  filamentType: string;
  scale: string;
  printTimeInHours: number;
}

export default function ProductInfoBox({
  filamentType,
  scale,
  printTimeInHours,
}: ProductInfoBoxProps) {
  return (
    <View style={styles.infoBox}>
      <Text style={styles.infoBoxTitle}>Ürün Detayları</Text>
      <View style={styles.infoRow}>
        <View style={styles.infoLabelRow}>
          <Wrench size={14} color="#888" />
          <Text style={styles.infoLabel}>Malzeme</Text>
        </View>
        <Text style={styles.infoValue}>{filamentType}</Text>
      </View>
      <View style={styles.infoRow}>
        <View style={styles.infoLabelRow}>
          <Ruler size={14} color="#888" />
          <Text style={styles.infoLabel}>Ölçek</Text>
        </View>
        <Text style={styles.infoValue}>{scale}</Text>
      </View>
      <View style={styles.infoRow}>
        <View style={styles.infoLabelRow}>
          <Clock size={14} color="#888" />
          <Text style={styles.infoLabel}>Üretim Süresi</Text>
        </View>
        <Text style={styles.infoValue}>{printTimeInHours} Saat</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  infoBox: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eeeeee',
  },
  infoBoxTitle: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginBottom: 10 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoLabel: { fontSize: 14, color: '#888' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
});