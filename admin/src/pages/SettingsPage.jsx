import React, { useEffect, useState } from 'react';
import { adminService } from '../services/api';
import { Save, Loader2, Settings, Info } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({ appName: 'Tarifmatik', maxPantryItems: '50', maintenanceMode: 'false' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    adminService.getSettings()
      .then((r) => { setSettings(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      await adminService.updateSettings(settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Kaydetme hatası');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ayarlar</h1>
        <p className="text-gray-500 text-sm mt-1">Uygulama genel ayarları</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <Info size={16} /> Ayarlar başarıyla kaydedildi
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="card space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Settings size={18} className="text-primary-500" />
            <h2 className="font-semibold text-gray-900">Genel Ayarlar</h2>
          </div>

          <div>
            <label className="label">Uygulama Adı</label>
            <input
              value={settings.appName || ''}
              onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
              className="input"
              placeholder="Tarifmatik"
            />
            <p className="text-xs text-gray-400 mt-1">Mobil uygulamada görünen uygulama adı</p>
          </div>

          <div>
            <label className="label">Maksimum Dolap Malzemesi</label>
            <input
              type="number"
              value={settings.maxPantryItems || '50'}
              onChange={(e) => setSettings({ ...settings, maxPantryItems: e.target.value })}
              className="input"
              min={1}
              max={200}
            />
            <p className="text-xs text-gray-400 mt-1">Bir kullanıcının dolabına ekleyebileceği maksimum malzeme sayısı</p>
          </div>

          <div>
            <label className="label">Bakım Modu</label>
            <div className="flex items-center gap-3 mt-1">
              <button
                type="button"
                onClick={() => setSettings({ ...settings, maintenanceMode: settings.maintenanceMode === 'true' ? 'false' : 'true' })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.maintenanceMode === 'true' ? 'bg-primary-500' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.maintenanceMode === 'true' ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className="text-sm text-gray-600">
                {settings.maintenanceMode === 'true' ? 'Bakım modu aktif' : 'Bakım modu pasif'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Aktif edildiğinde kullanıcılar uygulamaya erişemez</p>
          </div>
        </div>

        <div className="card space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Info size={18} className="text-primary-500" />
            <h2 className="font-semibold text-gray-900">Uygulama Bilgileri</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">Versiyon</p>
              <p className="font-semibold">1.0.0</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">Platform</p>
              <p className="font-semibold">React Native (Expo)</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">Backend</p>
              <p className="font-semibold">Node.js + Prisma</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">Veritabanı</p>
              <p className="font-semibold">SQLite</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
}
