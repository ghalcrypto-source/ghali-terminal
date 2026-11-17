import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  ArrowUpRight,
  Film,
  Sparkles,
  Mic,
} from 'lucide-react';
import { sound } from '../audio/soundEngine';

export type GuideFeatureTarget =
  | 'monolith'
  | 'multichart'
  | 'bitcoin_cycle'
  | 'liquidity_movers'
  | 'movers'
  | 'exchange_ls'
  | 'macro_terminal'
  | 'narratives'
  | 'impact_matrix'
  | 'ta'
  | 'alerts'
  | 'whale'
  | 'radar'
  | 'telemetry'
  | 'room_chat';

type GestureStyle = 'explain' | 'point_board' | 'compare' | 'alert_tap';

interface DialogueTurn {
  speaker: 'Reza' | 'Nadia';
  role: string;
  line: string;
  gesture: GestureStyle;
}

interface ToolSection {
  id: string;
  index: number;
  startSec: number;
  endSec: number;
  title: string;
  shortTitle: string;
  subtitle: string;
  turns: [DialogueTurn, DialogueTurn];
  transitionStyle: 'iris' | 'light_leak' | 'curtain' | 'whip_pan';
  target: GuideFeatureTarget;
}

const TOTAL_DURATION = 120; // 2 Menit (12 tools x 10 detik)

const TOOL_SECTIONS: ToolSection[] = [
  {
    id: 'home-monolith',
    index: 1,
    startSec: 0,
    endSec: 10,
    title: 'Beranda SuperApp & 3D Monolith',
    shortTitle: '3D Monolith',
    subtitle: 'Navigasi Utama · Orbit 10 Altcoin 5M',
    turns: [
      {
        speaker: 'Reza',
        role: 'Lead Strategist',
        line: 'Di layar utama Ghali On Chain, 3D Monolith menampilkan denyut BTC real-time bersama sepuluh orbit altcoin tiap lima menit.',
        gesture: 'point_board',
      },
      {
        speaker: 'Nadia',
        role: 'AI & On-Chain Quant',
        line: 'Klik salah satu planet orbit untuk langsung memuat aset ke grafik, atau buka menu kontrol 3D guna mengatur material dan rotasi.',
        gesture: 'explain',
      },
    ],
    transitionStyle: 'light_leak',
    target: 'monolith',
  },
  {
    id: 'ai-chart',
    index: 2,
    startSec: 10,
    endSec: 20,
    title: 'AI Auto-Draw & Multichart Candlestick',
    shortTitle: 'AI Chart',
    subtitle: 'Fibonacci · Elliott Wave · Trendline · ICT · SnR',
    turns: [
      {
        speaker: 'Nadia',
        role: 'AI & On-Chain Quant',
        line: 'Buka AI Chart untuk memantau candlestick live Binance. Ketuk tombol AI Auto-Draw lalu ketik analisa yang kamu mau.',
        gesture: 'point_board',
      },
      {
        speaker: 'Reza',
        role: 'Lead Strategist',
        line: 'Sistem otomatis menggambar Fibonacci retracement, gelombang Elliott, Trendline, blok likuiditas ICT, hingga garis Support Resistance.',
        gesture: 'compare',
      },
    ],
    transitionStyle: 'whip_pan',
    target: 'multichart',
  },
  {
    id: 'btc-cycle',
    index: 3,
    startSec: 20,
    endSec: 30,
    title: 'Bitcoin Cycle & Dossier Pakar 2026',
    shortTitle: 'BTC Cycle',
    subtitle: 'Meteran ATH Live · Konsensus Analis Global',
    turns: [
      {
        speaker: 'Reza',
        role: 'Lead Strategist',
        line: 'Tool Bitcoin Cycle mengukur jarak harga Bitcoin live saat ini terhadap puncak ATH serta memetakan fase pasar siklus empat tahunan.',
        gesture: 'point_board',
      },
      {
        speaker: 'Nadia',
        role: 'AI & On-Chain Quant',
        line: 'Di dalamnya tersedia dossier tesis 2026 dari Willy Woo, Arthur Hayes, PlanB, hingga Benjamin Cowen lengkap dengan target harga.',
        gesture: 'explain',
      },
    ],
    transitionStyle: 'iris',
    target: 'bitcoin_cycle',
  },
  {
    id: 'liquidity-movers',
    index: 4,
    startSec: 30,
    endSec: 40,
    title: 'Likuiditas & Top 5 Altcoin Futures',
    shortTitle: 'Likuiditas',
    subtitle: 'Aliran Modal Sektor · Rasio Long/Short',
    turns: [
      {
        speaker: 'Nadia',
        role: 'AI & On-Chain Quant',
        line: 'Tool Likuiditas melacak perpindahan arus modal mulai dari stablecoin ke Bitcoin lalu berotasi masuk ke altcoin berkapitalisasi besar.',
        gesture: 'compare',
      },
      {
        speaker: 'Reza',
        role: 'Lead Strategist',
        line: 'Perhatikan panel Top 5 Altcoin Long Short untuk mengetahui di pasangan kontrak mana tekanan beli institusi sedang dominan.',
        gesture: 'point_board',
      },
    ],
    transitionStyle: 'curtain',
    target: 'liquidity_movers',
  },
  {
    id: 'top-movers',
    index: 5,
    startSec: 40,
    endSec: 50,
    title: 'Top Movers (Gainers & Losers 24J)',
    shortTitle: 'Top Movers',
    subtitle: 'Pemindai Koin Terpanas & Lonjakan Volume',
    turns: [
      {
        speaker: 'Reza',
        role: 'Lead Strategist',
        line: 'Ketuk Top Movers untuk menyaring koin dengan kenaikan tertinggi maupun koreksi terdalam selama dua puluh empat jam terakhir.',
        gesture: 'point_board',
      },
      {
        speaker: 'Nadia',
        role: 'AI & On-Chain Quant',
        line: 'Cukup tap nama koin di daftar Gainers atau Losers untuk langsung membuka grafiknya di Multichart tanpa mengetik ulang simbol.',
        gesture: 'alert_tap',
      },
    ],
    transitionStyle: 'light_leak',
    target: 'movers',
  },
  {
    id: 'exchange-ls',
    index: 6,
    startSec: 50,
    endSec: 60,
    title: 'Exchange L/S & Sentimen Derivatif',
    shortTitle: 'Exchange L/S',
    subtitle: 'Perbandingan Akun Ritel Binance & Bitget',
    turns: [
      {
        speaker: 'Nadia',
        role: 'AI & On-Chain Quant',
        line: 'Exchange L/S membandingkan persentase posisi Long dan Short secara live antara bursa Binance dan Bitget dalam satu panel.',
        gesture: 'compare',
      },
      {
        speaker: 'Reza',
        role: 'Lead Strategist',
        line: 'Saat posisi ritel terlalu berat di satu sisi dengan funding rate tinggi, waspadai potensi short squeeze atau long liquidation.',
        gesture: 'explain',
      },
    ],
    transitionStyle: 'whip_pan',
    target: 'exchange_ls',
  },
  {
    id: 'news-bedah-ai',
    index: 7,
    startSec: 60,
    endSec: 70,
    title: 'Berita 24J, Prioritas & Bedah AI',
    shortTitle: 'Berita & AI',
    subtitle: 'Macro Wire · Filter High Impact · Analisis Cepat',
    turns: [
      {
        speaker: 'Reza',
        role: 'Lead Strategist',
        line: 'Menu Berita 24J dan Prioritas mengumpulkan rilis ekonomi makro serta berita kripto paling krusial yang berdampak tinggi ke pasar.',
        gesture: 'explain',
      },
      {
        speaker: 'Nadia',
        role: 'AI & On-Chain Quant',
        line: 'Tekan tombol Bedah AI pada berita mana pun untuk langsung memperoleh ringkasan katalis, sentimen aset, dan skenario teknikalnya.',
        gesture: 'point_board',
      },
    ],
    transitionStyle: 'iris',
    target: 'macro_terminal',
  },
  {
    id: 'narratives-matrix',
    index: 8,
    startSec: 70,
    endSec: 80,
    title: 'Narratives 24J & Macro Impact Matrix',
    shortTitle: 'Impact Matrix',
    subtitle: 'Tren Sektor CoinGecko · Korelasi DXY & Emas',
    turns: [
      {
        speaker: 'Nadia',
        role: 'AI & On-Chain Quant',
        line: 'Narratives 24J membaca tren token panas dari CoinGecko serta pergerakan sektor seperti AI, RWA, hingga Layer-1.',
        gesture: 'point_board',
      },
      {
        speaker: 'Reza',
        role: 'Lead Strategist',
        line: 'Sementara Impact Matrix memetakan hubungan langsung antara pergerakan Dolar DXY, imbal hasil obligasi, Emas, dan Bitcoin.',
        gesture: 'compare',
      },
    ],
    transitionStyle: 'curtain',
    target: 'impact_matrix',
  },
  {
    id: 'ta-radar',
    index: 9,
    startSec: 80,
    endSec: 90,
    title: 'Suite Teknikal & Radar Kontra',
    shortTitle: 'Teknikal',
    subtitle: 'Indikator Kuantitatif · Sinyal Dislokasi Ekstrem',
    turns: [
      {
        speaker: 'Reza',
        role: 'Lead Strategist',
        line: 'Menu Teknikal memberi ringkasan cepat kondisi jenuh beli atau jenuh jual dari RSI, MACD, hingga tren multi-timeframe.',
        gesture: 'explain',
      },
      {
        speaker: 'Nadia',
        role: 'AI & On-Chain Quant',
        line: 'Padukan dengan Radar Kontra untuk mendeteksi anomali serta dislokasi makro ketika pasar bereaksi berlebihan terhadap berita.',
        gesture: 'point_board',
      },
    ],
    transitionStyle: 'light_leak',
    target: 'ta',
  },
  {
    id: 'whale-desk',
    index: 10,
    startSec: 90,
    endSec: 100,
    title: 'Whale Desk & Dompet Smart Money',
    shortTitle: 'Whale Desk',
    subtitle: 'Lacak Transaksi Paus & Alamat Terpantau',
    turns: [
      {
        speaker: 'Nadia',
        role: 'AI & On-Chain Quant',
        line: 'Whale Desk memantau arus transaksi besar ke bursa maupun penarikan ke dompet dingin yang dilakukan oleh entitas smart money.',
        gesture: 'point_board',
      },
      {
        speaker: 'Reza',
        role: 'Lead Strategist',
        line: 'Kamu bisa melihat koin apa yang sedang diakumulasi paus lalu langsung memuat grafiknya untuk mencari titik entry terbaik.',
        gesture: 'compare',
      },
    ],
    transitionStyle: 'whip_pan',
    target: 'whale',
  },
  {
    id: 'price-alerts',
    index: 11,
    startSec: 100,
    endSec: 110,
    title: 'Price Alerts & Alarm Cekring Live',
    shortTitle: 'Price Alerts',
    subtitle: 'Notifikasi Suara Otomatis Saat Target Tersentuh',
    turns: [
      {
        speaker: 'Reza',
        role: 'Lead Strategist',
        line: 'Di Price Alerts, tentukan target harga di atas maupun di bawah harga live agar kamu tidak pernah tertinggal breakout penting.',
        gesture: 'alert_tap',
      },
      {
        speaker: 'Nadia',
        role: 'AI & On-Chain Quant',
        line: 'Begitu harga menyentuh batas target secara real-time, alarm audio Cekring akan berbunyi dan memunculkan penanda visual instan.',
        gesture: 'point_board',
      },
    ],
    transitionStyle: 'iris',
    target: 'alerts',
  },
  {
    id: 'telemetry-chat',
    index: 12,
    startSec: 110,
    endSec: 120,
    title: '8-API Telemetry & Room Chat Komunitas',
    shortTitle: '8-API & Chat',
    subtitle: 'Spread 8 Bursa Dunia · Diskusi Setup Real-Time',
    turns: [
      {
        speaker: 'Nadia',
        role: 'AI & On-Chain Quant',
        line: 'Panel 8-API Live menyinkronkan harga dan metrik on-chain dari delapan sumber data global guna memeriksa selisih spread bursa.',
        gesture: 'point_board',
      },
      {
        speaker: 'Reza',
        role: 'Lead Strategist',
        line: 'Terakhir, bagikan analisa maupun tangkapan chart kamu di Room Chat bersama komunitas. Semua tools kini siap kamu gunakan!',
        gesture: 'explain',
      },
    ],
    transitionStyle: 'curtain',
    target: 'telemetry',
  },
];

