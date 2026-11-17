import React, { useEffect, useState, useCallback } from 'react';
import Loader from '../components/Loader';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import api, { setToken } from '../lib/api';

const TABS = [
  { id: 'overview', label: '📊 Overview' },
  { id: 'users', label: '👥 Users' },
  { id: 'endpoints', label: '🔌 API Pricing' },
  { id: 'settings', label: '⚙️ Settings' },
  { id: 'announcements', label: '📢 Announcements' },
  { id: 'logs', label: '📜 Logs' },
];

export default function Admin() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('overview');
  const [adminKey, setAdminKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  const submitKey = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.post('/api/auth/admin-key', { key: adminKey });
      setToken(res.data.accessToken);
      await refreshUser();
      setUnlocked(true);
      setAdminKey('');
      toast.success('Access granted');
    } catch (err) {
      toast.error(err.message || 'Invalid access key');
    } finally {
      setBusy(false);
    }
  };

  if (!isAdmin && !unlocked) {
    return (
      <div className="grid-bg flex min-h-[80vh] items-center justify-center px-4">
        <form onSubmit={submitKey} className="glass glow-ring w-full max-w-sm animate-slideUp p-8">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-neon to-electric shadow-neon text-2xl">🔐</div>
            <h1 className="mt-4 font-display text-xl font-bold text-white">Secure Access</h1>
            <p className="mt-1 text-sm text-slate-400">Enter the access key to continue</p>
          </div>
          <div className="mt-6">
            <input
              type="password"
              required
              className="input text-center"
              placeholder="Access key"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
            />
          </div>
          <button type="submit" disabled={busy} className="btn-primary mt-4 w-full disabled:opacity-60">
            {busy ? 'Checking...' : 'Unlock'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="glass glow-ring mb-6 flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">🛡️ Admin Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">Full platform control — POWERED BY CLONE SHANUWA 🇱🇰</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                tab === t.id ? 'bg-gradient-to-r from-neon to-electric text-white shadow-neon' : 'border border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'overview' && <Overview />}
      {tab === 'users' && <Users />}
      {tab === 'endpoints' && <Endpoints />}
      {tab === 'settings' && <Settings />}
      {tab === 'announcements' && <Announcements />}
      {tab === 'logs' && <Logs />}
    </div>
  );
}

function Overview() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get('/api/admin/dashboard').then((res) => setData(res.data)).catch(() => {}); }, []);
  if (!data) return <Loader label="Loading admin stats..." />;
  const s = data.stats;
  const cards = [
    { icon: '👥', label: 'Total Users', value: s.totalUsers },
    { icon: '✅', label: 'Active Users', value: s.activeUsers },
    { icon: '📡', label: 'Total API Requests', value: s.totalRequests },
    { icon: '✔️', label: 'Successful', value: s.successRequests },
    { icon: '❌', label: 'Failed', value: s.failedRequests },
    { icon: '⏱️', label: 'Server Uptime', value: `${Math.floor(s.uptimeSeconds / 60)} min` },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="glass p-5">
            <p className="text-2xl">{c.icon}</p>
            <p className="mt-2 text-2xl font-bold text-white">{c.value}</p>
            <p className="text-xs uppercase tracking-wider text-slate-400">{c.label}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass p-6">
          <h3 className="font-semibold text-white">Recent Users</h3>
          <div className="mt-4 space-y-3">
            {data.recentUsers.map((u) => (
              <div key={u._id} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-white">{u.name}</p>
                  <p className="text-xs text-slate-400">{u.email}</p>
                </div>
                <span className="text-xs text-glow">{u.coins} 🪙</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass p-6">
          <h3 className="font-semibold text-white">Recent API Requests</h3>
          <div className="mt-4 space-y-3">
            {data.recentRequests.map((r) => (
              <div key={r._id} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                <div>
                  <p className="text-sm text-electric">{r.endpoint}</p>
                  <p className="text-xs text-slate-400">{r.user?.email || 'anonymous'}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${r.success ? 'bg-emerald-400/15 text-emerald-300' : 'bg-rose-400/15 text-rose-300'}`}>
                  {r.statusCode}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Users() {
  const toast = useToast();
  const [users, setUsers] = useState(null);
  const [search, setSearch] = useState('');
  const [activity, setActivity] = useState(null);

  const load = useCallback(() => {
    api.get(`/api/admin/users?search=${encodeURIComponent(search)}`).then((res) => setUsers(res.data.data)).catch(() => {});
  }, [search]);

  useEffect(() => { const t = setTimeout(load, 350); return () => clearTimeout(t); }, [load]);

  const toggleSuspend = async (id) => {
    try {
      const res = await api.patch(`/api/admin/users/${id}/suspend`);
      toast.success(res.data.user.isSuspended ? 'User suspended' : 'User activated');
      load();
    } catch (e) { toast.error(e.message); }
  };

  const adjustCoins = async (id) => {
    const amount = prompt('Enter coin amount (negative to deduct):');
    if (amount === null) return;
    try {
      await api.patch(`/api/admin/users/${id}/coins`, { amount: Number(amount), description: 'Admin adjustment' });
      toast.success('Coins adjusted');
      load();
    } catch (e) { toast.error(e.message); }
  };

  const showActivity = async (id) => {
    try {
      const res = await api.get(`/api/admin/users/${id}/activity`);
      setActivity(res.data.data);
    } catch (e) { toast.error(e.message); }
  };

  return (
    <div className="space-y-4">
      <input className="input max-w-md" placeholder="🔍 Search users by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
      {!users ? <Loader label="Loading users..." /> : (
        <div className="glass overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">User</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Coins</th>
                <th className="px-6 py-4">Status</th><th className="px-6 py-4">Joined</th><th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="table-row">
                  <td className="px-6 py-4">
                    <p className="font-medium text-white">{u.name}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs ${u.role === 'ADMIN' ? 'bg-glow/20 text-glow' : 'bg-electric/15 text-electric'}`}>{u.role}</span>
                  </td>
                  <td className="px-6 py-4 text-glow">{u.coins} 🪙</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs ${u.isSuspended ? 'bg-rose-400/15 text-rose-300' : 'bg-emerald-400/15 text-emerald-300'}`}>
                      {u.isSuspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => showActivity(u._id)} className="rounded-lg border border-electric/30 px-3 py-1.5 text-xs text-electric hover:bg-electric/10">Activity</button>
                      <button onClick={() => adjustCoins(u._id)} className="rounded-lg border border-glow/30 px-3 py-1.5 text-xs text-glow hover:bg-glow/10">Coins</button>
                      <button onClick={() => toggleSuspend(u._id)} className={`rounded-lg border px-3 py-1.5 text-xs ${u.isSuspended ? 'border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/10' : 'border-rose-400/30 text-rose-300 hover:bg-rose-400/10'}`}>
                        {u.isSuspended ? 'Activate' : 'Suspend'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activity && (
        <div className="glass p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">🔍 Activity: {activity.user.name}</h3>
            <button onClick={() => setActivity(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
          <p className="mt-1 text-sm text-slate-400">Total API requests: {activity.totalRequests} • API keys: {activity.apiKeys.length}</p>
          <div className="mt-4 max-h-80 space-y-2 overflow-y-auto">
            {activity.recentRequests.map((r) => (
              <div key={r._id} className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-2.5 text-sm">
                <code className="text-electric">{r.endpoint}</code>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleString()}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${r.success ? 'text-emerald-300' : 'text-rose-300'}`}>{r.statusCode}</span>
                </div>
              </div>
            ))}
            {activity.recentRequests.length === 0 && <p className="py-4 text-center text-sm text-slate-500">No API activity yet.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function Endpoints() {
  const toast = useToast();
  const [endpoints, setEndpoints] = useState(null);
  const load = () => api.get('/api/admin/endpoints').then((res) => setEndpoints(res.data.endpoints)).catch(() => {});
  useEffect(() => { load(); }, []);

  const update = async (id, patch) => {
    try {
      await api.patch(`/api/admin/endpoints/${id}`, patch);
      toast.success('Endpoint updated');
      load();
    } catch (e) { toast.error(e.message); }
  };

  if (!endpoints) return <Loader label="Loading endpoints..." />;
  return (
    <div className="glass overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-slate-400">
          <tr>
            <th className="px-6 py-4">Endpoint</th><th className="px-6 py-4">Category</th>
            <th className="px-6 py-4">Coin Cost</th><th className="px-6 py-4">Enabled</th>
          </tr>
        </thead>
        <tbody>
          {endpoints.map((e) => (
            <tr key={e._id} className="table-row">
              <td className="px-6 py-4">
                <p className="font-medium text-white">{e.name}</p>
                <code className="text-xs text-electric">{e.path}</code>
              </td>
              <td className="px-6 py-4 text-slate-300">{e.category}</td>
              <td className="px-6 py-4">
                <input
                  type="number" min="0" defaultValue={e.coinCost}
                  onBlur={(ev) => Number(ev.target.value) !== e.coinCost && update(e._id, { coinCost: Number(ev.target.value) })}
                  className="input !w-20 !py-1.5 text-center text-sm"
                />
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => update(e._id, { isEnabled: !e.isEnabled })}
                  className={`relative h-7 w-14 rounded-full transition-colors ${e.isEnabled ? 'bg-emerald-500/70' : 'bg-white/15'}`}
                >
                  <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${e.isEnabled ? 'left-8' : 'left-1'}`} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Settings() {
  const toast = useToast();
  const [settings, setSettings] = useState(null);
  useEffect(() => { api.get('/api/admin/settings').then((res) => setSettings(res.data)).catch(() => {}); }, []);

  const save = async () => {
    try {
      await api.patch('/api/admin/settings', settings);
      toast.success('Settings saved ✅');
    } catch (e) { toast.error(e.message); }
  };

  if (!settings) return <Loader label="Loading settings..." />;
  return (
    <div className="glass max-w-xl space-y-5 p-6">
      <h3 className="font-semibold text-white">Platform Settings</h3>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Starting Coins (new users)</label>
        <input type="number" className="input" value={settings.startingCoins} onChange={(e) => setSettings({ ...settings, startingCoins: Number(e.target.value) })} />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Daily Bonus Coins</label>
        <input type="number" className="input" value={settings.dailyBonus} onChange={(e) => setSettings({ ...settings, dailyBonus: Number(e.target.value) })} />
      </div>
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
        <div>
          <p className="font-medium text-white">Maintenance Mode</p>
          <p className="text-xs text-slate-400">Blocks public API calls when enabled</p>
        </div>
        <button
          onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
          className={`relative h-7 w-14 rounded-full transition-colors ${settings.maintenanceMode ? 'bg-amber-500/80' : 'bg-white/15'}`}
        >
          <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${settings.maintenanceMode ? 'left-8' : 'left-1'}`} />
        </button>
      </div>
      <button onClick={save} className="btn-primary">💾 Save Settings</button>
    </div>
  );
}

function Announcements() {
  const toast = useToast();
  const [list, setList] = useState(null);
  const [form, setForm] = useState({ title: '', message: '' });

  const load = () => api.get('/api/admin/announcements').then((res) => setList(res.data.announcements)).catch(() => {});
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/announcements', form);
      setForm({ title: '', message: '' });
      toast.success('Announcement published 📢');
      load();
    } catch (err) { toast.error(err.message); }
  };

  const remove = async (id) => {
    try { await api.del(`/api/admin/announcements/${id}`); toast.success('Deleted'); load(); }
    catch (e) { toast.error(e.message); }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={create} className="glass space-y-4 p-6">
        <h3 className="font-semibold text-white">New Announcement</h3>
        <input required className="input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea required className="input h-28" placeholder="Message..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        <button type="submit" className="btn-primary">📢 Publish</button>
      </form>
      <div className="glass p-6">
        <h3 className="font-semibold text-white">Published</h3>
        {!list ? <Loader /> : (
          <div className="mt-4 space-y-3">
            {list.length === 0 && <p className="text-sm text-slate-500">No announcements yet.</p>}
            {list.map((a) => (
              <div key={a._id} className="flex items-start justify-between gap-3 rounded-xl bg-white/5 p-4">
                <div>
                  <p className="font-semibold text-glow">{a.title}</p>
                  <p className="mt-1 text-sm text-slate-300">{a.message}</p>
                  <p className="mt-1 text-xs text-slate-500">{new Date(a.createdAt).toLocaleString()}</p>
                </div>
                <button onClick={() => remove(a._id)} className="text-rose-300 hover:text-rose-200">🗑️</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Logs() {
  const toast = useToast();
  const [logs, setLogs] = useState(null);
  const [audit, setAudit] = useState(null);

  useEffect(() => {
    api.get('/api/admin/error-logs').then((res) => setLogs(res.data.data)).catch(() => {});
    api.get('/api/admin/audit-logs').then((res) => setAudit(res.data.data)).catch(() => {});
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="glass overflow-hidden">
        <div className="border-b border-white/10 px-6 py-4">
          <h3 className="font-semibold text-white">⚠️ API Error Logs</h3>
        </div>
        {!logs ? <Loader /> : (
          <div className="max-h-[420px] overflow-y-auto p-4 space-y-2">
            {logs.length === 0 && <p className="py-6 text-center text-sm text-slate-500">No errors — everything is clean 🎉</p>}
            {logs.map((l) => (
              <div key={l._id} className="rounded-xl border border-rose-400/10 bg-rose-400/5 px-4 py-3">
                <div className="flex items-center justify-between">
                  <code className="text-xs text-rose-300">{l.endpoint}</code>
                  <span className="text-xs text-rose-300">{l.statusCode}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{l.errorMessage || 'Failed request'} • {l.user?.email || 'anonymous'}</p>
                <p className="mt-1 text-[10px] text-slate-500">{new Date(l.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="glass overflow-hidden">
        <div className="border-b border-white/10 px-6 py-4">
          <h3 className="font-semibold text-white">📜 Audit Logs</h3>
        </div>
        {!audit ? <Loader /> : (
          <div className="max-h-[420px] overflow-y-auto p-4 space-y-2">
            {audit.length === 0 && <p className="py-6 text-center text-sm text-slate-500">No admin actions recorded yet.</p>}
            {audit.map((a) => (
              <div key={a._id} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-glow">{a.action}</p>
                  <p className="text-[10px] text-slate-500">{new Date(a.createdAt).toLocaleString()}</p>
                </div>
                <p className="mt-1 text-xs text-slate-400">By {a.admin?.email || 'system'} • Target: {a.target || '—'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
