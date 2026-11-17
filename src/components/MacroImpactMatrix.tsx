import React, { useState } from 'react';
import {
  Coins,
  Scale,
  Globe,
  Zap,
  Activity,
  AlertTriangle,
  PieChart,
  Sparkles,
} from 'lucide-react';
import { MacroNewsItem, MACRO_CATEGORIES } from '../types/macroNews';
import { TradingViewSingleQuote, TradingViewMiniChart } from './TradingViewWidgets';
import { sound } from '../audio/soundEngine';

interface MacroImpactMatrixProps {
  news: MacroNewsItem[];
  onSelectNews: (item: MacroNewsItem) => void;
}

const MOBILE_ASSETS = [
  { id: 'DXY', label: 'DXY Dollar', tvSymbol: 'TVC:DXY', note: 'Sensitivitas Fed · Ekstrem Tinggi' },
  { id: 'BTC', label: 'Bitcoin', tvSymbol: 'BINANCE:BTCUSDT', note: 'Korelasi M2 +0.88 Convex' },
  { id: 'GOLD', label: 'Emas XAU', tvSymbol: 'OANDA:XAUUSD', note: 'Lindung Nilai Geopolitik' },
  { id: 'EURUSD', label: 'EUR/USD', tvSymbol: 'FX:EURUSD', note: 'Spread ECB vs Federal Reserve' },
  { id: 'USDJPY', label: 'USD/JPY', tvSymbol: 'FX:USDJPY', note: 'Risiko Intervensi Yen Carry' },
  { id: 'ETH', label: 'Ethereum', tvSymbol: 'BINANCE:ETHUSDT', note: 'Layer-1 Gas Collateral' },
  { id: 'GBPUSD', label: 'GBP/USD', tvSymbol: 'FX:GBPUSD', note: 'Bank of England Rate Shift' },
];

