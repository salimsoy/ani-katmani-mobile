import { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, TextInput, ScrollView, Modal
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { apiFetch } from '@/utils/api';

type Coupon = {
  id: number;
  code: string;
  discountType: string;
  discountValue: number;
  minimumCartAmount: number;
  isActive: boolean;
  expiryDate: string | null;
  createdAt: string;
};

const emptyForm = {
  code: '', discountType: 'Percentage', discountValue: '', minimumCartAmount: '', expiryDate: ''
};

export default function AdminCouponsScreen() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchCoupons = () => {
    setLoading(true);
    apiFetch('/coupons')
      .then(res => res.json())
      .then(data => {
        setCoupons(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useFocusEffect(
    useCallback(() => {
      fetchCoupons();
    }, [])
  );

  const openAddModal = () => {
    setForm(emptyForm);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.discountValue) {
      Alert.alert('Hata', 'Kupon kodu ve indirim değeri zorunludur.');
      return;
    }

    const body = {
      code: form.code.toUpperCase(),
      discountType: form.discountType,
      discountValue: parseFloat(form.discountValue),
      minimumCartAmount: form.minimumCartAmount ? parseFloat(form.minimumCartAmount) : 0,
      expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : null
    };

    const response = await apiFetch('/coupons', {
      method: 'POST',
      body: JSON.stringify(body)
    });

    if (response.ok) {
      Alert.alert('Başarılı', 'Kupon oluşturuldu.');
      setModalVisible(false);
      fetchCoupons();
    } else {
      const errText = await response.text();
      Alert.alert('Hata', errText || 'Kupon oluşturulamadı.');
    }
  };

  const handleDelete = (id: number, code: string) => {
    Alert.alert(
      'Kuponu Sil',
      `"${code}" kuponunu silmek istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            const response = await apiFetch(`/coupons/${id}`, { method: 'DELETE' });
            if (response.ok) {
              fetchCoupons();
            } else {
              Alert.alert('Hata', 'Silme işlemi başarısız.');
            }
          }
        }
      ]
    );
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#ff6600" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Kupon Yönetimi</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Ekle</Text>
        </TouchableOpacity>
      </View>

      {coupons.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Henüz kupon oluşturulmamış.</Text>
        </View>
      ) : (
        <FlatList
          data={coupons}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardInfo}>
                <Text style={styles.cardCode}>{item.code}</Text>
                <Text style={styles.cardDiscount}>
                  {item.discountType === 'Percentage'
                    ? `%${item.discountValue} indirim`
                    : `${item.discountValue} ₺ indirim`}
                </Text>
                {item.minimumCartAmount > 0 && (
                  <Text style={styles.cardMeta}>Min. sepet: {item.minimumCartAmount} ₺</Text>
                )}
                {item.expiryDate && (
                  <Text style={styles.cardMeta}>
                    Son kullanma: {new Date(item.expiryDate).toLocaleDateString('tr-TR')}
                  </Text>
                )}
              </View>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id, item.code)}>
                <Text style={styles.deleteButtonText}>Sil</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* Ekle Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={styles.modal} contentContainerStyle={{ paddingBottom: 60 }}>
          <Text style={styles.modalTitle}>Yeni Kupon Oluştur</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Kupon Kodu *</Text>
            <TextInput
              style={styles.input}
              placeholder="INDIRIM10"
              value={form.code}
              onChangeText={val => setForm(prev => ({ ...prev, code: val }))}
              autoCapitalize="characters"
              placeholderTextColor="#bbb"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>İndirim Tipi *</Text>
            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[styles.typeButton, form.discountType === 'Percentage' && styles.typeButtonActive]}
                onPress={() => setForm(prev => ({ ...prev, discountType: 'Percentage' }))}
              >
                <Text style={[styles.typeButtonText, form.discountType === 'Percentage' && styles.typeButtonTextActive]}>
                  Yüzde (%)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, form.discountType === 'Fixed' && styles.typeButtonActive]}
                onPress={() => setForm(prev => ({ ...prev, discountType: 'Fixed' }))}
              >
                <Text style={[styles.typeButtonText, form.discountType === 'Fixed' && styles.typeButtonTextActive]}>
                  Sabit Tutar (₺)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              İndirim Değeri * {form.discountType === 'Percentage' ? '(%)' : '(₺)'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={form.discountType === 'Percentage' ? '10' : '50'}
              value={form.discountValue}
              onChangeText={val => setForm(prev => ({ ...prev, discountValue: val }))}
              keyboardType="numeric"
              placeholderTextColor="#bbb"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Minimum Sepet Tutarı (₺)</Text>
            <TextInput
              style={styles.input}
              placeholder="0 (opsiyonel)"
              value={form.minimumCartAmount}
              onChangeText={val => setForm(prev => ({ ...prev, minimumCartAmount: val }))}
              keyboardType="numeric"
              placeholderTextColor="#bbb"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Son Kullanma Tarihi</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-AA-GG (opsiyonel, örn: 2026-12-31)"
              value={form.expiryDate}
              onChangeText={val => setForm(prev => ({ ...prev, expiryDate: val }))}
              placeholderTextColor="#bbb"
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Kaydet</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.cancelButtonText}>İptal</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingTop: 60, paddingHorizontal: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '800', color: '#1a1a1a' },
  addButton: { backgroundColor: '#ff6600', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  emptyText: { fontSize: 16, color: '#999' },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6,
  },
  cardInfo: { flex: 1 },
  cardCode: { fontSize: 16, fontWeight: '800', color: '#1a1a1a', marginBottom: 4, letterSpacing: 0.5 },
  cardDiscount: { fontSize: 14, fontWeight: '700', color: '#ff6600', marginBottom: 4 },
  cardMeta: { fontSize: 12, color: '#aaa', marginBottom: 2 },
  deleteButton: { backgroundColor: '#ffe5e5', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  deleteButtonText: { color: '#e74c3c', fontSize: 13, fontWeight: '600' },
  modal: { flex: 1, backgroundColor: '#f8f9fa', padding: 24, paddingTop: 48 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', marginBottom: 24 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  input: {
    backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 12, fontSize: 15, borderWidth: 1, borderColor: '#e0e0e0', color: '#1a1a1a',
  },
  typeRow: { flexDirection: 'row', gap: 10 },
  typeButton: {
    flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center',
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0e0',
  },
  typeButtonActive: { backgroundColor: '#ff6600', borderColor: '#ff6600' },
  typeButtonText: { fontSize: 13, fontWeight: '600', color: '#888' },
  typeButtonTextActive: { color: '#fff' },
  saveButton: { backgroundColor: '#ff6600', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  saveButtonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  cancelButton: { paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  cancelButtonText: { color: '#999', fontSize: 15 },
});