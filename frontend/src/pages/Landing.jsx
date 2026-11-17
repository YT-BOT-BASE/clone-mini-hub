import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

const STEPS = [
  { num: '1', title: 'Create Free Account', desc: 'Register with your email in 10 seconds. You instantly get 50 free coins.', icon: '👤' },
  { num: '2', title: 'Get Your API Key', desc: 'Open the API Keys page and create a key. Copy it — that is your access.', icon: '🔑' },
  { num: '3', title: 'Call Any API', desc: 'Use the key in the X-API-Key header. Try it in the Playground — no coding needed.', icon: '🚀' },
];

const DOWNLOAD_PLATFORMS = [
  { key: 'youtube', name: 'YouTube', icon: '▶️', color: 'from-red-500/25 to-red-300/10' },
  { key: 'tiktok', name: 'TikTok', icon: '🎵', color: 'from-cyan-400/25 to-cyan-200/10' },
  { key: 'facebook', name: 'Facebook', icon: '👥', color: 'from-blue-500/25 to-blue-300/10' },
  { key: 'instagram', name: 'Instagram', icon: '📸', color: 'from-pink-500/25 to-pink-300/10' },
  { key: 'pinterest', name: 'Pinterest', icon: '📌', color: 'from-rose-500/25 to-rose-300/10' },
  { key: 'twitter', name: 'Twitter / X', icon: '🐦', color: 'from-slate-400/25 to-slate-200/10' },
  { key: 'mediafire', name: 'MediaFire', icon: '🔥', color: 'from-amber-500/25 to-amber-300/10' },
  { key: 'drive', name: 'Google Drive', icon: '☁️', color: 'from-emerald-500/25 to-emerald-300/10' },
];

const OTHER_APIS = [
  { icon: '🎬', title: 'Movie API', desc: 'Search movies & TV shows. Get posters, trailers, cast, ratings and Sinhala subtitle links.', points: ['TMDB powered', 'Trailers & Cast', 'Sinhala subtitle links'] },
  { icon: '🤖', title: 'AI API', desc: 'Chat, write text, translate, summarize, generate images and convert text to speech.', points: ['AI Chat & Writer', 'Translate & Summarize', 'Images & Voice'] },
  { icon: '🛠️', title: 'Tools API', desc: 'QR codes, link shortener, weather, passwords, image tools and more daily utilities.', points: ['QR & Short Links', 'Weather & Passwords', 'Image tools'] },
];

export default function Landing() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/api/status').then((res) => setStats(res.data)).catch(() => {});
  }, []);

  return (
    <div className="grid-bg">
      {/* HERO — simple and clear */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[720px] -translate-x-1/2 rounded-full bg-neon/25 blur-[140px]" />
        <div className="mx-auto max-w-4xl px-4 pb-16 pt-16 text-center sm:pt-24">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-neon to-electric shadow-neon font-display text-3xl font-black text-night animate-float">
            CM
          </div>
          <h1 className="mt-8 font-display text-4xl font-black leading-tight text-white sm:text-6xl">
            CLONE <span className="gradient-text">MINI HUB</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300 sm:text-xl">
            One simple API platform for developers.
            <br className="hidden sm:block" />
            Download videos, find movies, use AI tools — all with one API key.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link to="/register" className="btn-primary text-lg">
              🆓 Create Free Account
            </Link>
            <Link to="/docs" className="btn-ghost text-lg">
              📖 Read the Docs
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-400">
            Free 50 coins on signup • No credit card needed • POWERED BY CLONE SHANUWA 🇱🇰
          </p>
        </div>
      </section>

      {/* HOW IT WORKS — 3 simple steps */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="text-center font-display text-2xl font-bold text-white sm:text-3xl">
          How it works — <span className="gradient-text">3 easy steps</span>
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.num} className="glass relative p-6 text-center animate-slideUp" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-neon/25 to-electric/25 text-2xl">
                {s.icon}
              </div>
              <div className="absolute -top-3 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-r from-neon to-electric text-sm font-bold text-white shadow-neon">
                {s.num}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DOWNLOAD APIs — all platforms */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
            📥 Download APIs — <span className="gradient-text">All Platforms</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Get video info, quality options and download links. Every platform has its own simple endpoint.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {DOWNLOAD_PLATFORMS.map((p, i) => (
            <Link
              key={p.key}
              to="/docs"
              className={`glass group p-5 text-center transition-all duration-300 hover:-translate-y-2 hover:border-glow/40 hover:shadow-neon animate-slideUp`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl ${p.color}`}>
                {p.icon}
              </div>
              <p className="mt-3 font-semibold text-white">{p.name}</p>
              <code className="mt-2 block text-[11px] text-electric">/api/download/{p.key}</code>
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400">
            Or use the all-in-one endpoint: <code className="rounded bg-white/10 px-2 py-1 text-electric">/api/download/all</code> — it auto-detects the platform.
          </p>
        </div>
      </section>

      {/* OTHER APIs */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
            More APIs — <span className="gradient-text">one key, all access</span>
          </h2>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {OTHER_APIS.map((a, i) => (
            <div key={a.title} className="glass p-6 transition-all duration-300 hover:-translate-y-2 hover:border-glow/40 animate-slideUp" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-neon/25 to-electric/25 text-2xl">{a.icon}</div>
              <h3 className="mt-4 text-lg font-semibold text-white">{a.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{a.desc}</p>
              <ul className="mt-4 space-y-2">
                {a.points.map((pt) => (
                  <li key={pt} className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="text-emerald-400">✓</span> {pt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* WHY US — short and clean */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="glass grid grid-cols-2 gap-6 p-8 sm:grid-cols-4">
          {[
            { icon: '🪙', label: '50 free coins', sub: 'on signup' },
            { icon: '⚡', label: 'Fast & simple', sub: 'easy endpoints' },
            { icon: '🔒', label: 'Secure keys', sub: 'hashed storage' },
            { icon: '📱', label: 'Works everywhere', sub: 'mobile ready' },
          ].map((f) => (
            <div key={f.label} className="text-center">
              <p className="text-3xl">{f.icon}</p>
              <p className="mt-2 font-semibold text-white">{f.label}</p>
              <p className="text-xs text-slate-400">{f.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 pb-16">
        <div className="glass glow-ring relative overflow-hidden p-10 text-center">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-neon/15 via-transparent to-electric/15" />
          <h2 className="relative font-display text-2xl font-bold text-white sm:text-3xl">
            Ready? Create your free account now.
          </h2>
          <p className="relative mt-3 text-slate-400">
            It takes 10 seconds. You get 50 free coins instantly.
          </p>
          <div className="relative mt-7 flex flex-wrap justify-center gap-4">
            <Link to="/register" className="btn-primary text-lg">Get Started Free 🚀</Link>
            <Link to="/playground" className="btn-ghost text-lg">Try the Playground</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
