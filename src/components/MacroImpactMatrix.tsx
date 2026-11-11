import React from 'react';
import {
  Coins,
  Scale,
  Globe,
  Zap,
  Activity,
  AlertTriangle,
  PieChart,
  Sparkles,
  TrendingUp,
  BarChart3,
  Layers,
} from 'lucide-react';
import { MacroNewsItem, MACRO_CATEGORIES } from '../types/macroNews';
import { TradingViewSingleQuote, TradingViewMiniChart } from './TradingViewWidgets';
import { sound } from '../audio/soundEngine';

interface MacroImpactMatrixProps {
  news: MacroNewsItem[];
  onSelectNews: (item: MacroNewsItem) => void;
}

export const MacroImpactMatrix: React.FC<MacroImpactMatrixProps> = ({ news, onSelectNews }) => {
  const highImpactNews = news.filter((n) => n.impactLevel === 'HIGH');
  const bullishNews = news.filter((n) => n.sentiment === 'BULLISH');
  const bearishNews = news.filter((n) => n.sentiment === 'BEARISH');

  // Category counts
  const categoryCounts = MACRO_CATEGORIES.map((cat) => {
    const count = news.filter((n) => n.category === cat.id).length;
    return { ...cat, count };
  });

  return (
    <div className="w-full h-full bg-[#05070c] p-4 sm:p-6 overflow-y-auto space-y-6 font-sans text-slate-100">
      {/* Dynamic Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none opacity-15 overflow-hidden z-0">
        <div className="absolute top-10 right-10 w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 space-y-6 max-w-[1780px] mx-auto">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#18253b] pb-4 bg-[#080c14]/80 backdrop-blur-md p-4 rounded-xl border border-[#1b2842]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-mono font-extrabold tracking-wider text-white">
                TRADINGVIEW LIVE MACRO ASSET IMPACT MATRIX
              </h2>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                Harga Real-Time & Chart Interaktif Langsung dari Streaming TradingView
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs bg-[#0b101c] px-3.5 py-1.5 rounded-lg border border-[#1d2b45] shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-slate-200 font-bold">STREAMING TRADINGVIEW DATA</span>
          </div>
        </div>

        {/* Grid 1: Live TradingView Single Quotes & Mini Charts Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: DXY Dollar Index */}
          <div className="bg-[#080c15] border border-[#1d2b45] hover:border-amber-400/50 rounded-xl p-4 space-y-3 shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between border-b border-[#16233a] pb-2">
              <span className="text-xs font-mono font-bold text-amber-300">US DOLLAR INDEX (DXY)</span>
              <Coins className="w-4 h-4 text-amber-400" />
            </div>
            <TradingViewSingleQuote symbol="TVC:DXY" />
            <TradingViewMiniChart symbol="TVC:DXY" height={165} />
            <div className="pt-2 text-[10px] font-mono text-slate-400 flex items-center justify-between border-t border-[#17233a]">
              <span>Sensitivitas Fed:</span>
              <span className="text-amber-300 font-bold">EKSTREM HIGH</span>
            </div>
          </div>

          {/* Card 2: BITCOIN (BTCUSDT) */}
          <div className="bg-[#080c15] border border-[#1d2b45] hover:border-orange-400/50 rounded-xl p-4 space-y-3 shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between border-b border-[#16233a] pb-2">
              <span className="text-xs font-mono font-bold text-orange-400">BITCOIN (BINANCE:BTCUSDT)</span>
              <Zap className="w-4 h-4 text-orange-400" />
            </div>
            <TradingViewSingleQuote symbol="BINANCE:BTCUSDT" />
            <TradingViewMiniChart symbol="BINANCE:BTCUSDT" height={165} />
            <div className="pt-2 text-[10px] font-mono text-slate-400 flex items-center justify-between border-t border-[#17233a]">
              <span>Korelas Likuiditas M2:</span>
              <span className="text-emerald-400 font-bold">+0.88 CONVEX</span>
            </div>
          </div>

          {/* Card 3: GOLD (XAUUSD) */}
          <div className="bg-[#080c15] border border-[#1d2b45] hover:border-yellow-400/50 rounded-xl p-4 space-y-3 shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between border-b border-[#16233a] pb-2">
              <span className="text-xs font-mono font-bold text-yellow-300">EMAS (OANDA:XAUUSD)</span>
              <Scale className="w-4 h-4 text-yellow-400" />
            </div>
            <TradingViewSingleQuote symbol="OANDA:XAUUSD" />
            <TradingViewMiniChart symbol="OANDA:XAUUSD" height={165} />
            <div className="pt-2 text-[10px] font-mono text-slate-400 flex items-center justify-between border-t border-[#17233a]">
              <span>Hedge Geopolitik:</span>
              <span className="text-yellow-300 font-bold">HIGH SAFE HAVEN</span>
            </div>
          </div>

          {/* Card 4: EURUSD FOREX */}
          <div className="bg-[#080c15] border border-[#1d2b45] hover:border-cyan-400/50 rounded-xl p-4 space-y-3 shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between border-b border-[#16233a] pb-2">
              <span className="text-xs font-mono font-bold text-cyan-300">EUR/USD (FX:EURUSD)</span>
              <Globe className="w-4 h-4 text-cyan-400" />
            </div>
            <TradingViewSingleQuote symbol="FX:EURUSD" />
            <TradingViewMiniChart symbol="FX:EURUSD" height={165} />
            <div className="pt-2 text-[10px] font-mono text-slate-400 flex items-center justify-between border-t border-[#17233a]">
              <span>Spread ECB vs FED:</span>
              <span className="text-cyan-300 font-bold">PARITY RISK</span>
            </div>
          </div>
        </div>

        {/* Second Row TradingView Charts: USDJPY & ETHUSDT & GBPUSD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-[#080c15] border border-[#1d2b45] hover:border-purple-400/50 rounded-xl p-4 space-y-2 shadow-xl">
            <div className="text-xs font-mono font-bold text-purple-300 flex items-center justify-between border-b border-[#16233a] pb-2">
              <span>USD/JPY (FX:USDJPY)</span>
              <span className="text-[10px] text-slate-400">Yen Carry Interventions</span>
            </div>
            <TradingViewMiniChart symbol="FX:USDJPY" height={175} />
          </div>

          <div className="bg-[#080c15] border border-[#1d2b45] hover:border-blue-400/50 rounded-xl p-4 space-y-2 shadow-xl">
            <div className="text-xs font-mono font-bold text-blue-300 flex items-center justify-between border-b border-[#16233a] pb-2">
              <span>ETHEREUM (BINANCE:ETHUSDT)</span>
              <span className="text-[10px] text-slate-400">Layer-1 Gas Collateral</span>
            </div>
            <TradingViewMiniChart symbol="BINANCE:ETHUSDT" height={175} />
          </div>

          <div className="bg-[#080c15] border border-[#1d2b45] hover:border-emerald-400/50 rounded-xl p-4 space-y-2 shadow-xl">
            <div className="text-xs font-mono font-bold text-emerald-300 flex items-center justify-between border-b border-[#16233a] pb-2">
              <span>GBP/USD (FX:GBPUSD)</span>
              <span className="text-[10px] text-slate-400">Bank of England Rate Shift</span>
            </div>
            <TradingViewMiniChart symbol="FX:GBPUSD" height={175} />
          </div>
        </div>

        {/* Main Grid: High-Impact Priority Column + Category Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          {/* Left 7 Cols: High Impact Priority Stream */}
          <div className="lg:col-span-7 bg-[#080c14] border border-[#1d2b45] rounded-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#18243b] pb-3">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
                <h3 className="text-sm font-mono font-bold text-white tracking-wider">
                  BERITA BERDAMPAK TINGGI TERHADAP PASAR (HIGH IMPACT WIRE)
                </h3>
              </div>
              <span className="text-xs font-mono text-red-400 font-bold bg-red-500/10 px-2.5 py-1 rounded border border-red-500/30">
                {highImpactNews.length} EVENT KRUSIAL
              </span>
            </div>

            <div className="space-y-3.5 max-h-[520px] overflow-y-auto pr-1">
              {highImpactNews.length === 0 ? (
                <div className="py-12 text-center text-xs font-mono text-slate-500">
                  Tidak ada peristiwa berdampak tinggi saat ini.
                </div>
              ) : (
                highImpactNews.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      sound.playClick(1300);
                      onSelectNews(item);
                    }}
                    className="p-4 rounded-xl bg-[#0c1220] border border-red-500/30 hover:border-amber-400 transition-all duration-200 cursor-pointer space-y-2.5 group shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                          {item.categoryLabel}
                        </span>
                        <span className="text-slate-400">{item.country}</span>
                      </div>
                      <span className="text-slate-400 font-semibold">{item.timestampWIB}</span>
                    </div>

                    <h4 className="font-mono text-xs sm:text-sm font-bold text-slate-100 group-hover:text-amber-300 leading-snug">
                      {item.title}
                    </h4>

                    <p className="text-xs font-sans text-slate-300 leading-relaxed line-clamp-2">
                      {item.summary}
                    </p>

                    <div className="flex items-center justify-between pt-1.5 text-[10px] font-mono border-t border-[#16233a]">
                      <span className="text-slate-500">Sumber: {item.source}</span>
                      <span className="text-amber-400 font-bold flex items-center gap-1 group-hover:underline">
                        <Sparkles className="w-3.5 h-3.5" /> Analisis Fundamental Makro
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right 5 Cols: Category Distribution & Sentiment Radar */}
          <div className="lg:col-span-5 space-y-5">
            {/* Sentiment Distribution Card */}
            <div className="bg-[#080c14] border border-[#1d2b45] rounded-xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#18243b] pb-3">
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                  DISTRIBUSI SENTIMEN MAKRO REAL-TIME
                </h3>
                <PieChart className="w-4 h-4 text-amber-400" />
              </div>

              <div className="grid grid-cols-3 gap-3 text-center font-mono">
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl shadow-sm">
                  <span className="text-[10px] text-emerald-400 uppercase block font-bold">BULLISH</span>
                  <span className="text-xl font-black text-emerald-300">{bullishNews.length}</span>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl shadow-sm">
                  <span className="text-[10px] text-red-400 uppercase block font-bold">BEARISH</span>
                  <span className="text-xl font-black text-red-300">{bearishNews.length}</span>
                </div>
                <div className="bg-slate-700/20 border border-slate-600/30 p-3 rounded-xl shadow-sm">
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">NEUTRAL</span>
                  <span className="text-xl font-black text-slate-300">
                    {news.length - bullishNews.length - bearishNews.length}
                  </span>
                </div>
              </div>
            </div>

            {/* 10 Categories Volume Monitor */}
            <div className="bg-[#080c14] border border-[#1d2b45] rounded-xl p-5 space-y-4 shadow-xl">
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider border-b border-[#18243b] pb-3">
                VOLUMETRIK 10 KATEGORI UTAMA MAKRO
              </h3>

              <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                {categoryCounts.map((cat) => {
                  const pct = news.length > 0 ? Math.round((cat.count / news.length) * 100) : 0;
                  return (
                    <div key={cat.id} className="p-2.5 rounded-lg bg-[#0c1220] border border-[#18253b] space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-slate-200">{cat.label}</span>
                        <span className="text-amber-400 font-bold">{cat.count} berita ({pct}%)</span>
                      </div>
                      <div className="w-full bg-[#121b2d] h-2 rounded-full overflow-hidden p-0.5 border border-[#1f2d48]">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${Math.max(5, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

