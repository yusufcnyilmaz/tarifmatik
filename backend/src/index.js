require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');
const ingredientRoutes = require('./routes/ingredients');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const categoryRoutes = require('./routes/categories');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);

app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'Tarifmatik API' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Sunucu hatası', message: err.message });
});

app.listen(PORT, () => {
  console.log(`✅ Tarifmatik API çalışıyor: http://localhost:${PORT}`);
});
