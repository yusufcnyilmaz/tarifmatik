const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/pantry', authenticate, async (req, res) => {
  try {
    const pantry = await prisma.userPantry.findMany({
      where: { userId: req.user.id },
      include: { ingredient: true },
      orderBy: { addedAt: 'desc' },
    });
    res.json(pantry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/pantry', authenticate, async (req, res) => {
  try {
    const { ingredientId } = req.body;
    if (!ingredientId) return res.status(400).json({ error: 'Malzeme ID gerekli' });
    const item = await prisma.userPantry.upsert({
      where: { userId_ingredientId: { userId: req.user.id, ingredientId: parseInt(ingredientId) } },
      update: {},
      create: { userId: req.user.id, ingredientId: parseInt(ingredientId) },
      include: { ingredient: true },
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/pantry/bulk', authenticate, async (req, res) => {
  try {
    const { ingredientIds } = req.body;
    if (!ingredientIds || !Array.isArray(ingredientIds))
      return res.status(400).json({ error: 'ingredientIds dizisi gerekli' });

    await prisma.userPantry.deleteMany({ where: { userId: req.user.id } });
    if (ingredientIds.length > 0) {
      await prisma.userPantry.createMany({
        data: ingredientIds.map((id) => ({ userId: req.user.id, ingredientId: parseInt(id) })),
        skipDuplicates: true,
      });
    }
    const pantry = await prisma.userPantry.findMany({
      where: { userId: req.user.id },
      include: { ingredient: true },
    });
    res.json(pantry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/pantry/:ingredientId', authenticate, async (req, res) => {
  try {
    await prisma.userPantry.delete({
      where: {
        userId_ingredientId: {
          userId: req.user.id,
          ingredientId: parseInt(req.params.ingredientId),
        },
      },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/pantry', authenticate, async (req, res) => {
  try {
    await prisma.userPantry.deleteMany({ where: { userId: req.user.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
