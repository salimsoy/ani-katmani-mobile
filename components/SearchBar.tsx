import { View, TextInput, StyleSheet } from 'react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  onClear: () => void;
}

export default function SearchBar({ value, onChangeText, onSubmit, onClear }: SearchBarProps) {
  return (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Figür ara..."
        value={value}
        onChangeText={(text) => {
          onChangeText(text);
          if (text === '') onClear();
        }}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        placeholderTextColor="#bbb"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
  },
  searchInput: { fontSize: 15, color: '#1a1a1a', paddingVertical: 12 },
});