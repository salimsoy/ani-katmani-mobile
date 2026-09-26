import { useState, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, TextInput, ScrollView, Modal
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { apiFetch } from '@/utils/api';
import { extractPhoneDigits, digitsFromExistingPhone, formatPhoneDisplay, toE164 } from '@/utils/phone';
import { useProvinces, useDistricts } from '@/hooks/useTurkeyLocations';
import LocationPickerModal from '@/components/LocationPickerModal';

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

const emptyForm = {
  title: '', fullName: '', phoneNumber: '', city: '', district: '', addressText: '', isDefault: false,
};

export default function AddressesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ returnTo?: string; total?: string }>();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
  const { provinces, loading: loadingProvinces } = useProvinces();
  const { districts, loading: loadingDistricts } = useDistricts(selectedProvinceId);
  const [provincePickerVisible, setProvincePickerVisible] = useState(false);
  const [districtPickerVisible, setDistrictPickerVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [savingDefaultId, setSavingDefaultId] = useState<number | null>(null);

  const fetchAddresses = () => {
    apiFetch('/addresses')
      .then(res => res.json())
      .then(data => setAddresses(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useFocusEffect(
      useCallback(() => {
        fetchAddresses();
      }, [])
    );

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSelectedProvinceId(null);
    setError('');
    setModalVisible(true);
  };

  const openEditModal = (item: Address) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      fullName: item.fullName,
      phoneNumber: digitsFromExistingPhone(item.phoneNumber),
      city: item.city,
      district: item.district,
      addressText: item.addressText,
      isDefault: item.isDefault,
    });
    const matchedProvince = provinces.find(p => p.name === item.city);
    setSelectedProvinceId(matchedProvince?.id ?? null);
    setError('');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.fullName || !form.phoneNumber || !form.city || !form.district || !form.addressText) {
      setError('Tüm alanları doldurun.');
      return;
    }
    if (form.phoneNumber.length !== 10) {
      setError('Telefon numarası 10 haneli olmalıdır.');
      return;
    }

    const payload = { ...form, phoneNumber: toE164(form.phoneNumber) };

    try {
      const response = await apiFetch(editingId ? `/addresses/${editingId}` : '/addresses', {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setError('İşlem başarısız.');
        return;
      }

      if (editingId) {
        setModalVisible(false);
        fetchAddresses();
      } else {
        const created = await response.json();
        setModalVisible(false);
        if (params.returnTo === 'checkout') {
          router.navigate({
            pathname: '/checkout',
            params: { total: params.total, selectedAddressId: String(created.id) },
          });
        } else {
          fetchAddresses();
        }
      }
    } catch {
      setError('Sunucuya bağlanılamadı.');
    }
  };

  const handleDelete = (id: number, title: string) => {
    Alert.alert('Adresi Sil', `"${title}" adresini silmek istediğinize emin misiniz?`, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          const response = await apiFetch(`/addresses/${id}`, { method: 'DELETE' });
          if (response.ok) fetchAddresses();
          else Alert.alert('Hata', 'Silme işlemi başarısız.');
        },
      },
    ]);
  };

  const handleSetDefault = async (item: Address) => {
    if (item.isDefault) return;
    setSavingDefaultId(item.id);
    try {
      const response = await apiFetch(`/addresses/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: item.title,
          fullName: item.fullName,
          phoneNumber: item.phoneNumber,
          city: item.city,
          district: item.district,
          addressText: item.addressText,
          isDefault: true,
        }),
      });
      if (response.ok) fetchAddresses();
      else Alert.alert('Hata', 'Varsayılan adres güncellenemedi.');
    } finally {
      setSavingDefaultId(null);
    }
  };

  const useThisAddress = (id: number) => {
    router.navigate({
      pathname: '/checkout',
      params: { total: params.total, selectedAddressId: String(id) },
    });
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#ff6600" /></View>;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Adreslerim', headerBackTitle: 'Geri', headerTintColor: '#ff6600' }} />

      {params.returnTo === 'checkout' && (
        <TouchableOpacity onPress={() => router.back()} style={styles.returnLink}>
          <Text style={styles.returnLinkText}>← Checkout'a Dön</Text>
        </TouchableOpacity>
      )}

      <View style={styles.header}>
        <Text style={styles.title}>Adreslerim</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Ekle</Text>
        </TouchableOpacity>
      </View>

      {addresses.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>📍</Text>
          <Text style={styles.emptyText}>Henüz kayıtlı adresiniz yok</Text>
          <Text style={styles.emptySubText}>Hızlı checkout için bir adres ekleyin</Text>
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View style={[styles.card, item.isDefault && styles.cardDefault]}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  {item.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>VARSAYILAN</Text>
                    </View>
                  )}
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => openEditModal(item)} style={styles.iconButton}>
                    <Text style={styles.iconButtonText}>✎</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id, item.title)} style={styles.iconButton}>
                    <Text style={[styles.iconButtonText, { color: '#e74c3c' }]}>🗑</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.cardText}>{item.fullName}</Text>
              <Text style={styles.cardText}>{item.phoneNumber}</Text>
              <Text style={styles.cardTextMuted}>
                {item.addressText}, {item.district}/{item.city}
              </Text>

              <View style={styles.cardFooter}>
                {!item.isDefault && (
                  <TouchableOpacity onPress={() => handleSetDefault(item)} disabled={savingDefaultId === item.id}>
                    <Text style={styles.setDefaultText}>
                      {savingDefaultId === item.id ? 'Kaydediliyor...' : 'Varsayılan yap'}
                    </Text>
                  </TouchableOpacity>
                )}
                {params.returnTo === 'checkout' && (
                  <TouchableOpacity style={styles.useButton} onPress={() => useThisAddress(item.id)}>
                    <Text style={styles.useButtonText}>Bu Adresi Kullan</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={styles.modal} contentContainerStyle={{ paddingBottom: 60 }}>
          <Text style={styles.modalTitle}>{editingId ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Adres Etiketi *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ev, İş..."
              value={form.title}
              onChangeText={val => setForm(p => ({ ...p, title: val }))}
              placeholderTextColor="#bbb"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Ad Soyad *</Text>
            <TextInput
              style={styles.input}
              placeholder="Teslim alacak kişi"
              value={form.fullName}
              onChangeText={val => setForm(p => ({ ...p, fullName: val }))}
              placeholderTextColor="#bbb"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Telefon Numarası *</Text>
            <View style={styles.phoneInputRow}>
              <Text style={styles.phonePrefix}>+90</Text>
              <TextInput
                style={styles.phoneInput}
                placeholder="555 123 45 67"
                keyboardType="phone-pad"
                value={formatPhoneDisplay(form.phoneNumber)}
                onChangeText={val => setForm(p => ({ ...p, phoneNumber: extractPhoneDigits(val) }))}
                placeholderTextColor="#bbb"
              />
            </View>
          </View>

          <View style={styles.rowGroup}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>İl *</Text>
              <TouchableOpacity style={styles.input} onPress={() => setProvincePickerVisible(true)}>
                <Text style={form.city ? styles.pickerValueText : styles.pickerPlaceholderText}>
                  {form.city || (loadingProvinces ? 'Yükleniyor...' : 'İl seçin')}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>İlçe *</Text>
              <TouchableOpacity
                style={[styles.input, !selectedProvinceId && { opacity: 0.5 }]}
                onPress={() => selectedProvinceId && setDistrictPickerVisible(true)}
                disabled={!selectedProvinceId}
              >
                <Text style={form.district ? styles.pickerValueText : styles.pickerPlaceholderText}>
                  {form.district || (!selectedProvinceId ? 'Önce il seçin' : loadingDistricts ? 'Yükleniyor...' : 'İlçe seçin')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Açık Adres *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Mahalle, sokak, bina/daire no..."
              multiline
              value={form.addressText}
              onChangeText={val => setForm(p => ({ ...p, addressText: val }))}
              placeholderTextColor="#bbb"
            />
          </View>

          <TouchableOpacity
            style={styles.defaultToggleRow}
            onPress={() => setForm(p => ({ ...p, isDefault: !p.isDefault }))}
            activeOpacity={0.7}
          >
            <Text style={styles.defaultToggleLabel}>Varsayılan adres yap</Text>
            <View style={[styles.toggle, form.isDefault && styles.toggleActive]}>
              <View style={[styles.toggleDot, form.isDefault && styles.toggleDotActive]} />
            </View>
          </TouchableOpacity>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{editingId ? 'Güncelle' : 'Kaydet'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.cancelButtonText}>İptal</Text>
          </TouchableOpacity>
        </ScrollView>
        {/* Picker'lar artık form modalının İÇİNDE */}
        <LocationPickerModal
          visible={provincePickerVisible}
          title="İl Seçin"
          items={provinces}
          loading={loadingProvinces}
          onSelect={(item) => {
            setSelectedProvinceId(item.id);
            setForm(p => ({ ...p, city: item.name, district: '' }));
            setProvincePickerVisible(false);
          }}
          onClose={() => setProvincePickerVisible(false)}
        />

        <LocationPickerModal
          visible={districtPickerVisible}
          title="İlçe Seçin"
          items={districts}
          loading={loadingDistricts}
          onSelect={(item) => {
            setForm(p => ({ ...p, district: item.name }));
            setDistrictPickerVisible(false);
          }}
          onClose={() => setDistrictPickerVisible(false)}
        />
      </Modal>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingHorizontal: 20, paddingTop: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  returnLink: { marginBottom: 8 },
  returnLinkText: { fontSize: 13, color: '#999', fontWeight: '600' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#1a1a1a' },
  addButton: { backgroundColor: '#ff6600', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 17, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  emptySubText: { fontSize: 13, color: '#999' },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 2, borderColor: 'transparent',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  cardDefault: { borderColor: '#ff6600' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#1a1a1a' },
  defaultBadge: { backgroundColor: '#fff3e8', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  defaultBadgeText: { fontSize: 9, fontWeight: '800', color: '#ff6600' },
  cardActions: { flexDirection: 'row', gap: 4 },
  iconButton: { padding: 6 },
  iconButtonText: { fontSize: 15, color: '#666' },
  cardText: { fontSize: 13, color: '#555' },
  cardTextMuted: { fontSize: 13, color: '#999', marginTop: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  setDefaultText: { fontSize: 12, fontWeight: '700', color: '#ff6600' },
  useButton: { backgroundColor: '#ff6600', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, marginLeft: 'auto' },
  useButtonText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  modal: { flex: 1, backgroundColor: '#f8f9fa', padding: 24, paddingTop: 48 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a1a', marginBottom: 20 },
  formGroup: { marginBottom: 14 },
  rowGroup: { flexDirection: 'row', gap: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  input: {
    backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, borderWidth: 1, borderColor: '#e0e0e0', color: '#1a1a1a',
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  phoneInputRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10,
    borderWidth: 1, borderColor: '#e0e0e0',
  },
  phonePrefix: { paddingLeft: 14, paddingRight: 6, fontSize: 14, fontWeight: '700', color: '#888' },
  phoneInput: { flex: 1, paddingVertical: 12, paddingRight: 14, fontSize: 14, color: '#1a1a1a' },
  defaultToggleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#e0e0e0',
    paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8,
  },
  defaultToggleLabel: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  toggle: { width: 44, height: 24, borderRadius: 12, backgroundColor: '#ddd', padding: 2, justifyContent: 'center' },
  toggleActive: { backgroundColor: '#ff6600' },
  toggleDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  toggleDotActive: { alignSelf: 'flex-end' },
  errorText: { fontSize: 13, color: '#e74c3c', marginBottom: 8 },
  saveButton: { backgroundColor: '#ff6600', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cancelButton: { paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  cancelButtonText: { color: '#999', fontSize: 15 },
  userCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  userAvatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#ff6600',
    justifyContent: 'center', alignItems: 'center',
  },
  userName: { fontSize: 15, fontWeight: '800', color: '#1a1a1a' },
  userEmail: { fontSize: 13, color: '#999', marginTop: 1 },
  pickerValueText: { fontSize: 14, color: '#1a1a1a' },
  pickerPlaceholderText: { fontSize: 14, color: '#bbb' },
});