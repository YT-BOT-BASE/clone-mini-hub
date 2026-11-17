import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

const FEATURES = [
  { icon: '🎬', title: 'Download API', desc: 'YouTube, TikTok, Facebook, Instagram, Pinterest, Twitter/X, MediaFire & Google Drive media info with quality options.' },
  { icon: '🍿', title: 'Movie API', desc: 'TMDB powered search, posters, trailers, cast, ratings, episodes and Sinhala subtitle metadata links.' },
  { icon: '🤖', title: 'AI API', desc: 'Chat, text generation, translation, summarization, image generation, TTS & STT via real providers.' },
  { icon: '🛠️', title: 'Utility API', desc: 'QR codes, URL shortener, metadata, image tools, Base64, JSON formatter, password generator & weather.' },
  { icon: '🪙', title: 'Coin Wallet', desc: '50 free coins on signup, daily bonus 50, transparent transaction history and refunds on failures.' },
  { icon: '🔐', title: 'Secure Auth', desc: 'JWT + refresh sessions, Google OAuth, bcrypt hashing, hashed API keys and rate limiting.' },
];

const STATS = [
  { value: '22+', label: 'API Endpoints' },
  { value: '99.9%', label: 'Uptime Target' },
  { value: '8', label: 'Download Sources' },
  { value: '100%', label: 'Mobile Ready' },
];

export default function Landing() {
  const [endpoints, setEndpoints] = useState([]);

  useEffect(() => {
    api.get('/api/marketplace').then((res) => setEndpoints(res.data.endpoints.slice(0, 6))).catch(() => {});
  }, []);

  return (
    <div className="grid-bg">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[720px] -translate-x-1/2 rounded-full bg-neon/25 blur-[140px]" />
        <div className="pointer-events-none absolute top-40 right-10 h-64 w-64 rounded-full bg-electric/20 blur-[110px] animate-float" />

        <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 text-center sm:pt-24">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-glow/30 bg-glow/10 px-4 py-2 text-xs text-glow animate-fadeIn">
            <span className="h-2 w-2 rounded-full bg-electric animate-pulseGlow" />
            V1 • POWERED BY CLONE SHANUWA 🇱🇰
          </div>

          <h1 className="mt-6 font-display text-4xl font-black leading-tight text-white sm:text-6xl lg:text-7xl animate-slideUp">
            CLONE <span className="gradient-text">MINI HUB</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-400 sm:text-xl animate-slideUp">
            Next-generation API platform for developers — Download, Movies, AI & Utility APIs with
            secure keys, coin wallet and a beautiful dashboard.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-slideUp">
            <Link to="/register" className="btn-primary text-lg">
              🚀 Start Free — Get 50 Coins
            </Link>
            <Link to="/docs" className="btn-ghost text-lg">
              📚 API Documentation
            </Link>
          </div>

          {/* Floating terminal card */}
          <div className="mx-auto mt-16 max-w-2xl animate-fadeIn">
            <div className="glass glow-ring overflow-hidden text-left">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-rose-400/80" />
                <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
                <span className="ml-2 text-xs text-slate-500">terminal — clone-mini-hub</span>
              </div>
              <pre className="overflow-x-auto p-5 text-xs leading-7 text-slate-300 sm:text-sm">
                <code>
                  <span className="text-electric">$</span> curl https://cloneminHub.lk/api/download/info \<br />
                  {'    '}-H <span className="text-glow">"X-API-Key: cmh_live_xxxxxxxx"</span> \<br />
                  {'    '}-G --data-urlencode <span className="text-glow">"url=https://youtu.be/dQw4w9WgXcQ"</span><br />
                  <span className="text-slate-500">{'// → 200 OK'}</span><br />
                  {'{'}<br />
                  {'  '}"success": <span className="text-emerald-300">true</span>,<br />
                  {'  '}"data": {'{'} "title": "Video", "qualities": [360p, 720p, 1080p] {'}'}<br />
                  {'}'}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="glass grid grid-cols-2 gap-6 p-8 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-bold gradient-text">{s.value}</p>
              <p className="mt-1 text-sm text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">Everything in one <span className="gradient-text">Hub</span></h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">Professional-grade API systems, built with security and speed in mind.</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="glass group p-6 transition-all duration-300 hover:-translate-y-2 hover:border-glow/40 hover:shadow-neon animate-slideUp" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-neon/25 to-electric/25 text-2xl">{f.icon}</div>
              <h3 className="mt-4 text-lg font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LIVE ENDPOINTS */}
      {endpoints.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12">
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold text-white">Live API Marketplace</h2>
            <p className="mt-2 text-slate-400">A preview of enabled endpoints</p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {endpoints.map((e) => (
              <div key={e.key} className="glass flex items-center justify-between p-4">
                <div>
                  <p className="font-semibold text-white">{e.name}</p>
                  <p className="text-xs text-electric">{e.path}</p>
                </div>
                <span className="rounded-full bg-glow/15 px-3 py-1 text-xs text-glow">{e.coinCost} 🪙</span>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/marketplace" className="btn-ghost">View Full Marketplace →</Link>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="glass glow-ring relative overflow-hidden p-10 text-center">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-neon/15 via-transparent to-electric/15" />
          <h2 className="relative font-display text-2xl font-bold text-white sm:text-4xl">Ready to build something amazing?</h2>
          <p className="relative mt-4 text-slate-400">Create your free account and get 50 coins instantly.</p>
          <Link to="/register" className="btn-primary relative mt-8 inline-flex text-lg">
            Create Free Account 🚀
          </Link>
        </div>
      </section>
    </div>
  );
}
