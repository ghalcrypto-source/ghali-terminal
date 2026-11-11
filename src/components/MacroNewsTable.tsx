import React, { useState } from 'react';
import {
  Search,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Clock,
  Filter,
  Globe,
  Radio,
  Zap,
  TrendingUp,
  TrendingDown,
  MinusCircle,
  LayoutList,
  LayoutGrid,
  ChevronRight,
  ShieldCheck,
  Flame,
  Columns,
  Activity,
  Layers,
  Cpu,
  BarChart2,
  Gauge,
  SlidersHorizontal,
  Home,
  BarChart3,
  Newspaper,
  Bell,
  Star,
  Settings,
  Grid,
  Key,
  Database,
  Crown,
  Sun,
  Moon,
  Maximize2,
  RotateCcw,
  Sliders,
  Compass,
} from 'lucide-react';
import { MacroNewsItem, MACRO_CATEGORIES, MacroCategory } from '../types/macroNews';
import { sound } from '../audio/soundEngine';

interface MacroNewsTableProps {
  news: MacroNewsItem[];
  loading: boolean;
  onRefresh: () => void;
  onSelectForAI: (item: MacroNewsItem) => void;
  wibNow: string;
}

const SOURCES_LIST = [
  'All Sources',
  'Reuters',
  'Bloomberg',
  'CoinDesk',
  'Decrypt',
  'The Block',
  'BBC World',
  'France 24',
  'Al Jazeera',
];

const TIME_RANGES = [
  { id: '1h', label: 'Last 1 Hour' },
  { id: '6h', label: 'Last 6 Hours' },
  { id: '24h', label: 'Last 24 Hours' },
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
];

