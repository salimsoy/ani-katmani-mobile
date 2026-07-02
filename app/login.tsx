import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { getLocalCart, clearLocalCart } from '@/utils/cart';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Email ve şifre alanları boş bırakılamaz.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://192.168.1.53:5059/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        await SecureStore.setItemAsync('token', data.token);
        await SecureStore.setItemAsync('userId', data.id.toString());
        await SecureStore.setItemAsync('firstName', data.firstName);
        await SecureStore.setItemAsync('isAdmin', data.isAdmin.toString());

        // Local sepeti backend'e merge et
        const localCart = await getLocalCart();
        if (localCart.length > 0) {
            await Promise.all(
            localCart.map(item =>
                fetch('http://192.168.1.53:5059/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${data.token}`
                },
                body: JSON.stringify({
                    figurineId: item.figurineId,
                    quantity: item.quantity
                })
                })
            )
            );
            await clearLocalCart();
        }

        router.replace('/(tabs)');
        }else {
        Alert.alert('Hata', 'Email veya şifre hatalı.');
      }
    } catch (err) {
      Alert.alert('Bağlantı Hatası', 'Sunucuya bağlanılamadı.');
    } finally {
      setLoading(false);
    }
  };

    const handleGuestLogin = async () => {
        await SecureStore.setItemAsync('isGuest', 'true');
        router.replace('/(tabs)');
    };
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Giriş Yap</Text>
        <Text style={styles.subtitle}>Anı Katmanı 3D'ye hoş geldiniz</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#999"
        />

        <TextInput
          style={styles.input}
          placeholder="Şifre"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#999"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Giriş Yap</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/register')}
          style={styles.registerLink}
        >
          <Text style={styles.registerText}>
            Hesabın yok mu?{' '}
            <Text style={styles.registerTextBold}>Kayıt ol</Text>
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
            onPress={handleGuestLogin}
            style={styles.guestButton}
            >
            <Text style={styles.guestButtonText}>Misafir olarak devam et</Text>
            </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  title: { fontSize: 32, fontWeight: '800', color: '#1a1a1a', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#999', marginBottom: 40 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#1a1a1a',
  },
  button: {
    backgroundColor: '#ff6600',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { backgroundColor: '#ffb380' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  registerLink: { marginTop: 24, alignItems: 'center' },
  registerText: { fontSize: 15, color: '#666' },
  registerTextBold: { color: '#ff6600', fontWeight: 'bold' },
  guestButton: { marginTop: 12, alignItems: 'center' },
  guestButtonText: { fontSize: 14, color: '#bbb', textDecorationLine: 'underline' },
});