import { View, Text, StyleSheet } from 'react-native';
import { User } from 'lucide-react-native';

interface HomeHeaderProps {
  firstName: string;
}

export default function HomeHeader({ firstName }: HomeHeaderProps) {
  return (
    <>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Anı Katmanı 3D</Text>
        <View style={styles.avatar}>
          {firstName ? (
            <Text style={styles.avatarText}>{firstName[0].toUpperCase()}</Text>
          ) : (
            <User size={18} color="#fff" />
          )}
        </View>
      </View>
      <Text style={styles.subtitle}>Sana özel 3D figürler</Text>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  headerTitle: { fontSize: 21, fontWeight: '800', color: '#1a1a1a', letterSpacing: 0.3 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ff6600',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 15, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 12, color: '#aaa', marginBottom: 20, marginTop: 2 },
});