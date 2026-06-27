import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Hata', 'E-posta ve şifre zorunludur'); return; }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      Alert.alert('Giriş Başarısız', err.response?.data?.error || 'Hatalı e-posta veya şifre');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#f97316', '#ea580c']} style={styles.gradient}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.logoBox}>
              <Ionicons name="restaurant" size={36} color="#fff" />
            </View>
            <Text style={styles.appName}>Tarifmatik</Text>
            <Text style={styles.tagline}>Malzemelerini gir, tarifini bul</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Giriş Yap</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-posta</Text>
              <View style={styles.inputRow}>
                <Ionicons name="mail-outline" size={18} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="ornek@email.com"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Şifre</Text>
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed-outline" size={18} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showPw}
                />
                <TouchableOpacity onPress={() => setShowPw(!showPw)} style={styles.eyeBtn}>
                  <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9ca3af" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginBtnText}>Giriş Yap</Text>}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>veya</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.registerBtn} onPress={() => navigation.navigate('Register')} activeOpacity={0.8}>
              <Text style={styles.registerBtnText}>Hesap Oluştur</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  logoBox: { width: 72, height: 72, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  appName: { fontSize: 32, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 24, elevation: 8 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 20 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, backgroundColor: '#f9fafb' },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 46, fontSize: 15, color: '#111827' },
  eyeBtn: { padding: 4 },
  loginBtn: { backgroundColor: '#f97316', borderRadius: 14, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e5e7eb' },
  dividerText: { marginHorizontal: 12, color: '#9ca3af', fontSize: 13 },
  registerBtn: { borderWidth: 1.5, borderColor: '#f97316', borderRadius: 14, height: 50, justifyContent: 'center', alignItems: 'center' },
  registerBtnText: { color: '#f97316', fontSize: 16, fontWeight: '700' },
});
