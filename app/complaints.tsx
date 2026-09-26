import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { apiFetch } from '@/utils/api';
import { MessageSquare, ChevronRight, AlertTriangle } from 'lucide-react-native';
import EmptyState from '@/components/EmptyState';
import type { Complaint } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  'Açık': '#ff9800',
  'İnceleniyor': '#2196f3',
  'Çözüldü': '#27ae60',
};

export default function ComplaintsScreen() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      apiFetch('/complaints/mine')
        .then((res) => res.json())
        .then((data) => {
          setComplaints(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff6600" />
      </View>
    );
  }

  if (complaints.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquare size={56} color="#ccc" />}
        title="Henüz şikayetiniz yok"
        subtitle="Açtığınız şikayetler burada görünecek"
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={complaints}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => router.navigate(`/complaint-detail/${item.id}`)}
          >
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.subject} numberOfLines={1}>{item.subject}</Text>
                <Text style={styles.figurineName}>{item.figurineName}</Text>
              </View>
              <View style={styles.badgesColumn}>
                {item.escalatedToAdmin && (
                  <View style={styles.escalatedBadge}>
                    <AlertTriangle size={11} color="#e74c3c" />
                    <Text style={styles.escalatedText}>Yönetime İletildi</Text>
                  </View>
                )}
                <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[item.status] || '#999') + '22' }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] || '#999' }]}>
                    {item.status}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.tagsRow}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{item.type}</Text>
              </View>
              {item.category && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{item.category}</Text>
                </View>
              )}
              <View style={styles.tag}>
                <Text style={styles.tagText}>Talep: {item.requestedResolution}</Text>
              </View>
            </View>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>
                {new Date(item.createdAt).toLocaleDateString('tr-TR', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
                {' · '}
                {item.commentCount} mesaj
              </Text>
              <ChevronRight size={16} color="#ff6600" />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingHorizontal: 20, paddingTop: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginBottom: 12, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 8 },
  subject: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  figurineName: { fontSize: 13, color: '#999', marginTop: 2 },
  badgesColumn: { alignItems: 'flex-end', gap: 6 },
  escalatedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#fdecea', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  escalatedText: { fontSize: 10, fontWeight: '700', color: '#e74c3c' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '700' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  tag: { backgroundColor: '#f0f0f0', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagText: { fontSize: 11, color: '#666', fontWeight: '600' },
  footerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0',
  },
  footerText: { fontSize: 12, color: '#999' },
});
