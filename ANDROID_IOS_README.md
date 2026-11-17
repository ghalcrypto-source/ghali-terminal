# GHALI ON-CHAIN TERMINAL - ANDROID & IOS MOBILE APP GUIDE

Terminal analisis makro on-chain, AI contrarian fund strategist, dan AI Chartist Auto-Drawing (Fibonacci, Elliott Wave, Trendline, ICT, SnR) kini telah dirancang untuk mendukung **Web (Desktop & Mobile Browser)** serta siap untuk di-deploy ke **Android & iOS (Native / PWA)**.

---

## 1. Arsitektur Multi-Platform (Web & Mobile)

Aplikasi ini menggunakan stack modern yang modular:
- **Backend API (`server.ts`)**: Node.js & Express yang terintegrasi langsung dengan `@google/genai` (Gemini 4 Hydrogen) dan API WebSocket Binance real-time (`wss://stream.binance.com:9443/ws/!miniTicker@arr`), serta endpoint `/api/crypto/ai-chart-draw` untuk auto-drawing teknikal otomatis.
- **Frontend Web (`src/`)**: React 19, TypeScript, Tailwind CSS v4, Lightweight Charts, dan Three.js 3D Monolith.
- **Mobile Versi (Android & iOS)**:
  - **Opsi A (Progressive Web App / PWA)**: Buka URL web app di Safari (iOS) atau Chrome (Android), lalu pilih **"Add to Home Screen"**. App akan berjalan sebagai standalone mobile app *full-screen* dengan offline caching dan touch gesture yang mulus.
  - **Opsi B (Capacitor / Cordova Wrapper)**: Bungkus web app ini ke dalam native Android Studio (`android/`) dan Xcode (`ios/`) project menggunakan Capacitor.
  - **Opsi C (React Native / Expo Port)**: Gunakan komponen trading klines & API yang sama dengan React Native Skia / WebView.

---

## 2. Cara Menjalankan Versi Web (Development & Production)

1. Jalankan server dev:
   ```bash
   npm run dev
   ```
2. Buka peramban di `http://localhost:3000` (atau URL preview yang aktif).
3. Masukkan password akses terminal: **`19191204@`**.

---

## 3. Cara Build untuk Android & iOS via Capacitor

Jika Anda ingin mendistribusikan APK Android atau file `.ipa` iOS:

1. Install Capacitor CLI:
   ```bash
   npm install @capacitor/cli @capacitor/core @capacitor/android @capacitor/ios --save
   ```
2. Inisialisasi Capacitor:
   ```bash
   npx cap init "Ghali On-Chain Terminal" com.ghalichain.terminal --web-dir=dist
   ```
3. Build web app:
   ```bash
   npm run build
   ```
4. Tambahkan platform mobile:
   ```bash
   npx cap add android
   npx cap add ios
   ```
5. Sinkronkan file build:
   ```bash
   npx cap sync
   ```
6. Buka IDE native:
   - **Android**: `npx cap open android` (Buka Android Studio, klik Run ke Emulator / HP Android fisik).
   - **iOS**: `npx cap open ios` (Buka Xcode di macOS, jalankan ke Simulator iPhone atau Device).

---

## 4. Fitur AI Technical Auto-Drawing pada Candlestick / Multichart

Pada menu **Multichart**, setiap slot chart sekarang dilengkapi tombol **"🤖 AI Auto-Draw"** yang membuka **AI Candlestick Canvas (`AiCandlestickChart.tsx`)**:
- **Fibonacci Golden Pocket**: AI otomatis mendeteksi Swing High & Swing Low mayor dan menggambar level rasio 0.236, 0.382, 0.5, 0.618 (Golden Pocket), hingga 1.618.
- **Elliott Wave**: Menandai struktur gelombang impulse/corrective (0, 1, 2, 3, 4, 5) berdasarkan ZigZag pivot real-time.
- **Trendline & Kanal**: Menggambar garis resistan dan support dinamis secara presisi.
- **ICT & Smart Money Concepts (SMC)**: Menemukan Fair Value Gaps (FVG), Order Blocks (+OB/-OB), serta Break of Structure (BOS / CHoCH).
- **Support & Resistance (SnR)**: Menyoroti zona likuiditas utama.
- **Prompt Alami**: Anda dapat mengetik instruksi khusus ke AI di kotak input (misal: *"Tolong gambarkan Fibonacci retracement dan Elliott Wave pada timeframe 15m"*), dan AI Gemini 4 Hydrogen akan langsung menganalisis serta menggambarkannya untuk Anda.
