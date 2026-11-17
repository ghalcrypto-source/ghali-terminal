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
  Clapperboard,
} from 'lucide-react';
import { sound } from '../audio/soundEngine';

import maleHostUrl from '../assets/images/cinema_host_male_1794929317321.jpg';
import femaleCohostUrl from '../assets/images/cinema_cohost_female_1794929318044.jpg';
import twoShotStudioUrl from '../assets/images/cinema_twoshot_studio_1794929319272.jpg';
import dialogueAngleUrl from '../assets/images/cinema_dialogue_angle_1794929318795.jpg';

export type GuideFeatureTarget =
  | 'monolith'
  | 'multichart'
  | 'bitcoin_cycle'
  | 'liquidity_movers'
  | 'exchange_ls'
  | 'macro_terminal'
  | 'whale'
  | 'telemetry';

type CameraShotKind = 'twoshot' | 'male_cu' | 'female_cu' | 'overshoulder';

interface DialogueBeat {
  speaker: 'Reza' | 'Nadia';
  role: string;
  line: string;
  shot: CameraShotKind;
}

interface GuideChapter {
  id: string;
  index: number;
  startSec: number;
  endSec: number;
  title: string;
  shortTitle: string;
  subtitle: string;
  beats: [DialogueBeat, DialogueBeat];
  transitionStyle: 'iris' | 'light_leak' | 'curtain' | 'whip_pan';
  target: GuideFeatureTarget;
}

const TOTAL_DURATION = 40;

