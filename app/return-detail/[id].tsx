import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useFocusEffect, Stack } from 'expo-router';
import { Truck } from 'lucide-react-native';
import { apiFetch } from '@/utils/api';
import Stepper from '@/components/Stepper';
import type { Return } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  'Talep Edildi': '#ff9800',
  'Onaylandı': '#2196f3',
  'Reddedildi': '#e74c3c',
  'Kargoya Verildi': '#9c27b0',
  'Satıcıya Ulaştı': '#3f51b5',
  'Ücret İadesi Yapıldı': '#27ae60',
};

const STEPS = ['Talep Edildi', 'Onaylandı', 'Kargoya Verildi', 'Satıcıya Ulaştı', 'Ücret İadesi Yapıldı'];

export default function ReturnDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [ret, setRet] = useState<Return | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const fetchReturn = useCallback(() => {
    apiFetch(`/returns/${id}`)
      .then((res) => res.json())
      .then(setRet)
      .catch(() => setRet(null))
      .finally(() => setLoading(false));
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchReturn();
    }, [fetchReturn])
  );

  const handleShip = async () => {
    setBusy(true);
    try {
      const res = await apiFetch(`/returns/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'Kargoya Verildi', rejectionReason: null }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        Alert.alert('Hata', data?.message || 'Durum güncellenemedi.');
        return;
      }
      fetchReturn();
    } catch {
      Alert.alert('Hata', 'Sunucuya bağlanılamadı.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff6600" />
      </View>
    );
  }

  if (!ret) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>İade talebi bulunamadı.</Text>
      </View>
    );
  }

  const isRejected = ret.status === 'Reddedildi';
  const isRefunded = ret.status === 'Ücret İadesi Yapıldı';
  const currentStepIndex = STEPS.indexOf(ret.status);
  const canShip = ret.status === 'Onaylandı';

  return (
    <View style={styles.flex}>
      <Stack.Screen options={{ title: `İade #${ret.id}` }} />

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.headerRow}>
          <Text style={styles.figurineName}>{ret.figurineName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[ret.status] || '#999') + '22' }]}>
            <Text style={[styles.statusText, { color: STATUS_COLORS[ret.status] || '#999' }]}>
              {ret.status}
            </Text>
          </View>
        </View>

        {!isRejected && (
          <View style={styles.stepperCard}>
            <Stepper steps={STEPS.map((label, idx) => ({ label, done: idx <= currentStepIndex }))} />
          </View>
        )}

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Sipariş</Text>
            <Text style={styles.infoValue}>#{ret.orderId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Sebep</Text>
            <Text style={styles.infoValue}>{ret.reason}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Adet</Text>
            <Text style={styles.infoValue}>{ret.quantity}</Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowLast]}>
            <Text style={styles.totalLabel}>İade Tutarı</Text>
            <Text style={styles.totalValue}>{ret.refundAmount.toFixed(2)} ₺</Text>
          </View>

          <View style={styles.descriptionBlock}>
            <Text style={styles.infoLabel}>Açıklama</Text>
            <Text style={styles.descriptionText}>{ret.description}</Text>
          </View>

          {ret.rejectionReason && (
            <View style={styles.descriptionBlock}>
              <Text style={styles.infoLabel}>Red Sebebi</Text>
              <Text style={[styles.descriptionText, { color: '#e74c3c' }]}>{ret.rejectionReason}</Text>
            </View>
          )}

          {ret.refundedAt && (
            <View style={[styles.infoRow, { marginTop: 12, marginBottom: 0 }]}>
              <Text style={styles.infoLabel}>İade Tarihi</Text>
              <Text style={[styles.infoValue, { color: '#27ae60' }]}>
                {new Date(ret.refundedAt).toLocaleDateString('tr-TR', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </Text>
            </View>
          )}
        </View>

        {isRejected && (
          <View style={styles.terminalBox}>
            <Text style={styles.terminalTextRejected}>Bu iade talebi reddedildi.</Text>
          </View>
        )}

        {isRefunded && (
          <View style={[styles.terminalBox, styles.terminalBoxRefunded]}>
            <Text style={styles.terminalTextRefunded}>Bu iade tamamlandı, ücret iadesi yapıldı.</Text>
          </View>
        )}

        {canShip && (
          <TouchableOpacity
            style={[styles.shipButton, busy && styles.shipButtonDisabled]}
            onPress={handleShip}
            disabled={busy}
          >
            <Truck size={18} color="#fff" />
            <Text style={styles.shipButtonText}>{busy ? 'Gönderiliyor...' : 'Kargoya Verdim'}</Text>
          </TouchableOpacity>
        )}

        {!isRejected && !isRefunded && !canShip && (
          <Text style={styles.waitingText}>Satıcının değerlendirmesi bekleniyor.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#999' },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 8 },
  figurineName: { flex: 1, fontSize: 19, fontWeight: '800', color: '#1a1a1a' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '700' },

  stepperCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },

  infoCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  infoRowLast: { marginBottom: 0, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10 },
  infoLabel: { fontSize: 13, color: '#999' },
  infoValue: { fontSize: 13, fontWeight: '600', color: '#1a1a1a' },
  totalLabel: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  totalValue: { fontSize: 17, fontWeight: '800', color: '#ff6600' },
  descriptionBlock: { marginTop: 12 },
  descriptionText: { fontSize: 13, color: '#333', marginTop: 4, lineHeight: 18 },

  terminalBox: { backgroundColor: '#fdecea', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 16 },
  terminalBoxRefunded: { backgroundColor: '#e8f8f0' },
  terminalTextRejected: { fontSize: 13, fontWeight: '700', color: '#e74c3c' },
  terminalTextRefunded: { fontSize: 13, fontWeight: '700', color: '#27ae60' },

  shipButton: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
    backgroundColor: '#ff6600', paddingVertical: 16, borderRadius: 12,
  },
  shipButtonDisabled: { opacity: 0.6 },
  shipButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  waitingText: { fontSize: 13, color: '#999', textAlign: 'center', marginTop: 4 },
});
