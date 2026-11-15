import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  RefreshCw,
  ExternalLink,
  Search,
  ChevronRight,
  X,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { sound } from '../audio/soundEngine';

interface HotSectorItem {
  id: string;
  name: string;
  change24h: number;
  volume24hUSD: number;
  marketCapUSD: number;
  topCoins?: string[];
}

interface CryptoNarrativeItem {
  id: string;
  title: string;
  summary?: string;
  source: string;
  sourceType?: 'COINGECKO' | 'DEXSCREENER' | 'GECKOTERMINAL' | 'HACKERNEWS' | 'RSS';
  narrativeTheme: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'VIRAL';
  metricLabel?: string;
  change24h?: number;
  url: string;
  timestamp: string;
  timestampMs?: number;
  wibTime?: string;
}

const THEMES = [
  'Semua',
  'AI & Agent',
  'RWA & Inst.',
  'DeFi & On-Chain',
  'Layer 1',
  'Meme & Viral',
  'Regulasi & Makro',
] as const;

export const CryptoNarrativeStream: React.FC = () => {
  const [narratives, setNarratives] = useState<CryptoNarrativeItem[]>([]);
  const [hotSectors, setHotSectors] = useState<HotSectorItem[]>([]);
  const [wibNow, setWibNow] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [countdown, setCountdown] = useState(45);
  const [activeNarrativeModal, setActiveNarrativeModal] =
    useState<CryptoNarrativeItem | null>(null);

  const fetchNarratives = useCallback((force = false) => {
    setLoading(true);
    fetch(`/api/crypto/narratives${force ? '?refresh=1' : ''}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          if (Array.isArray(data.narratives)) setNarratives(data.narratives);
          if (Array.isArray(data.hotSectors)) setHotSectors(data.hotSectors);
          if (data.wibNow) setWibNow(data.wibNow);
          setCountdown(45);
        }
      })
      .catch((err) => console.error('Error fetching 24h narratives:', err))
      .finally(() => setLoading(false));
  }, []);

  // Continuous 24-hour auto-sync loop every 45 seconds
  useEffect(() => {
    fetchNarratives(false);
    const refreshTimer = setInterval(() => {
      fetchNarratives(false);
    }, 45000);
    const tickTimer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 45 : prev - 1));
    }, 1000);
    return () => {
      clearInterval(refreshTimer);
      clearInterval(tickTimer);
    };
  }, [fetchNarratives]);

  const filteredNarratives = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return narratives.filter((item) => {
      if (selectedTheme !== 'Semua' && item.narrativeTheme !== selectedTheme) {
        return false;
      }
      if (q) {
        const hay = `${item.title} ${item.summary || ''} ${item.source} ${item.narrativeTheme}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [narratives, selectedTheme, searchQuery]);

  const formatVolume = (v: number) => {
    if (!v) return '$0';
    if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
    if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
    return `$${v.toLocaleString()}`;
  };

  return (
    <div className="w-full h-full bg-[#070a11] text-slate-100 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-5">
        {/* Top Clean Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#162033]">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
              Narasi Crypto 24 Jam
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              CoinGecko · DexScreener · GeckoTerminal · HackerNews · 5 Feed Berita 24J
              {wibNow ? ` · Update ${wibNow}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari topik, token, sektor..."
                className="w-full h-9 pl-9 pr-3 rounded-lg bg-[#0d1320] border border-[#1d283f] focus:border-amber-400/70 text-xs text-white placeholder:text-slate-500 outline-none"
              />
            </div>

            <button
              onClick={() => {
                sound.playClick();
                fetchNarratives(true);
              }}
              className="h-9 px-3.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 tabular-nums"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync ({countdown}s)</span>
            </button>
          </div>
        </div>

        {/* Live 24H Sector Performance Strip (CoinGecko Categories) */}
        {hotSectors.length > 0 && (
          <section className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Momentum Sektor 24 Jam (CoinGecko)
              </h2>
              <span className="text-[11px] text-slate-500">Klik sektor untuk detail</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {hotSectors.slice(0, 8).map((sec) => {
                const pos = sec.change24h >= 0;
                return (
                  <a
                    key={sec.id}
                    href={`https://www.coingecko.com/en/categories/${sec.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-[#0c121e] hover:bg-[#111a2b] border border-[#1a2438] p-3 transition-colors block"
                  >
                    <div className="text-xs font-medium text-slate-100 truncate">
                      {sec.name}
                    </div>
                    <div className="mt-1.5 flex items-baseline justify-between gap-2 font-mono tabular-nums">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold ${
                          pos ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {pos ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {pos ? '+' : ''}
                        {sec.change24h}%
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Vol {formatVolume(sec.volume24hUSD)}
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* Theme Segmented Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {THEMES.map((theme) => {
            const count =
              theme === 'Semua'
                ? narratives.length
                : narratives.filter((n) => n.narrativeTheme === theme).length;
            const active = selectedTheme === theme;
            return (
              <button
                key={theme}
                onClick={() => {
                  sound.playClick();
                  setSelectedTheme(theme);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer tabular-nums ${
                  active
                    ? 'bg-amber-400 text-black font-semibold'
                    : 'bg-[#0c121e] text-slate-300 border border-[#1a2438] hover:text-white'
                }`}
              >
                {theme} ({count})
              </button>
            );
          })}
        </div>

        {/* Live 24H Narratives Feed */}
        {loading && narratives.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-xs text-slate-400">
            <RefreshCw className="w-6 h-6 text-amber-400 animate-spin" />
            <span>Mengambil narasi crypto 24 jam dari API gratis...</span>
          </div>
        ) : filteredNarratives.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-[#0c121e] border border-[#1a2438] text-xs text-slate-400">
            Tidak ada narasi yang cocok dengan filter saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredNarratives.map((item) => {
              const isPos =
                typeof item.change24h === 'number'
                  ? item.change24h >= 0
                  : item.sentiment !== 'BEARISH';
              return (
                <article
                  key={item.id}
                  className="rounded-2xl bg-[#0c121e] border border-[#1a2438] hover:border-[#2a3b5c] p-4 flex flex-col justify-between gap-3 transition-colors"
                >
                  <div className="space-y-2">
                    {/* Unboxed Clean Metadata Row */}
                    <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-amber-300 font-medium truncate">
                          {item.narrativeTheme}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate">{item.source}</span>
                      </div>
                      <span className="font-mono tabular-nums shrink-0 text-slate-500">
                        {item.timestamp}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-100 leading-snug line-clamp-3">
                      {item.title}
                    </h3>

                    {item.metricLabel && (
                      <div
                        className={`text-xs font-mono tabular-nums font-medium ${
                          isPos ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {item.metricLabel}
                      </div>
                    )}
                  </div>

                  <div className="pt-2.5 border-t border-[#151f32] flex items-center justify-between text-xs">
                    <button
                      onClick={() => {
                        sound.playClick();
                        setActiveNarrativeModal(item);
                      }}
                      className="inline-flex items-center gap-1 text-slate-300 hover:text-amber-300 font-medium cursor-pointer"
                    >
                      <span>Ringkasan</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                    >
                      <span>Sumber</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Clean Narrative Summary Modal */}
      {activeNarrativeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
          <div className="bg-[#0b101b] border border-[#222f47] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-100">
            <div className="px-5 py-4 border-b border-[#192338] flex items-center justify-between">
              <div className="min-w-0 pr-3">
                <div className="text-xs text-amber-300 font-medium">
                  {activeNarrativeModal.narrativeTheme} · {activeNarrativeModal.source}
                </div>
                <h3 className="text-sm font-semibold text-white mt-0.5">
                  Detail Narasi 24 Jam
                </h3>
              </div>
              <button
                onClick={() => setActiveNarrativeModal(null)}
                aria-label="Tutup"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#152036] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <h4 className="text-base font-semibold text-white leading-snug">
                {activeNarrativeModal.title}
              </h4>

              {activeNarrativeModal.summary && (
                <p className="text-sm text-slate-300 leading-relaxed">
                  {activeNarrativeModal.summary}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-[#192338]">
                <span className="font-mono tabular-nums">
                  {activeNarrativeModal.wibTime || activeNarrativeModal.timestamp}
                </span>
                <a
                  href={activeNarrativeModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-semibold"
                >
                  <span>Buka Sumber Asli</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
