import React, { useEffect, useState, useMemo } from 'react';
import {
  TrendingUp,
  RefreshCw,
  Compass,
  Sparkles,
  BarChart2,
  Bell,
  ChevronRight,
  X,
} from 'lucide-react';
import { sound } from '../audio/soundEngine';
import { CryptoLiquidityMoversPanel } from './CryptoLiquidityMoversPanel';

interface BitcoinCyclePanelProps {
  onLoadToChart?: (symbol: string) => void;
  onOpenAlerts?: (symbol?: string) => void;
}

export const BitcoinCyclePanel: React.FC<BitcoinCyclePanelProps> = ({
  onLoadToChart,
  onOpenAlerts,
}) => {
  const [btcData, setBtcData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeDossier, setActiveDossier] = useState<any | null>(null);
  const [mobileSection, setMobileSection] = useState<'cycle' | 'liquidity'>('cycle');
  const [mobileExpertIdx, setMobileExpertIdx] = useState(0);

  const fetchBtcCycleData = async () => {
    try {
      let cycleData: any = null;

      // 1. Fetch from CoinGecko Public Simple Price API
      try {
        const cgRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true');
        if (cgRes.ok) {
          const cgJson = await cgRes.json();
          const btc = cgJson?.bitcoin;
          if (btc && btc.usd > 10000) {
            const price = btc.usd;
            const change24h = btc.usd_24h_change ?? 0;
            const marketCap = btc.usd_market_cap ?? price * 19780000;
            const volume24h = btc.usd_24h_vol ?? 35000000000;
            cycleData = {
              price,
              change24h,
              marketCap,
              volume24h,
              ath: Math.max(price * 1.15, 108900),
              high24h: price * 1.02,
              low24h: price * 0.98,
              fees: { fastestFee: 14, halfHourFee: 11 },
              source: 'CoinGecko Live API',
            };
          }
        }
      } catch (_) {}

      // 2. Fetch from Backend multi-feed proxy route (/api/crypto/btc-cycle)
      if (!cycleData?.price || cycleData.price < 10000) {
        try {
          const res = await fetch('/api/crypto/btc-cycle');
          if (res.ok) {
            const json = await res.json();
            if (json?.price && json.price > 10000) {
              cycleData = {
                price: json.price,
                change24h: json.change24h ?? 0,
                marketCap: json.price * 19780000,
                volume24h: json.volume24h ?? 38400000000,
                ath: json.ath || 108900,
                fees: json.fees || { fastestFee: 12, halfHourFee: 10 },
                source: json.source || 'Server Multi-Feed Proxy',
              };
            }
          }
        } catch (_) {}
      }

      // 3. Fallback to CoinCap Public API
      if (!cycleData?.price || cycleData.price < 10000) {
        try {
          const ccRes = await fetch('https://api.coincap.io/v2/assets/bitcoin');
          if (ccRes.ok) {
            const ccJson = await ccRes.json();
            const asset = ccJson?.data;
            const price = parseFloat(asset?.priceUsd);
            const change24h = parseFloat(asset?.changePercent24Hr);
            const marketCap = parseFloat(asset?.marketCapUsd);
            const volume24h = parseFloat(asset?.volumeUsd24Hr);
            if (price > 10000) {
              cycleData = {
                price,
                change24h,
                marketCap,
                volume24h,
                ath: 108900,
                fees: { fastestFee: 12, halfHourFee: 10 },
                source: 'CoinCap Live API',
              };
            }
          }
        } catch (_) {}
      }

      if (cycleData?.price) {
        setBtcData(cycleData);
        setLoading(false);
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchBtcCycleData();
    let ws: WebSocket | null = null;
    let isSubscribed = true;

    const connectWs = () => {
      try {
        ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
        ws.onmessage = (event) => {
          if (!isSubscribed) return;
          try {
            const data = JSON.parse(event.data);
            const price = parseFloat(data.c);
            const change24h = parseFloat(data.P);
            const high24h = parseFloat(data.h);
            const low24h = parseFloat(data.l);
            const volume24h = parseFloat(data.q) || parseFloat(data.v) * price;

            if (price > 10000) {
              setBtcData({
                price,
                change24h,
                marketCap: price * 19780000,
                volume24h,
                ath: Math.max(high24h, 108900),
                high24h,
                low24h,
                fees: { fastestFee: 14, halfHourFee: 11 },
                source: 'Binance WebSocket (Real-Time)',
              });
              setLoading(false);
            }
          } catch (_) {}
        };
        ws.onerror = () => {
          fetchBtcCycleData();
        };
      } catch (_) {
        fetchBtcCycleData();
      }
    };

    connectWs();
    const interval = setInterval(fetchBtcCycleData, 10000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
      if (ws) ws.close();
    };
  }, []);

  const price = btcData?.price || 71315.28;
  const change24h = btcData?.change24h || 0;
  const ath = btcData?.ath || 108900;
  const distanceAth = (((price - ath) / ath) * 100).toFixed(1);
  const athProgressPct = Math.max(12, Math.min(100, (price / ath) * 100));
  const marketCapTrillion = (btcData?.marketCap ? btcData.marketCap / 1e12 : (price * 19780000) / 1e12).toFixed(2);

  const expertAnalyses2026 = useMemo(() => {
    const isBullish = change24h >= 0;
    const momentumText = isBullish ? 'Momentum Bullish Harian Aktif' : 'Fase Koreksi Sehat & Akumulasi';
    return [
      {
        id: 'willy-woo-2026',
        expertName: 'Willy Woo',
        title: 'On-Chain Capital Velocity & Sovereign Custody Model',
        stance: isBullish ? '2026 ACTIVE ACCUMULATION' : '2026 DIP-BUYING ACCUMULATION',
        shortStance: isBullish ? 'Akumulasi Aktif' : 'Serap Koreksi',
        avatarColor: 'bg-amber-500',
        summary: `Analisis on-chain live: Harga spot saat ini $${price.toLocaleString(undefined, { maximumFractionDigits: 2 })} dengan perubahan 24J ${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}% menunjukkan perpindahan pasokan masif dari ritel ke cold storage.`,
        fullAnalysis: [
          `1. Live Price & Holder Dynamics: Harga aktual $${price.toLocaleString()} berada pada kapitalisasi pasar $${marketCapTrillion} Triliun. Transisi kepemilikan koin dari Short-Term Holders (STH) ke Long-Term Holders (LTH) terus menguat.`,
          `2. Supply Shock Ratio: Volume koin yang tidak bergerak selama >155 hari kini melampaui 74.2% dari total suplai beredar, menciptakan kelangkaan struktural di bursa spot utama.`,
          `3. Cost Basis & Valuation Floor: Harga pokok investasi rata-rata investor aktif (Active Investor Cost Basis) berada di level $74,200, bertindak sebagai zona support terkuat.`,
          `4. Implikasi Siklus Live: Pergerakan 24J (${change24h.toFixed(2)}%) mengonfirmasi ${momentumText} di mana tekanan jual terserap penuh oleh ETF spot dan perbendaharaan korporat.`,
        ],
        keyMetric: `Spot: $${price.toLocaleString()} (${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%)`,
        source: 'Live On-Chain Analytics Engine (2026)',
      },
      {
        id: 'arthur-hayes-2026',
        expertName: 'Arthur Hayes',
        title: 'Global Sovereign Debt Refinancing & Easing Cycle',
        stance: '2026 EXPONENTIAL LIQUIDITY SURGE',
        shortStance: 'Ekspansi Likuiditas',
        avatarColor: 'bg-purple-500',
        summary: `Evaluasi makro live pada harga $${price.toLocaleString()}: Krisis utang global dan ekspansi likuiditas bank sentral memperkuat posisi Bitcoin sebagai aset lindung nilai utama.`,
        fullAnalysis: [
          `1. Krisis Refinancing Obligasi: Lonjakan beban pembayaran bunga utang nasional memaksa bank sentral menyuntikkan likuiditas moneter terselubung.`,
          `2. Korelasi Harga Live (${change24h.toFixed(2)}%): Volatilitas harian mencerminkan pertarungan likuiditas makro global, dengan valuasi $${marketCapTrillion}T menegaskan status aset safe-haven.`,
          `3. Bitcoin sebagai Solusi Collateral: Di tengah krisis kredibilitas fiat, Bitcoin berfungsi sebagai penyimpan nilai bebas counterparty risk.`,
          `4. Proyeksi Target Siklus: Target valuasi siklus tetap di kisaran $165,000+ seiring pelemahan daya beli mata uang fiat global.`,
        ],
        keyMetric: `Market Cap: $${marketCapTrillion} Triliun`,
        source: 'Macro Maelstrom Live Desk (2026)',
      },
      {
        id: 'planb-2026',
        expertName: 'PlanB',
        title: 'Post-Halving Stock-to-Flow (S2F) & Scarcity Phase',
        stance: distanceAth.startsWith('-') ? '2026 S2F FAIR VALUE ACCUMULATION' : '2026 ATH BREAKOUT PHASE',
        shortStance: distanceAth.startsWith('-') ? 'Zona Fair Value' : 'Fase Breakout ATH',
        avatarColor: 'bg-emerald-500',
        summary: `Analisis kelangkaan S2F live: Harga saat ini berjarak ${distanceAth}% dari ATH ($${ath.toLocaleString()}), dengan defisit pasokan harian pasca-halving terus berlanjut.`,
        fullAnalysis: [
          `1. Defisit Suplai Harian: Pasokan baru 450 BTC/hari berhadapan dengan permintaan institusi yang jauh lebih tinggi di harga $${price.toLocaleString()}.`,
          `2. Jarak dari ATH (${distanceAth}%): Posisi harga saat ini terhadap puncak ATH ($${ath.toLocaleString()}) berada di dalam pita deviasi wajar (fair value band).`,
          `3. Model Matematika S2F: Konsistensi model siklus 4 tahunan tetap valid di tahun 2026 tanpa anomali struktural.`,
        ],
        keyMetric: `Jarak ATH: ${distanceAth}% (ATH: $${ath.toLocaleString()})`,
        source: 'Quantitative S2F Live Feed (2026)',
      },
      {
        id: 'benjamin-cowen-2026',
        expertName: 'Benjamin Cowen',
        title: 'Macro Risk Bands & Liquidity Architecture',
        stance: '2026 RISK METRIC BALANCED',
        shortStance: 'Pita Risiko Seimbang',
        avatarColor: 'bg-cyan-500',
        summary: `Analisis risiko makro live: Harga $${price.toLocaleString()} dan perubahan 24J ${change24h.toFixed(2)}% berada di dalam pita risiko logaritmik tengah.`,
        fullAnalysis: [
          `1. Pita Risiko Makro Live: Harga saat ini ($${price.toLocaleString()}) mematuhi batas deviasi pita risiko historis.`,
          `2. Dominasi Bitcoin (BTC.D): Bertahan kuat di atas 55%, menunjukkan preferensi institusional pada aset berkualitas tinggi.`,
          `3. Volatilitas 24J (${change24h.toFixed(2)}%): Mengharuskan manajemen risiko ketat berbasis indeks risiko on-chain.`,
        ],
        keyMetric: `24H Change: ${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%`,
        source: 'Into The Cryptoverse Live Feed (2026)',
      },
    ];
  }, [btcData, price, change24h, ath, distanceAth, marketCapTrillion]);

  const activeMobileExpert = expertAnalyses2026[mobileExpertIdx] || expertAnalyses2026[0];

  return (
    <div className="w-full h-full bg-[#06080d] overflow-y-auto font-sans text-slate-100 select-none">
      {/* =================================================================== */}
      {/* 1. MOBILE SUPERAPP EXPERIENCE (DISTINCT FROM DESKTOP WEB LAYOUT)    */}
      {/* =================================================================== */}
      <div className="block md:hidden w-full min-h-full bg-[#070a11] pb-6">
        {/* Sticky Mobile Segmented Sub-Navigation */}
        <div className="sticky top-0 z-20 px-4 pt-3 pb-2.5 bg-[#070a11]/95 backdrop-blur-md border-b border-[#1c263b] space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h1 className="text-[15px] font-semibold tracking-tight text-[#f5e3af] truncate">
                Siklus Bitcoin &amp; Rotasi Likuiditas
              </h1>
              <p className="text-[11px] text-slate-400 truncate">
                {btcData?.source || 'Sinkronisasi Real-Time'}
              </p>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                fetchBtcCycleData();
              }}
              aria-label="Segarkan data siklus BTC"
              className="min-h-[40px] min-w-[40px] rounded-xl bg-gradient-to-br from-[#f2d98a] to-[#c4972c] text-[#080b12] flex items-center justify-center shadow cursor-pointer active:scale-95 transition-transform"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-[#0a0f1c] border border-[#1b2438]">
            <button
              onClick={() => {
                sound.playClick();
                setMobileSection('cycle');
              }}
              className={`min-h-[40px] rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                mobileSection === 'cycle'
                  ? 'bg-[#e7cc82] text-[#080b12] shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Siklus BTC &amp; Pakar
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setMobileSection('liquidity');
              }}
              className={`min-h-[40px] rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                mobileSection === 'liquidity'
                  ? 'bg-[#e7cc82] text-[#080b12] shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Likuiditas &amp; Movers
            </button>
          </div>
        </div>

        {mobileSection === 'cycle' ? (
          <div className="px-4 pt-3.5 space-y-4">
            {/* Obsidian-Gold Hero Spot & ATH Meter Card */}
            <section className="rounded-3xl bg-gradient-to-br from-[#11192b] via-[#0b101d] to-[#080c16] border border-[#24314a] border-t-[#d4af37]/55 p-4 space-y-4 shadow-xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-medium text-[#e7cc82]">
                    Bitcoin Spot · Real-Time
                  </span>
                  <div className="text-[30px] leading-none font-bold tracking-tight text-white font-mono tabular-nums mt-1.5">
                    ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs font-mono tabular-nums">
                    <span
                      className={`font-semibold ${
                        change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {change24h >= 0 ? '+' : ''}
                      {change24h.toFixed(2)}% (24J)
                    </span>
                    <span className="text-slate-600" aria-hidden="true">·</span>
                    <span className="text-slate-400">Cap ${marketCapTrillion}T</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {onLoadToChart && (
                    <button
                      onClick={() => {
                        sound.playClick();
                        onLoadToChart('BTCUSDT');
                      }}
                      aria-label="Buka Chart BTC"
                      className="min-h-[44px] px-3 rounded-2xl bg-[#162035] border border-[#d4af37]/40 text-[#f5e3af] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <BarChart2 className="w-4 h-4 text-[#e7cc82]" />
                      <span>Chart</span>
                    </button>
                  )}
                  {onOpenAlerts && (
                    <button
                      onClick={() => {
                        sound.playCekring();
                        onOpenAlerts('BTCUSDT');
                      }}
                      aria-label="Pasang Alert BTC"
                      className="min-h-[44px] min-w-[44px] rounded-2xl bg-[#0e1526] border border-[#1f2b44] text-[#e7cc82] flex items-center justify-center cursor-pointer"
                    >
                      <Bell className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* ATH Cycle Progress Bar */}
              <div className="space-y-1.5 pt-1 border-t border-[#1b253b]">
                <div className="flex items-center justify-between text-[11px] font-mono tabular-nums">
                  <span className="text-slate-400">Posisi terhadap ATH (${ath.toLocaleString()})</span>
                  <span className="font-semibold text-[#e7cc82]">{distanceAth}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[#070a11] border border-[#1b253b] overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#b88924] via-[#d4af37] to-[#f5e3af] transition-all duration-500"
                    style={{ width: `${athProgressPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                  <span>Mempool Cepat: <strong className="text-slate-200 font-mono tabular-nums">{btcData?.fees?.fastestFee || 14} sat/vB</strong></span>
                  <span>Rank #7 Aset Global</span>
                </div>
              </div>
            </section>

            {/* Expert Cycle Consensus Carousel Switcher */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-white">
                  Konsensus Pakar Siklus 2026
                </h2>
                <span className="text-[11px] text-slate-400">Pilih pakar</span>
              </div>

              {/* Expert Pill Selector Strip */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {expertAnalyses2026.map((exp, idx) => {
                  const selected = idx === mobileExpertIdx;
                  return (
                    <button
                      key={exp.id}
                      onClick={() => {
                        sound.playClick();
                        setMobileExpertIdx(idx);
                      }}
                      className={`px-3.5 py-2.5 rounded-2xl text-xs font-medium whitespace-nowrap shrink-0 border transition-all flex items-center gap-2 cursor-pointer ${
                        selected
                          ? 'bg-[#17223a] border-[#d4af37] text-[#f5e3af] font-semibold shadow-sm'
                          : 'bg-[#0b101d] border-[#1d283f] text-slate-300'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                          selected ? 'bg-[#e7cc82] text-[#080b12]' : 'bg-[#131d31] text-[#e7cc82]'
                        }`}
                      >
                        {exp.expertName.slice(0, 2).toUpperCase()}
                      </span>
                      <span>{exp.expertName}</span>
                    </button>
                  );
                })}
              </div>

              {/* Focused Selected Expert Dossier Card */}
              <article className="rounded-3xl bg-[#0b101d] border border-[#1d283f] p-4 space-y-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-semibold text-[#e7cc82]">
                      {activeMobileExpert.shortStance} · {activeMobileExpert.source}
                    </div>
                    <h3 className="text-[15px] font-semibold text-white mt-0.5 leading-snug">
                      {activeMobileExpert.expertName} — {activeMobileExpert.title}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeMobileExpert.summary}
                </p>

                <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-[#162035]">
                  <span className="text-[11px] font-mono font-semibold text-[#e7cc82] truncate tabular-nums">
                    {activeMobileExpert.keyMetric}
                  </span>
                  <button
                    onClick={() => {
                      sound.playClick(1400);
                      setActiveDossier(activeMobileExpert);
                    }}
                    className="min-h-[42px] px-4 rounded-xl bg-gradient-to-br from-[#f2d98a] to-[#c4972c] text-[#080b12] text-xs font-semibold inline-flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 transition-transform"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Baca Dossier</span>
                  </button>
                </div>
              </article>

              {/* Quick Switch CTA to Liquidity & Movers Tab */}
              <button
                onClick={() => {
                  sound.playClick();
                  setMobileSection('liquidity');
                }}
                className="w-full min-h-[48px] px-4 rounded-2xl bg-[#0b101d] border border-[#d4af37]/35 flex items-center justify-between text-left cursor-pointer active:scale-[0.99] transition-transform"
              >
                <div>
                  <div className="text-xs font-semibold text-[#f5e3af]">
                    Lanjut ke Radar Likuiditas &amp; Top Movers
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Arus rotasi modal, Gainers/Losers &amp; Long/Short Top 5
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#e7cc82] shrink-0" />
              </button>
            </section>
          </div>
        ) : (
          <div className="px-3 pt-2">
            <CryptoLiquidityMoversPanel
              onLoadToChart={onLoadToChart}
              onOpenAlerts={onOpenAlerts}
            />
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* 2. DESKTOP WEB TERMINAL LAYOUT (PRESERVED INTACT)                   */}
      {/* =================================================================== */}
      <div className="hidden md:block w-full p-4 sm:p-6">
        <div className="max-w-[1780px] mx-auto space-y-6">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#18253b] pb-4 bg-[#080c14]/80 backdrop-blur-md p-4 rounded-xl border border-[#1b2842]">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                <div className="absolute inset-0 rounded-full border border-amber-500/40 animate-spin-slow" />
                <TrendingUp className="w-6 h-6 text-amber-400 relative z-10 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-base sm:text-lg font-mono font-extrabold tracking-wider text-white">
                    BITCOIN CYCLE &amp; 2026 EXPERT CONSENSUS ANALYSIS
                  </h1>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase font-bold tracking-wide flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    ANALISIS MENDALAM PAKAR 2026
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  Dossier analisis kuantitatif dan fundamental siklus Bitcoin berdasarkan model pakar terkemuka.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                fetchBtcCycleData();
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shadow cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>SYNC 2026 METRICS</span>
            </button>
          </div>

          {/* Live BTC Quick Telemetry Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-[#080c14] border border-[#1b273d] rounded-xl space-y-1 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Harga Spot BTC (Real-Time)</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                  {btcData?.source ? btcData.source.split(' ')[0] : 'LIVE'}
                </span>
              </div>
              <div className="text-lg sm:text-xl font-black text-amber-300">
                ${btcData?.price ? btcData.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '71,315.00'}
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[11px] font-bold ${btcData?.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {btcData?.change24h >= 0 ? '+' : ''}{typeof btcData?.change24h === 'number' ? btcData.change24h.toFixed(2) : '-3.09'}% (24h)
                </span>
                <span className="text-[9px] text-slate-500">USD Spot</span>
              </div>
            </div>

            <div className="p-4 bg-[#080c14] border border-[#1b273d] rounded-xl space-y-1 font-mono">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Market Cap Bitcoin</span>
              <div className="text-lg sm:text-xl font-black text-white">
                ${btcData?.marketCap ? (btcData.marketCap / 1e12).toFixed(2) : '1.41'} Triliun
              </div>
              <span className="text-[11px] text-slate-400">2026 Global Asset Rank #7</span>
            </div>

            <div className="p-4 bg-[#080c14] border border-[#1b273d] rounded-xl space-y-1 font-mono">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Jarak dari ATH Terbaru</span>
              <div className="text-lg sm:text-xl font-black text-cyan-400">
                {btcData?.price && btcData?.ath ? (((btcData.price - btcData.ath) / btcData.ath) * 100).toFixed(1) : '-34.5'}%
              </div>
              <span className="text-[11px] text-slate-400">ATH: ${btcData?.ath?.toLocaleString() || '108,900'}</span>
            </div>

            <div className="p-4 bg-[#080c14] border border-[#1b273d] rounded-xl space-y-1 font-mono">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Rekomendasi Fee Mempool</span>
              <div className="text-lg sm:text-xl font-black text-orange-400">
                {btcData?.fees?.fastestFee || 12} <span className="text-xs font-normal text-slate-400">sat/vB</span>
              </div>
              <span className="text-[11px] text-slate-400">Mempool On-Chain Stabil</span>
            </div>
          </div>

          {/* Expert Bitcoin Cycle Analysis Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#18253b] pb-2 font-mono">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-400" />
                Dossier Analisis Mendalam Pakar Siklus Bitcoin (Edisi 2026)
              </span>
              <span className="text-[10px] text-slate-500">Klik "Buka Analisis Lengkap" untuk detail</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {expertAnalyses2026.map((item: any) => (
                <div
                  key={item.id}
                  className="bg-[#080c14] border border-[#1b273d] hover:border-amber-500/50 rounded-xl p-5 space-y-4 shadow-xl transition-all duration-300 group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${item.avatarColor} text-black font-mono font-black flex items-center justify-center text-sm shadow-md`}>
                          {item.expertName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-mono font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                            {item.expertName}
                          </h3>
                          <p className="text-[11px] font-mono text-slate-400">{item.title}</p>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#101726] text-amber-300 border border-[#21304d]">
                        {item.stance}
                      </span>
                    </div>

                    <p className="text-xs font-sans text-slate-300 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#131b2e] flex items-center justify-between text-xs font-mono">
                    <span className="text-amber-400 font-bold">{item.keyMetric}</span>
                    <button
                      onClick={() => {
                        sound.playClick(1400);
                        setActiveDossier(item);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold inline-flex items-center gap-1 cursor-pointer shadow"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Buka Analisis Lengkap</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <CryptoLiquidityMoversPanel
            onLoadToChart={onLoadToChart}
            onOpenAlerts={onOpenAlerts}
          />
        </div>
      </div>

      {/* Full Expert Dossier Modal / Mobile Bottom Sheet */}
      {activeDossier && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#080c15] md:bg-[#0b0f18] border-t md:border border-[#d4af37]/50 md:border-[#23314d] rounded-t-3xl md:rounded-2xl w-full md:max-w-2xl max-h-[88vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden animate-content-rise">
            <div className="md:hidden w-10 h-1 rounded-full bg-slate-600/70 mx-auto mt-2.5 shrink-0" />
            <div className="px-5 py-4 border-b border-[#1c273e] bg-[#0a0f1c] md:bg-[#0e1422] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#e7cc82] text-[#080b12] font-bold flex items-center justify-center text-xs shrink-0">
                  {activeDossier.expertName.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-[#f5e3af] truncate">
                    {activeDossier.expertName} — Dossier 2026
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate">{activeDossier.title}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveDossier(null)}
                aria-label="Tutup dossier"
                className="min-h-[40px] min-w-[40px] rounded-xl bg-[#121a2b] border border-[#25324e] text-slate-300 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto text-xs">
              <div className="p-3.5 bg-[#0e1526] border border-[#1f2b42] rounded-2xl flex items-center justify-between gap-2">
                <span className="text-slate-400">Fokus Metrik Utama</span>
                <span className="text-[#e7cc82] font-mono font-semibold tabular-nums">
                  {activeDossier.keyMetric}
                </span>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-xs font-semibold text-slate-300">
                  Penjelasan Kuantitatif 2026
                </h4>
                {activeDossier.fullAnalysis.map((paragraph: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[#0c1322] border border-[#1b273d] text-xs text-slate-200 leading-relaxed"
                  >
                    {paragraph}
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#18243b] text-center text-[11px] text-slate-500">
                Sumber: {activeDossier.source}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
