import React, { useEffect, useState } from 'react';
import { ingredientService } from '../services/api';
import { Plus, Pencil, Trash2, Search, X, Check, Loader2 } from 'lucide-react';

const CATEGORIES = ['Süt Ürünleri', 'Et & Tavuk', 'Deniz Ürünleri', 'Sebze', 'Meyve', 'Tahıl', 'Yağ & Sos', 'Baharat', 'Diğer'];
const UNITS = ['adet', 'gr', 'kg', 'ml', 'litre', 'yemek kaşığı', 'tatlı kaşığı', 'su bardağı', 'diş', 'dilim', 'demet'];

const emptyForm = { name: '', category: 'Sebze', unit: 'adet', icon: '🥦', isActive: true };

export default function IngredientsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    ingredientService.getAll().then((r) => { setItems(r.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(emptyForm); setEditId(null); setError(''); setModal(true); };
  const openEdit = (item) => { setForm({ name: item.name, category: item.category, unit: item.unit, icon: item.icon, isActive: item.isActive }); setEditId(item.id); setError(''); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editId) {
        const res = await ingredientService.update(editId, form);
        setItems((prev) => prev.map((i) => i.id === editId ? res.data : i));
      } else {
        const res = await ingredientService.create(form);
        setItems((prev) => [res.data, ...prev]);
      }
      setModal(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Kaydetme hatası');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu malzemeyi silmek istediğinize emin misiniz?')) return;
    setDeleting(id);
    try {
      await ingredientService.delete(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Silme hatası');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = items.filter((i) => {
    const matchS = i.name.toLowerCase().includes(search.toLowerCase());
    const matchC = !filterCat || i.category === filterCat;
    return matchS && matchC;
  });

  const f = (field) => ({ value: form[field], onChange: (e) => setForm({ ...form, [field]: e.target.value }) });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Malzemeler</h1>
          <p className="text-gray-500 text-sm mt-1">{items.length} malzeme</p>
        </div>
        <button onClick={openNew} className="btn-primary"><Plus size={16} /> Yeni Malzeme</button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-9" placeholder="Malzeme ara..." />
        </div>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="input w-44">
          <option value="">Tüm Kategoriler</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Malzeme</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Kategori</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Birim</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Durum</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{item.category}</td>
                  <td className="py-3 px-4 text-gray-500">{item.unit}</td>
                  <td className="py-3 px-4">
                    <span className={`badge ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {item.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(item)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"><Pencil size={15} /></button>
                      <button onClick={() => handleDelete(item.id)} disabled={deleting === item.id} className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600">
                        {deleting === item.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">Malzeme bulunamadı</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{editId ? 'Malzeme Düzenle' : 'Yeni Malzeme'}</h2>
              <button onClick={() => setModal(false)} className="p-1 rounded hover:bg-gray-100"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>}
              <div>
                <label className="label">Emoji İkonu</label>
                <input {...f('icon')} className="input" placeholder="🥦" />
              </div>
              <div>
                <label className="label">İsim *</label>
                <input {...f('name')} className="input" placeholder="Malzeme adı" required />
              </div>
              <div>
                <label className="label">Kategori</label>
                <select {...f('category')} className="input">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Birim</label>
                <select {...f('unit')} className="input">
                  {UNITS.map((u) => <option key={u}>{u}</option>)}
                </select>
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
