import React, { useMemo, useState } from 'react';
import {
  Search,
  Box,
  TrendingUp,
  Compass,
  LayoutGrid,
  Sliders,
  ArrowUpRight,
  Newspaper,
  Flame,
  Activity,
  Radio,
  Anchor,
  Radar,
  MessageSquare,
  BellRing,
  Cpu,
  BarChart2,
  Key,
  Volume2,
  VolumeX,
  ChevronRight,
  X,
} from 'lucide-react';
import { TerminalViewMode } from './HeaderTerminal';
import { UserSession } from '../types/news';
import { MacroNewsItem } from '../types/macroNews';
import { Altcoin5mMetric } from '../three/MonolithScene';
import { sound } from '../audio/soundEngine';

interface SuperAppHomeProps {
  session: UserSession;
  macroNews: MacroNewsItem[];
  newsLoading: boolean;
  altcoin5m: Record<string, Altcoin5mMetric>;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onNavigate: (mode: TerminalViewMode) => void;
  onSelectNewsForAI: (item: MacroNewsItem) => void;
  onOpenTA: () => void;
  onOpenTopMovers: () => void;
  onOpenWhale: () => void;
  onOpenRadar: () => void;
  onOpenAlerts: () => void;
  onOpenExchangeSentiment: () => void;
  onOpenApiKeys: () => void;
}

interface MiniAppTile {
  id: string;
  label: string;
  subtitle: string;
  keywords: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
  onClick: () => void;
}

interface MiniAppGroup {
  title: string;
  items: MiniAppTile[];
}

