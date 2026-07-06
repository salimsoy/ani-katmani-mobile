import { useMemo, useCallback, forwardRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { X, ArrowUpNarrowWide, ArrowDownWideNarrow, ArrowDownAZ, Check } from 'lucide-react-native';

export type SortOption = 'default' | 'priceAsc' | 'priceDesc' | 'nameAsc';

type SortBottomSheetProps = {
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
};

const SORT_OPTIONS: { label: string; value: SortOption; icon: any }[] = [
  { label: 'Varsayılan', value: 'default', icon: null },
  { label: 'Fiyat: Düşükten Yükseğe', value: 'priceAsc', icon: ArrowUpNarrowWide },
  { label: 'Fiyat: Yüksekten Düşüğe', value: 'priceDesc', icon: ArrowDownWideNarrow },
  { label: 'İsim: A-Z', value: 'nameAsc', icon: ArrowDownAZ },
];

const SortBottomSheet = forwardRef<BottomSheet, SortBottomSheetProps>(
  ({ sortOption, onSortChange }, ref) => {
    const snapPoints = useMemo(() => ['40%'], []);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
      ),
      []
    );

    const handleSelect = (value: SortOption) => {
      onSortChange(value);
      (ref as any)?.current?.close();
    };

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
            <Text style={styles.title}>Sırala</Text>
            <TouchableOpacity onPress={() => (ref as any)?.current?.close()}>
              <X size={22} color="#888" />
            </TouchableOpacity>
          </View>

          {SORT_OPTIONS.map(option => {
            const Icon = option.icon;
            const isActive = sortOption === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.optionRow, isActive && styles.optionRowActive]}
                onPress={() => handleSelect(option.value)}
              >
                <View style={styles.optionLeft}>
                  {Icon && <Icon size={18} color={isActive ? '#ff6600' : '#888'} style={{ marginRight: 10 }} />}
                  <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                    {option.label}
                  </Text>
                </View>
                {isActive && <Check size={18} color="#ff6600" />}
              </TouchableOpacity>
            );
          })}
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

export default SortBottomSheet;

const styles = StyleSheet.create({
  sheetBackground: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  handleIndicator: { backgroundColor: '#ddd', width: 40 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '800', color: '#1a1a1a' },
  optionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 14, borderRadius: 12, marginBottom: 6,
  },
  optionRowActive: { backgroundColor: '#fff3e8' },
  optionLeft: { flexDirection: 'row', alignItems: 'center' },
  optionText: { fontSize: 14, fontWeight: '500', color: '#333' },
  optionTextActive: { color: '#ff6600', fontWeight: '700' },
});