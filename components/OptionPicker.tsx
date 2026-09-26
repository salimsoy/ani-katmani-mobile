import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type Option = { value: string; label: string };

interface OptionPickerProps {
  label: string;
  helperText?: string;
  options: Option[];
  selected: string;
  onSelect: (value: string) => void;
}

export default function OptionPicker({ label, helperText, options, selected, onSelect }: OptionPickerProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.list}>
        {options.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => onSelect(opt.value)}
              activeOpacity={0.7}
            >
              <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                {isSelected && <View style={styles.radioDot} />}
              </View>
              <Text style={styles.optionLabel}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  list: { gap: 8 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  optionSelected: { borderColor: '#ff6600', backgroundColor: '#fff5ee' },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: { borderColor: '#ff6600' },
  radioDot: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: '#ff6600' },
  optionLabel: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  helperText: { fontSize: 12, color: '#999', marginTop: 6 },
});
