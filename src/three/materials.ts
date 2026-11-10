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
