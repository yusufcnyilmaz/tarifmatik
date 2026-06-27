import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/api';
import { Users, UtensilsCrossed, ShoppingBasket, Tag, TrendingUp, Star, Clock, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24'];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStats().then((r) => { setStats(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
    </div>
  );

  const statCards = [
    { label: 'Kullanıcılar', value: stats?.users || 0, icon: Users, color: 'bg-blue-500', link: '/users' },
    { label: 'Tarifler', value: stats?.recipes || 0, icon: UtensilsCrossed, color: 'bg-primary-500', link: '/recipes' },
    { label: 'Malzemeler', value: stats?.ingredients || 0, icon: ShoppingBasket, color: 'bg-green-500', link: '/ingredients' },
    { label: 'Kategoriler', value: stats?.categories || 0, icon: Tag, color: 'bg-purple-500', link: '/categories' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Genel istatistikler ve özet</p>
        </div>
        <Link to="/recipes/new" className="btn-primary">
          <Plus size={16} /> Yeni Tarif
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, link }) => (
          <Link key={label} to={link} className="card hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
                <Icon size={18} className="text-white" />
              </div>
              <TrendingUp size={14} className="text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Recent Users */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-primary-500" />
              <h2 className="font-semibold text-gray-900">Son Kayıtlar</h2>
            </div>
            <Link to="/users" className="text-primary-500 text-sm hover:underline">Tümü</Link>
          </div>
          <div className="space-y-3">
            {(stats?.recentUsers || []).map((u) => (
              <div key={u.id} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-sm flex-shrink-0">
                  {u.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{u.name}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock size={12} />
                  {new Date(u.createdAt).toLocaleDateString('tr-TR')}
                </div>
              </div>
            ))}
            {(!stats?.recentUsers || stats.recentUsers.length === 0) && (
              <p className="text-sm text-gray-400">Henüz kullanıcı yok</p>
            )}
          </div>
        </div>
      </div>

      {/* Popular Recipes List */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UtensilsCrossed size={18} className="text-primary-500" />
            <h2 className="font-semibold text-gray-900">En Popüler Tarifler</h2>
          </div>
          <Link to="/recipes" className="text-primary-500 text-sm hover:underline">Tümü</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-gray-500 font-medium">Tarif</th>
                <th className="text-left py-2 text-gray-500 font-medium">Kategori</th>
                <th className="text-left py-2 text-gray-500 font-medium">Zorluk</th>
                <th className="text-right py-2 text-gray-500 font-medium">Oluşturma</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.popularRecipes || []).map((r) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2.5 font-medium">{r.title}</td>
                  <td className="py-2.5 text-gray-500">{r.category?.name}</td>
                  <td className="py-2.5">
                    <span className={`badge ${r.difficulty === 'Kolay' ? 'bg-green-100 text-green-700' : r.difficulty === 'Orta' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {r.difficulty}
                    </span>
                  </td>
                  <td className="py-2.5 text-right text-gray-500">{new Date(r.createdAt).toLocaleDateString('tr-TR')}</td>
                </tr>
              ))}
              {(!stats?.popularRecipes || stats.popularRecipes.length === 0) && (
                <tr><td colSpan={4} className="py-4 text-center text-gray-400">Henüz tarif yok</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
