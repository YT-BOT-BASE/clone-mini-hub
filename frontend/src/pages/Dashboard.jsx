import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../lib/api';

function StatCard({ icon, label, value, accent = 'from-neon/25 to-electric/10' }) {
  return (
    <div className="glass p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-neon">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-xl`}>{icon}</div>
      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
      <p className="text-xs uppercase tracking-wider text-slate-400">{label}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [bonusBusy, setBonusBusy] = useState(false);

  useEffect(() => {
    api.get('/api/user/stats').then((res) => setStats(res.data)).catch(() => setStats({}));
    api.get('/api/announcements').then((res) => setAnnouncements(res.data.announcements)).catch(() => {});
  }, []);

  const claimBonus = async () => {
    setBonusBusy(true);
    try {
      const res = await api.post('/api/user/daily-bonus');
      toast.success(`Daily bonus claimed! +${res.data.bonus} coins 🪙`);
      refreshUser();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBonusBusy(false);
    }
  };

  return (
    <Sidebar>
      <div className="space-y-6">
        {/* Welcome */}
        <div className="glass glow-ring relative overflow-hidden p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-neon/25 blur-[70px]" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
                Hello, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
              </h1>
              <p className="mt-2 text-slate-400">Welcome to your CLONE MINI HUB dashboard.</p>
            </div>
            <button onClick={claimBonus} disabled={bonusBusy} className="btn-primary disabled:opacity-60">
              🎁 {bonusBusy ? 'Claiming...' : 'Claim Daily Bonus'}
            </button>
          </div>
        </div>

        {/* Stats */}
        {!stats ? (
          <Loader label="Loading statistics..." />
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon="🪙" label="Coin Balance" value={user?.coins ?? 0} />
            <StatCard icon="📡" label="Total API Requests" value={stats.totalRequests ?? 0} />
            <StatCard icon="✅" label="Successful" value={stats.successRequests ?? 0} accent="from-emerald-500/25 to-emerald-300/10" />
            <StatCard icon="❌" label="Failed" value={stats.failedRequests ?? 0} accent="from-rose-500/25 to-rose-300/10" />
          </div>
        )}

        {/* Quick actions */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Link to="/api-keys" className="glass p-5 transition-all hover:-translate-y-1 hover:border-glow/40">
            <p className="text-2xl">🔑</p>
            <p className="mt-2 font-semibold text-white">Manage API Keys</p>
            <p className="text-xs text-slate-400">Create, revoke or regenerate keys</p>
          </Link>
          <Link to="/playground" className="glass p-5 transition-all hover:-translate-y-1 hover:border-glow/40">
            <p className="text-2xl">🧪</p>
            <p className="mt-2 font-semibold text-white">API Playground</p>
            <p className="text-xs text-slate-400">Test endpoints live from the browser</p>
          </Link>
          <Link to="/wallet" className="glass p-5 transition-all hover:-translate-y-1 hover:border-glow/40">
            <p className="text-2xl">🪙</p>
            <p className="mt-2 font-semibold text-white">Coin Wallet</p>
            <p className="text-xs text-slate-400">Transactions & spending history</p>
          </Link>
        </div>

        {/* Announcements */}
        <div className="glass p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            📢 Announcements
          </h2>
          {announcements.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">No announcements yet. Stay tuned!</p>
          ) : (
            <div className="mt-4 space-y-3">
              {announcements.map((a) => (
                <div key={a._id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="font-semibold text-glow">{a.title}</p>
                  <p className="mt-1 text-sm text-slate-300">{a.message}</p>
                  <p className="mt-2 text-xs text-slate-500">{new Date(a.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Sidebar>
  );
}
