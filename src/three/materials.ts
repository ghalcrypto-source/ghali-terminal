import * as THREE from 'three';
import { FinishId, FinishTheme } from '../types/contrarian';

export const FINISH_THEMES: Record<FinishId, FinishTheme> = {
  'obsidian-gold': {
    id: 'obsidian-gold',
    name: 'Obsidian & Gold',
    subtitle: 'Classic Sovereign Reserve',
    primaryMetalColor: 0xd4af37, // 24k Gold
    secondaryMetalColor: 0x18181b, // Polished Obsidian
    accentGlowColor: 0xf59e0b, // Amber glow
    coreCrystalColor: 0x09090b, // Deep Obsidian core
    bgHorizonColor: 0x08090c,
    ambientLightColor: 0x221a10,
    keyLightColor: 0xfff2d4,
    roughnessPrimary: 0.18,
    metalnessPrimary: 0.95,
    roughnessSecondary: 0.08,
    metalnessSecondary: 0.15,
  },
  'stealth-titanium': {
    id: 'stealth-titanium',
    name: 'Stealth Titanium',
    subtitle: 'High-Frequency Algorithmic',
    primaryMetalColor: 0x8b9bb4, // Aerospace Titanium
    secondaryMetalColor: 0x1e3a5f, // Blued Steel
    accentGlowColor: 0x00f0ff, // Electric Cyan
    coreCrystalColor: 0x0a1424, // Smoked Sapphire
    bgHorizonColor: 0x060910,
    ambientLightColor: 0x101b2b,
    keyLightColor: 0xd6ecff,
    roughnessPrimary: 0.32,
    metalnessPrimary: 0.88,
    roughnessSecondary: 0.14,
    metalnessSecondary: 0.94,
  },
  'terminal-phosphor': {
    id: 'terminal-phosphor',
    name: 'Terminal Phosphor',
    subtitle: 'Bloomberg Monolith 1984',
    primaryMetalColor: 0x22c55e, // Phosphor Emerald
    secondaryMetalColor: 0x111c14, // Matte Carbon
    accentGlowColor: 0x4ade80, // High-flux Green
    coreCrystalColor: 0x041308, // Dark Matrix Crystal
    bgHorizonColor: 0x030805,
    ambientLightColor: 0x0c1f12,
    keyLightColor: 0xbbf7d0,
    roughnessPrimary: 0.22,
    metalnessPrimary: 0.85,
    roughnessSecondary: 0.38,
    metalnessSecondary: 0.3,
  },
  'tungsten-crimson': {
    id: 'tungsten-crimson',
    name: 'Tungsten & Crimson',
    subtitle: 'Black Swan / Tail Risk',
    primaryMetalColor: 0x52525b, // Heavy Tungsten
    secondaryMetalColor: 0xb91c1c, // Anodized Crimson
    accentGlowColor: 0xff2a4d, // Red Laser Alert
    coreCrystalColor: 0x180507, // Smoked Garnet
    bgHorizonColor: 0x0a0405,
    ambientLightColor: 0x1f0c0f,
    keyLightColor: 0xffd1d5,
    roughnessPrimary: 0.28,
    metalnessPrimary: 0.92,
    roughnessSecondary: 0.18,
    metalnessSecondary: 0.86,
  },
};

/**
 * Creates an understated, edge-faded rectangular Trading Chart Grid texture
 * with subtle support/resistance levels and session intervals (zero round watch pedestal).
 */
