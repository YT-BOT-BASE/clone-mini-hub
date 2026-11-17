import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import Loader from '../components/Loader';

const DOCS = {
  DOWNLOAD: [
    { name: 'Download Media Info', method: 'GET', path: '/api/download/info', params: [{ name: 'url', type: 'string', required: true, desc: 'Media URL (YouTube, TikTok, Facebook, Instagram, Pinterest, Twitter/X, MediaFire, Google Drive)' }, { name: 'quality', type: 'string', required: false, desc: 'Preferred quality: 360 / 480 / 720 / 1080' }],
      example: `curl -G "https://your-domain/api/download/info" \\\n  -H "X-API-Key: cmh_live_xxxxxxxx" \\\n  --data-urlencode "url=https://youtu.be/xxxxxx"`,
      response: `{\n  "success": true,\n  "data": {\n    "source": "youtube",\n    "title": "Video Title",\n    "duration": "3:45",\n    "thumbnail": "https://...",\n    "qualities": [\n      { "quality": "720p", "url": "https://...", "size": "24 MB" }\n    ]\n  }\n}` },
  ],
  MOVIE: [
    { name: 'Movie Search', method: 'GET', path: '/api/movie/search', params: [{ name: 'q', type: 'string', required: true, desc: 'Search query' }, { name: 'page', type: 'number', required: false, desc: 'Page number' }],
      example: `curl -G "https://your-domain/api/movie/search" \\\n  -H "X-API-Key: cmh_live_xxxxxxxx" \\\n  --data-urlencode "q=Inception"`,
      response: `{\n  "success": true,\n  "data": { "results": [ { "id": 27205, "title": "Inception", "poster_path": "/..." } ] }\n}` },
    { name: 'Movie / TV Details', method: 'GET', path: '/api/movie/:type/:id', params: [{ name: 'type', type: 'string', required: true, desc: 'movie or tv' }, { name: 'id', type: 'number', required: true, desc: 'TMDB ID' }],
      example: `curl "https://your-domain/api/movie/movie/27205" -H "X-API-Key: cmh_live_xxxxxxxx"`,
      response: `{\n  "success": true,\n  "data": {\n    "title": "Inception",\n    "rating": 8.4,\n    "genres": [...],\n    "credits": { "cast": [...] },\n    "videos": { "results": [ { "type": "Trailer", "key": "youtube-key" } ] },\n    "sinhalaSubtitleLinks": [ { "name": "cinesubz", "url": "..." } ]\n  }\n}` },
  ],
  AI: [
    { name: 'AI Chat', method: 'POST', path: '/api/ai/chat', params: [{ name: 'messages', type: 'array', required: true, desc: '[{ role: "user", content: "Hello" }]' }],
      example: `curl -X POST "https://your-domain/api/ai/chat" \\\n  -H "X-API-Key: cmh_live_xxxxxxxx" -H "Content-Type: application/json" \\\n  -d '{"messages":[{"role":"user","content":"Hello!"}]}'`,
      response: `{\n  "success": true,\n  "data": { "reply": "Hi! How can I help?", "provider": "gemini" }\n}` },
    { name: 'AI Translate', method: 'POST', path: '/api/ai/translate', params: [{ name: 'text', type: 'string', required: true, desc: 'Text to translate' }, { name: 'targetLang', type: 'string', required: false, desc: 'Target language code (e.g. si, en)' }],
      example: `curl -X POST "https://your-domain/api/ai/translate" \\\n  -H "X-API-Key: cmh_live_xxxxxxxx" -H "Content-Type: application/json" \\\n  -d '{"text":"Hello","targetLang":"si"}'`,
      response: `{\n  "success": true,\n  "data": { "translated": "ආයුබෝවන්", "provider": "gemini" }\n}` },
  ],
  UTILITY: [
    { name: 'QR Code Generator', method: 'GET', path: '/api/utility/qr', params: [{ name: 'text', type: 'string', required: true, desc: 'Text or URL to encode' }],
      example: `curl -G "https://your-domain/api/utility/qr" -H "X-API-Key: cmh_live_xxxxxxxx" --data-urlencode "text=https://cloneminHub.lk"`,
      response: `{\n  "success": true,\n  "data": { "qrCode": "data:image/png;base64,iVBOR..." }\n}` },
    { name: 'Weather Info', method: 'GET', path: '/api/utility/weather', params: [{ name: 'city', type: 'string', required: true, desc: 'City name' }],
      example: `curl -G "https://your-domain/api/utility/weather" -H "X-API-Key: cmh_live_xxxxxxxx" --data-urlencode "city=Colombo"`,
      response: `{\n  "success": true,\n  "data": { "city": "Colombo", "temp": 30, "description": "scattered clouds" }\n}` },
  ],
};

