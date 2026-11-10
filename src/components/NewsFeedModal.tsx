import React, { useEffect, useState } from 'react';
import {
  X,
  Newspaper,
  ExternalLink,
  Flame,
  Search,
  Filter,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { CryptoNewsItem, NewsSource } from '../types/news';
import { sound } from '../audio/soundEngine';

interface NewsFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectForInversion: (headline: string) => void;
}

const SOURCES: (NewsSource | 'ALL')[] = [
  'ALL',
  'Bloomberg Crypto',
  'CoinDesk',
  'The Block',
  'Cointelegraph',
  'Decrypt',
  'Reuters',
];

const CATEGORIES = ['ALL', 'MACRO', 'BITCOIN', 'ALTCOINS', 'REGULATORY', 'DEFI'];

export const NewsFeedModal: React.FC<NewsFeedModalProps> = ({
  isOpen,
  onClose,
  onSelectForInversion,
}) => {
  const [news, setNews] = useState<CryptoNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState<NewsSource | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNews = () => {
    setLoading(true);
    fetch('/api/crypto/news')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.items) {
          setNews(data.items);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      fetchNews();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredNews = news.filter((item) => {
    if (selectedSource !== 'ALL' && item.source !== selectedSource) return false;
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.crowdConsensus.toLowerCase().includes(q)
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
            <div className="p-1.5 rounded bg-blue-500/10 border border-blue-500/30">
              <Newspaper className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold tracking-wider text-slate-100">
                MULTI-SOURCE CRYPTO NEWS AGGREGATOR
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                Bloomberg • CoinDesk • The Block • Cointelegraph • Decrypt • Reuters
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                fetchNews();
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded border border-[#25324e] hover:bg-[#1a2336] cursor-pointer"
              title="Refresh News"
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
          {/* Search & Sources */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search headlines, keywords, Fed, ETFs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#080c14] border border-[#212d45] focus:border-blue-400 rounded pl-8 pr-3 py-1.5 text-xs font-mono text-slate-200 placeholder:text-slate-600 outline-none"
              />
            </div>

            {/* Source Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <span className="text-[10px] font-mono text-slate-500 uppercase shrink-0">
                SOURCE:
              </span>
              {SOURCES.map((src) => (
                <button
                  key={src}
                  onClick={() => {
                    sound.playClick();
                    setSelectedSource(src);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono shrink-0 transition-colors cursor-pointer border ${
                    selectedSource === src
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/60 font-semibold'
                      : 'bg-[#121929] text-slate-400 border-[#1f2b44] hover:text-slate-200'
                  }`}
                >
                  {src}
                </button>
              ))}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[10px] font-mono text-slate-500 uppercase shrink-0">
              CATEGORY:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  sound.playClick();
                  setSelectedCategory(cat);
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-black font-bold'
                    : 'bg-[#121929] text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* News List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
          {loading ? (
            <div className="py-16 text-center text-xs font-mono text-slate-400">
              FETCHING MULTI-SOURCE WIRE DATA...
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="py-16 text-center text-xs font-mono text-slate-500">
              No articles match your filter criteria.
            </div>
          ) : (
            filteredNews.map((item) => (
              <div
                key={item.id}
                className="bg-[#0e1422] border border-[#1e2a42] hover:border-[#2f4266] rounded-lg p-4 transition-all space-y-2.5"
              >
                {/* Meta row: Source, Category, Time, and Sentiment */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#182338] text-blue-300 border border-[#263758]">
                      {item.source}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#141b2b] text-slate-400 border border-[#202c44]">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{item.timestamp}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${
                        item.sentiment === 'CONTRARIAN ALERT'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                          : item.sentiment === 'BULLISH'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-700/30 text-slate-300 border-slate-600/40'
                      }`}
                    >
                      {item.sentiment}
                    </span>

                    <button
                      onClick={() => {
                        sound.playClick(1400);
                        onSelectForInversion(item.title);
                      }}
                      className="flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-colors"
                      title="Deconstruct headline herd sentiment with Gemini AI"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>INVERT STORY</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Title & Summary */}
                <h3 className="font-mono text-sm font-bold text-slate-100 hover:text-amber-300 transition-colors leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {item.summary}
                </p>

                {/* Consensus vs Contrarian Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-[#182338] text-[11px] font-mono">
                  <div className="bg-[#121622] p-2 rounded border border-[#1b253b]">
                    <span className="text-red-400 font-semibold block text-[10px] uppercase">
                      Crowd Consensus:
                    </span>
                    <span className="text-slate-400">{item.crowdConsensus}</span>
                  </div>
                  <div className="bg-[#101b24] p-2 rounded border border-cyan-900/40">
                    <span className="text-cyan-400 font-semibold block text-[10px] uppercase">
                      Contrarian Inversion:
                    </span>
                    <span className="text-slate-300">{item.contrarianAngle}</span>
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
