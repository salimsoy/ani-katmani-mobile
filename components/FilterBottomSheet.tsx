import { useMemo, useCallback, forwardRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { X, Check } from 'lucide-react-native';

type FilterBottomSheetProps = {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onApply: () => void;
  onReset: () => void;
};

const FILAMENT_OPTIONS = ['Tümü', 'Reçine', 'PLA'];

const FilterBottomSheet = forwardRef<BottomSheet, FilterBottomSheetProps>(
  ({ selectedFilter, onFilterChange, minPrice, maxPrice, onMinPriceChange, onMaxPriceChange, onApply, onReset }, ref) => {
    const snapPoints = useMemo(() => ['55%'], []);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
      ),
      []
    );

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Filtrele</Text>
            <TouchableOpacity onPress={() => (ref as any)?.current?.close()}>
              <X size={22} color="#888" />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>Malzeme</Text>
          <View style={styles.chipRow}>
            {FILAMENT_OPTIONS.map(option => (
              <TouchableOpacity
                key={option}
                style={[styles.chip, selectedFilter === option && styles.chipActive]}
                onPress={() => onFilterChange(option)}
              >
                {selectedFilter === option && <Check size={14} color="#fff" style={{ marginRight: 4 }} />}
                <Text style={[styles.chipText, selectedFilter === option && styles.chipTextActive]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Fiyat Aralığı (₺)</Text>
          <View style={styles.priceRow}>
            <View style={styles.priceInputWrapper}>
              <Text style={styles.priceInputLabel}>Min</Text>
              <BottomSheetTextInput
                style={styles.priceInput}
                placeholder="0"
                keyboardType="numeric"
                value={minPrice}
                onChangeText={onMinPriceChange}
                placeholderTextColor="#bbb"
              />
            </View>
            <View style={styles.priceInputWrapper}>
              <Text style={styles.priceInputLabel}>Max</Text>
              <BottomSheetTextInput
                style={styles.priceInput}
                placeholder="1000"
                keyboardType="numeric"
                value={maxPrice}
                onChangeText={onMaxPriceChange}
                placeholderTextColor="#bbb"
              />
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.resetButton} onPress={onReset}>
              <Text style={styles.resetButtonText}>Sıfırla</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={onApply}>
              <Text style={styles.applyButtonText}>Uygula</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

export default FilterBottomSheet;

const styles = StyleSheet.create({
  sheetBackground: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  handleIndicator: { backgroundColor: '#ddd', width: 40 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '800', color: '#1a1a1a' },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginBottom: 10, marginTop: 12 },
  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#e0e0e0',
  },
  chipActive: { backgroundColor: '#ff6600', borderColor: '#ff6600' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#888' },
  chipTextActive: { color: '#fff' },
  priceRow: { flexDirection: 'row', gap: 12 },
  priceInputWrapper: { flex: 1 },
  priceInputLabel: { fontSize: 12, color: '#999', marginBottom: 4 },
  priceInput: {
    backgroundColor: '#f5f5f5', borderRadius: 10, padding: 12,
    fontSize: 14, borderWidth: 1, borderColor: '#e0e0e0', color: '#1a1a1a',
  },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 20 },
  resetButton: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    borderWidth: 1, borderColor: '#e0e0e0', alignItems: 'center',
  },
  resetButtonText: { fontSize: 15, fontWeight: '700', color: '#888' },
  applyButton: { flex: 2, backgroundColor: '#ff6600', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  applyButtonText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});