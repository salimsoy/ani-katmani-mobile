import { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  ActivityIndicator, StyleSheet, Alert, Modal,
} from 'react-native';
import { useLocalSearchParams, useFocusEffect, useRouter, Stack } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Send, AlertTriangle, X, RotateCcw } from 'lucide-react-native';
import { apiFetch } from '@/utils/api';
import type { ComplaintDetail } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  'Açık': '#ff9800',
  'İnceleniyor': '#2196f3',
  'Çözüldü': '#27ae60',
};

const ROLE_LABELS: Record<string, string> = {
  Customer: 'Müşteri',
  Seller: 'Satıcı',
  SuperAdmin: 'Yönetim',
};

export default function ComplaintDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchComplaint = useCallback(() => {
    apiFetch(`/complaints/${id}`)
      .then((res) => res.json())
      .then(setComplaint)
      .catch(() => setComplaint(null))
      .finally(() => setLoading(false));
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchComplaint();
    }, [fetchComplaint])
  );

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      const res = await apiFetch(`/complaints/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        Alert.alert('Hata', data?.message || 'Mesaj gönderilemedi.');
        return;
      }
      setMessage('');
      fetchComplaint();
    } catch {
      Alert.alert('Hata', 'Sunucuya bağlanılamadı.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff6600" />
      </View>
    );
  }

  if (!complaint) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Şikayet bulunamadı.</Text>
      </View>
    );
  }

  const isResolved = complaint.status === 'Çözüldü';

  return (
    <View style={styles.flex}>
      <Stack.Screen options={{ title: `Şikayet #${complaint.id}` }} />

      <KeyboardAwareScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 24 }}
        enableOnAndroid
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <Text style={styles.subject}>{complaint.subject}</Text>
          <View style={styles.badgesColumn}>
            {complaint.escalatedToAdmin && (
              <View style={styles.escalatedBadge}>
                <AlertTriangle size={11} color="#e74c3c" />
                <Text style={styles.escalatedText}>Yönetime İletildi</Text>
              </View>
            )}
            <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[complaint.status] || '#999') + '22' }]}>
              <Text style={[styles.statusText, { color: STATUS_COLORS[complaint.status] || '#999' }]}>
                {complaint.status}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ürün</Text>
            <Text style={styles.infoValue}>{complaint.figurineName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Sipariş</Text>
            <Text style={styles.infoValue}>#{complaint.orderId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tip</Text>
            <Text style={styles.infoValue}>
              {complaint.type}{complaint.category ? ` · ${complaint.category}` : ''}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Talep</Text>
            <Text style={styles.infoValue}>{complaint.requestedResolution}</Text>
          </View>
          {complaint.resolutionOutcome && (
            <View style={[styles.infoRow, styles.infoRowLast]}>
              <Text style={styles.infoLabel}>Çözüm</Text>
              <Text style={[styles.infoValue, { color: '#27ae60' }]}>{complaint.resolutionOutcome}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.returnShortcut}
          onPress={() =>
            router.push({
              pathname: '/return-new',
              params: {
                orderItemId: String(complaint.orderItemId),
                figurineName: complaint.figurineName,
                complaintId: String(complaint.id),
              },
            })
          }
        >
          <RotateCcw size={16} color="#ff6600" />
          <Text style={styles.returnShortcutText}>İade Talebi Oluştur</Text>
        </TouchableOpacity>

        {complaint.images.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Fotoğraflar</Text>
            <View style={styles.imageRow}>
              {complaint.images.map((img) => (
                <TouchableOpacity key={img.id} onPress={() => setPreviewImage(img.imageUrl)}>
                  <Image source={{ uri: img.imageUrl }} style={styles.imageThumb} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>Mesajlar</Text>
        {complaint.comments.map((c) => {
          const isCustomer = c.authorRole === 'Customer';
          return (
            <View
              key={c.id}
              style={[styles.messageCard, isCustomer ? styles.messageCardCustomer : styles.messageCardOther]}
            >
              <View style={styles.messageHeader}>
                <Text style={styles.messageAuthor}>
                  {c.authorName}
                  <Text style={styles.messageRole}> · {ROLE_LABELS[c.authorRole] ?? c.authorRole}</Text>
                </Text>
                <Text style={styles.messageDate}>
                  {new Date(c.createdAt).toLocaleDateString('tr-TR', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                  })}
                </Text>
              </View>
              <Text style={styles.messageText}>{c.message}</Text>
            </View>
          );
        })}

        {isResolved && (
          <View style={styles.resolvedBox}>
            <Text style={styles.resolvedText}>Bu şikayet çözüldü olarak kapatıldı.</Text>
          </View>
        )}
      </KeyboardAwareScrollView>

      {!isResolved && (
        <View style={styles.composer}>
          <TextInput
            style={styles.composerInput}
            placeholder="Mesajınızı yazın..."
            value={message}
            onChangeText={setMessage}
            multiline
            placeholderTextColor="#bbb"
          />
          <TouchableOpacity
            style={[styles.sendButton, (sending || !message.trim()) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={sending || !message.trim()}
          >
            <Send size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={!!previewImage} transparent animationType="fade" onRequestClose={() => setPreviewImage(null)}>
        <TouchableOpacity style={styles.previewOverlay} activeOpacity={1} onPress={() => setPreviewImage(null)}>
          <TouchableOpacity style={styles.previewCloseButton} onPress={() => setPreviewImage(null)}>
            <X size={22} color="#fff" />
          </TouchableOpacity>
          {previewImage && (
            <Image source={{ uri: previewImage }} style={styles.previewImage} resizeMode="contain" />
          )}
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#999' },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 8 },
  subject: { flex: 1, fontSize: 19, fontWeight: '800', color: '#1a1a1a' },
  badgesColumn: { alignItems: 'flex-end', gap: 6 },
  escalatedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#fdecea', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  escalatedText: { fontSize: 10, fontWeight: '700', color: '#e74c3c' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '700' },

  infoCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  infoRowLast: { marginBottom: 0, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10 },
  infoLabel: { fontSize: 13, color: '#999' },
  infoValue: { fontSize: 13, fontWeight: '600', color: '#1a1a1a' },

  returnShortcut: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#fff5ee', borderRadius: 12, paddingVertical: 12, marginBottom: 20,
  },
  returnShortcutText: { fontSize: 14, fontWeight: '700', color: '#ff6600' },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 10 },
  imageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  imageThumb: { width: 72, height: 72, borderRadius: 12, backgroundColor: '#eee' },

  messageCard: { borderRadius: 14, padding: 12, marginBottom: 10 },
  messageCardCustomer: { backgroundColor: '#fff' },
  messageCardOther: { backgroundColor: '#fff5ee' },
  messageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  messageAuthor: { fontSize: 13, fontWeight: '700', color: '#1a1a1a' },
  messageRole: { fontSize: 11, fontWeight: '600', color: '#999' },
  messageDate: { fontSize: 11, color: '#bbb' },
  messageText: { fontSize: 13, color: '#333', lineHeight: 18 },

  resolvedBox: { backgroundColor: '#e8f8f0', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8 },
  resolvedText: { fontSize: 13, fontWeight: '700', color: '#27ae60' },

  composer: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: 20, paddingVertical: 10, paddingBottom: 20,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0',
  },
  composerInput: {
    flex: 1, backgroundColor: '#f8f9fa', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 14, color: '#1a1a1a', maxHeight: 100,
  },
  sendButton: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: '#ff6600',
    justifyContent: 'center', alignItems: 'center',
  },
  sendButtonDisabled: { opacity: 0.5 },

  previewOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  previewCloseButton: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 8 },
  previewImage: { width: '100%', height: '80%' },
});
