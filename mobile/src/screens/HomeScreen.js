import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  FlatList, ActivityIndicator, RefreshControl, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { recipeAPI, categoryAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ORANGE = '#f97316';

function RecipeCard({ recipe, onPress }) {
  const totalTime = recipe.prepTime + recipe.cookTime;
  const diffColor = { Kolay: '#22c55e', Orta: '#f59e0b', Zor: '#ef4444' };
  return (
    <TouchableOpacity style={styles.recipeCard} onPress={() => onPress(recipe)} activeOpacity={0.88}>
      <View style={styles.recipeImageBox}>
        {recipe.imageUrl ? (
          <Image source={{ uri: recipe.imageUrl }} style={styles.recipeImage} resizeMode="cover" />
        ) : (
          <LinearGradient colors={['#fb923c', '#ea580c']} style={styles.recipeImageFallback}>
            <Text style={{ fontSize: 36 }}>{recipe.category?.icon || '🍽️'}</Text>
          </LinearGradient>
        )}
        {recipe.isFeatured && (
          <View style={styles.featuredBadge}>
            <Ionicons name="star" size={10} color="#fff" />
            <Text style={styles.featuredText}>Öne Çıkan</Text>
          </View>
        )}
      </View>
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle} numberOfLines={2}>{recipe.title}</Text>
        <Text style={styles.recipeDesc} numberOfLines={2}>{recipe.description}</Text>
        <View style={styles.recipeMeta}>
          <View style={styles.metaChip}>
            <Ionicons name="time-outline" size={13} color="#6b7280" />
            <Text style={styles.metaText}>{totalTime} dk</Text>
          </View>
          <View style={styles.metaChip}>
            <Ionicons name="people-outline" size={13} color="#6b7280" />
            <Text style={styles.metaText}>{recipe.servings} kişi</Text>
          </View>
          <View style={[styles.metaChip, { backgroundColor: (diffColor[recipe.difficulty] || '#9ca3af') + '20' }]}>
            <Text style={[styles.metaText, { color: diffColor[recipe.difficulty] || '#9ca3af', fontWeight: '700' }]}>{recipe.difficulty}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [recRes, featRes, catRes] = await Promise.all([
        recipeAPI.getAll(selectedCat ? { category: selectedCat } : {}),
        recipeAPI.getAll({ featured: 'true' }),
        categoryAPI.getAll(),
      ]);
      setRecipes(recRes.data);
      setFeatured(featRes.data.slice(0, 5));
      setCategories(catRes.data);
    } catch {}
  }, [selectedCat]);

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  const goDetail = (recipe) => navigation.navigate('RecipeDetail', { recipe });

  if (loading) return (
    <View style={styles.loadingBox}>
      <ActivityIndicator size="large" color={ORANGE} />
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ORANGE} />}
    >
      {/* Header */}
      <LinearGradient colors={['#f97316', '#ea580c']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Merhaba, {user?.name?.split(' ')[0]} 👋</Text>
            <Text style={styles.subtitle}>Bugün ne pişireceksin?</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.suggestBtn}
          onPress={() => navigation.navigate('Pantry')}
          activeOpacity={0.85}
        >
          <Ionicons name="basket-outline" size={20} color={ORANGE} />
          <Text style={styles.suggestBtnText}>Dolabımdaki malzemelere göre öneri al</Text>
          <Ionicons name="arrow-forward" size={16} color={ORANGE} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Featured */}
      {featured.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⭐ Öne Çıkanlar</Text>
          </View>
          <FlatList
            horizontal
            data={featured}
            keyExtractor={(item) => String(item.id)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.featuredCard} onPress={() => goDetail(item)} activeOpacity={0.88}>
                <View style={styles.featuredImageBox}>
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.featuredImage} resizeMode="cover" />
                  ) : (
                    <LinearGradient colors={['#fb923c', '#c2410c']} style={styles.featuredImage}>
                      <Text style={{ fontSize: 44 }}>{item.category?.icon || '🍽️'}</Text>
                    </LinearGradient>
                  )}
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={styles.featuredOverlay}>
                    <Text style={styles.featuredTitle} numberOfLines={2}>{item.title}</Text>
                    <View style={styles.featuredMeta}>
                      <Text style={styles.featuredMetaText}>{item.prepTime + item.cookTime} dk • {item.difficulty}</Text>
                    </View>
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          />
        </View>
      )}

      {/* Categories */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Kategoriler</Text>
        </View>
        <FlatList
          horizontal
          data={[{ id: null, name: 'Tümü', icon: '🍽️' }, ...categories]}
          keyExtractor={(item) => String(item.id)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.catChip, selectedCat === item.id && styles.catChipActive]}
              onPress={() => setSelectedCat(item.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.catIcon}>{item.icon}</Text>
              <Text style={[styles.catName, selectedCat === item.id && styles.catNameActive]}>{item.name}</Text>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
        />
      </View>

      {/* Recipes */}
      <View style={[styles.section, { paddingBottom: 100 }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tüm Tarifler</Text>
          <Text style={styles.countBadge}>{recipes.length}</Text>
        </View>
        {recipes.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 40 }}>🍽️</Text>
            <Text style={styles.emptyText}>Tarif bulunamadı</Text>
          </View>
        ) : (
          recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} onPress={goDetail} />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  header: { paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  greeting: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  notifBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  suggestBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  suggestBtnText: { flex: 1, fontSize: 13, fontWeight: '600', color: '#374151' },
  section: { marginTop: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12, gap: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  countBadge: { backgroundColor: '#fff7ed', color: ORANGE, fontSize: 12, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  featuredCard: { width: 220 },
  featuredImageBox: { width: 220, height: 150, borderRadius: 16, overflow: 'hidden' },
  featuredImage: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  featuredOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12 },
  featuredTitle: { color: '#fff', fontSize: 14, fontWeight: '700', lineHeight: 18 },
  featuredMeta: { marginTop: 4 },
  featuredMetaText: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
  catChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 24, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e5e7eb', gap: 6 },
  catChipActive: { backgroundColor: ORANGE, borderColor: ORANGE },
  catIcon: { fontSize: 14 },
  catName: { fontSize: 13, fontWeight: '600', color: '#374151' },
  catNameActive: { color: '#fff' },
  recipeCard: { backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 20, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 3, overflow: 'hidden' },
  recipeImageBox: { height: 160, position: 'relative' },
  recipeImage: { width: '100%', height: '100%' },
  recipeImageFallback: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  featuredBadge: { position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f59e0b', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, gap: 3 },
  featuredText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  recipeInfo: { padding: 14 },
  recipeTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  recipeDesc: { fontSize: 13, color: '#6b7280', lineHeight: 18, marginBottom: 10 },
  recipeMeta: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  metaChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, gap: 3 },
  metaText: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
  emptyBox: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { color: '#9ca3af', marginTop: 8, fontSize: 15 },
  ORANGE,
});
