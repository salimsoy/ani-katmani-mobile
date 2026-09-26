import { View, Text, TextInput, StyleSheet } from 'react-native';
import { CreditCard } from 'lucide-react-native';
import {
  detectCardBrand,
  validateExpiry,
  formatCardNumber,
  formatExpiryDate,
} from '@/utils/payment';

interface PaymentFormProps {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
  onCardNumberChange: (v: string) => void;
  onCardNameChange: (v: string) => void;
  onExpiryDateChange: (v: string) => void;
  onCvvChange: (v: string) => void;
}

export default function PaymentForm({
  cardNumber,
  cardName,
  expiryDate,
  cvv,
  onCardNumberChange,
  onCardNameChange,
  onExpiryDateChange,
  onCvvChange,
}: PaymentFormProps) {
  const cardDigits = cardNumber.replace(/\s/g, '');
  const cardBrand = detectCardBrand(cardDigits);
  const expiryError = expiryDate.length === 5 ? validateExpiry(expiryDate) : null;

  return (
    <>
      <View style={styles.header}>
        <CreditCard size={16} color="#ff6600" />
        <Text style={styles.headerText}>Ödeme Bilgileri</Text>
      </View>

      <Text style={styles.fieldLabel}>Kart Üzerindeki İsim</Text>
      <TextInput
        style={styles.input}
        placeholder="AHMET YILMAZ"
        value={cardName}
        onChangeText={(val) =>
          onCardNameChange(val.toLocaleUpperCase('tr-TR').replace(/[^A-ZÇĞİÖŞÜ\s]/g, ''))
        }
        autoCapitalize="characters"
        placeholderTextColor="#bbb"
      />

      <Text style={styles.fieldLabel}>Kart Numarası</Text>
      <View>
        <TextInput
          style={styles.input}
          placeholder="1234 5678 9012 3456"
          value={cardNumber}
          onChangeText={(text) => onCardNumberChange(formatCardNumber(text))}
          keyboardType="numeric"
          placeholderTextColor="#bbb"
        />
        {cardBrand && <Text style={styles.cardBrandBadge}>{cardBrand}</Text>}
      </View>

      <View style={styles.row}>
        <View style={styles.halfInput}>
          <Text style={styles.fieldLabel}>Son Kullanma</Text>
          <TextInput
            style={[styles.input, expiryError ? styles.inputError : null]}
            placeholder="AA/YY"
            value={expiryDate}
            onChangeText={(text) => onExpiryDateChange(formatExpiryDate(text))}
            keyboardType="numeric"
            placeholderTextColor="#bbb"
          />
        </View>
        <View style={styles.halfInput}>
          <Text style={styles.fieldLabel}>CVV</Text>
          <TextInput
            style={styles.input}
            placeholder="•••"
            value={cvv}
            onChangeText={(text) => onCvvChange(text.replace(/\D/g, '').slice(0, 3))}
            keyboardType="numeric"
            secureTextEntry
            placeholderTextColor="#bbb"
          />
        </View>
      </View>
      {expiryError ? <Text style={styles.errorText}>{expiryError}</Text> : null}
    </>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, marginTop: 8 },
  headerText: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#888', marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#1a1a1a',
  },
  inputError: { borderColor: '#e74c3c', backgroundColor: '#fef5f5' },
  cardBrandBadge: {
    position: 'absolute',
    right: 16,
    top: 16,
    fontSize: 12,
    fontWeight: '800',
    color: '#999',
  },
  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  errorText: { fontSize: 12, color: '#e74c3c', marginTop: -8, marginBottom: 12 },
});