export const SuperAppHome: React.FC<SuperAppHomeProps> = ({
  session,
  macroNews,
  newsLoading,
  altcoin5m,
  soundEnabled,
  onToggleSound,
  onNavigate,
  onSelectNewsForAI,
  onOpenTA,
  onOpenTopMovers,
  onOpenWhale,
  onOpenRadar,
  onOpenAlerts,
  onOpenExchangeSentiment,
  onOpenApiKeys,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const btcMetric = altcoin5m['BTC'];
  const orbitSummary = useMemo(() => {
    const keys = ['ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'SUI', 'ADA', 'AVAX', 'LINK', 'TAO'];
    let up = 0;
    let down = 0;
    for (const k of keys) {
      const val = altcoin5m[k]?.change5m ?? 0;
      if (val > 0) up++;
      else if (val < 0) down++;
    }
    return { up, down };
  }, [altcoin5m]);

  const groups: MiniAppGroup[] = useMemo(
    () => [
      {
        title: 'Pasar & Grafik',
        items: [
          {
            id: 'monolith',
            label: '3D Monolith',
            subtitle: 'Peta orbit BTC',
            keywords: '3d monolith bitcoin orbit sentimen',
            icon: Box,
            tone: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
            onClick: () => onNavigate('monolith'),
          },
          {
            id: 'bitcoin_cycle',
            label: 'Bitcoin Cycle',
            subtitle: 'Siklus & valuasi',
            keywords: 'bitcoin cycle btc harga',
            icon: TrendingUp,
            tone: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
            onClick: () => onNavigate('bitcoin_cycle'),
          },
          {
            id: 'liquidity_movers',
            label: 'Likuiditas',
            subtitle: 'Arus & Top 5 L/S',
            keywords: 'likuiditas arus dana long short',
            icon: Compass,
            tone: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',
            onClick: () => onNavigate('liquidity_movers'),
          },
          {
            id: 'multichart',
            label: 'Multichart',
            subtitle: 'Grafik TradingView',
            keywords: 'chart grafik candle multichart',
            icon: LayoutGrid,
            tone: 'bg-sky-500/15 text-sky-300 border-sky-500/25',
            onClick: () => onNavigate('multichart'),
          },
          {
            id: 'ta',
            label: 'Teknikal',
            subtitle: 'Suite indikator',
            keywords: 'teknikal analisis rsi macd',
            icon: Sliders,
            tone: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25',
            onClick: onOpenTA,
          },
          {
            id: 'movers',
            label: 'Top Movers',
            subtitle: 'Gainers & Losers',
            keywords: 'gainers losers runners movers',
            icon: ArrowUpRight,
            tone: 'bg-lime-500/15 text-lime-300 border-lime-500/25',
            onClick: onOpenTopMovers,
          },
        ],
      },
      {
        title: 'Berita & Riset',
        items: [
          {
            id: 'macro_terminal',
            label: 'Macro Wire',
            subtitle: 'Crypto 24J & Makro',
            keywords: 'berita macro news crypto 24 jam',
            icon: Newspaper,
            tone: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
            onClick: () => onNavigate('macro_terminal'),
          },
          {
            id: 'high_impact',
            label: 'Prioritas',
            subtitle: 'Berita berdampak',
            keywords: 'high impact penting prioritas',
            icon: Flame,
            tone: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
            onClick: () => onNavigate('high_impact'),
          },
          {
            id: 'impact_matrix',
            label: 'Impact Matrix',
            subtitle: 'Peta dampak aset',
            keywords: 'impact matrix dxy emas forex',
            icon: Activity,
            tone: 'bg-teal-500/15 text-teal-300 border-teal-500/25',
            onClick: () => onNavigate('impact_matrix'),
          },
          {
            id: 'narratives',
            label: 'Narratives',
            subtitle: 'Tren 24/7',
            keywords: 'narratives reddit coingecko sosial',
            icon: Radio,
            tone: 'bg-orange-500/15 text-orange-300 border-orange-500/25',
            onClick: () => onNavigate('narratives'),
          },
          {
            id: 'whale',
            label: 'Whale Desk',
            subtitle: 'Pergerakan paus',
            keywords: 'whale kol onchain smart money',
            icon: Anchor,
            tone: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
            onClick: onOpenWhale,
          },
          {
            id: 'radar',
            label: 'Radar Kontra',
            subtitle: 'Sinyal ekstrem',
            keywords: 'contrarian radar dislokasi',
            icon: Radar,
            tone: 'bg-violet-500/15 text-violet-300 border-violet-500/25',
            onClick: onOpenRadar,
          },
        ],
      },
      {
        title: 'Komunitas & Utilitas',
        items: [
          {
            id: 'room_chat',
            label: 'Room Chat',
            subtitle: 'Diskusi langsung',
            keywords: 'chat room diskusi pesan komunitas',
            icon: MessageSquare,
            tone: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
            onClick: () => onNavigate('room_chat'),
          },
          {
            id: 'alerts',
            label: 'Price Alerts',
            subtitle: 'Notifikasi harga',
            keywords: 'alert notifikasi target harga',
            icon: BellRing,
            tone: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
            onClick: onOpenAlerts,
          },
          {
            id: 'telemetry',
            label: '8-API Live',
            subtitle: 'Data 8 sumber',
            keywords: 'telemetry api binance kraken defillama mempool',
            icon: Cpu,
            tone: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',
            onClick: () => onNavigate('telemetry'),
          },
          {
            id: 'exchange_ls',
            label: 'Exchange L/S',
            subtitle: 'Binance & Bitget',
            keywords: 'exchange funding rate long short',
            icon: BarChart2,
            tone: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
            onClick: onOpenExchangeSentiment,
          },
          {
            id: 'api_keys',
            label: 'API Keys',
            subtitle: 'Sumber berita',
            keywords: 'api key newsdata gnews guardian',
            icon: Key,
            tone: 'bg-slate-500/15 text-slate-200 border-slate-500/25',
            onClick: onOpenApiKeys,
          },
          {
            id: 'sound',
            label: soundEnabled ? 'Suara Aktif' : 'Suara Mati',
            subtitle: 'Audio alert',
            keywords: 'suara audio sound mute',
            icon: soundEnabled ? Volume2 : VolumeX,
            tone: soundEnabled
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
              : 'bg-slate-800 text-slate-400 border-slate-700',
            onClick: onToggleSound,
          },
        ],
      },
    ],
    [
      onNavigate,
      onOpenTA,
      onOpenTopMovers,
      onOpenWhale,
      onOpenRadar,
      onOpenAlerts,
      onOpenExchangeSentiment,
      onOpenApiKeys,
      onToggleSound,
      soundEnabled,
    ]
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredGroups = useMemo(() => {
    if (!normalizedQuery) return groups;
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (item) =>
            item.label.toLowerCase().includes(normalizedQuery) ||
            item.subtitle.toLowerCase().includes(normalizedQuery) ||
            item.keywords.toLowerCase().includes(normalizedQuery)
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, normalizedQuery]);

  const previewNews = useMemo(() => {
    const list = normalizedQuery
      ? macroNews.filter(
          (n) =>
            n.title.toLowerCase().includes(normalizedQuery) ||
            n.source.toLowerCase().includes(normalizedQuery)
        )
      : macroNews;
    return list.slice(0, 5);
  }, [macroNews, normalizedQuery]);

  const cryptoNewsCount = useMemo(
    () => macroNews.filter((n) => n.newsDomain === 'CRYPTO').length,
    [macroNews]
  );

  return (
    <div className="relative z-10 w-full h-full overflow-y-auto bg-transparent text-slate-100 pb-20 lg:pb-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-6">
        {/* Top Greeting + Clean Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-white drop-shadow-sm">
              Halo, {session.traderName || 'Trader'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5 drop-shadow-sm">
              Pilih mini-app atau pantau ringkasan pasar terkini
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari layanan atau berita..."
              className="w-full h-11 pl-10 pr-9 rounded-xl bg-[#0b101b]/88 border border-[#24324c] focus:border-amber-400/80 text-sm text-white placeholder:text-slate-400 outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Hapus pencarian"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Superapp Quick Overview Strip (3 clean metrics in a single surface) */}
        <div className="rounded-2xl bg-[#0b101b]/82 border border-[#222f47] grid grid-cols-3 divide-x divide-[#1f2c44] shadow-xl">
          <button
            onClick={() => {
              sound.playClick();
              onNavigate('bitcoin_cycle');
            }}
            className="p-3.5 sm:p-4 text-left hover:bg-[#121a2d]/90 transition-colors rounded-l-2xl cursor-pointer min-h-[44px]"
          >
            <div className="text-[11px] sm:text-xs text-slate-400 truncate">Bitcoin Spot</div>
            <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
              <span className="text-sm sm:text-lg font-semibold text-white font-mono tabular-nums">
                {btcMetric?.price ? `$${btcMetric.price.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '$—'}
              </span>
              {btcMetric && (
                <span
                  className={`text-[11px] font-mono tabular-nums font-medium ${
                    btcMetric.change5m >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {btcMetric.change5m >= 0 ? '+' : ''}
                  {btcMetric.change5m}% 5m
                </span>
              )}
            </div>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onNavigate('monolith');
            }}
            className="p-3.5 sm:p-4 text-left hover:bg-[#11192a] transition-colors cursor-pointer min-h-[44px]"
          >
            <div className="text-[11px] sm:text-xs text-slate-400 truncate">Pulsa 5M Altcoin</div>
            <div className="mt-1 text-sm sm:text-lg font-semibold font-mono tabular-nums">
              <span className="text-emerald-400">{orbitSummary.up} Naik</span>
              <span className="text-slate-600 mx-1.5">/</span>
              <span className="text-rose-400">{orbitSummary.down} Turun</span>
            </div>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onNavigate('macro_terminal');
            }}
            className="p-3.5 sm:p-4 text-left hover:bg-[#11192a] transition-colors rounded-r-2xl cursor-pointer min-h-[44px]"
          >
            <div className="text-[11px] sm:text-xs text-slate-400 truncate">Kabar 24 Jam</div>
            <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
              <span className="text-sm sm:text-lg font-semibold text-amber-300 font-mono tabular-nums">
                {newsLoading && macroNews.length === 0 ? '—' : macroNews.length}
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                ({cryptoNewsCount} Crypto)
              </span>
            </div>
          </button>
        </div>

        {/* Categorized Mini-App Launcher Grids */}
        <div className="space-y-6">
          {filteredGroups.length === 0 ? (
            <div className="rounded-2xl bg-[#0b101b]/84 border border-[#222f47] p-8 text-center">
              <p className="text-sm text-slate-300">Tidak ada layanan yang cocok dengan "{searchQuery}".</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 px-4 py-2 rounded-lg bg-[#162033] text-xs font-medium text-amber-300 hover:bg-[#1e2c45] cursor-pointer"
              >
                Tampilkan Semua Layanan
              </button>
            </div>
          ) : (
            filteredGroups.map((group) => (
              <section key={group.title} className="space-y-2.5">
                <div className="flex items-center justify-between px-0.5">
                  <h2 className="text-sm font-semibold text-slate-100 tracking-tight drop-shadow-sm">
                    {group.title}
                  </h2>
                </div>

                <div className="rounded-2xl bg-[#0b101b]/80 border border-[#222f47] p-4 sm:p-5 shadow-xl">
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-y-5 gap-x-3">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            sound.playClick();
                            item.onClick();
                          }}
                          className="group flex flex-col items-center text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-xl py-1 px-1 cursor-pointer min-h-[44px]"
                        >
                          <div
                            className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-transform duration-150 group-hover:scale-105 group-active:scale-95 ${item.tone}`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="mt-2 text-xs font-medium text-slate-100 group-hover:text-amber-300 transition-colors leading-tight">
                            {item.label}
                          </span>
                          <span className="mt-0.5 text-[11px] text-slate-500 hidden sm:block leading-tight">
                            {item.subtitle}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>
            ))
          )}
        </div>

        {/* Live News Digest Preview (Clean Tap List Rows) */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-sm font-semibold text-slate-100 tracking-tight drop-shadow-sm">
              Berita Crypto & Makro Terbaru
            </h2>
            <button
              onClick={() => {
                sound.playClick();
                onNavigate('macro_terminal');
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-amber-300 hover:text-amber-200 cursor-pointer py-1 px-2"
            >
              <span>Lihat semua</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="rounded-2xl bg-[#0b101b]/82 border border-[#222f47] divide-y divide-[#1a253a] shadow-xl">
            {newsLoading && previewNews.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Memuat berita terkini...
              </div>
            ) : previewNews.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Belum ada berita yang cocok.
              </div>
            ) : (
              previewNews.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    sound.playClick();
                    onSelectNewsForAI(item);
                  }}
                  className="w-full px-4 py-3.5 text-left hover:bg-[#11192a] transition-colors flex items-center justify-between gap-3 first:rounded-t-2xl last:rounded-b-2xl cursor-pointer min-h-[56px]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-slate-100 line-clamp-2 leading-snug">
                      {item.title}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-400">
                      <span className={item.newsDomain === 'CRYPTO' ? 'text-amber-300/90 font-medium' : 'text-cyan-300/90 font-medium'}>
                        {item.newsDomain === 'CRYPTO' ? 'Crypto 24J' : 'Makro'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{item.source}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums shrink-0">{item.timeAgo}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                </button>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
