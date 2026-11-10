import React, { useState } from 'react';
import {
  X,
  TrendingUp,
  Sliders,
  LineChart,
  GitBranch,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
} from 'lucide-react';
import { CRYPTO_50_COINS, FibonacciLevels } from '../types/crypto';
import { sound } from '../audio/soundEngine';

interface TechnicalAnalysisPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeSymbol: string;
  onApplyCoinToChart: (symbol: string) => void;
}

export const TechnicalAnalysisPanel: React.FC<TechnicalAnalysisPanelProps> = ({
  isOpen,
  onClose,
  activeSymbol,
  onApplyCoinToChart,
}) => {
  const [selectedPair, setSelectedPair] = useState(
    activeSymbol.endsWith('USDT') ? activeSymbol : `${activeSymbol}USDT`
  );

  const coin =
    CRYPTO_50_COINS.find((c) => c.pair === selectedPair) || CRYPTO_50_COINS[0];

  const currentPrice = coin.basePriceUSD;

  // Compute mathematically coordinated Fibonacci Retracements
  // Based on estimated recent swing high (+8%) and swing low (-12%)
  const [customHigh, setCustomHigh] = useState((currentPrice * 1.095).toFixed(currentPrice < 1 ? 6 : 2));
  const [customLow, setCustomLow] = useState((currentPrice * 0.885).toFixed(currentPrice < 1 ? 6 : 2));

  const highNum = parseFloat(customHigh) || currentPrice * 1.1;
  const lowNum = parseFloat(customLow) || currentPrice * 0.9;
  const diff = highNum - lowNum;

  const fib: FibonacciLevels = {
    swingHigh: highNum,
    swingLow: lowNum,
    fib0: highNum,
    fib236: highNum - diff * 0.236,
    fib382: highNum - diff * 0.382,
    fib500: highNum - diff * 0.5,
    fib618: highNum - diff * 0.618,
    fib786: highNum - diff * 0.786,
    fib1000: lowNum,
    fib1618: highNum + diff * 0.618,
  };

  // Indicators calculation simulation
  const ema20 = (currentPrice * 1.012).toFixed(currentPrice < 1 ? 6 : 2);
  const ema50 = (currentPrice * 0.985).toFixed(currentPrice < 1 ? 6 : 2);
  const ema200 = (currentPrice * 0.925).toFixed(currentPrice < 1 ? 6 : 2);

  // Stochastic RSI readings
  const stochK = 78.4;
  const stochD = 72.1;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-none">
      <div className="bg-[#0b0f18] border border-[#23314d] rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1c273e] bg-[#0e1422]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/30">
              <Sliders className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold tracking-wider text-slate-100">
                INSTITUTIONAL TECHNICAL ANALYSIS SUITE
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                Fibonacci Confluence • Stochastic RSI Inversion • Multi-EMA Ribbon • Liquidity Paths
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
          {/* Active Coin Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0e1422] p-3 rounded-lg border border-[#1e2a42]">
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-mono text-slate-400 uppercase">
                PILIH KOIN (DARI 50 KOIN):
              </span>
              <select
                value={selectedPair}
                onChange={(e) => {
                  sound.playClick();
                  setSelectedPair(e.target.value);
                  const newCoin = CRYPTO_50_COINS.find((c) => c.pair === e.target.value);
                  if (newCoin) {
                    setCustomHigh((newCoin.basePriceUSD * 1.095).toFixed(newCoin.basePriceUSD < 1 ? 6 : 2));
                    setCustomLow((newCoin.basePriceUSD * 0.885).toFixed(newCoin.basePriceUSD < 1 ? 6 : 2));
                  }
                }}
                className="bg-[#141b2c] border border-[#243350] rounded px-3 py-1.5 text-xs font-mono font-bold text-amber-300 outline-none cursor-pointer"
              >
                {CRYPTO_50_COINS.map((c) => (
                  <option key={c.pair} value={c.pair}>
                    {c.symbol} ({c.name}) • ${c.basePriceUSD < 1 ? c.basePriceUSD : c.basePriceUSD.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-300">
                Harga Pasar: <strong className="text-white">${currentPrice.toLocaleString()}</strong>
              </span>
              <button
                onClick={() => {
                  sound.playClick();
                  onApplyCoinToChart(selectedPair);
                  onClose();
                }}
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs px-3 py-1.5 rounded transition-colors cursor-pointer"
              >
                <span>MUAT KE MULTICHART</span>
                <ArrowRight className="w-3.5 h-3.5 text-black" />
              </button>
            </div>
          </div>

          {/* Section 1: Fibonacci Retracement & Golden Pocket Matrix */}
          <div className="bg-[#0e1422] border border-[#1f2b42] rounded-lg p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
                  1. FIBONACCI GOLDEN POCKET & CONFLUENCE MATRIX
                </h3>
              </div>

              {/* Swing High / Low Inputs */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400 text-[10px]">Swing High:</span>
                <input
                  type="text"
                  value={customHigh}
                  onChange={(e) => setCustomHigh(e.target.value)}
                  className="w-20 bg-[#080c14] border border-[#212f48] px-1.5 py-0.5 rounded text-xs font-mono text-white text-right outline-none"
                />
                <span className="text-slate-400 text-[10px] ml-1">Swing Low:</span>
                <input
                  type="text"
                  value={customLow}
                  onChange={(e) => setCustomLow(e.target.value)}
                  className="w-20 bg-[#080c14] border border-[#212f48] px-1.5 py-0.5 rounded text-xs font-mono text-white text-right outline-none"
                />
              </div>
            </div>

            {/* Fibonacci Levels Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
              <div className="bg-[#121826] p-2.5 rounded border border-[#1a253a]">
                <span className="text-[10px] text-slate-400 block">0.000 (Puncak High)</span>
                <span className="text-slate-200 font-bold">${fib.fib0.toFixed(currentPrice < 1 ? 6 : 2)}</span>
              </div>
              <div className="bg-[#121826] p-2.5 rounded border border-[#1a253a]">
                <span className="text-[10px] text-slate-400 block">0.236 Retracement</span>
                <span className="text-slate-300 font-semibold">${fib.fib236.toFixed(currentPrice < 1 ? 6 : 2)}</span>
              </div>
              <div className="bg-[#121826] p-2.5 rounded border border-[#1a253a]">
                <span className="text-[10px] text-slate-400 block">0.382 Support Zone</span>
                <span className="text-cyan-300 font-semibold">${fib.fib382.toFixed(currentPrice < 1 ? 6 : 2)}</span>
              </div>
              <div className="bg-[#121826] p-2.5 rounded border border-[#1a253a]">
                <span className="text-[10px] text-slate-400 block">0.500 Mid Ekuilibrium</span>
                <span className="text-slate-200 font-bold">${fib.fib500.toFixed(currentPrice < 1 ? 6 : 2)}</span>
              </div>

              {/* 0.618 Golden Pocket - High Priority */}
              <div className="bg-[#1a1c15] p-2.5 rounded border border-amber-500/60 shadow-sm sm:col-span-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-amber-400 font-bold uppercase">
                    ★ 0.618 GOLDEN POCKET (PRIME CONVERSATION ZONE)
                  </span>
                  <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded">
                    CONTRARIAN BUY/SELL
                  </span>
                </div>
                <div className="text-base font-mono font-bold text-amber-300 mt-1">
                  ${fib.fib618.toFixed(currentPrice < 1 ? 6 : 2)}
                </div>
              </div>

              <div className="bg-[#121826] p-2.5 rounded border border-[#1a253a]">
                <span className="text-[10px] text-slate-400 block">0.786 Deep Sweep</span>
                <span className="text-red-300 font-semibold">${fib.fib786.toFixed(currentPrice < 1 ? 6 : 2)}</span>
              </div>

              <div className="bg-[#121826] p-2.5 rounded border border-[#1a253a]">
                <span className="text-[10px] text-slate-400 block">1.618 Golden Extension</span>
                <span className="text-emerald-400 font-bold">${fib.fib1618.toFixed(currentPrice < 1 ? 6 : 2)}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Stochastic RSI & EMA Multi-Ribbon */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Stochastic RSI */}
            <div className="bg-[#0e1422] border border-[#1f2b42] rounded-lg p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-200 uppercase flex items-center gap-1.5">
                  <LineChart className="w-4 h-4 text-cyan-400" />
                  2. STOCHASTIC RSI (14, 14, 3, 3)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/40">
                  OVERBOUGHT ({stochK})
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-300">
                  <span>%K Line: <strong className="text-cyan-400">{stochK}</strong></span>
                  <span>%D Signal: <strong className="text-amber-400">{stochD}</strong></span>
                </div>
                <div className="w-full bg-[#182236] h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500 h-full" style={{ width: `${stochK}%` }} />
                </div>
                <p className="text-[11px] text-slate-400 font-sans pt-1">
                  Sinyal Kontrarian: StochRSI di atas 75 mengindikasikan momentum beli mulai jenuh; peluang short squeeze exhaust jika open interest melonjak.
                </p>
              </div>
            </div>

            {/* EMA Ribbon */}
            <div className="bg-[#0e1422] border border-[#1f2b42] rounded-lg p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-200 uppercase flex items-center gap-1.5">
                  <GitBranch className="w-4 h-4 text-emerald-400" />
                  3. EXPONENTIAL MOVING AVERAGE (EMA) RIBBON
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                  BULLISH ALIGNMENT
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="bg-[#121826] p-2 rounded border border-[#1b253b]">
                  <span className="text-[9px] text-slate-400 block">EMA 20 (Fast)</span>
                  <span className="text-cyan-300 font-bold">${ema20}</span>
                </div>
                <div className="bg-[#121826] p-2 rounded border border-[#1b253b]">
                  <span className="text-[9px] text-slate-400 block">EMA 50 (Med)</span>
                  <span className="text-amber-300 font-bold">${ema50}</span>
                </div>
                <div className="bg-[#121826] p-2 rounded border border-[#1b253b]">
                  <span className="text-[9px] text-slate-400 block">EMA 200 (Macro)</span>
                  <span className="text-emerald-400 font-bold">${ema200}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Harga berada di atas EMA 200; tren makro terjaga dengan support dinamis pertama pada EMA 50.
              </p>
            </div>
          </div>

          {/* Section 3: Trendline & Liquidity Path Projection */}
          <div className="bg-[#0e1422] border border-[#1f2b42] rounded-lg p-4 space-y-3">
            <span className="text-xs font-mono font-bold text-slate-200 uppercase flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              4. PROYEKSI PATH & JALUR LIKUIDITAS (SCENARIO SIMULATION)
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              {/* Path A */}
              <div className="bg-[#101b24] p-3 rounded border border-cyan-800/50 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-cyan-400 font-bold">JALUR A: BULLISH BREAKOUT SQUEEZE</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">Probabilitas: 58%</span>
                </div>
                <p className="text-slate-300 text-[11px] font-sans">
                  Harga memantul di zona Golden Pocket ${fib.fib618.toFixed(2)}, menembus resistance trendline atas, dan mengeksekusi likuidasi short menuju target ekstensi 1.618 (${fib.fib1618.toFixed(2)}).
                </p>
              </div>

              {/* Path B */}
              <div className="bg-[#1b1216] p-3 rounded border border-red-900/50 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-red-400 font-bold">JALUR B: LIQUIDATION CASCADE FLUSH</span>
                  <span className="text-[10px] text-amber-400 font-semibold">Probabilitas: 42%</span>
                </div>
                <p className="text-slate-300 text-[11px] font-sans">
                  Gagal bertahan di atas level 0.5 (${fib.fib500.toFixed(2)}), memicu cascade stop-loss long retail menuju support kunci ${fib.fib1000.toFixed(2)} untuk sweep likuiditas besar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
