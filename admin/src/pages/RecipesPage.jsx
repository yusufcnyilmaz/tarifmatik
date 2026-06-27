import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { recipeService } from '../services/api';
import { Plus, Pencil, Trash2, Search, Star, Clock, Users, ChefHat, Filter } from 'lucide-react';

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDiff, setFilterDiff] = useState('');
  const [deleting, setDeleting] = useState(null);

  const load = () => {
    setLoading(true);
    recipeService.getAll().then((r) => { setRecipes(r.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Bu tarifi silmek istediğinize emin misiniz?')) return;
    setDeleting(id);
    try {
      await recipeService.delete(id);
      setRecipes((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Silme hatası');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = recipes.filter((r) => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase());
    const matchDiff = !filterDiff || r.difficulty === filterDiff;
    return matchSearch && matchDiff;
  });

  const diffBadge = (d) => {
    const map = { Kolay: 'bg-green-100 text-green-700', Orta: 'bg-yellow-100 text-yellow-700', Zor: 'bg-red-100 text-red-700' };
    return map[d] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tarifler</h1>
          <p className="text-gray-500 text-sm mt-1">{recipes.length} tarif</p>
        </div>
        <Link to="/recipes/new" className="btn-primary">
          <Plus size={16} /> Yeni Tarif
        </Link>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
            placeholder="Tarif ara..."
          />
        </div>
        <select value={filterDiff} onChange={(e) => setFilterDiff(e.target.value)} className="input w-40">
          <option value="">Tüm Zorluklar</option>
          <option>Kolay</option>
          <option>Orta</option>
          <option>Zor</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((recipe) => (
            <div key={recipe.id} className="card p-0 overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-br from-primary-400 to-orange-600 h-32 flex items-center justify-center relative">
                {recipe.imageUrl ? (
                  <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
                ) : (
                  <ChefHat size={40} className="text-white/70" />
                )}
                {recipe.isFeatured && (
                  <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star size={10} fill="currentColor" /> Öne Çıkan
                  </span>
                )}
                {!recipe.isActive && (
                  <span className="absolute top-2 left-2 bg-gray-800/70 text-white text-xs px-2 py-0.5 rounded-full">Pasif</span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 leading-tight">{recipe.title}</h3>
                  <span className={`badge ${diffBadge(recipe.difficulty)} flex-shrink-0`}>{recipe.difficulty}</span>
                </div>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{recipe.description}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                  <span className="flex items-center gap-1"><Clock size={12} />{recipe.prepTime + recipe.cookTime} dk</span>
                  <span className="flex items-center gap-1"><Users size={12} />{recipe.servings} kişi</span>
                  <span className="text-primary-500 font-medium">{recipe.category?.name}</span>
                </div>
                <div className="flex gap-2">
                  <Link to={`/recipes/${recipe.id}/edit`} className="btn-secondary flex-1 text-xs justify-center py-1.5">
                    <Pencil size={13} /> Düzenle
                  </Link>
                  <button
                    onClick={() => handleDelete(recipe.id)}
                    disabled={deleting === recipe.id}
                    className="btn-danger text-xs px-3 py-1.5"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              <ChefHat size={40} className="mx-auto mb-2 opacity-30" />
              <p>Tarif bulunamadı</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
