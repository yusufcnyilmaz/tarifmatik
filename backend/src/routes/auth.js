const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Tüm alanlar zorunlu' });
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ error: 'Bu e-posta zaten kayıtlı' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'E-posta ve şifre gerekli' });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive)
      return res.status(401).json({ error: 'Kullanıcı bulunamadı veya hesap pasif' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Hatalı şifre' });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/me', authenticate, async (req, res) => {
  try {
    const { name, password } = req.body;
    const data = {};
    if (name) data.name = name;
    if (password) data.password = await bcrypt.hash(password, 10);
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: { id: true, name: true, email: true, role: true },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
