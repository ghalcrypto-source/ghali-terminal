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
 * Creates high-precision procedural dial face texture with calibration ticks,
 * Roman degrees, and contrarian quadrant inscriptions.
 */
export function createVernierDialTexture(accentHex: string): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const cx = size / 2;
  const cy = size / 2;

  // Dark metallic slate background with subtle concentric rings
  ctx.fillStyle = '#0a0d14';
  ctx.fillRect(0, 0, size, size);

  // Concentric etched rings
  const radii = [480, 450, 420, 380, 350, 240, 160, 100];
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1.5;
  for (const r of radii) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Accent circular track
  ctx.strokeStyle = accentHex;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, 450, 0, Math.PI * 2);
  ctx.stroke();

  // Draw 360 degree radial tick marks
  for (let i = 0; i < 360; i++) {
    const angle = (i * Math.PI) / 180;
    const isMajor = i % 30 === 0;
    const isMid = i % 10 === 0 && !isMajor;
    const isQuarter = i % 90 === 0;

    const rOuter = 450;
    const rInner = isQuarter ? 400 : isMajor ? 415 : isMid ? 430 : 440;

    const x1 = cx + Math.cos(angle) * rOuter;
    const y1 = cy + Math.sin(angle) * rOuter;
    const x2 = cx + Math.cos(angle) * rInner;
    const y2 = cy + Math.sin(angle) * rInner;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = isQuarter
      ? accentHex
      : isMajor
      ? 'rgba(255, 255, 255, 0.7)'
      : isMid
      ? 'rgba(255, 255, 255, 0.35)'
      : 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = isQuarter ? 3 : isMajor ? 2 : 1;
    ctx.stroke();

    // Degree numbers at major intervals
    if (isMajor) {
      const textR = 390;
      const tx = cx + Math.cos(angle) * textR;
      const ty = cy + Math.sin(angle) * textR;
      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(angle + Math.PI / 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.font = '600 13px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${i}°`, 0, 0);
      ctx.restore();
    }
  }

  // Contrarian Quadrants labels
  const quadrants = [
    { text: 'QUADRANT I • HERD EUPHORIA (FRAGILE)', angle: 0 },
    { text: 'QUADRANT II • ASYMMETRIC SHORT DISLOCATION', angle: Math.PI / 2 },
    { text: 'QUADRANT III • CAPITULATION / DEEP VALUE', angle: Math.PI },
    { text: 'QUADRANT IV • CONVEX REFLATION ACCELERATOR', angle: (3 * Math.PI) / 2 },
  ];

  for (const q of quadrants) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(q.angle);
    ctx.fillStyle = accentHex;
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '2px';
    ctx.fillText(q.text, 0, -320);
    ctx.restore();
  }

  // Center emblem
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GHALI TERMINAL', cx, cy - 25);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = '12px monospace';
  ctx.fillText('VERNIER SENTIMENT HORIZON • 0.001 RAD', cx, cy - 5);
  ctx.fillText('AUTONOMOUS REFLEXIVITY AUDIT', cx, cy + 15);
  ctx.restore();

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
 * Creates high-craft procedural 24k Gold Bitcoin Sovereign Core face texture
 */
export function createBitcoinCoreTexture(accentHex = '#f59e0b'): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const cx = size / 2;
  const cy = size / 2;

  // Metallic sovereign gold radial gradient
  const grad = ctx.createRadialGradient(cx - 120, cy - 120, 40, cx, cy, 512);
  grad.addColorStop(0, '#fef08a');
  grad.addColorStop(0.28, '#f59e0b');
  grad.addColorStop(0.68, '#b45309');
  grad.addColorStop(1, '#451a03');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Dark inner medallion backdrop for sharp ₿ contrast
  ctx.beginPath();
  ctx.arc(cx, cy, 380, 0, Math.PI * 2);
  ctx.fillStyle = '#140c02';
  ctx.fill();
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#fbbf24';
  ctx.stroke();

  // Concentric calibration rings
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.35)';
  ctx.lineWidth = 3;
  for (const r of [430, 350, 315, 250]) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 72 milled radial coin ticks around perimeter
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    const isMajor = i % 6 === 0;
    const r1 = 465;
    const r2 = isMajor ? 415 : 438;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
    ctx.strokeStyle = isMajor ? '#fef08a' : 'rgba(251, 191, 36, 0.55)';
    ctx.lineWidth = isMajor ? 5 : 2;
    ctx.stroke();
  }

  // Subtle cryptographic hex grid lines inside medallion
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.14)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * 340, cy + Math.sin(a) * 340);
    ctx.stroke();
  }

  // Embossed glow behind ₿ symbol
  const glow = ctx.createRadialGradient(cx, cy, 20, cx, cy, 240);
  glow.addColorStop(0, 'rgba(251, 191, 36, 0.42)');
  glow.addColorStop(0.6, accentHex + '22');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, 240, 0, Math.PI * 2);
  ctx.fill();

  // Iconic tilted Bitcoin ₿ emblem
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(0.18); // Classic ~10 deg Bitcoin tilt

  // Shadow layer
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.font = '900 390px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('₿', 8, 18);

  // Gold gradient fill for ₿
  const bGrad = ctx.createLinearGradient(-150, -200, 150, 200);
  bGrad.addColorStop(0, '#fef9c3');
  bGrad.addColorStop(0.45, '#fbbf24');
  bGrad.addColorStop(1, '#d97706');
  ctx.fillStyle = bGrad;
  ctx.fillText('₿', 0, 8);

  ctx.lineWidth = 4;
  ctx.strokeStyle = '#fef08a';
  ctx.strokeText('₿', 0, 8);
  ctx.restore();

  // Top & Bottom Sovereign Inscriptions
  ctx.fillStyle = '#fde68a';
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('BITCOIN • BTC', cx, 190);
  ctx.fillStyle = 'rgba(253, 230, 138, 0.8)';
  ctx.font = 'bold 22px monospace';
  ctx.fillText('SOVEREIGN LIQUIDITY CORE', cx, size - 178);

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
 * Creates crisp procedural medallion face texture for orbiting Altcoins with logo + live 5m +/- sign
 */
