import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import Loader from '../components/Loader';

export default function StatusPage() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(false);

  const load = () => {
    api.get('/api/status').then((res) => { setStatus(res.data); setError(false); }).catch(() => setError(true));
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="grid-bg mx-auto max-w-4xl px-4 py-12">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-white">System <span className="gradient-text">Status</span></h1>
        <p className="mt-2 text-slate-400">Live health of CLONE MINI HUB services</p>
      </div>

      {!status && !error && <Loader label="Checking system status..." />}
      {error && (
        <div className="glass mt-8 border border-rose-400/30 p-6 text-center">
          <p className="text-2xl">🔴</p>
          <p className="mt-2 font-semibold text-rose-300">Cannot reach the server</p>
          <p className="mt-1 text-sm text-slate-400">Please try again in a moment.</p>
          <button onClick={load} className="btn-ghost mt-4">Retry</button>
        </div>
      )}

      {status && (
        <>
          <div className={`glass glow-ring mt-8 flex items-center gap-4 p-6 ${status.status === 'operational' ? 'border-emerald-400/30' : 'border-amber-400/30'}`}>
            <div className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl ${status.status === 'operational' ? 'bg-emerald-400/20' : 'bg-amber-400/20'}`}>
              {status.status === 'operational' ? '🟢' : '🟡'}
            </div>
            <div>
              <p className="text-lg font-semibold text-white">
                {status.status === 'operational' ? 'All Systems Operational' : 'Partial Degradation'}
              </p>
              <p className="text-sm text-slate-400">
                Database: {status.database} • Uptime: {Math.floor(status.uptimeSeconds / 60)} min
              </p>
            </div>
          </div>

          <div className="glass mt-6 overflow-hidden">
            <div className="border-b border-white/10 px-6 py-4">
              <h2 className="font-semibold text-white">API Endpoints</h2>
            </div>
            <div className="divide-y divide-white/5">
              {status.endpoints.map((e) => (
                <div key={e.key} className="flex items-center justify-between px-6 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-white">{e.name}</p>
                    <code className="text-xs text-electric">{e.path}</code>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${e.isEnabled ? 'bg-emerald-400/15 text-emerald-300' : 'bg-rose-400/15 text-rose-300'}`}>
                    {e.isEnabled ? 'Operational' : 'Disabled'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center">
            <button onClick={load} className="btn-ghost">🔄 Refresh Status</button>
          </div>
        </>
      )}
    </div>
  );
}
