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
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert('Hata', 'Tüm alanlar doldurulmalıdır.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://192.168.1.53:5059/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      if (response.ok) {
        Alert.alert(
          'Başarılı',
          'Hesabınız oluşturuldu! Şimdi giriş yapabilirsiniz.',
          [{ text: 'Giriş Yap', onPress: () => router.replace('/login') }]
        );
      } else {
        Alert.alert('Hata', 'Bu email adresi zaten kullanılıyor.');
      }
    } catch (err) {
      Alert.alert('Bağlantı Hatası', 'Sunucuya bağlanılamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Kayıt Ol</Text>
        <Text style={styles.subtitle}>Hesap oluşturmak sadece birkaç saniye sürer</Text>

        <TextInput
          style={styles.input}
          placeholder="Ad"
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
          placeholderTextColor="#999"
        />

        <TextInput
          style={styles.input}
          placeholder="Soyad"
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words"
          placeholderTextColor="#999"
        />

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
          placeholder="Şifre (en az 6 karakter)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#999"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Kayıt Ol</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/login')}
          style={styles.loginLink}
        >
          <Text style={styles.loginText}>
            Zaten hesabın var mı?{' '}
            <Text style={styles.loginTextBold}>Giriş yap</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  inner: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 40 },
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
  loginLink: { marginTop: 24, alignItems: 'center' },
  loginText: { fontSize: 15, color: '#666' },
  loginTextBold: { color: '#ff6600', fontWeight: 'bold' },
});