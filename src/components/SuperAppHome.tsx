import React, { useEffect, useMemo, useState } from 'react';
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
  Volume2,
  VolumeX,
  ChevronRight,
  Maximize2,
  X,
} from 'lucide-react';
import { TerminalViewMode } from './HeaderTerminal';
import { UserSession } from '../types/news';
import { MacroNewsItem } from '../types/macroNews';
import { Altcoin5mMetric, PartInfo } from '../three/MonolithScene';
import { sound } from '../audio/soundEngine';
import { MacroNewsTable } from './MacroNewsTable';
import { CryptoNarrativeStream } from './CryptoNarrativeStream';
import { MacroImpactMatrix } from './MacroImpactMatrix';
import { BitcoinCyclePanel } from './BitcoinCyclePanel';
import { CryptoLiquidityMoversPanel } from './CryptoLiquidityMoversPanel';
import { MultiChartGrid } from './MultiChartGrid';
import { RoomChatView } from './RoomChatView';
import { MultiApiTelemetryPanel } from './MultiApiTelemetryPanel';

export type LeftDrawerToolId =
  | 'bitcoin_cycle'
  | 'liquidity_movers'
  | 'multichart';

export type RightDrawerToolId =
  | 'macro_terminal'
  | 'narratives'
  | 'high_impact'
  | 'impact_matrix'
  | 'room_chat'
  | 'telemetry';

interface SuperAppHomeProps {
  session: UserSession;
  macroNews: MacroNewsItem[];
  newsLoading: boolean;
  onRefreshNews: () => void;
  wibNow: string;
  altcoin5m: Record<string, Altcoin5mMetric>;
  hoveredPart: PartInfo | null;
  chartTargetSymbol: string;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onNavigate: (mode: TerminalViewMode) => void;
  onLoadToChart: (symbol: string) => void;
  onSelectNewsForAI: (item: MacroNewsItem) => void;
  onOpenTA: () => void;
  onOpenTopMovers: () => void;
  onOpenWhale: () => void;
  onOpenRadar: () => void;
  onOpenAlerts: () => void;
  onOpenExchangeSentiment: () => void;
}

interface WingItem {
  id: string;
  label: string;
  subtitle: string;
  keywords: string;
  featured?: boolean;
  drawerSide: 'left' | 'right' | 'modal' | 'action';
  drawerKey?: LeftDrawerToolId | RightDrawerToolId;
  badgeText?: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  onSelect: () => void;
}

