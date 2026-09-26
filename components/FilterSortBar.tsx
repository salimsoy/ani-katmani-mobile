import { TouchableOpacity, Text, View, StyleSheet, Keyboard } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react-native';

interface FilterSortBarProps {
  hasActiveFilter: boolean;
  hasActiveSort: boolean;
  onFilterPress: () => void;
  onSortPress: () => void;
}

export default function FilterSortBar({
  hasActiveFilter,
  hasActiveSort,
  onFilterPress,
  onSortPress,
}: FilterSortBarProps) {
  const filterScale = useSharedValue(1);
  const sortScale = useSharedValue(1);

  const filterAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: filterScale.value }],
  }));
  const sortAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sortScale.value }],
  }));

  return (
    <View style={styles.filterSortRow}>
      <Animated.View style={[{ flex: 1 }, filterAnimatedStyle]}>
        <TouchableOpacity
          style={styles.filterSortButton}
          onPress={() => {
            Keyboard.dismiss();
            onFilterPress();
          }}
          onPressIn={() => {
            filterScale.value = withSpring(0.95);
          }}
          onPressOut={() => {
            filterScale.value = withSpring(1);
          }}
          activeOpacity={1}
        >
          <SlidersHorizontal size={16} color="#1a1a1a" />
          <Text style={styles.filterSortButtonText}>Filtrele</Text>
          {hasActiveFilter && <View style={styles.activeDot} />}
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[{ flex: 1 }, sortAnimatedStyle]}>
        <TouchableOpacity
          style={styles.filterSortButton}
          onPress={() => {
            Keyboard.dismiss();
            onSortPress();
          }}
          onPressIn={() => {
            sortScale.value = withSpring(0.95);
          }}
          onPressOut={() => {
            sortScale.value = withSpring(1);
          }}
          activeOpacity={1}
        >
          <ArrowUpDown size={16} color="#1a1a1a" />
          <Text style={styles.filterSortButtonText}>Sırala</Text>
          {hasActiveSort && <View style={styles.activeDot} />}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  filterSortRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  filterSortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 6,
  },
  filterSortButtonText: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  activeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#ff6600', marginLeft: 2 },
});