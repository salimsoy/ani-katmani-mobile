import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';

interface CouponInputProps {
  couponCode: string;
  appliedCouponCode: string | null;
  couponMessage: { text: string; type: 'error' | 'success' | '' };
  applyingCoupon: boolean;
  onCouponCodeChange: (v: string) => void;
  onApply: () => void;
  onRemove: () => void;
}

export default function CouponInput({
  couponCode,
  appliedCouponCode,
  couponMessage,
  applyingCoupon,
  onCouponCodeChange,
  onApply,
  onRemove,
}: CouponInputProps) {
  if (appliedCouponCode) {
    return (
      <View style={styles.appliedBox}>
        <View style={styles.appliedLeft}>
          <CheckCircle2 size={16} color="#117a65" />
          <Text style={styles.appliedText}>{appliedCouponCode} uygulandı!</Text>
        </View>
        <TouchableOpacity onPress={onRemove}>
          <Text style={styles.removeText}>İptal Et</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="İndirim Kodu"
          value={couponCode}
          onChangeText={onCouponCodeChange}
          autoCapitalize="characters"
          placeholderTextColor="#bbb"
        />
        <TouchableOpacity style={styles.applyButton} onPress={onApply} disabled={applyingCoupon}>
          <Text style={styles.applyButtonText}>{applyingCoupon ? '...' : 'Uygula'}</Text>
        </TouchableOpacity>
      </View>
      {couponMessage.text ? (
        <Text
          style={[
            styles.message,
            couponMessage.type === 'error' ? styles.errorText : styles.successText,
          ]}
        >
          {couponMessage.text}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    height: 48,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  applyButton: {
    backgroundColor: '#1a1a1a',
    height: 48,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  applyButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  message: { fontSize: 13, marginTop: 8, marginLeft: 4, fontWeight: '500' },
  errorText: { color: '#e74c3c' },
  successText: { color: '#27ae60' },
  appliedBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e8f8f5',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#a3e4d7',
    marginBottom: 12,
  },
  appliedLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  appliedText: { color: '#117a65', fontWeight: '700', fontSize: 15 },
  removeText: { color: '#e74c3c', fontWeight: '600', fontSize: 13 },
});