export function createTradingChartGridTexture(accentHex: string): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, size, size);

  // Subtle dark translucent chart stage backing
  ctx.fillStyle = 'rgba(10, 14, 24, 0.72)';
  ctx.fillRect(0, 0, size, size);

  // Horizontal Support / Resistance levels & Vertical Session Grid
  const step = 64;
  for (let i = step; i < size; i += step) {
    const isMajor = i % 256 === 0;
    ctx.strokeStyle = isMajor ? 'rgba(231, 204, 130, 0.16)' : 'rgba(148, 163, 184, 0.08)';
    ctx.lineWidth = isMajor ? 1.5 : 1;

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();
  }

  // Subtle center equilibrium dashed price line
  ctx.save();
  ctx.setLineDash([12, 10]);
  ctx.strokeStyle = accentHex + '77';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(64, size / 2);
  ctx.lineTo(size - 64, size / 2);
  ctx.stroke();
  ctx.restore();

  // Quiet architectural watermark label near front-bottom edge
  ctx.fillStyle = 'rgba(231, 204, 130, 0.52)';
  ctx.font = '600 18px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GHALI ON CHAIN · MARKET STRUCTURE', size / 2, size - 135);

  // Smooth radial vignette mask so edges melt seamlessly into obsidian background
  ctx.globalCompositeOperation = 'destination-in';
  const mask = ctx.createRadialGradient(size / 2, size / 2, size * 0.16, size / 2, size / 2, size * 0.49);
  mask.addColorStop(0, 'rgba(0,0,0,1)');
  mask.addColorStop(0.68, 'rgba(0,0,0,0.85)');
  mask.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = mask;
  ctx.fillRect(0, 0, size, size);
  ctx.globalCompositeOperation = 'source-over';

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates soft procedural contact shadow disc
 */
export function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const cx = size / 2;
  const cy = size / 2;
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.95)');
  gradient.addColorStop(0.35, 'rgba(0, 0, 0, 0.65)');
  gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.2)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Creates procedural brushed anisotropic roughness map
 */
export function createBrushedMetalRoughnessTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  // Micro horizontal streaks
  for (let i = 0; i < 4000; i++) {
    const y = Math.random() * size;
    const x = Math.random() * size;
    const len = 30 + Math.random() * 80;
    const brightness = 100 + Math.floor(Math.random() * 80);
    ctx.strokeStyle = `rgba(${brightness}, ${brightness}, ${brightness}, 0.12)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

/**
 * Creates a refined, understated champagne-gold & obsidian Bitcoin (₿) core face texture
 */
export function createBitcoinCoreTexture(_accentHex = '#e7cc82'): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const cx = size / 2;
  const cy = size / 2;

  // Satin brushed obsidian-to-champagne backdrop
  const grad = ctx.createRadialGradient(cx - 100, cy - 100, 30, cx, cy, 512);
  grad.addColorStop(0, '#1e2433');
  grad.addColorStop(0.55, '#0c101b');
  grad.addColorStop(1, '#06080f');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Refined champagne gold hairline circles
  ctx.strokeStyle = 'rgba(231, 204, 130, 0.72)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(cx, cy, 430, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(231, 204, 130, 0.25)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 388, 0, Math.PI * 2);
  ctx.stroke();

  // Subtle 24 minimal radial markers
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * 428, cy + Math.sin(a) * 428);
    ctx.lineTo(cx + Math.cos(a) * 408, cy + Math.sin(a) * 408);
    ctx.strokeStyle = 'rgba(231, 204, 130, 0.45)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Clean tilted Bitcoin ₿ emblem in satin champagne gold
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(0.16);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.font = '700 410px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('₿', 6, 14);

  const bGrad = ctx.createLinearGradient(-150, -200, 150, 200);
  bGrad.addColorStop(0, '#faf0ca');
  bGrad.addColorStop(0.5, '#e7cc82');
  bGrad.addColorStop(1, '#b68d2d');
  ctx.fillStyle = bGrad;
  ctx.fillText('₿', 0, 6);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Draws crisp, recognizable procedural vector logos for each orbiting Altcoin
 */
export function drawAltcoinLogo(
  ctx: CanvasRenderingContext2D,
  symbol: string,
  cx: number,
  cy: number,
  r: number,
  colorHex: string
): void {
  ctx.save();
  ctx.translate(cx, cy);

  switch (symbol.toUpperCase()) {
    case 'ETH': {
      // Ethereum faceted octahedron diamond
      const topH = r * 0.92;
      const midY = r * 0.08;
      const botH = r * 0.92;
      const w = r * 0.56;

      // Top Left facet
      ctx.fillStyle = '#c7d2fe';
      ctx.beginPath();
      ctx.moveTo(0, -topH);
      ctx.lineTo(-w, -midY * 0.4);
      ctx.lineTo(0, midY);
      ctx.closePath();
      ctx.fill();

      // Top Right facet
      ctx.fillStyle = '#818cf8';
      ctx.beginPath();
      ctx.moveTo(0, -topH);
      ctx.lineTo(w, -midY * 0.4);
      ctx.lineTo(0, midY);
      ctx.closePath();
      ctx.fill();

      // Bottom Left chevron
      ctx.fillStyle = '#a5b4fc';
      ctx.beginPath();
      ctx.moveTo(0, midY + r * 0.16);
      ctx.lineTo(-w, r * 0.12);
      ctx.lineTo(0, botH);
      ctx.closePath();
      ctx.fill();

      // Bottom Right chevron
      ctx.fillStyle = '#6366f1';
      ctx.beginPath();
      ctx.moveTo(0, midY + r * 0.16);
      ctx.lineTo(w, r * 0.12);
      ctx.lineTo(0, botH);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'SOL': {
      // Solana 3 diagonal gradient bars
      const grad = ctx.createLinearGradient(-r, r, r, -r);
      grad.addColorStop(0, '#9945ff');
      grad.addColorStop(0.5, '#14f195');
      grad.addColorStop(1, '#00ffa3');
      ctx.fillStyle = grad;

      const bw = r * 1.25;
      const bh = r * 0.24;
      const skew = r * 0.22;

      const drawBar = (yCenter: number, flipSkew: boolean) => {
        const s = flipSkew ? -skew : skew;
        ctx.beginPath();
        ctx.moveTo(-bw * 0.5 + s, yCenter - bh * 0.5);
        ctx.lineTo(bw * 0.5 + s, yCenter - bh * 0.5);
        ctx.lineTo(bw * 0.5 - s, yCenter + bh * 0.5);
        ctx.lineTo(-bw * 0.5 - s, yCenter + bh * 0.5);
        ctx.closePath();
        ctx.fill();
      };

      drawBar(-r * 0.44, false);
      drawBar(0, true);
      drawBar(r * 0.44, false);
      break;
    }

    case 'BNB': {
      // BNB Chain diamond lattice
      ctx.fillStyle = '#f3ba2f';
      const d = r * 0.82;
      const t = r * 0.22;

      // Top chevron
      ctx.beginPath();
      ctx.moveTo(0, -d);
      ctx.lineTo(d * 0.58, -d * 0.42);
      ctx.lineTo(d * 0.34, -d * 0.18);
      ctx.lineTo(0, -d * 0.52);
      ctx.lineTo(-d * 0.34, -d * 0.18);
      ctx.lineTo(-d * 0.58, -d * 0.42);
      ctx.closePath();
      ctx.fill();

      // Bottom chevron
      ctx.beginPath();
      ctx.moveTo(0, d);
      ctx.lineTo(d * 0.58, d * 0.42);
      ctx.lineTo(d * 0.34, d * 0.18);
      ctx.lineTo(0, d * 0.52);
      ctx.lineTo(-d * 0.34, d * 0.18);
      ctx.lineTo(-d * 0.58, d * 0.42);
      ctx.closePath();
      ctx.fill();

      // Center diamond
      ctx.beginPath();
      ctx.moveTo(0, -t);
      ctx.lineTo(t, 0);
      ctx.lineTo(0, t);
      ctx.lineTo(-t, 0);
      ctx.closePath();
      ctx.fill();

      // Left & Right micro diamonds
      for (const side of [-1, 1]) {
        const ox = side * d * 0.68;
        ctx.beginPath();
        ctx.moveTo(ox, -t * 0.85);
        ctx.lineTo(ox + t * 0.85, 0);
        ctx.lineTo(ox, t * 0.85);
        ctx.lineTo(ox - t * 0.85, 0);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }

    case 'XRP': {
      // XRP interlocking upper & lower curved arcs
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineCap = 'round';
      ctx.lineWidth = r * 0.24;

      // Top prong
      ctx.beginPath();
      ctx.moveTo(-r * 0.65, -r * 0.62);
      ctx.quadraticCurveTo(0, -r * 0.02, r * 0.65, -r * 0.62);
      ctx.stroke();

      // Bottom prong
      ctx.strokeStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(-r * 0.65, r * 0.62);
      ctx.quadraticCurveTo(0, r * 0.02, r * 0.65, r * 0.62);
      ctx.stroke();
      break;
    }

    case 'DOGE': {
      // Dogecoin gold coin disc with iconic Ð symbol
      const g = ctx.createRadialGradient(-r * 0.25, -r * 0.25, r * 0.1, 0, 0, r * 0.92);
      g.addColorStop(0, '#fef08a');
      g.addColorStop(0.55, '#fbbf24');
      g.addColorStop(1, '#b45309');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.88, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#fef9c3';
      ctx.lineWidth = Math.max(2, r * 0.08);
      ctx.stroke();

      ctx.fillStyle = '#451a03';
      ctx.font = `900 ${Math.round(r * 1.18)}px Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Ð', 0, r * 0.05);
      break;
    }

    case 'SUI': {
      // Sui sleek water droplet with internal wave split
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.9);
      ctx.bezierCurveTo(r * 0.72, -r * 0.12, r * 0.74, r * 0.78, 0, r * 0.88);
      ctx.bezierCurveTo(-r * 0.74, r * 0.78, -r * 0.72, -r * 0.12, 0, -r * 0.9);
      ctx.closePath();
      ctx.fill();

      // Signature wave cutout
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = Math.max(3, r * 0.16);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-r * 0.44, r * 0.06);
      ctx.bezierCurveTo(-r * 0.1, -r * 0.18, r * 0.12, r * 0.34, r * 0.45, r * 0.06);
      ctx.stroke();
      break;
    }

    case 'ADA': {
      // Cardano concentric radial dot starburst
      ctx.fillStyle = '#60a5fa';
      const rings = [
        { count: 6, dist: r * 0.28, dotR: r * 0.11 },
        { count: 6, dist: r * 0.56, dotR: r * 0.09, offset: Math.PI / 6 },
        { count: 12, dist: r * 0.82, dotR: r * 0.055, offset: 0 },
      ];
      for (const ring of rings) {
        for (let i = 0; i < ring.count; i++) {
          const a = (i / ring.count) * Math.PI * 2 + (ring.offset || 0);
          ctx.beginPath();
          ctx.arc(Math.cos(a) * ring.dist, Math.sin(a) * ring.dist, ring.dotR, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }

    case 'AVAX': {
      // Avalanche crimson circle with stylized A mountain & diagonal snow cut
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.88, 0, Math.PI * 2);
      ctx.fill();

      // White peak A
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.58);
      ctx.lineTo(r * 0.56, r * 0.42);
      ctx.lineTo(r * 0.26, r * 0.42);
      ctx.lineTo(0, -r * 0.06);
      ctx.lineTo(-r * 0.26, r * 0.42);
      ctx.lineTo(-r * 0.56, r * 0.42);
      ctx.closePath();
      ctx.fill();

      // Right secondary snow wedge
      ctx.beginPath();
      ctx.moveTo(r * 0.34, r * 0.08);
      ctx.lineTo(r * 0.56, r * 0.42);
      ctx.lineTo(r * 0.16, r * 0.42);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'LINK': {
      // Chainlink bold hollow hexagon
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = Math.max(4, r * 0.28);
      ctx.lineJoin = 'miter';
      ctx.beginPath();
      const hr = r * 0.72;
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3 - Math.PI / 2;
        const px = Math.cos(a) * hr;
        const py = Math.sin(a) * hr;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();

      // Highlight inner facet line
      ctx.strokeStyle = '#bfdbfe';
      ctx.lineWidth = Math.max(2, r * 0.08);
      ctx.stroke();
      break;
    }

    case 'TAO': {
      // Bittensor luminous Tau (τ) emblem
      ctx.fillStyle = '#e9d5ff';
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = Math.max(2, r * 0.07);

      // Curved top serif bar
      ctx.beginPath();
      ctx.moveTo(-r * 0.68, -r * 0.35);
      ctx.quadraticCurveTo(-r * 0.55, -r * 0.65, -r * 0.1, -r * 0.65);
      ctx.lineTo(r * 0.65, -r * 0.65);
      ctx.lineTo(r * 0.55, -r * 0.38);
      ctx.lineTo(-r * 0.18, -r * 0.38);
      ctx.quadraticCurveTo(-r * 0.48, -r * 0.38, -r * 0.68, -r * 0.35);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Vertical descending stem with curved hook
      ctx.beginPath();
      ctx.moveTo(-r * 0.1, -r * 0.42);
      ctx.lineTo(r * 0.16, -r * 0.42);
      ctx.lineTo(r * 0.16, r * 0.42);
      ctx.quadraticCurveTo(r * 0.18, r * 0.62, r * 0.42, r * 0.62);
      ctx.lineTo(r * 0.34, r * 0.8);
      ctx.quadraticCurveTo(-r * 0.1, r * 0.82, -r * 0.1, r * 0.42);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }

    default: {
      ctx.fillStyle = colorHex;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = `900 ${Math.round(r * 0.7)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(symbol.slice(0, 3), 0, 0);
      break;
    }
  }

  ctx.restore();
}

/**
 * Creates sleek obsidian & brushed metallic medallion face texture for orbiting Altcoins
 */
export function createAltcoinFaceTexture(
  symbol: string,
  _name: string,
  colorHex: string,
  change5m = 0
): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const cx = size / 2;
  const cy = size / 2;

  const isPositive = change5m > 0;
  const isNegative = change5m < 0;
  const statusText = isPositive ? '#6ee7b7' : isNegative ? '#fda4af' : '#cbd5e1';

  // Deep matte obsidian face with very subtle sheen
  const grad = ctx.createRadialGradient(cx - 50, cy - 50, 12, cx, cy, 250);
  grad.addColorStop(0, '#171e30');
  grad.addColorStop(0.65, '#0b101b');
  grad.addColorStop(1, '#06080f');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Subtle champagne-gold outer hairline
  ctx.beginPath();
  ctx.arc(cx, cy, 224, 0, Math.PI * 2);
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(231, 204, 130, 0.52)';
  ctx.stroke();

  // Inner thin brand accent ring
  ctx.beginPath();
  ctx.arc(cx, cy, 200, 0, Math.PI * 2);
  ctx.lineWidth = 2;
  ctx.strokeStyle = colorHex + '55';
  ctx.stroke();

  // Crisp Altcoin vector emblem
  drawAltcoinLogo(ctx, symbol, cx, cy - 68, 62, colorHex);

  // Clean Ticker symbol
  ctx.fillStyle = '#f8fafc';
  const fontSize = symbol.length >= 4 ? 54 : 62;
  ctx.font = `700 ${fontSize}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(symbol, cx, cy + 36);

  // Unboxed clean 5m readout
  const sign = change5m > 0 ? '+' : '';
  const pctStr = `${sign}${change5m.toFixed(2)}%`;
  ctx.fillStyle = statusText;
  ctx.font = '600 32px monospace';
  ctx.fillText(pctStr, cx, cy + 104);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Retained for compatibility: minimal unboxed sprite label if ever rendered
 */
export function createAltcoinBadgeSpriteTexture(
  symbol: string,
  change5m: number,
  _colorHex = '#e7cc82'
): THREE.CanvasTexture {
  const width = 420;
  const height = 100;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, width, height);

  const isPositive = change5m > 0;
  const isNegative = change5m < 0;
  const valueColor = isPositive ? '#6ee7b7' : isNegative ? '#fda4af' : '#cbd5e1';

  ctx.fillStyle = 'rgba(9, 13, 22, 0.86)';
  ctx.strokeStyle = 'rgba(231, 204, 130, 0.35)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(10, 12, width - 20, height - 24, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#f8fafc';
  ctx.font = '700 34px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(symbol, 34, height / 2 + 1);

  const sign = change5m > 0 ? '+' : '';
  const text = `${sign}${change5m.toFixed(2)}%`;
  ctx.fillStyle = valueColor;
  ctx.font = '600 34px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(text, width - 34, height / 2 + 1);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}