const ERRORS = [
  { code: '401 API_KEY_REQUIRED / INVALID_API_KEY', desc: 'Missing or invalid X-API-Key header' },
  { code: '402 INSUFFICIENT_COINS', desc: 'Not enough coins — claim daily bonus or top up' },
  { code: '403 ACCOUNT_SUSPENDED', desc: 'Account suspended by admin' },
  { code: '429 RATE_LIMITED', desc: 'Too many requests — slow down' },
  { code: '503 SERVICE_UNAVAILABLE', desc: 'Provider key not configured on server (never returns fake data)' },
  { code: '503 API_DISABLED', desc: 'This endpoint is disabled by admin' },
  { code: '502 PROVIDER_ERROR', desc: 'Third-party provider failed — coins auto-refunded' },
];

export default function ApiDocs() {
  const [endpoints, setEndpoints] = useState([]);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    api.get('/api/marketplace').then((res) => setEndpoints(res.data.endpoints)).catch(() => {});
  }, []);

  return (
    <div className="grid-bg mx-auto max-w-5xl px-4 py-10">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">API <span className="gradient-text">Documentation</span></h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-400">
          Authenticate every request with the <code className="rounded bg-white/10 px-2 py-0.5 text-electric">X-API-Key</code> header.
          Full OpenAPI/Swagger spec is available at <code className="rounded bg-white/10 px-2 py-0.5 text-electric">/api/docs</code> on your server.
        </p>
      </div>

      {/* Pricing table */}
      <div className="glass mt-8 overflow-hidden">
        <div className="border-b border-white/10 px-6 py-4">
          <h2 className="font-semibold text-white">🪙 Endpoint Pricing</h2>
        </div>
        <div className="max-h-72 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-panel text-xs uppercase tracking-wider text-slate-400">
              <tr><th className="px-6 py-3">Endpoint</th><th className="px-6 py-3">Category</th><th className="px-6 py-3">Coins</th></tr>
            </thead>
            <tbody>
              {endpoints.map((e) => (
                <tr key={e.key} className="table-row">
                  <td className="px-6 py-3"><code className="text-electric">{e.path}</code></td>
                  <td className="px-6 py-3 text-slate-300">{e.category}</td>
                  <td className="px-6 py-3 text-glow">{e.coinCost}</td>
                </tr>
              ))}
              {endpoints.length === 0 && <tr><td colSpan="3" className="px-6 py-6 text-center text-slate-500"><Loader /></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed docs */}
      {Object.entries(DOCS).map(([category, items]) => (
        <div key={category} className="mt-10">
          <h2 className="font-display text-xl font-bold text-white">
            {category === 'DOWNLOAD' ? '📥 Download API' : category === 'MOVIE' ? '🎬 Movie API' : category === 'AI' ? '🤖 AI API' : '🛠️ Utility API'}
          </h2>
          <div className="mt-4 space-y-4">
            {items.map((doc) => {
              const isOpen = open === doc.name;
              return (
                <div key={doc.name} className="glass overflow-hidden">
                  <button className="flex w-full items-center justify-between px-6 py-4 text-left" onClick={() => setOpen(isOpen ? null : doc.name)}>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${doc.method === 'GET' ? 'bg-emerald-400/15 text-emerald-300' : 'bg-amber-400/15 text-amber-300'}`}>{doc.method}</span>
                      <code className="text-sm text-electric">{doc.path}</code>
                      <span className="text-sm text-slate-300">{doc.name}</span>
                    </div>
                    <span className={`text-glow transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  {isOpen && (
                    <div className="border-t border-white/10 px-6 py-5 space-y-5 animate-fadeIn">
                      <div>
                        <h4 className="text-xs uppercase tracking-wider text-slate-400">Parameters</h4>
                        <table className="mt-2 w-full text-sm">
                          <tbody>
                            {doc.params.map((p) => (
                              <tr key={p.name} className="table-row">
                                <td className="py-2 pr-4"><code className="text-glow">{p.name}</code></td>
                                <td className="py-2 pr-4 text-slate-400">{p.type}</td>
                                <td className="py-2 pr-4 text-xs text-electric">{p.required ? 'required' : 'optional'}</td>
                                <td className="py-2 text-slate-300">{p.desc}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div>
                        <h4 className="text-xs uppercase tracking-wider text-slate-400">Example Request</h4>
                        <pre className="mt-2 overflow-x-auto rounded-xl bg-black/50 p-4 text-xs text-emerald-300">{doc.example}</pre>
                      </div>
                      <div>
                        <h4 className="text-xs uppercase tracking-wider text-slate-400">Example Response</h4>
                        <pre className="mt-2 overflow-x-auto rounded-xl bg-black/50 p-4 text-xs text-electric">{doc.response}</pre>
                      </div>
                      <Link to="/playground" className="btn-primary inline-flex !py-2 text-sm">🧪 Try this API</Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Error codes */}
      <div className="glass mt-10 p-6">
        <h2 className="font-semibold text-white">⚠️ Error Codes</h2>
        <div className="mt-4 space-y-2">
          {ERRORS.map((e) => (
            <div key={e.code} className="flex flex-wrap items-center gap-3 rounded-xl bg-white/5 px-4 py-3">
              <code className="text-xs text-rose-300">{e.code}</code>
              <span className="text-sm text-slate-300">{e.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
