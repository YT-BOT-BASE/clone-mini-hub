import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-night/70">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-neon to-electric shadow-neon font-display font-black text-night">CM</div>
          <div>
            <p className="font-display text-xl font-bold tracking-widest text-white">CLONE MINI HUB</p>
            <p className="mt-1 text-sm text-slate-400">Professional API Platform • V1</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
            <a href="/docs" className="hover:text-glow transition-colors">API Docs</a>
            <a href="/status" className="hover:text-glow transition-colors">System Status</a>
            <a href="/marketplace" className="hover:text-glow transition-colors">Marketplace</a>
          </div>
          <div className="mt-4 space-y-1">
            <p className="text-sm font-semibold text-glow">POWERED BY CLONE SHANUWA 🇱🇰</p>
            <p className="text-xs text-slate-500">© {new Date().getFullYear()} CLONE MINI HUB. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
