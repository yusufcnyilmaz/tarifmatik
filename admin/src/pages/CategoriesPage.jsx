import React, { useEffect, useState } from 'react';
import { categoryService } from '../services/api';
import { Plus, Pencil, Trash2, X, Check, Loader2 } from 'lucide-react';

const emptyForm = { name: '', icon: '🍽️', color: '#f97316', isActive: true };

export default function CategoriesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    categoryService.getAll().then((r) => { setItems(r.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(emptyForm); setEditId(null); setError(''); setModal(true); };
  const openEdit = (item) => { setForm({ name: item.name, icon: item.icon, color: item.color, isActive: item.isActive }); setEditId(item.id); setError(''); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editId) {
        const res = await categoryService.update(editId, form);
        setItems((prev) => prev.map((i) => i.id === editId ? res.data : i));
      } else {
        const res = await categoryService.create(form);
        setItems((prev) => [...prev, res.data]);
      }
      setModal(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Kaydetme hatası');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
    setDeleting(id);
    try {
      await categoryService.delete(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Silme hatası');
    } finally {
      setDeleting(null);
    }
  };

  const f = (field) => ({ value: form[field], onChange: (e) => setForm({ ...form, [field]: e.target.value }) });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kategoriler</h1>
          <p className="text-gray-500 text-sm mt-1">{items.length} kategori</p>
        </div>
        <button onClick={openNew} className="btn-primary"><Plus size={16} /> Yeni Kategori</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((cat) => (
            <div key={cat.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: cat.color + '20' }}>
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{cat.name}</p>
                  <p className="text-xs text-gray-400">{cat._count?.recipes || 0} tarif</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-200" style={{ backgroundColor: cat.color }} />
                  <span className={`badge ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {cat.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(cat)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(cat.id)} disabled={deleting === cat.id} className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600">
                    {deleting === cat.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">Henüz kategori yok</div>
          )}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{editId ? 'Kategori Düzenle' : 'Yeni Kategori'}</h2>
              <button onClick={() => setModal(false)} className="p-1 rounded hover:bg-gray-100"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>}
              <div>
                <label className="label">Emoji İkonu</label>
                <input {...f('icon')} className="input" placeholder="🍽️" />
              </div>
              <div>
                <label className="label">Kategori Adı *</label>
                <input {...f('name')} className="input" placeholder="Kahvaltı" required />
              </div>
              <div>
                <label className="label">Renk</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-12 h-10 rounded border border-gray-200 cursor-pointer" />
                  <input {...f('color')} className="input flex-1" placeholder="#f97316" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-primary-500" />
                <span className="text-sm font-medium">Aktif</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1 justify-center">İptal</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