export function createAltcoinFaceTexture(
  symbol: string,
  name: string,
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
  const statusColor = isPositive ? '#10b981' : isNegative ? '#ef4444' : '#94a3b8';
  const statusText = isPositive ? '#6ee7b7' : isNegative ? '#fda4af' : '#cbd5e1';

  // Deep obsidian base
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, size, size);

  // Brand color radial halo
  const grad = ctx.createRadialGradient(cx, cy - 30, 15, cx, cy, 250);
  grad.addColorStop(0, colorHex + '55');
  grad.addColorStop(0.6, colorHex + '1a');
  grad.addColorStop(1, '#070a12');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, 250, 0, Math.PI * 2);
  ctx.fill();

  // Outer glowing border ring colored by 5m +/- momentum
  ctx.beginPath();
  ctx.arc(cx, cy, 224, 0, Math.PI * 2);
  ctx.lineWidth = 14;
  ctx.strokeStyle = statusColor;
  ctx.stroke();

  // Inner brand ring
  ctx.beginPath();
  ctx.arc(cx, cy, 196, 0, Math.PI * 2);
  ctx.lineWidth = 5;
  ctx.strokeStyle = colorHex;
  ctx.stroke();

  // Prominent Vector Altcoin Logo (upper-center)
  drawAltcoinLogo(ctx, symbol, cx, cy - 92, 66, colorHex);

  // Ticker symbol below logo
  ctx.fillStyle = '#ffffff';
  const fontSize = symbol.length >= 4 ? 64 : 74;
  ctx.font = `900 ${fontSize}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(symbol, cx, cy + 4);

  // 5-Minute +/- Pill directly on coin face
  const sign = change5m > 0 ? '+' : '';
  const arrow = change5m > 0 ? '▲' : change5m < 0 ? '▼' : '●';
  const pctStr = `${arrow} ${sign}${change5m.toFixed(2)}%`;

  ctx.fillStyle = isPositive ? 'rgba(16, 185, 129, 0.24)' : isNegative ? 'rgba(239, 68, 68, 0.26)' : 'rgba(148, 163, 184, 0.2)';
  ctx.strokeStyle = statusColor;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(cx - 135, cy + 44, 270, 62, 14);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = statusText;
  ctx.font = '900 38px monospace';
  ctx.fillText(pctStr, cx, cy + 76);

  // 5M & Name subtitle
  ctx.fillStyle = colorHex;
  ctx.font = 'bold 21px monospace';
  ctx.fillText(`5M • ${name.toUpperCase()}`, cx, cy + 136);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates camera-facing floating 3D sprite badge texture showing Altcoin Logo + Ticker + 5M +/- status
 */
export function createAltcoinBadgeSpriteTexture(
  symbol: string,
  change5m: number,
  colorHex = '#38bdf8'
): THREE.CanvasTexture {
  const width = 580;
  const height = 160;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, width, height);

  const isPositive = change5m > 0;
  const isNegative = change5m < 0;
  const borderColor = isPositive ? '#10b981' : isNegative ? '#ef4444' : '#64748b';
  const bgColor = isPositive
    ? 'rgba(6, 36, 26, 0.94)'
    : isNegative
    ? 'rgba(42, 10, 16, 0.94)'
    : 'rgba(15, 23, 42, 0.94)';
  const valueColor = isPositive ? '#34d399' : isNegative ? '#fb7185' : '#cbd5e1';

  // Badge body
  ctx.fillStyle = bgColor;
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(12, 14, width - 24, height - 28, 28);
  ctx.fill();
  ctx.stroke();

  // Circular Coin Logo Emblem on the left
  ctx.fillStyle = '#090d16';
  ctx.strokeStyle = colorHex;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(76, height / 2, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  drawAltcoinLogo(ctx, symbol, 76, height / 2, 34, colorHex);

  // Ticker label (middle-left)
  ctx.fillStyle = '#f8fafc';
  ctx.font = '900 46px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(symbol, 138, height / 2 - 15);

  // 5M micro sub-label under ticker
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 24px monospace';
  ctx.fillText('5 MENIT', 138, height / 2 + 32);

  // Divider line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(278, 32);
  ctx.lineTo(278, height - 32);
  ctx.stroke();

  // Prominent Plus / Minus Value (right)
  const sign = change5m > 0 ? '+' : '';
  const arrow = change5m > 0 ? '▲' : change5m < 0 ? '▼' : '●';
  const text = `${arrow} ${sign}${change5m.toFixed(2)}%`;

  ctx.fillStyle = valueColor;
  ctx.font = '900 48px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(text, width - 34, height / 2 + 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}


