import React, { useEffect, useState } from 'react';
import { adminService } from '../services/api';
import { Plus, Pencil, Trash2, Search, X, Check, Loader2, Shield, User } from 'lucide-react';

const emptyForm = { name: '', email: '', password: '', role: 'user', isActive: true };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    adminService.getUsers().then((r) => { setUsers(r.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(emptyForm); setEditId(null); setError(''); setModal(true); };
  const openEdit = (u) => { setForm({ name: u.name, email: u.email, password: '', role: u.role, isActive: u.isActive }); setEditId(u.id); setError(''); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const data = { ...form };
      if (!data.password) delete data.password;
      if (editId) {
        const res = await adminService.updateUser(editId, data);
        setUsers((prev) => prev.map((u) => u.id === editId ? res.data : u));
      } else {
        if (!data.password) { setError('Yeni kullanıcı için şifre zorunlu'); setSaving(false); return; }
        const res = await adminService.createUser(data);
        setUsers((prev) => [res.data, ...prev]);
      }
      setModal(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Kaydetme hatası');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
    setDeleting(id);
    try {
      await adminService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Silme hatası');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const f = (field) => ({ value: form[field], onChange: (e) => setForm({ ...form, [field]: e.target.value }) });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kullanıcılar</h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} kullanıcı</p>
        </div>
        <button onClick={openNew} className="btn-primary"><Plus size={16} /> Yeni Kullanıcı</button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-9" placeholder="Ad veya e-posta ara..." />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Kullanıcı</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Rol</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Durum</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Kayıt Tarihi</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-sm flex-shrink-0">
                        {u.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-gray-400 text-xs">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`badge ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'} flex items-center gap-1 w-fit`}>
                      {u.role === 'admin' ? <Shield size={10} /> : <User size={10} />}
                      {u.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`badge ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {u.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{new Date(u.createdAt).toLocaleDateString('tr-TR')}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"><Pencil size={15} /></button>
                      <button onClick={() => handleDelete(u.id)} disabled={deleting === u.id} className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600">
                        {deleting === u.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">Kullanıcı bulunamadı</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{editId ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}</h2>
              <button onClick={() => setModal(false)} className="p-1 rounded hover:bg-gray-100"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>}
              <div>
                <label className="label">Ad Soyad *</label>
                <input {...f('name')} className="input" required />
              </div>
              <div>
                <label className="label">E-posta *</label>
                <input type="email" {...f('email')} className="input" required />
              </div>
              <div>
                <label className="label">{editId ? 'Yeni Şifre (boş bırakılırsa değişmez)' : 'Şifre *'}</label>
                <input type="password" {...f('password')} className="input" placeholder={editId ? 'Değiştirmek için doldurun' : '••••••••'} />
              </div>
              <div>
                <label className="label">Rol</label>
                <select {...f('role')} className="input">
                  <option value="user">Kullanıcı</option>
                  <option value="admin">Admin</option>
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
