# 🍳 Tarifmatik

**Malzemelerini gir, tarifini bul!** — Evdeki malzemelere göre yemek tarifi öneren full-stack native mobil uygulama.

---

## 📦 Proje Yapısı

```
tarifmatik/
├── backend/          # Node.js + Express + Prisma + SQLite API
├── admin/            # React + Vite + TailwindCSS Admin Paneli
└── mobile/           # React Native + Expo Mobil Uygulaması
```

---

## 🚀 Hızlı Başlangıç

### Gereksinimler

| Araç | Versiyon |
|------|----------|
| Node.js | >= 18.x |
| npm | >= 9.x |
| Expo CLI | >= 7.x |

---

## 1️⃣ Backend Kurulumu

```bash
cd backend
npm install
```

### Veritabanı Oluşturma

```bash
# Prisma istemcisini oluştur
npm run db:generate

# Veritabanı tablolarını oluştur
npm run db:push

# Örnek verilerle doldur (tarifler, kategoriler, malzemeler)
npm run db:seed
```

### Başlatma

```bash
npm run dev
```

API çalışıyor: `http://localhost:3001`

### Varsayılan Hesaplar (seed sonrası)

| Rol | E-posta | Şifre |
|-----|---------|-------|
| Admin | admin@tarifmatik.com | admin123 |
| Test Kullanıcı | test@tarifmatik.com | user123 |

---

## 2️⃣ Admin Paneli Kurulumu

```bash
cd admin
npm install
npm run dev
```

Admin paneli çalışıyor: `http://localhost:3002`

**Giriş:** `admin@tarifmatik.com` / `admin123`

### Admin Panel Özellikleri

- **Dashboard** — İstatistikler, grafik, son kayıtlar
- **Tarifler** — Tarif ekle/düzenle/sil, malzeme ekle, görsel URL
- **Malzemeler** — Malzeme yönetimi, kategori, birim, emoji ikon
- **Kategoriler** — Kategori yönetimi, renk, emoji ikon
- **Kullanıcılar** — Kullanıcı yönetimi, rol atama (admin/user)
- **Ayarlar** — Uygulama adı, maks dolap malzeme sayısı, bakım modu

---

## 3️⃣ Mobil Uygulama Kurulumu

```bash
cd mobile
npm install
```

### iOS / Android Simulator ile Çalıştırma

```bash
# Expo geliştirme sunucusunu başlat
npm start

# iOS simulator (macOS gerektirir)
npm run ios

# Android emulator
npm run android
```

### Fiziksel Cihazda Test