interface LiveBtcSnapshot {
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  tickDir: 'up' | 'down' | 'flat';
  lastTickMs: number;
}

interface PanduanVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchFeature: (target: GuideFeatureTarget) => void;
  initialBtcPrice?: number;
}

function easeOutCubic(x: number): number {
  const t = Math.max(0, Math.min(1, x));
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutQuad(x: number): number {
  const t = Math.max(0, Math.min(1, x));
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function formatClock(sec: number): string {
  const clamped = Math.max(0, Math.min(TOTAL_DURATION, Math.floor(sec)));
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';
  let currY = y;
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    if (ctx.measureText(testLine).width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), x, currY);
      line = words[i] + ' ';
      currY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line.trim()) {
    ctx.fillText(line.trim(), x, currY);
  }
}

/**
 * Fully animated, volumetric 2.5D realistic human actor renderer.
 * Both actors genuinely breathe, blink, nod while listening, rotate gaze toward partner/board,
 * move jaw + lips + upper teeth in natural speech sync, and point/gesture with articulated arms.
 */
function drawAnimatedActor(
  ctx: CanvasRenderingContext2D,
  opts: {
    actor: 'Reza' | 'Nadia';
    cx: number;
    cy: number;
    scale: number;
    t: number;
    isSpeaking: boolean;
    gesture: GestureStyle;
    lookAtPartner: boolean;
    activeGlow: number;
  }
) {
  const { actor, cx, cy, scale, t, isSpeaking, gesture, lookAtPartner, activeGlow } = opts;
  const isReza = actor === 'Reza';

  // Organic breathing + speech body engagement
  const phase = isReza ? 0 : 1.7;
  const breathe = Math.sin(t * 2.2 + phase) * 3.2;
  const bodySway = isSpeaking ? Math.sin(t * 2.9 + phase) * 3 : Math.sin(t * 1.1 + phase) * 1.4;
  const headNod = isSpeaking
    ? Math.sin(t * 4.4 + phase) * 2.5
    : Math.sin(t * 2.4 + phase) * 2.2; // reactive listening nod
  const headTilt = isSpeaking
    ? (isReza ? 0.035 : -0.035) + Math.sin(t * 2.1 + phase) * 0.035
    : lookAtPartner
    ? isReza
      ? 0.08
      : -0.08
    : 0;

  ctx.save();
  ctx.translate(cx + bodySway, cy + breathe);
  ctx.scale(scale, scale);

  // Studio Back Rim Halo behind active speaker
  if (activeGlow > 0.05) {
    const rim = ctx.createRadialGradient(0, -210, 15, 0, -210, 185);
    rim.addColorStop(
      0,
      isReza
        ? `rgba(231, 204, 130, ${0.28 * activeGlow})`
        : `rgba(52, 211, 153, ${0.24 * activeGlow})`
    );
    rim.addColorStop(1, 'rgba(7, 10, 17, 0)');
    ctx.fillStyle = rim;
    ctx.beginPath();
    ctx.arc(0, -210, 185, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- Torso / Tailored Studio Wardrobe ---
  const shoulderW = isReza ? 98 : 84;
  const blazerGrad = ctx.createLinearGradient(-shoulderW, -195, shoulderW, 40);
  if (isReza) {
    blazerGrad.addColorStop(0, '#222d44');
    blazerGrad.addColorStop(0.5, '#10182a');
    blazerGrad.addColorStop(1, '#070a11');
  } else {
    blazerGrad.addColorStop(0, '#1d2838');
    blazerGrad.addColorStop(0.5, '#0e1622');
    blazerGrad.addColorStop(1, '#070b12');
  }

  ctx.fillStyle = blazerGrad;
  ctx.beginPath();
  ctx.moveTo(-shoulderW - 6, 40);
  ctx.quadraticCurveTo(-shoulderW + 4, -155, -48, -182);
  ctx.lineTo(48, -182);
  ctx.quadraticCurveTo(shoulderW - 4, -155, shoulderW + 6, 40);
  ctx.closePath();
  ctx.fill();

  // Warm studio rim stroke along shoulders
  ctx.strokeStyle = isReza ? 'rgba(231, 204, 130, 0.42)' : 'rgba(110, 231, 183, 0.35)';
  ctx.lineWidth = 2.2;
  ctx.stroke();

  if (isReza) {
    // Crisp White Dress Shirt & Textured Gold Silk Tie
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.moveTo(-26, -182);
    ctx.lineTo(26, -182);
    ctx.lineTo(0, -76);
    ctx.closePath();
    ctx.fill();

    const tieGrad = ctx.createLinearGradient(-10, -176, 10, -76);
    tieGrad.addColorStop(0, '#f5e3af');
    tieGrad.addColorStop(0.55, '#c89b2b');
    tieGrad.addColorStop(1, '#7a5912');
    ctx.fillStyle = tieGrad;
    ctx.beginPath();
    ctx.moveTo(-7, -176);
    ctx.lineTo(7, -176);
    ctx.lineTo(10, -104);
    ctx.lineTo(0, -74);
    ctx.lineTo(-10, -104);
    ctx.closePath();
    ctx.fill();

    // Suit Lapels + Gold Pin
    ctx.fillStyle = '#172034';
    ctx.beginPath();
    ctx.moveTo(-26, -182);
    ctx.lineTo(-48, -130);
    ctx.lineTo(-3, -74);
    ctx.closePath();
    ctx.moveTo(26, -182);
    ctx.lineTo(48, -130);
    ctx.lineTo(3, -74);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#e7cc82';
    ctx.beginPath();
    ctx.arc(-33, -134, 4, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Nadia Silk Inner Blouse & Tailored Charcoal Lapels + Minimalist Gold Bar Brooch
    ctx.fillStyle = '#131d2d';
    ctx.beginPath();
    ctx.moveTo(-24, -182);
    ctx.lineTo(24, -182);
    ctx.lineTo(0, -90);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#162030';
    ctx.beginPath();
    ctx.moveTo(-24, -182);
    ctx.lineTo(-42, -132);
    ctx.lineTo(-2, -88);
    ctx.closePath();
    ctx.moveTo(24, -182);
    ctx.lineTo(42, -132);
    ctx.lineTo(2, -88);
    ctx.closePath();
    ctx.fill();

    // Gold vertical bar brooch
    ctx.fillStyle = '#e7cc82';
    drawRoundedRect(ctx, 24, -142, 4, 15, 2);
    ctx.fill();
  }

  // --- Articulated Arms & Gesturing Hands ---
  // Active speaker raises pointing/gesturing hand toward the holographic terminal on the right!
  const armWave = isSpeaking ? Math.sin(t * 4.1 + phase) * 0.16 : Math.sin(t * 1.4 + phase) * 0.04;
  let reachAngle = -0.25 + armWave;
  let forearmAngle = -0.52 + Math.cos(t * 3.6 + phase) * 0.18;

  if (isSpeaking && gesture === 'point_board') {
    reachAngle = -0.44 + Math.sin(t * 3.5) * 0.12;
    forearmAngle = -0.78 + Math.sin(t * 4.3) * 0.14;
  } else if (isSpeaking && gesture === 'compare') {
    reachAngle = -0.18 + Math.sin(t * 4.4) * 0.22;
    forearmAngle = -0.35 + Math.cos(t * 4.4) * 0.22;
  } else if (!isSpeaking) {
    // Calm listening posture
    reachAngle = 0.65 + Math.sin(t * 1.4 + phase) * 0.04;
    forearmAngle = -0.15 + Math.cos(t * 1.4 + phase) * 0.04;
  }

  const skinBase = isReza ? '#dca684' : '#e6b798';
  const skinHighlight = isReza ? '#f0c3a5' : '#f7d2b9';
  const skinShadow = isReza ? '#b77d5c' : '#c48d6c';

  // Right Arm (gesturing toward board/partner)
  const srX = shoulderW - 14;
  const srY = -160;
  const erX = srX + Math.cos(reachAngle) * 58;
  const erY = srY + Math.sin(reachAngle + 0.55) * 58;
  const hrX = erX + Math.cos(forearmAngle) * 66;
  const hrY = erY + Math.sin(forearmAngle) * 66;

  ctx.strokeStyle = isReza ? '#131c2e' : '#121a26';
  ctx.lineWidth = isReza ? 24 : 20;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(srX, srY);
  ctx.lineTo(erX, erY);
  ctx.lineTo(hrX, hrY);
  ctx.stroke();

  // Animated Hand & Articulated Fingers
  ctx.fillStyle = skinBase;
  ctx.beginPath();
  ctx.ellipse(hrX + 6, hrY - 2, 10, 8, forearmAngle * 0.3, 0, Math.PI * 2);
  ctx.fill();

  if (isSpeaking) {
    ctx.strokeStyle = skinHighlight;
    ctx.lineWidth = 4.6;
    ctx.beginPath();
    ctx.moveTo(hrX + 8, hrY - 4);
    ctx.lineTo(hrX + 26, hrY - 12);
    ctx.moveTo(hrX + 7, hrY + 1);
    ctx.lineTo(hrX + 22, hrY - 2);
    ctx.stroke();
  }

  // Left Arm (support gesture or holding tablet / poise)
  const slX = -shoulderW + 14;
  const slY = -160;
  const leftWave = isSpeaking && gesture === 'compare' ? Math.sin(t * 4.4) * 14 : Math.sin(t * 1.8) * 3;
  const elX = slX - 18;
  const elY = slY + 56;
  const hlX = -22 + leftWave * 0.5;
  const hlY = -48 - Math.abs(leftWave);

  ctx.strokeStyle = isReza ? '#0e1524' : '#0d131d';
  ctx.lineWidth = isReza ? 23 : 19;
  ctx.beginPath();
  ctx.moveTo(slX, slY);
  ctx.lineTo(elX, elY);
  ctx.lineTo(hlX, hlY);
  ctx.stroke();

  ctx.fillStyle = skinBase;
  ctx.beginPath();
  ctx.arc(hlX + 4, hlY - 2, 9, 0, Math.PI * 2);
  ctx.fill();

  // --- Neck & Subsurface Shaded Head ---
  const neckGrad = ctx.createLinearGradient(-16, -220, 16, -172);
  neckGrad.addColorStop(0, skinShadow);
  neckGrad.addColorStop(0.5, skinBase);
  neckGrad.addColorStop(1, skinShadow);
  ctx.fillStyle = neckGrad;
  drawRoundedRect(ctx, -16, -220, 32, 46, 11);
  ctx.fill();

  // Chin occlusion shadow on neck
  ctx.fillStyle = 'rgba(20, 10, 5, 0.25)';
  ctx.beginPath();
  ctx.ellipse(0, -196, 15, 7, 0, 0, Math.PI);
  ctx.fill();

  // --- Animated Head (Nod, Tilt, Gaze, Blink & Live Jaw/Lip-Sync) ---
  ctx.save();
  ctx.translate(0, -246 + headNod);
  ctx.rotate(headTilt);

  // Back Hair Layer for Nadia (shoulder-length layered dark hair)
  if (!isReza) {
    ctx.fillStyle = '#0c121e';
    ctx.beginPath();
    ctx.moveTo(-42, -28);
    ctx.quadraticCurveTo(-52, 22, -46, 62);
    ctx.lineTo(46, 62);
    ctx.quadraticCurveTo(52, 22, 42, -28);
    ctx.closePath();
    ctx.fill();
  }

  // Ears (with warm rim highlight)
  ctx.fillStyle = skinShadow;
  ctx.beginPath();
  ctx.ellipse(-40, 4, 7, 12, 0, 0, Math.PI * 2);
  ctx.ellipse(40, 4, 7, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wireless Studio Earpiece on Nadia
  if (!isReza) {
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(39, 6, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.arc(39, 6, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Subtle Jaw Drop displacement when speaking
  const speechEnvelope = isSpeaking
    ? Math.max(0.15, Math.abs(Math.sin(t * 13.8 + phase) * 0.65 + Math.sin(t * 7.4 + phase) * 0.35))
    : 0;
  const jawDrop = speechEnvelope * 4.5;

  // Sculpted Face Contour with volumetric lighting gradient
  const faceGrad = ctx.createRadialGradient(-10, -16, 6, 0, 4, 54);
  faceGrad.addColorStop(0, skinHighlight);
  faceGrad.addColorStop(0.62, skinBase);
  faceGrad.addColorStop(1, skinShadow);
  ctx.fillStyle = faceGrad;

  const faceW = isReza ? 38 : 35;
  ctx.beginPath();
  ctx.moveTo(-faceW, -22);
  ctx.quadraticCurveTo(-faceW - 2, 18, -22, 37 + jawDrop * 0.5);
  ctx.quadraticCurveTo(0, 52 + jawDrop, 22, 37 + jawDrop * 0.5);
  ctx.quadraticCurveTo(faceW + 2, 18, faceW, -22);
  ctx.quadraticCurveTo(faceW, -54, 0, -54);
  ctx.quadraticCurveTo(-faceW, -54, -faceW, -22);
  ctx.closePath();
  ctx.fill();

  // Subtle Cheekbone Highlight & Jaw Contour
  ctx.fillStyle = 'rgba(255, 224, 198, 0.14)';
  ctx.beginPath();
  ctx.ellipse(-18, 6, 9, 5, -0.2, 0, Math.PI * 2);
  ctx.ellipse(18, 6, 9, 5, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Reza short-stubble / sculpted jawline shadow
  if (isReza) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.11)';
    ctx.beginPath();
    ctx.moveTo(-30, 14);
    ctx.quadraticCurveTo(0, 49 + jawDrop, 30, 14);
    ctx.quadraticCurveTo(0, 36 + jawDrop * 0.5, -30, 14);
    ctx.fill();
  }

  // Front Hair Styling with Rim Sheen
  ctx.fillStyle = '#0f172a';
  if (isReza) {
    ctx.beginPath();
    ctx.moveTo(-40, -18);
    ctx.quadraticCurveTo(-44, -60, -8, -65);
    ctx.quadraticCurveTo(34, -68, 42, -20);
    ctx.quadraticCurveTo(38, -10, 34, -18);
    ctx.quadraticCurveTo(20, -38, -12, -35);
    ctx.quadraticCurveTo(-32, -32, -38, -14);
    ctx.closePath();
    ctx.fill();

    // Silver-gold rim strands
    ctx.strokeStyle = 'rgba(231, 204, 130, 0.3)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-20, -50);
    ctx.quadraticCurveTo(6, -58, 28, -42);
    ctx.stroke();
  } else {
    // Sleek side-parted hair framing Nadia's face
    ctx.beginPath();
    ctx.moveTo(-39, -12);
    ctx.quadraticCurveTo(-42, -58, 0, -61);
    ctx.quadraticCurveTo(42, -58, 41, -8);
    ctx.quadraticCurveTo(34, -28, 12, -38);
    ctx.quadraticCurveTo(-18, -36, -34, -12);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(245, 227, 175, 0.22)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-16, -49);
    ctx.quadraticCurveTo(8, -55, 26, -38);
    ctx.stroke();
  }

  // Expressive Eyebrows
  const browLift = isSpeaking ? Math.abs(Math.sin(t * 3.4 + phase)) * 3.2 : 0.4;
  ctx.strokeStyle = '#182030';
  ctx.lineWidth = isReza ? 3.2 : 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-24, -13 - browLift);
  ctx.quadraticCurveTo(-16, -17 - browLift, -7, -13 - browLift);
  ctx.moveTo(7, -13 - browLift);
  ctx.quadraticCurveTo(16, -17 - browLift, 24, -13 - browLift);
  ctx.stroke();

  // Natural Blinking Eyes + Directional Gaze (looks at partner when listening, toward board/viewer when explaining)
  const blinkCycle = (t + (isReza ? 0 : 1.5)) % 3.4;
  const isBlinking = blinkCycle > 3.22 && blinkCycle < 3.36;
  const gazeX = lookAtPartner ? (isReza ? 2.4 : -2.4) : 1.4;

  [-15.5, 15.5].forEach((ex) => {
    if (isBlinking) {
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(ex - 6.5, -2);
      ctx.quadraticCurveTo(ex, 1.5, ex + 6.5, -2);
      ctx.stroke();
    } else {
      // Sclera
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.ellipse(ex, -2, 6.8, 4.6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Upper Eyelid Lash Shadow
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = isReza ? 1.8 : 2.3;
      ctx.beginPath();
      ctx.arc(ex, -1.5, 6.8, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();

      // Dark Brown/Obsidian Iris + Pupil
      ctx.fillStyle = '#291d18';
      ctx.beginPath();
      ctx.arc(ex + gazeX, -2, 3.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.arc(ex + gazeX, -2, 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Studio Catchlight Glint
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ex + gazeX + 1.1, -3.1, 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Sculpted Nose Bridge & Tip
  ctx.strokeStyle = 'rgba(138, 86, 58, 0.5)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(0, -4);
  ctx.lineTo(1.8, 10);
  ctx.lineTo(-2.5, 12.5);
  ctx.stroke();

  // Dynamic Animated Talking Mouth / Lip-Sync + Upper Teeth + Smile
  const mouthOpen = isSpeaking ? Math.max(1.2, speechEnvelope * 8.2) : 0;
  if (mouthOpen > 2.1) {
    // Open Talking Mouth Cavity
    ctx.fillStyle = '#6b1822';
    ctx.beginPath();
    ctx.ellipse(0, 24 + jawDrop * 0.35, 8.5 + Math.sin(t * 9 + phase) * 1.8, mouthOpen, 0, 0, Math.PI * 2);
    ctx.fill();

    // Upper Teeth Row
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-5.2, 24 + jawDrop * 0.35 - mouthOpen * 0.72, 10.4, 2.4);

    // Lip Border
    ctx.strokeStyle = isReza ? '#9c5b48' : '#b85d63';
    ctx.lineWidth = 1.6;
    ctx.stroke();
  } else {
    // Natural Conversational Lips / Warm Smile
    ctx.strokeStyle = isReza ? '#8a4d3d' : '#b2565e';
    ctx.lineWidth = isReza ? 2.4 : 2.8;
    ctx.beginPath();
    ctx.moveTo(-9, 23);
    ctx.quadraticCurveTo(0, 27.5, 9, 23);
    ctx.stroke();
  }

  ctx.restore(); // End Head
  ctx.restore(); // End Actor
}

export const PanduanVideoModal: React.FC<PanduanVideoModalProps> = ({
  isOpen,
  onClose,
  onLaunchFeature,
  initialBtcPrice,
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<1 | 1.5 | 2>(1);
  const [audioCueEnabled, setAudioCueEnabled] = useState(true);
  const [voiceNarrationEnabled, setVoiceNarrationEnabled] = useState(true);
  const [exportState, setExportState] = useState<'idle' | 'recording' | 'unsupported'>('idle');
  const [liveBtcHeader, setLiveBtcHeader] = useState<LiveBtcSnapshot>({
    price: initialBtcPrice && initialBtcPrice > 1000 ? initialBtcPrice : 88420,
    change24h: 0,
    high24h: 0,
    low24h: 0,
    tickDir: 'flat',
    lastTickMs: 0,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastTurnKeyRef = useRef<string>('');
  const currentTimeRef = useRef<number>(0);
  const liveBtcRef = useRef<LiveBtcSnapshot>(liveBtcHeader);

  useEffect(() => {
    if (initialBtcPrice && initialBtcPrice > 1000 && liveBtcRef.current.lastTickMs === 0) {
      const next: LiveBtcSnapshot = {
        ...liveBtcRef.current,
        price: initialBtcPrice,
        high24h: initialBtcPrice * 1.015,
        low24h: initialBtcPrice * 0.985,
      };
      liveBtcRef.current = next;
      setLiveBtcHeader(next);
    }
  }, [initialBtcPrice]);

  // Live Real-Time Bitcoin WebSocket + REST Feed
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    let ws: WebSocket | null = null;

    const applyBtcUpdate = (price: number, change24h: number, high24h?: number, low24h?: number) => {
      if (!price || price < 1000 || cancelled) return;
      const prevPrice = liveBtcRef.current.price;
      const tickDir: LiveBtcSnapshot['tickDir'] =
        price > prevPrice ? 'up' : price < prevPrice ? 'down' : liveBtcRef.current.tickDir;
      const next: LiveBtcSnapshot = {
        price,
        change24h,
        high24h: high24h || Math.max(price, liveBtcRef.current.high24h),
        low24h: low24h || (liveBtcRef.current.low24h > 0 ? Math.min(price, liveBtcRef.current.low24h) : price * 0.985),
        tickDir,
        lastTickMs: performance.now(),
      };
      liveBtcRef.current = next;
      setLiveBtcHeader(next);
    };

    fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT')
      .then((r) => r.json())
      .then((d) => {
        if (d?.lastPrice) {
          applyBtcUpdate(
            parseFloat(d.lastPrice),
            parseFloat(d.priceChangePercent),
            parseFloat(d.highPrice),
            parseFloat(d.lowPrice)
          );
        }
      })
      .catch(() => {
        fetch('/api/crypto/btc-cycle')
          .then((r) => r.json())
          .then((d) => {
            if (d?.price) applyBtcUpdate(d.price, d.change24h ?? 0);
          })
          .catch(() => {});
      });

    const connect = () => {
      try {
        ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
        ws.onmessage = (ev) => {
          if (cancelled) return;
          try {
            const d = JSON.parse(ev.data);
            const p = parseFloat(d.c);
            const chg = parseFloat(d.P);
            const hi = parseFloat(d.h);
            const lo = parseFloat(d.l);
            if (p > 1000) applyBtcUpdate(p, chg, hi, lo);
          } catch (_) {}
        };
        ws.onclose = () => {
          if (!cancelled) setTimeout(connect, 2500);
        };
      } catch (_) {}
    };

    connect();

    return () => {
      cancelled = true;
      if (ws) ws.close();
    };
  }, [isOpen]);

  const activeSection = useMemo(() => {
    return (
      TOOL_SECTIONS.find((c) => currentTime >= c.startSec && currentTime < c.endSec) ||
      TOOL_SECTIONS[TOOL_SECTIONS.length - 1]
    );
  }, [currentTime]);

  const activeTurnIndex: 0 | 1 = useMemo(() => {
    const local = currentTime - activeSection.startSec;
    return local < 5 ? 0 : 1;
  }, [activeSection, currentTime]);

  const activeTurn = activeSection.turns[activeTurnIndex];

  useEffect(() => {
    if (isOpen) {
      currentTimeRef.current = 0;
      setCurrentTime(0);
      setIsPlaying(true);
      lastTurnKeyRef.current = '';
    } else {
      setIsPlaying(false);
      try {
        window.speechSynthesis?.cancel();
      } catch (_) {}
    }
  }, [isOpen]);

  // Dual-Voice Speech Synthesis per 5s Turn
  useEffect(() => {
    if (!isOpen || !isPlaying) {
      try {
        window.speechSynthesis?.cancel();
      } catch (_) {}
      return;
    }

    const turnKey = `${activeSection.index}-${activeTurnIndex}`;
    if (turnKey !== lastTurnKeyRef.current) {
      lastTurnKeyRef.current = turnKey;

      if (audioCueEnabled && activeTurnIndex === 0) {
        try {
          sound.playClick(920 + activeSection.index * 42);
        } catch (_) {}
      }

      if (voiceNarrationEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const utter = new SpeechSynthesisUtterance(activeTurn.line);
          const voices = window.speechSynthesis.getVoices();
          const idVoice =
            voices.find((v) => v.lang.toLowerCase().startsWith('id')) ||
            voices.find((v) => v.lang.toLowerCase().includes('ms')) ||
            null;
          if (idVoice) utter.voice = idVoice;
          utter.lang = 'id-ID';
          utter.rate = Math.min(1.6, speed * 1.15);
          utter.pitch = activeTurn.speaker === 'Reza' ? 0.88 : 1.18;
          window.speechSynthesis.speak(utter);
        } catch (_) {}
      }
    }
  }, [activeSection.index, activeTurnIndex, activeTurn, audioCueEnabled, voiceNarrationEnabled, isOpen, isPlaying, speed]);

  // 60FPS Video Canvas Frame Renderer (2 Living Moving & Talking Characters + 12 Tools + Live BTC)
  const renderFrame = useCallback((t: number, playingNow: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1280;
    const H = 720;

    const section =
      TOOL_SECTIONS.find((c) => t >= c.startSec && t < c.endSec) ||
      TOOL_SECTIONS[TOOL_SECTIONS.length - 1];
    const localSec = Math.max(0, t - section.startSec);
    const localProgress = Math.max(0, Math.min(1, localSec / 10));
    const turnIdx: 0 | 1 = localSec < 5 ? 0 : 1;
    const turnLocalSec = turnIdx === 0 ? localSec : localSec - 5;
    const turn = section.turns[turnIdx];

    const isRezaSpeaking = playingNow && turn.speaker === 'Reza';
    const isNadiaSpeaking = playingNow && turn.speaker === 'Nadia';

    // Smooth camera focus shift between Reza and Nadia
    const enterEase = easeOutCubic(Math.min(1, localSec / 0.72));
    const exitEase = localSec > 9.5 ? easeInOutQuad((localSec - 9.5) / 0.5) : 0;
    const stageAlpha = Math.max(0.12, enterEase * (1 - exitEase * 0.7));

    const btc = liveBtcRef.current;
    const btcPriceStr = `$${btc.price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
    const btcChgStr = `${btc.change24h >= 0 ? '+' : ''}${btc.change24h.toFixed(2)}%`;
    const isBtcUp = btc.change24h >= 0;
    const tickRecently = performance.now() - btc.lastTickMs < 460;

    // 1. Studio Obsidian Cinema Set Backdrop + Volumetric Key Light
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, '#05080f');
    bgGrad.addColorStop(0.5, '#0b101d');
    bgGrad.addColorStop(1, '#04060c');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Subtle Studio Depth Grid
    ctx.strokeStyle = 'rgba(28, 39, 61, 0.34)';
    ctx.lineWidth = 1;
    const gridShift = (t * 14) % 64;
    for (let gx = -64 + gridShift; gx < W + 64; gx += 64) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, H);
      ctx.stroke();
    }
    for (let gy = 0; gy < H; gy += 64) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(W, gy);
      ctx.stroke();
    }

    // Sweeping Volumetric Studio Key Light
    const spotX = turn.speaker === 'Reza' ? 210 : 410;
    const spotGrad = ctx.createRadialGradient(spotX, 280, 20, spotX, 280, 440);
    spotGrad.addColorStop(0, 'rgba(212, 175, 55, 0.16)');
    spotGrad.addColorStop(0.55, 'rgba(30, 58, 138, 0.08)');
    spotGrad.addColorStop(1, 'rgba(7, 10, 17, 0)');
    ctx.fillStyle = spotGrad;
    ctx.fillRect(0, 0, W, H);

    // Ambient Bokeh Gold Dust Particles
    for (let i = 0; i < 20; i++) {
      const px = ((i * 199 + t * (16 + (i % 4) * 5)) % (W + 40)) - 20;
      const py = ((i * 131 + Math.sin(t + i) * 26) % H + H) % H;
      const rad = 1.2 + (i % 3) * 0.9;
      ctx.fillStyle = `rgba(231, 204, 130, ${0.12 + (i % 3) * 0.08})`;
      ctx.beginPath();
      ctx.arc(px, py, rad, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Top Real-Time BTC Telemetry Strip (clean, NO "Adegan" labels!)
    drawRoundedRect(ctx, 32, 18, W - 64, 50, 14);
    ctx.fillStyle = 'rgba(10, 15, 28, 0.9)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.42)';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    ctx.fillStyle = '#e7cc82';
    ctx.font = 'bold 15px ui-monospace, monospace';
    ctx.fillText('GHALI ON CHAIN · PANDUAN LENGKAP SEMUA TOOLS', 52, 48);

    // Real-Time BTC Live Pill inside Studio Top Bar
    drawRoundedRect(ctx, 560, 25, 340, 36, 11);
    ctx.fillStyle = tickRecently
      ? btc.tickDir === 'up'
        ? 'rgba(16, 185, 129, 0.22)'
        : 'rgba(244, 63, 94, 0.22)'
      : 'rgba(17, 25, 43, 0.95)';
    ctx.fill();
    ctx.strokeStyle = tickRecently
      ? btc.tickDir === 'up'
        ? '#34d399'
        : '#fb7185'
      : 'rgba(231, 204, 130, 0.45)';
    ctx.stroke();

    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.arc(579, 43, 4.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 13px ui-monospace, monospace';
    ctx.fillText('BTC LIVE', 592, 48);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 17px ui-monospace, monospace';
    ctx.fillText(btcPriceStr, 672, 48);

    ctx.fillStyle = isBtcUp ? '#34d399' : '#fb7185';
    ctx.font = 'bold 13px ui-monospace, monospace';
    ctx.fillText(btcChgStr, 804, 48);

    const timerText = `${formatClock(t)} / 02:00 · ${section.index < 10 ? '0' : ''}${section.index}/12`;
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '600 14px ui-monospace, monospace';
    ctx.fillText(timerText, W - 50 - ctx.measureText(timerText).width, 48);

    // 3. BOTH Moving & Talking Realistic Actors Standing Together on Studio Stage (Left Stage)
    const focusBoostReza = turn.speaker === 'Reza' ? 1.04 : 0.94;
    const focusBoostNadia = turn.speaker === 'Nadia' ? 1.04 : 0.94;

    // Subtle glass background desk arch behind both characters
    drawRoundedRect(ctx, 32, 92, 492, 456, 26);
    const duoBg = ctx.createLinearGradient(32, 92, 524, 548);
    duoBg.addColorStop(0, 'rgba(14, 21, 38, 0.72)');
    duoBg.addColorStop(1, 'rgba(7, 10, 17, 0.88)');
    ctx.fillStyle = duoBg;
    ctx.fill();
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.25)';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Draw listener slightly behind/smaller and active speaker subtly larger/brighter
    if (turn.speaker === 'Reza') {
      drawAnimatedActor(ctx, {
        actor: 'Nadia',
        cx: 392,
        cy: 500,
        scale: focusBoostNadia,
        t,
        isSpeaking: false,
        gesture: turn.gesture,
        lookAtPartner: true,
        activeGlow: 0.15,
      });
      drawAnimatedActor(ctx, {
        actor: 'Reza',
        cx: 170,
        cy: 512,
        scale: focusBoostReza,
        t,
        isSpeaking: isRezaSpeaking,
        gesture: turn.gesture,
        lookAtPartner: false,
        activeGlow: isRezaSpeaking ? 1 : 0.35,
      });
    } else {
      drawAnimatedActor(ctx, {
        actor: 'Reza',
        cx: 162,
        cy: 502,
        scale: focusBoostReza,
        t,
        isSpeaking: false,
        gesture: turn.gesture,
        lookAtPartner: true,
        activeGlow: 0.15,
      });
      drawAnimatedActor(ctx, {
        actor: 'Nadia',
        cx: 382,
        cy: 512,
        scale: focusBoostNadia,
        t,
        isSpeaking: isNadiaSpeaking,
        gesture: turn.gesture,
        lookAtPartner: false,
        activeGlow: isNadiaSpeaking ? 1 : 0.35,
      });
    }

    // Sleek Glass Studio Desk Foreground in front of Reza & Nadia
    const deskGrad = ctx.createLinearGradient(32, 478, 524, 548);
    deskGrad.addColorStop(0, 'rgba(15, 23, 42, 0.96)');
    deskGrad.addColorStop(1, 'rgba(6, 9, 16, 0.98)');
    drawRoundedRect(ctx, 32, 476, 492, 72, 20);
    ctx.fillStyle = deskGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(231, 204, 130, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Active Speaker Voice Indicator + Cast Name Badges on Studio Desk
    for (let b = 0; b < 5; b++) {
      const barH = playingNow ? 5 + Math.abs(Math.sin(t * 14 + b * 1.15)) * 14 : 4;
      ctx.fillStyle = turn.speaker === 'Reza' ? '#e7cc82' : '#34d399';
      drawRoundedRect(ctx, 54 + b * 7, 512 - barH / 2, 4, barH, 2);
      ctx.fill();
    }

    ctx.fillStyle = turn.speaker === 'Reza' ? '#f5e3af' : '#6ee7b7';
    ctx.font = 'bold 14px ui-monospace, monospace';
    ctx.fillText(
      `${turn.speaker.toUpperCase()} · ${turn.role.toUpperCase()}`,
      102,
      507
    );
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 12px ui-sans-serif, sans-serif';
    ctx.fillText(
      turn.speaker === 'Reza' ? 'Nadia mendengarkan & merespons langsung' : 'Reza menyimak & menganalisa chart',
      102,
      530
    );

    // 4. Right Stage: Interactive Holographic Feature Terminal (Animated per Tool Section)
    ctx.save();
    ctx.globalAlpha = stageAlpha;

    const sx = 548;
    const sy = 92;
    const sw = 700;
    const sh = 456;

    // Distinct smooth non-flat transition geometry
    let ox = 0;
    let oy = 0;
    let sScale = 1;
    switch (section.index % 4) {
      case 1:
        sScale = 0.94 + enterEase * 0.06 - exitEase * 0.04;
        oy = (1 - enterEase) * 24 - exitEase * 16;
        break;
      case 2:
        ox = (1 - enterEase) * 76 - exitEase * 52;
        break;
      case 3:
        sScale = 0.95 + enterEase * 0.05;
        oy = (1 - enterEase) * -20;
        break;
      case 0:
        ox = (1 - enterEase) * -60;
        sScale = 0.94 + enterEase * 0.06;
        break;
    }

    const px = sx + sw / 2;
    const py = sy + sh / 2;
    ctx.translate(px + ox, py + oy);
    ctx.scale(sScale, sScale);
    ctx.translate(-px, -py);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.58)';
    ctx.shadowBlur = 32;
    drawRoundedRect(ctx, sx, sy, sw, sh, 26);
    const boardGrad = ctx.createLinearGradient(sx, sy, sx + sw, sy + sh);
    boardGrad.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
    boardGrad.addColorStop(1, 'rgba(7, 10, 18, 0.97)');
    ctx.fillStyle = boardGrad;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Specular Sweep across Board Glass
    if (localSec < 1.1) {
      ctx.save();
      drawRoundedRect(ctx, sx, sy, sw, sh, 26);
      ctx.clip();
      const sheenX = sx - 200 + (localSec / 1.1) * (sw + 400);
      const sheen = ctx.createLinearGradient(sheenX, sy, sheenX + 150, sy + sh);
      sheen.addColorStop(0, 'rgba(245, 227, 175, 0)');
      sheen.addColorStop(0.5, 'rgba(245, 227, 175, 0.12)');
      sheen.addColorStop(1, 'rgba(245, 227, 175, 0)');
      ctx.fillStyle = sheen;
      ctx.fillRect(sx, sy, sw, sh);
      ctx.restore();
    }

    // Clean Tool Title & Subtitle (NO "Adegan" text!)
    ctx.fillStyle = '#e7cc82';
    ctx.font = 'bold 13px ui-monospace, monospace';
    ctx.fillText(
      `TOOL ${section.index < 10 ? '0' : ''}${section.index} · ${section.subtitle.toUpperCase()}`,
      sx + 28,
      sy + 36
    );
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px ui-sans-serif, system-ui, sans-serif';
    ctx.fillText(section.title, sx + 28, sy + 72);

    const ix = sx + 28;
    const iy = sy + 94;
    const iw = sw - 56;
    const ih = 336;
    drawRoundedRect(ctx, ix, iy, iw, ih, 18);
    ctx.fillStyle = 'rgba(5, 8, 15, 0.88)';
    ctx.fill();
    ctx.strokeStyle = '#1b263c';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    const icx = ix + iw / 2;
    const icy = iy + ih / 2;

    // 12 Distinct Animated Tool Visualizations (all using Real-Time BTC Price where applicable)
    if (section.index === 1) {
      // 1. 3D Monolith + 10 Orbit Altcoins
      const ang = t * 1.35;
      ctx.save();
      ctx.translate(icx, icy);
      ctx.strokeStyle = 'rgba(231, 204, 130, 0.36)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 220, 78, -0.14, 0, Math.PI * 2);
      ctx.stroke();

      const r = 68;
      const pts = [
        [Math.cos(ang) * r, -54],
        [Math.cos(ang + Math.PI / 2) * r, -6],
        [Math.cos(ang + Math.PI) * r, 46],
        [Math.cos(ang + (3 * Math.PI) / 2) * r, -6],
      ];
      ctx.fillStyle = 'rgba(212, 175, 55, 0.16)';
      ctx.strokeStyle = '#f5e3af';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      pts.forEach(([px0, py0], i) => (i === 0 ? ctx.moveTo(px0, py0) : ctx.lineTo(px0, py0)));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px ui-monospace, monospace';
      ctx.fillText(btcPriceStr, -ctx.measureText(btcPriceStr).width / 2, 5);

      ['ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'SUI', 'AVAX', 'LINK', 'TAO', 'ADA'].forEach((sym, i) => {
        const a = ang * 0.78 + (i * Math.PI * 2) / 10;
        const ox0 = Math.cos(a) * 220;
        const oy0 = Math.sin(a) * 78;
        ctx.fillStyle = i % 2 === 0 ? '#34d399' : '#e7cc82';
        ctx.beginPath();
        ctx.arc(ox0, oy0, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 11px ui-monospace, monospace';
        ctx.fillText(sym, ox0 + 9, oy0 + 4);
      });
      ctx.restore();
    } else if (section.index === 2) {
      // 2. AI Auto-Draw Candlestick + Fib + Elliott Wave + SnR + ICT
      const bx = ix + 28;
      const by = iy + ih - 28;
      const bars = [
        [0.32, 0.48], [0.47, 0.41], [0.42, 0.59], [0.58, 0.52], [0.53, 0.69],
        [0.68, 0.63], [0.64, 0.81], [0.80, 0.74], [0.75, 0.90], [0.89, 0.84],
        [0.85, 0.95], [0.94, isBtcUp ? 0.99 : 0.88],
      ];
      const count = Math.max(4, Math.floor(localProgress * bars.length) + 4);
      bars.slice(0, Math.min(bars.length, count)).forEach(([o, c], idx) => {
        const x = bx + idx * 46;
        const yO = by - o * 246;
        const yC = by - c * 246;
        const bull = c >= o;
        ctx.strokeStyle = bull ? '#34d399' : '#fb7185';
        ctx.fillStyle = bull ? '#34d399' : '#fb7185';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 10, Math.min(yO, yC) - 12);
        ctx.lineTo(x + 10, Math.max(yO, yC) + 12);
        ctx.stroke();
        ctx.fillRect(x, Math.min(yO, yC), 20, Math.max(9, Math.abs(yC - yO)));
      });

      // ICT Order Block Highlight
      ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.fillRect(bx, by - 140, iw - 56, 28);
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 11px ui-monospace, monospace';
      ctx.fillText('ICT ORDER BLOCK', bx + 8, by - 122);

      ctx.setLineDash([7, 5]);
      ctx.strokeStyle = 'rgba(231, 204, 130, 0.85)';
      [
        { lvl: '0.382', pct: 0.78, p: btc.price * 0.985 },
        { lvl: '0.618', pct: 0.52, p: btc.price * 0.958 },
      ].forEach((f) => {
        const fy = by - f.pct * 246;
        ctx.beginPath();
        ctx.moveTo(bx, fy);
        ctx.lineTo(ix + iw - 24, fy);
        ctx.stroke();
        ctx.fillStyle = '#f5e3af';
        ctx.fillText(`FIB ${f.lvl} · $${Math.round(f.p).toLocaleString()}`, ix + iw - 196, fy - 6);
      });
      ctx.setLineDash([]);
    } else if (section.index === 3) {
      // 3. Bitcoin Cycle Live ATH Gauge + 2026 Experts
      const ath = 108900;
      const distPct = (((btc.price - ath) / ath) * 100).toFixed(1);
      const fillPct = Math.max(0.2, Math.min(1, (btc.price / ath) * (0.65 + localProgress * 0.35)));
      ctx.fillStyle = '#e7cc82';
      ctx.font = 'bold 14px ui-monospace, monospace';
      ctx.fillText('HARGA BITCOIN REAL-TIME & JARAK ATH', ix + 26, iy + 36);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 40px ui-monospace, monospace';
      ctx.fillText(btcPriceStr, ix + 26, iy + 86);
      ctx.fillStyle = isBtcUp ? '#34d399' : '#fb7185';
      ctx.font = 'bold 16px ui-monospace, monospace';
      ctx.fillText(`${btcChgStr} · Jarak ke ATH ($108,900): ${distPct}%`, ix + 26, iy + 116);

      drawRoundedRect(ctx, ix + 26, iy + 136, iw - 52, 20, 10);
      ctx.fillStyle = '#121a2d';
      ctx.fill();
      drawRoundedRect(ctx, ix + 26, iy + 136, (iw - 52) * fillPct, 20, 10);
      ctx.fillStyle = '#e7cc82';
      ctx.fill();

      ['Willy Woo', 'Arthur Hayes', 'PlanB', 'B. Cowen'].forEach((exp, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const bx = ix + 26 + col * 300;
        const by = iy + 178 + row * 68;
        const active = i === Math.floor(localProgress * 4) % 4;
        drawRoundedRect(ctx, bx, by, 286, 56, 12);
        ctx.fillStyle = active ? '#17233b' : '#0f1627';
        ctx.fill();
        ctx.strokeStyle = active ? '#e7cc82' : '#24314a';
        ctx.stroke();
        ctx.fillStyle = '#f5e3af';
        ctx.font = 'bold 15px ui-sans-serif, sans-serif';
        ctx.fillText(exp, bx + 16, by + 26);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '400 11px ui-sans-serif, sans-serif';
        ctx.fillText('Dossier Konsensus Siklus 2026', bx + 16, by + 44);
      });
    } else if (section.index === 4) {
      // 4. Liquidity Flow + Top 5 Altcoin L/S
      ['STABLECOIN', 'BITCOIN', 'ETH / SOL', 'ALTCOINS'].forEach((st, i) => {
        const bx = ix + 22 + i * 150;
        drawRoundedRect(ctx, bx, iy + 26, 138, 44, 10);
        ctx.fillStyle = i <= Math.floor(localProgress * 4) ? '#1a253d' : '#0f1627';
        ctx.fill();
        ctx.strokeStyle = i <= Math.floor(localProgress * 4) ? '#e7cc82' : '#222f48';
        ctx.stroke();
        ctx.fillStyle = '#f5e3af';
        ctx.font = 'bold 12px ui-monospace, monospace';
        ctx.fillText(st, bx + 16, iy + 53);
      });

      [
        { s: 'ETH/USDT', l: 64, sh: 36 },
        { s: 'SOL/USDT', l: 71, sh: 29 },
        { s: 'BNB/USDT', l: 58, sh: 42 },
      ].forEach((p, idx) => {
        const py = iy + 114 + idx * 72;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px ui-monospace, monospace';
        ctx.fillText(p.s, ix + 26, py);
        ctx.fillStyle = '#34d399';
        ctx.fillText(`LONG ${p.l}%`, ix + 170, py);
        ctx.fillStyle = '#fb7185';
        ctx.fillText(`SHORT ${p.sh}%`, ix + iw - 126, py);
        drawRoundedRect(ctx, ix + 26, py + 12, iw - 52, 12, 6);
        ctx.fillStyle = '#fb7185';
        ctx.fill();
        drawRoundedRect(ctx, ix + 26, py + 12, ((iw - 52) * p.l) / 100 * Math.min(1, localProgress * 1.4 + 0.35), 12, 6);
        ctx.fillStyle = '#34d399';
        ctx.fill();
      });
    } else if (section.index === 5) {
      // 5. Top Movers (Gainers & Losers 24J)
      [
        { sym: 'SUI/USDT', chg: '+18.4%', bull: true },
        { sym: 'TAO/USDT', chg: '+14.2%', bull: true },
        { sym: 'SOL/USDT', chg: '+9.6%', bull: true },
        { sym: 'DOGE/USDT', chg: '-6.8%', bull: false },
      ].forEach((m, idx) => {
        const my = iy + 26 + idx * 72;
        drawRoundedRect(ctx, ix + 24, my, iw - 48, 58, 12);
        ctx.fillStyle = '#0e1526';
        ctx.fill();
        ctx.strokeStyle = m.bull ? 'rgba(52, 211, 153, 0.4)' : 'rgba(251, 113, 133, 0.4)';
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px ui-monospace, monospace';
        ctx.fillText(m.sym, ix + 44, my + 35);
        ctx.fillStyle = m.bull ? '#34d399' : '#fb7185';
        ctx.fillText(m.chg, ix + 260, my + 35);
        ctx.fillStyle = '#e7cc82';
        ctx.font = 'bold 12px ui-monospace, monospace';
        ctx.fillText('TAP -> BUKA CHART', ix + iw - 180, my + 34);
      });
    } else if (section.index === 6) {
      // 6. Exchange L/S Binance vs Bitget
      const sweep = -Math.PI + Math.PI * (0.3 + Math.sin(localProgress * Math.PI) * 0.5);
      ctx.save();
      ctx.translate(icx, icy + 36);
      ctx.lineWidth = 20;
      ctx.strokeStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(0, 0, 118, Math.PI, Math.PI * 1.35);
      ctx.stroke();
      ctx.strokeStyle = '#e7cc82';
      ctx.beginPath();
      ctx.arc(0, 0, 118, Math.PI * 1.35, Math.PI * 1.68);
      ctx.stroke();
      ctx.strokeStyle = '#fb7185';
      ctx.beginPath();
      ctx.arc(0, 0, 118, Math.PI * 1.68, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(sweep) * 98, Math.sin(sweep) * 98);
      ctx.stroke();
      ctx.fillStyle = '#e7cc82';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#f5e3af';
      ctx.font = 'bold 15px ui-monospace, monospace';
      ctx.fillText('BINANCE vs BITGET · SKEW & FUNDING RATE', icx - 180, iy + ih - 24);
    } else if (section.index === 7) {
      // 7. Berita 24J, Prioritas & Bedah AI
      [
        { t: 'HIGH IMPACT · MAKRO', h: 'Sinyal Kebijakan Bank Sentral Picu Volatilitas BTC' },
        { t: 'CRYPTO 24J · COINDESK', h: 'Arus Masuk Spot ETF Menopang Struktur Bullish' },
        { t: 'BEDAH AI · OTOMATIS', h: 'Ringkasan Katalis, Bias Aset & Skenario Teknikal' },
      ].forEach((n, idx) => {
        const ny = iy + 28 + idx * 96 - localProgress * 8;
        drawRoundedRect(ctx, ix + 24, ny, iw - 48, 80, 14);
        ctx.fillStyle = idx === 2 ? '#13242b' : '#0d1424';
        ctx.fill();
        ctx.strokeStyle = idx === 2 ? '#34d399' : '#24314a';
        ctx.stroke();
        ctx.fillStyle = idx === 2 ? '#34d399' : '#e7cc82';
        ctx.font = 'bold 12px ui-monospace, monospace';
        ctx.fillText(n.t, ix + 44, ny + 28);
        ctx.fillStyle = '#f8fafc';
        ctx.font = '600 15px ui-sans-serif, sans-serif';
        ctx.fillText(n.h, ix + 44, ny + 56);
      });
    } else if (section.index === 8) {
      // 8. Narratives 24J & Macro Impact Matrix
      ['AI TOKENS +11.4%', 'RWA +7.8%', 'LAYER-1 +6.1%'].forEach((sec, i) => {
        const bx = ix + 22 + i * 202;
        drawRoundedRect(ctx, bx, iy + 24, 188, 70, 12);
        ctx.fillStyle = '#121a2e';
        ctx.fill();
        ctx.strokeStyle = '#d4af37';
        ctx.stroke();
        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 13px ui-monospace, monospace';
        ctx.fillText(sec, bx + 16, iy + 64);
      });
      [
        { pair: 'DXY vs BTC', corr: 'NEGATIF KUAT (-0.82)', col: '#fb7185' },
        { pair: 'EMAS vs BTC', corr: 'KONSOLIDASI (+0.44)', col: '#e7cc82' },
        { pair: 'NASDAQ vs BTC', corr: 'RISK-ON SEJALAN (+0.78)', col: '#34d399' },
      ].forEach((row, idx) => {
        const ry = iy + 124 + idx * 64;
        drawRoundedRect(ctx, ix + 22, ry, iw - 44, 52, 12);
        ctx.fillStyle = '#0d1424';
        ctx.fill();
        ctx.strokeStyle = '#222f48';
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px ui-monospace, monospace';
        ctx.fillText(row.pair, ix + 40, ry + 31);
        ctx.fillStyle = row.col;
        ctx.fillText(row.corr, ix + 250, ry + 31);
      });
    } else if (section.index === 9) {
      // 9. Suite Teknikal & Radar Kontra
      [
        { name: 'RSI (14)', val: '62.4 · BULLISH MOMENTUM', col: '#34d399' },
        { name: 'MACD (12,26)', val: 'GOLDEN CROSS AKTIF', col: '#e7cc82' },
        { name: 'RADAR DISLOKASI', val: 'DEVIASI MAKRO TERPANTAU', col: '#38bdf8' },
      ].forEach((ind, idx) => {
        const ry = iy + 32 + idx * 94;
        drawRoundedRect(ctx, ix + 26, ry, iw - 52, 76, 14);
        ctx.fillStyle = '#0f1627';
        ctx.fill();
        ctx.strokeStyle = ind.col;
        ctx.stroke();
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 12px ui-monospace, monospace';
        ctx.fillText(ind.name, ix + 46, ry + 28);
        ctx.fillStyle = ind.col;
        ctx.font = 'bold 17px ui-monospace, monospace';
        ctx.fillText(ind.val, ix + 46, ry + 55);
      });
    } else if (section.index === 10) {
      // 10. Whale Desk (Dompet Smart Money)
      [
        { tag: 'INFLOW BURSA', amt: '1,240 BTC -> BINANCE', bias: 'WASPADA TEKANAN JUAL', c: '#fb7185' },
        { tag: 'OUTFLOW COLD WALLET', amt: '2,850 BTC -> COLD STORAGE', bias: 'AKUMULASI SMART MONEY', c: '#34d399' },
        { tag: 'KOL / SMART WALLET', amt: 'AKUMULASI ETH & SOL', bias: 'KLIK UNTUK LOAD CHART', c: '#e7cc82' },
      ].forEach((w, idx) => {
        const wy = iy + 30 + idx * 94;
        drawRoundedRect(ctx, ix + 24, wy, iw - 48, 76, 14);
        ctx.fillStyle = '#0e1526';
        ctx.fill();
        ctx.strokeStyle = w.c;
        ctx.stroke();
        ctx.fillStyle = w.c;
        ctx.font = 'bold 12px ui-monospace, monospace';
        ctx.fillText(w.tag, ix + 42, wy + 26);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px ui-monospace, monospace';
        ctx.fillText(w.amt, ix + 42, wy + 52);
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '600 12px ui-sans-serif, sans-serif';
        ctx.fillText(w.bias, ix + iw - 230, wy + 52);
      });
    } else if (section.index === 11) {
      // 11. Price Alerts (Alarm Cekring Live)
      [0, 1, 2].forEach((ring) => {
        const rad = ((localProgress * 160 + ring * 45) % 130) + 18;
        ctx.strokeStyle = `rgba(52, 211, 153, ${1 - rad / 150})`;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(icx, icy - 26, rad, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.fillStyle = '#e7cc82';
      ctx.beginPath();
      ctx.arc(icx, icy - 26, 18, 0, Math.PI * 2);
      ctx.fill();

      drawRoundedRect(ctx, ix + 34, iy + ih - 78, iw - 68, 58, 14);
      ctx.fillStyle = '#121b30';
      ctx.fill();
      ctx.strokeStyle = '#34d399';
      ctx.stroke();
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 15px ui-monospace, monospace';
      ctx.fillText(`ALARM CEKRING AKTIF · TARGET LIVE BTC ${btcPriceStr}`, ix + 64, iy + ih - 43);
    } else {
      // 12. 8-API Live Telemetry + Room Chat
      [
        { n: 'BINANCE WS', p: btc.price },
        { n: 'KRAKEN SPOT', p: btc.price + 3.4 },
        { n: 'COINBASE PRO', p: btc.price - 2.15 },
      ].forEach((ex, i) => {
        const exX = ix + 20 + i * 202;
        drawRoundedRect(ctx, exX, iy + 24, 190, 86, 14);
        ctx.fillStyle = '#0e1526';
        ctx.fill();
        ctx.strokeStyle = '#24324e';
        ctx.stroke();
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 12px ui-monospace, monospace';
        ctx.fillText(ex.n, exX + 16, iy + 52);
        ctx.fillStyle = '#f5e3af';
        ctx.font = 'bold 18px ui-monospace, monospace';
        ctx.fillText(`$${ex.p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, exX + 16, iy + 84);
      });

      drawRoundedRect(ctx, ix + 20, iy + 132, iw - 40, 174, 16);
      ctx.fillStyle = '#121a2e';
      ctx.fill();
      ctx.strokeStyle = '#d4af37';
      ctx.stroke();
      ctx.fillStyle = '#e7cc82';
      ctx.font = 'bold 19px ui-sans-serif, sans-serif';
      ctx.fillText('Room Chat Komunitas · Berbagi Setup Real-Time', ix + 44, iy + 174);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '400 15px ui-sans-serif, sans-serif';
      wrapText(
        ctx,
        'Diskusikan hasil AI Chart, sinyal Whale Desk, dan berita makro langsung bersama trader lainnya di Room Chat.',
        ix + 44,
        iy + 210,
        iw - 88,
        24
      );
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 14px ui-monospace, monospace';
      ctx.fillText('SELURUH 12 TOOLS SIAP DIGUNAKAN', ix + 44, iy + 280);
    }

    ctx.restore(); // End Right Stage Hologram

    // 5. Crisp Live Dialogue Caption Box across Bottom (Both Speakers Moving & Speaking)
    const subSlide = easeOutCubic(Math.min(1, turnLocalSec / 0.35));
    drawRoundedRect(ctx, 32, 566 + (1 - subSlide) * 10, W - 64, 114, 18);
    ctx.fillStyle = 'rgba(10, 15, 28, 0.94)';
    ctx.fill();
    ctx.strokeStyle = turn.speaker === 'Reza' ? 'rgba(231, 204, 130, 0.5)' : 'rgba(52, 211, 153, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = turn.speaker === 'Reza' ? '#f5e3af' : '#6ee7b7';
    ctx.font = 'bold 14px ui-monospace, monospace';
    ctx.fillText(`${turn.speaker.toUpperCase()} (${turn.role.toUpperCase()}):`, 56, 598);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '500 19px ui-sans-serif, system-ui, sans-serif';
    wrapText(ctx, `"${turn.line}"`, 56, 630, W - 112, 27);

    // 6. Scene-Edge Non-Flat Wipe Transitions (first 0.48s of each tool section)
    if (localSec < 0.48 && section.index > 1) {
      const wt = easeOutCubic(localSec / 0.48);
      ctx.save();
      if (section.transitionStyle === 'light_leak') {
        const lx = -320 + wt * (W + 640);
        const lg = ctx.createLinearGradient(lx, 0, lx + 260, H);
        lg.addColorStop(0, 'rgba(212, 175, 55, 0)');
        lg.addColorStop(0.5, `rgba(245, 227, 175, ${(1 - wt) * 0.34})`);
        lg.addColorStop(1, 'rgba(212, 175, 55, 0)');
        ctx.fillStyle = lg;
        ctx.fillRect(lx, 0, 260, H);
      } else if (section.transitionStyle === 'whip_pan') {
        ctx.fillStyle = `rgba(231, 204, 130, ${(1 - wt) * 0.22})`;
        ctx.fillRect(W * (1 - wt), 0, 40, H);
      } else if (section.transitionStyle === 'iris') {
        ctx.strokeStyle = `rgba(231, 204, 130, ${(1 - wt) * 0.58})`;
        ctx.lineWidth = 10 * (1 - wt);
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, 100 + wt * 680, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        const curH = H * 0.12 * (1 - wt);
        ctx.fillStyle = 'rgba(4, 6, 12, 0.72)';
        ctx.fillRect(0, 0, W, curH);
        ctx.fillRect(0, H - curH, W, curH);
      }
      ctx.restore();
    }

    // 7. Bottom Master Progress Bar
    ctx.fillStyle = '#131b2e';
    ctx.fillRect(32, H - 20, W - 64, 5);
    ctx.fillStyle = '#e7cc82';
    ctx.fillRect(32, H - 20, ((W - 64) * t) / TOTAL_DURATION, 5);
  }, []);

  // 60FPS Continuous Animation Loop
  useEffect(() => {
    if (!isOpen) return;
    let rafId = 0;
    let prevTs = performance.now();

    const tick = (now: number) => {
      const realDt = Math.min(0.05, (now - prevTs) / 1000);
      prevTs = now;

      if (isPlaying) {
        const next = currentTimeRef.current + realDt * speed;
        if (next >= TOTAL_DURATION) {
          currentTimeRef.current = TOTAL_DURATION;
          setCurrentTime(TOTAL_DURATION);
          setIsPlaying(false);
        } else {
          currentTimeRef.current = next;
          setCurrentTime(next);
        }
      }

      renderFrame(currentTimeRef.current, isPlaying);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isOpen, isPlaying, speed, renderFrame]);

  const handleSeek = (sec: number) => {
    const clamped = Math.max(0, Math.min(TOTAL_DURATION, sec));
    currentTimeRef.current = clamped;
    setCurrentTime(clamped);
    lastTurnKeyRef.current = '';
    renderFrame(clamped, isPlaying);
  };

  const handleTogglePlay = () => {
    sound.playClick();
    if (currentTimeRef.current >= TOTAL_DURATION) {
      currentTimeRef.current = 0;
      setCurrentTime(0);
      lastTurnKeyRef.current = '';
      setIsPlaying(true);
    } else {
      setIsPlaying((p) => !p);
    }
  };

  const handleReplay = () => {
    sound.playClick();
    currentTimeRef.current = 0;
    setCurrentTime(0);
    lastTurnKeyRef.current = '';
    setIsPlaying(true);
  };

  const handleDownloadWebm = () => {
    const canvas = canvasRef.current;
    if (!canvas || typeof MediaRecorder === 'undefined' || !canvas.captureStream) {
      setExportState('unsupported');
      return;
    }

    try {
      sound.playClick();
      setExportState('recording');
      const stream = canvas.captureStream(30);
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) chunks.push(ev.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'panduan-lengkap-ghali-on-chain-2m.webm';
        a.click();
        URL.revokeObjectURL(url);
        setExportState('idle');
      };

      currentTimeRef.current = 0;
      setCurrentTime(0);
      lastTurnKeyRef.current = '';
      setSpeed(1);
      setIsPlaying(true);
      recorder.start();

      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      }, TOTAL_DURATION * 1000 + 250);
    } catch {
      setExportState('unsupported');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-6 bg-black/85 backdrop-blur-sm">
      <div className="bg-[#070a11] border-t md:border border-[#d4af37]/50 md:border-[#253350] rounded-t-3xl md:rounded-3xl w-full md:max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 animate-content-rise">
        <div className="md:hidden w-10 h-1 rounded-full bg-slate-600/70 mx-auto mt-2.5 shrink-0" />

        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-[#1b263c] bg-[#0a0f1c] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#f2d98a] to-[#c4972c] text-[#080b12] flex items-center justify-center shrink-0">
              <Film className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-semibold text-[#f5e3af] truncate">
                Video Panduan Lengkap 2 Menit · Semua Tools
              </h2>
              <p className="text-[11px] text-slate-400 truncate font-mono tabular-nums">
                BTC Live: ${liveBtcHeader.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                <span className={liveBtcHeader.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  ({liveBtcHeader.change24h >= 0 ? '+' : ''}{liveBtcHeader.change24h.toFixed(2)}%)
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadWebm}
              disabled={exportState === 'recording'}
              className="hidden sm:inline-flex items-center gap-1.5 min-h-[38px] px-3 rounded-xl bg-[#121a2d] hover:bg-[#19243d] border border-[#253350] text-xs font-medium text-[#e7cc82] cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>
                {exportState === 'recording'
                  ? 'Merekam 2m...'
                  : exportState === 'unsupported'
                  ? 'Tidak Didukung'
                  : 'Unduh Video'}
              </span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              aria-label="Tutup panduan video"
              className="min-h-[40px] min-w-[40px] rounded-xl bg-[#121a2d] hover:bg-[#1a2540] border border-[#253350] text-slate-300 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Video Player + All 12 Tools Chapters */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="rounded-2xl overflow-hidden border border-[#24314c] bg-[#04060b] shadow-2xl">
            <div className="relative w-full aspect-video bg-[#04060b]">
              <canvas
                ref={canvasRef}
                width={1280}
                height={720}
                onClick={handleTogglePlay}
                className="w-full h-full object-contain cursor-pointer block"
              />
            </div>

            {/* Transport Controls */}
            <div className="px-3.5 py-2.5 bg-[#0a0f1c] border-t border-[#1b263c] space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono tabular-nums text-[#e7cc82] w-10 shrink-0">
                  {formatClock(currentTime)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={TOTAL_DURATION}
                  step={0.1}
                  value={currentTime}
                  onChange={(e) => handleSeek(parseFloat(e.target.value))}
                  aria-label="Timeline video panduan 2 menit"
                  className="flex-1 accent-[#e7cc82] h-1.5 bg-[#192338] rounded-lg cursor-pointer"
                />
                <span className="text-[11px] font-mono tabular-nums text-slate-400 w-10 text-right shrink-0">
                  02:00
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleTogglePlay}
                    className="min-h-[40px] px-3.5 rounded-xl bg-gradient-to-br from-[#f2d98a] to-[#c4972c] text-[#080b12] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? 'Jeda' : currentTime >= TOTAL_DURATION ? 'Putar Ulang' : 'Putar'}</span>
                  </button>

                  <button
                    onClick={handleReplay}
                    aria-label="Ulang dari detik ke-0"
                    className="min-h-[40px] min-w-[40px] rounded-xl bg-[#11192b] border border-[#24314a] text-slate-200 flex items-center justify-center cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setSpeed((prev) => (prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1));
                    }}
                    className="min-h-[40px] px-3 rounded-xl bg-[#11192b] border border-[#24314a] text-xs font-mono font-semibold text-[#e7cc82] cursor-pointer tabular-nums"
                  >
                    {speed}x
                  </button>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => setVoiceNarrationEnabled((v) => !v)}
                    aria-label="Toggle suara dialog karakter"
                    className={`min-h-[40px] px-2.5 sm:px-3 rounded-xl border text-xs inline-flex items-center gap-1.5 cursor-pointer ${
                      voiceNarrationEnabled
                        ? 'bg-[#17223a] border-[#d4af37]/45 text-[#f5e3af]'
                        : 'bg-[#11192b] border-[#24314a] text-slate-400'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">
                      {voiceNarrationEnabled ? 'Dialog 2 Suara' : 'Dialog Bisu'}
                    </span>
                  </button>

                  <button
                    onClick={() => setAudioCueEnabled((v) => !v)}
                    aria-label="Toggle efek transisi bab"
                    className="min-h-[40px] min-w-[40px] px-2.5 rounded-xl bg-[#11192b] border border-[#24314a] text-xs text-slate-300 inline-flex items-center justify-center cursor-pointer"
                  >
                    {audioCueEnabled ? (
                      <Volume2 className="w-4 h-4 text-[#e7cc82]" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-slate-500" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      onLaunchFeature(activeSection.target);
                      onClose();
                    }}
                    className="min-h-[40px] px-3 sm:px-3.5 rounded-xl bg-[#17223a] border border-[#d4af37]/45 text-xs font-semibold text-[#f5e3af] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#e7cc82]" />
                    <span>Buka {activeSection.shortTitle}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#e7cc82]" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* All 12 Tools Chapters Grid (12 × 10 Detik = 2 Menit) */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-white">
                Penjelasan Lengkap 12 Tools (Total 2 Menit · 02:00)
              </h3>
              <span className="text-[11px] text-slate-400">Ketuk kartu untuk lompat ke tool</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {TOOL_SECTIONS.map((sec) => {
                const isActive = activeSection.id === sec.id;
                return (
                  <div
                    key={sec.id}
                    className={`rounded-2xl border p-3 transition-all flex flex-col justify-between gap-2.5 ${
                      isActive
                        ? 'bg-[#121a2e] border-[#d4af37] shadow-lg'
                        : 'bg-[#0b101d] border-[#1d283f] hover:border-[#2d3e5e]'
                    }`}
                  >
                    <button
                      onClick={() => {
                        sound.playClick();
                        handleSeek(sec.startSec);
                        setIsPlaying(true);
                      }}
                      className="text-left space-y-1 cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono tabular-nums">
                        <span className={isActive ? 'text-[#e7cc82] font-bold' : 'text-slate-400'}>
                          {formatClock(sec.startSec)}–{formatClock(sec.endSec)}
                        </span>
                        <span className="text-slate-500">
                          {sec.index < 10 ? '0' : ''}
                          {sec.index}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-white leading-snug">
                        {sec.title}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-2">
                        {sec.subtitle}
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        sound.playClick();
                        onLaunchFeature(sec.target);
                        onClose();
                      }}
                      className="min-h-[34px] px-2.5 rounded-xl bg-[#070a11] hover:bg-[#17223a] border border-[#1f2b44] text-[11px] font-medium text-[#e7cc82] inline-flex items-center justify-between cursor-pointer"
                    >
                      <span>Buka Tool</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
