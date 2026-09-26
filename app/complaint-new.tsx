import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as ImagePicker from 'expo-image-picker';
import { ImagePlus, X } from 'lucide-react-native';
import { apiFetch } from '@/utils/api';
import OptionPicker from '@/components/OptionPicker';

const TYPES = [
  { value: 'Ürün', label: 'Ürün' },
  { value: 'Satıcı', label: 'Satıcı' },
];
const CATEGORIES = [
  { value: 'Hasarlı Geldi', label: 'Hasarlı Geldi' },
  { value: 'Yanlış Ürün', label: 'Yanlış Ürün' },
  { value: 'Ulaşmadı', label: 'Ulaşmadı' },
  { value: 'Açıklamaya Uymuyor', label: 'Açıklamaya Uymuyor' },
  { value: 'Diğer', label: 'Diğer' },
];
const RESOLUTIONS = [
  { value: 'İade', label: 'İade' },
  { value: 'Değişim', label: 'Değişim' },
  { value: 'Kısmi İade', label: 'Kısmi İade' },
  { value: 'Bilgi', label: 'Bilgi' },
];

type PickedImage = { uri: string; name: string; type: string };

export default function ComplaintNewScreen() {
  const router = useRouter();
  const { orderItemId, figurineName } = useLocalSearchParams<{
    orderItemId: string;
    figurineName?: string;
  }>();

  const [type, setType] = useState('Ürün');
  const [category, setCategory] = useState('Hasarlı Geldi');
  const [resolution, setResolution] = useState('İade');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<PickedImage[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('İzin Gerekli', 'Fotoğraf seçebilmek için galeri izni vermeniz gerekiyor.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    const ext = asset.uri.split('.').pop() ?? 'jpg';
    setImages((prev) => [
      ...prev,
      { uri: asset.uri, name: `photo_${Date.now()}.${ext}`, type: `image/${ext}` },
    ]);
  };

  const removeImage = (uri: string) => {
    setImages((prev) => prev.filter((img) => img.uri !== uri));
  };

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Eksik Bilgi', 'Konu ve açıklama boş olamaz.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch('/complaints', {
        method: 'POST',
        body: JSON.stringify({
          orderItemId: Number(orderItemId),
          type,
          category: type === 'Ürün' ? category : null,
          requestedResolution: resolution,
          subject,
          message,
        }),
      });

      if (!res.ok) {
        let errorMessage = 'Şikayet oluşturulamadı.';
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
      const complaintId = data.complaintId as number;

      for (const img of images) {
        try {
          const formData = new FormData();
          formData.append('file', { uri: img.uri, name: img.name, type: img.type } as any);
          await apiFetch(`/complaints/${complaintId}/images`, {
            method: 'POST',
            body: formData,
          });
        } catch {
          // Bir fotoğraf başarısız olsa bile diğerlerini yüklemeye devam et
        }
      }

      router.replace(`/complaint-detail/${complaintId}`);
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
      <Text style={styles.title}>Şikayet Oluştur</Text>
      {figurineName ? <Text style={styles.subtitle}>{figurineName}</Text> : null}

      <OptionPicker
        label="Şikayet Tipi"
        options={TYPES}
        selected={type}
        onSelect={setType}
        helperText={type === 'Ürün' ? 'Satıcı ilgilenecek.' : 'Platform yönetimi ilgilenecek.'}
      />

      {type === 'Ürün' && (
        <OptionPicker label="Kategori" options={CATEGORIES} selected={category} onSelect={setCategory} />
      )}

      <OptionPicker label="Talebiniz" options={RESOLUTIONS} selected={resolution} onSelect={setResolution} />

      <Text style={styles.label}>Konu</Text>
      <TextInput
        style={styles.input}
        placeholder="Kısa bir başlık"
        value={subject}
        onChangeText={setSubject}
        placeholderTextColor="#bbb"
      />

      <Text style={styles.label}>Açıklama</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Sorunu detaylı anlatın"
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        placeholderTextColor="#bbb"
      />

      <Text style={styles.label}>Fotoğraflar (opsiyonel)</Text>
      <View style={styles.imageRow}>
        {images.map((img) => (
          <View key={img.uri} style={styles.imageWrapper}>
            <Image source={{ uri: img.uri }} style={styles.imageThumb} />
            <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(img.uri)}>
              <X size={12} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
          <ImagePlus size={22} color="#999" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.submitButtonText}>
          {submitting ? 'Gönderiliyor...' : 'Şikayeti Gönder'}
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
  imageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  imageWrapper: { width: 72, height: 72, position: 'relative' },
  imageThumb: { width: 72, height: 72, borderRadius: 12, backgroundColor: '#eee' },
  removeImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    width: 72,
    height: 72,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#ff6600',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