1. [Expo Go](https://expo.dev/client) uygulamasını cihazınıza yükleyin
2. `npm start` komutunu çalıştırın
3. Terminaldeki QR kodu Expo Go ile okutun

> ⚠️ **Önemli:** Fiziksel cihazda test için `mobile/src/services/api.js` dosyasındaki `BASE_URL`'i bilgisayarınızın yerel IP adresiyle değiştirin:
>
> ```js
> const BASE_URL = 'http://192.168.x.x:3001/api'; // kendi IP'nizi yazın
> ```

---

## 📱 Mobil Uygulama Özellikleri

| Ekran | Açıklama |
|-------|----------|
| **Giriş / Kayıt** | JWT tabanlı kimlik doğrulama |
| **Ana Sayfa** | Öne çıkan tarifler, kategoriler, tüm tarifler |
| **Dolabım** | Malzeme ekle/çıkar, kategorilere göre listeleme |
| **Tarif Önerileri** | Dolaptaki malzemelere göre eşleşme yüzdesiyle sıralı öneriler |
| **Favoriler** | Kaydedilen tarif listesi |
| **Profil** | Profil düzenleme, şifre değiştirme, çıkış |

### Tarif Detay Ekranı

- Malzeme listesi (miktarlarıyla)
- Adım adım yapılış talimatları
- Süre, porsiyon, kalori bilgisi
- Favori ekleme / paylaşma

---

## 🔌 API Endpoint'leri

### Auth
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/auth/register` | Kayıt ol |
| POST | `/api/auth/login` | Giriş yap |
| GET | `/api/auth/me` | Profil bilgisi |
| PUT | `/api/auth/me` | Profil güncelle |

### Tarifler
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/recipes` | Tüm tarifler (filtre: category, difficulty, search, featured) |
| POST | `/api/recipes/suggest` | Malzemelere göre öneri (body: `{ ingredientIds }`) |
| GET | `/api/recipes/:id` | Tarif detayı |
| POST | `/api/recipes` | Yeni tarif (Admin) |
| PUT | `/api/recipes/:id` | Tarif güncelle (Admin) |
| DELETE | `/api/recipes/:id` | Tarif sil (Admin) |

### Malzemeler
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/ingredients` | Tüm malzemeler |
| POST | `/api/ingredients` | Yeni malzeme (Admin) |
| PUT | `/api/ingredients/:id` | Malzeme güncelle (Admin) |
| DELETE | `/api/ingredients/:id` | Malzeme sil (Admin) |

### Kullanıcı Dolabı
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/users/pantry` | Kullanıcının dolabı |
| POST | `/api/users/pantry` | Malzeme ekle |
| DELETE | `/api/users/pantry/:ingredientId` | Malzeme çıkar |
| DELETE | `/api/users/pantry` | Dolabı temizle |

### Favoriler
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/users/favorites` | Favori tarifler |
| POST | `/api/users/favorites/:recipeId` | Favoriye ekle |
| DELETE | `/api/users/favorites/:recipeId` | Favoriden çıkar |

---

## 🗄️ Veritabanı Şeması

```
User ──── UserPantry ──── Ingredient ──── RecipeIngredient ──── Recipe
  │                                                                │
  └──── FavoriteRecipe ─────────────────────────────────────────►┘
                                                                  │
                                                              Category
```

### Tablolar

- **User** — Kullanıcılar (id, name, email, password, role, isActive)
- **Category** — Tarif kategorileri (Kahvaltı, Ana Yemek, Çorba vb.)
- **Ingredient** — Malzemeler (40+ örnek malzeme seed ile gelir)
- **Recipe** — Tarifler (başlık, açıklama, süre, zorluk, talimatlar)
- **RecipeIngredient** — Tarif-malzeme ilişkisi (miktar ve birim)
- **UserPantry** — Kullanıcı dolab içeriği
- **FavoriteRecipe** — Kullanıcı favorileri
- **AppSettings** — Uygulama ayarları (key-value)

---

## ⚙️ Ortam Değişkenleri

### backend/.env
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="tarifmatik-super-secret-jwt-key-2024"
JWT_EXPIRES_IN="7d"
PORT=3001
```

### admin/.env
```env
VITE_API_URL=http://localhost:3001/api
```

---

## 🛠️ Tüm Servisleri Aynı Anda Başlatma

Üç ayrı terminal penceresinde:

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Admin Paneli  
cd admin && npm run dev

# Terminal 3 — Mobil Uygulama
cd mobile && npm start
```

---

## 🏗️ Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| **Mobil** | React Native, Expo, React Navigation |
| **UI** | Expo Linear Gradient, @expo/vector-icons (Ionicons) |
| **Admin** | React 18, Vite, TailwindCSS, Recharts |
| **Backend** | Node.js, Express.js, JWT, Bcrypt |
| **ORM** | Prisma |
| **Veritabanı** | SQLite (geliştirme), PostgreSQL'e taşınabilir |
| **HTTP Client** | Axios |

---

## 📸 Ekran Görüntüleri

```
Giriş Ekranı → Turuncu gradient, logo, form
Ana Sayfa     → Öne çıkan tarifler (yatay scroll), kategori filtreleri, tarif listesi
Dolabım       → Malzeme seç/çıkar, kategorilere göre SectionList, öneri butonu
Öneriler      → Eşleşme yüzdesi çubuğu, renkli eşleşme rozeti, sıralı tarif listesi
Tarif Detayı  → Hero görsel, malzeme listesi, adım adım talimatlar, ipuçları
Admin Panel   → Koyu sidebar, dashboard grafikleri, CRUD tabloları, modal formlar
```

---

## 🔒 Güvenlik

- Şifreler **bcrypt** ile hash'lenir
- JWT token `SecureStore` (Expo) ile güvenli saklanır
- Admin route'ları `authenticate + adminOnly` middleware ile korunur
- Rate limiting: 15 dakikada 200 istek

---

*Tarifmatik — Evdeki malzemelere göre tarif önerisi yapan akıllı mutfak asistanı 🍳*
