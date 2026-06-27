import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, Alert, Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { recipeAPI } from '../services/api';

const ORANGE = '#f97316';

export default function RecipeDetailScreen({ route, navigation }) {
  const { recipe: initialRecipe } = route.params;
  const [recipe, setRecipe] = useState(initialRecipe);

  useEffect(() => {
    loadFull();
  }, [initialRecipe.id]);

  const loadFull = async () => {
    try {
      const res = await recipeAPI.getById(initialRecipe.id);
      setRecipe(res.data);
    } catch {}
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: `${recipe.title} tarifini Tarifmatik'te kontrol et!` });
    } catch {}
  };

  const steps = (recipe.instructions || '').split('\n').filter((s) => s.trim());
  const diffColor = { Kolay: '#22c55e', Orta: '#f59e0b', Zor: '#ef4444' };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          {recipe.imageUrl ? (
            <Image source={{ uri: recipe.imageUrl }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <LinearGradient colors={['#fb923c', '#c2410c']} style={styles.heroImage}>
              <Text style={{ fontSize: 72 }}>{recipe.category?.icon || '🍽️'}</Text>
            </LinearGradient>
          )}
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.5)']} style={styles.heroOverlay} />
        </View>

        {/* Action bar */}
        <View style={styles.actionBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.actionBtn}>
            <Ionicons name="arrow-back" size={22} color="#374151" />
          </TouchableOpacity>
          <View style={styles.actionRight}>
            <TouchableOpacity onPress={handleShare} style={styles.actionBtn}>
              <Ionicons name="share-outline" size={22} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {/* Title */}
          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{recipe.title}</Text>
            </View>
            <View style={styles.badges}>
              <View style={styles.catBadge}>
                <Text style={styles.catBadgeText}>{recipe.category?.icon} {recipe.category?.name}</Text>
              </View>
              {recipe.isFeatured && (
                <View style={styles.featBadge}>
                  <Ionicons name="star" size={11} color="#fff" />
                  <Text style={styles.featBadgeText}>Öne Çıkan</Text>
                </View>
              )}
              <View style={[styles.diffBadge, { backgroundColor: (diffColor[recipe.difficulty] || '#9ca3af') + '20' }]}>
                <Text style={[styles.diffBadgeText, { color: diffColor[recipe.difficulty] || '#9ca3af' }]}>{recipe.difficulty}</Text>
              </View>
            </View>
            <Text style={styles.description}>{recipe.description}</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="time-outline" size={20} color={ORANGE} />
              <Text style={styles.statValue}>{recipe.prepTime} dk</Text>
              <Text style={styles.statLabel}>Hazırlık</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Ionicons name="flame-outline" size={20} color={ORANGE} />
              <Text style={styles.statValue}>{recipe.cookTime} dk</Text>
              <Text style={styles.statLabel}>Pişirme</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Ionicons name="people-outline" size={20} color={ORANGE} />
              <Text style={styles.statValue}>{recipe.servings}</Text>
              <Text style={styles.statLabel}>Kişi</Text>
            </View>
            {recipe.calories > 0 && (
              <>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Ionicons name="fitness-outline" size={20} color={ORANGE} />
                  <Text style={styles.statValue}>{recipe.calories}</Text>
                  <Text style={styles.statLabel}>Kalori</Text>
                </View>
              </>
            )}
          </View>

          {/* Ingredients */}
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Malzemeler</Text>
              <View style={styles.ingredientsList}>
                {recipe.ingredients.map((ri, i) => (
                  <View key={i} style={[styles.ingredientItem, i % 2 === 0 && { backgroundColor: '#f9fafb' }]}>
                    <Text style={styles.ingredientIcon}>{ri.ingredient?.icon || '🥦'}</Text>
                    <Text style={styles.ingredientName}>{ri.ingredient?.name}</Text>
                    <Text style={styles.ingredientAmount}>{ri.amount} {ri.unit}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Steps */}
          {steps.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Yapılışı</Text>
              {steps.map((step, i) => (
                <View key={i} style={styles.step}>
                  <View style={styles.stepNum}>
                    <Text style={styles.stepNumText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step.replace(/^\d+\.\s*/, '')}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Tips */}
          {recipe.tips ? (
            <View style={[styles.section, { paddingBottom: 40 }]}>
              <Text style={styles.sectionTitle}>💡 İpuçları</Text>
              <View style={styles.tipsBox}>
                <Text style={styles.tipsText}>{recipe.tips}</Text>
              </View>
            </View>
          ) : <View style={{ height: 40 }} />}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  hero: { height: 280, position: 'relative' },
  heroImage: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  heroOverlay: { position: 'absolute', inset: 0 },
  actionBar: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 52, zIndex: 10 },
  actionRight: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.92)', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  content: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20, paddingTop: 20 },
  titleSection: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  titleRow: { marginBottom: 10 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', lineHeight: 30 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  catBadge: { backgroundColor: '#fff7ed', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  catBadgeText: { color: ORANGE, fontSize: 12, fontWeight: '700' },
  featBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f59e0b', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 4 },
  featBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  diffBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  diffBadgeText: { fontSize: 12, fontWeight: '700' },
  description: { fontSize: 14, color: '#6b7280', lineHeight: 20 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statDivider: { width: 1, backgroundColor: '#f3f4f6', marginVertical: 4 },
  statValue: { fontSize: 16, fontWeight: '700', color: '#111827' },
  statLabel: { fontSize: 11, color: '#9ca3af' },
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 14 },
  ingredientsList: { borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#f3f4f6' },
  ingredientItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', gap: 10 },
  ingredientIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  ingredientName: { flex: 1, fontSize: 14, color: '#374151', fontWeight: '500' },
  ingredientAmount: { fontSize: 13, color: ORANGE, fontWeight: '700' },
  step: { flexDirection: 'row', gap: 14, marginBottom: 16, alignItems: 'flex-start' },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: ORANGE, justifyContent: 'center', alignItems: 'center', flexShrink: 0, marginTop: 1 },
  stepNumText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  stepText: { flex: 1, fontSize: 14, color: '#374151', lineHeight: 22 },
  tipsBox: { backgroundColor: '#fff7ed', borderRadius: 14, padding: 16, borderLeftWidth: 4, borderLeftColor: ORANGE },
  tipsText: { fontSize: 14, color: '#78350f', lineHeight: 22 },
});
