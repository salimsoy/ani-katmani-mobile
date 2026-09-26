import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronDown, MapPin } from 'lucide-react-native';

interface Address {
  id: number;
  title: string;
  fullName: string;
  phoneNumber: string;
  city: string;
  district: string;
  addressText: string;
  isDefault: boolean;
}

interface AddressSelectorProps {
  addresses: Address[];
  loading: boolean;
  selectedAddressId: number | null;
  expanded: boolean;
  onSelect: (id: number) => void;
  onToggleExpanded: () => void;
  onNavigateToAddresses: () => void;
}

export default function AddressSelector({
  addresses,
  loading,
  selectedAddressId,
  expanded,
  onSelect,
  onToggleExpanded,
  onNavigateToAddresses,
}: AddressSelectorProps) {
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) ?? null;

  return (
    <View style={styles.box}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MapPin size={16} color="#ff6600" />
          <Text style={styles.headerText}>Teslimat Adresi</Text>
        </View>
        <TouchableOpacity onPress={onNavigateToAddresses}>
          <Text style={styles.changeText}>Ekle / Değiştir</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={styles.infoText}>Adresler yükleniyor...</Text>
      ) : addresses.length === 0 ? (
        <Text style={styles.infoText}>
          Henüz kayıtlı adresiniz yok, yukarıdaki "Ekle / Değiştir" ile ekleyebilirsiniz.
        </Text>
      ) : selectedAddress && !expanded ? (
        <TouchableOpacity style={styles.summary} onPress={onToggleExpanded}>
          <View style={styles.summaryTop}>
            <View style={styles.titleRow}>
              <Text style={styles.titleText}>{selectedAddress.title}</Text>
              {selectedAddress.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>VARSAYILAN</Text>
                </View>
              )}
            </View>
            {addresses.length > 1 && <ChevronDown size={16} color="#999" />}
          </View>
          <Text style={styles.line}>
            {selectedAddress.fullName} · {selectedAddress.phoneNumber}
          </Text>
          <Text style={styles.lineMuted}>
            {selectedAddress.addressText}, {selectedAddress.district}/{selectedAddress.city}
          </Text>
        </TouchableOpacity>
      ) : (
        addresses.map((addr) => {
          const isSelected = selectedAddressId === addr.id;
          return (
            <TouchableOpacity
              key={addr.id}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => onSelect(addr.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                {isSelected && <View style={styles.radioDot} />}
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.titleRow}>
                  <Text style={styles.titleText}>{addr.title}</Text>
                  {addr.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>VARSAYILAN</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.line}>
                  {addr.fullName} · {addr.phoneNumber}
                </Text>
                <Text style={styles.lineMuted}>
                  {addr.addressText}, {addr.district}/{addr.city}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerText: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  changeText: { fontSize: 13, fontWeight: '700', color: '#ff6600' },
  infoText: { fontSize: 13, color: '#999' },
  summary: { borderWidth: 1, borderColor: '#eee', borderRadius: 10, padding: 12 },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  titleText: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  defaultBadge: { backgroundColor: '#fff3e8', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  defaultBadgeText: { fontSize: 9, fontWeight: '800', color: '#ff6600' },
  line: { fontSize: 13, color: '#555', marginTop: 4 },
  lineMuted: { fontSize: 13, color: '#999', marginTop: 2 },
  option: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#e0e0e0',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8, gap: 10,
  },
  optionSelected: { borderColor: '#ff6600', backgroundColor: '#fff5ee' },
  radioCircle: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#ccc',
    justifyContent: 'center', alignItems: 'center',
  },
  radioCircleSelected: { borderColor: '#ff6600' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ff6600' },
});