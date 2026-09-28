import { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Star, PenLine, ChevronDown, ChevronUp } from 'lucide-react-native';
import { apiFetch } from '@/utils/api';

type Review = {
  id: number;
  reviewerFirstName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

const COLLAPSED_REVIEW_COUNT = 3;

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          color={star <= rating ? '#facc15' : '#e5e7eb'}
          fill={star <= rating ? '#facc15' : '#e5e7eb'}
        />
      ))}
    </View>
  );
}

export default function ProductReviews({ figurineId }: { figurineId: number }) {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchReviews = useCallback(() => {
    setLoading(true);
    apiFetch(`/figurines/${figurineId}/reviews`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setReviews)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [figurineId]);

  useEffect(() => {
    setShowAll(false);
    setShowForm(false);
    setRating(0);
    setComment('');
    setError(null);
    setSuccess(false);
    fetchReviews();
  }, [fetchReviews]);

  const openForm = async () => {
    const token = await SecureStore.getItemAsync('token');
    if (!token) {
      router.push('/login');
      return;
    }
    setShowForm(true);
  };

  const handleSubmit = async () => {
    setError(null);
    if (rating < 1 || rating > 5) {
      setError('Lütfen 1 ile 5 arasında bir puan seçin.');
      return;
    }
    if (!comment.trim()) {
      setError('Yorum boş olamaz.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch('/reviews', {
        method: 'POST',
        body: JSON.stringify({ figurineId, rating, comment }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.message ?? 'Yorum eklenemedi.');
        return;
      }
      setRating(0);
      setComment('');
      setShowForm(false);
      setSuccess(true);
      fetchReviews();
    } catch {
      setError('Sunucuya bağlanılamadı.');
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
  const visibleReviews = showAll ? reviews : reviews.slice(0, COLLAPSED_REVIEW_COUNT);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Değerlendirmeler{reviews.length > 0 ? ` (${reviews.length})` : ''}
        </Text>
        {!showForm && !success && (
          <TouchableOpacity style={styles.writeButton} onPress={openForm}>
            <PenLine size={14} color="#1a1a1a" />
            <Text style={styles.writeButtonText}>Yorum Yap</Text>
          </TouchableOpacity>
        )}
      </View>

      {reviews.length > 0 && (
        <View style={styles.summaryRow}>
          <StarRow rating={Math.round(averageRating)} size={16} />
          <Text style={styles.summaryText}>{averageRating.toFixed(1)} / 5</Text>
        </View>
      )}

      {success && (
        <View style={styles.successBox}>
          <Text style={styles.successText}>Yorumunuz eklendi, teşekkürler!</Text>
        </View>
      )}

      {showForm && (
        <View style={styles.form}>
          <Text style={styles.formLabel}>Puanınız</Text>
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} hitSlop={6}>
                <Star
                  size={28}
                  color={star <= rating ? '#facc15' : '#e5e7eb'}
                  fill={star <= rating ? '#facc15' : '#e5e7eb'}
                />
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.input}
            value={comment}
            onChangeText={setComment}
            placeholder="Bu ürün hakkında ne düşünüyorsunuz?"
            placeholderTextColor="#aaa"
            multiline
            textAlignVertical="top"
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={[styles.submitButton, submitting && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Gönder</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowForm(false);
                setError(null);
              }}
            >
              <Text style={styles.cancelButtonText}>Vazgeç</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {loading ? (
        <ActivityIndicator color="#ff6600" style={{ marginTop: 8 }} />
      ) : reviews.length === 0 ? (
        <Text style={styles.emptyText}>Bu ürün için henüz yorum yapılmamış.</Text>
      ) : (
        <>
          {visibleReviews.map((review) => (
            <View key={review.id} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>{review.reviewerFirstName}</Text>
                <StarRow rating={review.rating} size={12} />
                <Text style={styles.reviewDate}>
                  {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                </Text>
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))}

          {reviews.length > COLLAPSED_REVIEW_COUNT && (
            <TouchableOpacity style={styles.toggleButton} onPress={() => setShowAll((prev) => !prev)}>
              {showAll ? <ChevronUp size={16} color="#ff6600" /> : <ChevronDown size={16} color="#ff6600" />}
              <Text style={styles.toggleButtonText}>
                {showAll ? 'Daha Az Göster' : `Tümünü Gör (${reviews.length})`}
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 20, marginTop: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },
  writeButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7,
  },
  writeButtonText: { fontSize: 13, fontWeight: '600', color: '#1a1a1a' },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  summaryText: { fontSize: 13, color: '#666', fontWeight: '600' },
  successBox: { backgroundColor: '#e8f5e9', borderRadius: 12, padding: 12, marginBottom: 12 },
  successText: { color: '#2e7d32', fontSize: 14, fontWeight: '600' },
  form: { backgroundColor: '#fafafa', borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#f0f0f0' },
  formLabel: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#eee', borderRadius: 12, backgroundColor: '#fff',
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#1a1a1a',
    minHeight: 80, marginBottom: 10,
  },
  errorText: { color: '#e53935', fontSize: 13, marginBottom: 10 },
  submitButton: {
    backgroundColor: '#ff6600', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10,
    alignItems: 'center', justifyContent: 'center', minWidth: 90,
  },
  submitButtonText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  cancelButton: { paddingHorizontal: 16, paddingVertical: 10, justifyContent: 'center' },
  cancelButtonText: { color: '#888', fontWeight: '600', fontSize: 14 },
  emptyText: { fontSize: 14, color: '#aaa', marginTop: 4 },
  reviewItem: { borderBottomWidth: 1, borderBottomColor: '#f3f3f3', paddingVertical: 12 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  reviewerName: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  reviewDate: { fontSize: 12, color: '#aaa' },
  reviewComment: { fontSize: 14, color: '#555', lineHeight: 20 },
  toggleButton: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 12 },
  toggleButtonText: { color: '#ff6600', fontWeight: '700', fontSize: 14 },
});
