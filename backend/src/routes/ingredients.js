const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, adminOnly } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    const where = { isActive: true };
    if (search) where.name = { contains: search };
    if (category) where.category = category;
    const ingredients = await prisma.ingredient.findMany({
      where,
      orderBy: { name: 'asc' },
    });
    res.json(ingredients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const cats = await prisma.ingredient.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: true,
    });
    res.json(cats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!ingredient) return res.status(404).json({ error: 'Malzeme bulunamadı' });
    res.json(ingredient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, adminOnly, async (req, res) => {
  try {
    const { name, category, unit, icon } = req.body;
    if (!name) return res.status(400).json({ error: 'İsim zorunlu' });
    const ingredient = await prisma.ingredient.create({
      data: { name, category: category || 'Diğer', unit: unit || 'adet', icon: icon || '🥦' },
    });
    res.status(201).json(ingredient);
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Bu malzeme zaten mevcut' });
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const { name, category, unit, icon, isActive } = req.body;
    const ingredient = await prisma.ingredient.update({
      where: { id: parseInt(req.params.id) },
      data: { name, category, unit, icon, isActive },
    });
    res.json(ingredient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    await prisma.ingredient.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
