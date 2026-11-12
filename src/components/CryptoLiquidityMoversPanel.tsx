import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Flame,
  Zap,
  ArrowRight,
  RefreshCw,
  BarChart2,
  Bell,
  Activity,
  Layers,
  ShieldAlert,
  PieChart,
  Compass,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  DollarSign,
  Scale,
  Users,
} from 'lucide-react';
import { sound } from '../audio/soundEngine';

interface TopAltcoinLS {
  symbol: string;
  pair: string;
  name: string;
  color: string;
  markPrice: number;
  longPercentage: number;
  shortPercentage: number;
  longShortRatio: number;
  openInterestUSD: string;
  fundingRate: number;
  contrarianSignal: string;
}

interface MarketMoverItem {
  symbol: string;
  pair: string;
  price: string;
  rawPrice: number;
  change24h: number;
  volumeUSD: string;
  type: 'gainer' | 'loser' | 'runner';
  tag: string;
}

interface LiquidityFlowData {
  macroDiagnosis: string;
  btcDominance: number;
  ethDominance: number;
  altcoinsDominance: number;
  stablecoins: {
    totalCirculatingUSD: string;
    net7dMintedUSD: string;
    usdtMarketCap: string;
    usdcMarketCap: string;
    liquidityStatus: string;
  };
  currentFlowStage: {
    title: string;
    description: string;
    riskLevel: string;
    altseasonIndex: number;
  };
  sectors: {
    name: string;
    tickers: string[];
    flowDirection: string;
    net24hUSD: string;
    velocityScore: number;
    color: string;
    status: string;
  }[];
  flowRoute: {
    step: number;
    from: string;
    to: string;
    percentage: string;
    note: string;
  }[];
}

interface CryptoLiquidityMoversPanelProps {
  onLoadToChart?: (symbol: string) => void;
  onOpenAlerts?: (symbol?: string) => void;
}

