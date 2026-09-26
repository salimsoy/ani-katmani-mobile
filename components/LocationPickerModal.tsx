import { useState } from 'react';
import { Modal, View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Item = { id: number; name: string };

interface Props {
  visible: boolean;
  title: string;
  items: Item[];
  loading?: boolean;
  onSelect: (item: Item) => void;
  onClose: () => void;
}

export default function LocationPickerModal({ visible, title, items, loading, onSelect, onClose }: Props) {
  const [search, setSearch] = useState('');
  const insets = useSafeAreaInsets();

  const handleClose = () => {
    setSearch('');
    onClose();
    };

  const filtered = items.filter(item =>
    item.name.toLocaleLowerCase('tr-TR').includes(search.toLocaleLowerCase('tr-TR'))
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={22} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <Search size={16} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Ara..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#bbb"
          />
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#ff6600" />
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={item => item.id.toString()}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.row}
                onPress={() => {
                  onSelect(item);
                  setSearch('');
                }}
              >
                <Text style={styles.rowText}>{item.name}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={styles.emptyText}>Sonuç bulunamadı</Text>
              </View>
            }
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },
  closeButton: { padding: 4 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#f5f5f5', borderRadius: 10, marginHorizontal: 20, marginBottom: 12,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1a1a1a' },
  row: { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  rowText: { fontSize: 15, color: '#1a1a1a' },
  center: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#999' },
});