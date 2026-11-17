import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="grid-bg flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-7xl font-black gradient-text">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-white">Page Not Found</h1>
      <p className="mt-2 text-slate-400">The page you are looking for does not exist or has been moved.</p>
      <Link to="/" className="btn-primary mt-8">← Back to Home</Link>
    </div>
  );
}
