import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, ActivityIndicator, Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const ORANGE = '#f97316';

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {};
      if (name !== user?.name) data.name = name;
      if (password) data.password = password;
      if (Object.keys(data).length === 0) { setEditMode(false); setSaving(false); return; }
      await authAPI.updateMe(data);
      updateUser({ name });
      setPassword('');
      setEditMode(false);
      Alert.alert('Başarılı', 'Profil güncellendi');
    } catch (err) {
      Alert.alert('Hata', err.response?.data?.error || 'Güncelleme başarısız');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: logout },
    ]);
  };

  const menuItems = [
    { icon: 'information-circle-outline', label: 'Hakkında', color: '#6366f1', desc: 'Uygulama v1.0.0' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={['#f97316', '#ea580c']} style={styles.header}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase()}</Text>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        {user?.role === 'admin' && (
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={12} color="#fff" />
            <Text style={styles.adminBadgeText}>Admin</Text>
          </View>
        )}
      </LinearGradient>

      {/* Edit Profile */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Profil Bilgileri</Text>
          <TouchableOpacity onPress={() => { setEditMode(!editMode); setName(user?.name || ''); setPassword(''); }}>
            <Text style={styles.editBtn}>{editMode ? 'İptal' : 'Düzenle'}</Text>
          </TouchableOpacity>
        </View>

        {editMode ? (
          <View style={styles.editForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ad Soyad</Text>
              <View style={styles.inputRow}>
                <Ionicons name="person-outline" size={16} color="#9ca3af" />
                <TextInput style={styles.input} value={name} onChangeText={setName} autoCapitalize="words" />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Yeni Şifre (opsiyonel)</Text>
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed-outline" size={16} color="#9ca3af" />
                <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="Değiştirmek için doldurun" placeholderTextColor="#9ca3af" />
              </View>
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveBtnText}>Kaydet</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.profileInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={18} color="#9ca3af" />
              <View>
                <Text style={styles.infoLabel}>Ad Soyad</Text>
                <Text style={styles.infoValue}>{user?.name}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={18} color="#9ca3af" />
              <View>
                <Text style={styles.infoLabel}>E-posta</Text>
                <Text style={styles.infoValue}>{user?.email}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={18} color="#9ca3af" />
              <View>
                <Text style={styles.infoLabel}>Üyelik</Text>
                <Text style={styles.infoValue}>{user?.role === 'admin' ? 'Admin' : 'Kullanıcı'}</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Menu */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
        <View style={styles.menuList}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.menuItem, i < menuItems.length - 1 && styles.menuItemBorder]}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBox, { backgroundColor: item.color + '18' }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuDesc}>{item.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Logout */}
      <View style={[styles.section, { paddingBottom: 40 }]}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>
        <Text style={styles.versionText}>Tarifmatik v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { paddingTop: 60, paddingBottom: 32, alignItems: 'center' },
  avatarBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)' },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  userName: { fontSize: 22, fontWeight: '800', color: '#fff' },
  userEmail: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  adminBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginTop: 10, gap: 4 },
  adminBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  section: { backgroundColor: '#fff', marginTop: 12, paddingHorizontal: 20, paddingVertical: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  editBtn: { fontSize: 14, color: ORANGE, fontWeight: '600' },
  editForm: { gap: 14 },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 12, fontWeight: '600', color: '#374151' },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, gap: 10, backgroundColor: '#f9fafb' },
  input: { flex: 1, fontSize: 15, color: '#111827' },
  saveBtn: { backgroundColor: ORANGE, borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 4 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  profileInfo: { gap: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoLabel: { fontSize: 11, color: '#9ca3af', fontWeight: '500' },
  infoValue: { fontSize: 15, color: '#374151', fontWeight: '600', marginTop: 1 },
  menuList: { borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#f3f4f6' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 14, gap: 14, backgroundColor: '#fff' },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  menuIconBox: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: '600', color: '#374151' },
  menuDesc: { fontSize: 12, color: '#9ca3af', marginTop: 1 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#fee2e2', borderRadius: 14, paddingVertical: 13, gap: 8, backgroundColor: '#fff5f5' },
  logoutText: { color: '#ef4444', fontSize: 15, fontWeight: '700' },
  versionText: { textAlign: 'center', color: '#9ca3af', fontSize: 12, marginTop: 16 },
});
