import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import Loader from '../components/Loader';

const CATEGORY_ICONS = { DOWNLOAD: '📥', MOVIE: '🎬', AI: '🤖', UTILITY: '🛠️' };
const CATEGORY_COLORS = {
  DOWNLOAD: 'from-sky-500/25 to-sky-300/10 text-sky-300',
  MOVIE: 'from-fuchsia-500/25 to-fuchsia-300/10 text-fuchsia-300',
  AI: 'from-violet-500/25 to-violet-300/10 text-violet-300',
  UTILITY: 'from-emerald-500/25 to-emerald-300/10 text-emerald-300',
};

export default function ApiMarketplace() {
  const [endpoints, setEndpoints] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [query, setQuery] = useState('');

  useEffect(() => {
    api.get('/api/marketplace').then((res) => setEndpoints(res.data.endpoints)).catch(() => setEndpoints([]));
  }, []);

  if (!endpoints) return <Loader label="Loading marketplace..." />;

  const filtered = endpoints.filter((e) =>
    (filter === 'ALL' || e.category === filter) &&
    (e.name.toLowerCase().includes(query.toLowerCase()) || e.key.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="grid-bg mx-auto max-w-7xl px-4 py-10">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">API <span className="gradient-text">Marketplace</span></h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-400">Browse all available APIs. Every request costs coins based on the endpoint pricing.</p>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {['ALL', 'DOWNLOAD', 'MOVIE', 'AI', 'UTILITY'].map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
              filter === c ? 'bg-gradient-to-r from-neon to-electric text-white shadow-neon' : 'border border-white/10 text-slate-400 hover:border-glow/40 hover:text-white'
            }`}
          >
            {c === 'ALL' ? '🌐 All' : `${CATEGORY_ICONS[c]} ${c}`}
          </button>
        ))}
        <input
          className="input !w-auto min-w-[220px] !py-2 text-sm"
          placeholder="🔍 Search APIs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((e, i) => (
          <div key={e.key} className="glass group flex flex-col p-6 transition-all duration-300 hover:-translate-y-2 hover:border-glow/40 hover:shadow-neon animate-slideUp" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-start justify-between">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl ${CATEGORY_COLORS[e.category]}`}>
                {CATEGORY_ICONS[e.category]}
              </div>
              <span className="rounded-full bg-glow/15 px-3 py-1 text-xs font-semibold text-glow">{e.coinCost} 🪙 / req</span>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white">{e.name}</h3>
            <p className="mt-2 flex-1 text-sm leading-6 text-slate-400">{e.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <code className="rounded bg-black/30 px-2 py-1 text-xs text-electric">{e.method} {e.path}</code>
              <Link to="/playground" className="text-sm font-semibold text-glow opacity-0 transition-opacity group-hover:opacity-100">
                Try it →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="glass mt-10 p-10 text-center text-slate-400">No APIs match your search.</div>
      )}
    </div>
  );
}
