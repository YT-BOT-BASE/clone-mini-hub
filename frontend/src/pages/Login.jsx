import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export default function Login() {
  const { login, googleLogin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 🎉');
      navigate(location.state?.from || '/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid-bg flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="glass glow-ring w-full max-w-md animate-slideUp p-8">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-neon to-electric shadow-neon font-display text-xl font-black text-night">CM</div>
          <h1 className="mt-4 font-display text-2xl font-bold text-white">Welcome Back</h1>
          <p className="mt-1 text-sm text-slate-400">Login to your CLONE MINI HUB account</p>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Email</label>
            <input type="email" required className="input" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Password</label>
            <input type="password" required className="input" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="text-glow hover:underline">Forgot password?</Link>
          </div>
          <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
            {busy ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-slate-500">
          <div className="h-px flex-1 bg-white/10" /> OR <div className="h-px flex-1 bg-white/10" />
        </div>

        <button onClick={googleLogin} className="btn-ghost w-full">
          <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5.04c1.6 0 3.03.55 4.16 1.62l3.1-3.1C17.24 1.68 14.83.72 12 .72 7.57.72 3.73 3.3 1.72 7.12l3.63 2.82C6.27 7.08 8.91 5.04 12 5.04z"/><path fill="#4285F4" d="M23.28 12.27c0-.79-.07-1.55-.2-2.27H12v4.51h6.32c-.27 1.47-1.1 2.72-2.35 3.56v2.96h3.81c2.23-2.06 3.5-5.08 3.5-8.76z"/><path fill="#FBBC05" d="M5.35 14.27a6.99 6.99 0 0 1 0-4.54L1.72 6.91a11.98 11.98 0 0 0 0 10.18l3.63-2.82z"/><path fill="#34A853" d="M12 23.28c3.05 0 5.62-1 7.5-2.72l-3.81-2.96c-1 .68-2.28 1.08-3.69 1.08-3.09 0-5.73-2.04-6.65-4.96L1.72 17.09c2 3.82 5.85 6.19 10.28 6.19z"/></svg>
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-slate-400">
          No account yet? <Link to="/register" className="font-semibold text-glow hover:underline">Register free</Link>
        </p>
      </div>
    </div>
  );
}
