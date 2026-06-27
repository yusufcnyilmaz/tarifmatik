const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed başlıyor...');

  const adminPass = await bcrypt.hash('admin123', 10);
  const userPass = await bcrypt.hash('user123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@tarifmatik.com' },
    update: {},
    create: { name: 'Admin', email: 'admin@tarifmatik.com', password: adminPass, role: 'admin' },
  });
  await prisma.user.upsert({
    where: { email: 'test@tarifmatik.com' },
    update: {},
    create: { name: 'Test Kullanıcı', email: 'test@tarifmatik.com', password: userPass },
  });

  const categories = [
    { name: 'Kahvaltı', icon: '🍳', color: '#FF9F43' },
    { name: 'Ana Yemek', icon: '🍲', color: '#EE5A24' },
    { name: 'Çorba', icon: '🥣', color: '#F9CA24' },
    { name: 'Salata', icon: '🥗', color: '#6AB04C' },
    { name: 'Tatlı', icon: '🍰', color: '#E84393' },
    { name: 'Atıştırmalık', icon: '🥨', color: '#A29BFE' },
    { name: 'İçecek', icon: '🥤', color: '#00B894' },
    { name: 'Makarna', icon: '🍝', color: '#FDCB6E' },
  ];

  const createdCats = {};
  for (const cat of categories) {
    const c = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
    createdCats[cat.name] = c.id;
  }

  const ingredients = [
    { name: 'Yumurta', category: 'Süt Ürünleri', unit: 'adet', icon: '🥚' },
    { name: 'Süt', category: 'Süt Ürünleri', unit: 'ml', icon: '🥛' },
    { name: 'Tereyağı', category: 'Süt Ürünleri', unit: 'gr', icon: '🧈' },
    { name: 'Peynir', category: 'Süt Ürünleri', unit: 'gr', icon: '🧀' },
    { name: 'Yoğurt', category: 'Süt Ürünleri', unit: 'gr', icon: '🥛' },
    { name: 'Tavuk', category: 'Et & Tavuk', unit: 'gr', icon: '🍗' },
    { name: 'Kıyma', category: 'Et & Tavuk', unit: 'gr', icon: '🥩' },
    { name: 'Dana Eti', category: 'Et & Tavuk', unit: 'gr', icon: '🥩' },
    { name: 'Balık', category: 'Deniz Ürünleri', unit: 'gr', icon: '🐟' },
    { name: 'Karides', category: 'Deniz Ürünleri', unit: 'gr', icon: '🦐' },
    { name: 'Domates', category: 'Sebze', unit: 'adet', icon: '🍅' },
    { name: 'Soğan', category: 'Sebze', unit: 'adet', icon: '🧅' },
    { name: 'Sarımsak', category: 'Sebze', unit: 'diş', icon: '🧄' },
    { name: 'Patates', category: 'Sebze', unit: 'adet', icon: '🥔' },
    { name: 'Havuç', category: 'Sebze', unit: 'adet', icon: '🥕' },
    { name: 'Biber', category: 'Sebze', unit: 'adet', icon: '🫑' },
    { name: 'Ispanak', category: 'Sebze', unit: 'gr', icon: '🥬' },
    { name: 'Patlıcan', category: 'Sebze', unit: 'adet', icon: '🍆' },
    { name: 'Kabak', category: 'Sebze', unit: 'adet', icon: '🥒' },
    { name: 'Mantar', category: 'Sebze', unit: 'gr', icon: '🍄' },
    { name: 'Un', category: 'Tahıl', unit: 'gr', icon: '🌾' },
    { name: 'Pirinç', category: 'Tahıl', unit: 'gr', icon: '🍚' },
    { name: 'Makarna', category: 'Tahıl', unit: 'gr', icon: '🍝' },
    { name: 'Ekmek', category: 'Tahıl', unit: 'dilim', icon: '🍞' },
    { name: 'Bulgur', category: 'Tahıl', unit: 'gr', icon: '🌾' },
    { name: 'Zeytinyağı', category: 'Yağ & Sos', unit: 'yemek kaşığı', icon: '🫙' },
    { name: 'Ayçiçek Yağı', category: 'Yağ & Sos', unit: 'yemek kaşığı', icon: '🫙' },
    { name: 'Domates Sosu', category: 'Yağ & Sos', unit: 'gr', icon: '🥫' },
    { name: 'Salça', category: 'Yağ & Sos', unit: 'yemek kaşığı', icon: '🥫' },
    { name: 'Limon', category: 'Meyve', unit: 'adet', icon: '🍋' },
    { name: 'Elma', category: 'Meyve', unit: 'adet', icon: '🍎' },
    { name: 'Muz', category: 'Meyve', unit: 'adet', icon: '🍌' },
    { name: 'Tuz', category: 'Baharat', unit: 'tatlı kaşığı', icon: '🧂' },
    { name: 'Karabiber', category: 'Baharat', unit: 'tatlı kaşığı', icon: '🌶️' },
    { name: 'Kimyon', category: 'Baharat', unit: 'tatlı kaşığı', icon: '🌿' },
    { name: 'Pul Biber', category: 'Baharat', unit: 'tatlı kaşığı', icon: '🌶️' },
    { name: 'Kekik', category: 'Baharat', unit: 'tatlı kaşığı', icon: '🌿' },
    { name: 'Şeker', category: 'Diğer', unit: 'gr', icon: '🍬' },
    { name: 'Nişasta', category: 'Diğer', unit: 'yemek kaşığı', icon: '🥄' },
    { name: 'Kabartma Tozu', category: 'Diğer', unit: 'tatlı kaşığı', icon: '🧪' },
  ];

  const createdIngs = {};
  for (const ing of ingredients) {
    const i = await prisma.ingredient.upsert({
      where: { name: ing.name },
      update: {},
      create: ing,
    });
    createdIngs[ing.name] = i.id;
  }

  const recipes = [
    {
      title: 'Menemen',
      description: 'Geleneksel Türk kahvaltısının vazgeçilmezi, domates ve yumurtalı menemen.',
      prepTime: 10,
      cookTime: 15,
      servings: 2,
      difficulty: 'Kolay',
      calories: 280,
      categoryName: 'Kahvaltı',
      isFeatured: true,
      instructions: '1. Soğanı ve biberi ince ince doğrayın.\n2. Zeytinyağını tavaya alın ve soğanları kavurun.\n3. Biberleri ekleyip 3 dakika daha kavurun.\n4. Domates Sosu veya taze domatesleri ekleyin, 5 dakika pişirin.\n5. Yumurtaları kırıp karıştırın.\n6. Tuz ve karabiber ekleyin, servise hazır hale getirin.',
      tips: 'Daha lezzetli olması için taze domates kullanın.',
      ingredients: ['Yumurta', 'Domates', 'Biber', 'Soğan', 'Zeytinyağı', 'Tuz', 'Karabiber'],
      amounts: ['3 adet', '2 adet', '2 adet', '1 adet', '2 yemek kaşığı', '1 tatlı kaşığı', '1/2 tatlı kaşığı'],
    },
    {
      title: 'Mercimek Çorbası',
      description: 'Besleyici ve doyurucu, geleneksel Türk mutfağının klasiği kırmızı mercimek çorbası.',
      prepTime: 10,
      cookTime: 30,
      servings: 4,
      difficulty: 'Kolay',
      calories: 220,
      categoryName: 'Çorba',
      isFeatured: true,
      instructions: '1. Soğan ve havucu küçük küp doğrayın.\n2. Tereyağında soğanları pembeleştirin.\n3. Mercimek, havuç ve patates ekleyin.\n4. 4 su bardağı su ya da et suyu ekleyin.\n5. 25-30 dakika kısık ateşte pişirin.\n6. Blendırla pürüzsüz hale getirin.\n7. Tuz, karabiber ve kimyon ekleyip servis yapın.',
      tips: 'Üzerine limon sıkarak servis yapabilirsiniz.',
      ingredients: ['Soğan', 'Havuç', 'Patates', 'Tereyağı', 'Tuz', 'Kimyon', 'Karabiber'],
      amounts: ['1 adet', '1 adet', '1 adet', '2 yemek kaşığı', '1 tatlı kaşığı', '1/2 tatlı kaşığı', '1/2 tatlı kaşığı'],
    },
    {
      title: 'Tavuklu Pilav',
      description: 'Nefis tavuklu pirinç pilavı, her sofranın baş tacı.',
      prepTime: 15,
      cookTime: 35,
      servings: 4,
      difficulty: 'Orta',
      calories: 420,
      categoryName: 'Ana Yemek',
      isFeatured: true,
      instructions: '1. Tavuğu küp doğrayıp tuzla 10 dakika marine edin.\n2. Tereyağında tavukları mühürleyin.\n3. Yıkanmış pirinci ekleyip 2 dakika kavurun.\n4. 2 kat su ekleyip kapağını kapatın.\n5. Kısık ateşte 20 dakika pişirin.\n6. Dinlendirip servis yapın.',
      tips: 'Pilavı demlemek için ocaktan aldıktan sonra 10 dakika bekleyin.',
      ingredients: ['Tavuk', 'Pirinç', 'Tereyağı', 'Soğan', 'Tuz', 'Karabiber'],
      amounts: ['400 gr', '2 su bardağı', '2 yemek kaşığı', '1 adet', '1 tatlı kaşığı', '1/2 tatlı kaşığı'],
    },
    {
      title: 'Kıymalı Makarna',
      description: 'Klasik kıymalı Bolonez soslu makarna, ailenin sevgilisi.',
      prepTime: 10,
      cookTime: 30,
      servings: 4,
      difficulty: 'Orta',
      calories: 520,
      categoryName: 'Makarna',
      isFeatured: false,
      instructions: '1. Makarnayı tuzlu suda haşlayın.\n2. Soğan ve sarımsağı yağda kavurun.\n3. Kıymayı ekleyip suyunu çekinceye kadar kavurun.\n4. Salça ve domates sosu ekleyin.\n5. Tuz ve baharatları ekleyip 10 dakika pişirin.\n6. Makarnayı sosuyla karıştırıp servis yapın.',
      tips: 'Üzerine rendelenmiş kaşar peyniri serpin.',
      ingredients: ['Makarna', 'Kıyma', 'Soğan', 'Sarımsak', 'Salça', 'Domates Sosu', 'Zeytinyağı', 'Tuz', 'Karabiber'],
      amounts: ['400 gr', '300 gr', '1 adet', '3 diş', '1 yemek kaşığı', '200 gr', '2 yemek kaşığı', '1 tatlı kaşığı', '1/2 tatlı kaşığı'],
    },
    {
      title: 'Ispanaklı Börek',
      description: 'Çıtır çıtır yufkalarla sarılmış ıspanaklı nefis börek.',
      prepTime: 20,
      cookTime: 40,
      servings: 6,
      difficulty: 'Orta',
      calories: 380,
      categoryName: 'Atıştırmalık',
      isFeatured: false,
      instructions: '1. Ispanağı yıkayıp doğrayın.\n2. Soğanı zeytinyağında kavurun, ıspanağı ekleyin.\n3. Tuz ve karabiberi ekleyip soğutun.\n4. Yufkaları açıp içine harcı koyun.\n5. Rulo yapıp tepsiye dizin.\n6. Üzerine yumurta sürün.\n7. 180°C fırında 35-40 dakika pişirin.',
      tips: 'Daha lezzetli olması için peynir de ekleyebilirsiniz.',
      ingredients: ['Ispanak', 'Soğan', 'Yumurta', 'Un', 'Zeytinyağı', 'Tuz', 'Karabiber'],
      amounts: ['500 gr', '2 adet', '2 adet', '500 gr', '3 yemek kaşığı', '1 tatlı kaşığı', '1/2 tatlı kaşığı'],
    },
    {
      title: 'Sütlaç',
      description: 'Geleneksel Osmanlı tatlısı, kremamsız sütlaç.',
      prepTime: 10,
      cookTime: 40,
      servings: 6,
      difficulty: 'Kolay',
      calories: 250,
      categoryName: 'Tatlı',
      isFeatured: false,
      instructions: '1. Pirinci yıkayıp 2 bardak suda yumuşayana kadar pişirin.\n2. Sütü ekleyip kaynatın.\n3. Şeker ve nişastayı soğuk sütle eritip ekleyin.\n4. Sürekli karıştırarak koyulaşana kadar pişirin.\n5. Kaselere dökün ve soğutun.\n6. İsteğe göre üzerini fırında kızartın.',
      tips: 'Üzerine tarçın serperek servis yapabilirsiniz.',
      ingredients: ['Pirinç', 'Süt', 'Şeker', 'Nişasta'],
      amounts: ['3 yemek kaşığı', '1 litre', '6 yemek kaşığı', '2 yemek kaşığı'],
    },
    {
      title: 'Patlıcan Musakka',
      description: 'Fırında pişirilmiş geleneksel patlıcan musakka.',
      prepTime: 30,
      cookTime: 45,
      servings: 6,
      difficulty: 'Zor',
      calories: 460,
      categoryName: 'Ana Yemek',
      isFeatured: true,
      instructions: '1. Patlıcanları dilimleyip tuzlu suda bekletin.\n2. Patlıcanları kızartın veya yağlayıp fırında pişirin.\n3. Soğan ve kıymayı kavurun.\n4. Salça ve domates ekleyin, baharatları koyun.\n5. Tepsiye patlıcan ve kıyma sos sırayla dizin.\n6. Üzerine domates dilimleri koyun.\n7. 180°C de 40-45 dakika pişirin.',
      tips: 'Kıyma yerine köfte eti de kullanabilirsiniz.',
      ingredients: ['Patlıcan', 'Kıyma', 'Soğan', 'Domates', 'Salça', 'Zeytinyağı', 'Tuz', 'Karabiber', 'Pul Biber'],
      amounts: ['3 adet', '400 gr', '2 adet', '3 adet', '2 yemek kaşığı', '4 yemek kaşığı', '1 tatlı kaşığı', '1/2 tatlı kaşığı', '1 tatlı kaşığı'],
    },
    {
      title: 'Patates Kızartması',
      description: 'Çıtır çıtır altın sarısı patates kızartması.',
      prepTime: 15,
      cookTime: 20,
      servings: 4,
      difficulty: 'Kolay',
      calories: 310,
      categoryName: 'Atıştırmalık',
      isFeatured: false,
      instructions: '1. Patatesleri soyup çubuk şeklinde doğrayın.\n2. Soğuk suda 30 dakika bekletin.\n3. Kurulayın.\n4. Bol yağda kızartın.\n5. Tuzlayıp servis yapın.',
      tips: 'İki kez kızartırsanız daha çıtır olur.',
      ingredients: ['Patates', 'Ayçiçek Yağı', 'Tuz'],
      amounts: ['4 adet', '500 ml', '1 tatlı kaşığı'],
    },
  ];

  for (const r of recipes) {
    const existing = await prisma.recipe.findFirst({ where: { title: r.title } });
    if (!existing) {
      const ings = r.ingredients.map((name, i) => ({
        ingredientId: createdIngs[name],
        amount: r.amounts[i],
        unit: '',
      })).filter((i) => i.ingredientId);

      await prisma.recipe.create({
        data: {
          title: r.title,
          description: r.description,
          prepTime: r.prepTime,
          cookTime: r.cookTime,
          servings: r.servings,
          difficulty: r.difficulty,
          calories: r.calories,
          instructions: r.instructions,
          tips: r.tips,
          categoryId: createdCats[r.categoryName],
          isFeatured: r.isFeatured,
          ingredients: { create: ings },
        },
      });
    }
  }

  await prisma.appSettings.upsert({ where: { key: 'appName' }, update: {}, create: { key: 'appName', value: 'Tarifmatik' } });
  await prisma.appSettings.upsert({ where: { key: 'maxPantryItems' }, update: {}, create: { key: 'maxPantryItems', value: '50' } });
  await prisma.appSettings.upsert({ where: { key: 'maintenanceMode' }, update: {}, create: { key: 'maintenanceMode', value: 'false' } });

  console.log('✅ Seed tamamlandı!');
  console.log('👤 Admin: admin@tarifmatik.com / admin123');
  console.log('👤 Test:  test@tarifmatik.com  / user123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
