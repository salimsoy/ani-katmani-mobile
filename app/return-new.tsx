import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { apiFetch } from '@/utils/api';
import OptionPicker from '@/components/OptionPicker';

const REASONS = [
  { value: 'Ayıplı Ürün', label: 'Ayıplı Ürün' },
  { value: 'Cayma Hakkı', label: 'Cayma Hakkı' },
];

export default function ReturnNewScreen() {
  const router = useRouter();
  const { orderItemId, figurineName, complaintId } = useLocalSearchParams<{
    orderItemId: string;
    figurineName?: string;
    complaintId?: string;
  }>();

  const [reason, setReason] = useState('Ayıplı Ürün');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Eksik Bilgi', 'Açıklama boş olamaz.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch('/returns', {
        method: 'POST',
        body: JSON.stringify({
          orderItemId: Number(orderItemId),
          reason,
          description,
          complaintId: complaintId ? Number(complaintId) : null,
        }),
      });

      if (!res.ok) {
        let errorMessage = 'İade talebi oluşturulamadı.';
        try {
          const data = await res.json();
          errorMessage = data.message || errorMessage;
        } catch {
          // JSON parse edilemezse varsayılan mesaj kalır
        }
        Alert.alert('Hata', errorMessage);
        return;
      }

      const data = await res.json();
      router.replace(`/return-detail/${data.returnId}`);
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
      <Text style={styles.title}>İade Talebi Oluştur</Text>
      {figurineName ? <Text style={styles.subtitle}>{figurineName}</Text> : null}

      <OptionPicker label="Sebep" options={REASONS} selected={reason} onSelect={setReason} />

      <Text style={styles.label}>Açıklama</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="İade sebebinizi detaylı anlatın"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        placeholderTextColor="#bbb"
      />

      <TouchableOpacity
        style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.submitButtonText}>
          {submitting ? 'Gönderiliyor...' : 'İade Talebini Gönder'}
        </Text>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingHorizontal: 20, paddingTop: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#1a1a1a', marginBottom: 2 },
  subtitle: { fontSize: 14, color: '#999', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1a1a1a',
    marginBottom: 16,
  },
  textArea: { minHeight: 100 },
  submitButton: {
    backgroundColor: '#ff6600',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
