<div align="center">

# TrueTaste

**Scan · Review · Earn · Redeem** — the voice-first food discovery app for Pakistan.

Explore 20 real Lahore, Islamabad and Karachi restaurants, leave a review by *speaking out loud*, and get AI-sentiment analysis plus DineCoins you can redeem for real rewards.

</div>

<p align="center">
  <img alt="Expo" src="https://img.shields.io/badge/React_Native-0.81-1C1B1B?logo=react&logoColor=white">
  <img alt="Express" src="https://img.shields.io/badge/Express-4-FF6B35?logo=express">
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-7-22C55E?logo=mongodb&logoColor=white">
  <img alt="Voice AI" src="https://img.shields.io/badge/Voice-Whisper_%22Large%22-712AE2">
  <img alt="Design" src="https://img.shields.io/badge/Design_MCP_Stitch-FFD700">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-1C1B1B">
</p>

---

## Features

- **Real restaurant data** — 20 seeded Pakistani restaurants (Lahore, Islamabad, Karachi) with menus, photos, hours, tables and deep-link QR codes.
- **Voice-first reviews** — speak your review; it's transcribed (Groq Whisper), tagged, and sentiment-scored, with a per-restaurant DineCoins reward.
- **DineCoins economy** — earn coins per review, get a welcome bonus, redeem rewards (free delivery, coupons, discounts, desserts) with a full coin-activity feed.
- **Discover & filter** — search by dish or restaurant name, filter by cuisine, rating, price and open-now, with distance-based sorting.
- **Personalization** — city, cuisine, spice and budget preferences drive a tailored recommendations feed.
- **Nearby mode** — GPS-based restaurant search with a graceful city fallback when location is off.
- **Map directions** — every restaurant opens live navigation in Google Maps.
- **QR demo kit** — a self-contained HTML page rendering live QR codes for real table lookup.

## Tech stack

| Layer    | Stack |
|----------|-------|
| Mobile   | React Native 0.81 / Expo SDK 54, Expo Router, Zustand, TanStack Query |
| Backend  | Node.js + Express + TypeScript, Mongoose, Multer, Cloudinary |
| Data     | MongoDB (seeded demo data) |
| AI       | Groq Whisper-large-v3 (voice transcription), AI sentiment analysis (mock fallback) |
| Design   | Stitch MCP — UI screens designed and restyled via design-system tokens |

## Getting started

```
server/
  .env       # MONGODB_URI, JWT_SECRET, STT_API_KEY, (optional) AI_API_KEY
mobile/
  .env       # EXPO_PUBLIC_API_URL=http://<your-lan-ip>:5000/api
```

1. **Server**
   ```bash
   cd server
   npm install
   npm run seed        # loads demo restaurants, rewards & users
   npm run dev         # API on http://localhost:5000
   ```
2. **Mobile**
   ```bash
   cd mobile
   npm install
   npm run typecheck
   npx expo start      # scan the QR with Expo Go (same Wi-Fi)
   ```

When the voice transcription key is absent, the app degrades gracefully to a deterministic mock — no paid accounts required to run the demo.

### Demo login

| Role | Email | Password |
|------|-------|----------|
| Demo user | `demo@truetaste.app` | `demo123` |

### QR scan flow

Open `.scripts/qr-demo/index.html` from disk, scan any card, and the app resolves it to the table at that restaurant — then speak your review.

### Ops scripts

| Script | Purpose |
|--------|---------|
| `.scripts/run-server.ps1` | Start the API with logging |
| `.scripts/run-expo.ps1` | Start the Metro bundler |
| `.scripts/run-tunnel.ps1` | Expose the API over Cloudflare (https) |
| `.scripts/api-sweep.cjs` | Healthcare sweep of every read endpoint |

## Screenshots

<div align="center">
  <p>Live QR cards from the demo kit (top-3 per city, DB-driven):</p>
  <img width="180" src=".scripts/qr-demo/qr-andaaz-restaurant.png" alt="Andaz">
  <img width="180" src=".scripts/qr-demo/qr-butt-karahi.png" alt="Butt Karahi">
  <img width="180" src=".scripts/qr-demo/qr-kolachi-restaurant.png" alt="Kolachi">
  <img width="180" src=".scripts/qr-demo/qr-savour-foods.png" alt="Savour Foods">
</div>

Full gallery in [`.scripts/qr-demo/index.html`](.scripts/qr-demo/index.html).

## Repository layout

```
mobile/      Expo React Native app (expo-router)
server/      Express + TypeScript API, seed script, Mongoose models
.scripts/    demo tooling — QR kit, run scripts, QA sweep
```

## License

MIT