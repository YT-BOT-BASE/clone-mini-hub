# 🚀 CLONE MINI HUB — Professional Full-Stack API Platform

**POWERED BY CLONE SHANUWA 🇱🇰** | Version V1 | Sri Lanka

> Production-ready API platform: Download APIs, Movie APIs, AI APIs, Utility APIs with secure API keys, coin wallet, admin dashboard and full documentation.

---

## ✨ Features

- **Animated Landing Page** — Dark Black + Purple + Electric Blue futuristic UI, 100% mobile responsive
- **User System** — Email register/login, Google OAuth, email verification, forgot password, JWT + refresh sessions
- **API Key System** — Create / revoke / regenerate, hashed storage (full key shown only once), usage stats
- **Download API** — YouTube, TikTok, Facebook, Instagram, Pinterest, Twitter/X, MediaFire, Google Drive (real Cobalt integration, quality options, timeouts & retries, no server crashes)
- **Movie API** — TMDB integration: search, details, posters, trailers, cast, ratings, TV episodes, Sinhala subtitle metadata links (cinesubz / sinhalasub / Baiscope), legal streaming links
- **AI API** — Chat, text generation, translation, summarization, image gen, TTS, STT (real providers via env vars — **never fake data**; missing keys return clear `SERVICE_UNAVAILABLE`)
- **Utility API** — QR generator, URL shortener, metadata, image resize/convert, Base64, JSON formatter, password generator, weather
- **Coin Wallet** — 50 signup coins, 50 daily bonus, per-endpoint pricing, atomic deductions, auto-refund on failures
- **Admin Dashboard** — User management (per-user activity logs), API enable/disable, pricing, announcements, maintenance mode, error logs, audit logs, platform settings
- **Docs** — Swagger/OpenAPI at `/api/docs`, endpoint pricing, example requests/responses, error codes
- **Security** — bcrypt, JWT, HTTP-only cookies, Helmet, CORS, rate limiting, input validation, hashed API keys & tokens

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS + React Router |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Cache | Redis (optional) |
| Auth | JWT + Passport Google OAuth 2.0 |
| Deployment | Heroku / VPS / Docker |

## 📂 Project Structure

```
clone-mini-hub/
├── backend/
│   ├── src/
│   │   ├── config/        # env, db, redis, seed
│   │   ├── models/        # User, ApiKey, Session, Transaction, ApiRequest, ApiEndpoint...
│   │   ├── middleware/    # auth, apiKeyAuth, coinCharge, errorHandler, maintenance, validate
│   │   ├── routes/        # auth, user, apiKey, download, movie, ai, utility, admin, status
│   │   ├── controllers/   # request handlers
│   │   ├── services/      # download, movie, ai, utility, coin, email
│   │   ├── utils/         # hash, logger, pagination
│   │   ├── docs/          # swagger/openapi spec
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/             # 26 automated tests (Jest + Supertest + in-memory MongoDB)
│   └── .env.example
├── frontend/
│   └── src/
│       ├── components/    # Navbar, Sidebar, Toast, Loader, ProtectedRoute, Footer
│       ├── context/       # AuthContext
│       ├── lib/           # api client (auto token refresh)
│       └── pages/         # Landing, Login, Register, Dashboard, ApiKeys, Playground,
│                          # ApiMarketplace, ApiDocs, Wallet, Profile, Admin, StatusPage
├── scripts/
├── Dockerfile
├── Procfile
├── package.json
└── README.md
```

## ⚡ Quick Start (Development)

```bash
# 1. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 2. Configure environment
cp backend/.env.example backend/.env
# edit backend/.env → set MONGO_URI, JWT secrets, provider keys

# 3. Run backend (port 5000) - auto-seeds admin + API endpoints on first run
cd backend && npm run dev

# 4. Run frontend (port 5173) - proxies /api to backend
cd frontend && npm run dev
```

## 🔑 Environment Variables

See `backend/.env.example` for the full annotated list. Required: `MONGO_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`. Optional provider keys: `TMDB_API_KEY`, `GEMINI_API_KEY`/`OPENAI_API_KEY`, `OPENWEATHER_API_KEY`, `GOOGLE_CLIENT_ID/SECRET`, SMTP, `REDIS_URL`.

## 🧪 Tests

```bash
cd backend && npm test
# 26 tests: auth, API keys, coins, admin, utilities, error handling
```

## 🚀 Deployment

### Heroku
```bash
heroku create cloneminHub
heroku config:set MONGO_URI=... JWT_ACCESS_SECRET=... JWT_REFRESH_SECRET=...
git push heroku main
```
`Procfile` + `heroku-postbuild` automatically build the frontend and Express serves it.

### VPS (Docker)
```bash
docker build -t clone-mini-hub .
docker run -d -p 5000:5000 --env-file backend/.env --name cmh clone-mini-hub
```

### VPS (PM2)
```bash
npm run build && npm start   # frontend build served by Express
pm2 start backend/src/server.js --name clone-mini-hub
```

Full Sinhala step-by-step guide (Android + GitHub Codespaces): see **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**

## 🔌 API Quick Reference

| Method | Endpoint | Auth | Coins |
|--------|----------|------|-------|
| GET | `/api/download/info?url=` | X-API-Key | 2 |
| GET | `/api/movie/search?q=` | X-API-Key | 1 |
| GET | `/api/movie/:type/:id` | X-API-Key | 1 |
| POST | `/api/ai/chat` | X-API-Key | 3 |
| GET | `/api/utility/qr?text=` | X-API-Key | 1 |
| GET | `/api/status` | Public | - |

Full docs: `/api/docs` (Swagger UI) • `/api/openapi.json` (JSON spec)

## ⚠️ Error Codes

`401` invalid/missing API key • `402` insufficient coins (auto-refund on failures) • `403` suspended/forbidden • `429` rate limited • `503` service not configured (never fake data)

---

**CLONE MINI HUB** — POWERED BY CLONE SHANUWA 🇱🇰
