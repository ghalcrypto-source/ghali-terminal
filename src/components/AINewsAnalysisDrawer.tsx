import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  ExternalLink,
  Clock,
  Globe,
  TrendingUp,
  TrendingDown,
  MinusCircle,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Coins,
  Scale,
  Flame,
  RefreshCw,
} from 'lucide-react';
import { MacroNewsItem, AINewsAnalysis } from '../types/macroNews';
import { sound } from '../audio/soundEngine';

interface AINewsAnalysisDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: MacroNewsItem | null;
  userGeminiKey?: string;
}

export const AINewsAnalysisDrawer: React.FC<AINewsAnalysisDrawerProps> = ({
  isOpen,
  onClose,
  item,
  userGeminiKey,
}) => {
  const [analysis, setAnalysis] = useState<AINewsAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && item) {
      if (item.aiAnalysis) {
        setAnalysis(item.aiAnalysis);
      } else {
        runAnalysis();
      }
    } else {
      setAnalysis(null);
    }
  }, [isOpen, item]);

  const runAnalysis = () => {
    if (!item) return;
    setLoading(true);

    fetch('/api/macro/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: item.title,
        summary: item.summary,
        source: item.source,
        category: item.category,
        userGeminiKey,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.analysis) {
          setAnalysis(data.analysis);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#080c14] border-l border-[#1d2b45] h-full flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-[#1c2942] bg-[#0c1220] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-amber-500/15 border border-amber-500/40 text-amber-400">
              <Sparkles className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-mono font-bold tracking-wider text-white">
                  AI MACRO FUNDAMENTAL AUDIT
                </h2>
                <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40 font-bold">
                  GEMINI 3.8
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                Analisis dampak fundamental berita terhadap USD/DXY, Crypto, Gold & Forex
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                runAnalysis();
              }}
              disabled={loading}
              className="p-1.5 text-slate-400 hover:text-white rounded border border-[#25324e] hover:bg-[#1a2336] cursor-pointer"
              title="Regenerate Analysis"
            >
              <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded border border-[#25324e] hover:bg-[#1a2336] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Article Context Header */}
          <div className="p-4 rounded-xl bg-[#0d1424] border border-[#1f2d48] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-[#18243c] text-amber-300 border border-[#293d64]">
                  {item.source}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#121a2c] text-blue-300 border border-[#1f2e4a]">
                  {item.categoryLabel}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#141b2a] text-slate-400 border border-[#202b42]">
                  {item.country}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold text-slate-200">{item.timestampWIB}</span>
              </div>
            </div>

            <h1 className="font-mono text-base font-bold text-slate-100 leading-snug">
              {item.title}
            </h1>

            {/* Direct Source Link */}
            <div className="pt-2 border-t border-[#172238] flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">Tautan Resmi Berita Asli:</span>
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-bold hover:underline"
              >
                <span>Buka Artikel Original ({item.source})</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400 font-mono text-xs">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
              <span className="tracking-wider">GEMINI AI SEDANG MEMBEDAH HAKIKAT & DAMPAK MAKRO...</span>
            </div>
          ) : analysis ? (
            <div className="space-y-5">
              {/* Sentiment & Impact Level Meter */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#0e1628] border border-[#20304f] space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                    SENTIMEN PASAR:
                  </span>
                  <div className="flex items-center gap-2">
                    {analysis.marketSentiment === 'BULLISH' ? (
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                    ) : analysis.marketSentiment === 'BEARISH' ? (
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    ) : (
                      <MinusCircle className="w-5 h-5 text-slate-400" />
                    )}
                    <span
                      className={`text-sm font-mono font-bold ${
                        analysis.marketSentiment === 'BULLISH'
                          ? 'text-emerald-400'
                          : analysis.marketSentiment === 'BEARISH'
                          ? 'text-red-400'
                          : 'text-slate-300'
                      }`}
                    >
                      {analysis.marketSentiment}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0e1628] border border-[#20304f] space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                    TINGKAT DAMPAK PASAR:
                  </span>
                  <div className="flex items-center gap-2">
                    <Zap
                      className={`w-5 h-5 ${
                        analysis.impactLevel === 'HIGH'
                          ? 'text-red-400 animate-bounce'
                          : analysis.impactLevel === 'MEDIUM'
                          ? 'text-amber-400'
                          : 'text-blue-400'
                      }`}
                    />
                    <span
                      className={`text-sm font-mono font-bold ${
                        analysis.impactLevel === 'HIGH'
                          ? 'text-red-400'
                          : analysis.impactLevel === 'MEDIUM'
                          ? 'text-amber-300'
                          : 'text-blue-300'
                      }`}
                    >
                      {analysis.impactLevel} IMPACT
                    </span>
                  </div>
                </div>
              </div>

              {/* 1. Ringkasan Berita */}
              <div className="p-4 rounded-xl bg-[#0d1424] border border-[#1f2d48] space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <Flame className="w-4 h-4" />
                  <span>1. Ringkasan Eksekutif</span>
                </div>
                <p className="text-xs text-slate-200 font-sans leading-relaxed">
                  {analysis.summary}
                </p>
              </div>

              {/* 2. Fakta Utama */}
              <div className="p-4 rounded-xl bg-[#0d1424] border border-[#1f2d48] space-y-2.5">
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>2. Fakta Utama Berita</span>
                </div>
                <ul className="space-y-2">
                  {analysis.keyFacts.map((fact: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-xs font-sans text-slate-300">
                      <span className="text-amber-400 font-mono font-bold shrink-0 mt-0.5">•</span>
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3. Mengapa Berita Ini Penting */}
              <div className="p-4 rounded-xl bg-[#0d1424] border border-[#1f2d48] space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <Zap className="w-4 h-4" />
                  <span>3. Mengapa Berita Ini Sangat Penting?</span>
                </div>
                <p className="text-xs text-slate-200 font-sans leading-relaxed">
                  {analysis.whyItMatters}
                </p>
              </div>

              {/* 4. Multi-Asset Impact Matrix */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  4. PROYEKSI DAMPAK MULTI-ASET (CRYPTO, FOREX, GOLD)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* USD & DXY */}
                  <div className="p-3.5 rounded-xl bg-[#0d1526] border border-[#213254] space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-300">
                      <span>USD & DXY (Dollar Index)</span>
                      <Coins className="w-4 h-4 text-amber-400" />
                    </div>
                    <p className="text-xs font-sans text-slate-300 leading-relaxed">
                      {analysis.usdDxyImpact}
                    </p>
                  </div>

                  {/* Bitcoin & Ethereum */}
                  <div className="p-3.5 rounded-xl bg-[#0d1526] border border-[#213254] space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-orange-400">
                      <span>BITCOIN & ETHEREUM</span>
                      <Zap className="w-4 h-4 text-orange-400" />
                    </div>
                    <p className="text-xs font-sans text-slate-300 leading-relaxed">
                      {analysis.cryptoImpact}
                    </p>
                  </div>

                  {/* Gold XAUUSD */}
                  <div className="p-3.5 rounded-xl bg-[#0d1526] border border-[#213254] space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-yellow-300">
                      <span>EMAS (XAUUSD)</span>
                      <Scale className="w-4 h-4 text-yellow-400" />
                    </div>
                    <p className="text-xs font-sans text-slate-300 leading-relaxed">
                      {analysis.goldImpact}
                    </p>
                  </div>

                  {/* Forex Pairs */}
                  <div className="p-3.5 rounded-xl bg-[#0d1526] border border-[#213254] space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-cyan-300">
                      <span>FOREX (EURUSD, USDJPY, GBPUSD)</span>
                      <Globe className="w-4 h-4 text-cyan-400" />
                    </div>
                    <p className="text-xs font-sans text-slate-300 leading-relaxed">
                      {analysis.forexImpact}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timestamp Footer */}
              <div className="p-3 rounded-lg bg-[#070b13] border border-[#1a263d] text-center text-[11px] font-mono text-slate-500">
                Analisis makro Gemini dieksekusi pada: <span className="text-slate-300 font-semibold">{analysis.analyzedAtWIB}</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