export const MacroImpactMatrix: React.FC<MacroImpactMatrixProps> = ({ news, onSelectNews }) => {
  const [mobileTab, setMobileTab] = useState<'assets' | 'impact' | 'sentiment'>('assets');
  const [selectedMobileAsset, setSelectedMobileAsset] = useState(MOBILE_ASSETS[0]);

  const highImpactNews = news.filter((n) => n.impactLevel === 'HIGH');
  const bullishNews = news.filter((n) => n.sentiment === 'BULLISH');
  const bearishNews = news.filter((n) => n.sentiment === 'BEARISH');
  const neutralCount = Math.max(0, news.length - bullishNews.length - bearishNews.length);

  const categoryCounts = MACRO_CATEGORIES.map((cat) => {
    const count = news.filter((n) => n.category === cat.id).length;
    return { ...cat, count };
  });

  return (
    <div className="w-full h-full bg-[#05070c] overflow-y-auto font-sans text-slate-100">
      {/* =================================================================== */}
      {/* 1. MOBILE SUPERAPP IMPACT MATRIX (OBS-GOLD 3-TAB ERGONOMIC VIEW)    */}
      {/* =================================================================== */}
      <div className="block md:hidden w-full min-h-full bg-[#070a11] pb-6">
        <div className="sticky top-0 z-20 px-4 pt-3 pb-2.5 bg-[#070a11]/95 backdrop-blur-md border-b border-[#1c263b] space-y-2.5">
          <div>
            <h2 className="text-[15px] font-semibold text-[#f5e3af]">
              Matriks Dampak Aset Makro
            </h2>
            <p className="text-[11px] text-slate-400">
              DXY, Emas, Forex &amp; Kripto TradingView Live
            </p>
          </div>

          <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-[#0a0f1c] border border-[#1b2438]">
            {[
              { id: 'assets' as const, label: 'Aset & Chart' },
              { id: 'impact' as const, label: `Krusial (${highImpactNews.length})` },
              { id: 'sentiment' as const, label: 'Sentimen' },
            ].map((tab) => {
              const active = mobileTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sound.playClick();
                    setMobileTab(tab.id);
                  }}
                  className={`min-h-[40px] rounded-xl text-xs font-semibold transition-colors cursor-pointer tabular-nums ${
                    active
                      ? 'bg-[#e7cc82] text-[#080b12] shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-4 pt-3.5 space-y-4">
          {/* TAB 1: FOCUSED ASSET SWITCHER + TRADINGVIEW CHART */}
          {mobileTab === 'assets' && (
            <section className="space-y-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {MOBILE_ASSETS.map((asset) => {
                  const active = selectedMobileAsset.id === asset.id;
                  return (
                    <button
                      key={asset.id}
                      onClick={() => {
                        sound.playClick();
                        setSelectedMobileAsset(asset);
                      }}
                      className={`min-h-[40px] px-3.5 rounded-2xl text-xs font-semibold whitespace-nowrap shrink-0 border transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#17223a] border-[#d4af37] text-[#f5e3af]'
                          : 'bg-[#0b101d] border-[#1d283f] text-slate-300'
                      }`}
                    >
                      {asset.label}
                    </button>
                  );
                })}
              </div>

              <div className="rounded-3xl bg-[#0b101d] border border-[#24314a] border-t-[#d4af37]/50 p-4 space-y-3 shadow-xl">
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#192338]">
                  <span className="text-xs font-semibold text-[#f5e3af]">
                    {selectedMobileAsset.label} ({selectedMobileAsset.tvSymbol})
                  </span>
                  <span className="text-[11px] text-slate-400 truncate">
                    {selectedMobileAsset.note}
                  </span>
                </div>
                <TradingViewSingleQuote symbol={selectedMobileAsset.tvSymbol} />
                <TradingViewMiniChart symbol={selectedMobileAsset.tvSymbol} height={220} />
              </div>
            </section>
          )}

          {/* TAB 2: HIGH IMPACT PRIORITY STREAM */}
          {mobileTab === 'impact' && (
            <section className="space-y-2.5">
              {highImpactNews.length === 0 ? (
                <div className="py-16 text-center rounded-3xl bg-[#0b101d] border border-[#1d283f] text-xs text-slate-400">
                  Tidak ada peristiwa berdampak tinggi saat ini.
                </div>
              ) : (
                <div className="rounded-3xl bg-[#0b101d] border border-[#1d283f] divide-y divide-[#162035] overflow-hidden">
                  {highImpactNews.map((item) => (
                    <button
                      key={`mob-hi-${item.id}`}
                      onClick={() => {
                        sound.playClick(1300);
                        onSelectNews(item);
                      }}
                      className="w-full p-4 text-left space-y-2 hover:bg-[#11192b] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="text-rose-400 font-semibold">
                          Dampak Tinggi · {item.categoryLabel}
                        </span>
                        <span className="font-mono tabular-nums">{item.timestampWIB}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-white leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {item.summary}
                      </p>
                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <span className="text-slate-500">{item.source}</span>
                        <span className="text-[#e7cc82] font-semibold inline-flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Bedah AI</span>
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* TAB 3: SENTIMENT DISTRIBUTION & TOP CATEGORIES */}
          {mobileTab === 'sentiment' && (
            <section className="space-y-4">
              <div className="rounded-3xl bg-[#0b101d] border border-[#1d283f] p-4 space-y-3">
                <h3 className="text-xs font-semibold text-[#f5e3af]">
                  Distribusi Sentimen Makro Real-Time
                </h3>
                <div className="grid grid-cols-3 gap-2 text-center font-mono tabular-nums">
                  <div className="p-3 rounded-2xl bg-[#070a11] border border-emerald-500/30">
                    <div className="text-[10px] text-emerald-400 font-semibold">Bullish</div>
                    <div className="text-xl font-bold text-emerald-300 mt-0.5">{bullishNews.length}</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#070a11] border border-rose-500/30">
                    <div className="text-[10px] text-rose-400 font-semibold">Bearish</div>
                    <div className="text-xl font-bold text-rose-300 mt-0.5">{bearishNews.length}</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#070a11] border border-[#24314a]">
                    <div className="text-[10px] text-slate-400 font-semibold">Netral</div>
                    <div className="text-xl font-bold text-slate-200 mt-0.5">{neutralCount}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-[#0b101d] border border-[#1d283f] p-4 space-y-3">
                <h3 className="text-xs font-semibold text-white">
                  Sebaran Kategori Berita
                </h3>
                <div className="space-y-2.5">
                  {categoryCounts.map((cat) => {
                    const pct = news.length > 0 ? Math.round((cat.count / news.length) * 100) : 0;
                    return (
                      <div key={`mob-cat-${cat.id}`} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                          <span className="text-slate-200 font-medium font-sans">{cat.label}</span>
                          <span className="text-[#e7cc82] font-semibold">
                            {cat.count} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#070a11] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#b88924] to-[#f5e3af]"
                            style={{ width: `${Math.max(4, pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. DESKTOP WEB TERMINAL MATRIX (PRESERVED INTACT)                   */}
      {/* =================================================================== */}
      <div className="hidden md:block p-4 sm:p-6 space-y-6">
        <div className="fixed inset-0 pointer-events-none opacity-15 overflow-hidden z-0">
          <div className="absolute top-10 right-10 w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[120px]" />
          <div className="absolute bottom-10 left-10 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />
        </div>

        <div className="relative z-10 space-y-6 max-w-[1780px] mx-auto">
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
                  Harga Real-Time &amp; Chart Interaktif Langsung dari Streaming TradingView
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs bg-[#0b101c] px-3.5 py-1.5 rounded-lg border border-[#1d2b45] shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-slate-200 font-bold">STREAMING TRADINGVIEW DATA</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
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

            <div className="lg:col-span-5 space-y-5">
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
                    <span className="text-xl font-black text-slate-300">{neutralCount}</span>
                  </div>
                </div>
              </div>

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
    </div>
  );
};