export const SuperAppHome: React.FC<SuperAppHomeProps> = ({
  session,
  macroNews,
  newsLoading,
  onRefreshNews,
  wibNow,
  altcoin5m,
  hoveredPart,
  chartTargetSymbol,
  soundEnabled,
  onToggleSound,
  onNavigate,
  onLoadToChart,
  onSelectNewsForAI,
  onOpenTA,
  onOpenTopMovers,
  onOpenWhale,
  onOpenRadar,
  onOpenAlerts,
  onOpenExchangeSentiment,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeLeftTool, setActiveLeftTool] = useState<LeftDrawerToolId | null>(null);
  const [activeRightTool, setActiveRightTool] = useState<RightDrawerToolId | null>(null);

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

  const highImpactNews = useMemo(
    () => macroNews.filter((n) => n.impactLevel === 'HIGH'),
    [macroNews]
  );

  // Close open drawers on Escape key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveLeftTool(null);
        setActiveRightTool(null);
        setSearchFocused(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const openLeftDrawer = (tool: LeftDrawerToolId) => {
    setActiveLeftTool((prev) => {
      const next = prev === tool ? null : tool;
      if (next && window.innerWidth < 1280) {
        setActiveRightTool(null);
      }
      return next;
    });
  };

  const openRightDrawer = (tool: RightDrawerToolId) => {
    setActiveRightTool((prev) => {
      const next = prev === tool ? null : tool;
      if (next && window.innerWidth < 1280) {
        setActiveLeftTool(null);
      }
      return next;
    });
  };

  // LEFT WING: PASAR (Market Data, Cycles, Liquidity & Charts)
  const leftItems: WingItem[] = useMemo(
    () => [
      {
        id: 'bitcoin_cycle',
        label: 'Bitcoin Cycle',
        subtitle: 'Siklus & valuasi',
        keywords: 'bitcoin cycle btc harga',
        featured: true,
        drawerSide: 'left',
        drawerKey: 'bitcoin_cycle',
        icon: TrendingUp,
        onSelect: () => openLeftDrawer('bitcoin_cycle'),
      },
      {
        id: 'liquidity_movers',
        label: 'Likuiditas',
        subtitle: 'Arus & Top 5 L/S',
        keywords: 'likuiditas arus dana long short',
        drawerSide: 'left',
        drawerKey: 'liquidity_movers',
        icon: Compass,
        onSelect: () => openLeftDrawer('liquidity_movers'),
      },
      {
        id: 'multichart',
        label: 'Multichart',
        subtitle: 'Grafik TradingView',
        keywords: 'chart grafik candle multichart',
        drawerSide: 'left',
        drawerKey: 'multichart',
        icon: LayoutGrid,
        onSelect: () => openLeftDrawer('multichart'),
      },
      {
        id: 'movers',
        label: 'Top Movers',
        subtitle: 'Gainers & Losers',
        keywords: 'gainers losers runners movers',
        drawerSide: 'modal',
        icon: ArrowUpRight,
        onSelect: onOpenTopMovers,
      },
      {
        id: 'exchange_ls',
        label: 'Exchange L/S',
        subtitle: 'Binance & Bitget',
        keywords: 'exchange funding rate long short',
        drawerSide: 'modal',
        icon: BarChart2,
        onSelect: onOpenExchangeSentiment,
      },
    ],
    [onOpenExchangeSentiment, onOpenTopMovers]
  );

  // RIGHT WING: ALAT & BERITA (Tools, Research, News & Community)
  const rightItems: WingItem[] = useMemo(
    () => [
      {
        id: 'macro_terminal',
        label: 'Berita 24J',
        subtitle: 'Crypto & Makro',
        keywords: 'berita macro news crypto 24 jam',
        featured: true,
        drawerSide: 'right',
        drawerKey: 'macro_terminal',
        badgeText: macroNews.length > 0 ? String(macroNews.length) : undefined,
        icon: Newspaper,
        onSelect: () => openRightDrawer('macro_terminal'),
      },
      {
        id: 'narratives',
        label: 'Narratives 24J',
        subtitle: 'Tren & sektor panas',
        keywords: 'narratives coingecko dexscreener tren',
        featured: true,
        drawerSide: 'right',
        drawerKey: 'narratives',
        icon: Radio,
        onSelect: () => openRightDrawer('narratives'),
      },
      {
        id: 'high_impact',
        label: 'Prioritas',
        subtitle: 'Dampak tinggi',
        keywords: 'high impact penting prioritas',
        drawerSide: 'right',
        drawerKey: 'high_impact',
        badgeText: highImpactNews.length > 0 ? String(highImpactNews.length) : undefined,
        icon: Flame,
        onSelect: () => openRightDrawer('high_impact'),
      },
      {
        id: 'impact_matrix',
        label: 'Impact Matrix',
        subtitle: 'Peta dampak aset',
        keywords: 'impact matrix dxy emas forex',
        drawerSide: 'right',
        drawerKey: 'impact_matrix',
        icon: Activity,
        onSelect: () => openRightDrawer('impact_matrix'),
      },
      {
        id: 'room_chat',
        label: 'Room Chat',
        subtitle: 'Diskusi langsung',
        keywords: 'chat room diskusi pesan komunitas',
        featured: true,
        drawerSide: 'right',
        drawerKey: 'room_chat',
        icon: MessageSquare,
        onSelect: () => openRightDrawer('room_chat'),
      },
      {
        id: 'telemetry',
        label: '8-API Live',
        subtitle: 'Data 8 sumber',
        keywords: 'telemetry api binance kraken defillama mempool',
        drawerSide: 'right',
        drawerKey: 'telemetry',
        icon: Cpu,
        onSelect: () => openRightDrawer('telemetry'),
      },
      {
        id: 'ta',
        label: 'Teknikal',
        subtitle: 'Suite indikator',
        keywords: 'teknikal analisis rsi macd',
        drawerSide: 'modal',
        icon: Sliders,
        onSelect: onOpenTA,
      },
      {
        id: 'alerts',
        label: 'Price Alerts',
        subtitle: 'Notifikasi harga',
        keywords: 'alert notifikasi target harga',
        drawerSide: 'modal',
        icon: BellRing,
        onSelect: onOpenAlerts,
      },
      {
        id: 'whale',
        label: 'Whale Desk',
        subtitle: 'Pergerakan paus',
        keywords: 'whale kol onchain smart money',
        drawerSide: 'modal',
        icon: Anchor,
        onSelect: onOpenWhale,
      },
      {
        id: 'radar',
        label: 'Radar Kontra',
        subtitle: 'Sinyal ekstrem',
        keywords: 'contrarian radar dislokasi',
        drawerSide: 'modal',
        icon: Radar,
        onSelect: onOpenRadar,
      },
      {
        id: 'monolith_view',
        label: 'Kontrol 3D',
        subtitle: 'Preset & material',
        keywords: '3d monolith kontrol orbit',
        drawerSide: 'action',
        icon: Box,
        onSelect: () => onNavigate('monolith'),
      },
      {
        id: 'sound',
        label: soundEnabled ? 'Suara Aktif' : 'Suara Mati',
        subtitle: 'Audio alert',
        keywords: 'suara audio sound mute',
        drawerSide: 'action',
        icon: soundEnabled ? Volume2 : VolumeX,
        onSelect: onToggleSound,
      },
    ],
    [
      highImpactNews.length,
      macroNews.length,
      onNavigate,
      onOpenAlerts,
      onOpenRadar,
      onOpenTA,
      onOpenWhale,
      onToggleSound,
      soundEnabled,
    ]
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const searchResults = useMemo(() => {
    if (!normalizedQuery) return { tools: [] as WingItem[], news: [] as MacroNewsItem[] };
    const allTools = [...leftItems, ...rightItems];
    const tools = allTools.filter(
      (item) =>
        item.label.toLowerCase().includes(normalizedQuery) ||
        item.subtitle.toLowerCase().includes(normalizedQuery) ||
        item.keywords.toLowerCase().includes(normalizedQuery)
    );
    const news = macroNews
      .filter(
        (n) =>
          n.title.toLowerCase().includes(normalizedQuery) ||
          n.source.toLowerCase().includes(normalizedQuery)
      )
      .slice(0, 4);
    return { tools: tools.slice(0, 6), news };
  }, [leftItems, macroNews, normalizedQuery, rightItems]);

  const breakingHeadlines = useMemo(() => macroNews.slice(0, 3), [macroNews]);

  const activeLeftMeta = leftItems.find((i) => i.drawerKey === activeLeftTool);
  const activeRightMeta = rightItems.find((i) => i.drawerKey === activeRightTool);

  const renderWingButton = (item: WingItem, side: 'left' | 'right') => {
    const Icon = item.icon;
    const isActive =
      (side === 'left' && item.drawerKey && activeLeftTool === item.drawerKey) ||
      (side === 'right' && item.drawerKey && activeRightTool === item.drawerKey);

    return (
      <button
        key={item.id}
        onClick={() => {
          sound.playClick();
          item.onSelect();
        }}
        title={`${item.label} — ${item.subtitle}`}
        className={`group relative w-full flex items-center gap-2.5 p-2 rounded-xl border transition-all duration-200 cursor-pointer min-h-[44px] ${
          isActive
            ? 'bg-[#172034] border-[#d4af37]/60 text-[#f5e3af]'
            : 'bg-[#0d1322]/70 hover:bg-[#141c30] border-transparent hover:border-[#2a364f] text-slate-200'
        }`}
      >
        <div
          className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border transition-colors ${
            isActive
              ? 'bg-[#e7cc82]/15 border-[#d4af37]/50 text-[#e7cc82]'
              : item.featured
              ? 'bg-[#121a2b] border-[#d4af37]/30 text-[#e7cc82] group-hover:border-[#d4af37]/60'
              : 'bg-[#121a2b] border-[#253147] text-slate-300 group-hover:text-[#e7cc82] group-hover:border-[#d4af37]/40'
          }`}
        >
          <Icon className="w-4 h-4" strokeWidth={1.65} />
        </div>

        <div className="hidden md:flex flex-col items-start text-left min-w-0 flex-1">
          <div className="flex items-center justify-between w-full gap-1.5">
            <span
              className={`text-xs font-medium truncate leading-tight ${
                isActive ? 'text-[#f6e8be]' : 'text-slate-100 group-hover:text-[#f3df9b]'
              }`}
            >
              {item.label}
            </span>
            {item.badgeText && (
              <span className="text-[10px] font-mono tabular-nums text-[#e7cc82]/90 shrink-0">
                {item.badgeText}
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 truncate w-full leading-tight mt-0.5">
            {item.subtitle}
          </span>
        </div>

        <ChevronRight
          className={`hidden md:block w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
            side === 'right' ? 'rotate-180' : ''
          } ${
            isActive
              ? 'text-[#e7cc82]'
              : 'text-slate-600 group-hover:text-slate-300'
          }`}
          strokeWidth={1.6}
        />
      </button>
    );
  };

  return (
    <div className="relative z-10 w-full h-full pointer-events-none overflow-hidden">
      {/* 1. TOP-CENTER FLOATING COMMAND & TELEMETRY RIBBON */}
      <div className="pointer-events-auto absolute top-3 left-1/2 -translate-x-1/2 z-20 w-[calc(100%-24px)] max-w-2xl">
        <div className="relative rounded-2xl bg-[#090d16]/88 border border-[#222d42] border-t-[#d4af37]/30 px-3 sm:px-4 py-2 flex items-center justify-between gap-3">
          {/* Live Telemetry Summary */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => {
                sound.playClick();
                openLeftDrawer('bitcoin_cycle');
              }}
              className="text-left group cursor-pointer shrink-0"
              title="Buka Bitcoin Cycle"
            >
              <div className="text-[10px] text-slate-400 leading-none">
                Halo, {session.traderName || 'Trader'}
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-xs sm:text-sm font-semibold text-white font-mono tabular-nums group-hover:text-[#e7cc82] transition-colors">
                  {btcMetric?.price
                    ? `$${btcMetric.price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
                    : 'BTC $—'}
                </span>
                {btcMetric && (
                  <span
                    className={`text-[10px] font-mono tabular-nums font-medium ${
                      btcMetric.change5m >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {btcMetric.change5m >= 0 ? '+' : ''}
                    {btcMetric.change5m}%
                  </span>
                )}
              </div>
            </button>

            <span className="hidden sm:block h-6 w-px bg-[#1f293d]" aria-hidden="true" />

            <button
              onClick={() => {
                sound.playClick();
                openRightDrawer('macro_terminal');
              }}
              className="hidden sm:block text-left group cursor-pointer shrink-0"
              title="Buka Berita 24 Jam"
            >
              <div className="text-[10px] text-slate-400 leading-none">Orbit 5M</div>
              <div className="mt-1 text-xs font-mono tabular-nums">
                <span className="text-emerald-400">{orbitSummary.up}↑</span>
                <span className="text-slate-600 mx-1">/</span>
                <span className="text-rose-400">{orbitSummary.down}↓</span>
              </div>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-[230px] sm:max-w-[260px]">
            <Search
              className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              strokeWidth={1.6}
            />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setSearchFocused(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchFocused(true);
              }}
              placeholder="Cari berita atau alat..."
              className="w-full h-9 pl-8 pr-7 rounded-xl bg-[#0d1322] border border-[#232e44] focus:border-[#d4af37]/65 text-xs text-white placeholder:text-slate-400 outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchFocused(false);
                }}
                aria-label="Hapus pencarian"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}

            {/* Instant Search Popover */}
            {searchFocused && normalizedQuery.length > 0 && (
              <div className="absolute right-0 left-0 sm:left-auto sm:w-80 top-11 rounded-2xl bg-[#0a0f1a]/95 border border-[#253147] shadow-2xl p-2 space-y-2 z-50 animate-content-rise">
                {searchResults.tools.length === 0 && searchResults.news.length === 0 ? (
                  <p className="text-xs text-slate-400 px-3 py-3 text-center">
                    Tidak ada hasil untuk "{searchQuery}".
                  </p>
                ) : (
                  <>
                    {searchResults.tools.length > 0 && (
                      <div>
                        <div className="px-2.5 py-1 text-[10px] font-medium text-[#cbb06a]">
                          Alat & Layanan
                        </div>
                        {searchResults.tools.map((t) => {
                          const Icon = t.icon;
                          return (
                            <button
                              key={t.id}
                              onClick={() => {
                                sound.playClick();
                                t.onSelect();
                                setSearchFocused(false);
                              }}
                              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-[#151e32] text-left cursor-pointer"
                            >
                              <Icon className="w-4 h-4 text-[#e7cc82] shrink-0" strokeWidth={1.6} />
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-medium text-slate-100 truncate">
                                  {t.label}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate">
                                  {t.subtitle}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {searchResults.news.length > 0 && (
                      <div className="border-t border-[#1b2436] pt-1.5">
                        <div className="px-2.5 py-1 text-[10px] font-medium text-[#cbb06a]">
                          Berita Terkait
                        </div>
                        {searchResults.news.map((n) => (
                          <button
                            key={n.id}
                            onClick={() => {
                              sound.playClick();
                              onSelectNewsForAI(n);
                              setSearchFocused(false);
                            }}
                            className="w-full px-2.5 py-2 rounded-xl hover:bg-[#151e32] text-left cursor-pointer"
                          >
                            <div className="text-xs text-slate-100 line-clamp-1">{n.title}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {n.source} · {n.timeAgo}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. LEFT WING: PASAR, GRAFIK & KOMUNITAS RAIL */}
      <aside
        aria-label="Menu Kiri Pasar dan Komunitas"
        className="pointer-events-auto absolute left-2.5 sm:left-4 top-[72px] bottom-3 sm:bottom-4 z-20 flex items-center"
      >
        <div className="w-[54px] md:w-[186px] lg:w-[202px] max-h-full overflow-y-auto rounded-2xl bg-[#090d16]/88 border border-[#1f283b] border-t-[#d4af37]/25 p-1.5 md:p-2.5 space-y-1 shadow-2xl">
          <div className="hidden md:flex items-center justify-between px-2 pt-1 pb-1.5">
            <span className="text-[11px] font-medium text-[#e7cc82] tracking-wide">
              Pasar & Alat
            </span>
            <span className="text-[10px] font-mono text-slate-500">Kiri</span>
          </div>

          {leftItems.map((item) => renderWingButton(item, 'left'))}
        </div>
      </aside>

      {/* 3. RIGHT WING: BERITA, NARRATIVES & RISET RAIL */}
      <aside
        aria-label="Menu Kanan Berita dan Riset"
        className="pointer-events-auto absolute right-2.5 sm:right-4 top-[72px] bottom-3 sm:bottom-4 z-20 flex items-center"
      >
        <div className="w-[54px] md:w-[198px] lg:w-[218px] max-h-full overflow-y-auto rounded-2xl bg-[#090d16]/88 border border-[#1f283b] border-t-[#d4af37]/25 p-1.5 md:p-2.5 space-y-1 shadow-2xl">
          <div className="hidden md:flex items-center justify-between px-2 pt-1 pb-1.5">
            <span className="text-[11px] font-medium text-[#e7cc82] tracking-wide">
              Berita & Riset
            </span>
            <span className="text-[10px] font-mono text-slate-500">Kanan</span>
          </div>

          {rightItems.map((item) => renderWingButton(item, 'right'))}

          {/* Quick Clickable Breaking Headlines on Desktop Right Wing */}
          <div className="hidden md:block pt-2 mt-2 border-t border-[#1b2436] space-y-1.5">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-medium text-slate-400">
                Headline Terbaru
              </span>
              <button
                onClick={() => {
                  sound.playClick();
                  openRightDrawer('macro_terminal');
                }}
                className="text-[10px] text-[#e7cc82] hover:text-[#f5e3af] cursor-pointer"
              >
                Semua
              </button>
            </div>

            {newsLoading && breakingHeadlines.length === 0 ? (
              <div className="px-2 py-2 text-[11px] text-slate-500">Memuat berita...</div>
            ) : (
              breakingHeadlines.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    sound.playClick();
                    openRightDrawer('macro_terminal');
                  }}
                  className="w-full text-left px-2 py-1.5 rounded-xl bg-[#0d1322]/75 hover:bg-[#141d31] border border-transparent hover:border-[#d4af37]/30 transition-colors cursor-pointer"
                >
                  <p className="text-[11px] text-slate-200 line-clamp-2 leading-snug">
                    {item.title}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500">
                    <span className="text-[#cbb06a] truncate">{item.source}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums shrink-0">{item.timeAgo}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* 4. ANIMATED LEFT SLIDE-OUT DRAWER (Directly Reveals Selected Market / Chat / Utility Tool) */}
      {activeLeftTool && (
        <section
          key={activeLeftTool}
          aria-label={activeLeftMeta?.label || 'Panel Kiri'}
          className="pointer-events-auto animate-slide-in-left absolute top-[72px] bottom-3 sm:bottom-4 left-[64px] md:left-[210px] lg:left-[228px] right-3 md:right-auto md:w-[min(560px,calc(100vw-240px))] xl:w-[min(620px,41vw)] z-30 rounded-2xl bg-[#080c15]/96 border border-[#243047] border-t-[#d4af37]/40 shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Drawer Header */}
          <div className="shrink-0 h-12 px-4 border-b border-[#1c263a] bg-[#0b101d] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {activeLeftMeta && (
                <activeLeftMeta.icon className="w-4 h-4 text-[#e7cc82] shrink-0" strokeWidth={1.7} />
              )}
              <div className="min-w-0">
                <h2 className="text-xs sm:text-sm font-semibold text-[#f5e3af] truncate">
                  {activeLeftMeta?.label}
                </h2>
              </div>
              <span className="hidden sm:inline text-xs text-slate-400 truncate">
                · {activeLeftMeta?.subtitle}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  sound.playClick();
                  const target = activeLeftTool;
                  setActiveLeftTool(null);
                  onNavigate(target);
                }}
                title="Buka Layar Penuh"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#121a2b] hover:bg-[#1a253d] border border-[#24314a] text-[11px] font-medium text-slate-200 hover:text-[#e7cc82] transition-colors cursor-pointer"
              >
                <Maximize2 className="w-3 h-3" strokeWidth={1.7} />
                <span className="hidden sm:inline">Penuh</span>
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveLeftTool(null);
                }}
                aria-label="Tutup panel kiri"
                className="p-1.5 rounded-lg bg-[#121a2b] hover:bg-[#1e2940] border border-[#24314a] text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col bg-[#070a11]">
            {activeLeftTool === 'bitcoin_cycle' && (
              <BitcoinCyclePanel
                onLoadToChart={onLoadToChart}
                onOpenAlerts={onOpenAlerts}
              />
            )}
            {activeLeftTool === 'liquidity_movers' && (
              <div className="w-full h-full overflow-y-auto p-3 sm:p-4">
                <CryptoLiquidityMoversPanel
                  onLoadToChart={onLoadToChart}
                  onOpenAlerts={onOpenAlerts}
                />
              </div>
            )}
            {activeLeftTool === 'multichart' && (
              <MultiChartGrid
                externalSymbol={chartTargetSymbol}
                onOpenTA={onOpenTA}
              />
            )}
          </div>
        </section>
      )}

      {/* 5. ANIMATED RIGHT SLIDE-OUT DRAWER (Directly Reveals Berita, Narratives 24J, Prioritas & Impact Matrix) */}
      {activeRightTool && (
        <section
          key={activeRightTool}
          aria-label={activeRightMeta?.label || 'Panel Kanan'}
          className="pointer-events-auto animate-slide-in-right absolute top-[72px] bottom-3 sm:bottom-4 right-[64px] md:right-[222px] lg:right-[244px] left-3 md:left-auto md:w-[min(580px,calc(100vw-252px))] xl:w-[min(640px,42vw)] z-30 rounded-2xl bg-[#080c15]/96 border border-[#243047] border-t-[#d4af37]/40 shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Drawer Header */}
          <div className="shrink-0 h-12 px-4 border-b border-[#1c263a] bg-[#0b101d] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {activeRightMeta && (
                <activeRightMeta.icon className="w-4 h-4 text-[#e7cc82] shrink-0" strokeWidth={1.7} />
              )}
              <div className="min-w-0">
                <h2 className="text-xs sm:text-sm font-semibold text-[#f5e3af] truncate">
                  {activeRightMeta?.label}
                </h2>
              </div>
              <span className="hidden sm:inline text-xs text-slate-400 truncate">
                · {activeRightMeta?.subtitle}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  sound.playClick();
                  const target = activeRightTool;
                  setActiveRightTool(null);
                  onNavigate(target);
                }}
                title="Buka Layar Penuh"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#121a2b] hover:bg-[#1a253d] border border-[#24314a] text-[11px] font-medium text-slate-200 hover:text-[#e7cc82] transition-colors cursor-pointer"
              >
                <Maximize2 className="w-3 h-3" strokeWidth={1.7} />
                <span className="hidden sm:inline">Penuh</span>
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveRightTool(null);
                }}
                aria-label="Tutup panel kanan"
                className="p-1.5 rounded-lg bg-[#121a2b] hover:bg-[#1e2940] border border-[#24314a] text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col bg-[#070a11]">
            {activeRightTool === 'macro_terminal' && (
              <MacroNewsTable
                news={macroNews}
                loading={newsLoading}
                onRefresh={onRefreshNews}
                onSelectForAI={onSelectNewsForAI}
                wibNow={wibNow}
              />
            )}
            {activeRightTool === 'narratives' && <CryptoNarrativeStream />}
            {activeRightTool === 'high_impact' && (
              <MacroNewsTable
                news={highImpactNews}
                loading={newsLoading}
                onRefresh={onRefreshNews}
                onSelectForAI={onSelectNewsForAI}
                wibNow={wibNow}
              />
            )}
            {activeRightTool === 'impact_matrix' && (
              <MacroImpactMatrix
                news={macroNews}
                onSelectNews={onSelectNewsForAI}
              />
            )}
            {activeRightTool === 'room_chat' && <RoomChatView session={session} />}
            {activeRightTool === 'telemetry' && <MultiApiTelemetryPanel />}
          </div>
        </section>
      )}

      {/* 6. CENTER BOTTOM SUPER APP HUB QUICK ACCESS BAR */}
      {!activeLeftTool && !activeRightTool && (
        <div className="pointer-events-auto absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[calc(100%-32px)] max-w-3xl flex flex-col items-center gap-2">
          {/* Super App 3-Button Hub Cards */}
          <div className="grid grid-cols-3 gap-2.5 w-full bg-[#080c16]/92 border border-[#212d45] border-t-[#d4af37]/40 p-2 sm:p-2.5 rounded-2xl shadow-2xl backdrop-blur-md">
            <button
              onClick={() => {
                sound.playClick();
                openLeftDrawer('bitcoin_cycle');
              }}
              className="flex flex-col items-center sm:items-start p-2.5 rounded-xl bg-[#0d1424] hover:bg-[#141e33] border border-[#23314d] hover:border-[#d4af37]/50 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#e7cc82]">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="truncate">PASAR</span>
              </div>
              <span className="hidden sm:block text-[10px] text-slate-400 truncate mt-0.5">
                Siklus BTC &amp; Likuiditas
              </span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                openRightDrawer('macro_terminal');
              }}
              className="flex flex-col items-center sm:items-start p-2.5 rounded-xl bg-[#0d1424] hover:bg-[#141e33] border border-[#23314d] hover:border-[#d4af37]/50 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#e7cc82]">
                <Newspaper className="w-3.5 h-3.5" />
                <span className="truncate">BERITA 24J</span>
              </div>
              <span className="hidden sm:block text-[10px] text-slate-400 truncate mt-0.5">
                Crypto &amp; Makro Wire
              </span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                openRightDrawer('room_chat');
              }}
              className="flex flex-col items-center sm:items-start p-2.5 rounded-xl bg-[#0d1424] hover:bg-[#141e33] border border-[#23314d] hover:border-[#d4af37]/50 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#e7cc82]">
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="truncate">ROOM CHAT</span>
              </div>
              <span className="hidden sm:block text-[10px] text-slate-400 truncate mt-0.5">
                Diskusi Komunitas
              </span>
            </button>
          </div>

          {/* Hovered Monolith Readout */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#090d16]/82 border border-[#1f293d] text-[11px] text-slate-300">
            {hoveredPart ? (
              <>
                <span className="font-semibold text-[#e7cc82]">{hoveredPart.name}</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-300 max-w-xs truncate">{hoveredPart.description}</span>
              </>
            ) : (
              <span className="text-slate-400 text-[10px]">
                GHALI ON CHAIN Super App · Klik menu Pasar, Berita, atau Room Chat di atas untuk mulai
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
