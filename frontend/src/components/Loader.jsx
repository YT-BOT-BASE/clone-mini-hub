import React from 'react';

export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-glow border-r-electric animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-glow border-l-electric animate-spin" style={{ animationDuration: '1.4s' }} />
        <div className="absolute inset-5 rounded-full bg-neon/40 animate-pulseGlow" />
      </div>
      <p className="text-sm text-slate-400 tracking-wider">{label}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass p-6 space-y-3">
      <div className="h-4 w-2/3 rounded bg-white/10 animate-pulseGlow" />
      <div className="h-3 w-1/2 rounded bg-white/5 animate-pulseGlow" />
      <div className="h-3 w-5/6 rounded bg-white/5 animate-pulseGlow" />
    </div>
  );
}
