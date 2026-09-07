<div align="center">

<img src="assets/banner.svg" alt="TrueTaste — voice-first food discovery for Pakistan" width="100%">

**Speak a review. Earn DineCoins. Redeem rewards.**

The voice-first food-discovery app for **Lahore, Islamabad & Karachi**.</div>

---

<p align="center">
  <a href="#intro">Intro</a> ·
  <a href="#features">Features</a> ·
  <a href="#how-it-works">How it works</a> ·
  <a href="#tech-stack">Stack</a> ·
  <a href="#getting-started">Getting started</a> ·
  <a href="#qr-demo">QR demo</a> ·
  <a href="#screenshots">Screenshots</a> ·
  <a href="#project-structure">Structure</a> ·
  <a href="#roadmap">Roadmap</a>
</p>

<p align="center">
  <img alt="React Native" src="https://img.shields.io/badge/React_Native-0.81-%231C1B1B?logo=react&logoColor=white">
  <img alt="Expo" src="https://img.shields.io/badge/Expo-SDK_54-%23FF6B35?logo=expo&logoColor=white">
  <img alt="Express" src="https://img.shields.io/badge/Express-4-%231C1B1B?logo=express">
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-%2322C55E?logo=mongodb&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-%233178C6?logo=typescript&logoColor=white">
  <img alt="Voice AI" src="https://img.shields.io/badge/Groq_Whisper-%23712AE2">
  <img alt="Release" src="https://img.shields.io/badge/APK-v1.1.4-%23FF6B35">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-%231C1B1B">
</p>

---

## 🍽️ What is TrueTaste?

TrueTaste turns a restaurant visit into a quick speaking moment instead of a typing chore. Every table carries its own **QR code**; scan it, open the menu, leave a **voice review** in Urdu or English, and get your words transcribed, summarized and sentiment-scored by Groq's Whisper model. Honest reviews feed a **DineCoins** economy — earn coins, watch the feed grow, and spend them on real perks.

It's a full two-tier product — an Expo React Native app on top of an Express + MongoDB API — seeded with **20 real restaurants across three Pakistani cities**, built as a hackathon demo.

### Try it now

<table align="center">
<tr>
<td align="center" width="50%">

**📱 Android APK** (SDK 21+, ~100 MB)  

