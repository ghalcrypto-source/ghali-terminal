import React, { useEffect, useState } from 'react';
import {
  X,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Flame,
  LayoutGrid,
  RefreshCw,
  BarChart2,
  ShieldAlert,
} from 'lucide-react';
import { MarketMover } from '../types/news';
import { sound } from '../audio/soundEngine';

interface TopMoversModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadToChart: (symbol: string) => void;
  onSelectForInversion?: (symbol: string) => void;
}

export const TopMoversModal: React.FC<TopMoversModalProps> = ({
  isOpen,
  onClose,
  onLoadToChart,
  onSelectForInversion,
}) => {
  const [tab, setTab] = useState<'gainers' | 'losers' | 'both'>('both');
  const [gainers, setGainers] = useState<MarketMover[]>([]);
  const [losers, setLosers] = useState<MarketMover[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMovers = () => {
    setLoading(true);
    fetch('/api/crypto/movers')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setGainers(data.gainers || []);
          setLosers(data.losers || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      fetchMovers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-none">
      <div className="bg-[#0b0f18] border border-[#23314d] rounded-xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1c273e] bg-[#0e1422]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/30">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold tracking-wider text-slate-100">
                TOP GAINERS & TOP LOSERS (24H)
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                Binance & Bitget High-Beta Volatility • Overbought Exhaustion vs Oversold Capitulation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                fetchMovers();
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded border border-[#25324e] hover:bg-[#1a2336] cursor-pointer"
              title="Refresh Movers"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
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
        </div>

        {/* Tab switch bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#0c101a] border-b border-[#1b253b]">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                sound.playClick();
                setTab('both');
              }}
              className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-colors cursor-pointer ${
                tab === 'both'
                  ? 'bg-amber-500 text-black'
                  : 'bg-[#121929] text-slate-400 hover:text-slate-200 border border-[#1e2a42]'
              }`}
            >
              SIDE-BY-SIDE VIEW
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setTab('gainers');
              }}
              className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-mono font-semibold transition-colors cursor-pointer ${
                tab === 'gainers'
                  ? 'bg-emerald-500 text-black'
                  : 'bg-[#121929] text-emerald-400 hover:bg-[#182338] border border-[#1e2a42]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>TOP GAINERS</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setTab('losers');
              }}
              className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-mono font-semibold transition-colors cursor-pointer ${
                tab === 'losers'
                  ? 'bg-red-500 text-white'
                  : 'bg-[#121929] text-red-400 hover:bg-[#182338] border border-[#1e2a42]'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>TOP LOSERS</span>
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
            Contrarian Insight: Extreme gainers &gt;30% carry high mean-reversion short skew
          </div>
        </div>

        {/* Main content table area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="py-20 text-center text-xs font-mono text-slate-400">
              SCANNING 24H EXCHANGE VOLATILITY METRICS...
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* GAINERS COLUMN */}
              {(tab === 'both' || tab === 'gainers') && (
                <div className={`space-y-3 ${tab === 'gainers' ? 'lg:col-span-2' : ''}`}>
                  <div className="flex items-center justify-between px-1">
                    <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 uppercase">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      TOP 24H GAINERS (LONG MOMENTUM)
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">SORTED BY % GAIN</span>
                  </div>

                  <div className="space-y-2">
                    {gainers.map((item, idx) => (
                      <div
                        key={item.symbol}
                        className="bg-[#0e1422] border border-[#1e2a42] hover:border-emerald-500/40 rounded-lg p-3 transition-all flex flex-wrap items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold text-slate-500 w-4">
                            #{idx + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-sm text-slate-100">
                                {item.symbol}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {item.name}
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#162035] text-amber-300 border border-[#253452]">
                                {item.exchange}
                              </span>
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                              Vol: {item.volume24hUSD} • MC: {item.marketCapUSD}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right font-mono">
                            <div className="text-sm font-bold text-slate-100">
                              ${item.price < 1 ? item.price : item.price.toLocaleString()}
                            </div>
                            <div className="text-xs font-bold text-emerald-400">
                              +{item.change24h}%
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                sound.playClick();
                                onLoadToChart(`${item.symbol}USDT`);
                                onClose();
                              }}
                              className="px-2 py-1 rounded bg-[#131b2c] hover:bg-[#1a253e] text-slate-300 hover:text-white border border-[#212d46] text-[10px] font-mono cursor-pointer"
                              title="Load into Multichart"
                            >
                              CHART
                            </button>
                            {onSelectForInversion && (
                              <button
                                onClick={() => {
                                  sound.playClick(1400);
                                  onSelectForInversion(`${item.symbol} Crypto Mania`);
                                }}
                                className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[10px] font-mono cursor-pointer"
                              >
                                INVERT
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* LOSERS COLUMN */}
              {(tab === 'both' || tab === 'losers') && (
                <div className={`space-y-3 ${tab === 'losers' ? 'lg:col-span-2' : ''}`}>
                  <div className="flex items-center justify-between px-1">
                    <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-red-400 uppercase">
                      <TrendingDown className="w-4 h-4 text-red-400" />
                      TOP 24H LOSERS (CAPITULATION / BOUNCE SKEW)
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">SORTED BY % DROP</span>
                  </div>

                  <div className="space-y-2">
                    {losers.map((item, idx) => (
                      <div
                        key={item.symbol}
                        className="bg-[#0e1422] border border-[#1e2a42] hover:border-red-500/40 rounded-lg p-3 transition-all flex flex-wrap items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold text-slate-500 w-4">
                            #{idx + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-sm text-slate-100">
                                {item.symbol}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {item.name}
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#162035] text-amber-300 border border-[#253452]">
                                {item.exchange}
                              </span>
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                              Vol: {item.volume24hUSD} • MC: {item.marketCapUSD}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right font-mono">
                            <div className="text-sm font-bold text-slate-100">
                              ${item.price < 1 ? item.price : item.price.toLocaleString()}
                            </div>
                            <div className="text-xs font-bold text-red-400">
                              {item.change24h}%
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                sound.playClick();
                                onLoadToChart(`${item.symbol}USDT`);
                                onClose();
                              }}
                              className="px-2 py-1 rounded bg-[#131b2c] hover:bg-[#1a253e] text-slate-300 hover:text-white border border-[#212d46] text-[10px] font-mono cursor-pointer"
                              title="Load into Multichart"
                            >
                              CHART
                            </button>
                            {onSelectForInversion && (
                              <button
                                onClick={() => {
                                  sound.playClick(1400);
                                  onSelectForInversion(`${item.symbol} Capitulation Dip`);
                                }}
                                className="px-2 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono cursor-pointer"
                              >
                                INVERT
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
