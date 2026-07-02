import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { apiFetch } from '@/utils/api';

export default function CheckoutScreen() {
  const router = useRouter();
  const { total } = useLocalSearchParams();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');

  const completeOrder = () => {
    if (!fullName || !address || !phoneNumber) {
      Alert.alert('Eksik Bilgi', 'Lütfen tüm teslimat bilgilerini eksiksiz doldurun.');
      return;
    }

    apiFetch('/orders', {
      method: 'POST',
      body: JSON.stringify({ fullName, address, phoneNumber })
    })
      .then(async res => {
        if (res.ok) {
          Alert.alert('🎉 Sipariş Alındı!', 'Siparişiniz başarıyla oluşturuldu.', [
            { text: 'Tamam', onPress: () => router.replace('/(tabs)') }
          ]);
        } else {
          const errText = await res.text();
          Alert.alert('Hata', `Sipariş oluşturulamadı: ${errText}`);
        }
      })
      .catch(() => Alert.alert('Hata', 'Sunucuya bağlanılamadı.'));
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.title}>Teslimat Bilgileri</Text>
        <Text style={styles.subtitle}>Siparişinizin teslim edileceği bilgileri girin</Text>

        <TextInput
          style={styles.input}
          placeholder="Ad Soyad"
          value={fullName}
          onChangeText={setFullName}
          placeholderTextColor="#bbb"
        />
        <TextInput
          style={styles.input}
          placeholder="Telefon Numarası"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholderTextColor="#bbb"
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Açık Adres"
          multiline
          value={address}
          onChangeText={setAddress}
          placeholderTextColor="#bbb"
        />

        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Kargo</Text>
            <Text style={[styles.summaryValue, { color: '#27ae60' }]}>Ücretsiz</Text>
          </View>
          <View style={[styles.summaryRow, { marginBottom: 0 }]}>
            <Text style={styles.totalLabel}>Toplam</Text>
            <Text style={styles.totalPrice}>{total} ₺</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={completeOrder} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Siparişi Tamamla ✓</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingHorizontal: 20, paddingTop: 20 },
  title: { fontSize: 26, fontWeight: '800', color: '#1a1a1a', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#999', marginBottom: 28 },
  input: {
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14,
    borderRadius: 12, marginBottom: 12, fontSize: 14,
    borderWidth: 1, borderColor: '#e0e0e0', color: '#1a1a1a',
  },
  textArea: { height: 90, textAlignVertical: 'top' },
  summaryBox: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginTop: 8, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 14, color: '#888' },
  summaryValue: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  totalLabel: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  totalPrice: { fontSize: 22, fontWeight: '800', color: '#ff6600' },
  button: { backgroundColor: '#ff6600', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});