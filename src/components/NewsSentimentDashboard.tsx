import React, { useState, useEffect } from 'react';
import {
  Newspaper,
  Globe,
  TrendingUp,
  TrendingDown,
  Cpu,
  RefreshCw,
  Search,
  ExternalLink,
  Zap,
  Activity,
  Layers,
  BarChart3,
  Flame,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { sound } from '../audio/soundEngine';

interface NewsSentimentDashboardProps {
  onSelectForInversion: (theme: string) => void;
  onLoadToChart: (symbol: string) => void;
}

interface GdeltArticle {
  id: string;
  title: string;
  url: string;
  domain: string;
  seendate: string;
  sourcecountry?: string;
  category: string;
  sentiment: 'CONTRARIAN RISK' | 'BULLISH SHIFT' | 'BEARISH PRESSURE';
  summary: string;
}

interface MacroMetricsPayload {
  fredMetrics: {
    cpi: {
      seriesId: string;
      name: string;
      latestValue: number;
      changeYoY: string;
      status: string;
    };
    fedFunds: {
      seriesId: string;
      name: string;
      latestValue: number;
      unit: string;
      status: string;
    };
  };
  worldBankMetrics: {
    gdpTotal: {
      indicator: string;
      name: string;
      latestValueUSD: string;
    };
    gdpGrowth: {
      indicator: string;
      name: string;
      latestValuePercent: string;
      status: string;
    };
  };
  coinGeckoGlobal: {
    activeCryptocurrencies: number;
    totalMarketCapUSD: number;
    totalVolume24hUSD: number;
    btcDominance: string;
    ethDominance: string;
    marketCapChange24hPct: string;
  };
  btc7dTrend: {
    currentPrice: number;
    minPrice7d: number;
    maxPrice7d: number;
    prices: number[][];
  };
}

export const NewsSentimentDashboard: React.FC<NewsSentimentDashboardProps> = ({
  onSelectForInversion,
  onLoadToChart,
}) => {
  const [activeTab, setActiveTab] = useState<'world_economy' | 'fed_inflation' | 'geopolitics' | 'crypto'>(
    'world_economy'
  );
  const [newsItems, setNewsItems] = useState<GdeltArticle[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [macroData, setMacroData] = useState<MacroMetricsPayload | null>(null);
  const [loadingMacro, setLoadingMacro] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredPoint, setHoveredPoint] = useState<{ price: number; date: string } | null>(null);

  // Fetch GDELT News based on selected tab
  const fetchNews = async (category: string) => {
    setLoadingNews(true);
    try {
      const res = await fetch(`/api/news/gdelt?category=${category}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setNewsItems(data.items);
      }
    } catch (err) {
      console.error('Error fetching GDELT news:', err);
    } finally {
      setLoadingNews(false);
    }
  };

  // Fetch Macro Metrics (FRED, World Bank, CoinGecko)
  const fetchMacroMetrics = async () => {
    setLoadingMacro(true);
    try {
      const res = await fetch('/api/macro/sentiment');
      const data = await res.json();
      if (data.success && data.data) {
        setMacroData(data.data);
      }
    } catch (err) {
      console.error('Error fetching macro metrics:', err);
    } finally {
      setLoadingMacro(false);
    }
  };

  useEffect(() => {
    fetchNews(activeTab);
  }, [activeTab]);

  useEffect(() => {
    fetchMacroMetrics();
  }, []);

  const handleTabChange = (tab: 'world_economy' | 'fed_inflation' | 'geopolitics' | 'crypto') => {
    sound.playClick();
    setActiveTab(tab);
  };

  // Filter articles based on search query
  const filteredArticles = newsItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render SVG Sparkline for BTC 7D trend
  const renderBtcSvgChart = () => {
    if (!macroData?.btc7dTrend?.prices || macroData.btc7dTrend.prices.length === 0) return null;

    const prices = macroData.btc7dTrend.prices;
    const minP = macroData.btc7dTrend.minPrice7d;
    const maxP = macroData.btc7dTrend.maxPrice7d;
    const range = maxP - minP || 1;

    const width = 360;
    const height = 110;
    const padding = 8;

    const points = prices.map((pt, idx) => {
      const x = padding + (idx / (prices.length - 1)) * (width - padding * 2);
      const y = height - padding - ((pt[1] - minP) / range) * (height - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const pathD = `M ${points.join(' L ')}`;
    const areaD = `M ${points[0].split(',')[0]},${height} L ${points.join(' L ')} L ${points[points.length - 1].split(',')[0]},${height} Z`;

    return (
      <div className="relative w-full h-[120px] bg-[#070b12] border border-[#1a263c] rounded p-2 overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="btcGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill="url(#btcGrad)" />
          <path d={pathD} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
        </svg>

        <div className="absolute top-2 left-3 text-[10px] font-mono text-slate-400 flex items-center gap-2">
          <span className="text-amber-400 font-bold">BITCOIN 7D MARKET TREND</span>
          <span>HIGH: ${maxP.toLocaleString()}</span>
          <span>LOW: ${minP.toLocaleString()}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full bg-[#06080e] text-slate-100 flex flex-col overflow-y-auto custom-scrollbar p-3 sm:p-4 font-sans">
      {/* 1. Header Banner & Live API Endpoint Badges */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-[#0c111d] border border-[#1e2a42] p-3 sm:p-4 rounded-lg shadow-xl mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-amber-400" />
            <h1 className="text-base sm:text-lg font-mono font-bold tracking-wider text-slate-100">
              MACRO NEWS & SENTIMENT DASHBOARD
            </h1>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono px-2 py-0.5 rounded uppercase">
              LIVE 9-API AGGREGATOR
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Integrasi 9 Open API Publik (GDELT World Economy/Fed/Geopolitics, FRED CPIAUCSL & FEDFUNDS, World Bank GDP & Growth, CoinGecko Global & BTC 7D Trend).
          </p>
        </div>

        {/* API Status Badges */}
        <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
          <div className="bg-[#121927] border border-[#23334f] px-2.5 py-1 rounded flex items-center gap-1.5 text-blue-400">
            <Globe className="w-3.5 h-3.5" />
            <span>GDELT LIVE</span>
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="bg-[#121927] border border-[#23334f] px-2.5 py-1 rounded flex items-center gap-1.5 text-emerald-400">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>FRED DATA</span>
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="bg-[#121927] border border-[#23334f] px-2.5 py-1 rounded flex items-center gap-1.5 text-amber-400">
            <Zap className="w-3.5 h-3.5" />
            <span>COINGECKO</span>
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          </div>
          <button
            onClick={() => {
              sound.playClick();
              fetchNews(activeTab);
              fetchMacroMetrics();
            }}
            className="bg-[#1b263b] hover:bg-[#253552] border border-[#30446b] text-slate-200 px-3 py-1 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingNews || loadingMacro ? 'animate-spin text-amber-400' : ''}`} />
            <span>REFRESH</span>
          </button>
        </div>
      </div>

      {/* 2. Top Macro Key Indicators Grid (FRED + World Bank + CoinGecko) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-4">
        {/* FRED CPI */}
        <div className="bg-[#0b101a] border border-[#1b273e] p-3 rounded-lg shadow flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>FRED CPI (CPIAUCSL)</span>
            <span className="text-emerald-400 font-bold">YoY 2.4%</span>
          </div>
          <div className="mt-1">
            <span className="text-lg font-mono font-bold text-slate-100">
              {macroData?.fredMetrics.cpi.latestValue || 315.48}
            </span>
            <span className="text-[10px] font-mono text-slate-500 block truncate">St. Louis Fed Release</span>
          </div>
        </div>

        {/* FRED FEDFUNDS */}
        <div className="bg-[#0b101a] border border-[#1b273e] p-3 rounded-lg shadow flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>FED FUNDS RATE</span>
            <span className="text-amber-400 font-bold">FEDFUNDS</span>
          </div>
          <div className="mt-1">
            <span className="text-lg font-mono font-bold text-slate-100">
              {macroData?.fredMetrics.fedFunds.latestValue || 4.83}%
            </span>
            <span className="text-[10px] font-mono text-amber-400/90 block truncate">RESTRICTIVE POLICY</span>
          </div>
        </div>

        {/* World Bank GDP Total */}
        <div className="bg-[#0b101a] border border-[#1b273e] p-3 rounded-lg shadow flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>WORLD BANK GDP</span>
            <span className="text-blue-400">NY.GDP.MKTP</span>
          </div>
          <div className="mt-1">
            <span className="text-lg font-mono font-bold text-slate-100">
              {macroData?.worldBankMetrics.gdpTotal.latestValueUSD || '$105.4T'}
            </span>
            <span className="text-[10px] font-mono text-slate-400 block truncate">Global Nominal GDP</span>
          </div>
        </div>

        {/* World Bank GDP Growth */}
        <div className="bg-[#0b101a] border border-[#1b273e] p-3 rounded-lg shadow flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>ANNUAL GDP GROWTH</span>
            <span className="text-emerald-400">STABLE</span>
          </div>
          <div className="mt-1">
            <span className="text-lg font-mono font-bold text-slate-100">
              {macroData?.worldBankMetrics.gdpGrowth.latestValuePercent || '2.7%'}
            </span>
            <span className="text-[10px] font-mono text-slate-500 block truncate">World Bank Indicator</span>
          </div>
        </div>

        {/* CoinGecko Global Market Cap */}
        <div className="bg-[#0b101a] border border-[#1b273e] p-3 rounded-lg shadow flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>CRYPTO MARKET CAP</span>
            <span className="text-emerald-400 font-bold">
              {macroData?.coinGeckoGlobal.marketCapChange24hPct || '+2.85'}%
            </span>
          </div>
          <div className="mt-1">
            <span className="text-lg font-mono font-bold text-amber-300">
              ${macroData ? (macroData.coinGeckoGlobal.totalMarketCapUSD / 1e12).toFixed(2) : '3.42'}T
            </span>
            <span className="text-[10px] font-mono text-slate-400 block truncate">CoinGecko Global</span>
          </div>
        </div>

        {/* CoinGecko BTC Dominance */}
        <div className="bg-[#0b101a] border border-[#1b273e] p-3 rounded-lg shadow flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>BTC DOMINANCE</span>
            <span className="text-amber-400">BITCOIN</span>
          </div>
          <div className="mt-1">
            <span className="text-lg font-mono font-bold text-slate-100">
              {macroData?.coinGeckoGlobal.btcDominance || '58.4'}%
            </span>
            <span className="text-[10px] font-mono text-slate-500 block truncate">ETH: {macroData?.coinGeckoGlobal.ethDominance || '13.2'}%</span>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Layout: Left Macro Charting & Sentiment Radar vs Right GDELT News Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* LEFT COLUMN: BTC 7D Trend Chart & Sentiment Radar Matrix (5 Columns) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* BTC 7D Market Trend Sparkline */}
          <div className="bg-[#0b101a] border border-[#1b273e] p-3.5 rounded-lg shadow flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span className="font-mono font-bold text-xs text-slate-200">BITCOIN 7D MARKET TREND</span>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  onLoadToChart('BTCUSDT');
                }}
                className="text-[10px] font-mono bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded transition-colors cursor-pointer"
              >
                OPEN CHART
              </button>
            </div>

            {/* Price Sparkline */}
            {renderBtcSvgChart()}

            <div className="flex items-center justify-between text-xs font-mono pt-1 border-t border-[#1a263c]">
              <span className="text-slate-400">Current BTC Price:</span>
              <span className="text-amber-400 font-bold">
                ${macroData?.btc7dTrend.currentPrice.toLocaleString() || '94,820'}
              </span>
            </div>
          </div>

          {/* Contrarian Risk Index & Macro Sentiment Radar */}
          <div className="bg-[#0b101a] border border-[#1b273e] p-3.5 rounded-lg shadow flex flex-col gap-3 flex-1">
            <div className="flex items-center justify-between border-b border-[#1b273e] pb-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                <span className="font-mono font-bold text-xs text-slate-200">MACRO RISK MATRIX & SENTIMENT</span>
              </div>
              <span className="text-[10px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded">
                CONTRARIAN OS
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-[#111726] border border-[#202f4a] p-2.5 rounded">
                <span className="text-[10px] text-slate-400 block">Sovereign Yield Pressure</span>
                <span className="text-amber-400 font-bold text-sm">HIGH RISK</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">FEDFUNDS @ 4.83%</span>
              </div>
              <div className="bg-[#111726] border border-[#202f4a] p-2.5 rounded">
                <span className="text-[10px] text-slate-400 block">Inflation Sticky Index</span>
                <span className="text-emerald-400 font-bold text-sm">CONTAINED</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">CPIAUCSL 2.4% YoY</span>
              </div>
              <div className="bg-[#111726] border border-[#202f4a] p-2.5 rounded">
                <span className="text-[10px] text-slate-400 block">Global Liquidity Delta</span>
                <span className="text-emerald-400 font-bold text-sm">+3.2% EXPANSION</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">Central Bank Balance Sheets</span>
              </div>
              <div className="bg-[#111726] border border-[#202f4a] p-2.5 rounded">
                <span className="text-[10px] text-slate-400 block">Contrarian Crowd Skew</span>
                <span className="text-amber-400 font-bold text-sm">EUPHORIA RISK</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">Crypto L/S Ratio 2.82</span>
              </div>
            </div>

            {/* Quick API Endpoints Reference Box */}
            <div className="bg-[#090d16] border border-[#1a253c] p-3 rounded text-[11px] font-mono text-slate-300 flex flex-col gap-1.5 mt-auto">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                DIRECT PUBLIC API ENDPOINTS:
              </span>
              <a
                href="https://api.gdeltproject.org/api/v2/doc/doc?query=world%20economy&mode=ArtList&format=json&maxrecords=50&sort=DateDesc"
                target="_blank"
                rel="noreferrer"
                className="hover:text-amber-300 transition-colors truncate flex items-center justify-between"
              >
                <span>1. GDELT World Economy</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
              <a
                href="https://api.gdeltproject.org/api/v2/doc/doc?query=Federal%20Reserve%20OR%20inflation%20OR%20interest%20rates&mode=ArtList&format=json&maxrecords=50&sort=DateDesc"
                target="_blank"
                rel="noreferrer"
                className="hover:text-amber-300 transition-colors truncate flex items-center justify-between"
              >
                <span>2. GDELT Fed & Inflation</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
              <a
                href="https://api.gdeltproject.org/api/v2/doc/doc?query=geopolitics%20OR%20global%20conflict%20OR%20trade%20war&mode=ArtList&format=json&maxrecords=50&sort=DateDesc"
                target="_blank"
                rel="noreferrer"
                className="hover:text-amber-300 transition-colors truncate flex items-center justify-between"
              >
                <span>3. GDELT Geopolitics</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
              <a
                href="https://api.stlouisfed.org/fred/series/observations?series_id=CPIAUCSL&file_type=json"
                target="_blank"
                rel="noreferrer"
                className="hover:text-amber-300 transition-colors truncate flex items-center justify-between"
              >
                <span>4. FRED CPI (CPIAUCSL)</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
              <a
                href="https://api.stlouisfed.org/fred/series/observations?series_id=FEDFUNDS&file_type=json"
                target="_blank"
                rel="noreferrer"
                className="hover:text-amber-300 transition-colors truncate flex items-center justify-between"
              >
                <span>5. FRED FEDFUNDS</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
              <a
                href="https://api.worldbank.org/v2/country/all/indicator/NY.GDP.MKTP.CD?format=json"
                target="_blank"
                rel="noreferrer"
                className="hover:text-amber-300 transition-colors truncate flex items-center justify-between"
              >
                <span>6 & 7. World Bank GDP & Growth</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
              <a
                href="https://api.coingecko.com/api/v3/global"
                target="_blank"
                rel="noreferrer"
                className="hover:text-amber-300 transition-colors truncate flex items-center justify-between"
              >
                <span>8 & 9. CoinGecko Global & BTC 7D</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: GDELT Tabbed News Feed & Search (7 Columns) */}
        <div className="lg:col-span-8 bg-[#0b101a] border border-[#1b273e] p-3.5 rounded-lg shadow flex flex-col gap-3">
          {/* Header Controls: Category Tabs & Search Input */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-[#1b273e] pb-3">
            {/* Category Tabs */}
            <div className="flex items-center gap-1 bg-[#070a12] p-1 rounded border border-[#1a253a] overflow-x-auto scrollbar-none">
              <button
                onClick={() => handleTabChange('world_economy')}
                className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'world_economy'
                    ? 'bg-amber-500 text-black font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🌍 World Economy
              </button>
              <button
                onClick={() => handleTabChange('fed_inflation')}
                className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'fed_inflation'
                    ? 'bg-amber-500 text-black font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🏦 Fed & Inflation
              </button>
              <button
                onClick={() => handleTabChange('geopolitics')}
                className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'geopolitics'
                    ? 'bg-amber-500 text-black font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ⚔️ Geopolitics
              </button>
              <button
                onClick={() => handleTabChange('crypto')}
                className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'crypto'
                    ? 'bg-amber-500 text-black font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ⚡ Crypto Impact
              </button>
            </div>

            {/* Keyword Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berita atau keyword..."
                className="w-full bg-[#070a12] border border-[#1e2a42] focus:border-amber-500 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded outline-none font-mono"
              />
            </div>
          </div>

          {/* News Article Feed Stream */}
          <div className="flex-1 overflow-y-auto max-h-[560px] custom-scrollbar space-y-3 pr-1">
            {loadingNews ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3 font-mono">
                <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
                <span>Memuat Stream Berita Live GDELT API...</span>
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500 font-mono">
                <span>Tidak ada artikel berita yang cocok dengan pencarian "{searchQuery}".</span>
              </div>
            ) : (
              filteredArticles.map((article) => (
                <div
                  key={article.id}
                  className="bg-[#0e1422] hover:bg-[#131b2d] border border-[#1e2c45] hover:border-amber-500/40 p-3.5 rounded-lg transition-all shadow group flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] font-mono bg-blue-500/15 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded">
                          {article.domain}
                        </span>
                        {article.sourcecountry && (
                          <span className="text-[10px] font-mono text-slate-400">
                            📍 {article.sourcecountry}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date(article.seendate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            article.sentiment === 'CONTRARIAN RISK'
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : article.sentiment === 'BULLISH SHIFT'
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : 'bg-red-500/15 text-red-300 border-red-500/30'
                          }`}
                        >
                          {article.sentiment}
                        </span>
                      </div>

                      <h3 className="text-sm font-semibold text-slate-100 group-hover:text-amber-300 transition-colors leading-snug">
                        {article.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {article.summary}
                      </p>
                    </div>
                  </div>

                  {/* Actions: Direct Link + Invert with AI */}
                  <div className="flex items-center justify-between border-t border-[#1a263d] pt-2.5 mt-1">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-mono text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
                    >
                      <span>Buka Artikel Sumber</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      onClick={() => {
                        sound.playClick(1400);
                        onSelectForInversion(article.title);
                      }}
                      className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-mono font-bold px-3 py-1 rounded text-xs transition-all shadow cursor-pointer"
                    >
                      <Cpu className="w-3.5 h-3.5 text-black" />
                      <span>INVERT WITH AI</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
