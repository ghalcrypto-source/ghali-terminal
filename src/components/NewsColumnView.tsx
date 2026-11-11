import React, { useEffect, useState } from 'react';
import {
  Newspaper,
  ExternalLink,
  Search,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Globe,
  Radio,
  Clock,
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';
import { CryptoNewsItem } from '../types/news';
import { sound } from '../audio/soundEngine';

interface NewsColumnViewProps {
  onSelectForInversion: (headline: string) => void;
}

const SOURCES = [
  'ALL',
  'Bloomberg Crypto',
  'CoinDesk',
  'The Block',
  'Cointelegraph',
  'Decrypt',
  'Reuters',
];

const CATEGORIES = ['ALL', 'MACRO', 'BITCOIN', 'ALTCOINS', 'REGULATORY', 'DEFI'];

export const NewsColumnView: React.FC<NewsColumnViewProps> = ({ onSelectForInversion }) => {
  const [news, setNews] = useState<CryptoNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [selectedSource, setSelectedSource] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNews = () => {
    setLoading(true);
    fetch('/api/crypto/news')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.items) {
          setNews(data.items);
          setIsLive(Boolean(data.isLive));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const filteredNews = news.filter((item) => {
    if (selectedSource !== 'ALL' && !item.source.toLowerCase().includes(selectedSource.toLowerCase())) return false;
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q) ||
        item.crowdConsensus.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="w-full h-full bg-[#07090e] text-slate-100 flex flex-col overflow-hidden">
      {/* Top News Wire Bar */}
      <div className="bg-[#0b0f18] border-b border-[#1d293f] px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-mono font-bold tracking-wider text-white">
                LIVE CRYPTO NEWS WIRE
              </h1>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${
                isLive
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                  : 'bg-blue-500/15 text-blue-300 border-blue-500/40'
              }`}>
                {isLive ? '● LIVE API FEED' : 'CURATED INSTITUTIONAL WIRE'}
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400">
              Integrasi langsung API sumber berita crypto & makro terverifikasi (Tautan langsung sumber berita)
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              fetchNews();
            }}
            className="flex items-center gap-1.5 bg-[#121927] hover:bg-[#1a253a] text-slate-200 border border-[#233352] px-3 py-1.5 rounded text-xs font-mono font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
            <span>REFRESH FEED</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#0d121c] border-b border-[#1b253b] p-3 space-y-2.5 shrink-0">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search news headline, Fed, ETF, Solana..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#070a10] border border-[#232f48] focus:border-amber-400 rounded-md pl-9 pr-3 py-1.5 text-xs font-mono text-slate-200 placeholder:text-slate-600 outline-none"
            />
          </div>

          {/* Sources Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-thin">
            <span className="text-[10px] font-mono text-slate-500 uppercase shrink-0 font-semibold">
              SOURCES:
            </span>
            {SOURCES.map((src) => (
              <button
                key={src}
                onClick={() => {
                  sound.playClick();
                  setSelectedSource(src);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-mono shrink-0 transition-colors cursor-pointer border ${
                  selectedSource === src
                    ? 'bg-amber-500 text-black border-amber-400 font-bold shadow'
                    : 'bg-[#121929] text-slate-300 border-[#1f2b44] hover:border-amber-500/40 hover:text-white'
                }`}
              >
                {src}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[10px] font-mono text-slate-500 uppercase shrink-0 font-semibold">
            CATEGORY:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                sound.playClick();
                setSelectedCategory(cat);
              }}
              className={`px-2.5 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white border-blue-400 font-bold'
                  : 'bg-[#121929] text-slate-400 border-[#1c273e] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main News Columns Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#06080d]">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-400 font-mono text-xs">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
            <span>MENGHUBUNGKAN KE API SUMBER BERITA KRIPTO...</span>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-500 font-mono text-xs">
            Tidak ada berita yang cocok dengan filter pencarian Anda.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-w-[1780px] mx-auto">
            {filteredNews.map((item) => (
              <article
                key={item.id}
                className="bg-[#0e1422] border border-[#1e2a42] hover:border-amber-500/50 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between gap-3 shadow-lg hover:shadow-amber-500/5 group"
              >
                <div className="space-y-3">
                  {/* Article Metadata Row */}
                  <div className="flex items-center justify-between gap-2 border-b border-[#19243a] pb-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Direct External Link Badge for Source */}
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-[#172338] text-amber-300 hover:text-amber-200 border border-[#2b3e63] hover:border-amber-400/70 transition-colors shadow-sm"
                        title={`Buka sumber berita asli di ${item.source}`}
                      >
                        <Globe className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>{item.source}</span>
                        <ExternalLink className="w-3 h-3 text-amber-400 shrink-0 ml-0.5" />
                      </a>

                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#121929] text-blue-300 border border-[#1f2d47]">
                        {item.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono shrink-0">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{item.timestamp}</span>
                    </div>
                  </div>

                  {/* Headline Title with Clickable Link */}
                  <h2 className="font-mono text-sm sm:text-base font-bold text-slate-100 group-hover:text-amber-300 transition-colors leading-snug">
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-start gap-1"
                    >
                      <span>{item.title}</span>
                    </a>
                  </h2>

                  {/* Summary */}
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {item.summary}
                  </p>

                  {/* Sentiment & Inversion Section */}
                  <div className="space-y-2 pt-2 border-t border-[#182338]">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                          item.sentiment === 'CONTRARIAN ALERT'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                            : item.sentiment === 'BULLISH'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                            : 'bg-slate-700/30 text-slate-300 border-slate-600/50'
                        }`}
                      >
                        {item.sentiment}
                      </span>

                      <button
                        onClick={() => {
                          sound.playClick(1400);
                          onSelectForInversion(item.title);
                        }}
                        className="flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded text-[10px] font-mono cursor-pointer transition-colors"
                        title="Analisa sudut pandang contrarian AI terhadap headline ini"
                      >
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>AI INVERT STORY</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Crowd Consensus vs Contrarian Angle */}
                    <div className="grid grid-cols-1 gap-2 pt-1">
                      <div className="bg-[#090d16] p-2 rounded border border-[#182338] text-[11px] font-mono">
                        <span className="text-red-400 font-semibold block text-[10px] uppercase">
                          KONSENSUS PASAR:
                        </span>
                        <span className="text-slate-400">{item.crowdConsensus}</span>
                      </div>
                      <div className="bg-[#0a1520] p-2 rounded border border-cyan-900/40 text-[11px] font-mono">
                        <span className="text-cyan-400 font-semibold block text-[10px] uppercase">
                          SUDUT CONTRARIAN:
                        </span>
                        <span className="text-slate-300">{item.contrarianAngle}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct Source Link Button */}
                <div className="pt-2 border-t border-[#182338] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">
                    SUMBER RESMI LINK:
                  </span>
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-mono font-bold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <span>Buka Artikel Asli ({item.source})</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
