export type FinishId = 'obsidian-gold' | 'stealth-titanium' | 'terminal-phosphor' | 'tungsten-crimson';

export type CameraPreset = 'macro' | 'core' | 'escapement' | 'radar' | 'topdown';

export interface ContrarianAnalysis {
  target: string;
  crowdingScore: number;
  sentimentPhase: string;
  asymmetryRatio: string;
  consensusNarrative: string;
  hiddenFragility: string;
  contrarianThesis: string;
  recommendedTrade: {
    stance: string;
    timeHorizon: string;
    expectedPayoff: string;
    invalidationRule: string;
  };
  catalysts: string[];
  historicalAnalog: {
    period: string;
    eventName: string;
    parallelLesson: string;
  };
  contrarianQuote: string;
}

export interface RadarItem {
  id: string;
  symbol: string;
  title: string;
  consensus: string;
  contrarianAngle: string;
  crowdingScore: number;
  asymmetryRatio: string;
  sentimentPhase: string;
  direction: string;
  timeframe: string;
  conviction: 'VERY HIGH' | 'HIGH' | 'MEDIUM-HIGH';
  catalysts: string[];
}

export interface FinishTheme {
  id: FinishId;
  name: string;
  subtitle: string;
  primaryMetalColor: number;
  secondaryMetalColor: number;
  accentGlowColor: number;
  coreCrystalColor: number;
  bgHorizonColor: number;
  ambientLightColor: number;
  keyLightColor: number;
  roughnessPrimary: number;
  metalnessPrimary: number;
  roughnessSecondary: number;
  metalnessSecondary: number;
}
