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
  | 'exchange_ls'
  | 'macro_terminal'
  | 'whale'
  | 'telemetry';

interface GuideChapter {
  id: string;
  index: number;
  startSec: number;
  endSec: number;
  title: string;
  shortTitle: string;
  subtitle: string;
  narration: string;
  gestureMode: 'point_high' | 'trace_chart' | 'present_open' | 'compare_hands' | 'brief_tablet' | 'radar_wave' | 'finale';
  target: GuideFeatureTarget;
}

const TOTAL_DURATION = 40;

const CHAPTERS: GuideChapter[] = [
  {
    id: 'home-monolith',
    index: 1,
    startSec: 0,
    endSec: 5,
    title: 'Beranda SuperApp & 3D Monolith',
    shortTitle: '3D Monolith',
    subtitle: 'Navigasi Cepat Desktop & Mobile',
    narration: 'Selamat datang di Ghali On Chain! Pantau 3D Monolith dan 10 orbit altcoin 5 menit secara langsung.',
    gestureMode: 'point_high',
    target: 'monolith',
  },
  {
    id: 'ai-chart',
    index: 2,
    startSec: 5,
    endSec: 10,
    title: 'AI Auto-Draw Candlestick',
    shortTitle: 'AI Chart',
    subtitle: 'Fibonacci · Elliott Wave · Trendline · ICT · SnR',
    narration: 'Di AI Chart, gambar Fibonacci, Elliott Wave, Trendline, ICT, dan SnR otomatis di atas candle Binance live.',
    gestureMode: 'trace_chart',
    target: 'multichart',
  },
  {
    id: 'btc-cycle',
    index: 3,
    startSec: 10,
    endSec: 15,
    title: 'Bitcoin Cycle & Pakar 2026',
    shortTitle: 'BTC Cycle',
    subtitle: 'Harga Live, ATH Meter & Dossier Pakar',
    narration: 'Cek posisi siklus Bitcoin terhadap rekor tertinggi dan baca dossier Willy Woo, Arthur Hayes, PlanB, hingga Cowen.',
    gestureMode: 'present_open',
    target: 'bitcoin_cycle',
  },
  {
    id: 'liquidity-movers',
    index: 4,
    startSec: 15,
    endSec: 20,
    title: 'Likuiditas, Movers & Top 5 L/S',
    shortTitle: 'Likuiditas',
    subtitle: 'Rotasi Modal & Futures Real-Time',
    narration: 'Lacak aliran modal antar sektor kripto, Top Gainers dan Losers 24 jam, serta rasio Long Short top 5 altcoin.',
    gestureMode: 'compare_hands',
    target: 'liquidity_movers',
  },
  {
    id: 'exchange-ls',
    index: 5,
    startSec: 20,
    endSec: 25,
    title: 'Exchange L/S & Radar Kontra',
    shortTitle: 'Exchange L/S',
    subtitle: 'Deteksi Crowding Binance & Bitget',
    narration: 'Temukan penumpukan posisi ritel yang ekstrem di Binance dan Bitget untuk membaca potensi pembalikan arah pasar.',
    gestureMode: 'compare_hands',
    target: 'exchange_ls',
  },
  {
    id: 'news-narratives',
    index: 6,
    startSec: 25,
    endSec: 30,
    title: 'Berita 24J, Narasi & Bedah AI',
    shortTitle: 'Berita & AI',
    subtitle: 'Warta Crypto · Makro · CoinGecko',
    narration: 'Saring berita berdampak tinggi dan gunakan fitur Bedah AI untuk memahami bias aset secara instan.',
    gestureMode: 'brief_tablet',
    target: 'macro_terminal',
  },
  {
    id: 'whale-alerts',
    index: 7,
    startSec: 30,
    endSec: 35,
    title: 'Whale Desk & Price Alerts',
    shortTitle: 'Whale & Alert',
    subtitle: 'Smart Money & Alarm Cekring',
    narration: 'Awasi pergerakan dompet paus smart money dan pasang alarm Cekring otomatis saat target harga tersentuh.',
    gestureMode: 'radar_wave',
    target: 'whale',
  },
  {
    id: 'telemetry-chat',
    index: 8,
    startSec: 35,
    endSec: 40,
    title: '8-API Telemetry & Room Chat',
    shortTitle: '8-API & Chat',
    subtitle: 'Arbitrase Lintas Bursa & Komunitas',
    narration: 'Bandingkan harga real-time lintas 8 API bursa dunia dan berdiskusi langsung di Room Chat komunitas.',
    gestureMode: 'finale',
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

function easeOutBack(x: number): number {
  const t = Math.max(0, Math.min(1, x));
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function easeInOutQuad(x: number): number {
  const t = Math.max(0, Math.min(1, x));
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function formatClock(sec: number): string {
  const clamped = Math.max(0, Math.min(TOTAL_DURATION, Math.floor(sec)));
  const s = clamped % 60;
  return `00:${s < 10 ? '0' : ''}${s}`;
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
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
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

function drawAnimatedPresenter(
  ctx: CanvasRenderingContext2D,
  t: number,
  isSpeaking: boolean,
  gestureMode: GuideChapter['gestureMode'],
  enterRatio: number
) {
  // Subtle entrance lift + organic breathing motion
  const breathe = Math.sin(t * 2.4) * 3.5;
  const headBob = isSpeaking ? Math.sin(t * 4.5) * 2.2 : Math.sin(t * 1.8) * 1;
  const headTilt =
    gestureMode === 'compare_hands'
      ? Math.sin(t * 2.0) * 0.05
      : gestureMode === 'point_high' || gestureMode === 'trace_chart'
      ? -0.04 + Math.sin(t * 1.9) * 0.025
      : Math.sin(t * 1.5) * 0.03;

  const baseX = 215;
  const baseY = 595 + (1 - enterRatio) * 70;

  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, enterRatio * 1.25));

  // Studio rim aura behind presenter
  const aura = ctx.createRadialGradient(baseX, baseY - 210, 20, baseX, baseY - 210, 220);
  aura.addColorStop(0, 'rgba(231, 204, 130, 0.22)');
  aura.addColorStop(0.6, 'rgba(212, 175, 55, 0.06)');
  aura.addColorStop(1, 'rgba(7, 10, 17, 0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(baseX, baseY - 210, 220, 0, Math.PI * 2);
  ctx.fill();

  // --- Torso / Tailored Obsidian Blazer ---
  const ty = baseY + breathe;
  ctx.save();
  // Shoulders & blazer silhouette
  const suitGrad = ctx.createLinearGradient(baseX - 95, ty - 220, baseX + 95, ty + 20);
  suitGrad.addColorStop(0, '#1e293b');
  suitGrad.addColorStop(0.45, '#0f172a');
  suitGrad.addColorStop(1, '#070a11');

  ctx.fillStyle = suitGrad;
  ctx.beginPath();
  ctx.moveTo(baseX - 102, ty + 25);
  ctx.quadraticCurveTo(baseX - 96, ty - 165, baseX - 52, ty - 188);
  ctx.lineTo(baseX + 52, ty - 188);
  ctx.quadraticCurveTo(baseX + 96, ty - 165, baseX + 102, ty + 25);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Crisp White Dress Shirt V-Opening
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.moveTo(baseX - 28, ty - 188);
  ctx.lineTo(baseX + 28, ty - 188);
  ctx.lineTo(baseX, ty - 75);
  ctx.closePath();
  ctx.fill();

  // Gold Silk Tie
  const tieGrad = ctx.createLinearGradient(baseX - 12, ty - 180, baseX + 12, ty - 70);
  tieGrad.addColorStop(0, '#f5e3af');
  tieGrad.addColorStop(0.5, '#d4af37');
  tieGrad.addColorStop(1, '#9a7218');
  ctx.fillStyle = tieGrad;
  ctx.beginPath();
  ctx.moveTo(baseX - 7, ty - 178);
  ctx.lineTo(baseX + 7, ty - 178);
  ctx.lineTo(baseX + 11, ty - 98);
  ctx.lineTo(baseX, ty - 74);
  ctx.lineTo(baseX - 11, ty - 98);
  ctx.closePath();
  ctx.fill();

  // Suit Lapels
  ctx.fillStyle = '#182236';
  ctx.beginPath();
  ctx.moveTo(baseX - 30, ty - 188);
  ctx.lineTo(baseX - 52, ty - 135);
  ctx.lineTo(baseX - 4, ty - 74);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(baseX + 30, ty - 188);
  ctx.lineTo(baseX + 52, ty - 135);
  ctx.lineTo(baseX + 4, ty - 74);
  ctx.closePath();
  ctx.fill();

  // Gold Lapel Pin & Wireless Mic
  ctx.fillStyle = '#e7cc82';
  ctx.beginPath();
  ctx.arc(baseX - 35, ty - 138, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#334155';
  drawRoundedRect(ctx, baseX + 22, ty - 144, 9, 14, 3);
  ctx.fill();
  ctx.fillStyle = '#34d399';
  ctx.beginPath();
  ctx.arc(baseX + 26.5, ty - 140, 2, 0, Math.PI * 2);
  ctx.fill();

  // --- Articulated Right Arm (Presenter Gesturing Toward Holographic Stage) ---
  let reachAngle = -0.35 + Math.sin(t * 2.8) * 0.14;
  let forearmLift = -0.55 + Math.cos(t * 3.1) * 0.18;
  if (gestureMode === 'point_high' || gestureMode === 'trace_chart') {
    reachAngle = -0.45 + Math.sin(t * 3.4) * 0.16;
    forearmLift = -0.82 + Math.sin(t * 4.2) * 0.22;
  } else if (gestureMode === 'finale') {
    reachAngle = -0.52 + Math.sin(t * 5.0) * 0.12;
    forearmLift = -0.95 + Math.sin(t * 5.0) * 0.18;
  } else if (gestureMode === 'compare_hands') {
    reachAngle = -0.22 + Math.sin(t * 3.2) * 0.22;
    forearmLift = -0.45 + Math.cos(t * 3.2) * 0.22;
  }

  // Right Upper Arm & Forearm
  const shoulderRX = baseX + 74;
  const shoulderRY = ty - 165;
  const elbowRX = shoulderRX + Math.cos(reachAngle) * 68;
  const elbowRY = shoulderRY + Math.sin(reachAngle + 0.5) * 68;
  const handRX = elbowRX + Math.cos(forearmLift) * 76;
  const handRY = elbowRY + Math.sin(forearmLift) * 76;

  ctx.strokeStyle = '#141e33';
  ctx.lineWidth = 26;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(shoulderRX, shoulderRY);
  ctx.lineTo(elbowRX, elbowRY);
  ctx.lineTo(handRX, handRY);
  ctx.stroke();

  // Gold sleeve cuff
  ctx.strokeStyle = '#e7cc82';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(handRX, handRY, 11, 0, Math.PI * 2);
  ctx.stroke();

  // Expressive Right Hand & Pointer Finger
  ctx.fillStyle = '#e8bca0';
  ctx.beginPath();
  ctx.arc(handRX + 8, handRY - 3, 12, 0, Math.PI * 2);
  ctx.fill();
  // Index finger pointing toward stage
  ctx.strokeStyle = '#e8bca0';
  ctx.lineWidth = 6.5;
  ctx.beginPath();
  ctx.moveTo(handRX + 10, handRY - 6);
  ctx.lineTo(handRX + 34, handRY - 18);
  ctx.stroke();

  // Subtle holographic laser dot at fingertip when tracing
  if (gestureMode === 'trace_chart' || gestureMode === 'point_high') {
    const pulseR = 6 + Math.sin(t * 8) * 2.5;
    ctx.fillStyle = 'rgba(231, 204, 130, 0.85)';
    ctx.beginPath();
    ctx.arc(handRX + 38, handRY - 20, pulseR, 0, Math.PI * 2);
    ctx.fill();
  }

  // Left Arm (holding tablet or resting)
  const shoulderLX = baseX - 74;
  const shoulderLY = ty - 165;
  const elbowLX = shoulderLX - 26;
  const elbowLY = shoulderLY + 62;
  const handLX = baseX - 28 + Math.sin(t * 2.1) * 6;
  const handLY = ty - 54 + Math.cos(t * 2.1) * 4;

  ctx.strokeStyle = '#11192b';
  ctx.lineWidth = 25;
  ctx.beginPath();
  ctx.moveTo(shoulderLX, shoulderLY);
  ctx.lineTo(elbowLX, elbowLY);
  ctx.lineTo(handLX, handLY);
  ctx.stroke();

  ctx.fillStyle = '#e8bca0';
  ctx.beginPath();
  ctx.arc(handLX + 6, handLY - 2, 11, 0, Math.PI * 2);
  ctx.fill();

  // --- Neck & Head (Animated Nod, Tilt, Blink & Lip-Sync) ---
  ctx.fillStyle = '#dfb092';
  drawRoundedRect(ctx, baseX - 18, ty - 224, 36, 46, 12);
  ctx.fill();

  ctx.save();
  ctx.translate(baseX, ty - 252 + headBob);
  ctx.rotate(headTilt);

  // Ears
  ctx.fillStyle = '#dfb092';
  ctx.beginPath();
  ctx.ellipse(-45, 4, 8, 13, 0, 0, Math.PI * 2);
  ctx.ellipse(45, 4, 8, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  // Face contour
  const faceGrad = ctx.createRadialGradient(-8, -12, 8, 0, 0, 56);
  faceGrad.addColorStop(0, '#f3cbb2');
  faceGrad.addColorStop(1, '#d9a484');
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.moveTo(-42, -24);
  ctx.quadraticCurveTo(-45, 22, -26, 42);
  ctx.quadraticCurveTo(0, 56, 26, 42);
  ctx.quadraticCurveTo(45, 22, 42, -24);
  ctx.quadraticCurveTo(42, -56, 0, -56);
  ctx.quadraticCurveTo(-42, -56, -42, -24);
  ctx.closePath();
  ctx.fill();

  // Modern Styled Dark Hair with subtle highlight
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.moveTo(-44, -18);
  ctx.quadraticCurveTo(-48, -62, -10, -68);
  ctx.quadraticCurveTo(36, -72, 46, -24);
  ctx.quadraticCurveTo(46, -8, 40, -14);
  ctx.quadraticCurveTo(28, -40, -12, -38);
  ctx.quadraticCurveTo(-36, -36, -42, -12);
  ctx.closePath();
  ctx.fill();

  // Gold hair sheen stroke
  ctx.strokeStyle = 'rgba(231, 204, 130, 0.25)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-22, -52);
  ctx.quadraticCurveTo(8, -60, 30, -44);
  ctx.stroke();

  // Eyebrows (expressive lift)
  const browLift = isSpeaking ? Math.abs(Math.sin(t * 3.1)) * 3.5 : 0;
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 3.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-28, -14 - browLift);
  ctx.quadraticCurveTo(-18, -18 - browLift, -8, -14 - browLift);
  ctx.moveTo(8, -14 - browLift);
  ctx.quadraticCurveTo(18, -18 - browLift, 28, -14 - browLift);
  ctx.stroke();

  // Eyes (natural periodic blink every ~3.4s)
  const blinkPhase = t % 3.4;
  const isBlinking = blinkPhase > 3.22 && blinkPhase < 3.36;
  [-18, 18].forEach((ex) => {
    if (isBlinking) {
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(ex - 7, -2);
      ctx.quadraticCurveTo(ex, 1, ex + 7, -2);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(ex, -2, 7.5, 5.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Iris looking slightly toward holographic board
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(ex + 1.5, -2, 3.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ex + 2.5, -3.2, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Nose shadow
  ctx.strokeStyle = 'rgba(180, 120, 92, 0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -4);
  ctx.lineTo(2, 12);
  ctx.lineTo(-3, 14);
  ctx.stroke();

  // Dynamic Lip-Sync Mouth
  const mouthOpen = isSpeaking
    ? Math.max(1.2, Math.abs(Math.sin(t * 14.5) * 0.7 + Math.sin(t * 8.3) * 0.3) * 8.5)
    : 1.2;
  if (mouthOpen > 2.4) {
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.ellipse(0, 26, 9 + Math.sin(t * 9) * 2, mouthOpen, 0, 0, Math.PI * 2);
    ctx.fill();
    // Upper teeth hint
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-5, 26 - mouthOpen * 0.7, 10, 2.2);
  } else {
    // Confident warm smile
    ctx.strokeStyle = '#8b4a39';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-10, 25);
    ctx.quadraticCurveTo(0, 30, 10, 25);
    ctx.stroke();
  }

  ctx.restore(); // End head transform

  // Studio Glass Podium Foreground
  const deskGrad = ctx.createLinearGradient(40, 560, 390, 645);
  deskGrad.addColorStop(0, 'rgba(17, 25, 43, 0.96)');
  deskGrad.addColorStop(1, 'rgba(7, 10, 17, 0.98)');
  drawRoundedRect(ctx, 42, 558, 355, 86, 20);
  ctx.fillStyle = deskGrad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(231, 204, 130, 0.5)';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  ctx.fillStyle = '#e7cc82';
  ctx.font = 'bold 13px ui-monospace, monospace';
  ctx.fillText('PEMBAWA ACARA · GHALI STRATEGIST', 64, 590);
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '500 13px ui-sans-serif, sans-serif';
  ctx.fillText(isSpeaking ? 'Sedang Menjelaskan Fitur...' : 'Mode Jeda Interaktif', 64, 616);

  ctx.restore();
  ctx.restore();
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
  const lastChapterRef = useRef<number>(0);
  const currentTimeRef = useRef<number>(0);
  const liveBtcRef = useRef<LiveBtcSnapshot>(liveBtcHeader);

  // Sync seed if updated from parent before WS ticks
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

  // Live Real-Time Bitcoin WebSocket + REST Feed while Video Modal is Open
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

    // Fast REST fallback seed
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

    // Real-time Binance WebSocket tick stream
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

  const activeChapter = useMemo(() => {
    return (
      CHAPTERS.find((c) => currentTime >= c.startSec && currentTime < c.endSec) ||
      CHAPTERS[CHAPTERS.length - 1]
    );
  }, [currentTime]);

  // Reset and autoplay whenever opened
  useEffect(() => {
    if (isOpen) {
      currentTimeRef.current = 0;
      setCurrentTime(0);
      setIsPlaying(true);
      lastChapterRef.current = 0;
    } else {
      setIsPlaying(false);
      try {
        window.speechSynthesis?.cancel();
      } catch (_) {}
    }
  }, [isOpen]);

  // Subtle audio cue + optional Indonesian Voice Narration per chapter
  useEffect(() => {
    if (!isOpen || !isPlaying) {
      try {
        window.speechSynthesis?.cancel();
      } catch (_) {}
      return;
    }

    if (activeChapter.index !== lastChapterRef.current) {
      lastChapterRef.current = activeChapter.index;

      if (audioCueEnabled) {
        try {
          sound.playClick(950 + activeChapter.index * 55);
        } catch (_) {}
      }

      if (voiceNarrationEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const utter = new SpeechSynthesisUtterance(activeChapter.narration);
          const voices = window.speechSynthesis.getVoices();
          const idVoice =
            voices.find((v) => v.lang.toLowerCase().startsWith('id')) ||
            voices.find((v) => v.lang.toLowerCase().includes('ms')) ||
            null;
          if (idVoice) utter.voice = idVoice;
          utter.lang = 'id-ID';
          utter.rate = Math.min(1.5, speed * 1.12);
          utter.pitch = 1.02;
          window.speechSynthesis.speak(utter);
        } catch (_) {}
      }
    }
  }, [activeChapter, audioCueEnabled, voiceNarrationEnabled, isOpen, isPlaying, speed]);

  // Canvas 60fps Video Frame Renderer (Presenter + Live BTC + Elegant Transitions)
  const renderFrame = useCallback((t: number, playingNow: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1280;
    const H = 720;
    const chapter =
      CHAPTERS.find((c) => t >= c.startSec && t < c.endSec) || CHAPTERS[CHAPTERS.length - 1];
    const localSec = Math.max(0, t - chapter.startSec);
    const localProgress = Math.max(0, Math.min(1, localSec / 5));

    // Smooth cinematic entrance (0..0.7s) & exit (4.55..5.0s) curves
    const enterEase = easeOutCubic(Math.min(1, localSec / 0.68));
    const exitEase = localSec > 4.55 ? easeInOutQuad((localSec - 4.55) / 0.45) : 0;
    const contentAlpha = Math.max(0.08, enterEase * (1 - exitEase * 0.72));

    const btc = liveBtcRef.current;
    const btcPriceStr = `$${btc.price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
    const btcChgStr = `${btc.change24h >= 0 ? '+' : ''}${btc.change24h.toFixed(2)}%`;
    const isBtcUp = btc.change24h >= 0;
    const tickRecently = performance.now() - btc.lastTickMs < 450;

    // 1. Dynamic Obsidian Background + Studio Spotlight Sweep
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, '#060910');
    bgGrad.addColorStop(0.55, '#0b101d');
    bgGrad.addColorStop(1, '#05080f');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Subtle moving architectural grid
    ctx.strokeStyle = 'rgba(28, 39, 61, 0.35)';
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

    // Dynamic radial studio spotlight sweep
    const sweepX = W * (0.58 + Math.sin(t * 0.55) * 0.14);
    const sweepY = H * (0.42 + Math.cos(t * 0.45) * 0.1);
    const spot = ctx.createRadialGradient(sweepX, sweepY, 20, sweepX, sweepY, 480);
    spot.addColorStop(0, 'rgba(212, 175, 55, 0.18)');
    spot.addColorStop(0.55, 'rgba(30, 58, 138, 0.08)');
    spot.addColorStop(1, 'rgba(7, 10, 17, 0)');
    ctx.fillStyle = spot;
    ctx.fillRect(0, 0, W, H);

    // Floating Ambient Gold Dust Particles (depth motion)
    for (let i = 0; i < 22; i++) {
      const px = ((i * 193 + t * (16 + (i % 4) * 6)) % (W + 40)) - 20;
      const py = ((i * 137 + Math.sin(t + i) * 28) % H + H) % H;
      const rad = 1.2 + (i % 3) * 0.9;
      ctx.fillStyle = `rgba(231, 204, 130, ${0.14 + (i % 3) * 0.08})`;
      ctx.beginPath();
      ctx.arc(px, py, rad, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Top Studio Live Telemetry Bar (REAL-TIME BTC PRICE ALWAYS VISIBLE)
    drawRoundedRect(ctx, 38, 22, W - 76, 54, 16);
    ctx.fillStyle = 'rgba(10, 15, 28, 0.9)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.38)';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    ctx.fillStyle = '#e7cc82';
    ctx.font = 'bold 16px ui-monospace, monospace';
    ctx.fillText('GHALI ON CHAIN · TUR VIRTUAL 40 DETIK', 58, 55);

    // Live BTC Pill inside Studio Header
    drawRoundedRect(ctx, 515, 30, 325, 38, 12);
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
    ctx.arc(536, 49, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 14px ui-monospace, monospace';
    ctx.fillText('BTC LIVE', 550, 54);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px ui-monospace, monospace';
    ctx.fillText(btcPriceStr, 632, 54);

    ctx.fillStyle = isBtcUp ? '#34d399' : '#fb7185';
    ctx.font = 'bold 14px ui-monospace, monospace';
    ctx.fillText(btcChgStr, 768, 54);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '600 15px ui-monospace, monospace';
    const clockLabel = `${formatClock(t)} / 00:40 · BAB 0${chapter.index}/08`;
    ctx.fillText(clockLabel, W - 56 - ctx.measureText(clockLabel).width, 54);

    // 3. Animated Human Presenter on Studio Podium (Left Stage)
    drawAnimatedPresenter(ctx, t, playingNow, chapter.gestureMode, enterEase);

    // 4. Holographic Feature Presentation Board (Right Stage with Elegant Per-Scene Transitions)
    ctx.save();
    ctx.globalAlpha = contentAlpha;

    const stageX = 438;
    const stageY = 98;
    const stageW = 804;
    const stageH = 528;

    // Distinct Transition Geometry per Chapter Index!
    let tx = 0;
    let ty = 0;
    let scale = 1;
    let rot = 0;

    switch (chapter.index % 4) {
      case 1:
        // Depth Zoom + Rise
        scale = 0.92 + enterEase * 0.08 - exitEase * 0.05;
        ty = (1 - enterEase) * 28 - exitEase * 18;
        break;
      case 2:
        // Elegant Horizontal Parallax Slide
        tx = (1 - enterEase) * 90 - exitEase * 60;
        break;
      case 3:
        // Subtle 3D Tilt Swing In
        rot = (1 - enterEase) * -0.04 + exitEase * 0.03;
        scale = 0.95 + enterEase * 0.05;
        break;
      case 0:
        // Elastic Pop-In Depth Push
        scale = 0.9 + easeOutBack(Math.min(1, localSec / 0.72)) * 0.1 - exitEase * 0.05;
        break;
    }

    const pivotX = stageX + stageW / 2;
    const pivotY = stageY + stageH / 2;
    ctx.translate(pivotX + tx, pivotY + ty);
    ctx.scale(scale, scale);
    ctx.rotate(rot);
    ctx.translate(-pivotX, -pivotY);

    // Glass Stage Card with Depth Shadow & Specular Sheen
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = 34;
    ctx.shadowOffsetY = 14;
    drawRoundedRect(ctx, stageX, stageY, stageW, stageH, 28);
    const cardBg = ctx.createLinearGradient(stageX, stageY, stageX + stageW, stageY + stageH);
    cardBg.addColorStop(0, 'rgba(15, 23, 42, 0.94)');
    cardBg.addColorStop(1, 'rgba(8, 12, 22, 0.96)');
    ctx.fillStyle = cardBg;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.52)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Moving Specular Sheen across card border/glass during entrance
    if (localSec < 1.2) {
      ctx.save();
      drawRoundedRect(ctx, stageX, stageY, stageW, stageH, 28);
      ctx.clip();
      const sheenX = stageX - 240 + (localSec / 1.2) * (stageW + 480);
      const sheenGrad = ctx.createLinearGradient(sheenX, stageY, sheenX + 160, stageY + stageH);
      sheenGrad.addColorStop(0, 'rgba(245, 227, 175, 0)');
      sheenGrad.addColorStop(0.5, 'rgba(245, 227, 175, 0.11)');
      sheenGrad.addColorStop(1, 'rgba(245, 227, 175, 0)');
      ctx.fillStyle = sheenGrad;
      ctx.fillRect(stageX, stageY, stageW, stageH);
      ctx.restore();
    }

    // Chapter Header Inside Holographic Board
    ctx.fillStyle = '#e7cc82';
    ctx.font = 'bold 15px ui-monospace, monospace';
    ctx.fillText(`0${chapter.index} · ${chapter.subtitle.toUpperCase()}`, stageX + 34, stageY + 42);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 31px ui-sans-serif, system-ui, sans-serif';
    ctx.fillText(chapter.title, stageX + 34, stageY + 84);

    // Interactive Inner Stage Canvas Region
    const innerX = stageX + 34;
    const innerY = stageY + 108;
    const innerW = stageW - 68;
    const innerH = 304;
    drawRoundedRect(ctx, innerX, innerY, innerW, innerH, 20);
    ctx.fillStyle = 'rgba(6, 9, 16, 0.85)';
    ctx.fill();
    ctx.strokeStyle = '#1b263c';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    const icx = innerX + innerW / 2;
    const icy = innerY + innerH / 2;

    if (chapter.index === 1) {
      // Scene 1: 3D Monolith + Live BTC Core + 10 Orbiting Altcoins
      const angle = t * 1.45;
      ctx.save();
      ctx.translate(icx, icy);
      ctx.strokeStyle = 'rgba(231, 204, 130, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 240, 82, -0.14, 0, Math.PI * 2);
      ctx.stroke();

      const r = 74;
      const pts = [
        [Math.cos(angle) * r, -56],
        [Math.cos(angle + Math.PI / 2) * r, -6],
        [Math.cos(angle + Math.PI) * r, 48],
        [Math.cos(angle + (3 * Math.PI) / 2) * r, -6],
      ];
      ctx.strokeStyle = '#f5e3af';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      pts.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
      ctx.closePath();
      ctx.fillStyle = 'rgba(212, 175, 55, 0.16)';
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px ui-monospace, monospace';
      ctx.fillText(btcPriceStr, -ctx.measureText(btcPriceStr).width / 2, 6);

      ['ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'SUI', 'AVAX'].forEach((sym, i) => {
        const a = angle * 0.8 + (i * Math.PI * 2) / 7;
        const ox = Math.cos(a) * 240;
        const oy = Math.sin(a) * 82;
        ctx.fillStyle = i % 2 === 0 ? '#34d399' : '#e7cc82';
        ctx.beginPath();
        ctx.arc(ox, oy, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 13px ui-monospace, monospace';
        ctx.fillText(sym, ox + 11, oy + 4);
      });
      ctx.restore();
    } else if (chapter.index === 2) {
      // Scene 2: Live Candlestick + Fibonacci Levels Relative to REAL BTC Price + Elliott Wave
      const baseX = innerX + 36;
      const baseY = innerY + innerH - 30;
      const bars = [
        [0.32, 0.48], [0.47, 0.41], [0.42, 0.59], [0.58, 0.52], [0.53, 0.69],
        [0.68, 0.63], [0.64, 0.81], [0.80, 0.74], [0.75, 0.90], [0.89, 0.84],
        [0.85, 0.95], [0.94, isBtcUp ? 0.99 : 0.89],
      ];
      const count = Math.max(3, Math.floor(localProgress * bars.length) + 3);
      bars.slice(0, Math.min(bars.length, count)).forEach(([o, c], idx) => {
        const x = baseX + idx * 52;
        const yO = baseY - o * 230;
        const yC = baseY - c * 230;
        const bull = c >= o;
        ctx.strokeStyle = bull ? '#34d399' : '#fb7185';
        ctx.fillStyle = bull ? '#34d399' : '#fb7185';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 12, Math.min(yO, yC) - 14);
        ctx.lineTo(x + 12, Math.max(yO, yC) + 14);
        ctx.stroke();
        ctx.fillRect(x, Math.min(yO, yC), 24, Math.max(10, Math.abs(yC - yO)));
      });

      const fibAlpha = Math.min(1, localProgress * 1.5);
      const fibs = [
        { lvl: '0.382', pct: 0.78, p: btc.price * 0.985 },
        { lvl: '0.500', pct: 0.64, p: btc.price * 0.972 },
        { lvl: '0.618', pct: 0.5, p: btc.price * 0.958 },
      ];
      ctx.strokeStyle = `rgba(231, 204, 130, ${0.85 * fibAlpha})`;
      ctx.setLineDash([8, 6]);
      fibs.forEach((f) => {
        const fy = baseY - f.pct * 230;
        ctx.beginPath();
        ctx.moveTo(baseX, fy);
        ctx.lineTo(innerX + innerW - 32, fy);
        ctx.stroke();
        ctx.fillStyle = `rgba(245, 227, 175, ${fibAlpha})`;
        ctx.font = 'bold 12px ui-monospace, monospace';
        ctx.fillText(`FIB ${f.lvl} · $${Math.round(f.p).toLocaleString()}`, innerX + innerW - 210, fy - 6);
      });
      ctx.setLineDash([]);

      // Elliott Wave Overlay
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      const wPts = [
        [baseX + 12, baseY - 82],
        [baseX + 120, baseY - 148],
        [baseX + 172, baseY - 118],
        [baseX + 330, baseY - 198],
        [baseX + 382, baseY - 165],
        [baseX + 540, baseY - 228],
      ];
      ctx.beginPath();
      wPts.slice(0, Math.max(2, Math.floor(localProgress * wPts.length) + 1)).forEach(([wx, wy], i) => {
        if (i === 0) ctx.moveTo(wx, wy);
        else ctx.lineTo(wx, wy);
      });
      ctx.stroke();
    } else if (chapter.index === 3) {
      // Scene 3: Real-Time BTC Price + Real ATH Distance Calculation
      const ath = 108900;
      const distAthPct = (((btc.price - ath) / ath) * 100).toFixed(1);
      const fillPct = Math.max(0.15, Math.min(1, (btc.price / ath) * (0.6 + localProgress * 0.4)));

      ctx.fillStyle = '#e7cc82';
      ctx.font = 'bold 15px ui-monospace, monospace';
      ctx.fillText('HARGA BITCOIN REAL-TIME · BINANCE SPOT', innerX + 30, innerY + 42);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 46px ui-monospace, monospace';
      ctx.fillText(btcPriceStr, innerX + 30, innerY + 100);

      ctx.fillStyle = isBtcUp ? '#34d399' : '#fb7185';
      ctx.font = 'bold 19px ui-monospace, monospace';
      ctx.fillText(`${btcChgStr} (24J) · Jarak ke ATH ($108,900): ${distAthPct}%`, innerX + 30, innerY + 134);

      drawRoundedRect(ctx, innerX + 30, innerY + 158, innerW - 60, 22, 11);
      ctx.fillStyle = '#121a2d';
      ctx.fill();
      drawRoundedRect(ctx, innerX + 30, innerY + 158, (innerW - 60) * fillPct, 22, 11);
      ctx.fillStyle = '#e7cc82';
      ctx.fill();

      ['Willy Woo', 'Arthur Hayes', 'PlanB', 'B. Cowen'].forEach((exp, idx) => {
        const bx = innerX + 30 + idx * 170;
        drawRoundedRect(ctx, bx, innerY + 206, 156, 68, 14);
        ctx.fillStyle = idx === Math.floor(localProgress * 4) % 4 ? '#17233b' : '#0f1627';
        ctx.fill();
        ctx.strokeStyle = idx === Math.floor(localProgress * 4) % 4 ? '#e7cc82' : '#24314a';
        ctx.stroke();
        ctx.fillStyle = '#f5e3af';
        ctx.font = 'bold 16px ui-sans-serif, sans-serif';
        ctx.fillText(exp, bx + 16, innerY + 236);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '400 12px ui-sans-serif, sans-serif';
        ctx.fillText('Model Siklus 2026', bx + 16, innerY + 258);
      });
    } else if (chapter.index === 4) {
      // Scene 4: Capital Rotation & Top 5 L/S Bars
      ['STABLE', 'BITCOIN', 'ETH / SOL', 'ALTCOINS'].forEach((st, i) => {
        const bx = innerX + 26 + i * 172;
        drawRoundedRect(ctx, bx, innerY + 24, 154, 48, 12);
        ctx.fillStyle = i <= Math.floor(localProgress * 4) ? '#1a253d' : '#0f1627';
        ctx.fill();
        ctx.strokeStyle = i <= Math.floor(localProgress * 4) ? '#e7cc82' : '#222f48';
        ctx.stroke();
        ctx.fillStyle = '#f5e3af';
        ctx.font = 'bold 13px ui-monospace, monospace';
        ctx.fillText(st, bx + 20, innerY + 53);
      });

      [
        { s: 'ETH/USDT', l: 64, sh: 36 },
        { s: 'SOL/USDT', l: 71, sh: 29 },
        { s: 'BNB/USDT', l: 58, sh: 42 },
      ].forEach((p, idx) => {
        const py = innerY + 114 + idx * 62;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px ui-monospace, monospace';
        ctx.fillText(p.s, innerX + 28, py);
        ctx.fillStyle = '#34d399';
        ctx.fillText(`LONG ${p.l}%`, innerX + 185, py);
        ctx.fillStyle = '#fb7185';
        ctx.fillText(`SHORT ${p.sh}%`, innerX + innerW - 140, py);

        const bw = innerW - 56;
        drawRoundedRect(ctx, innerX + 28, py + 12, bw, 12, 6);
        ctx.fillStyle = '#fb7185';
        ctx.fill();
        drawRoundedRect(ctx, innerX + 28, py + 12, (bw * p.l) / 100 * Math.min(1, localProgress * 1.4 + 0.3), 12, 6);
        ctx.fillStyle = '#34d399';
        ctx.fill();
      });
    } else if (chapter.index === 5) {
      // Scene 5: Contrarian Gauge Needle
      const sweep = -Math.PI + Math.PI * (0.3 + Math.sin(localProgress * Math.PI) * 0.5);
      ctx.save();
      ctx.translate(icx, icy + 42);
      ctx.lineWidth = 20;
      ctx.strokeStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(0, 0, 122, Math.PI, Math.PI * 1.35);
      ctx.stroke();
      ctx.strokeStyle = '#e7cc82';
      ctx.beginPath();
      ctx.arc(0, 0, 122, Math.PI * 1.35, Math.PI * 1.68);
      ctx.stroke();
      ctx.strokeStyle = '#fb7185';
      ctx.beginPath();
      ctx.arc(0, 0, 122, Math.PI * 1.68, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(sweep) * 102, Math.sin(sweep) * 102);
      ctx.stroke();
      ctx.fillStyle = '#e7cc82';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = '#f5e3af';
      ctx.font = 'bold 17px ui-monospace, monospace';
      ctx.fillText('BINANCE vs BITGET CONTRARIAN SKEW', icx - 190, innerY + 266);
    } else if (chapter.index === 6) {
      // Scene 6: Editorial Breaking Wire + Bedah AI
      [
        { t: 'HIGH IMPACT · MAKRO', h: 'Sinyal Likuiditas Bank Sentral Dorong Volatilitas DXY & BTC' },
        { t: 'CRYPTO 24J · COINDESK', h: 'Arus Masuk Institusional Spot ETF Menjaga Support Utama' },
        { t: 'BEDAH AI · OTOMATIS', h: 'Ringkasan Fundamental & Bias Dampak Aset dalam 2 Detik' },
      ].forEach((n, idx) => {
        const ny = innerY + 24 + idx * 88 - localProgress * 8;
        drawRoundedRect(ctx, innerX + 26, ny, innerW - 52, 74, 14);
        ctx.fillStyle = idx === 0 ? '#151e34' : '#0d1424';
        ctx.fill();
        ctx.strokeStyle = idx === 0 ? '#e7cc82' : '#222f48';
        ctx.stroke();
        ctx.fillStyle = idx === 2 ? '#34d399' : '#e7cc82';
        ctx.font = 'bold 12px ui-monospace, monospace';
        ctx.fillText(n.t, innerX + 44, ny + 26);
        ctx.fillStyle = '#f8fafc';
        ctx.font = '600 15px ui-sans-serif, sans-serif';
        ctx.fillText(n.h, innerX + 44, ny + 52);
      });
    } else if (chapter.index === 7) {
      // Scene 7: Whale Radar & Alert Trigger
      [0, 1, 2].forEach((ring) => {
        const rad = ((localProgress * 150 + ring * 48) % 135) + 20;
        ctx.strokeStyle = `rgba(231, 204, 130, ${1 - rad / 160})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(icx, icy - 24, rad, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.fillStyle = '#e7cc82';
      ctx.beginPath();
      ctx.arc(icx, icy - 24, 18, 0, Math.PI * 2);
      ctx.fill();

      drawRoundedRect(ctx, innerX + 46, innerY + 220, innerW - 92, 60, 14);
      ctx.fillStyle = '#121b30';
      ctx.fill();
      ctx.strokeStyle = '#34d399';
      ctx.stroke();
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 15px ui-monospace, monospace';
      ctx.fillText(`ALERT CEKRING · TRIGGER TARGET BTC ${btcPriceStr}`, innerX + 78, innerY + 256);
    } else {
      // Scene 8: Live Cross-Exchange Spread Derived from Live BTC + Room Chat Outro
      const exs = [
        { n: 'BINANCE WS', p: btc.price },
        { n: 'KRAKEN SPOT', p: btc.price + 3.4 },
        { n: 'COINBASE', p: btc.price - 2.15 },
      ];
      exs.forEach((ex, i) => {
        const exX = innerX + 26 + i * 232;
        drawRoundedRect(ctx, exX, innerY + 24, 216, 86, 14);
        ctx.fillStyle = '#0e1526';
        ctx.fill();
        ctx.strokeStyle = '#24324e';
        ctx.stroke();
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 12px ui-monospace, monospace';
        ctx.fillText(ex.n, exX + 16, innerY + 52);
        ctx.fillStyle = '#f5e3af';
        ctx.font = 'bold 20px ui-monospace, monospace';
        ctx.fillText(`$${ex.p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, exX + 16, innerY + 84);
      });

      drawRoundedRect(ctx, innerX + 26, innerY + 132, innerW - 52, 138, 16);
      ctx.fillStyle = '#121a2e';
      ctx.fill();
      ctx.strokeStyle = '#d4af37';
      ctx.stroke();
      ctx.fillStyle = '#e7cc82';
      ctx.font = 'bold 19px ui-sans-serif, sans-serif';
      ctx.fillText('Room Chat & Komunitas Real-Time', innerX + 52, innerY + 174);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '400 16px ui-sans-serif, sans-serif';
      ctx.fillText('Diskusi setup teknikal, narasi 24 jam & eksekusi langsung bersama.', innerX + 52, innerY + 208);
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 15px ui-monospace, monospace';
      ctx.fillText('GHALI ON CHAIN · SIAP DIGUNAKAN', innerX + 52, innerY + 244);
    }

    // Subtitle / Narration Strip below inner preview
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '400 18px ui-sans-serif, system-ui, sans-serif';
    wrapText(ctx, `"${chapter.narration}"`, stageX + 34, stageY + 448, stageW - 68, 27);

    ctx.restore(); // End holographic stage transform

    // 5. Scene-Edge Wipe Transition Overlays (First 0.45s of each chapter for sleek cinema polish)
    if (localSec < 0.45 && chapter.index > 1) {
      const wipeT = easeOutCubic(localSec / 0.45);
      if (chapter.index % 3 === 0) {
        // Golden Iris Ring Wipe
        ctx.save();
        ctx.strokeStyle = `rgba(231, 204, 130, ${(1 - wipeT) * 0.55})`;
        ctx.lineWidth = 10 * (1 - wipeT);
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, 120 + wipeT * 650, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else if (chapter.index % 3 === 1) {
        // Diagonal Curtain Sweep
        ctx.save();
        const curX = -320 + wipeT * (W + 640);
        const curGrad = ctx.createLinearGradient(curX, 0, curX + 240, H);
        curGrad.addColorStop(0, 'rgba(212, 175, 55, 0)');
        curGrad.addColorStop(0.5, `rgba(231, 204, 130, ${(1 - wipeT) * 0.25})`);
        curGrad.addColorStop(1, 'rgba(212, 175, 55, 0)');
        ctx.fillStyle = curGrad;
        ctx.fillRect(curX, 0, 240, H);
        ctx.restore();
      } else {
        // Split-Blade Gold Pulse Line
        ctx.save();
        ctx.strokeStyle = `rgba(231, 204, 130, ${(1 - wipeT) * 0.7})`;
        ctx.lineWidth = 3;
        const barY = H * wipeT;
        ctx.beginPath();
        ctx.moveTo(0, barY);
        ctx.lineTo(W, barY);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 6. Bottom Progress Strip
    ctx.fillStyle = '#131b2e';
    ctx.fillRect(38, H - 24, W - 76, 5);
    ctx.fillStyle = '#e7cc82';
    ctx.fillRect(38, H - 24, ((W - 76) * t) / TOTAL_DURATION, 5);
  }, []);

  // Playback loop (runs continuously when open so presenter stays subtly alive even when paused, advancing clock when playing)
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
    lastChapterRef.current = 0; // Allow narration to trigger cleanly for jumped chapter
    renderFrame(clamped, isPlaying);
  };

  const handleTogglePlay = () => {
    sound.playClick();
    if (currentTimeRef.current >= TOTAL_DURATION) {
      currentTimeRef.current = 0;
      setCurrentTime(0);
      lastChapterRef.current = 0;
      setIsPlaying(true);
    } else {
      setIsPlaying((p) => !p);
    }
  };

  const handleReplay = () => {
    sound.playClick();
    currentTimeRef.current = 0;
    setCurrentTime(0);
    lastChapterRef.current = 0;
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
        a.download = 'panduan-ghali-on-chain-40s.webm';
        a.click();
        URL.revokeObjectURL(url);
        setExportState('idle');
      };

      currentTimeRef.current = 0;
      setCurrentTime(0);
      lastChapterRef.current = 0;
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
                Video Panduan Presenter 40 Detik
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
                  ? 'Merekam 40d...'
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

        {/* Scrollable Video Player + Interactive Chapters */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="rounded-2xl overflow-hidden border border-[#24314c] bg-[#05080f] shadow-2xl">
            <div className="relative w-full aspect-video bg-[#070a11]">
              <canvas
                ref={canvasRef}
                width={1280}
                height={720}
                onClick={handleTogglePlay}
                className="w-full h-full object-contain cursor-pointer block"
              />
            </div>

            {/* Video Transport Controls */}
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
                  aria-label="Timeline video panduan 40 detik"
                  className="flex-1 accent-[#e7cc82] h-1.5 bg-[#192338] rounded-lg cursor-pointer"
                />
                <span className="text-[11px] font-mono tabular-nums text-slate-400 w-10 text-right shrink-0">
                  00:40
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
                    aria-label="Toggle suara narasi presenter"
                    className={`min-h-[40px] px-2.5 sm:px-3 rounded-xl border text-xs inline-flex items-center gap-1.5 cursor-pointer ${
                      voiceNarrationEnabled
                        ? 'bg-[#17223a] border-[#d4af37]/45 text-[#f5e3af]'
                        : 'bg-[#11192b] border-[#24314a] text-slate-400'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">
                      {voiceNarrationEnabled ? 'Suara Host' : 'Host Bisu'}
                    </span>
                  </button>

                  <button
                    onClick={() => setAudioCueEnabled((v) => !v)}
                    aria-label="Toggle suara transisi bab"
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
                      onLaunchFeature(activeChapter.target);
                      onClose();
                    }}
                    className="min-h-[40px] px-3 sm:px-3.5 rounded-xl bg-[#17223a] border border-[#d4af37]/45 text-xs font-semibold text-[#f5e3af] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#e7cc82]" />
                    <span>Buka {activeChapter.shortTitle}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#e7cc82]" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive 8-Chapter Guide Timeline */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-white">
                Daftar Bab Video (8 Bagian × 5 Detik = 40 Detik)
              </h3>
              <span className="text-[11px] text-slate-400">
                Ketuk bab untuk lompat langsung
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {CHAPTERS.map((chap) => {
                const isActive = activeChapter.id === chap.id;
                return (
                  <div
                    key={chap.id}
                    className={`rounded-2xl border p-3 transition-all flex flex-col justify-between gap-2.5 ${
                      isActive
                        ? 'bg-[#121a2e] border-[#d4af37] shadow-lg'
                        : 'bg-[#0b101d] border-[#1d283f] hover:border-[#2d3e5e]'
                    }`}
                  >
                    <button
                      onClick={() => {
                        sound.playClick();
                        handleSeek(chap.startSec);
                        setIsPlaying(true);
                      }}
                      className="text-left space-y-1 cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono tabular-nums">
                        <span className={isActive ? 'text-[#e7cc82] font-bold' : 'text-slate-400'}>
                          {formatClock(chap.startSec)}–{formatClock(chap.endSec)}
                        </span>
                        <span className="text-slate-500">0{chap.index}</span>
                      </div>
                      <div className="text-xs font-semibold text-white leading-snug">
                        {chap.title}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-2">
                        {chap.subtitle}
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        sound.playClick();
                        onLaunchFeature(chap.target);
                        onClose();
                      }}
                      className="min-h-[34px] px-2.5 rounded-xl bg-[#070a11] hover:bg-[#17223a] border border-[#1f2b44] text-[11px] font-medium text-[#e7cc82] inline-flex items-center justify-between cursor-pointer"
                    >
                      <span>Buka Fitur</span>
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
