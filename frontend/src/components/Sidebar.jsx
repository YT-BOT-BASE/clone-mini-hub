import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/api-keys', icon: '🔑', label: 'API Keys' },
  { to: '/playground', icon: '🧪', label: 'API Playground' },
  { to: '/wallet', icon: '🪙', label: 'Coin Wallet' },
  { to: '/marketplace', icon: '🛒', label: 'Marketplace' },
  { to: '/docs', icon: '📚', label: 'API Docs' },
  { to: '/status', icon: '🟢', label: 'API Status' },
  { to: '/profile', icon: '⚙️', label: 'Profile Settings' },
];

export default function Sidebar({ children }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
      isActive ? 'bg-gradient-to-r from-neon/30 to-electric/10 text-white border border-glow/30 shadow-neon' : 'text-slate-400 hover:bg-white/5 hover:text-white'
    }`;

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="glass sticky top-24 p-4">
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-neon to-electric font-bold text-white">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
              <p className="text-xs text-electric">{user?.role === 'ADMIN' ? '👑 Administrator' : 'Developer'}</p>
            </div>
          </div>
          <nav className="space-y-1">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={linkClass}>
                <span>{n.icon}</span> {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-6 rounded-xl border border-glow/20 bg-glow/10 p-4 text-center">
            <p className="text-xs text-slate-400">Coin Balance</p>
            <p className="mt-1 font-display text-2xl font-bold text-glow">{user?.coins ?? 0} 🪙</p>
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-neon to-electric text-xl text-white shadow-neon lg:hidden"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
      >
        {open ? '✕' : '☰'}
      </button>

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-night/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 overflow-y-auto bg-panel p-4 animate-slideUp">
            <div className="mb-6 flex items-center gap-3 p-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-neon to-electric font-bold text-white">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{user?.name}</p>
                <p className="text-xs text-electric">{user?.role === 'ADMIN' ? 'Administrator' : 'Developer'}</p>
              </div>
            </div>
            <nav className="space-y-1">
              {NAV.map((n) => (
                <NavLink key={n.to} to={n.to} className={linkClass} onClick={() => setOpen(false)}>
                  <span>{n.icon}</span> {n.label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
