const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { authenticate, adminOnly } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate, adminOnly);

router.get('/stats', async (req, res) => {
  try {
    const [users, recipes, ingredients, categories] = await Promise.all([
      prisma.user.count(),
      prisma.recipe.count(),
      prisma.ingredient.count(),
      prisma.category.count(),
    ]);
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    const popularRecipes = await prisma.recipe.findMany({
      take: 5,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ users, recipes, ingredients, categories, recentUsers, popularRecipes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: role || 'user' },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    });
    res.status(201).json(user);
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'E-posta zaten kayıtlı' });
    res.status(500).json({ error: err.message });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, role, isActive, password } = req.body;
    const data = { name, email, role, isActive };
    if (password) data.password = await bcrypt.hash(password, 10);
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data,
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/recipes', async (req, res) => {
  try {
    const recipes = await prisma.recipe.findMany({
      include: {
        category: true,
        ingredients: { include: { ingredient: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/ingredients', async (req, res) => {
  try {
    const ingredients = await prisma.ingredient.findMany({ orderBy: { name: 'asc' } });
    res.json(ingredients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { recipes: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/settings', async (req, res) => {
  try {
    const settings = await prisma.appSettings.findMany();
    const obj = {};
    settings.forEach((s) => { obj[s.key] = s.value; });
    res.json(obj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
      await prisma.appSettings.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
