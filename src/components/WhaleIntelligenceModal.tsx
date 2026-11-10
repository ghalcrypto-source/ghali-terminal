import React, { useEffect, useState } from 'react';
import {
  X,
  Crown,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Sparkles,
  Shield,
  Layers,
  Activity,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { WhaleAnalysisItem, AuthorType } from '../types/whale';
import { sound } from '../audio/soundEngine';

interface WhaleIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadToChart: (coinPair: string) => void;
  onSelectForInversion: (topic: string) => void;
}

export const WhaleIntelligenceModal: React.FC<WhaleIntelligenceModalProps> = ({
  isOpen,
  onClose,
  onLoadToChart,
  onSelectForInversion,
}) => {
  const [items, setItems] = useState<WhaleAnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<AuthorType | 'ALL'>('ALL');
  const [selectedCoin, setSelectedCoin] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchWhaleData = () => {
    setLoading(true);
    fetch('/api/crypto/whale-intelligence')
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
      fetchWhaleData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Extract unique coins from items for filter
  const uniqueCoins = Array.from(new Set(items.map((i) => i.targetCoin)));

  const filteredItems = items.filter((item) => {
    if (selectedType !== 'ALL' && item.authorType !== selectedType) return false;
    if (selectedCoin !== 'ALL' && item.targetCoin !== selectedCoin) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.authorName.toLowerCase().includes(q) ||
        item.targetCoin.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.analysisText.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-none">
      <div className="bg-[#0b0f18] border border-[#23314d] rounded-xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1c273e] bg-[#0e1422]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/30">
              <Crown className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold tracking-wider text-slate-100">
                KOL & SMART MONEY WHALE INTELLIGENCE DESK
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                Arthur Hayes • Lookonchain • Hyperliquid Whales • GCR • Andrew Kang • Wintermute
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                fetchWhaleData();
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded border border-[#25324e] hover:bg-[#1a2336] cursor-pointer"
              title="Refresh Whale Feeds"
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

        {/* Filters Toolbar */}
        <div className="p-3.5 bg-[#0d121c] border-b border-[#1b253b] space-y-2.5">
          {/* Row 1: Search & Entity Category */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari KOL, Whale, koin (BTC, SUI, SOL)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#080c14] border border-[#212d45] focus:border-amber-400 rounded pl-8 pr-3 py-1.5 text-xs font-mono text-slate-200 placeholder:text-slate-600 outline-none"
              />
            </div>

            {/* Author Types */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <span className="text-[10px] font-mono text-slate-500 uppercase shrink-0">
                ENTITAS:
              </span>
              {[
                { id: 'ALL', label: 'SEMUA' },
                { id: 'KOL', label: 'TOP KOL' },
                { id: 'SMART_MONEY_WHALE', label: 'WHALE PERP' },
                { id: 'ONCHAIN_TRACKER', label: 'ON-CHAIN FLOWS' },
                { id: 'MARKET_MAKER', label: 'MARKET MAKERS' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedType(t.id as any);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono shrink-0 transition-colors cursor-pointer border ${
                    selectedType === t.id
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-semibold'
                      : 'bg-[#121929] text-slate-400 border-[#1f2b44] hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Coin Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[10px] font-mono text-slate-500 uppercase shrink-0">
              FILTER KOIN:
            </span>
            <button
              onClick={() => {
                sound.playClick();
                setSelectedCoin('ALL');
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                selectedCoin === 'ALL'
                  ? 'bg-amber-500 text-black font-bold'
                  : 'bg-[#121929] text-slate-400 hover:text-white'
              }`}
            >
              SEMUA KOIN
            </button>
            {uniqueCoins.map((coin) => (
              <button
                key={coin}
                onClick={() => {
                  sound.playClick();
                  setSelectedCoin(coin);
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                  selectedCoin === coin
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'bg-[#121929] text-slate-300 hover:text-white border border-[#1d273d]'
                }`}
              >
                ${coin}
              </button>
            ))}
          </div>
        </div>

        {/* Content Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {loading ? (
            <div className="py-20 text-center text-xs font-mono text-slate-400">
              MEMINDAI SINYAL DARI WALLET WHALE & ANALISA TOP KOL...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center text-xs font-mono text-slate-500">
              Tidak ada analisa yang cocok dengan filter koin atau entitas tersebut.
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-[#0e1422] border border-[#1e2a42] hover:border-[#2f4266] rounded-xl p-4 sm:p-5 transition-all space-y-3.5"
              >
                {/* Author row */}
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-3">
                    {/* Avatar circle */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-sm text-black shadow-md shrink-0"
                      style={{ background: item.avatarBg }}
                    >
                      {item.authorName.slice(0, 2).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-100">
                          {item.authorName}
                        </span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-[11px] font-mono text-slate-400">
                          {item.authorHandle}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#162035] text-amber-300 border border-[#253452]">
                          {item.authorType.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {item.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Coin Badge & Stance */}
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-[#18263d] text-cyan-300 border border-cyan-500/40">
                      ${item.targetCoin}
                    </span>

                    <span
                      className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded font-bold border ${
                        item.stance.includes('ACCUMULATION') || item.stance.includes('BREAKOUT')
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                          : 'bg-red-500/15 text-red-300 border-red-500/40'
                      }`}
                    >
                      {item.stance}
                    </span>
                  </div>
                </div>

                {/* Title & Core Analysis */}
                <div className="space-y-1.5">
                  <h3 className="font-mono text-sm font-bold text-slate-100 hover:text-amber-300 transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {item.analysisText}
                  </p>
                </div>

                {/* On-Chain Telemetry Box if available */}
                {item.onChainTelemetry && (
                  <div className="bg-[#121927] border border-[#1d273d] rounded-lg p-2.5 text-xs font-mono flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="text-slate-400 text-[11px]">ON-CHAIN FLOW:</span>
                      <span className="text-amber-300 font-bold">
                        {item.onChainTelemetry.actionValueUSD}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-300 text-[11px]">
                        {item.onChainTelemetry.exchangeDestination}
                      </span>
                    </div>

                    {item.onChainTelemetry.walletAddress && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        Vault: {item.onChainTelemetry.walletAddress}
                      </span>
                    )}
                  </div>
                )}

                {/* Contrarian Edge: Retail Illusion vs Whale Reality */}
                <div className="bg-[#101b24] p-3 rounded-lg border border-cyan-900/40 space-y-1 text-xs font-mono">
                  <span className="text-cyan-400 font-bold text-[10px] uppercase flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-cyan-400" />
                    CONTRARIAN EDGE (ILUSI PASAR VS AKSI NYATA WHALE):
                  </span>
                  <p className="text-slate-200 text-[11px] font-sans leading-relaxed">
                    {item.contrarianTake}
                  </p>
                </div>

                {/* Key Levels & Direct Actions Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#182338] text-xs font-mono">
                  {/* Levels */}
                  <div className="flex items-center gap-4 text-[11px]">
                    <div>
                      <span className="text-slate-500">ENTRY / SUPPORT: </span>
                      <span className="text-emerald-400 font-bold">
                        {item.keyLevels.entryOrSupport}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">TARGET: </span>
                      <span className="text-cyan-300 font-bold">{item.keyLevels.targetPrice}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">STOP INVALIDATION: </span>
                      <span className="text-red-400 font-bold">
                        {item.keyLevels.invalidationStop}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        sound.playClick();
                        onLoadToChart(item.coinPair);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded bg-[#131b2c] hover:bg-[#1a253e] text-slate-200 hover:text-white border border-[#212d46] text-xs font-mono cursor-pointer transition-colors"
                      title="Muat grafik koin ini ke Multichart"
                    >
                      GRAFIK ${item.targetCoin}
                    </button>

                    <button
                      onClick={() => {
                        sound.playClick(1400);
                        onSelectForInversion(
                          `${item.authorName} analysis on ${item.targetCoin}: ${item.title}`
                        );
                      }}
                      className="flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded text-xs font-mono cursor-pointer transition-colors font-semibold"
                      title="Uji apakah analisa KOL ini merupakan exit liquidity atau alpha murni"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>INVERT DENGAN AI</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
