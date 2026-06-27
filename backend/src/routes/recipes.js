const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, adminOnly } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const { category, difficulty, search, featured } = req.query;
    const where = { isActive: true };
    if (category) where.categoryId = parseInt(category);
    if (difficulty) where.difficulty = difficulty;
    if (featured === 'true') where.isFeatured = true;
    if (search) where.title = { contains: search };

    const recipes = await prisma.recipe.findMany({
      where,
      include: {
        category: true,
        ingredients: { include: { ingredient: true } },
      },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    });
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/suggest', async (req, res) => {
  try {
    const { ingredientIds } = req.body;
    if (!ingredientIds || ingredientIds.length === 0)
      return res.json([]);

    const ids = ingredientIds.map(Number);

    const recipes = await prisma.recipe.findMany({
      where: { isActive: true },
      include: {
        category: true,
        ingredients: { include: { ingredient: true } },
      },
    });

    const scored = recipes.map((recipe) => {
      const recipeIngIds = recipe.ingredients.map((ri) => ri.ingredientId);
      const matched = recipeIngIds.filter((id) => ids.includes(id));
      const total = recipeIngIds.length;
      const matchPct = total > 0 ? matched.length / total : 0;
      return { ...recipe, matchCount: matched.length, totalIngredients: total, matchPct };
    });

    const filtered = scored
      .filter((r) => r.matchCount > 0)
      .sort((a, b) => b.matchPct - a.matchPct || b.matchCount - a.matchCount);

    res.json(filtered.slice(0, 20));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        category: true,
        ingredients: { include: { ingredient: true } },
      },
    });
    if (!recipe) return res.status(404).json({ error: 'Tarif bulunamadı' });
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, adminOnly, async (req, res) => {
  try {
    const {
      title, description, imageUrl, prepTime, cookTime, servings,
      difficulty, calories, instructions, tips, categoryId, isFeatured, ingredients,
    } = req.body;
    if (!title || !categoryId) return res.status(400).json({ error: 'Başlık ve kategori zorunlu' });

    const recipe = await prisma.recipe.create({
      data: {
        title, description: description || '', imageUrl: imageUrl || '',
        prepTime: prepTime || 15, cookTime: cookTime || 30,
        servings: servings || 4, difficulty: difficulty || 'Orta',
        calories: calories || 0, instructions: instructions || '',
        tips: tips || '', categoryId: parseInt(categoryId),
        isFeatured: isFeatured || false,
        ingredients: {
          create: (ingredients || []).map((ing) => ({
            ingredientId: parseInt(ing.ingredientId),
            amount: ing.amount,
            unit: ing.unit || '',
          })),
        },
      },
      include: { category: true, ingredients: { include: { ingredient: true } } },
    });
    res.status(201).json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const {
      title, description, imageUrl, prepTime, cookTime, servings,
      difficulty, calories, instructions, tips, categoryId, isFeatured, isActive, ingredients,
    } = req.body;

    await prisma.recipeIngredient.deleteMany({ where: { recipeId: parseInt(req.params.id) } });

    const recipe = await prisma.recipe.update({
      where: { id: parseInt(req.params.id) },
      data: {
        title, description, imageUrl, prepTime, cookTime, servings,
        difficulty, calories, instructions, tips,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        isFeatured, isActive,
        ingredients: {
          create: (ingredients || []).map((ing) => ({
            ingredientId: parseInt(ing.ingredientId),
            amount: ing.amount,
            unit: ing.unit || '',
          })),
        },
      },
      include: { category: true, ingredients: { include: { ingredient: true } } },
    });
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    await prisma.recipe.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