export const CryptoLiquidityMoversPanel: React.FC<CryptoLiquidityMoversPanelProps> = ({
  onLoadToChart,
  onOpenAlerts,
}) => {
  const [altcoins, setAltcoins] = useState<TopAltcoinLS[]>([]);
  const [gainers, setGainers] = useState<MarketMoverItem[]>([]);
  const [losers, setLosers] = useState<MarketMoverItem[]>([]);
  const [runners, setRunners] = useState<MarketMoverItem[]>([]);
  const [liquidity, setLiquidity] = useState<LiquidityFlowData | null>(null);

  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'gainers' | 'losers' | 'runners'>('all');

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [altRes, moversRes, flowRes] = await Promise.allSettled([
        fetch('/api/crypto/top5-altcoins-longshort').then((r) => r.json()),
        fetch('/api/crypto/movers-runners').then((r) => r.json()),
        fetch('/api/crypto/liquidity-flow').then((r) => r.json()),
      ]);

      if (altRes.status === 'fulfilled' && altRes.value?.success) {
        setAltcoins(altRes.value.altcoins || []);
      }
      if (moversRes.status === 'fulfilled' && moversRes.value?.success) {
        setGainers(moversRes.value.gainers || []);
        setLosers(moversRes.value.losers || []);
        setRunners(moversRes.value.runners || []);
      }
      if (flowRes.status === 'fulfilled' && flowRes.value?.success) {
        setLiquidity(flowRes.value);
      }
      setLastSync(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 12000); // 12s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const handleChartClick = (sym: string) => {
    sound.playClick();
    if (onLoadToChart) {
      onLoadToChart(sym.endsWith('USDT') ? sym : `${sym}USDT`);
    }
  };

  const handleAlertClick = (sym: string) => {
    sound.playCekring();
    if (onOpenAlerts) {
      onOpenAlerts(sym.endsWith('USDT') ? sym : `${sym}USDT`);
    }
  };

  return (
    <div id="crypto-liquidity-movers" className="w-full space-y-6 pt-4 text-slate-100 font-sans">
      {/* Panel Header */}
      <div className="bg-[#0b0f19] border border-[#1e2a44] rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-cyan-500/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Compass className="w-5 h-5 animate-pulse" />
              </span>
              <h2 className="text-base sm:text-lg font-mono font-black tracking-wider text-white">
                RADAR ARUS LIKUIDITAS, MOVERS & REAL-TIME TOP 5 ALTCOIN LONG/SHORT
              </h2>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE 5M FUTURES FEED
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400">
              Analisis rotasi modal uang kripto, pergerakan Top Gainers/Losers/Runners, dan rasio posisi Long vs Short akun bursa secara real-time.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto font-mono text-xs">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] text-slate-500">Auto-Sync (12 Detik)</div>
              <div className="text-[11px] text-cyan-300 font-bold">{lastSync || 'Updating...'} WIB</div>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                fetchAllData();
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-black font-bold rounded-lg transition-all shadow cursor-pointer text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>SYNC REAL-TIME</span>
            </button>
          </div>
        </div>

        {/* Global Liquidity Gauge Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-[#182338] font-mono">
          <div className="p-3 bg-[#070b13] border border-[#1a253c] rounded-xl space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Dominansi Bitcoin (BTC.D)</span>
            <div className="text-base sm:text-lg font-black text-amber-300">
              {liquidity?.btcDominance || 58.4}%
            </div>
            <span className="text-[10px] text-slate-400">Jangkar Modal Pasar</span>
          </div>

          <div className="p-3 bg-[#070b13] border border-[#1a253c] rounded-xl space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Total Pasokan Stablecoin</span>
            <div className="text-base sm:text-lg font-black text-emerald-400">
              {liquidity?.stablecoins?.totalCirculatingUSD || '$218.4B'}
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">
              {liquidity?.stablecoins?.net7dMintedUSD || '+$2.15B'} (7D Net Mint)
            </span>
          </div>

          <div className="p-3 bg-[#070b13] border border-[#1a253c] rounded-xl space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Altseason Index</span>
            <div className="text-base sm:text-lg font-black text-cyan-300">
              {liquidity?.currentFlowStage?.altseasonIndex || 38} <span className="text-xs text-slate-500">/ 100</span>
            </div>
            <span className="text-[10px] text-amber-300 font-bold">Bitcoin Dominance Phase</span>
          </div>

          <div className="p-3 bg-[#070b13] border border-[#1a253c] rounded-xl space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Status Dry Powder</span>
            <div className="text-base sm:text-lg font-black text-purple-300">
              USDT: {liquidity?.stablecoins?.usdtMarketCap || '$175.6B'}
            </div>
            <span className="text-[10px] text-purple-400">Likuiditas Siap Serap Dip</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BAGIAN 1: LARI LIQUIDITY UANG CRYPTO KEMANA? (CAPITAL ROTATION MAP)       */}
      {/* ========================================================================= */}
      <div className="bg-[#0b0f19] border border-[#1e2a44] rounded-2xl p-4 sm:p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#182338] gap-2">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
              1. LARI LIKUIDITAS UANG KRIPTO KEMANA? (ANALISIS ROTASI SEKTORAL)
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
            Fase Rotasi: Selektif Layer 1 & AI Agents
          </span>
        </div>

        {/* Directional Flow Vector Map */}
        <div className="bg-[#070b14] border border-[#1a253e] rounded-xl p-4 space-y-3 font-mono">
          <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">
            Jalur Perjalanan Likuiditas (Flow Route Map):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {liquidity?.flowRoute?.map((route) => (
              <div
                key={route.step}
                className="p-3 rounded-lg bg-[#0e1626] border border-[#1f2f4c] relative flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-800">
                    STEP {route.step}
                  </span>
                  <span className="text-xs font-bold text-amber-300">{route.percentage}</span>
                </div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{route.from}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="text-cyan-300">{route.to}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-2">{route.note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sector Inflow / Outflow Breakdown Grid */}
        <div className="space-y-3">
          <span className="text-[11px] font-mono text-slate-400 uppercase font-bold tracking-wider block">
            Distribusi Inflow & Outflow Modal Antar-Sektor (24 Jam Terakhir):
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {liquidity?.sectors?.map((sec, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border font-mono space-y-2 transition-all ${
                  sec.flowDirection === 'INFLOW'
                    ? 'bg-emerald-950/10 border-emerald-800/40 hover:border-emerald-600'
                    : sec.flowDirection === 'OUTFLOW'
                    ? 'bg-red-950/10 border-red-800/40 hover:border-red-600'
                    : 'bg-amber-950/10 border-amber-800/40 hover:border-amber-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{sec.name}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      sec.flowDirection === 'INFLOW'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : sec.flowDirection === 'OUTFLOW'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {sec.flowDirection} ({sec.net24hUSD})
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {sec.tickers.map((t) => (
                    <button
                      key={t}
                      onClick={() => handleChartClick(t)}
                      className="text-[10px] font-bold bg-[#131d2f] hover:bg-[#1a2942] text-slate-200 px-2 py-0.5 rounded border border-[#233452] transition-colors cursor-pointer"
                      title={`Klik untuk buka chart ${t}`}
                    >
                      ${t}
                    </button>
                  ))}
                </div>

                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Kecepatan Modal (Velocity):</span>
                    <span className="text-cyan-300 font-bold">{sec.velocityScore}/100</span>
                  </div>
                  <div className="w-full bg-[#080d16] h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        sec.flowDirection === 'INFLOW' ? 'bg-emerald-400' : sec.flowDirection === 'OUTFLOW' ? 'bg-red-400' : 'bg-amber-400'
                      }`}
                      style={{ width: `${sec.velocityScore}%` }}
                    />
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 italic pt-0.5">{sec.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BAGIAN 2: TOP GAINERS, TOP LOSERS, DAN TOP RUNNERS                        */}
      {/* ========================================================================= */}
      <div className="bg-[#0b0f19] border border-[#1e2a44] rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#182338] gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
              2. TOP GAINERS, TOP LOSERS (TOP LOSSET) & TOP RUNNERS
            </h3>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-[#070b14] p-1 rounded-xl border border-[#1c2840] font-mono text-xs">
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('all');
              }}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'all' ? 'bg-cyan-500 text-black shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua (3 Kolom)
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('gainers');
              }}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'gainers' ? 'bg-emerald-500 text-black shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              🔥 Top Gainers
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('losers');
              }}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'losers' ? 'bg-red-500 text-black shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              🔻 Top Losers
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('runners');
              }}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'runners' ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              ⚡ Top Runners
            </button>
          </div>
        </div>

        {/* 3-Column Movers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
          {/* Column A: Top Gainers */}
          {(activeTab === 'all' || activeTab === 'gainers') && (
            <div className="bg-[#070b14] border border-emerald-900/40 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#18253b]">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
                  <Flame className="w-3.5 h-3.5 text-emerald-400" />
                  TOP GAINERS (24H NAIK TERTINGGI)
                </span>
                <span className="text-[10px] bg-emerald-950/60 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-800">
                  {gainers.length} Koin
                </span>
              </div>

              <div className="space-y-2">
                {gainers.map((item) => (
                  <div
                    key={item.pair}
                    className="p-2.5 rounded-lg bg-[#0c1322] border border-[#1b2844] hover:border-emerald-500/50 transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-xs">{item.symbol}</span>
                        <span className="text-[9px] bg-emerald-950/80 text-emerald-300 px-1.5 rounded border border-emerald-800">
                          {item.tag}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Vol: {item.volumeUSD} • ${item.price}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-xs font-black text-emerald-400 flex items-center justify-end gap-0.5">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          +{item.change24h}%
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleChartClick(item.symbol)}
                          className="px-1.5 py-1 text-[9px] rounded bg-[#152035] hover:bg-cyan-600 hover:text-black text-slate-300 transition-colors cursor-pointer"
                          title="Buka Chart"
                        >
                          CHART
                        </button>
                        <button
                          onClick={() => handleAlertClick(item.symbol)}
                          className="p-1 text-[9px] rounded bg-[#152035] hover:bg-amber-500 hover:text-black text-amber-300 transition-colors cursor-pointer"
                          title="Pasang Alert Cekring 🔔"
                        >
                          <Bell className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Column B: Top Losers (Top Losset) */}
          {(activeTab === 'all' || activeTab === 'losers') && (
            <div className="bg-[#070b14] border border-red-900/40 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#18253b]">
                <span className="text-xs font-bold text-red-400 flex items-center gap-1.5 uppercase">
                  <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                  TOP LOSERS / TOP LOSSET (KOREKSI)
                </span>
                <span className="text-[10px] bg-red-950/60 text-red-300 px-1.5 py-0.2 rounded border border-red-800">
                  {losers.length} Koin
                </span>
              </div>

              <div className="space-y-2">
                {losers.map((item) => (
                  <div
                    key={item.pair}
                    className="p-2.5 rounded-lg bg-[#0c1322] border border-[#1b2844] hover:border-red-500/50 transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-xs">{item.symbol}</span>
                        <span className="text-[9px] bg-red-950/80 text-red-300 px-1.5 rounded border border-red-800">
                          {item.tag}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Vol: {item.volumeUSD} • ${item.price}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-xs font-black text-red-400 flex items-center justify-end gap-0.5">
                          <ArrowDownRight className="w-3.5 h-3.5" />
                          {item.change24h}%
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleChartClick(item.symbol)}
                          className="px-1.5 py-1 text-[9px] rounded bg-[#152035] hover:bg-cyan-600 hover:text-black text-slate-300 transition-colors cursor-pointer"
                          title="Buka Chart"
                        >
                          CHART
                        </button>
                        <button
                          onClick={() => handleAlertClick(item.symbol)}
                          className="p-1 text-[9px] rounded bg-[#152035] hover:bg-amber-500 hover:text-black text-amber-300 transition-colors cursor-pointer"
                          title="Pasang Alert Cekring 🔔"
                        >
                          <Bell className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Column C: Top Runners (High Velocity Momentum) */}
          {(activeTab === 'all' || activeTab === 'runners') && (
            <div className="bg-[#070b14] border border-amber-900/40 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#18253b]">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  TOP RUNNERS (VOLUME TERTINGGI & BREAKOUT)
                </span>
                <span className="text-[10px] bg-amber-950/60 text-amber-300 px-1.5 py-0.2 rounded border border-amber-800">
                  {runners.length} Koin
                </span>
              </div>

              <div className="space-y-2">
                {runners.map((item) => (
                  <div
                    key={item.pair}
                    className="p-2.5 rounded-lg bg-[#0c1322] border border-[#1b2844] hover:border-amber-500/50 transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-xs">{item.symbol}</span>
                        <span className="text-[9px] bg-amber-950/80 text-amber-300 px-1.5 rounded border border-amber-800">
                          {item.tag}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Vol: {item.volumeUSD} • ${item.price}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-xs font-black text-amber-300 flex items-center justify-end gap-0.5">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          +{item.change24h}%
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleChartClick(item.symbol)}
                          className="px-1.5 py-1 text-[9px] rounded bg-[#152035] hover:bg-cyan-600 hover:text-black text-slate-300 transition-colors cursor-pointer"
                          title="Buka Chart"
                        >
                          CHART
                        </button>
                        <button
                          onClick={() => handleAlertClick(item.symbol)}
                          className="p-1 text-[9px] rounded bg-[#152035] hover:bg-amber-500 hover:text-black text-amber-300 transition-colors cursor-pointer"
                          title="Pasang Alert Cekring 🔔"
                        >
                          <Bell className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BAGIAN 3: LONG / SHORT SEMUA ALTCOIN TOP 5 SAJA (REAL-TIME FUTURES)       */}
      {/* ========================================================================= */}
      <div className="bg-[#0b0f19] border border-[#1e2a44] rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#182338] gap-2">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
              3. RASIO POSISI LONG / SHORT SEMUA ALTCOIN TOP 5 SAJA (REAL-TIME)
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
            Eksklusif 5 Altcoin Teratas: ETH • SOL • BNB • XRP • DOGE
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3.5 font-mono">
          {altcoins.map((coin) => {
            const isLongCrowded = coin.longShortRatio >= 2.5;
            const isShortCrowded = coin.longShortRatio <= 0.85;

            return (
              <div
                key={coin.symbol}
                className="bg-[#070b14] border border-[#1b273e] hover:border-cyan-500/40 rounded-xl p-3.5 space-y-3 transition-all relative flex flex-col justify-between"
              >
                <div>
                  {/* Coin Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: coin.color }}
                      />
                      <span className="text-sm font-black text-white">{coin.symbol}</span>
                      <span className="text-[10px] text-slate-500">({coin.name})</span>
                    </div>

                    <button
                      onClick={() => handleChartClick(coin.symbol)}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-[#131d2e] hover:bg-[#1a2942] text-slate-300 border border-[#21314e] cursor-pointer"
                    >
                      CHART
                    </button>
                  </div>

                  {/* Mark Price */}
                  <div className="text-xs font-bold text-slate-300 mt-1">
                    ${coin.markPrice ? (coin.markPrice < 1 ? coin.markPrice.toFixed(4) : coin.markPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 'Live'}
                  </div>

                  {/* Ratio Metric Hero */}
                  <div className="mt-3 p-2.5 rounded-lg bg-[#0e1627] border border-[#1e2e4b] text-center space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Rasio Long / Short</div>
                    <div className="text-lg sm:text-xl font-black text-amber-300">
                      {coin.longShortRatio.toFixed(2)}x
                    </div>
                    <div className="text-[9px] text-slate-400">Akun Global Binance</div>
                  </div>

                  {/* Visual Long vs Short Dual Bar */}
                  <div className="space-y-1.5 mt-3">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-emerald-400">LONG: {coin.longPercentage}%</span>
                      <span className="text-red-400">SHORT: {coin.shortPercentage}%</span>
                    </div>

                    <div className="w-full bg-[#162035] h-2.5 rounded-full overflow-hidden flex p-0.5 gap-0.5">
                      <div
                        className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
                        style={{ width: `${coin.longPercentage}%` }}
                      />
                      <div
                        className="h-full bg-red-500 rounded-r-full transition-all duration-500"
                        style={{ width: `${coin.shortPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Secondary Metrics */}
                  <div className="mt-3 space-y-1 text-[10px] text-slate-400 border-t border-[#162238] pt-2">
                    <div className="flex items-center justify-between">
                      <span>Open Interest:</span>
                      <span className="text-white font-bold">{coin.openInterestUSD}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Funding Rate:</span>
                      <span className={`font-bold ${coin.fundingRate >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {coin.fundingRate >= 0 ? '+' : ''}{coin.fundingRate}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contrarian Signal Badge */}
                <div
                  className={`mt-3 p-2 rounded-lg text-center text-[9px] font-bold uppercase border ${
                    isLongCrowded
                      ? 'bg-amber-950/30 text-amber-300 border-amber-800/40'
                      : isShortCrowded
                      ? 'bg-emerald-950/30 text-emerald-300 border-emerald-800/40'
                      : 'bg-cyan-950/30 text-cyan-300 border-cyan-800/40'
                  }`}
                >
                  {coin.contrarianSignal}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
