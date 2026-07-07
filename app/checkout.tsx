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

  const rawTotal = parseFloat(total as string);

  // --- KUPON STATE'LERİ ---
  const [couponCode, setCouponCode] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMessage, setCouponMessage] = useState({ text: '', type: '' });
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const finalPrice = rawTotal - discountAmount;
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setApplyingCoupon(true);
    setCouponMessage({ text: '', type: '' });

    try {
      const res = await apiFetch('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({
          code: couponCode.trim(),
          totalPrice: rawTotal
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setCouponMessage({ text: data.message || 'Kupon geçersiz.', type: 'error' });
        setDiscountAmount(0);
        setAppliedCouponCode(null);
      } else {
        setCouponMessage({ text: data.message, type: 'success' });
        setDiscountAmount(data.discountAmount);
        setAppliedCouponCode(couponCode.trim());
      }
    } catch (err) {
      setCouponMessage({ text: 'Sunucuya bağlanılamadı.', type: 'error' });
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setDiscountAmount(0);
    setAppliedCouponCode(null);
    setCouponCode('');
    setCouponMessage({ text: '', type: '' });
  };

  const completeOrder = () => {
    if (!fullName || !address || !phoneNumber) {
      Alert.alert('Eksik Bilgi', 'Lütfen tüm teslimat bilgilerini eksiksiz doldurun.');
      return;
    }

    if (!validateCardInfo()) {
      return;
    }

    // Kart bilgileri hiçbir yere gönderilmiyor, sadece doğrulama simülasyonu
    apiFetch('/orders', {
      method: 'POST',
      body: JSON.stringify({
        fullName,
        address,
        phoneNumber,
        couponCode: appliedCouponCode
      })
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

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, ''); // sadece rakamları al
    const limited = cleaned.slice(0, 16); // max 16 hane
    const groups = limited.match(/.{1,4}/g); // 4'lü gruplara böl
    return groups ? groups.join(' ') : '';
  };

  const handleCardNumberChange = (text: string) => {
    setCardNumber(formatCardNumber(text));
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const limited = cleaned.slice(0, 4);
    if (limited.length >= 3) {
      return `${limited.slice(0, 2)}/${limited.slice(2)}`;
    }
    return limited;
  };

  const handleExpiryChange = (text: string) => {
    setExpiryDate(formatExpiryDate(text));
  };

  const validateCardInfo = () => {
    const cleanedCardNumber = cardNumber.replace(/\s/g, '');

    if (cleanedCardNumber.length !== 16) {
      Alert.alert('Geçersiz Kart', 'Kart numarası 16 haneli olmalıdır.');
      return false;
    }
    if (!cardName.trim()) {
      Alert.alert('Eksik Bilgi', 'Kart üzerindeki ismi girin.');
      return false;
    }
    if (expiryDate.length !== 5) {
      Alert.alert('Geçersiz Tarih', 'Son kullanma tarihini AA/YY formatında girin.');
      return false;
    }
    if (cvv.length !== 3) {
      Alert.alert('Geçersiz CVV', 'CVV 3 haneli olmalıdır.');
      return false;
    }
    return true;
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

        <Text style={styles.sectionLabel}>💳 Ödeme Bilgileri</Text>

        <TextInput
          style={styles.input}
          placeholder="Kart Üzerindeki İsim"
          value={cardName}
          onChangeText={setCardName}
          autoCapitalize="characters"
          placeholderTextColor="#bbb"
        />

        <TextInput
          style={styles.input}
          placeholder="1234 5678 9012 3456"
          value={cardNumber}
          onChangeText={handleCardNumberChange}
          keyboardType="numeric"
          placeholderTextColor="#bbb"
        />

        <View style={styles.cardRow}>
          <TextInput
            style={[styles.input, styles.cardHalfInput]}
            placeholder="AA/YY"
            value={expiryDate}
            onChangeText={handleExpiryChange}
            keyboardType="numeric"
            placeholderTextColor="#bbb"
          />
          <TextInput
            style={[styles.input, styles.cardHalfInput]}
            placeholder="CVV"
            value={cvv}
            onChangeText={(text) => setCvv(text.replace(/\D/g, '').slice(0, 3))}
            keyboardType="numeric"
            secureTextEntry
            placeholderTextColor="#bbb"
          />
        </View>

        {/* KUPON ALANI */}
        <View style={styles.couponContainer}>
          {!appliedCouponCode ? (
            <>
              <View style={styles.couponInputRow}>
                <TextInput
                  style={styles.couponInput}
                  placeholder="İndirim Kodu"
                  value={couponCode}
                  onChangeText={setCouponCode}
                  autoCapitalize="characters"
                  placeholderTextColor="#bbb"
                />
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={handleApplyCoupon}
                  disabled={applyingCoupon}
                >
                  <Text style={styles.applyButtonText}>
                    {applyingCoupon ? '...' : 'Uygula'}
                  </Text>
                </TouchableOpacity>
              </View>
              {couponMessage.text ? (
                <Text style={[
                  styles.couponMessageText,
                  couponMessage.type === 'error' ? styles.errorText : styles.successText
                ]}>
                  {couponMessage.text}
                </Text>
              ) : null}
            </>
          ) : (
            <View style={styles.appliedCouponBox}>
              <Text style={styles.appliedCouponText}>🎉 {appliedCouponCode} uygulandı!</Text>
              <TouchableOpacity onPress={handleRemoveCoupon}>
                <Text style={styles.removeCouponText}>İptal Et</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* SİPARİŞ ÖZETİ */}
        <View style={styles.summaryBox}>
          {discountAmount > 0 && (
            <>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Ara Toplam</Text>
                <Text style={[styles.summaryValue, styles.strikethrough]}>{rawTotal.toFixed(2)} ₺</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>İndirim</Text>
                <Text style={[styles.summaryValue, { color: '#e74c3c' }]}>- {discountAmount.toFixed(2)} ₺</Text>
              </View>
            </>
          )}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Kargo</Text>
            <Text style={[styles.summaryValue, { color: '#27ae60' }]}>Ücretsiz</Text>
          </View>

          <View style={[styles.summaryRow, { marginBottom: 0 }]}>
            <Text style={styles.totalLabel}>Toplam</Text>
            <Text style={styles.totalPrice}>{finalPrice.toFixed(2)} ₺</Text>
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

  // Kupon stilleri
  couponContainer: { marginBottom: 12 },
  couponInputRow: { flexDirection: 'row', alignItems: 'center' },
  couponInput: {
    flex: 1, backgroundColor: '#fff', paddingHorizontal: 16, height: 48,
    borderTopLeftRadius: 12, borderBottomLeftRadius: 12,
    borderWidth: 1, borderColor: '#e0e0e0', fontSize: 14, fontWeight: '600', color: '#1a1a1a',
  },
  applyButton: {
    backgroundColor: '#1a1a1a', height: 48, paddingHorizontal: 20,
    justifyContent: 'center', alignItems: 'center',
    borderTopRightRadius: 12, borderBottomRightRadius: 12,
  },
  applyButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  couponMessageText: { fontSize: 13, marginTop: 8, marginLeft: 4, fontWeight: '500' },
  errorText: { color: '#e74c3c' },
  successText: { color: '#27ae60' },
  appliedCouponBox: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#e8f8f5', padding: 14, borderRadius: 12,
    borderWidth: 1, borderColor: '#a3e4d7',
  },
  appliedCouponText: { color: '#117a65', fontWeight: '700', fontSize: 15 },
  removeCouponText: { color: '#e74c3c', fontWeight: '600', fontSize: 13 },

  summaryBox: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginTop: 8, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 14, color: '#888' },
  summaryValue: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  strikethrough: { textDecorationLine: 'line-through', color: '#bbb' },
  totalLabel: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  totalPrice: { fontSize: 22, fontWeight: '800', color: '#ff6600' },
  button: { backgroundColor: '#ff6600', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  sectionLabel: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 12, marginTop: 8 },
  cardRow: { flexDirection: 'row', gap: 12 },
  cardHalfInput: { flex: 1 },
});