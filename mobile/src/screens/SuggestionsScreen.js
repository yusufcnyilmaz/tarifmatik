import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  FlatList, ActivityIndicator, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { recipeAPI, userAPI } from '../services/api';

const ORANGE = '#f97316';

export default function SuggestionsScreen({ navigation }) {
  const [suggestions, setSuggestions] = useState([]);
  const [pantryCount, setPantryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    setLoading(true);
    setError('');
    try {
      const pantryRes = await userAPI.getPantry();
      const pantryItems = pantryRes.data;
      setPantryCount(pantryItems.length);

      if (pantryItems.length === 0) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      const ids = pantryItems.map((p) => p.ingredientId);
      const sugRes = await recipeAPI.suggest(ids);
      setSuggestions(sugRes.data);
    } catch {
      setError('Öneriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (pct) => {
    if (pct >= 0.8) return '#22c55e';
    if (pct >= 0.5) return '#f59e0b';
    return '#f97316';
  };

  if (loading) return (
    <View style={styles.loadingBox}><ActivityIndicator size="large" color={ORANGE} /></View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#f97316', '#ea580c']} style={styles.header}>
        <Text style={styles.headerTitle}>Tarif Önerileri</Text>
        <Text style={styles.headerSub}>{pantryCount} malzemeye göre öneriler</Text>
      </LinearGradient>

      {pantryCount === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={{ fontSize: 56 }}>🧺</Text>
          <Text style={styles.emptyTitle}>Dolabın boş</Text>
          <Text style={styles.emptyDesc}>Önce dolabına malzeme ekle, sana tarifleri bulalım!</Text>
          <TouchableOpacity
            style={styles.goPantryBtn}
            onPress={() => navigation.navigate('Pantry')}
          >
            <Ionicons name="basket-outline" size={18} color="#fff" />
            <Text style={styles.goPantryText}>Dolabıma Git</Text>
          </TouchableOpacity>
        </View>
      ) : suggestions.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={{ fontSize: 56 }}>😔</Text>
          <Text style={styles.emptyTitle}>Uygun tarif bulunamadı</Text>
          <Text style={styles.emptyDesc}>Dolabına daha fazla malzeme ekleyerek dene</Text>
          <TouchableOpacity style={styles.goPantryBtn} onPress={() => navigation.navigate('Pantry')}>
            <Ionicons name="add-circle-outline" size={18} color="#fff" />
            <Text style={styles.goPantryText}>Malzeme Ekle</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultInfo}>
            {suggestions.length} tarif bulundu
          </Text>
          {suggestions.map((recipe) => {
            const matchPct = recipe.matchPct || 0;
            const matchColor = getMatchColor(matchPct);
            return (
              <TouchableOpacity
                key={recipe.id}
                style={styles.card}
                onPress={() => navigation.navigate('RecipeDetail', { recipe })}
                activeOpacity={0.88}
              >
                <View style={styles.cardImageBox}>
                  {recipe.imageUrl ? (
                    <Image source={{ uri: recipe.imageUrl }} style={styles.cardImage} resizeMode="cover" />
                  ) : (
                    <LinearGradient colors={['#fb923c', '#c2410c']} style={[styles.cardImage, { justifyContent: 'center', alignItems: 'center' }]}>
                      <Text style={{ fontSize: 48 }}>{recipe.category?.icon || '🍽️'}</Text>
                    </LinearGradient>
                  )}
                  <View style={[styles.matchBadge, { backgroundColor: matchColor }]}>
                    <Text style={styles.matchText}>{Math.round(matchPct * 100)}% eşleşme</Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{recipe.title}</Text>
                    <Text style={styles.cardCat}>{recipe.category?.icon} {recipe.category?.name}</Text>
                  </View>
                  <Text style={styles.cardDesc} numberOfLines={2}>{recipe.description}</Text>

                  {/* Match bar */}
                  <View style={styles.matchBarRow}>
                    <Text style={styles.matchLabel}>
                      {recipe.matchCount}/{recipe.totalIngredients} malzeme eşleşti
                    </Text>
                    <View style={styles.matchBarBg}>
                      <View style={[styles.matchBarFill, { width: `${matchPct * 100}%`, backgroundColor: matchColor }]} />
                    </View>
                  </View>

                  <View style={styles.metaRow}>
                    <View style={styles.metaChip}>
                      <Ionicons name="time-outline" size={13} color="#6b7280" />
                      <Text style={styles.metaText}>{recipe.prepTime + recipe.cookTime} dk</Text>
                    </View>
                    <View style={styles.metaChip}>
                      <Ionicons name="people-outline" size={13} color="#6b7280" />
                      <Text style={styles.metaText}>{recipe.servings} kişi</Text>
                    </View>
                    <View style={[styles.metaChip, { backgroundColor: recipe.difficulty === 'Kolay' ? '#f0fdf4' : recipe.difficulty === 'Zor' ? '#fef2f2' : '#fffbeb' }]}>
                      <Text style={[styles.metaText, { color: recipe.difficulty === 'Kolay' ? '#22c55e' : recipe.difficulty === 'Zor' ? '#ef4444' : '#f59e0b', fontWeight: '700' }]}>{recipe.difficulty}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
  goPantryBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: ORANGE, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12, marginTop: 24, gap: 8 },
  goPantryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  resultInfo: { fontSize: 13, color: '#6b7280', marginBottom: 12, fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 14, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  cardImageBox: { height: 160, position: 'relative' },
  cardImage: { width: '100%', height: '100%' },
  matchBadge: { position: 'absolute', top: 10, right: 10, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  matchText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  cardBody: { padding: 14 },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827', flex: 1, marginRight: 8 },
  cardCat: { fontSize: 12, color: '#6b7280' },
  cardDesc: { fontSize: 13, color: '#6b7280', lineHeight: 18, marginBottom: 10 },
  matchBarRow: { marginBottom: 10 },
  matchLabel: { fontSize: 11, color: '#6b7280', marginBottom: 4 },
  matchBarBg: { height: 6, backgroundColor: '#f3f4f6', borderRadius: 3, overflow: 'hidden' },
  matchBarFill: { height: '100%', borderRadius: 3 },
  metaRow: { flexDirection: 'row', gap: 8 },
  metaChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, gap: 3 },
  metaText: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
});