export const MacroNewsTable: React.FC<MacroNewsTableProps> = ({
  news,
  loading,
  onRefresh,
  onSelectForAI,
  wibNow,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MacroCategory | 'ALL'>('ALL');
  const [selectedSource, setSelectedSource] = useState('All Sources');
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedImpacts, setSelectedImpacts] = useState<string[]>(['HIGH', 'MEDIUM', 'LOW']);
  const [activeTabSub, setActiveTabSub] = useState<'top' | 'latest' | 'hot' | 'video' | 'press'>('top');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSidebarNav, setActiveSidebarNav] = useState('news');

  const handleToggleImpact = (impact: string) => {
    sound.playClick();
    if (selectedImpacts.includes(impact)) {
      if (selectedImpacts.length > 1) {
        setSelectedImpacts(selectedImpacts.filter((i) => i !== impact));
      }
    } else {
      setSelectedImpacts([...selectedImpacts, impact]);
    }
  };

  const handleResetFilters = () => {
    sound.playClick();
    setSelectedCategory('ALL');
    setSelectedSource('All Sources');
    setSelectedTimeRange('24h');
    setSelectedImpacts(['HIGH', 'MEDIUM', 'LOW']);
    setSearchQuery('');
  };

  const filteredNews = news.filter((item) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (selectedSource !== 'All Sources' && !item.source.toLowerCase().includes(selectedSource.toLowerCase())) return false;
    if (!selectedImpacts.includes(item.impactLevel)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const highImpactNews = news.filter((n) => n.impactLevel === 'HIGH');
  const breakingNews = highImpactNews.length > 0 ? highImpactNews[0] : news[0];

  return (
    <div className="w-full h-full bg-[#06080d] text-slate-100 flex flex-col overflow-hidden font-sans select-none">
      {/* 3-COLUMN MAIN WORKSPACE (EXACT MATCH TO REFERENCE SCREENSHOT) */}
      <div className="flex-1 flex overflow-hidden w-full h-full">
        {/* ============================================================ */}
        {/* LEFT COLUMN: NAVIGATION SIDEBAR                              */}
        {/* ============================================================ */}
        <aside className="w-56 shrink-0 bg-[#080b12] border-r border-[#1a253a] flex flex-col justify-between p-3 overflow-y-auto hidden xl:flex text-xs font-mono">
          <div className="space-y-6">
            {/* Main Menu Navigation */}
            <div className="space-y-1">
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveSidebarNav('home');
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeSidebarNav === 'home'
                    ? 'bg-amber-500 text-black shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#101726]'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveSidebarNav('markets');
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeSidebarNav === 'markets'
                    ? 'bg-amber-500 text-black shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#101726]'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Markets</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveSidebarNav('news');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeSidebarNav === 'news'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-black shadow-lg font-extrabold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#101726]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Newspaper className="w-4 h-4" />
                  <span>News</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-black animate-ping" />
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveSidebarNav('alerts');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeSidebarNav === 'alerts'
                    ? 'bg-amber-500 text-black shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#101726]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Bell className="w-4 h-4 text-red-400" />
                  <span>Alerts</span>
                </div>
                <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-bold">3</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveSidebarNav('watchlist');
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeSidebarNav === 'watchlist'
                    ? 'bg-amber-500 text-black shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#101726]'
                }`}
              >
                <Star className="w-4 h-4" />
                <span>Watchlist</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveSidebarNav('analytics');
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeSidebarNav === 'analytics'
                    ? 'bg-amber-500 text-black shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#101726]'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Analytics</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveSidebarNav('settings');
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeSidebarNav === 'settings'
                    ? 'bg-amber-500 text-black shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#101726]'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>

            {/* Tools & Features Section */}
            <div className="space-y-2 pt-2 border-t border-[#18243b]">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-extrabold px-3 block">
                TOOLS & FEATURES
              </span>

              <div className="space-y-1">
                <button
                  onClick={() => sound.playClick()}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#101726] transition-colors cursor-pointer"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                  <span>Technical Analysis</span>
                </button>

                <button
                  onClick={() => sound.playClick()}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#101726] transition-colors cursor-pointer"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-blue-400" />
                  <span>Multi-Chart</span>
                </button>

                <button
                  onClick={() => sound.playClick()}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#101726] transition-colors cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Global Liquidity</span>
                </button>

                <button
                  onClick={() => sound.playClick()}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#101726] transition-colors cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  <span>On-Chain Data</span>
                </button>

                <button
                  onClick={() => sound.playClick()}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#101726] transition-colors cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5 text-purple-400" />
                  <span>API & Integrations</span>
                </button>

                <button
                  onClick={() => sound.playClick()}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#101726] transition-colors cursor-pointer"
                >
                  <Grid className="w-3.5 h-3.5 text-orange-400" />
                  <span>Heatmap</span>
                </button>
              </div>
            </div>
          </div>

          {/* Pro Access Footer Card */}
          <div className="p-3.5 bg-gradient-to-b from-[#0f1728] to-[#0a0f1b] border border-amber-500/30 rounded-xl space-y-2 mt-4 shadow-lg">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
              <Crown className="w-4 h-4 text-amber-400 fill-amber-400/20" />
              <span>Pro Access</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
              Unlock more premium features and institutional signals.
            </p>
            <button
              onClick={() => sound.playClick(1400)}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold text-xs py-1.5 rounded-lg transition-all shadow-md cursor-pointer"
            >
              Upgrade →
            </button>
          </div>
        </aside>

        {/* ============================================================ */}
        {/* CENTER COLUMN: MAIN GLOBAL CRYPTO & MACRO NEWS WIRE FEED     */}
        {/* ============================================================ */}
        <main className="flex-1 flex flex-col bg-[#05070c] overflow-hidden border-r border-[#1a253a]">
          {/* Section 1: Title & Category Tabs */}
          <div className="bg-[#080c14] border-b border-[#18243b] p-4 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-base sm:text-lg font-mono font-extrabold text-white tracking-wider">
                  Global Crypto News & Intelligence
                </h1>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  Real-time news, market-moving events, and on-chain intelligence.
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2 font-mono text-xs text-amber-300 bg-[#0e1626] px-3 py-1 rounded-lg border border-[#202e48]">
                <span>⏱ {wibNow || 'Live WIB'}</span>
              </div>
            </div>

            {/* Row 1: Primary Category Pills (Matching reference pill count badges) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              <button
                onClick={() => {
                  sound.playClick();
                  setSelectedCategory('ALL');
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-mono shrink-0 transition-all cursor-pointer font-bold border ${
                  selectedCategory === 'ALL'
                    ? 'bg-amber-500 text-black border-amber-400 shadow-md'
                    : 'bg-[#101726] text-slate-300 border-[#1e2c45] hover:border-amber-500/50'
                }`}
              >
                All News ({filteredNews.length})
              </button>

              {MACRO_CATEGORIES.map((cat, idx) => {
                const count = news.filter((n) => n.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedCategory(cat.id);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-mono shrink-0 transition-all cursor-pointer border ${
                      selectedCategory === cat.id
                        ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-md'
                        : 'bg-[#0b111e] text-slate-300 border-[#1a273f] hover:border-amber-500/50'
                    }`}
                  >
                    {cat.label} ({count})
                  </button>
                );
              })}
            </div>

            {/* Row 2: Secondary Filters & Sort (Top, Latest, Hot, Video, Press) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#141d2f]">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  onClick={() => {
                    sound.playClick();
                    setActiveTabSub('top');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    activeTabSub === 'top'
                      ? 'bg-amber-500 text-black shadow'
                      : 'bg-[#0f1726] text-slate-400 hover:text-white border border-[#1b2840]'
                  }`}
                >
                  🔥 Top
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    setActiveTabSub('latest');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    activeTabSub === 'latest'
                      ? 'bg-amber-500 text-black shadow'
                      : 'bg-[#0f1726] text-slate-400 hover:text-white border border-[#1b2840]'
                  }`}
                >
                  ⏱ Latest
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    setActiveTabSub('hot');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    activeTabSub === 'hot'
                      ? 'bg-amber-500 text-black shadow'
                      : 'bg-[#0f1726] text-slate-400 hover:text-white border border-[#1b2840]'
                  }`}
                >
                  ⚡ Hot
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    setActiveTabSub('video');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    activeTabSub === 'video'
                      ? 'bg-amber-500 text-black shadow'
                      : 'bg-[#0f1726] text-slate-400 hover:text-white border border-[#1b2840]'
                  }`}
                >
                  🎥 Video
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    setActiveTabSub('press');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    activeTabSub === 'press'
                      ? 'bg-amber-500 text-black shadow'
                      : 'bg-[#0f1726] text-slate-400 hover:text-white border border-[#1b2840]'
                  }`}
                >
                  📰 Press Release
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400">Sort by:</span>
                <select className="bg-[#0b101b] border border-[#1e2a42] text-amber-300 rounded px-2.5 py-1 text-xs font-mono font-bold outline-none cursor-pointer">
                  <option>Latest</option>
                  <option>Most Impactful</option>
                  <option>Popularity</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Main News Wire Table (Exact Match to Reference Table Headers) */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[#05070c]">
            {loading ? (
              <div className="py-28 flex flex-col items-center justify-center gap-3 text-slate-400 font-mono text-xs">
                <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                <span className="tracking-widest">LOADING REAL-TIME MACRO NEWS WIRE...</span>
              </div>
            ) : filteredNews.length === 0 ? (
              <div className="py-28 text-center text-xs font-mono text-slate-500">
                Tidak ada berita yang memenuhi kriteria filter saat ini.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-[#1a263d] bg-[#080c14] shadow-2xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#1d2b45] bg-[#0c1220] text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-3.5 w-32">TIME</th>
                      <th className="py-3 px-3.5 w-36">SOURCE</th>
                      <th className="py-3 px-3.5">HEADLINE & KEYWORDS</th>
                      <th className="py-3 px-3.5 w-44">TAGS</th>
                      <th className="py-3 px-3.5 w-48">IMPACT</th>
                      <th className="py-3 px-3.5 w-36 text-center">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#131b2e] text-xs font-mono">
                    {filteredNews.map((item, idx) => {
                      const isFeaturedBreaking = idx === 4 || item.impactLevel === 'HIGH' && idx === 0;

                      return (
                        <tr
                          key={item.id}
                          className={`transition-all duration-200 group ${
                            isFeaturedBreaking
                              ? 'bg-gradient-to-r from-amber-500/10 via-[#0d1424] to-[#080c14] border-2 border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                              : 'hover:bg-[#0c1424]'
                          }`}
                        >
                          {/* TIME WIB */}
                          <td className="py-3.5 px-3.5 align-top whitespace-nowrap">
                            <div className="flex items-center gap-1 text-amber-300 font-bold text-xs">
                              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>{item.timestampWIB.split(',')[1] || item.timestampWIB}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 block pl-4 mt-0.5">{item.timeAgo}</span>
                          </td>

                          {/* SOURCE BADGE */}
                          <td className="py-3.5 px-3.5 align-top">
                            <div className="space-y-1">
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#141d2e] text-amber-300 border border-[#233352]">
                                {item.categoryLabel}
                              </span>
                              <div className="flex items-center gap-1 text-slate-400 text-[11px] font-bold">
                                <Globe className="w-3 h-3 text-blue-400" />
                                <span>{item.source}</span>
                              </div>
                            </div>
                          </td>

                          {/* HEADLINE & KEYWORDS */}
                          <td className="py-3.5 px-3.5 align-top">
                            {isFeaturedBreaking && (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-black mb-1.5 shadow">
                                <Zap className="w-3 h-3 fill-current" />
                                <span>Breaking News</span>
                              </div>
                            )}

                            <h3 className="font-bold text-slate-100 group-hover:text-amber-300 transition-colors leading-snug text-xs sm:text-sm">
                              <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {item.title}
                              </a>
                            </h3>

                            <p className="text-[11px] font-sans text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                              {item.summary}
                            </p>
                          </td>

                          {/* TAGS */}
                          <td className="py-3.5 px-3.5 align-top">
                            <div className="flex flex-wrap gap-1">
                              {(item.targetAssets || ['DXY', 'BTC', 'XAUUSD']).map((asset) => (
                                <span
                                  key={asset}
                                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#121a2b] text-amber-300 border border-[#21304d]"
                                >
                                  {asset}
                                </span>
                              ))}
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#0f1726] text-slate-400 border border-[#1a273e]">
                                {item.country}
                              </span>
                            </div>
                          </td>

                          {/* IMPACT */}
                          <td className="py-3.5 px-3.5 align-top whitespace-nowrap">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <BarChart2
                                  className={`w-4 h-4 ${
                                    item.impactLevel === 'HIGH'
                                      ? 'text-red-400'
                                      : item.impactLevel === 'MEDIUM'
                                      ? 'text-amber-400'
                                      : 'text-slate-500'
                                  }`}
                                />
                                <span
                                  className={`font-bold text-xs uppercase ${
                                    item.impactLevel === 'HIGH'
                                      ? 'text-red-400'
                                      : item.impactLevel === 'MEDIUM'
                                      ? 'text-amber-400'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {item.impactLevel} Impact
                                </span>
                              </div>

                              <span className="text-[10px] text-slate-500 block">
                                {item.categoryLabel}
                              </span>
                            </div>
                          </td>

                          {/* ACTION BUTTON */}
                          <td className="py-3.5 px-3.5 align-top text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex flex-col gap-1.5 items-center">
                              <a
                                href={item.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-[#101726] hover:bg-[#18243b] text-slate-200 border border-[#21304d] transition-all cursor-pointer w-full text-center"
                              >
                                <span>{item.source.split(' ')[0]}</span>
                                <ExternalLink className="w-3 h-3 text-blue-400" />
                              </a>

                              <button
                                onClick={() => {
                                  sound.playClick(1400);
                                  onSelectForAI(item);
                                }}
                                className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all cursor-pointer w-full"
                              >
                                <Sparkles className="w-3 h-3 text-amber-400" />
                                <span>BEDAH AI</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: QUICK FILTERS PANEL                            */}
        {/* ============================================================ */}
        <aside className="w-64 shrink-0 bg-[#080b12] border-l border-[#1a253a] flex flex-col justify-between p-4 overflow-y-auto hidden lg:flex text-xs font-mono">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#18243b] pb-3">
              <div className="flex items-center gap-2 font-bold text-white text-xs">
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                <span>Quick Filters</span>
              </div>
            </div>

            {/* Sources Filter */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold block">
                SOURCES
              </span>
              <div className="space-y-1.5">
                {SOURCES_LIST.map((src) => (
                  <label
                    key={src}
                    onClick={() => {
                      sound.playClick();
                      setSelectedSource(src);
                    }}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      selectedSource === src
                        ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#101726]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="newsSource"
                      checked={selectedSource === src}
                      onChange={() => {}}
                      className="accent-amber-400"
                    />
                    <span>{src}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Time Range Filter */}
            <div className="space-y-2 pt-3 border-t border-[#18243b]">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold block">
                TIME RANGE
              </span>
              <div className="space-y-1.5">
                {TIME_RANGES.map((tr) => (
                  <label
                    key={tr.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedTimeRange(tr.id);
                    }}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      selectedTimeRange === tr.id
                        ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#101726]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="timeRange"
                      checked={selectedTimeRange === tr.id}
                      onChange={() => {}}
                      className="accent-amber-400"
                    />
                    <span>{tr.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Impact Level Filter */}
            <div className="space-y-2 pt-3 border-t border-[#18243b]">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold block">
                IMPACT LEVEL
              </span>
              <div className="space-y-1.5">
                {['HIGH', 'MEDIUM', 'LOW'].map((imp) => (
                  <label
                    key={imp}
                    onClick={() => handleToggleImpact(imp)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-[#101726] transition-colors cursor-pointer font-bold"
                  >
                    <input
                      type="checkbox"
                      checked={selectedImpacts.includes(imp)}
                      onChange={() => {}}
                      className="accent-amber-400 rounded"
                    />
                    <span
                      className={
                        imp === 'HIGH'
                          ? 'text-red-400'
                          : imp === 'MEDIUM'
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }
                    >
                      {imp} Impact
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Reset Filters Button */}
          <button
            onClick={handleResetFilters}
            className="w-full mt-6 bg-[#0f1726] hover:bg-[#16233a] text-slate-300 border border-[#202e48] hover:border-amber-400 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset Filters</span>
          </button>
        </aside>
      </div>

      {/* ============================================================ */}
      {/* BOTTOM FOOTER STATUS BAR (EXACT MATCH TO REFERENCE FOOTER)   */}
      {/* ============================================================ */}
      <footer className="h-8 bg-[#04060a] border-t border-[#18243b] px-4 flex items-center justify-between text-[11px] font-mono text-slate-400 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-slate-300 font-bold">Live Updates</span>
          <span className="text-slate-600">|</span>
          <span>Last Updated: {wibNow || '17:40:52 WIB'}</span>
        </div>

        <div className="flex items-center gap-3">
          <span>⛅ 26°C Berawan</span>
          <span className="text-slate-600">|</span>
          <span>ID</span>
          <span className="text-slate-600">|</span>
          <span className="text-amber-300 font-bold">⏱ {wibNow || '17:40 WIB'}</span>
        </div>
      </footer>
    </div>
  );
};
