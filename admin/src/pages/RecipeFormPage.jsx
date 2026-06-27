import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { recipeService, ingredientService, categoryService } from '../services/api';
import { ArrowLeft, Plus, Trash2, Loader2, Save } from 'lucide-react';

const DIFFICULTIES = ['Kolay', 'Orta', 'Zor'];

export default function RecipeFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '', description: '', imageUrl: '', prepTime: 15, cookTime: 30,
    servings: 4, difficulty: 'Orta', calories: 0, instructions: '', tips: '',
    categoryId: '', isFeatured: false, isActive: true,
  });
  const [recipeIngredients, setRecipeIngredients] = useState([]);
  const [allIngredients, setAllIngredients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      ingredientService.getAll(),
      categoryService.getAll(),
      isEdit ? recipeService.getById(id) : Promise.resolve(null),
    ]).then(([ingsRes, catsRes, recipeRes]) => {
      setAllIngredients(ingsRes.data);
      setCategories(catsRes.data);
      if (recipeRes) {
        const r = recipeRes.data;
        setForm({
          title: r.title, description: r.description, imageUrl: r.imageUrl,
          prepTime: r.prepTime, cookTime: r.cookTime, servings: r.servings,
          difficulty: r.difficulty, calories: r.calories, instructions: r.instructions,
          tips: r.tips, categoryId: String(r.categoryId), isFeatured: r.isFeatured, isActive: r.isActive,
        });
        setRecipeIngredients(r.ingredients.map((ri) => ({
          ingredientId: String(ri.ingredientId),
          amount: ri.amount,
          unit: ri.unit,
          name: ri.ingredient?.name,
        })));
      }
    }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [id]);

  const addIngredient = () => setRecipeIngredients((prev) => [...prev, { ingredientId: '', amount: '', unit: '' }]);
  const removeIngredient = (i) => setRecipeIngredients((prev) => prev.filter((_, idx) => idx !== i));
  const updateIngredient = (i, field, value) => {
    setRecipeIngredients((prev) => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const data = {
        ...form,
        prepTime: Number(form.prepTime),
        cookTime: Number(form.cookTime),
        servings: Number(form.servings),
        calories: Number(form.calories),
        ingredients: recipeIngredients.filter((ri) => ri.ingredientId && ri.amount),
      };
      if (isEdit) {
        await recipeService.update(id, data);
      } else {
        await recipeService.create(data);
      }
      navigate('/recipes');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Kaydetme hatası');
    } finally {
      setSaving(false);
    }
  };

  const f = (field) => ({ value: form[field], onChange: (e) => setForm({ ...form, [field]: e.target.value }) });

  if (loading) return <div className="flex items-center justify-center h-48"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/recipes')} className="btn-secondary py-2 px-3">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Tarifi Düzenle' : 'Yeni Tarif'}</h1>
          <p className="text-gray-500 text-sm">Tarif bilgilerini doldurun</p>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">Temel Bilgiler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Tarif Adı *</label>
              <input {...f('title')} className="input" placeholder="Örn: Mercimek Çorbası" required />
            </div>
            <div className="md:col-span-2">
              <label className="label">Açıklama</label>
              <textarea {...f('description')} className="input h-20 resize-none" placeholder="Kısa tarif açıklaması..." />
            </div>
            <div>
              <label className="label">Kategori *</label>
              <select {...f('categoryId')} className="input" required>
                <option value="">Seçiniz</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Zorluk</label>
              <select {...f('difficulty')} className="input">
                {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Hazırlık Süresi (dk)</label>
              <input type="number" {...f('prepTime')} className="input" min={0} />
            </div>
            <div>
              <label className="label">Pişirme Süresi (dk)</label>
              <input type="number" {...f('cookTime')} className="input" min={0} />
            </div>
            <div>
              <label className="label">Porsiyon</label>
              <input type="number" {...f('servings')} className="input" min={1} />
            </div>
            <div>
              <label className="label">Kalori (kcal)</label>
              <input type="number" {...f('calories')} className="input" min={0} />
            </div>
            <div className="md:col-span-2">
              <label className="label">Görsel URL</label>
              <input {...f('imageUrl')} className="input" placeholder="https://..." />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="w-4 h-4 accent-primary-500"
                />
                <span className="text-sm font-medium">Öne Çıkan</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 accent-primary-500"
                />
                <span className="text-sm font-medium">Aktif</span>
              </label>
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h2 className="font-semibold text-gray-900">Malzemeler</h2>
            <button type="button" onClick={addIngredient} className="btn-primary text-xs py-1.5 px-3">
              <Plus size={14} /> Ekle
            </button>
          </div>
          {recipeIngredients.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">Henüz malzeme eklenmedi</p>
          )}
          <div className="space-y-3">
            {recipeIngredients.map((ri, i) => (
              <div key={i} className="flex gap-2 items-center">
                <select
                  value={ri.ingredientId}
                  onChange={(e) => updateIngredient(i, 'ingredientId', e.target.value)}
                  className="input flex-1"
                >
                  <option value="">Malzeme seç</option>
                  {allIngredients.map((ing) => <option key={ing.id} value={ing.id}>{ing.icon} {ing.name}</option>)}
                </select>
                <input
                  value={ri.amount}
                  onChange={(e) => updateIngredient(i, 'amount', e.target.value)}
                  className="input w-28"
                  placeholder="Miktar"
                />
                <input
                  value={ri.unit}
                  onChange={(e) => updateIngredient(i, 'unit', e.target.value)}
                  className="input w-24"
                  placeholder="Birim"
                />
                <button type="button" onClick={() => removeIngredient(i)} className="text-red-400 hover:text-red-600 p-1">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">Yapılış</h2>
          <div>
            <label className="label">Hazırlanış Adımları</label>
            <textarea
              {...f('instructions')}
              className="input h-40 resize-none font-mono text-sm"
              placeholder="1. Adım açıklaması&#10;2. Adım açıklaması&#10;3. ..."
            />
          </div>
          <div>
            <label className="label">İpuçları</label>
            <textarea {...f('tips')} className="input h-20 resize-none" placeholder="Tarifle ilgili ipuçları..." />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate('/recipes')} className="btn-secondary">
            İptal
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
}
