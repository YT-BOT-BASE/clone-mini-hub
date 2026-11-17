import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../lib/api';

const TYPE_META = {
  SIGNUP_BONUS: { icon: '🎉', color: 'text-emerald-300', label: 'Signup Bonus' },
  DAILY_BONUS: { icon: '🎁', color: 'text-emerald-300', label: 'Daily Bonus' },
  API_USAGE: { icon: '📡', color: 'text-rose-300', label: 'API Usage' },
  REFUND: { icon: '↩️', color: 'text-electric', label: 'Refund' },
  ADMIN_ADJUST: { icon: '🛡️', color: 'text-glow', label: 'Admin Adjustment' },
  PURCHASE: { icon: '💳', color: 'text-amber-300', label: 'Purchase' },
};

export default function Wallet() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [txs, setTxs] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [bonusBusy, setBonusBusy] = useState(false);

  const load = (p = 1) => {
    api.get(`/api/user/transactions?page=${p}&limit=15`).then((res) => {
      setTxs(res.data.data);
      setPages(res.data.pagination.pages || 1);
    }).catch((e) => toast.error(e.message));
  };

  useEffect(() => { load(page); }, [page]);

  const claimBonus = async () => {
    setBonusBusy(true);
    try {
      const res = await api.post('/api/user/daily-bonus');
      toast.success(`+${res.data.bonus} coins claimed! 🪙`);
      refreshUser();
      load(page);
    } catch (err) { toast.error(err.message); }
    finally { setBonusBusy(false); }
  };

  return (
    <Sidebar>
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold text-white">🪙 Coin Wallet</h1>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="glass glow-ring relative overflow-hidden p-6">
            <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-glow/25 blur-[60px]" />
            <p className="text-xs uppercase tracking-wider text-slate-400">Current Balance</p>
            <p className="mt-2 font-display text-4xl font-black gradient-text">{user?.coins ?? 0}</p>
            <p className="mt-1 text-sm text-slate-400">coins available</p>
          </div>
          <div className="glass flex flex-col justify-between p-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">Daily Bonus</p>
              <p className="mt-2 text-lg font-semibold text-white">Claim 50 free coins every day 🎁</p>
            </div>
            <button onClick={claimBonus} disabled={bonusBusy} className="btn-primary mt-4 disabled:opacity-60">
              {bonusBusy ? 'Claiming...' : 'Claim Now'}
            </button>
          </div>
        </div>

        <div className="glass overflow-hidden">
          <div className="border-b border-white/10 px-6 py-4">
            <h2 className="font-semibold text-white">Transaction History</h2>
          </div>
          {!txs ? <Loader label="Loading transactions..." /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Balance After</th>
                    <th className="px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {txs.length === 0 && <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No transactions yet.</td></tr>}
                  {txs.map((t) => {
                    const meta = TYPE_META[t.type] || { icon: '•', color: 'text-slate-300', label: t.type };
                    return (
                      <tr key={t._id} className="table-row">
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-2 ${meta.color}`}>{meta.icon} {meta.label}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-400">{t.description || t.apiEndpoint || '—'}</td>
                        <td className={`px-6 py-4 font-semibold ${t.amount >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                          {t.amount >= 0 ? `+${t.amount}` : t.amount}
                        </td>
                        <td className="px-6 py-4 text-slate-300">{t.balanceAfter}</td>
                        <td className="px-6 py-4 text-xs text-slate-500">{new Date(t.createdAt).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-3 border-t border-white/10 px-6 py-4">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn-ghost !py-1.5 !px-4 text-xs disabled:opacity-40">← Prev</button>
              <span className="text-sm text-slate-400">Page {page} of {pages}</span>
              <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="btn-ghost !py-1.5 !px-4 text-xs disabled:opacity-40">Next →</button>
            </div>
          )}
        </div>
      </div>
    </Sidebar>
  );
}
