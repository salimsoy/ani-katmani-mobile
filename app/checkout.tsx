import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { apiFetch } from '@/utils/api';
import { luhnCheck, validateExpiry } from '@/utils/payment';

import StockWarningBanner from '@/components/checkout/StockWarningBanner';
import AddressSelector from '@/components/checkout/AddressSelector';
import ShippingOptionPicker from '@/components/checkout/ShippingOptionPicker';
import PaymentForm from '@/components/checkout/PaymentForm';
import CouponInput from '@/components/checkout/CouponInput';
import CheckoutSummary from '@/components/checkout/CheckoutSummary';

type ShippingOption = {
  id: number;
  name: string;
  price: number;
  isActive: boolean;
};

type Address = {
  id: number;
  title: string;
  fullName: string;
  phoneNumber: string;
  city: string;
  district: string;
  addressText: string;
  isDefault: boolean;
};

export default function CheckoutScreen() {
  const router = useRouter();
  const { total, selectedAddressId: selectedAddressIdParam } = useLocalSearchParams<{
    total: string;
    selectedAddressId?: string;
  }>();

  const rawTotal = parseFloat(total as string);

  // Adres
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [addressListExpanded, setAddressListExpanded] = useState(false);

  // Kupon
  const [couponCode, setCouponCode] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<{ text: string; type: 'error' | 'success' | '' }>({
    text: '',
    type: '',
  });
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Kargo
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [selectedShippingId, setSelectedShippingId] = useState<number | null>(null);
  const [loadingShipping, setLoadingShipping] = useState(true);

  // Kart
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  // Stok hatası
  const [stockError, setStockError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiFetch('/addresses')
      .then((res) => res.json())
      .then((data: Address[]) => {
        setAddresses(data);
        if (selectedAddressIdParam) {
          setSelectedAddressId(Number(selectedAddressIdParam));
        } else {
          const defaultAddr = data.find((a) => a.isDefault);
          if (defaultAddr) setSelectedAddressId(defaultAddr.id);
          else if (data.length > 0) setSelectedAddressId(data[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingAddresses(false));
  }, [selectedAddressIdParam]);

  useEffect(() => {
    apiFetch('/shipping-options/active')
      .then((res) => res.json())
      .then((data: ShippingOption[]) => {
        setShippingOptions(data);
        if (data.length > 0) setSelectedShippingId(data[0].id);
      })
      .catch(() => {})
      .finally(() => setLoadingShipping(false));
  }, []);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) ?? null;
  const selectedShipping = shippingOptions.find((s) => s.id === selectedShippingId) ?? null;
  const shippingCost = selectedShipping?.price ?? 0;
  const finalPrice = rawTotal - discountAmount + shippingCost;

  const validateCardInfo = (): boolean => {
    const cardDigits = cardNumber.replace(/\s/g, '');
    if (cardDigits.length !== 16) {
      Alert.alert('Geçersiz Kart', 'Kart numarası 16 haneli olmalıdır.');
      return false;
    }
    if (!luhnCheck(cardDigits)) {
      Alert.alert('Geçersiz Kart', 'Kart numarası geçersiz, kontrol edin.');
      return false;
    }
    if (cardName.trim().length < 5 || !cardName.trim().includes(' ')) {
      Alert.alert('Eksik Bilgi', 'Kart üzerindeki ismi ad ve soyad olarak girin.');
      return false;
    }
    const expErr = validateExpiry(expiryDate);
    if (expErr) {
      Alert.alert('Geçersiz Tarih', expErr);
      return false;
    }
    if (cvv.length !== 3) {
      Alert.alert('Geçersiz CVV', 'CVV 3 haneli olmalıdır.');
      return false;
    }
    return true;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponMessage({ text: '', type: '' });
    try {
      const res = await apiFetch('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code: couponCode.trim(), totalPrice: rawTotal }),
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
    } catch {
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

  const completeOrder = async () => {
    setStockError(null);

    if (!selectedAddress) {
      Alert.alert('Eksik Bilgi', 'Lütfen bir teslimat adresi seçin.');
      return;
    }
    if (!selectedShippingId) {
      Alert.alert('Eksik Bilgi', 'Lütfen bir kargo seçeneği seçin.');
      return;
    }
    if (!validateCardInfo()) return;

    setSubmitting(true);
    try {
      const res = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          addressId: selectedAddress.id,
          couponCode: appliedCouponCode,
          shippingOptionId: selectedShippingId,
        }),
      });

      if (res.ok) {
        Alert.alert('Sipariş Alındı!', 'Siparişiniz başarıyla oluşturuldu.', [
          { text: 'Tamam', onPress: () => router.replace('/(tabs)') },
        ]);
      } else {
        let errorMessage = 'Sipariş oluşturulamadı.';
        try {
          const data = await res.json();
          errorMessage = data.message || errorMessage;
        } catch {
          // JSON parse edilemezse varsayılan mesaj kalır
        }

        // Stok hatası mı diye kontrol et
        const lower = errorMessage.toLowerCase();
        if (lower.includes('adet') || lower.includes('stok')) {
          setStockError(errorMessage);
        } else {
          Alert.alert('Hata', errorMessage);
        }
      }
    } catch {
      Alert.alert('Hata', 'Sunucuya bağlanılamadı.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      enableOnAndroid
      extraScrollHeight={20}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Teslimat Bilgileri</Text>
      <Text style={styles.subtitle}>Siparişinizin teslim edileceği bilgileri girin</Text>

      <StockWarningBanner
        stockError={stockError}
        onGoToCart={() => router.push('/(tabs)/cart')}
      />

      <AddressSelector
        addresses={addresses}
        loading={loadingAddresses}
        selectedAddressId={selectedAddressId}
        expanded={addressListExpanded}
        onSelect={(id) => {
          setSelectedAddressId(id);
          setAddressListExpanded(false);
        }}
        onToggleExpanded={() => setAddressListExpanded((prev) => !prev)}
        onNavigateToAddresses={() =>
          router.navigate({
            pathname: '/addresses',
            params: { returnTo: 'checkout', total },
          })
        }
      />

      <ShippingOptionPicker
        shippingOptions={shippingOptions}
        selectedShippingId={selectedShippingId}
        loading={loadingShipping}
        onSelect={setSelectedShippingId}
      />

      <PaymentForm
        cardNumber={cardNumber}
        cardName={cardName}
        expiryDate={expiryDate}
        cvv={cvv}
        onCardNumberChange={setCardNumber}
        onCardNameChange={setCardName}
        onExpiryDateChange={setExpiryDate}
        onCvvChange={setCvv}
      />

      <CouponInput
        couponCode={couponCode}
        appliedCouponCode={appliedCouponCode}
        couponMessage={couponMessage}
        applyingCoupon={applyingCoupon}
        onCouponCodeChange={setCouponCode}
        onApply={handleApplyCoupon}
        onRemove={handleRemoveCoupon}
      />

      <CheckoutSummary
        rawTotal={rawTotal}
        discountAmount={discountAmount}
        shippingCost={shippingCost}
        finalPrice={finalPrice}
        selectedShippingName={selectedShipping?.name ?? null}
        hasShippingOptions={shippingOptions.length > 0}
        expanded={summaryExpanded}
        onToggleExpanded={() => setSummaryExpanded((prev) => !prev)}
      />

      <TouchableOpacity
        style={[
          styles.button,
          (shippingOptions.length === 0 || submitting) && styles.buttonDisabled,
        ]}
        onPress={completeOrder}
        activeOpacity={0.8}
        disabled={shippingOptions.length === 0 || submitting}
      >
        <Text style={styles.buttonText}>
          {submitting ? 'Gönderiliyor...' : 'Siparişi Tamamla ✓'}
        </Text>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingHorizontal: 20, paddingTop: 20 },
  title: { fontSize: 26, fontWeight: '800', color: '#1a1a1a', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#999', marginBottom: 20 },
  button: { backgroundColor: '#ff6600', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#ffb380' },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});