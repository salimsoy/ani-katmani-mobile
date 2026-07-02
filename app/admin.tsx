import { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, TextInput, ScrollView, Modal
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { apiFetch } from '@/utils/api';

type Figurine = {
  id: number;
  name: string;
  price: number;
  filamentType: string;
  scale: string;
  printTimeInHours: number;
  imageUrl: string;
};

const emptyForm = {
  name: '', price: '', filamentType: '', scale: '', printTimeInHours: '', imageUrl: ''
};

export default function AdminScreen() {
  const [figurines, setFigurines] = useState<Figurine[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      fetchFigurines();
    }, [])
  );

  const fetchFigurines = () => {
    setLoading(true);
    apiFetch('/figurines')
      .then(res => res.json())
      .then(data => {
        setFigurines(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalVisible(true);
  };

  const openEditModal = (item: Figurine) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      price: item.price.toString(),
      filamentType: item.filamentType,
      scale: item.scale,
      printTimeInHours: item.printTimeInHours.toString(),
      imageUrl: item.imageUrl || ''
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.filamentType || !form.scale || !form.printTimeInHours) {
      Alert.alert('Hata', 'Tüm zorunlu alanları doldurun.');
      return;
    }

    const body = {
      name: form.name,
      price: parseFloat(form.price),
      filamentType: form.filamentType,
      scale: form.scale,
      printTimeInHours: parseInt(form.printTimeInHours),
      imageUrl: form.imageUrl
    };

    const isEdit = editingId !== null;
    const response = await apiFetch(
      isEdit ? `/figurines/${editingId}` : '/figurines',
      { method: isEdit ? 'PUT' : 'POST', body: JSON.stringify(body) }
    );

    if (response.ok) {
      Alert.alert('Başarılı', isEdit ? 'Figür güncellendi.' : 'Figür eklendi.');
      setModalVisible(false);
      fetchFigurines();
    } else {
      Alert.alert('Hata', 'İşlem başarısız.');
    }
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert(
      'Figürü Sil',
      `"${name}" figürünü silmek istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            const response = await apiFetch(`/figurines/${id}`, { method: 'DELETE' });
            if (response.ok) {
              fetchFigurines();
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
        <Text style={styles.title}>Admin Paneli</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Ekle</Text>
        </TouchableOpacity>
      </View>

      {/* Sipariş Yönetimi Butonu - header'ın ALTINDA, tam genişlik */}
      <TouchableOpacity
        style={styles.ordersButton}
        onPress={() => router.push('/admin-orders')}
      >
        <Text style={styles.ordersButtonText}>📋 Sipariş Yönetimi</Text>
      </TouchableOpacity>

      <FlatList
        data={figurines}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardPrice}>{item.price} ₺</Text>
              <Text style={styles.cardMeta}>{item.filamentType} • {item.scale}</Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.editButton} onPress={() => openEditModal(item)}>
                <Text style={styles.editButtonText}>Düzenle</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id, item.name)}>
                <Text style={styles.deleteButtonText}>Sil</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Ekle/Düzenle Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={styles.modal} contentContainerStyle={{ paddingBottom: 60 }}>
          <Text style={styles.modalTitle}>{editingId ? 'Figürü Düzenle' : 'Yeni Figür Ekle'}</Text>

          {[
            { label: 'İsim *', key: 'name', placeholder: 'Zeytin Kedi Figürü' },
            { label: 'Fiyat (₺) *', key: 'price', placeholder: '350', keyboard: 'numeric' },
            { label: 'Filament Tipi *', key: 'filamentType', placeholder: 'PLA, Reçine...' },
            { label: 'Ölçek *', key: 'scale', placeholder: '1/6, 1/10...' },
            { label: 'Üretim Süresi (saat) *', key: 'printTimeInHours', placeholder: '12', keyboard: 'numeric' },
            { label: 'Görsel URL', key: 'imageUrl', placeholder: 'https://...' },
          ].map(field => (
            <View key={field.key} style={styles.formGroup}>
              <Text style={styles.label}>{field.label}</Text>
              <TextInput
                style={styles.input}
                placeholder={field.placeholder}
                value={form[field.key as keyof typeof form]}
                onChangeText={val => setForm(prev => ({ ...prev, [field.key]: val }))}
                keyboardType={field.keyboard as any || 'default'}
                placeholderTextColor="#bbb"
              />
            </View>
          ))}

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{editingId ? 'Güncelle' : 'Kaydet'}</Text>
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
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6,
  },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 2 },
  cardPrice: { fontSize: 14, fontWeight: '600', color: '#ff6600', marginBottom: 2 },
  cardMeta: { fontSize: 12, color: '#aaa' },
  cardActions: { flexDirection: 'column', gap: 6 },
  editButton: { backgroundColor: '#1a1a1a', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  editButtonText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  deleteButton: { backgroundColor: '#ffe5e5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  deleteButtonText: { color: '#e74c3c', fontSize: 12, fontWeight: '600' },
  modal: { flex: 1, backgroundColor: '#f8f9fa', padding: 24, paddingTop: 48 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', marginBottom: 24 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  input: {
    backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 12, fontSize: 15, borderWidth: 1, borderColor: '#e0e0e0', color: '#1a1a1a',
  },
  saveButton: { backgroundColor: '#ff6600', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  saveButtonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  cancelButton: { paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  cancelButtonText: { color: '#999', fontSize: 15 },
  ordersButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  ordersButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});