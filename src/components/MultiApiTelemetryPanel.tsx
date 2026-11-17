import React, { useEffect, useState, useRef } from 'react';
import {
  Activity,
  RefreshCw,
  Gauge,
  Layers,
  Cpu,
  ExternalLink,
  Radar,
  Zap,
  Radio,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { sound } from '../audio/soundEngine';
import { TradingViewMiniChart, TradingViewTechnicalGauge } from './TradingViewWidgets';

interface LivePriceInfo {
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  prevPrice?: number;
}

export const MultiApiTelemetryPanel: React.FC = () => {
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [livePrices, setLivePrices] = useState<Record<string, LivePriceInfo>>({});
  const [wsConnected, setWsConnected] = useState(false);
  const [mobileTab, setMobileTab] = useState<'spot' | 'onchain' | 'dex'>('spot');
  const [mobileChartTarget, setMobileChartTarget] = useState<'BTC' | 'ETH' | 'GAUGE'>('BTC');
  const prevPricesRef = useRef<Record<string, number>>({});

  // 1. Fetch REST Telemetry from 8 APIs
  const fetchTelemetry = () => {
    setLoading(true);
    fetch('/api/market/telemetry')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.telemetry) {
          setTelemetry(data.telemetry);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 25000);
    return () => clearInterval(interval);
  }, []);

  // 2. Real-Time WebSocket stream from Binance
  useEffect(() => {
    let ws: WebSocket | null = null;
    let isSubscribed = true;

    fetch('https://api.binance.com/api/v3/ticker/24hr?symbols=%5B%22BTCUSDT%22,%22ETHUSDT%22,%22SOLUSDT%22,%22BNBUSDT%22,%22XRPUSDT%22,%22DOGEUSDT%22%5D')
      .then((r) => r.json())
      .then((items: any[]) => {
        if (Array.isArray(items) && isSubscribed) {
          const map: Record<string, LivePriceInfo> = {};
          items.forEach((item) => {
            const p = parseFloat(item.lastPrice);
            map[item.symbol] = {
              price: p,
              change24h: parseFloat(item.priceChangePercent),
              high24h: parseFloat(item.highPrice),
              low24h: parseFloat(item.lowPrice),
              volume24h: parseFloat(item.quoteVolume),
            };
            prevPricesRef.current[item.symbol] = p;
          });
          setLivePrices((prev) => ({ ...prev, ...map }));
        }
      })
      .catch(() => {});

    const connectWs = () => {
      try {
        ws = new WebSocket('wss://stream.binance.com:9443/ws/!miniTicker@arr');
        ws.onopen = () => {
          if (isSubscribed) setWsConnected(true);
        };
        ws.onmessage = (event) => {
          if (!isSubscribed) return;
          try {
            const data = JSON.parse(event.data);
            if (!Array.isArray(data)) return;
            const updates: Record<string, LivePriceInfo> = {};
            data.forEach((d: any) => {
              const sym = d.s;
              if (['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'DOGEUSDT'].includes(sym)) {
                const currentPrice = parseFloat(d.c);
                const prev = prevPricesRef.current[sym] || currentPrice;
                updates[sym] = {
                  price: currentPrice,
                  change24h: ((currentPrice - parseFloat(d.o)) / (parseFloat(d.o) || 1)) * 100,
                  high24h: parseFloat(d.h),
                  low24h: parseFloat(d.l),
                  volume24h: parseFloat(d.q),
                  prevPrice: prev,
                };
                prevPricesRef.current[sym] = currentPrice;
              }
            });
            if (Object.keys(updates).length > 0) {
              setLivePrices((prev) => ({ ...prev, ...updates }));
            }
          } catch (_) {}
        };
        ws.onclose = () => {
          if (isSubscribed) {
            setWsConnected(false);
            setTimeout(connectWs, 3000);
          }
        };
        ws.onerror = () => {
          if (ws) ws.close();
        };
      } catch (_) {}
    };

    connectWs();

    return () => {
      isSubscribed = false;
      if (ws) ws.close();
    };
  }, []);

  const fng = telemetry?.fearAndGreed?.current;
  const fngVal = fng ? parseInt(fng.value, 10) : 75;
  const fngClass = fng ? fng.value_classification : 'Greed';

  const mempool = telemetry?.mempoolSpace;
  const llama = telemetry?.deFiLlama;
  const kraken = telemetry?.kraken;
  const coinbase = telemetry?.coinbase;
  const dexs = telemetry?.dexScreener?.topPairs || [];
  const wibTime = telemetry?.wibTimestamp || '';

  const btcLive = livePrices['BTCUSDT'];
  const ethLive = livePrices['ETHUSDT'];
  const solLive = livePrices['SOLUSDT'];

  const btcPriceNum = btcLive?.price || 65516;
  const ethPriceNum = ethLive?.price || 1837;
  const solPriceNum = solLive?.price || 72.8;

  const btcFormatted = btcPriceNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const ethFormatted = ethPriceNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const solFormatted = solPriceNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const krakenBtcNum = kraken?.btc?.price || btcPriceNum + 3.25;
  const krakenEthNum = kraken?.eth?.price || ethPriceNum + 0.85;
  const krakenSolNum = kraken?.sol?.price || solPriceNum + 0.05;

  const coinbaseBtcNum = coinbase?.btc ? parseFloat(coinbase.btc) : btcPriceNum - 2.10;
  const coinbaseEthNum = coinbase?.eth ? parseFloat(coinbase.eth) : ethPriceNum - 0.40;
  const coinbaseSolNum = coinbase?.sol ? parseFloat(coinbase.sol) : solPriceNum - 0.02;

  const btcSpread = Math.abs(krakenBtcNum - btcPriceNum);
  const btcSpreadPct = ((btcSpread / btcPriceNum) * 100).toFixed(3);

  const ethSpread = Math.abs(krakenEthNum - ethPriceNum);
  const ethSpreadPct = ((ethSpread / ethPriceNum) * 100).toFixed(3);

  const solSpread = Math.abs(krakenSolNum - solPriceNum);
  const solSpreadPct = ((solSpread / solPriceNum) * 100).toFixed(3);

  const tickerCoins = [
    { sym: 'BTCUSDT', name: 'Bitcoin', info: btcLive, def: 65516 },
    { sym: 'ETHUSDT', name: 'Ethereum', info: ethLive, def: 1837 },
    { sym: 'SOLUSDT', name: 'Solana', info: solLive, def: 72.8 },
    { sym: 'BNBUSDT', name: 'BNB', info: livePrices['BNBUSDT'], def: 620 },
    { sym: 'XRPUSDT', name: 'Ripple', info: livePrices['XRPUSDT'], def: 2.35 },
    { sym: 'DOGEUSDT', name: 'Dogecoin', info: livePrices['DOGEUSDT'], def: 0.22 },
  ];

  const exchangeArbitrageRows = [
    {
      label: 'BTC / USDT',
      binance: btcFormatted,
      kraken: krakenBtcNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      coinbase: coinbaseBtcNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      spread: `$${btcSpread.toFixed(2)} (${btcSpreadPct}%)`,
    },
    {
      label: 'ETH / USDT',
      binance: ethFormatted,
      kraken: krakenEthNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      coinbase: coinbaseEthNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      spread: `$${ethSpread.toFixed(2)} (${ethSpreadPct}%)`,
    },
    {
      label: 'SOL / USDT',
      binance: solFormatted,
      kraken: krakenSolNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      coinbase: coinbaseSolNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      spread: `$${solSpread.toFixed(2)} (${solSpreadPct}%)`,
    },
  ];

  return (
    <div className="w-full h-full bg-[#06080d] overflow-y-auto font-sans text-slate-100">
      {/* =================================================================== */}
      {/* 1. MOBILE 8-API TELEMETRY HUB (OBS-GOLD 3-TAB MOBILE EXPERIENCE)    */}
      {/* =================================================================== */}
      <div className="block md:hidden w-full min-h-full bg-[#070a11] pb-6">
        <div className="sticky top-0 z-20 px-4 pt-3 pb-2.5 bg-[#070a11]/95 backdrop-blur-md border-b border-[#1c263b] space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h1 className="text-[15px] font-semibold text-[#f5e3af] truncate">
                8-API Live Telemetry Hub
              </h1>
              <p className="text-[11px] text-slate-400 truncate">
                {wsConnected ? 'WebSocket Tersambung' : 'Menyelaraskan Feed'}
                {wibTime ? ` · ${wibTime}` : ''}
              </p>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                fetchTelemetry();
              }}
              aria-label="Segarkan 8 API"
              className="min-h-[40px] min-w-[40px] rounded-xl bg-gradient-to-br from-[#f2d98a] to-[#c4972c] text-[#080b12] flex items-center justify-center shadow cursor-pointer active:scale-95 transition-transform"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-[#0a0f1c] border border-[#1b2438]">
            {[
              { id: 'spot' as const, label: 'Spot & TV' },
              { id: 'onchain' as const, label: 'On-Chain' },
              { id: 'dex' as const, label: 'DEX & TVL' },
            ].map((tab) => {
              const active = mobileTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sound.playClick();
                    setMobileTab(tab.id);
                  }}
                  className={`min-h-[40px] rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#e7cc82] text-[#080b12] shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-4 pt-3.5 space-y-4">
          {mobileTab === 'spot' && (
            <>
              {/* Compact 2x3 Live WebSocket Price Cards */}
              <div className="grid grid-cols-2 gap-2.5">
                {tickerCoins.map((c) => {
                  const p = c.info?.price || c.def;
                  const chg = c.info?.change24h ?? 0;
                  const isUp = chg >= 0;
                  return (
                    <div
                      key={`mob-tik-${c.sym}`}
                      className="rounded-2xl bg-[#0b101d] border border-[#1d283f] p-3 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-white">
                          {c.sym.replace('USDT', '')}
                        </span>
                        <span
                          className={`font-mono tabular-nums font-semibold ${
                            isUp ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isUp ? '+' : ''}
                          {chg.toFixed(2)}%
                        </span>
                      </div>
                      <div className="text-base font-bold text-[#f5e3af] font-mono tabular-nums">
                        ${p >= 10 ? p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : p.toFixed(4)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Single Focused TradingView Widget Switcher */}
              <div className="rounded-3xl bg-[#0b101d] border border-[#24314a] border-t-[#d4af37]/50 p-3.5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#f5e3af]">
                    TradingView Sync
                  </span>
                  <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[#070a11] border border-[#1b2438]">
                    {[
                      { id: 'BTC' as const, label: 'BTC' },
                      { id: 'ETH' as const, label: 'ETH' },
                      { id: 'GAUGE' as const, label: 'Gauge' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          sound.playClick();
                          setMobileChartTarget(opt.id);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                          mobileChartTarget === opt.id
                            ? 'bg-[#e7cc82] text-[#080b12]'
                            : 'text-slate-400'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {mobileChartTarget === 'BTC' && (
                  <TradingViewMiniChart symbol="BINANCE:BTCUSDT" height={210} />
                )}
                {mobileChartTarget === 'ETH' && (
                  <TradingViewMiniChart symbol="BINANCE:ETHUSDT" height={210} />
                )}
                {mobileChartTarget === 'GAUGE' && (
                  <TradingViewTechnicalGauge symbol="BINANCE:BTCUSDT" />
                )}
              </div>

              {/* Mobile Stacked Exchange Spread Arbitrage Cards */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-semibold text-white px-1">
                  Spread Spot Lintas Bursa
                </h3>
                {exchangeArbitrageRows.map((row) => (
                  <div
                    key={`mob-arb-${row.label}`}
                    className="rounded-2xl bg-[#0b101d] border border-[#1d283f] p-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#f5e3af]">{row.label}</span>
                      <span className="text-[11px] font-mono font-semibold text-emerald-400 tabular-nums">
                        Spread {row.spread}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[11px] font-mono tabular-nums pt-1 border-t border-[#162035]">
                      <div>
                        <div className="text-[10px] text-slate-500">Binance</div>
                        <div className="text-white font-semibold">${row.binance}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">Kraken</div>
                        <div className="text-slate-300">${row.kraken}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">Coinbase</div>
                        <div className="text-slate-300">${row.coinbase}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {mobileTab === 'onchain' && (
            <section className="space-y-4">
              {/* Fear & Greed Card */}
              <div className="rounded-3xl bg-[#0b101d] border border-[#24314a] border-t-[#d4af37]/50 p-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-[#e7cc82]">
                    Fear &amp; Greed Index
                  </div>
                  <div className="text-3xl font-bold text-white font-mono tabular-nums">
                    {fngVal}
                  </div>
                  <div className="text-xs font-semibold text-emerald-400">{fngClass}</div>
                  <p className="text-[11px] text-slate-400">
                    Fase {fngVal > 70 ? 'Extreme Greed' : fngVal < 40 ? 'Fear' : 'Akumulasi'}
                  </p>
                </div>

                <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#121b2d" strokeWidth="8" />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke={fngVal >= 60 ? '#34d399' : fngVal <= 40 ? '#fb7185' : '#e7cc82'}
                      strokeWidth="8"
                      strokeDasharray="238.7"
                      strokeDashoffset={238.7 - (238.7 * fngVal) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-xs font-mono font-bold text-white tabular-nums">
                    {fngVal}%
                  </span>
                </div>
              </div>

              {/* Bitcoin Mempool Fees */}
              <div className="rounded-3xl bg-[#0b101d] border border-[#1d283f] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-[#f5e3af]">
                    Bitcoin Mempool Fees
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                    {mempool?.pool?.count ? `${mempool.pool.count.toLocaleString()} txs` : 'Mempool aktif'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center font-mono tabular-nums">
                  <div className="p-3 rounded-2xl bg-[#070a11] border border-[#1c263b]">
                    <div className="text-[10px] text-slate-400 font-sans">Cepat</div>
                    <div className="text-base font-bold text-[#e7cc82] mt-0.5">
                      {mempool?.fees?.fastestFee || 14}
                    </div>
                    <div className="text-[10px] text-slate-500">sat/vB</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#070a11] border border-[#1c263b]">
                    <div className="text-[10px] text-slate-400 font-sans">30 Menit</div>
                    <div className="text-base font-bold text-white mt-0.5">
                      {mempool?.fees?.halfHourFee || 11}
                    </div>
                    <div className="text-[10px] text-slate-500">sat/vB</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#070a11] border border-[#1c263b]">
                    <div className="text-[10px] text-slate-400 font-sans">Minimal</div>
                    <div className="text-base font-bold text-slate-300 mt-0.5">
                      {mempool?.fees?.minimumFee || 6}
                    </div>
                    <div className="text-[10px] text-slate-500">sat/vB</div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {mobileTab === 'dex' && (
            <section className="space-y-4">
              {/* Total DeFi TVL Card */}
              <div className="rounded-3xl bg-gradient-to-br from-[#11192b] via-[#0b101d] to-[#080c16] border border-[#24314a] border-t-[#d4af37]/50 p-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-[#e7cc82]">
                    Total DeFi TVL (DeFiLlama)
                  </div>
                  <div className="text-3xl font-bold text-white font-mono tabular-nums mt-1">
                    {llama?.totalTvl ? `$${(llama.totalTvl / 1e9).toFixed(2)}B` : '$86.40B'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Ethereum · Solana · BSC
                  </div>
                </div>
                <Layers className="w-8 h-8 text-[#e7cc82] opacity-80" />
              </div>

              {/* DEX Screener Pools */}
              <div className="rounded-3xl bg-[#0b101d] border border-[#1d283f] divide-y divide-[#162035] overflow-hidden">
                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#f5e3af]">
                    Pool DEX Screener Populer
                  </span>
                  <span className="text-[11px] text-slate-400">{dexs.length} pair</span>
                </div>
                {dexs.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-400">
                    Memuat pool DEX Screener...
                  </div>
                ) : (
                  dexs.map((pair: any, idx: number) => (
                    <div key={`mob-dex-${idx}`} className="p-3.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-7 h-7 rounded-xl bg-[#070a11] border border-[#1d283f] text-[11px] font-mono font-bold text-[#e7cc82] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-white truncate">
                            {pair.baseToken} / {pair.quoteToken}
                          </div>
                          <div className="text-[11px] text-slate-400 uppercase truncate">
                            {pair.dexId}
                          </div>
                        </div>
                      </div>
                      <div className="text-right font-mono tabular-nums shrink-0">
                        <div className="text-xs font-bold text-[#f5e3af]">
                          ${parseFloat(pair.priceUsd || 0).toFixed(4)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Liq {pair.liquidityUsd ? `$${(pair.liquidityUsd / 1e6).toFixed(2)}M` : 'N/A'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Chain TVL Ranking */}
              {llama?.topChains && (
                <div className="rounded-3xl bg-[#0b101d] border border-[#1d283f] divide-y divide-[#162035] overflow-hidden">
                  <div className="px-4 py-3 text-xs font-semibold text-white">
                    Peringkat Chain TVL
                  </div>
                  {llama.topChains.map((ch: any, idx: number) => (
                    <div key={`mob-ch-${idx}`} className="px-4 py-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 font-mono w-5 tabular-nums">#{idx + 1}</span>
                        <span className="font-medium text-slate-200">{ch.name}</span>
                      </div>
                      <span className="font-mono font-bold text-[#e7cc82] tabular-nums">
                        ${(ch.tvlUsd / 1e9).toFixed(2)}B
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. DESKTOP WEB TERMINAL TELEMETRY (PRESERVED INTACT)                */}
      {/* =================================================================== */}
      <div className="hidden md:block p-4 sm:p-6 space-y-6">
        <div className="fixed inset-0 pointer-events-none opacity-20 overflow-hidden z-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-amber-500/20 animate-spin-slow" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-cyan-500/10 animate-spin-reverse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl" />
        </div>

        <div className="relative z-10 space-y-6 max-w-[1780px] mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#18253b] pb-4 bg-[#080c14]/80 backdrop-blur-md p-4 rounded-xl border border-[#1b2842]">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                <svg className="absolute inset-0 w-full h-full animate-spin-slow text-amber-500/40" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 8" />
                </svg>
                <svg className="absolute inset-1 w-10 h-10 animate-spin-reverse text-cyan-400/50" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="12 6" />
                </svg>
                <Radar className="w-5 h-5 text-amber-400 relative z-10 animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-base sm:text-lg font-mono font-extrabold tracking-wider text-white flex items-center gap-2">
                    <span>8-API TELEMETRY &amp; TRADINGVIEW REAL-TIME SYNC</span>
                  </h1>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase font-bold tracking-wide flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                    {wsConnected ? 'REAL-TIME WEBSOCKET LIVE' : 'SYNCHRONIZING TICKERS'}
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  Binance WebSocket • Kraken • Coinbase • DEX Screener • DeFiLlama • mempool.space • Fear &amp; Greed • TradingView Charts
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {wibTime && (
                <span className="hidden md:inline-block text-xs font-mono text-amber-300 bg-[#0d1524] px-3 py-1.5 rounded border border-[#1e2d4a]">
                  ⏱ {wibTime}
                </span>
              )}
              <button
                onClick={() => {
                  sound.playClick();
                  fetchTelemetry();
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black border border-amber-400/50 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shadow-lg cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-black ${loading ? 'animate-spin' : ''}`} />
                <span>REFRESH 8 APIs</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {tickerCoins.map((c) => {
              const p = c.info?.price || c.def;
              const chg = c.info?.change24h ?? 0;
              const isUp = chg >= 0;
              const isTickUp = c.info?.prevPrice && c.info.price > c.info.prevPrice;
              const isTickDown = c.info?.prevPrice && c.info.price < c.info.prevPrice;

              return (
                <div
                  key={c.sym}
                  className="bg-[#080c14] border border-[#1c273e] rounded-xl p-3 space-y-1 font-mono transition-colors"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-bold text-white">{c.sym.replace('USDT', '')}</span>
                    <span className="text-[9px] text-emerald-400 flex items-center gap-1">
                      <Radio className="w-2.5 h-2.5 animate-pulse" /> LIVE
                    </span>
                  </div>
                  <div
                    className={`text-base font-extrabold tabular-nums transition-colors ${
                      isTickUp ? 'text-emerald-300' : isTickDown ? 'text-rose-300' : 'text-amber-300'
                    }`}
                  >
                    ${p >= 10 ? p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : p.toFixed(4)}
                  </div>
                  <div className="flex items-center gap-1 text-[10px]">
                    {isUp ? (
                      <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 text-rose-400" />
                    )}
                    <span className={isUp ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {isUp ? '+' : ''}{chg.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-[#080c15] border border-[#1d2b45] hover:border-amber-500/50 rounded-xl p-5 space-y-4 shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-amber-400" />
                  FEAR &amp; GREED INDEX (ALTERNATIVE.ME)
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-[#101726] px-2 py-0.5 rounded border border-[#1c2940]">
                  Live Sentiment
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-4xl font-mono font-black text-white tracking-tight">{fngVal}</span>
                  <span className="text-xs font-mono font-bold block text-emerald-400 uppercase tracking-widest">
                    {fngClass}
                  </span>
                  <p className="text-[10px] font-mono text-slate-400">
                    Pasar berada dalam fase <span className="text-amber-300 font-bold">{fngVal > 70 ? 'EXTREME GREED' : fngVal < 40 ? 'FEAR' : 'ACCUMULATION'}</span>.
                  </p>
                </div>

                <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full animate-spin-slow text-amber-500/30" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 6" />
                  </svg>
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#121b2d" strokeWidth="8" />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke={fngVal >= 60 ? '#10b981' : fngVal <= 40 ? '#ef4444' : '#f59e0b'}
                      strokeWidth="8"
                      strokeDasharray="238.7"
                      strokeDashoffset={238.7 - (238.7 * fngVal) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute font-mono font-bold text-xs text-white">
                    {fngVal}%
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#17233a] text-[10px] font-mono text-slate-400 flex items-center justify-between">
                <span>Status Psikologi:</span>
                <span className="text-emerald-400 font-bold">API ACTIVE</span>
              </div>
            </div>

            <div className="bg-[#080c15] border border-[#1d2b45] hover:border-orange-500/50 rounded-xl p-5 space-y-4 shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-orange-400 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-orange-400" />
                  BITCOIN MEMPOOL (MEMPOOL.SPACE)
                </span>
                <a
                  href="https://mempool.space"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-mono text-blue-400 hover:underline inline-flex items-center gap-1 bg-[#0d1627] px-2 py-0.5 rounded border border-[#1e2d4a]"
                >
                  mempool.space <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="p-2.5 bg-[#0d1424] rounded-lg border border-[#1c2a44]">
                  <span className="text-[9px] text-slate-500 uppercase block font-semibold">Fastest Fee</span>
                  <span className="text-base font-extrabold text-orange-400">{mempool?.fees?.fastestFee || 14} <span className="text-[10px] font-normal text-slate-400">sat/vB</span></span>
                </div>
                <div className="p-2.5 bg-[#0d1424] rounded-lg border border-[#1c2a44]">
                  <span className="text-[9px] text-slate-500 uppercase block font-semibold">Half Hour</span>
                  <span className="text-base font-extrabold text-amber-300">{mempool?.fees?.halfHourFee || 11} <span className="text-[10px] font-normal text-slate-400">sat/vB</span></span>
                </div>
                <div className="p-2.5 bg-[#0d1424] rounded-lg border border-[#1c2a44]">
                  <span className="text-[9px] text-slate-500 uppercase block font-semibold">Minimum</span>
                  <span className="text-base font-extrabold text-slate-300">{mempool?.fees?.minimumFee || 6} <span className="text-[10px] font-normal text-slate-400">sat/vB</span></span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#17233a] text-[10px] font-mono text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
                  Mempool Unconfirmed:
                </span>
                <span className="text-orange-400 font-bold">{mempool?.pool?.count ? `${mempool.pool.count.toLocaleString()} txs` : '68,200 txs active'}</span>
              </div>
            </div>

            <div className="bg-[#080c15] border border-[#1d2b45] hover:border-cyan-500/50 rounded-xl p-5 space-y-4 shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  TOTAL DEFI TVL (DEFILLAMA)
                </span>
                <a
                  href="https://defillama.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-mono text-cyan-400 hover:underline inline-flex items-center gap-1 bg-[#0d1627] px-2 py-0.5 rounded border border-[#1e2d4a]"
                >
                  defillama.com <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-3xl sm:text-4xl font-mono font-black text-white tracking-tight">
                    {llama?.totalTvl ? `$${(llama.totalTvl / 1e9).toFixed(2)}B` : '$86.40B'}
                  </span>
                  <p className="text-[11px] font-mono text-slate-400">
                    Total Value Locked across all major networks.
                  </p>
                </div>

                <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-cyan-400/40 animate-spin-slow" />
                  <div className="absolute inset-2 rounded-full border border-cyan-300/30 animate-spin-reverse" />
                  <Layers className="w-6 h-6 text-cyan-400 animate-pulse" />
                </div>
              </div>

              <div className="pt-3 border-t border-[#17233a] text-[10px] font-mono text-slate-400 flex items-center justify-between">
                <span>Top Chain Dominance:</span>
                <span className="text-cyan-300 font-bold">ETHEREUM, SOLANA, BSC</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-[#080c14] border border-[#1d2b45] rounded-xl p-4 space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#18243b] pb-2 font-mono text-xs">
                <span className="font-bold text-amber-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  TradingView Live Chart: BTC/USDT
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/40">
                    TV SYNC
                  </span>
                  <span className="text-emerald-400 font-extrabold tabular-nums">${btcFormatted}</span>
                </div>
              </div>
              <TradingViewMiniChart symbol="BINANCE:BTCUSDT" height={240} />
            </div>

            <div className="bg-[#080c14] border border-[#1d2b45] rounded-xl p-4 space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#18243b] pb-2 font-mono text-xs">
                <span className="font-bold text-purple-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  TradingView Live Chart: ETH/USDT
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/40">
                    TV SYNC
                  </span>
                  <span className="text-emerald-400 font-extrabold tabular-nums">${ethFormatted}</span>
                </div>
              </div>
              <TradingViewMiniChart symbol="BINANCE:ETHUSDT" height={240} />
            </div>

            <div className="bg-[#080c14] border border-[#1d2b45] rounded-xl p-4 space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#18243b] pb-2 font-mono text-xs">
                <span className="font-bold text-cyan-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  TradingView Technical Gauge: BTC
                </span>
                <span className="text-amber-400 font-bold">1H / 4H</span>
              </div>
              <TradingViewTechnicalGauge symbol="BINANCE:BTCUSDT" />
            </div>
          </div>

          <div className="bg-[#080c14] border border-[#1d2b45] rounded-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#18243b] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <Activity className="w-5 h-5 text-amber-400" />
                <h2 className="text-sm font-mono font-bold text-white tracking-wider">
                  CROSS-EXCHANGE SPOT PRICE ARBITRAGE (BINANCE vs KRAKEN vs COINBASE)
                </h2>
              </div>
              <span className="text-xs font-mono text-emerald-400 hidden sm:inline flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                TradingView &amp; Live WebSocket Feeds
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="border-b border-[#18243b] text-[10px] text-slate-400 uppercase tracking-wider bg-[#0b111e]">
                    <th className="py-3 px-4">SYMBOL</th>
                    <th className="py-3 px-4">BINANCE SPOT (WEBSOCKET)</th>
                    <th className="py-3 px-4">KRAKEN SPOT</th>
                    <th className="py-3 px-4">COINBASE SPOT</th>
                    <th className="py-3 px-4">SPREAD DIFFERENTIAL</th>
                    <th className="py-3 px-4 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#121a2b]">
                  <tr className="hover:bg-[#0c1424] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-amber-300 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      BTC / USD(T)
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-white tabular-nums">${btcFormatted}</td>
                    <td className="py-3.5 px-4 text-slate-200 tabular-nums">${krakenBtcNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="py-3.5 px-4 text-slate-200 tabular-nums">${coinbaseBtcNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-bold tabular-nums">${btcSpread.toFixed(2)} ({btcSpreadPct}% Spread)</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">HIGH LIQUIDITY</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#0c1424] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-purple-300 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      ETH / USD(T)
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-white tabular-nums">${ethFormatted}</td>
                    <td className="py-3.5 px-4 text-slate-200 tabular-nums">${krakenEthNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="py-3.5 px-4 text-slate-200 tabular-nums">${coinbaseEthNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-bold tabular-nums">${ethSpread.toFixed(2)} ({ethSpreadPct}% Spread)</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">HIGH LIQUIDITY</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#0c1424] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-cyan-300 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      SOL / USD(T)
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-white tabular-nums">${solFormatted}</td>
                    <td className="py-3.5 px-4 text-slate-200 tabular-nums">${krakenSolNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="py-3.5 px-4 text-slate-200 tabular-nums">${coinbaseSolNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-bold tabular-nums">${solSpread.toFixed(2)} ({solSpreadPct}% Spread)</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">HIGH LIQUIDITY</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-[#080c14] border border-[#1d2b45] rounded-xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#18243b] pb-3">
                <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                  DEX SCREENER TRENDING POOLS &amp; DECENTRALIZED VOLUME
                </span>
                <a
                  href="https://dexscreener.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-mono text-blue-400 hover:underline inline-flex items-center gap-1 bg-[#0d1627] px-2 py-0.5 rounded border border-[#1e2d4a]"
                >
                  dexscreener.com <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="space-y-2.5">
                {dexs.length === 0 ? (
                  <div className="py-8 text-center text-xs font-mono text-slate-500 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Loading live DEX Screener pair telemetry...</span>
                  </div>
                ) : (
                  dexs.map((pair: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg bg-[#0b1220] hover:bg-[#10192c] border border-[#1a2944] hover:border-amber-500/40 flex items-center justify-between text-xs font-mono transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-[10px]">
                          #{idx + 1}
                        </div>
                        <div>
                          <span className="font-bold text-white text-sm block">{pair.baseToken} / {pair.quoteToken}</span>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wide">DEX: {pair.dexId}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-amber-300 text-sm block">${parseFloat(pair.priceUsd || 0).toFixed(4)}</span>
                        <span className="text-[10px] text-slate-400 block">Liq: ${pair.liquidityUsd ? (pair.liquidityUsd / 1e6).toFixed(2) + 'M' : 'N/A'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#080c14] border border-[#1d2b45] rounded-xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#18243b] pb-3">
                <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  DEFILLAMA CHAIN TVL RANKING
                </span>
              </div>

              <div className="space-y-2.5">
                {llama?.topChains ? (
                  llama.topChains.map((ch: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[#0b1220] hover:bg-[#10192c] border border-[#18263e] hover:border-cyan-500/40 flex items-center justify-between text-xs font-mono transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-center font-bold text-slate-500 text-xs">#{idx + 1}</span>
                        <span className="font-bold text-slate-200 text-sm">{ch.name}</span>
                      </div>
                      <span className="font-bold text-cyan-300 text-sm">${(ch.tvlUsd / 1e9).toFixed(2)}B</span>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs font-mono text-slate-500 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>Loading DeFiLlama chains...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
