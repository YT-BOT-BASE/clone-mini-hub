import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-night/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-neon to-electric shadow-neon font-display font-black text-night">CM</div>
          <div>
            <p className="font-display text-lg font-bold tracking-wider text-white leading-tight">CLONE MINI HUB</p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-electric">API Platform</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/marketplace" className="text-slate-300 hover:text-glow transition-colors">Marketplace</Link>
          <Link to="/docs" className="text-slate-300 hover:text-glow transition-colors">Docs</Link>
          <Link to="/status" className="text-slate-300 hover:text-glow transition-colors">Status</Link>
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="btn-ghost !py-2 !px-4 text-sm">Dashboard</Link>
              <button onClick={handleLogout} className="text-sm text-rose-300 hover:text-rose-200 transition-colors">Logout</button>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-neon to-electric text-sm font-bold text-white">
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-slate-300 hover:text-glow transition-colors">Login</Link>
              <Link to="/register" className="btn-primary !py-2 !px-5 text-sm">Get Started</Link>
            </div>
          )}
        </nav>

        <button className="md:hidden text-2xl text-glow" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-white/10 bg-panel/95 px-4 py-4 space-y-3 animate-slideUp">
          <Link to="/marketplace" onClick={() => setOpen(false)} className="block py-2 text-slate-200">Marketplace</Link>
          <Link to="/docs" onClick={() => setOpen(false)} className="block py-2 text-slate-200">Docs</Link>
          <Link to="/status" onClick={() => setOpen(false)} className="block py-2 text-slate-200">Status</Link>
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setOpen(false)} className="block py-2 text-slate-200">Dashboard</Link>
              <button onClick={() => { setOpen(false); handleLogout(); }} className="block py-2 text-rose-300">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="block py-2 text-slate-200">Login</Link>
              <Link to="/register" onClick={() => setOpen(false)} className="btn-primary w-full">Get Started</Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
