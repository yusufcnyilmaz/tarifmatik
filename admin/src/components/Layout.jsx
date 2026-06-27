import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, UtensilsCrossed, ShoppingBasket, Tag,
  Users, Settings, LogOut, Menu, X, ChefHat, Bell
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/recipes', icon: UtensilsCrossed, label: 'Tarifler' },
  { to: '/ingredients', icon: ShoppingBasket, label: 'Malzemeler' },
  { to: '/categories', icon: Tag, label: 'Kategoriler' },
  { to: '/users', icon: Users, label: 'Kullanıcılar' },
  { to: '/settings', icon: Settings, label: 'Ayarlar' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full bg-gray-900 text-white ${mobile ? 'w-64' : 'w-64'}`}>
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
        <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
          <ChefHat size={20} />
        </div>
        <div>
          <p className="font-bold text-lg leading-tight">Tarifmatik</p>
          <p className="text-xs text-gray-400">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            onClick={() => mobile && setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-sm font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          Çıkış Yap
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
              <Bell size={20} />
            </button>
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
