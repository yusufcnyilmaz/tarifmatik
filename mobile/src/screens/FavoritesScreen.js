import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  FlatList, ActivityIndicator, Image, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { userAPI } from '../services/api';

const ORANGE = '#f97316';

export default function FavoritesScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await userAPI.getFavorites();
      setFavorites(res.data);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const removeFavorite = async (recipeId) => {
    setFavorites((prev) => prev.filter((r) => r.id !== recipeId));
    try {
      await userAPI.removeFavorite(recipeId);
    } catch {
      load();
    }
  };

  const diffColor = { Kolay: '#22c55e', Orta: '#f59e0b', Zor: '#ef4444' };

  if (loading) return (
    <View style={styles.loadingBox}><ActivityIndicator size="large" color={ORANGE} /></View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#f97316', '#ea580c']} style={styles.header}>
        <Text style={styles.headerTitle}>Favorilerim</Text>
        <Text style={styles.headerSub}>{favorites.length} kayıtlı tarif</Text>
      </LinearGradient>

      {favorites.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={{ fontSize: 56 }}>❤️</Text>
          <Text style={styles.emptyTitle}>Henüz favori yok</Text>
          <Text style={styles.emptyDesc}>Beğendiğin tarifleri favorilere ekleyerek buradan hızlıca ulaş</Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('Home')}>
            <Ionicons name="search-outline" size={18} color="#fff" />
            <Text style={styles.browseBtnText}>Tariflere Göz At</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ORANGE} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('RecipeDetail', { recipe: item })}
              activeOpacity={0.88}
            >
              <View style={styles.imageBox}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
                ) : (
                  <LinearGradient colors={['#fb923c', '#c2410c']} style={[styles.image, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ fontSize: 40 }}>{item.category?.icon || '🍽️'}</Text>
                  </LinearGradient>
                )}
              </View>
              <View style={styles.info}>
                <View style={styles.infoTop}>
                  <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                  <TouchableOpacity onPress={() => removeFavorite(item.id)} style={styles.heartBtn}>
                    <Ionicons name="heart" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.cat}>{item.category?.icon} {item.category?.name}</Text>
                <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
                <View style={styles.meta}>
                  <View style={styles.metaChip}>
                    <Ionicons name="time-outline" size={12} color="#6b7280" />
                    <Text style={styles.metaText}>{item.prepTime + item.cookTime} dk</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <Ionicons name="people-outline" size={12} color="#6b7280" />
                    <Text style={styles.metaText}>{item.servings} kişi</Text>
                  </View>
                  <View style={[styles.metaChip, { backgroundColor: (diffColor[item.difficulty] || '#9ca3af') + '20' }]}>
                    <Text style={[styles.metaText, { color: diffColor[item.difficulty] || '#9ca3af', fontWeight: '700' }]}>{item.difficulty}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#374151', marginTop: 16 },
  emptyDesc: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  browseBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: ORANGE, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12, marginTop: 24, gap: 8 },
  browseBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  imageBox: { width: 110, height: 110 },
  image: { width: '100%', height: '100%' },
  info: { flex: 1, padding: 12 },
  infoTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 },
  title: { flex: 1, fontSize: 15, fontWeight: '700', color: '#111827', marginRight: 4 },
  heartBtn: { padding: 2 },
  cat: { fontSize: 11, color: '#9ca3af', marginBottom: 4 },
  desc: { fontSize: 12, color: '#6b7280', lineHeight: 17, marginBottom: 8 },
  meta: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  metaChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3, gap: 3 },
  metaText: { fontSize: 11, color: '#6b7280', fontWeight: '500' },
});
