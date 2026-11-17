# 🇱🇰 CLONE MINI HUB — සම්පූර්ණ Deployment Guide (සිංහලෙන්)

මේ guide එකේ පියවර පිට පියවර හදලා දෙනවා:
1. Project එක Create කරන හැටි
2. GitHub Repository එකට Push කරන හැටි
3. MongoDB Atlas Connect කරන හැටි
4. Heroku Deploy කරන හැටි
5. VPS Deploy කරන හැටි
6. Website + API Test කරන හැටි

> 📱 ඔබ Android Phone එකෙන් **GitHub Codespaces** භාවිතා කරනවා නම්, හැම step එකක්ම Codespaces එකෙන් කරන්න පුළුවන් විදිහට හදලා තියෙනවා.

---

## පියවර 1 — GitHub Repository එක Create කරන හැටි

1. Phone එකෙන් [github.com](https://github.com) එකට Login වෙන්න.
2. **New Repository** එකක් Create කරන්න.
   - Repository name: `clone-mini-hub`
   - **Public** දාන්න (Heroku free deploy වලට ලේසියි)
   - "Add a README file" ✅ tick කරන්න
3. **Create Repository** click කරන්න.

## පියවර 2 — GitHub Codespaces එකෙන් Project එක හදන හැටි

1. ඔයාගේ repository එකට ගිහින් **Code → Codespaces → Create codespace on main** click කරන්න.
2. Browser එකෙන් VS Code එකක් open වෙනවා. ඒක තමයි ඔයාගේ "Computer" එක.
3. Terminal එකේ මේ commands ටික run කරන්න:

```bash
# Node version check (18+ ඕන)
node -v

# Project files ඔක්කොම ඔයාගේ repo එකට දාන්න
# (මේ project එකේ සියලුම files copy කරලා paste කරන්න පුළුවන්,
#  නැත්නම් zip එකක් upload කරලා unzip කරන්න)
```

4. Dependencies install කරන්න:

```bash
cd clone-mini-hub/backend && npm install
cd ../frontend && npm install
```

## පියවර 3 — MongoDB Atlas (Free Database) Connect කරන හැටි

1. [mongodb.com/atlas](https://www.mongodb.com/atlas) එකට ගිහින් Free Account එකක් හදන්න.
2. **Build a Database → Create → Free (M0)** තෝරන්න → Region එකට **Singapore** (Sri Lanka එකට ආසන්නම) තෝරන්න.
3. **Database Access** → **Add New Database User**
   - Username: `Shanuwaid` (ඔයා කැමති නමක්)
   - Password: ශක්තිමත් password එකක් **මතක තියාගන්න** 🔐
4. **Network Access** → **Add IP Address** → **Allow Access From Anywhere** (`0.0.0.0/0`) දාන්න (Heroku/VPS වලට ඕන).
5. **Database → Connect → Connect your application** → Connection string එක copy කරන්න.
   ```
   mongodb+srv://Shanuwaid:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/clone-mini-hub?retryWrites=true&w=majority
   ```
   `YOUR_PASSWORD` වෙනුවට ඔයාගේ real password එක දාන්න.

6. Codespaces එකේ `.env` file එක හදන්න:

```bash
cd clone-mini-hub/backend
cp .env.example .env
nano .env   # නැත්නම් VS Code එකෙන් .env file එක open කරන්න
```

`.env` එකට මේවා දාන්න:
- `MONGO_URI` = උඩ connection string එක
- `JWT_ACCESS_SECRET` = මේ command එකෙන් generate කරන්න: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
- `JWT_REFRESH_SECRET` = තව පාරක් ඒ command එක run කරලා වෙනස් value එකක් දාන්න
- `API_KEY_PEPPER` = තව එක random string එකක්

> ⚠️ **වැදගත්:** `.env` file එක GitHub එකට **කවදාවත්** push කරන්න එපා. `.gitignore` එකේ ඒක ඇතුළත් කරලා තියෙනවා.

## පියවර 4 — Local Test කරන හැටි (Codespaces එකේ)

```bash
# Backend start කරන්න (port 5000)
cd clone-mini-hub/backend
npm run dev
```

Codespaces එක **"Open in Browser"** popup එකක් පෙන්වයි — ඒක click කරල් port **5000** forward කරන්න.

Browser එකේ මේ URLs check කරන්න:
- `https://...-5000.../api/health` → `{"success":true,...}` පෙන්වන්න ඕන
- `https://...-5000.../api/docs` → Swagger docs පේනවා නම් හරි!

First run එකේ automatically වෙනවා:
- ✅ API Endpoints 22ක් seed වෙනවා
- ✅ Admin account එකක් හැදෙනවා (`.env` එකේ `ADMIN_EMAIL` / `ADMIN_PASSWORD`)
- ✅ Starting coins 50, Daily bonus 50 set වෙනවා

**Frontend test කරන්න:**
```bash
cd ../frontend
npm run dev
```
Port **5173** browser එකෙන් open කරන්න. Login/Register කරලා බලන්න.

## පියවර 5 — GitHub එකට Push කරන හැටි

```bash
cd clone-mini-hub
git add .
git commit -m "CLONE MINI HUB V1 - POWERED BY CLONE SHANUWA"
git push origin main
```

## පියවර 6 — Heroku Deploy කරන හැටි

1. [heroku.com](https://heroku.com) එකට Free Account එකක් හදන්න.
2. **New → Create new app** → app name එකක් (උදා: `cloneminHub-lk`) දෙන්න → Region: **United States**.
3. **Settings → Reveal Config Vars** එකට මේවා දාන්න (Codespaces `.env` එකේ තියෙන ඔක්කොම):

| KEY | VALUE |
|-----|-------|
| MONGO_URI | ඔයාගේ Atlas connection string එක |
| JWT_ACCESS_SECRET | random hex එක |
| JWT_REFRESH_SECRET | වෙනස් random hex එකක් |
| NODE_ENV | production |
| CLIENT_URL | https://cloneminHub-lk.herokuapp.com |
| API_KEY_PEPPER | random string එකක් |
| ADMIN_EMAIL / ADMIN_PASSWORD | admin login |

4. Codespaces එකේ මේ commands run කරන්න:

```bash
# Heroku CLI install
curl https://cli-assets.heroku.com/install.sh | sh

# Login (browser link එකක් දෙනවා)
heroku login

# App එකට connect කරන්න
heroku git:remote -a cloneminHub-lk

# Deploy! 🚀
git push heroku main
```

5. Deploy ඉවර වුණාම: `https://cloneminHub-lk.herokuapp.com` එකට ගිහින් Website එක බලන්න!

**Buildpack check:** අවශ්‍ය නම්:
```bash
heroku buildpacks:add heroku/nodejs
```

## පියවර 7 — VPS Deploy කරන හැටි (Docker)

1. VPS එකක් ගන්න (උදා: DigitalOcean $6 droplet, Ubuntu 22.04).
2. SSH වෙන්න: `ssh root@YOUR_VPS_IP`
3. Docker install:
```bash
apt update && apt install -y docker.io git
```
4. Project එක clone කරලා run කරන්න:
```bash
git clone https://github.com/YOUR-USERNAME/clone-mini-hub.git
cd clone-mini-hub
cp backend/.env.example backend/.env
nano backend/.env   # real values දාන්න

docker build -t clone-mini-hub .
docker run -d -p 80:5000 --env-file backend/.env --restart always --name cmh clone-mini-hub
```
5. `http://YOUR_VPS_IP` එකට ගිහින් බලන්න.

**Docker නැතුනම් PM2 වලින්:**
```bash
apt install -y nodejs npm
npm install -g pm2
cd clone-mini-hub && npm run install-all && npm run build
pm2 start backend/src/server.js --name clone-mini-hub
pm2 save && pm2 startup
```

## පියවර 8 — Website + API Test කරන හැටි

### Website Test
1. `/register` — Account එකක් හදන්න (coins 50ක් ලැබෙන්න ඕන)
2. `/login` — Login වෙන්න
3. `/dashboard` — Stats, Daily Bonus බලන්න
4. `/api-keys` — Key එකක් create කරලා copy කරන්න
5. `/playground` — API එකක් try කරන්න

### API Test (curl වලින්)
```bash
# Health check
curl https://YOUR-DOMAIN/api/health

# API Key එකක් හදන්න (login token එකක් ඕන)
curl -X POST https://YOUR-DOMAIN/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"yourpass"}'

# API Key එකෙන් weather බලන්න
curl -G "https://YOUR-DOMAIN/api/utility/weather" \
  -H "X-API-Key: cmh_live_xxxxxxxx" \
  --data-urlencode "city=Colombo"
```

### Errors Fix කරන හැටි
| ප්‍රශ්නය | විසඳුම |
|---------|--------|
| `MONGO_URI is not set` | `.env` එකේ connection string එක දාලා server restart කරන්න |
| `401 INVALID_API_KEY` | `X-API-Key` header එකේ නිවැරදි key එක තියෙනවද බලන්න |
| `402 INSUFFICIENT_COINS` | Daily bonus claim කරන්න නැත්නම් admin එකෙන් coins දාන්න |
| `503 SERVICE_UNAVAILABLE` | ඒ API එකට provider key එකක් (TMDB/Gemini/OpenAI) `.env` එකට දාන්න |
| MongoDB connect වෙන්නේ නැත්නම් | Atlas **Network Access** එකට `0.0.0.0/0` දාලා තියෙනවද බලන්න |
| Google Login වැඩ කරන්නේ නැත්නම් | Google Console එකේ callback URL එක `https://YOUR-DOMAIN/api/auth/google/callback` විදිහට දාන්න |

---

## 🔐 ආරක්ෂිතව ඉන්න විදිහ

- `.env` file එක **කවදාවත්** GitHub එකට push කරන්න එපා
- Admin password එක first login එකේදී වෙනස් කරන්න
- JWT secrets ටික අඩුම තරමින් අකුරු 32ක් දිග කරන්න
- MongoDB password එක ශක්තිමත් එකක් කරන්න

---

**CLONE MINI HUB** — POWERED BY CLONE SHANUWA 🇱🇰
