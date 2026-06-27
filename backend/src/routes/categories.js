const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, adminOnly } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: { _count: { select: { recipes: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, adminOnly, async (req, res) => {
  try {
    const { name, icon, color } = req.body;
    if (!name) return res.status(400).json({ error: 'İsim zorunlu' });
    const category = await prisma.category.create({
      data: { name, icon: icon || '🍽️', color: color || '#FF6B35' },
    });
    res.status(201).json(category);
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Bu kategori zaten mevcut' });
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const { name, icon, color, isActive } = req.body;
    const category = await prisma.category.update({
      where: { id: parseInt(req.params.id) },
      data: { name, icon, color, isActive },
    });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    await prisma.category.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