Install [`TrueTaste-preview.apk`](https://github.com/hackathonteam360/TrueTaste/releases/tag/v1.1.4) — create an account and explore the full flow.

</td>
<td align="center" width="50%">

**⚡ Live API**

`https://truetaste-api.bonto.run/api` — every endpoint is hit-testable.

</td>
</tr>
</table>

---

## ✨ Features

<table>
<tr>
<td>

**🗺️ Real area data** — 20 authentic Pakistani restaurants across Lahore, Islamabad and Karachi, with menus, photos, opening hours, tables and per-table deep-link QR codes.

</td>
<td>

**🎙️ Voice-first reviews** — hold to talk; your words are transcribed (Groq Whisper-large-v3), tagged and sentiment-scored. Each first review of a restaurant earns **10 DineCoins**.

</td>
</tr>
<tr>
<td>

**🪙 DineCoins economy** — welcome bonus, earn-per-review, a coin-activity feed, and a rewards shop (free delivery, coupons, discounts, desserts) — with a once-per-restaurant coin rule shown plainly in the review UI.

</td>
<td>

**🔍 Discover & filter** — keyword search across restaurants *and* dishes, chips for cuisine / rating / price / open-now, distance sorting, and an Explore map mode.

</td>
</tr>
<tr>
<td>

**🎯 Tailored recommendations** — your city, cuisines, dishes, spice and budget preferences drive a personalized feed.

</td>
<td>

**📍 Nearby mode** — GPS-based discovery with a graceful city-centre fallback when location is off.

</td>
</tr>
<tr>
<td>

**🧭 Live navigation** — every restaurant card opens one-tap directions in Google Maps.

</td>
<td>

**🎫 QR demo kit** — a self-contained page rendering live, DB-driven QR cards for believable table-lookup demos.

</td>
</tr>
</table>

---

## 🔁 How it works

```
 Scan QR on the table   →  Speak your review    →  AI analysis          →  Rewards
 ┌───────────────────┐    ┌──────────────────┐    ┌─────────────────┐    ┌────────────┐
 │ app resolves the  │    │ transcribed via  │    │ sentiment,      │    │ +10 coins  │
 │ table + menu page │ →  │ Groq Whisper     │ →  │ tags, summary   │ →  │ feed + shop│
 └───────────────────┘    └──────────────────┘    └─────────────────┘    └────────────┘
```

---

## 🧰 Tech stack

| Layer | Stack |
|-------|-------|
| Mobile | React Native 0.81 · Expo SDK 54 · Expo Router · Zustand · TanStack Query · Expo Location/Haptics/AV |
| Backend | Node.js · Express · TypeScript · Mongoose · Multer · Cloudinary |
| Data | MongoDB (seeded demo dataset) |
| AI | Groq Whisper-large-v3 (voice), LLM sentiment/summaries with deterministic mock fallback |
| Design | Stitch MCP design-system tokens driving the full visual theme |

---

## 🚀 Getting started

```
server/.env    MONGODB_URI, JWT_SECRET, STT_API_KEY (Groq), optional AI_API_KEY
mobile/.env    EXPO_PUBLIC_API_URL=http://<lan-ip>:5000/api
```

> **APK builds & Google sign-in** — local dev runs with just `EXPO_PUBLIC_API_URL`. Building a standalone APK additionally needs `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` and `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` in `mobile/eas.json`; the config plugin [`mobile/plugins/withGoogleAndroidClientId.js`](mobile/plugins/withGoogleAndroidClientId.js) bakes the Android client into `default_web_client_id`, which Google sign-in requires on Android. Skip it and the APK will build but Google login will fail.

```bash
# 1 — API
cd server
npm install && npm run seed && npm run dev      # http://localhost:5000

# 2 — App (separate terminal)
cd mobile
npm install && npx expo start                    # scan with Expo Go on same Wi-Fi
```

No transcription key? The app falls back to a deterministic mock — the demo runs with zero paid accounts.

---

## 🎫 QR demo

Open [`.scripts/qr-demo/index.html`](.scripts/qr-demo/index.html) from disk and scan any card with the app — it resolves to the real table page. Cards are generated straight from the database (not hardcoded IDs), so they survive reseeding.

---

## 📸 Screenshots

Live QR cards generated by the demo kit (top-3 per city):

<div align="center">
  <img width="180" src=".scripts/qr-demo/qr-andaaz-restaurant.png" alt="Andaz Restaurant">
  <img width="180" src=".scripts/qr-demo/qr-butt-karahi.png" alt="Butt Karahi">
  <img width="180" src=".scripts/qr-demo/qr-chaaye-khana.png" alt="Chaaye Khana">
  <img width="180" src=".scripts/qr-demo/qr-kolachi-restaurant.png" alt="Kolachi">
  <img width="180" src=".scripts/qr-demo/qr-savour-foods.png" alt="Savour Foods">
  <img width="180" src=".scripts/qr-demo/qr-monal-restaurant.png" alt="Monal">
</div>

---

## 🛠️ Ops scripts

| Script | Purpose |
|--------|---------|
| `.scripts/run-server.ps1` | Start the API with rolling log |
| `.scripts/release.sh` | Bump version, build via EAS, publish APK as a GitHub release (`bash .scripts/release.sh v1.1.0`) |
| `.scripts/run-expo.ps1` | Start the Metro bundler |
| `.scripts/run-tunnel.ps1` | Expose the API over a Cloudflare HTTPS tunnel |
| `.scripts/api-sweep.cjs` | QA sweep of every read endpoint (15/15 green) |

---

## 🗂️ Project structure

```
├── mobile/      Expo React Native app (expo-router tabs, screens, stores)
├── server/      Express + TypeScript API, Mongoose models, seed script
├── assets/      Repo branding
└── .scripts/    Demo tooling — QR kit, run scripts, QA sweep
```

---

## 🧭 Roadmap

- [ ] Voice-powered search ("find biryani in Lahore") using the on-device mic
- [ ] "Why this for you" — LLM explanations on the recommendations feed
- [ ] Restaurant auto-replies under each review
- [ ] Photo → dish tagging via vision model

---

## Acknowledgements

UI designed and restyled with [Stitch MCP](https://stitch.mcp.so) design-system tooling; built for a hackathon demo.

## License

[MIT](LICENSE)