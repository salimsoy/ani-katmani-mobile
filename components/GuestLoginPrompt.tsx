import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Lock } from 'lucide-react-native';

interface GuestLoginPromptProps {
  onLogin: () => void;
}

export default function GuestLoginPrompt({ onLogin }: GuestLoginPromptProps) {
  return (
    <View style={styles.container}>
      <Lock size={32} color="#ff6600" style={{ marginBottom: 12 }} />
      <Text style={styles.title}>Giriş Yapmanız Gerekiyor</Text>
      <Text style={styles.subtitle}>Sipariş verebilmek için hesabınıza giriş yapın.</Text>
      <TouchableOpacity style={styles.button} onPress={onLogin}>
        <Text style={styles.buttonText}>Giriş Yap</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  button: { backgroundColor: '#ff6600', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});