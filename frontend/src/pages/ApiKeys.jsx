import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import { useToast } from '../components/Toast';
import api from '../lib/api';

export default function ApiKeys() {
  const toast = useToast();
  const [keys, setKeys] = useState(null);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [newKey, setNewKey] = useState(null);

  const load = () => api.get('/api/keys').then((res) => setKeys(res.data.keys)).catch((e) => toast.error(e.message));
  useEffect(() => { load(); }, []);

  const createKey = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.post('/api/keys', { name: name || 'Default Key' });
      setNewKey(res.data.fullKey);
      setName('');
      toast.success('API key created — copy it now, it is shown only once!');
      load();
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  const revoke = async (id) => {
    try { await api.patch(`/api/keys/${id}/revoke`); toast.success('Key revoked'); load(); }
    catch (err) { toast.error(err.message); }
  };

  const regenerate = async (id) => {
    try {
      const res = await api.patch(`/api/keys/${id}/regenerate`);
      setNewKey(res.data.fullKey);
      toast.success('Key regenerated — copy the new key now!');
      load();
    } catch (err) { toast.error(err.message); }
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <Sidebar>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">API Key Management</h1>
          <p className="mt-1 text-sm text-slate-400">Keys are stored hashed — the full key is shown only once at creation.</p>
        </div>

        {newKey && (
          <div className="glass glow-ring border border-emerald-400/30 p-5">
            <p className="text-sm font-semibold text-emerald-300">✅ Your new API key (copy it now):</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <code className="flex-1 overflow-x-auto rounded-xl bg-black/40 px-4 py-3 text-sm text-electric">{newKey}</code>
              <button onClick={() => copy(newKey)} className="btn-primary !py-2 text-sm">Copy</button>
              <button onClick={() => setNewKey(null)} className="btn-ghost !py-2 text-sm">Hide</button>
            </div>
          </div>
        )}

        <form onSubmit={createKey} className="glass flex flex-wrap items-end gap-4 p-5">
          <div className="min-w-[220px] flex-1">
            <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Key Name</label>
            <input className="input" placeholder="e.g. My App Production" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">
            ➕ {busy ? 'Creating...' : 'Create API Key'}
          </button>
        </form>

        {!keys ? <Loader label="Loading keys..." /> : (
          <div className="glass overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-5 py-4">Name</th>
                    <th className="px-5 py-4">Key Prefix</th>
                    <th className="px-5 py-4">Requests</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Created</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.length === 0 && (
                    <tr><td colSpan="6" className="px-5 py-8 text-center text-slate-500">No API keys yet. Create your first key above.</td></tr>
                  )}
                  {keys.map((k) => (
                    <tr key={k._id} className="table-row">
                      <td className="px-5 py-4 font-medium text-white">{k.name}</td>
                      <td className="px-5 py-4"><code className="rounded bg-white/5 px-2 py-1 text-electric">{k.prefix}…</code></td>
                      <td className="px-5 py-4 text-slate-300">{k.totalRequests}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${k.isActive ? 'bg-emerald-400/15 text-emerald-300' : 'bg-rose-400/15 text-rose-300'}`}>
                          {k.isActive ? 'Active' : 'Revoked'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-400">{new Date(k.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => regenerate(k._id)} className="rounded-lg border border-electric/30 px-3 py-1.5 text-xs text-electric hover:bg-electric/10">Regenerate</button>
                          {k.isActive && (
                            <button onClick={() => revoke(k._id)} className="rounded-lg border border-rose-400/30 px-3 py-1.5 text-xs text-rose-300 hover:bg-rose-400/10">Revoke</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  );
}
