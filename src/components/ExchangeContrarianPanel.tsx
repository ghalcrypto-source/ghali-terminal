import React, { useEffect, useState } from 'react';
import {
  X,
  Flame,
  TrendingDown,
  TrendingUp,
  Percent,
  Layers,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { ExchangeSentiment } from '../types/crypto';
import { sound } from '../audio/soundEngine';

interface ExchangeContrarianPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectForInversion: (pair: string) => void;
}

export const ExchangeContrarianPanel: React.FC<ExchangeContrarianPanelProps> = ({
  isOpen,
  onClose,
  onSelectForInversion,
}) => {
  const [items, setItems] = useState<ExchangeSentiment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSentiment = () => {
    setLoading(true);
    fetch('/api/crypto/market-sentiment')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.items) {
          setItems(data.items);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      fetchSentiment();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-none">
      <div className="bg-[#0b0f18] border border-[#23314d] rounded-xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1c273e] bg-[#0e1422]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/30">
              <Percent className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold tracking-wider text-slate-100">
                BINANCE & BITGET CONTRARIAN SENTIMENT RADAR
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                Live Funding Rate Divergence • Long/Short Positioning Skew • Liquidation Cascades
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                fetchSentiment();
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded border border-[#25324e] hover:bg-[#1a2336] cursor-pointer"
              title="Refresh Sentiment Data"
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

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 gap-3.5">
            {items.map((item) => {
              const isHighLong = item.longPercentage > 70;
              const isHighShort = item.shortPercentage > 60;
              const fundingSpread = Math.abs(item.binanceFundingRate - item.bitgetFundingRate).toFixed(4);

              return (
                <div
                  key={item.symbol}
                  className="bg-[#0e1422] border border-[#1e2a42] hover:border-[#2f4266] rounded-lg p-4 transition-all space-y-3"
                >
                  {/* Top line: Symbol, Price, Change, and Contrarian Signal */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono font-bold text-slate-100 bg-[#162035] px-2.5 py-0.5 rounded border border-[#233352]">
                        {item.symbol}
                      </span>
                      <span className="text-sm font-mono font-bold text-white">
                        ${item.price.toLocaleString()}
                      </span>
                      <span
                        className={`text-xs font-mono font-semibold flex items-center gap-0.5 ${
                          item.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {item.change24h >= 0 ? '+' : ''}
                        {item.change24h}%
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded font-bold border ${
                          item.contrarianSignal === 'EXTREME LONG CROWDING'
                            ? 'bg-red-500/15 text-red-300 border-red-500/40'
                            : item.contrarianSignal === 'SHORT SQUEEZE POTENTIAL'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                            : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {item.contrarianSignal}
                      </span>

                      <button
                        onClick={() => {
                          sound.playClick(1400);
                          onSelectForInversion(item.symbol);
                        }}
                        className="flex items-center gap-1 bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded text-[11px] font-mono cursor-pointer transition-colors"
                      >
                        <span>INVERT</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Row 2: Funding Rates Comparison (Binance vs Bitget) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-[#121826] p-2.5 rounded border border-[#1b253b] text-xs font-mono">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-slate-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#f3ba2f]"></span>
                        Binance Funding:
                      </span>
                      <span
                        className={`font-bold ${
                          item.binanceFundingRate > 0.02 ? 'text-red-400' : 'text-slate-200'
                        }`}
                      >
                        {item.binanceFundingRate > 0 ? '+' : ''}
                        {(item.binanceFundingRate * 100).toFixed(3)}% / 8h
                      </span>
                    </div>

                    <div className="flex justify-between items-center px-1 border-t sm:border-t-0 sm:border-l border-[#1f2b42] pt-1 sm:pt-0 sm:pl-2.5">
                      <span className="text-slate-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#00f0ff]"></span>
                        Bitget Funding:
                      </span>
                      <span
                        className={`font-bold ${
                          item.bitgetFundingRate > 0.02 ? 'text-red-400' : 'text-slate-200'
                        }`}
                      >
                        {item.bitgetFundingRate > 0 ? '+' : ''}
                        {(item.bitgetFundingRate * 100).toFixed(3)}% / 8h
                      </span>
                    </div>

                    <div className="flex justify-between items-center px-1 border-t sm:border-t-0 sm:border-l border-[#1f2b42] pt-1 sm:pt-0 sm:pl-2.5">
                      <span className="text-slate-400">Open Interest:</span>
                      <span className="text-cyan-300 font-bold">{item.openInterestUSD}</span>
                    </div>
                  </div>

                  {/* Row 3: Long / Short Ratio Bar */}
                  <div>
                    <div className="flex justify-between items-center text-[11px] font-mono mb-1">
                      <span className="text-emerald-400 font-medium">
                        LONGS: {item.longPercentage}% (L/S Ratio: {item.longShortRatio})
                      </span>
                      <span className="text-red-400 font-medium">
                        SHORTS: {item.shortPercentage}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#1b253b] rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-emerald-500 transition-all"
                        style={{ width: `${item.longPercentage}%` }}
                      />
                      <div
                        className="h-full bg-red-500 transition-all"
                        style={{ width: `${item.shortPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Row 4: 24h Liquidations */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-[#182338]">
                    <div className="flex items-center gap-4">
                      <span>
                        24h Longs Rekt:{' '}
                        <span className="text-red-400 font-bold">
                          {item.liquidations24h.longUSD}
                        </span>
                      </span>
                      <span>
                        24h Shorts Rekt:{' '}
                        <span className="text-emerald-400 font-bold">
                          {item.liquidations24h.shortUSD}
                        </span>
                      </span>
                    </div>
                    <span className="text-slate-500 hidden sm:inline">
                      Contrarian Rule: Crowded positioning &gt;70% precedes liquidation cascades
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
