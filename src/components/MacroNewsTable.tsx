import React, { useState } from 'react';
import {
  Search,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Clock,
  Filter,
  Globe,
  Zap,
  BarChart2,
  TrendingUp,
  ShieldAlert,
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
  'GDELT',
  'NewsData.io',
  'GNews',
  'BBC World News',
  'Al Jazeera',
  'France 24',
  'DW Global News',
  'The Guardian',
  'Reuters',
  'Bloomberg',
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
  const [selectedImpact, setSelectedImpact] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNews = news.filter((item) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (selectedSource !== 'All Sources' && !item.source.toLowerCase().includes(selectedSource.toLowerCase())) return false;
    if (selectedImpact !== 'ALL' && item.impactLevel !== selectedImpact) return false;

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

  return (
    <div className="w-full h-full bg-[#06080d] text-slate-100 flex flex-col overflow-hidden font-sans select-none">
      {/* Top Header / Control Bar for Macro News Wire */}
      <div className="bg-[#0b101a] border-b border-[#1b273d] p-4 sm:px-6 flex flex-col gap-3 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h1 className="text-lg font-mono font-extrabold text-white tracking-wider">
                GLOBAL MACRO NEWS WIRE
              </h1>
            </div>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              Real-time fundamental intelligence for crypto and forex markets (WIB UTC+7)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-[#101726] px-3 py-1.5 rounded-lg border border-[#202e48] text-xs font-mono text-amber-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{wibNow || 'Live WIB'}</span>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onRefresh();
              }}
              disabled={loading}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shadow cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'SINKRONISASI...' : 'REFRESH FEED'}</span>
            </button>
          </div>
        </div>

        {/* Search & Filters Row */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-[#162136]">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berita, keyword, atau aset (mis: Fed, CPI, BTC, DXY)..."
              className="w-full bg-[#060911] border border-[#202f4a] rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Source Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#060911] border border-[#202f4a] rounded-lg px-3 py-1.5 text-xs font-mono">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <select
              value={selectedSource}
              onChange={(e) => {
                sound.playClick();
                setSelectedSource(e.target.value);
              }}
              className="bg-transparent text-slate-200 outline-none cursor-pointer"
            >
              {SOURCES_LIST.map((src) => (
                <option key={src} value={src} className="bg-[#0b101a] text-slate-200">
                  {src}
                </option>
              ))}
            </select>
          </div>

          {/* Impact Filter */}
          <div className="flex items-center gap-1.5 bg-[#060911] border border-[#202f4a] rounded-lg px-3 py-1.5 text-xs font-mono">
            <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={selectedImpact}
              onChange={(e) => {
                sound.playClick();
                setSelectedImpact(e.target.value);
              }}
              className="bg-transparent text-slate-200 outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#0b101a]">Semua Dampak</option>
              <option value="HIGH" className="bg-[#0b101a]">High Impact</option>
              <option value="MEDIUM" className="bg-[#0b101a]">Medium Impact</option>
              <option value="LOW" className="bg-[#0b101a]">Low Impact</option>
            </select>
          </div>
        </div>

        {/* Category Pills Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => {
              sound.playClick();
              setSelectedCategory('ALL');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-mono shrink-0 transition-all cursor-pointer font-bold border ${
              selectedCategory === 'ALL'
                ? 'bg-amber-500 text-black border-amber-400 shadow-md'
                : 'bg-[#060911] text-slate-300 border-[#1f2d47] hover:border-amber-500/50'
            }`}
          >
            All News ({news.length})
          </button>

          {MACRO_CATEGORIES.map((cat) => {
            const count = news.filter((n) => n.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedCategory(cat.id);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono shrink-0 transition-all cursor-pointer border ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-md'
                    : 'bg-[#060911] text-slate-300 border-[#1f2d47] hover:border-amber-500/50'
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main News Table / List Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#05070c]">
        {loading ? (
          <div className="py-28 flex flex-col items-center justify-center gap-3 text-slate-400 font-mono text-xs">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
            <span className="tracking-widest">MEMUAT BERITA REAL-TIME DARI API & RSS...</span>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="py-28 text-center text-xs font-mono text-slate-400 bg-[#080c14] border border-[#1b273d] rounded-xl">
            Tidak ada berita yang sesuai dengan filter atau pencarian saat ini.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#1b273d] bg-[#080c14] shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1b273d] bg-[#0c1322] text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 w-32">WAKTU (WIB)</th>
                  <th className="py-3 px-4 w-40">SUMBER & KATEGORI</th>
                  <th className="py-3 px-4">HEADLINE & RINGKASAN</th>
                  <th className="py-3 px-4 w-40">TARGET ASSETS</th>
                  <th className="py-3 px-4 w-36">DAMPAK PASAR</th>
                  <th className="py-3 px-4 w-32 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#131b2e] text-xs font-mono">
                {filteredNews.map((item, idx) => {
                  const isHighImpact = item.impactLevel === 'HIGH';

                  return (
                    <tr
                      key={item.id}
                      className={`transition-all duration-150 group ${
                        isHighImpact
                          ? 'bg-gradient-to-r from-red-500/5 via-[#0b101c] to-[#080c14] hover:bg-[#0e1626]'
                          : 'hover:bg-[#0b101c]'
                      }`}
                    >
                      {/* TIMESTAMP WIB */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{item.timestampWIB}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block pl-5 mt-0.5">{item.timeAgo}</span>
                      </td>

                      {/* SOURCE & CATEGORY */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#111928] text-amber-300 border border-[#21304d]">
                            {item.categoryLabel}
                          </span>
                          <div className="flex items-center gap-1 text-slate-300 text-[11px] font-bold">
                            <Globe className="w-3 h-3 text-blue-400 shrink-0" />
                            <span className="truncate max-w-[120px]">{item.source}</span>
                          </div>
                        </div>
                      </td>

                      {/* HEADLINE & SUMMARY */}
                      <td className="py-3.5 px-4 align-top">
                        <h3 className="font-bold text-slate-100 group-hover:text-amber-300 transition-colors leading-snug text-xs sm:text-sm">
                          <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {item.title}
                          </a>
                        </h3>
                        <p className="text-[11px] font-sans text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {item.summary}
                        </p>
                      </td>

                      {/* TARGET ASSETS */}
                      <td className="py-3.5 px-4 align-top">
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

                      {/* MARKET IMPACT */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <BarChart2
                              className={`w-3.5 h-3.5 ${
                                item.impactLevel === 'HIGH'
                                  ? 'text-red-400'
                                  : item.impactLevel === 'MEDIUM'
                                  ? 'text-amber-400'
                                  : 'text-slate-400'
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
                              {item.impactLevel}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 block">
                            Sentimen: <strong className="text-slate-300">{item.sentiment}</strong>
                          </span>
                        </div>
                      </td>

                      {/* ACTION BUTTONS */}
                      <td className="py-3.5 px-4 align-top text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col gap-1.5 items-center">
                          <a
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-[#101726] hover:bg-[#18243b] text-slate-200 border border-[#21304d] transition-all cursor-pointer w-full text-center"
                          >
                            <span>Source</span>
                            <ExternalLink className="w-3 h-3 text-blue-400" />
                          </a>

                          <button
                            onClick={() => {
                              sound.playClick(1400);
                              onSelectForAI(item);
                            }}
                            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all cursor-pointer w-full shadow"
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

      {/* Footer Status Bar */}
      <div className="h-8 bg-[#04060a] border-t border-[#1b273d] px-4 flex items-center justify-between text-[11px] font-mono text-slate-400 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-slate-300 font-bold">Live Data Wire Active</span>
          <span className="text-slate-600">|</span>
          <span>Last Synced: {wibNow || 'Live WIB'}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>GDELT + NewsData + GNews + RSS</span>
          <span className="text-slate-600">|</span>
          <span className="text-amber-300 font-bold">⏱ {wibNow || 'WIB UTC+7'}</span>
        </div>
      </div>
    </div>
  );
};
