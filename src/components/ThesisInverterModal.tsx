import React, { useState } from 'react';
import {
  X,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  History,
  Quote,
  Loader2,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { ContrarianAnalysis } from '../types/contrarian';
import { sound } from '../audio/soundEngine';

interface ThesisInverterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAsset?: string;
}

const PRESET_TOPICS = [
  { symbol: 'AI CAPEX', label: 'AI Hardware Infrastructure Mania' },
  { symbol: 'TLT / US 30Y', label: 'Long Duration Sovereign Treasuries' },
  { symbol: 'USD/JPY', label: 'Global Yen Carry Trade Architecture' },
  { symbol: 'URANIUM', label: 'Baseload Nuclear & Uranium Deficit' },
  { symbol: 'CHINA TECH', label: 'Deep Value Chinese Equities' },
  { symbol: 'GOLD / XAU', label: 'Central Bank Gold Accumulation' },
  { symbol: 'PRIVATE CREDIT', label: 'Shadow Banking Illiquidity' },
];

export const ThesisInverterModal: React.FC<ThesisInverterModalProps> = ({
  isOpen,
  onClose,
  initialAsset = '',
}) => {
  const [assetInput, setAssetInput] = useState(initialAsset || 'Hyperscaler AI Infrastructure');
  const [userThesis, setUserThesis] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ContrarianAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAnalyze = async (targetAsset = assetInput) => {
    if (!targetAsset.trim()) return;
    setLoading(true);
    setError(null);
    sound.playSonarPing();

    try {
      const res = await fetch('/api/contrarian/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset: targetAsset,
          userThesis: userThesis.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setAnalysis(json.data);
        sound.playClick(1500);
      } else {
        setError('Analysis engine returned an invalid response. Please retry.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to contrarian intelligence server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-none">
      <div className="bg-[#0b0f18] border border-[#23314d] rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1c273e] bg-[#0e1422]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/30">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold tracking-wider text-slate-100">
                AI CONTRARIAN INVERSION ENGINE
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                Deconstructs crowd delusion • Identifies asymmetric convexity • Howard Marks & Nassim Taleb heuristic
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-white rounded border border-[#25324e] hover:bg-[#1a2336] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Preset Buttons */}
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
              High-Conviction Consensus Presets:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TOPICS.map((p) => (
                <button
                  key={p.symbol}
                  onClick={() => {
                    sound.playClick();
                    setAssetInput(p.label);
                    handleAnalyze(p.label);
                  }}
                  className="px-2.5 py-1 rounded bg-[#101726] hover:bg-[#1a243a] border border-[#212f49] hover:border-amber-500/50 text-[11px] font-mono text-slate-300 transition-colors cursor-pointer"
                >
                  <span className="text-amber-400 font-semibold mr-1.5">{p.symbol}</span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <div className="bg-[#0e1422] border border-[#1d2940] rounded-lg p-3 sm:p-4 space-y-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-300 uppercase mb-1">
                Asset, Ticker, or Macroeconomic Theme
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={assetInput}
                  onChange={(e) => setAssetInput(e.target.value)}
                  placeholder="e.g. Nvidia $5T Cap, US 30-Year Bonds, Bitcoin $150k, Commercial Real Estate..."
                  className="flex-1 bg-[#080c14] border border-[#23314d] focus:border-amber-400 rounded px-3 py-2 text-xs font-mono text-slate-100 placeholder:text-slate-600 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAnalyze();
                  }}
                />
                <button
                  onClick={() => handleAnalyze()}
                  disabled={loading || !assetInput.trim()}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-mono font-bold text-xs px-4 py-2 rounded transition-all cursor-pointer shadow-md"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                      <span>INVERTING...</span>
                    </>
                  ) : (
                    <>
                      <span>INVERT CONSENSUS</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                Optional: What does consensus or your thesis assume?
              </label>
              <textarea
                value={userThesis}
                onChange={(e) => setUserThesis(e.target.value)}
                rows={2}
                placeholder="e.g. Wall Street models forecast 45% annual EPS growth with zero customer budget exhaustion..."
                className="w-full bg-[#080c14] border border-[#23314d] focus:border-amber-400 rounded p-2 text-xs font-mono text-slate-200 placeholder:text-slate-600 outline-none resize-none"
              />
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              <div className="font-mono text-xs text-amber-300 font-semibold">
                QUANTIFYING HERD REFLEXIVITY & SKEW DISLOCATION...
              </div>
              <div className="text-[11px] font-mono text-slate-500 max-w-sm">
                Parsing public narrative consensus • Calculating asymmetric tail ratios • Cross-referencing historical bubble analogs
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 rounded text-xs font-mono">
              {error}
            </div>
          )}

          {/* Analysis Results Display */}
          {analysis && !loading && (
            <div className="space-y-4 pt-2">
              {/* Score Bar & Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Crowding Score */}
                <div className="bg-[#0e1422] border border-[#202c44] rounded-lg p-3">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 uppercase">
                    <span>Crowd Positioning</span>
                    <Flame className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-mono font-bold text-amber-400">
                      {analysis.crowdingScore}
                    </span>
                    <span className="text-xs font-mono text-slate-500">/ 100</span>
                  </div>
                  <div className="w-full bg-[#182236] h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        analysis.crowdingScore > 75
                          ? 'bg-red-500'
                          : analysis.crowdingScore < 30
                          ? 'bg-emerald-400'
                          : 'bg-amber-400'
                      }`}
                      style={{ width: `${Math.min(analysis.crowdingScore, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Sentiment Phase */}
                <div className="bg-[#0e1422] border border-[#202c44] rounded-lg p-3">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">
                    Psychology Cycle Phase
                  </div>
                  <div className="mt-1 text-sm font-mono font-bold text-slate-200">
                    {analysis.sentimentPhase}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-2">
                    Target: <span className="text-slate-300 font-medium">{analysis.target}</span>
                  </div>
                </div>

                {/* Asymmetry Ratio */}
                <div className="bg-[#0e1422] border border-[#202c44] rounded-lg p-3">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">
                    Asymmetric Risk : Reward
                  </div>
                  <div className="mt-1 text-2xl font-mono font-bold text-emerald-400">
                    {analysis.asymmetryRatio}
                  </div>
                  <div className="text-[10px] font-mono text-emerald-500 mt-2">
                    Positive Convex Skew
                  </div>
                </div>
              </div>

              {/* 1. Delusional Consensus vs 2. Hidden Fragility */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Consensus Delusion */}
                <div className="bg-[#12141d] border border-red-900/40 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-red-400 uppercase tracking-wider mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span>1. The Delusional Consensus</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {analysis.consensusNarrative}
                  </p>
                </div>

                {/* Hidden Fragility */}
                <div className="bg-[#12141d] border border-amber-900/40 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-2">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <span>2. The Hidden Fragility</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {analysis.hiddenFragility}
                  </p>
                </div>
              </div>

              {/* 3. The Contrarian Asymmetry Play */}
              <div className="bg-[#0b161f] border border-cyan-800/60 rounded-lg p-4">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>3. The Contrarian Asymmetry Play</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans mb-3">
                  {analysis.contrarianThesis}
                </p>

                {/* Execution parameters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-cyan-900/40 text-[11px] font-mono">
                  <div>
                    <span className="text-slate-500 block">STANCE:</span>
                    <span className="text-cyan-300 font-semibold">
                      {analysis.recommendedTrade?.stance}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">HORIZON:</span>
                    <span className="text-slate-300">
                      {analysis.recommendedTrade?.timeHorizon}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">PAYOFF:</span>
                    <span className="text-emerald-400 font-semibold">
                      {analysis.recommendedTrade?.expectedPayoff}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">INVALIDATION:</span>
                    <span className="text-slate-400 truncate block" title={analysis.recommendedTrade?.invalidationRule}>
                      {analysis.recommendedTrade?.invalidationRule}
                    </span>
                  </div>
                </div>
              </div>

              {/* Catalysts & Historical Analog */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Catalysts */}
                <div className="bg-[#0e1422] border border-[#1f2b42] rounded-lg p-4">
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                    Acceleration & Invalidation Catalysts
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
                    {analysis.catalysts?.map((cat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">[{idx + 1}]</span>
                        <span>{cat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Historical Analog */}
                <div className="bg-[#0e1422] border border-[#1f2b42] rounded-lg p-4">
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                    <History className="w-3.5 h-3.5 text-amber-400" />
                    <span>Historical Parallel: {analysis.historicalAnalog?.period}</span>
                  </div>
                  <div className="text-xs font-mono font-semibold text-amber-300 mb-1">
                    {analysis.historicalAnalog?.eventName}
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {analysis.historicalAnalog?.parallelLesson}
                  </p>
                </div>
              </div>

              {/* Contrarian Quote */}
              <div className="bg-[#090d14] border border-[#192336] rounded-lg p-3 flex items-start gap-2.5">
                <Quote className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs italic font-serif text-slate-400">
                  {analysis.contrarianQuote}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
