import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useToast } from '../components/Toast';
import api from '../lib/api';

const PRESETS = [
  { label: '📥 Download Info', method: 'GET', path: '/api/download/info', param: 'url', paramValue: 'https://youtu.be/dQw4w9WgXcQ', useKey: true },
  { label: '🎬 Movie Search', method: 'GET', path: '/api/movie/search', param: 'q', paramValue: 'Inception', useKey: true },
  { label: '🎬 Trending', method: 'GET', path: '/api/movie/trending', param: '', paramValue: '', useKey: true },
  { label: '🤖 AI Chat', method: 'POST', path: '/api/ai/chat', param: 'messages', paramValue: '[{"role":"user","content":"Hello!"}]', useKey: true, body: true },
  { label: '🤖 AI Translate', method: 'POST', path: '/api/ai/translate', param: 'text', paramValue: 'Hello world', useKey: true, body: true },
  { label: '🛠️ QR Code', method: 'GET', path: '/api/utility/qr', param: 'text', paramValue: 'https://cloneminHub.lk', useKey: true },
  { label: '🛠️ Weather', method: 'GET', path: '/api/utility/weather', param: 'city', paramValue: 'Colombo', useKey: true },
  { label: '🛠️ Password Gen', method: 'GET', path: '/api/utility/password', param: 'length', paramValue: '16', useKey: true },
];

export default function ApiPlayground() {
  const toast = useToast();
  const [keys, setKeys] = useState([]);
  const [apiKey, setApiKey] = useState('');
  const [method, setMethod] = useState('GET');
  const [path, setPath] = useState('/api/utility/qr');
  const [paramName, setParamName] = useState('text');
  const [paramValue, setParamValue] = useState('CLONE MINI HUB');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/api/keys').then((res) => {
      setKeys(res.data.keys);
      if (res.data.keys.length) setApiKey((prev) => prev || 'SELECTED_KEY');
    }).catch(() => {});
  }, []);

  const applyPreset = (p) => {
    setMethod(p.method);
    setPath(p.path);
    setParamName(p.param);
    setParamValue(p.paramValue);
    if (p.body && p.param === 'messages') setBody(JSON.stringify({ messages: JSON.parse(p.paramValue) }, null, 2));
    else if (p.body && p.param === 'text') setBody(JSON.stringify({ text: p.paramValue, targetLang: 'si' }, null, 2));
    else setBody('');
  };

  const send = async () => {
    setBusy(true);
    setResponse(null);
    try {
      let res;
      const fullKey = apiKey === 'SELECTED_KEY' ? '' : apiKey;
      const headers = { 'X-API-Key': fullKey || undefined };
      if (method === 'GET') {
        const qs = paramName ? `?${encodeURIComponent(paramName)}=${encodeURIComponent(paramValue)}` : '';
        res = await api.raw(`${path}${qs}`, { headers });
      } else {
        let parsed = {};
        try { parsed = body ? JSON.parse(body) : {}; } catch { toast.error('Invalid JSON body'); setBusy(false); return; }
        res = await api.raw(path, { method: 'POST', body: parsed, headers });
      }
      const text = await res.text();
      let pretty = text;
      try { pretty = JSON.stringify(JSON.parse(text), null, 2); } catch {}
      setResponse({ status: res.status, ok: res.ok, body: pretty });
    } catch (err) {
      setResponse({ status: 0, ok: false, body: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sidebar>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">API Playground</h1>
          <p className="mt-1 text-sm text-slate-400">Test any endpoint live. Use a stored key or paste a key manually.</p>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button key={p.label} onClick={() => applyPreset(p)} className="rounded-full border border-white/10 px-4 py-2 text-xs text-slate-300 transition-all hover:border-glow/50 hover:bg-white/5 hover:text-white">
              {p.label}
            </button>
          ))}
        </div>

        <div className="glass space-y-4 p-6">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">API Key</label>
            {keys.length > 0 ? (
              <select className="input" value={apiKey} onChange={(e) => setApiKey(e.target.value)}>
                <option value="SELECTED_KEY">Use key: {keys[0].name} ({keys[0].prefix}…)</option>
                {keys.slice(1).map((k) => (
                  <option key={k._id} value={`KEY:${k._id}`}>Use key: {k.name} ({k.prefix}…)</option>
                ))}
                <option value="">Paste key manually…</option>
              </select>
            ) : null}
            {(apiKey === '' || !keys.length) && (
              <input className="input mt-2" placeholder="Paste your cmh_live_... key (or create one in API Keys page)" value={apiKey === 'SELECTED_KEY' ? '' : apiKey} onChange={(e) => setApiKey(e.target.value)} />
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <select className="input !w-32" value={method} onChange={(e) => setMethod(e.target.value)}>
              <option>GET</option><option>POST</option>
            </select>
            <input className="input flex-1" value={path} onChange={(e) => setPath(e.target.value)} placeholder="/api/..." />
          </div>

          <div className="flex flex-wrap gap-3">
            <input className="input !w-44" value={paramName} onChange={(e) => setParamName(e.target.value)} placeholder="param name" />
            <input className="input flex-1" value={paramValue} onChange={(e) => setParamValue(e.target.value)} placeholder="param value" />
          </div>

          {method === 'POST' && (
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">JSON Body</label>
              <textarea className="input h-32 font-mono text-xs" value={body} onChange={(e) => setBody(e.target.value)} placeholder='{"key": "value"}' />
            </div>
          )}

          <button onClick={send} disabled={busy} className="btn-primary w-full disabled:opacity-60">
            {busy ? '⏳ Sending request...' : '🚀 Send Request'}
          </button>
        </div>

        {response && (
          <div className="glass overflow-hidden">
            <div className={`flex items-center justify-between border-b border-white/10 px-6 py-3 ${response.ok ? 'bg-emerald-400/10' : 'bg-rose-400/10'}`}>
              <p className="text-sm font-semibold text-white">Response</p>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${response.ok ? 'bg-emerald-400/20 text-emerald-300' : 'bg-rose-400/20 text-rose-300'}`}>
                {response.status || 'ERROR'}
              </span>
            </div>
            <pre className="max-h-[420px] overflow-auto p-6 text-xs leading-6 text-electric">{response.body}</pre>
          </div>
        )}
      </div>
    </Sidebar>
  );
}