const CHAPTERS: GuideChapter[] = [
  {
    id: 'home-monolith',
    index: 1,
    startSec: 0,
    endSec: 5,
    title: 'Adegan 1 · War Room & 3D Monolith',
    shortTitle: '3D Monolith',
    subtitle: 'Prolog · Command Center Real-Time',
    beats: [
      {
        speaker: 'Reza',
        role: 'Lead Strategist',
        line: 'Nadia, lihat Monolith pusat—BTC live bergerak cepat dan sepuluh orbit altcoin merespons seketika.',
        shot: 'twoshot',
      },
      {
        speaker: 'Nadia',
        role: 'AI & On-Chain Quant',
        line: 'Semua modul desktop dan SuperApp mobile kini tersinkron dalam satu layar tanpa jeda.',
        shot: 'female_cu',
      },
    ],
    transitionStyle: 'light_leak',
    target: 'monolith',
  },
  {
    id: 'ai-chart',
    index: 2,
    startSec: 5,
    endSec: 10,
    title: 'Adegan 2 · AI Auto-Draw Candlestick',
    shortTitle: 'AI Chart',
    subtitle: 'Fibonacci · Elliott Wave · ICT · SnR',
    beats: [
      {
        speaker: 'Nadia',
        role: 'AI & On-Chain Quant',
        line: 'Aku aktifkan AI Auto-Draw. Fibonacci retracement dan gelombang Elliott langsung tergambar di candle Binance.',
        shot: 'female_cu',
      },
      {
        speaker: 'Reza',
        role: 'Lead Strategist',
        line: 'Trendline, zona ICT, dan level SnR muncul presisi tanpa menggambar manual satu per satu.',
        shot: 'male_cu',
      },
    ],
    transitionStyle: 'whip_pan',
    target: 'multichart',
  },
  {
    id: 'btc-cycle',
    index: 3,
    startSec: 10,
    endSec: 15,
    title: 'Adegan 3 · Siklus Bitcoin & Pakar 2026',
    shortTitle: 'BTC Cycle',
    subtitle: 'Meteran ATH Live & Dossier Global',
    beats: [
      {
        speaker: 'Reza',
        role: 'Lead Strategist',
        line: 'Bandingkan posisi harga Bitcoin live sekarang terhadap puncak ATH dan proyeksi siklus 2026.',
        shot: 'overshoulder',
      },
      {
        speaker: 'Nadia',
        role: 'AI & On-Chain Quant',
        line: 'Kita bisa cek dossier Willy Woo, Arthur Hayes, PlanB, hingga Cowen dalam hitungan detik.',
        shot: 'female_cu',
      },
    ],
    transitionStyle: 'iris',
    target: 'bitcoin_cycle',
  },
  {
    id: 'liquidity-movers',
    index: 4,
    startSec: 15,
    endSec: 20,
    title: 'Adegan 4 · Likuiditas, Movers & L/S',
    shortTitle: 'Likuiditas',
    subtitle: 'Rotasi Modal & Top 5 Altcoin Futures',
    beats: [
      {
        speaker: 'Nadia',
        role: 'AI & On-Chain Quant',
        line: 'Arus likuiditas mulai berotasi dari Bitcoin menuju altcoin utama dengan lonjakan Top Gainers 24 jam.',
        shot: 'twoshot',
      },
      {
        speaker: 'Reza',
        role: 'Lead Strategist',
        line: 'Panel Top 5 Altcoin L/S langsung memperlihatkan di mana tekanan beli futures paling dominan.',
        shot: 'male_cu',
      },
    ],
    transitionStyle: 'curtain',
    target: 'liquidity_movers',
  },
  {
    id: 'exchange-ls',
    index: 5,
    startSec: 20,
    endSec: 25,
    title: 'Adegan 5 · Radar Kontra Exchange L/S',
    shortTitle: 'Exchange L/S',
    subtitle: 'Deteksi Crowding Binance & Bitget',
    beats: [
      {
        speaker: 'Reza',
        role: 'Lead Strategist',
        line: 'Hati-hati saat mayoritas ritel di Binance dan Bitget menumpuk pada satu arah posisi.',
        shot: 'male_cu',
      },
      {
        speaker: 'Nadia',
        role: 'AI & On-Chain Quant',
        line: 'Radar Kontra mendeteksi skew ekstrem lebih awal sebelum terjadi liquidasi berantai.',
        shot: 'overshoulder',
      },
    ],
    transitionStyle: 'light_leak',
    target: 'exchange_ls',
  },
  {
    id: 'news-narratives',
    index: 6,
    startSec: 25,
    endSec: 30,
    title: 'Adegan 6 · Warta 24J, Narasi & Bedah AI',
    shortTitle: 'Berita & AI',
    subtitle: 'Makro · Crypto · Intelijen CoinGecko',
    beats: [
      {
        speaker: 'Nadia',
        role: 'AI & On-Chain Quant',
        line: 'Setiap berita makro dan warta kripto 24 jam bisa langsung dibedah oleh AI menjadi ringkasan aksi.',
        shot: 'female_cu',
      },
      {
        speaker: 'Reza',
        role: 'Lead Strategist',
        line: 'Kita tahu persis narasi apa yang menggerakkan pasar tanpa membuang waktu membaca puluhan artikel.',
        shot: 'male_cu',
      },
    ],
    transitionStyle: 'whip_pan',
    target: 'macro_terminal',
  },
  {
    id: 'whale-alerts',
    index: 7,
    startSec: 30,
    endSec: 35,
    title: 'Adegan 7 · Radar Paus & Alarm Cekring',
    shortTitle: 'Whale & Alert',
    subtitle: 'Dompet Smart Money & Target Real-Time',
    beats: [
      {
        speaker: 'Reza',
        role: 'Lead Strategist',
        line: 'Lihat pergerakan dompet paus smart money yang terekam live di meja Whale Desk.',
        shot: 'overshoulder',
      },
      {
        speaker: 'Nadia',
        role: 'AI & On-Chain Quant',
        line: 'Pasang alarm Cekring otomatis pada harga BTC saat ini agar momentum entry tidak terlewat.',
        shot: 'female_cu',
      },
    ],
    transitionStyle: 'iris',
    target: 'whale',
  },
  {
    id: 'telemetry-chat',
    index: 8,
    startSec: 35,
    endSec: 40,
    title: 'Epilog · 8-API Telemetry & Room Chat',
    shortTitle: '8-API & Chat',
    subtitle: 'Arbitrase Global & Diskusi Komunitas',
    beats: [
      {
        speaker: 'Nadia',
        role: 'AI & On-Chain Quant',
        line: 'Pantau selisih harga lintas 8 API bursa dunia secara real-time sekaligus verifikasi data.',
        shot: 'male_cu',
      },
      {
        speaker: 'Reza',
        role: 'Lead Strategist',
        line: 'Lalu bahas setup terbaik langsung di Room Chat. Selamat datang di Ghali On Chain.',
        shot: 'twoshot',
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
 * Draws a photorealistic film frame with object-cover scaling, Ken Burns dolly motion,
 * and subtle Steadicam breathing sway so live human actors feel cinematic and dynamic.
 */
function drawCinemaCameraShot(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | undefined,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  localTime: number,
  tGlobal: number,
  zoomDirection: 'in' | 'out',
  panDirection: number,
  alpha: number = 1
) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.beginPath();
  ctx.rect(dx, dy, dw, dh);
  ctx.clip();

  if (img && img.complete && img.naturalWidth > 0) {
    const progress = Math.min(1, localTime / 2.6);
    const zoomBase = zoomDirection === 'in' ? 1.04 + progress * 0.08 : 1.12 - progress * 0.07;
    const panX = Math.sin(tGlobal * 0.8) * 8 + panDirection * progress * 24;
    const swayY = Math.cos(tGlobal * 1.15) * 4;

    const imgRatio = img.naturalWidth / img.naturalHeight;
    const boxRatio = dw / dh;

    let drawW = dw;
    let drawH = dh;
    if (imgRatio > boxRatio) {
      drawH = dh * zoomBase;
      drawW = drawH * imgRatio;
    } else {
      drawW = dw * zoomBase;
      drawH = drawW / imgRatio;
    }

    // Anchor slightly upward so faces & heads stay well-framed above cinema lower-thirds
    const offsetX = dx + (dw - drawW) / 2 + panX;
    const offsetY = dy + (dh - drawH) * 0.34 + swayY;

    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
  } else {
    const fallbackGrad = ctx.createLinearGradient(dx, dy, dx + dw, dy + dh);
    fallbackGrad.addColorStop(0, '#0a0f1c');
    fallbackGrad.addColorStop(1, '#05080f');
    ctx.fillStyle = fallbackGrad;
    ctx.fillRect(dx, dy, dw, dh);
  }

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
  const lastBeatKeyRef = useRef<string>('');
  const currentTimeRef = useRef<number>(0);
  const liveBtcRef = useRef<LiveBtcSnapshot>(liveBtcHeader);
  const shotsRef = useRef<Partial<Record<CameraShotKind, HTMLImageElement>>>({});

  // Preload all 4 photorealistic cinema assets into same-origin HTMLImageElements
  useEffect(() => {
    const entries: [CameraShotKind, string][] = [
      ['male_cu', maleHostUrl],
      ['female_cu', femaleCohostUrl],
      ['twoshot', twoShotStudioUrl],
      ['overshoulder', dialogueAngleUrl],
    ];
    entries.forEach(([key, url]) => {
      const img = new Image();
      img.src = url;
      shotsRef.current[key] = img;
    });
  }, []);

  // Sync seed from App before WebSocket connects
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

  // Live Real-Time Bitcoin WebSocket + REST Fallback while Film Modal is Open
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

  const activeChapter = useMemo(() => {
    return (
      CHAPTERS.find((c) => currentTime >= c.startSec && currentTime < c.endSec) ||
      CHAPTERS[CHAPTERS.length - 1]
    );
  }, [currentTime]);

  const activeBeatIndex: 0 | 1 = useMemo(() => {
    const local = currentTime - activeChapter.startSec;
    return local < 2.45 ? 0 : 1;
  }, [activeChapter, currentTime]);

  const activeBeat = activeChapter.beats[activeBeatIndex];

  // Reset & autoplay on open
  useEffect(() => {
    if (isOpen) {
      currentTimeRef.current = 0;
      setCurrentTime(0);
      setIsPlaying(true);
      lastBeatKeyRef.current = '';
    } else {
      setIsPlaying(false);
      try {
        window.speechSynthesis?.cancel();
      } catch (_) {}
    }
  }, [isOpen]);

  // Dual-Character Speech Synthesis + Cinema Cut Cue per Beat
  useEffect(() => {
    if (!isOpen || !isPlaying) {
      try {
        window.speechSynthesis?.cancel();
      } catch (_) {}
      return;
    }

    const beatKey = `${activeChapter.index}-${activeBeatIndex}`;
    if (beatKey !== lastBeatKeyRef.current) {
      lastBeatKeyRef.current = beatKey;

      if (audioCueEnabled && activeBeatIndex === 0) {
        try {
          sound.playClick(920 + activeChapter.index * 50);
        } catch (_) {}
      }

      if (voiceNarrationEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const utter = new SpeechSynthesisUtterance(activeBeat.line);
          const voices = window.speechSynthesis.getVoices();
          const idVoice =
            voices.find((v) => v.lang.toLowerCase().startsWith('id')) ||
            voices.find((v) => v.lang.toLowerCase().includes('ms')) ||
            null;
          if (idVoice) utter.voice = idVoice;
          utter.lang = 'id-ID';
          utter.rate = Math.min(1.6, speed * 1.18);
          // Distinct vocal tone for Male Strategist (Reza) vs Female Quant (Nadia)
          utter.pitch = activeBeat.speaker === 'Reza' ? 0.88 : 1.18;
          window.speechSynthesis.speak(utter);
        } catch (_) {}
      }
    }
  }, [activeChapter.index, activeBeatIndex, activeBeat, audioCueEnabled, voiceNarrationEnabled, isOpen, isPlaying, speed]);

  // 60FPS Film Renderer (2 Photorealistic Actors + Shot/Reverse-Shot + Holographic HUD + Live BTC)
  const renderFrame = useCallback((t: number, playingNow: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1280;
    const H = 720;
    const BAR_H = 44; // 2.39:1 Anamorphic Widescreen Cinema Matte
    const VIEW_Y = BAR_H;
    const VIEW_H = H - BAR_H * 2;

    const chapterIdx = Math.min(
      CHAPTERS.length - 1,
      Math.max(0, CHAPTERS.findIndex((c) => t >= c.startSec && t < c.endSec))
    );
    const chapter = CHAPTERS[chapterIdx === -1 ? CHAPTERS.length - 1 : chapterIdx];
    const prevChapter = CHAPTERS[Math.max(0, chapter.index - 2)];

    const localSec = Math.max(0, t - chapter.startSec);
    const beatIdx: 0 | 1 = localSec < 2.45 ? 0 : 1;
    const beatLocalSec = beatIdx === 0 ? localSec : localSec - 2.45;
    const beat = chapter.beats[beatIdx];
    const otherBeat = chapter.beats[beatIdx === 0 ? 1 : 0];
    const localProgress = Math.max(0, Math.min(1, localSec / 5));

    const btc = liveBtcRef.current;
    const btcPriceStr = `$${btc.price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
    const btcChgStr = `${btc.change24h >= 0 ? '+' : ''}${btc.change24h.toFixed(2)}%`;
    const isBtcUp = btc.change24h >= 0;
    const tickRecently = performance.now() - btc.lastTickMs < 480;

    // 1. Base Backdrop
    ctx.fillStyle = '#04060c';
    ctx.fillRect(0, 0, W, H);

    // 2. Main Cinema Camera Shot (Photorealistic Human Actors) with Cross-Dissolve Transition
    const mainShotImg = shotsRef.current[beat.shot];
    const prevShotKind: CameraShotKind =
      beatIdx === 1 ? chapter.beats[0].shot : prevChapter.beats[1].shot;
    const prevShotImg = shotsRef.current[prevShotKind];

    const cutFadeDuration = beatIdx === 0 ? 0.55 : 0.36;
    const cutMix = easeOutCubic(Math.min(1, beatLocalSec / cutFadeDuration));

    if (cutMix < 1 && t > 0.1 && prevShotImg) {
      drawCinemaCameraShot(
        ctx,
        prevShotImg,
        0,
        VIEW_Y,
        W,
        VIEW_H,
        2.45,
        t,
        'in',
        beatIdx === 0 ? -1 : 1,
        1 - cutMix * 0.85
      );
    }

    drawCinemaCameraShot(
      ctx,
      mainShotImg,
      0,
      VIEW_Y,
      W,
      VIEW_H,
      beatLocalSec,
      t,
      beatIdx === 0 ? 'in' : 'out',
      beat.speaker === 'Reza' ? 1 : -1,
      cutMix
    );

    // 3. Cinema Color Grading Vignette & Anamorphic Atmosphere (leaves faces bright on left/center, deepens right side for HUD legibility)
    const gradeGrad = ctx.createLinearGradient(0, VIEW_Y, W, VIEW_Y);
    gradeGrad.addColorStop(0, 'rgba(6, 9, 16, 0.25)');
    gradeGrad.addColorStop(0.42, 'rgba(7, 10, 17, 0.12)');
    gradeGrad.addColorStop(0.68, 'rgba(7, 10, 17, 0.62)');
    gradeGrad.addColorStop(1, 'rgba(5, 8, 15, 0.88)');
    ctx.fillStyle = gradeGrad;
    ctx.fillRect(0, VIEW_Y, W, VIEW_H);

    // Bottom dark gradient for crisp film subtitle & lower-third readability
    const subGrad = ctx.createLinearGradient(0, VIEW_Y + VIEW_H - 185, 0, VIEW_Y + VIEW_H);
    subGrad.addColorStop(0, 'rgba(5, 8, 15, 0)');
    subGrad.addColorStop(0.55, 'rgba(5, 8, 15, 0.68)');
    subGrad.addColorStop(1, 'rgba(4, 6, 11, 0.94)');
    ctx.fillStyle = subGrad;
    ctx.fillRect(0, VIEW_Y + VIEW_H - 185, W, 185);

    // Subtle Anamorphic Golden Lens Flare Streak
    const flareY = VIEW_Y + 86 + Math.sin(t * 0.7) * 14;
    const flareGrad = ctx.createLinearGradient(80, flareY, W - 120, flareY);
    flareGrad.addColorStop(0, 'rgba(231, 204, 130, 0)');
    flareGrad.addColorStop(0.35, 'rgba(245, 227, 175, 0.08)');
    flareGrad.addColorStop(0.5, 'rgba(231, 204, 130, 0.19)');
    flareGrad.addColorStop(0.65, 'rgba(56, 189, 248, 0.06)');
    flareGrad.addColorStop(1, 'rgba(231, 204, 130, 0)');
    ctx.fillStyle = flareGrad;
    ctx.fillRect(0, flareY - 2, W, 4);

    // Ambient Floating Cinema Bokeh Motes
    for (let i = 0; i < 16; i++) {
      const mx = ((i * 211 + t * (22 + (i % 4) * 7)) % (W + 40)) - 20;
      const my = VIEW_Y + (((i * 97 + Math.sin(t * 0.9 + i) * 26) % VIEW_H + VIEW_H) % VIEW_H);
      const mr = 1.4 + (i % 3) * 1.1;
      ctx.fillStyle = `rgba(245, 227, 175, ${0.12 + (i % 3) * 0.06})`;
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Dual-Character Presence: Whenever camera is in solo close-up, show the 2nd Real Actor in a Reverse-Angle Studio Monitor Card so BOTH real humans stay connected in the dialogue!
    const isSoloCloseUp = beat.shot === 'male_cu' || beat.shot === 'female_cu';
    if (isSoloCloseUp) {
      const listenerShot: CameraShotKind = beat.shot === 'male_cu' ? 'female_cu' : 'male_cu';
      const listenerName = beat.speaker === 'Reza' ? 'NADIA · MENDENGARKAN' : 'REZA · MENDENGARKAN';
      const pipW = 196;
      const pipH = 126;
      const pipX = 36;
      const pipY = VIEW_Y + 26;

      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.65)';
      ctx.shadowBlur = 22;
      drawRoundedRect(ctx, pipX, pipY, pipW, pipH, 16);
      ctx.fillStyle = '#070a11';
      ctx.fill();
      ctx.shadowBlur = 0;

      // Clip image cleanly inside PIP card
      ctx.save();
      drawRoundedRect(ctx, pipX + 2, pipY + 2, pipW - 4, pipH - 4, 14);
      ctx.clip();
      drawCinemaCameraShot(
        ctx,
        shotsRef.current[listenerShot],
        pipX + 2,
        pipY + 2,
        pipW - 4,
        pipH - 4,
        beatLocalSec,
        t + 1.3,
        'out',
        0,
        0.94
      );
      const pipTint = ctx.createLinearGradient(pipX, pipY + pipH - 40, pipX, pipY + pipH);
      pipTint.addColorStop(0, 'rgba(7,10,17,0)');
      pipTint.addColorStop(1, 'rgba(7,10,17,0.92)');
      ctx.fillStyle = pipTint;
      ctx.fillRect(pipX, pipY + pipH - 40, pipW, 40);
      ctx.restore();

      ctx.strokeStyle = 'rgba(231, 204, 130, 0.55)';
      ctx.lineWidth = 1.6;
      drawRoundedRect(ctx, pipX, pipY, pipW, pipH, 16);
      ctx.stroke();

      ctx.fillStyle = '#e7cc82';
      ctx.font = 'bold 10px ui-monospace, monospace';
      ctx.fillText(listenerName, pipX + 12, pipY + pipH - 12);
      ctx.restore();
    }

    // 5. Right-Side Translucent Holographic Glass Terminal Overlay (Live BTC + Feature Scene)
    const enterEase = easeOutCubic(Math.min(1, localSec / 0.65));
    const exitEase = localSec > 4.6 ? easeInOutQuad((localSec - 4.6) / 0.4) : 0;
    const cardAlpha = Math.max(0.15, enterEase * (1 - exitEase * 0.65));

    const holoX = 768 + (1 - enterEase) * 42;
    const holoY = VIEW_Y + 24 + (1 - enterEase) * 14;
    const holoW = 476;
    const holoH = 426;

    ctx.save();
    ctx.globalAlpha = cardAlpha;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 32;
    drawRoundedRect(ctx, holoX, holoY, holoW, holoH, 22);
    const holoBg = ctx.createLinearGradient(holoX, holoY, holoX + holoW, holoY + holoH);
    holoBg.addColorStop(0, 'rgba(11, 16, 29, 0.86)');
    holoBg.addColorStop(1, 'rgba(6, 9, 16, 0.92)');
    ctx.fillStyle = holoBg;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.52)';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Chapter Badge + Title inside Hologram
    ctx.fillStyle = '#e7cc82';
    ctx.font = 'bold 12px ui-monospace, monospace';
    ctx.fillText(`0${chapter.index} · ${chapter.subtitle.toUpperCase()}`, holoX + 22, holoY + 30);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 21px ui-sans-serif, system-ui, sans-serif';
    ctx.fillText(chapter.title, holoX + 22, holoY + 58);

    // Live BTC Strip embedded inside the Hologram
    drawRoundedRect(ctx, holoX + 22, holoY + 72, holoW - 44, 42, 12);
    ctx.fillStyle = tickRecently
      ? btc.tickDir === 'up'
        ? 'rgba(16, 185, 129, 0.22)'
        : 'rgba(244, 63, 94, 0.22)'
      : 'rgba(17, 25, 43, 0.9)';
    ctx.fill();
    ctx.strokeStyle = tickRecently
      ? btc.tickDir === 'up'
        ? '#34d399'
        : '#fb7185'
      : 'rgba(231, 204, 130, 0.32)';
    ctx.stroke();

    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.arc(holoX + 38, holoY + 93, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px ui-monospace, monospace';
    ctx.fillText('BTC/USDT LIVE', holoX + 50, holoY + 97);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 17px ui-monospace, monospace';
    ctx.fillText(btcPriceStr, holoX + 166, holoY + 98);

    ctx.fillStyle = isBtcUp ? '#34d399' : '#fb7185';
    ctx.font = 'bold 13px ui-monospace, monospace';
    ctx.fillText(btcChgStr, holoX + 324, holoY + 97);

    // Interactive Scene Graphics Area inside Hologram
    const gx = holoX + 22;
    const gy = holoY + 128;
    const gw = holoW - 44;
    const gh = 274;
    drawRoundedRect(ctx, gx, gy, gw, gh, 16);
    ctx.fillStyle = 'rgba(5, 8, 14, 0.84)';
    ctx.fill();
    ctx.strokeStyle = '#1b263c';
    ctx.stroke();

    const gcx = gx + gw / 2;
    const gcy = gy + gh / 2;

    if (chapter.index === 1) {
      // Holographic 3D Monolith + Live BTC Core
      const ang = t * 1.5;
      ctx.save();
      ctx.translate(gcx, gcy);
      ctx.strokeStyle = 'rgba(231, 204, 130, 0.35)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(0, 0, 160, 58, -0.14, 0, Math.PI * 2);
      ctx.stroke();

      const r = 56;
      const pts = [
        [Math.cos(ang) * r, -44],
        [Math.cos(ang + Math.PI / 2) * r, -4],
        [Math.cos(ang + Math.PI) * r, 40],
        [Math.cos(ang + (3 * Math.PI) / 2) * r, -4],
      ];
      ctx.fillStyle = 'rgba(212, 175, 55, 0.16)';
      ctx.strokeStyle = '#f5e3af';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      pts.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ['ETH', 'SOL', 'BNB', 'SUI', 'XRP', 'DOGE'].forEach((sym, i) => {
        const a = ang * 0.85 + (i * Math.PI * 2) / 6;
        const ox = Math.cos(a) * 160;
        const oy = Math.sin(a) * 58;
        ctx.fillStyle = i % 2 === 0 ? '#34d399' : '#e7cc82';
        ctx.beginPath();
        ctx.arc(ox, oy, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 11px ui-monospace, monospace';
        ctx.fillText(sym, ox + 9, oy + 4);
      });
      ctx.restore();
    } else if (chapter.index === 2) {
      // Candlestick + Live Fibonacci + Elliott Wave
      const bx = gx + 20;
      const by = gy + gh - 24;
      const candles = [
        [0.32, 0.48], [0.47, 0.41], [0.42, 0.59], [0.58, 0.52],
        [0.53, 0.69], [0.68, 0.63], [0.64, 0.81], [0.80, 0.74],
        [0.75, 0.90], [0.89, isBtcUp ? 0.96 : 0.83],
      ];
      const shown = Math.max(3, Math.floor(localProgress * candles.length) + 3);
      candles.slice(0, Math.min(candles.length, shown)).forEach(([o, c], idx) => {
        const x = bx + idx * 38;
        const yo = by - o * 210;
        const yc = by - c * 210;
        const bull = c >= o;
        ctx.strokeStyle = bull ? '#34d399' : '#fb7185';
        ctx.fillStyle = bull ? '#34d399' : '#fb7185';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(x + 9, Math.min(yo, yc) - 10);
        ctx.lineTo(x + 9, Math.max(yo, yc) + 10);
        ctx.stroke();
        ctx.fillRect(x, Math.min(yo, yc), 18, Math.max(8, Math.abs(yc - yo)));
      });
      ctx.setLineDash([6, 5]);
      ctx.strokeStyle = 'rgba(231, 204, 130, 0.82)';
      [
        { l: '0.382', p: 0.78, val: btc.price * 0.985 },
        { l: '0.618', p: 0.5, val: btc.price * 0.958 },
      ].forEach((f) => {
        const fy = by - f.p * 210;
        ctx.beginPath();
        ctx.moveTo(bx, fy);
        ctx.lineTo(gx + gw - 16, fy);
        ctx.stroke();
        ctx.fillStyle = '#f5e3af';
        ctx.font = 'bold 11px ui-monospace, monospace';
        ctx.fillText(`FIB ${f.l} · $${Math.round(f.val).toLocaleString()}`, gx + gw - 162, fy - 5);
      });
      ctx.setLineDash([]);
    } else if (chapter.index === 3) {
      // Bitcoin Cycle Live ATH Gauge + 2026 Experts
      const ath = 108900;
      const distPct = (((btc.price - ath) / ath) * 100).toFixed(1);
      const fillPct = Math.max(0.2, Math.min(1, (btc.price / ath) * (0.65 + localProgress * 0.35)));
      ctx.fillStyle = '#e7cc82';
      ctx.font = 'bold 12px ui-monospace, monospace';
      ctx.fillText(`JARAK KE ATH ($108,900): ${distPct}%`, gx + 20, gy + 36);

      drawRoundedRect(ctx, gx + 20, gy + 54, gw - 40, 18, 9);
      ctx.fillStyle = '#121a2d';
      ctx.fill();
      drawRoundedRect(ctx, gx + 20, gy + 54, (gw - 40) * fillPct, 18, 9);
      ctx.fillStyle = '#e7cc82';
      ctx.fill();

      ['Willy Woo', 'Arthur Hayes', 'PlanB', 'B. Cowen'].forEach((exp, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const ex = gx + 20 + col * 198;
        const ey = gy + 96 + row * 78;
        const lit = i === Math.floor(localProgress * 4) % 4;
        drawRoundedRect(ctx, ex, ey, 184, 64, 12);
        ctx.fillStyle = lit ? '#16223b' : '#0d1424';
        ctx.fill();
        ctx.strokeStyle = lit ? '#e7cc82' : '#24314a';
        ctx.stroke();
        ctx.fillStyle = '#f5e3af';
        ctx.font = 'bold 14px ui-sans-serif, sans-serif';
        ctx.fillText(exp, ex + 14, ey + 28);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '400 11px ui-sans-serif, sans-serif';
        ctx.fillText('Proyeksi Siklus 2026', ex + 14, ey + 48);
      });
    } else if (chapter.index === 4) {
      // Capital Rotation & Top L/S Bars
      [
        { s: 'ETH/USDT', l: 64, sh: 36 },
        { s: 'SOL/USDT', l: 71, sh: 29 },
        { s: 'BNB/USDT', l: 58, sh: 42 },
      ].forEach((row, idx) => {
        const ry = gy + 44 + idx * 78;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px ui-monospace, monospace';
        ctx.fillText(row.s, gx + 20, ry);
        ctx.fillStyle = '#34d399';
        ctx.fillText(`LONG ${row.l}%`, gx + 140, ry);
        ctx.fillStyle = '#fb7185';
        ctx.fillText(`SHORT ${row.sh}%`, gx + gw - 102, ry);
        drawRoundedRect(ctx, gx + 20, ry + 12, gw - 40, 12, 6);
        ctx.fillStyle = '#fb7185';
        ctx.fill();
        drawRoundedRect(
          ctx,
          gx + 20,
          ry + 12,
          ((gw - 40) * row.l) / 100 * Math.min(1, localProgress * 1.4 + 0.35),
          12,
          6
        );
        ctx.fillStyle = '#34d399';
        ctx.fill();
      });
    } else if (chapter.index === 5) {
      // Exchange L/S Contrarian Skew Needle
      const sweep = -Math.PI + Math.PI * (0.3 + Math.sin(localProgress * Math.PI) * 0.5);
      ctx.save();
      ctx.translate(gcx, gcy + 34);
      ctx.lineWidth = 18;
      ctx.strokeStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(0, 0, 102, Math.PI, Math.PI * 1.35);
      ctx.stroke();
      ctx.strokeStyle = '#e7cc82';
      ctx.beginPath();
      ctx.arc(0, 0, 102, Math.PI * 1.35, Math.PI * 1.68);
      ctx.stroke();
      ctx.strokeStyle = '#fb7185';
      ctx.beginPath();
      ctx.arc(0, 0, 102, Math.PI * 1.68, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(sweep) * 86, Math.sin(sweep) * 86);
      ctx.stroke();
      ctx.fillStyle = '#e7cc82';
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#f5e3af';
      ctx.font = 'bold 13px ui-monospace, monospace';
      ctx.fillText('BINANCE & BITGET CONTRARIAN SKEW', gx + 70, gy + gh - 24);
    } else if (chapter.index === 6) {
      // Breaking News + Bedah AI
      [
        { t: 'HIGH IMPACT · MAKRO', h: 'Sinyal Likuiditas Dorong Volatilitas BTC' },
        { t: 'CRYPTO 24J · COINDESK', h: 'Arus Masuk Spot ETF Menjaga Support' },
        { t: 'BEDAH AI · INSTAN', h: 'Ringkasan Fundamental & Bias Aset' },
      ].forEach((item, idx) => {
        const ny = gy + 22 + idx * 80 - localProgress * 6;
        drawRoundedRect(ctx, gx + 18, ny, gw - 36, 66, 12);
        ctx.fillStyle = idx === 0 ? '#151e34' : '#0d1424';
        ctx.fill();
        ctx.strokeStyle = idx === 0 ? '#e7cc82' : '#222f48';
        ctx.stroke();
        ctx.fillStyle = idx === 2 ? '#34d399' : '#e7cc82';
        ctx.font = 'bold 11px ui-monospace, monospace';
        ctx.fillText(item.t, gx + 32, ny + 24);
        ctx.fillStyle = '#f8fafc';
        ctx.font = '600 13px ui-sans-serif, sans-serif';
        ctx.fillText(item.h, gx + 32, ny + 46);
      });
    } else if (chapter.index === 7) {
      // Whale Radar + Live BTC Cekring Alert
      [0, 1, 2].forEach((ring) => {
        const rad = ((localProgress * 130 + ring * 40) % 112) + 18;
        ctx.strokeStyle = `rgba(231, 204, 130, ${1 - rad / 132})`;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(gcx, gcy - 22, rad, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.fillStyle = '#e7cc82';
      ctx.beginPath();
      ctx.arc(gcx, gcy - 22, 14, 0, Math.PI * 2);
      ctx.fill();

      drawRoundedRect(ctx, gx + 22, gy + gh - 64, gw - 44, 46, 12);
      ctx.fillStyle = '#121b30';
      ctx.fill();
      ctx.strokeStyle = '#34d399';
      ctx.stroke();
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 13px ui-monospace, monospace';
      ctx.fillText(`CEKRING TRIGGER · BTC ${btcPriceStr}`, gx + 48, gy + gh - 36);
    } else {
      // 8-API Cross-Exchange Live Spread + Room Chat Finale
      [
        { n: 'BINANCE WS', p: btc.price },
        { n: 'KRAKEN SPOT', p: btc.price + 3.4 },
      ].forEach((ex, i) => {
        const exX = gx + 20 + i * 198;
        drawRoundedRect(ctx, exX, gy + 22, 184, 78, 12);
        ctx.fillStyle = '#0e1526';
        ctx.fill();
        ctx.strokeStyle = '#24324e';
        ctx.stroke();
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 11px ui-monospace, monospace';
        ctx.fillText(ex.n, exX + 14, gy + 48);
        ctx.fillStyle = '#f5e3af';
        ctx.font = 'bold 18px ui-monospace, monospace';
        ctx.fillText(`$${ex.p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, exX + 14, gy + 78);
      });

      drawRoundedRect(ctx, gx + 20, gy + 118, gw - 40, 134, 14);
      ctx.fillStyle = '#121a2e';
      ctx.fill();
      ctx.strokeStyle = '#d4af37';
      ctx.stroke();
      ctx.fillStyle = '#e7cc82';
      ctx.font = 'bold 17px ui-sans-serif, sans-serif';
      ctx.fillText('Room Chat & Eksekusi Real-Time', gx + 38, gy + 158);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '400 13px ui-sans-serif, sans-serif';
      wrapText(
        ctx,
        'Bahas analisis makro, sinyal Whale Desk, dan setup AI Chart langsung bersama komunitas.',
        gx + 38,
        gy + 186,
        gw - 76,
        20
      );
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 12px ui-monospace, monospace';
      ctx.fillText('GHALI ON CHAIN · SIAP DIGUNAKAN', gx + 38, gy + 236);
    }

    ctx.restore();

    // 6. Active Speaker Lower-Third + Cinema Subtitle + Animated Voice Waveform
    const subSlide = easeOutCubic(Math.min(1, beatLocalSec / 0.35));
    const lowerX = 36;
    const lowerY = VIEW_Y + VIEW_H - 134 + (1 - subSlide) * 14;

    ctx.save();
    ctx.globalAlpha = Math.min(1, subSlide * 1.15);

    // Speaker Badge Pill + Active Waveform
    drawRoundedRect(ctx, lowerX, lowerY, 695, 114, 18);
    ctx.fillStyle = 'rgba(7, 10, 17, 0.86)';
    ctx.fill();
    ctx.strokeStyle = beat.speaker === 'Reza' ? 'rgba(231, 204, 130, 0.55)' : 'rgba(52, 211, 153, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Live Audio Waveform Bars beside Speaker Tag
    for (let b = 0; b < 6; b++) {
      const barH = playingNow
        ? 5 + Math.abs(Math.sin(t * 14 + b * 1.1)) * 15
        : 4;
      ctx.fillStyle = beat.speaker === 'Reza' ? '#e7cc82' : '#34d399';
      drawRoundedRect(ctx, lowerX + 18 + b * 7, lowerY + 26 - barH / 2, 4, barH, 2);
      ctx.fill();
    }

    ctx.fillStyle = beat.speaker === 'Reza' ? '#f5e3af' : '#6ee7b7';
    ctx.font = 'bold 13px ui-monospace, monospace';
    ctx.fillText(
      `${beat.speaker.toUpperCase()} · ${beat.role.toUpperCase()}`,
      lowerX + 70,
      lowerY + 30
    );

    ctx.fillStyle = '#64748b';
    ctx.font = '600 12px ui-monospace, monospace';
    const partnerTag = `BERSAMA ${otherBeat.speaker.toUpperCase()}`;
    ctx.fillText(partnerTag, lowerX + 675 - ctx.measureText(partnerTag).width, lowerY + 30);

    // Cinema Dialogue Subtitle
    ctx.fillStyle = '#f8fafc';
    ctx.font = '500 18px ui-sans-serif, system-ui, sans-serif';
    wrapText(ctx, `"${beat.line}"`, lowerX + 20, lowerY + 60, 655, 25);
    ctx.restore();

    // 7. Elegant Non-Flat Cinema Scene Transitions (on Chapter Cut & Mid-Scene Shot Cut)
    if (localSec < 0.52 && chapter.index > 1) {
      const wt = easeOutCubic(localSec / 0.52);
      ctx.save();
      if (chapter.transitionStyle === 'light_leak') {
        const lx = -360 + wt * (W + 720);
        const lg = ctx.createLinearGradient(lx, 0, lx + 300, H);
        lg.addColorStop(0, 'rgba(212, 175, 55, 0)');
        lg.addColorStop(0.5, `rgba(245, 227, 175, ${(1 - wt) * 0.42})`);
        lg.addColorStop(1, 'rgba(212, 175, 55, 0)');
        ctx.fillStyle = lg;
        ctx.fillRect(lx, VIEW_Y, 300, VIEW_H);
      } else if (chapter.transitionStyle === 'whip_pan') {
        ctx.fillStyle = `rgba(231, 204, 130, ${(1 - wt) * 0.22})`;
        ctx.fillRect(W * (1 - wt), VIEW_Y, 44, VIEW_H);
      } else if (chapter.transitionStyle === 'iris') {
        ctx.strokeStyle = `rgba(231, 204, 130, ${(1 - wt) * 0.65})`;
        ctx.lineWidth = 12 * (1 - wt);
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, 90 + wt * 720, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        const curH = VIEW_H * 0.5 * (1 - wt);
        ctx.fillStyle = 'rgba(4, 6, 12, 0.72)';
        ctx.fillRect(0, VIEW_Y, W, curH);
        ctx.fillRect(0, VIEW_Y + VIEW_H - curH, W, curH);
      }
      ctx.restore();
    }

    // 8. Top & Bottom 2.39:1 Anamorphic Letterbox Matte Bars (Film HUD integrated cleanly outside scene)
    ctx.fillStyle = '#03050a';
    ctx.fillRect(0, 0, W, BAR_H);
    ctx.fillRect(0, H - BAR_H, W, BAR_H);

    // Subtle Gold Hairline Border separating matte from cinema frame
    ctx.fillStyle = 'rgba(212, 175, 55, 0.35)';
    ctx.fillRect(0, BAR_H - 1, W, 1);
    ctx.fillRect(0, H - BAR_H, W, 1);

    // Top Matte Film Metadata
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(38, BAR_H / 2, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e7cc82';
    ctx.font = 'bold 13px ui-monospace, monospace';
    ctx.fillText('GHALI ON CHAIN · FILM PANDUAN 2 KARAKTER', 52, 27);

    // Live BTC Ticker in Top Letterbox Matte
    const topBtcText = `BTC LIVE ${btcPriceStr} (${btcChgStr})`;
    ctx.fillStyle = isBtcUp ? '#34d399' : '#fb7185';
    ctx.font = 'bold 13px ui-monospace, monospace';
    ctx.fillText(topBtcText, W / 2 - ctx.measureText(topBtcText).width / 2 + 40, 27);

    const tcLabel = `24FPS · 0${chapter.index}/08 · ${formatClock(t)} / 00:40`;
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(tcLabel, W - 36 - ctx.measureText(tcLabel).width, 27);

    // Bottom Matte: Cast Credit + Sleek Progress Line
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 12px ui-monospace, monospace';
    ctx.fillText('PEMERAN: REZA (LEAD STRATEGIST) & NADIA (AI & ON-CHAIN QUANT)', 36, H - 17);

    ctx.fillStyle = '#151f33';
    ctx.fillRect(590, H - 23, W - 626, 4);
    ctx.fillStyle = '#e7cc82';
    ctx.fillRect(590, H - 23, ((W - 626) * t) / TOTAL_DURATION, 4);
  }, []);

  // Continuous Cinema Loop (runs even when paused so Steadicam ambience stays responsive on seeks)
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
    lastBeatKeyRef.current = '';
    renderFrame(clamped, isPlaying);
  };

  const handleTogglePlay = () => {
    sound.playClick();
    if (currentTimeRef.current >= TOTAL_DURATION) {
      currentTimeRef.current = 0;
      setCurrentTime(0);
      lastBeatKeyRef.current = '';
      setIsPlaying(true);
    } else {
      setIsPlaying((p) => !p);
    }
  };

  const handleReplay = () => {
    sound.playClick();
    currentTimeRef.current = 0;
    setCurrentTime(0);
    lastBeatKeyRef.current = '';
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
        a.download = 'film-panduan-ghali-on-chain-40s.webm';
        a.click();
        URL.revokeObjectURL(url);
        setExportState('idle');
      };

      currentTimeRef.current = 0;
      setCurrentTime(0);
      lastBeatKeyRef.current = '';
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

        {/* Cinema Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-[#1b263c] bg-[#0a0f1c] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#f2d98a] to-[#c4972c] text-[#080b12] flex items-center justify-center shrink-0">
              <Clapperboard className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-semibold text-[#f5e3af] truncate">
                Film Panduan 40 Detik · Reza & Nadia
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
                  : 'Unduh Film'}
              </span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              aria-label="Tutup film panduan"
              className="min-h-[40px] min-w-[40px] rounded-xl bg-[#121a2d] hover:bg-[#1a2540] border border-[#253350] text-slate-300 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Cinema Player & Scene Index */}
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

            {/* Film Transport Controls */}
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
                  aria-label="Timeline film panduan 40 detik"
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
                    aria-label="Ulang film dari detik ke-0"
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
                    aria-label="Toggle efek cut adegan"
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

          {/* Interactive Cast Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="rounded-2xl border border-[#1d283f] bg-[#0b101d] p-3 flex items-center gap-3">
              <img
                src={maleHostUrl}
                alt="Reza - Lead Strategist"
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-xl object-cover border border-[#d4af37]/50 shrink-0"
              />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-[#f5e3af]">Reza · Lead Macro Strategist</div>
                <div className="text-[11px] text-slate-400 truncate">
                  Fokus pada struktur pasar, siklus Bitcoin, & radar kontra ritel
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-[#1d283f] bg-[#0b101d] p-3 flex items-center gap-3">
              <img
                src={femaleCohostUrl}
                alt="Nadia - AI and On-Chain Quant"
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-xl object-cover border border-emerald-400/50 shrink-0"
              />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-emerald-300">Nadia · AI & On-Chain Quant</div>
                <div className="text-[11px] text-slate-400 truncate">
                  Fokus pada AI Auto-Draw, rotasi likuiditas, berita AI, & alarm Paus
                </div>
              </div>
            </div>
          </div>

          {/* Interactive 8-Scene Timeline */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-[#e7cc82]" />
                <span>Daftar Adegan Film (8 Adegan × 5 Detik = 40 Detik)</span>
              </h3>
              <span className="text-[11px] text-slate-400">Ketuk adegan untuk lompat</span>
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
