import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  FlatList, ActivityIndicator, TextInput, Alert, SectionList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ingredientAPI, userAPI } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';

const ORANGE = '#f97316';

export default function PantryScreen({ navigation }) {
  const [allIngredients, setAllIngredients] = useState([]);
  const [pantry, setPantry] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('browse');

  const load = useCallback(async () => {
    try {
      const [ingRes, pantryRes] = await Promise.all([
        ingredientAPI.getAll(),
        userAPI.getPantry(),
      ]);
      setAllIngredients(ingRes.data);
      setPantry(pantryRes.data.map((p) => p.ingredient));
    } catch (err) {
      Alert.alert('Hata', 'Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const isInPantry = (id) => pantry.some((p) => p.id === id);

  const toggleIngredient = async (ingredient) => {
    const inPantry = isInPantry(ingredient.id);
    if (inPantry) {
      setPantry((prev) => prev.filter((p) => p.id !== ingredient.id));
      try { await userAPI.removeFromPantry(ingredient.id); } catch { load(); }
    } else {
      setPantry((prev) => [...prev, ingredient]);
      try { await userAPI.addToPantry(ingredient.id); } catch { load(); }
    }
  };

  const clearPantry = () => {
    Alert.alert('Dolabı Temizle', 'Tüm malzemeleri kaldırmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Temizle', style: 'destructive', onPress: async () => {
          setPantry([]);
          try { await userAPI.clearPantry(); } catch { load(); }
        }
      },
    ]);
  };

  const filtered = search
    ? allIngredients.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    : allIngredients;

  const grouped = filtered.reduce((acc, ing) => {
    if (!acc[ing.category]) acc[ing.category] = [];
    acc[ing.category].push(ing);
    return acc;
  }, {});

  const sections = Object.entries(grouped).map(([title, data]) => ({ title, data }));

  if (loading) return (
    <View style={styles.loadingBox}><ActivityIndicator size="large" color={ORANGE} /></View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#f97316', '#ea580c']} style={styles.header}>
        <Text style={styles.headerTitle}>Dolabım</Text>
        <Text style={styles.headerSub}>{pantry.length} malzeme seçili</Text>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === 'browse' && styles.tabActive]}
            onPress={() => setTab('browse')}
          >
            <Text style={[styles.tabText, tab === 'browse' && styles.tabTextActive]}>Malzeme Ekle</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'pantry' && styles.tabActive]}
            onPress={() => setTab('pantry')}
          >
            <Text style={[styles.tabText, tab === 'pantry' && styles.tabTextActive]}>
              Dolabım ({pantry.length})
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {tab === 'browse' ? (
        <>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#9ca3af" />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Malzeme ara..."
              placeholderTextColor="#9ca3af"
            />
            {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color="#9ca3af" /></TouchableOpacity> : null}
          </View>

          <SectionList
            sections={sections}
            keyExtractor={(item) => String(item.id)}
            stickySectionHeadersEnabled
            contentContainerStyle={{ paddingBottom: 120 }}
            renderSectionHeader={({ section: { title } }) => (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{title}</Text>
              </View>
            )}
            renderItem={({ item }) => {
              const selected = isInPantry(item.id);
              return (
                <TouchableOpacity
                  style={[styles.ingredientRow, selected && styles.ingredientRowSelected]}
                  onPress={() => toggleIngredient(item)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.ingredientIcon}>{item.icon}</Text>
                  <Text style={[styles.ingredientName, selected && styles.ingredientNameSelected]}>{item.name}</Text>
                  <Text style={styles.ingredientUnit}>{item.unit}</Text>
                  <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                    {selected && <Ionicons name="checkmark" size={14} color="#fff" />}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </>
      ) : (
        <View style={{ flex: 1 }}>
          {pantry.length > 0 ? (
            <>
              <FlatList
                data={pantry}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
                numColumns={2}
                columnWrapperStyle={{ gap: 10 }}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                renderItem={({ item }) => (
                  <View style={styles.pantryChip}>
                    <Text style={styles.pantryChipIcon}>{item.icon}</Text>
                    <Text style={styles.pantryChipName} numberOfLines={1}>{item.name}</Text>
                    <TouchableOpacity onPress={() => toggleIngredient(item)}>
                      <Ionicons name="close-circle" size={18} color="#f97316" />
                    </TouchableOpacity>
                  </View>
                )}
              />
            </>
          ) : (
            <View style={styles.emptyBox}>
              <Text style={{ fontSize: 48 }}>🧺</Text>
              <Text style={styles.emptyTitle}>Dolabın boş</Text>
              <Text style={styles.emptyDesc}>Malzeme Ekle sekmesinden malzemeleri seçin</Text>
            </View>
          )}
        </View>
      )}

      {/* Bottom Bar */}
      {pantry.length > 0 && (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.clearBtn} onPress={clearPantry}>
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
            <Text style={styles.clearBtnText}>Temizle</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.suggestBtn}
            onPress={() => navigation.navigate('Suggestions')}
            activeOpacity={0.85}
          >
            <Ionicons name="restaurant-outline" size={18} color="#fff" />
            <Text style={styles.suggestBtnText}>Tarif Önerisi Al</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2, marginBottom: 16 },
  tabs: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 3 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: '#fff' },
  tabText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  tabTextActive: { color: ORANGE },
  searchBox: { flexDirection: 'row', alignItems: 'center', margin: 16, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, gap: 10, borderWidth: 1.5, borderColor: '#e5e7eb' },
  searchInput: { flex: 1, fontSize: 15, color: '#111827' },
  sectionHeader: { backgroundColor: '#f3f4f6', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 },
  ingredientRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', gap: 10 },
  ingredientRowSelected: { backgroundColor: '#fff7ed' },
  ingredientIcon: { fontSize: 22, width: 32, textAlign: 'center' },
  ingredientName: { flex: 1, fontSize: 15, color: '#374151', fontWeight: '500' },
  ingredientNameSelected: { color: ORANGE, fontWeight: '700' },
  ingredientUnit: { fontSize: 12, color: '#9ca3af' },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#d1d5db', justifyContent: 'center', alignItems: 'center' },
  checkboxSelected: { backgroundColor: ORANGE, borderColor: ORANGE },
  pantryChip: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, gap: 8, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2, borderWidth: 1.5, borderColor: '#fff7ed' },
  pantryChipIcon: { fontSize: 20 },
  pantryChipName: { flex: 1, fontSize: 13, fontWeight: '600', color: '#374151' },
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginTop: 12 },
  emptyDesc: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginTop: 6 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', padding: 16, paddingBottom: 28, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f3f4f6', gap: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, elevation: 8 },
  clearBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: '#fee2e2', backgroundColor: '#fff5f5', gap: 6 },
  clearBtnText: { color: '#ef4444', fontWeight: '700', fontSize: 14 },
  suggestBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: ORANGE, borderRadius: 12, paddingVertical: 12, gap: 8 },
  suggestBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
