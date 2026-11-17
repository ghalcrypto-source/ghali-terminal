import React, { useEffect, useState, useRef } from 'react';
import {
  Bell,
  BellRing,
  Trash2,
  Plus,
  X,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Volume2,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { CRYPTO_50_COINS } from '../types/crypto';
import { sound } from '../audio/soundEngine';

export interface PriceAlert {
  id: string;
  symbol: string; // e.g. BTCUSDT
  targetPrice: number;
  direction: 'ABOVE' | 'BELOW';
  createdAt: number;
  lastTriggered?: number;
  isTriggered?: boolean;
}

interface PriceAlertManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCoinToChart: (symbol: string) => void;
  alertSoundEnabled?: boolean;
  onToggleAlertSound?: () => void;
}

interface LiveCoinTicker {
  price: number;
  change24h: number;
  prevPrice?: number;
}

export const PriceAlertManager: React.FC<PriceAlertManagerProps> = ({
  isOpen,
  onClose,
  onSelectCoinToChart,
  alertSoundEnabled = true,
  onToggleAlertSound,
}) => {
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => {
    try {
      const saved = localStorage.getItem('ghali_price_alerts_v2');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [
      {
        id: 'alert-btc',
        symbol: 'BTCUSDT',
        targetPrice: 66000,
        direction: 'ABOVE',
        createdAt: Date.now() - 3600000,
      },
      {
        id: 'alert-eth',
        symbol: 'ETHUSDT',
        targetPrice: 1800,
        direction: 'BELOW',
        createdAt: Date.now() - 7200000,
      },
    ];
  });

  const [livePrices, setLivePrices] = useState<Record<string, LiveCoinTicker>>({});
  const [wsConnected, setWsConnected] = useState(false);
  const [notifications, setNotifications] = useState<
    { id: string; message: string; time: string; type: 'up' | 'down' | 'alert' }[]
  >([]);
  const [autoTickChime, setAutoTickChime] = useState(false);

  const [selectedCoin, setSelectedCoin] = useState('BTCUSDT');
  const [targetPriceInput, setTargetPriceInput] = useState('');
  const [direction, setDirection] = useState<'ABOVE' | 'BELOW'>('ABOVE');

  const triggeredCooldownRef = useRef<Record<string, number>>({});
  const prevPriceRef = useRef<Record<string, number>>({});

  // 1. Save alerts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ghali_price_alerts_v2', JSON.stringify(alerts));
    } catch (_) {}
  }, [alerts]);

  // 2. Real-time Live Price Feed from Binance WebSocket (matching TradingView)
  useEffect(() => {
    let ws: WebSocket | null = null;
    let isSubscribed = true;

    // Fetch initial snapshot so prices show up immediately
    fetch('https://api.binance.com/api/v3/ticker/24hr')
      .then((res) => res.json())
      .then((data: any[]) => {
        if (Array.isArray(data) && isSubscribed) {
          const map: Record<string, LiveCoinTicker> = {};
          data.forEach((d) => {
            const sym = d.symbol;
            if (sym.endsWith('USDT')) {
              map[sym] = {
                price: parseFloat(d.lastPrice),
                change24h: parseFloat(d.priceChangePercent),
              };
              prevPriceRef.current[sym] = parseFloat(d.lastPrice);
            }
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
            const arr = JSON.parse(event.data);
            if (!Array.isArray(arr)) return;

            const updates: Record<string, LiveCoinTicker> = {};
            const now = Date.now();

            arr.forEach((item: any) => {
              const sym = item.s;
              if (sym && sym.endsWith('USDT')) {
                const currentPrice = parseFloat(item.c);
                const prev = prevPriceRef.current[sym] || currentPrice;
                const change24h = ((currentPrice - parseFloat(item.o)) / (parseFloat(item.o) || 1)) * 100;

                updates[sym] = {
                  price: currentPrice,
                  change24h,
                  prevPrice: prev,
                };

                // Check active custom alerts against this live price tick
                alerts.forEach((alert) => {
                  if (alert.symbol === sym) {
                    const lastTrig = triggeredCooldownRef.current[alert.id] || 0;
                    const canTrigger = now - lastTrig > 45000; // 45s cooldown per alert

                    const isAboveTrigger = alert.direction === 'ABOVE' && currentPrice >= alert.targetPrice;
                    const isBelowTrigger = alert.direction === 'BELOW' && currentPrice <= alert.targetPrice;

                    if ((isAboveTrigger || isBelowTrigger) && canTrigger) {
                      triggeredCooldownRef.current[alert.id] = now;
                      if (alertSoundEnabled) {
                        sound.playCekring(true);
                      }
                      setNotifications((prev) => [
                        {
                          id: Math.random().toString(),
                          message: `🎯 TARGET TERCAPAI! ${alert.symbol} menembus ${alert.direction === 'ABOVE' ? '≥' : '≤'} $${alert.targetPrice.toLocaleString()} (Harga Live: $${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`,
                          time: new Date().toLocaleTimeString('id-ID'),
                          type: 'alert',
                        },
                        ...prev.slice(0, 25),
                      ]);
                    }
                  }
                });

                // Generate real live price fluctuation notice if large tick movement occurs
                const diff = Math.abs(currentPrice - prev);
                const pctDiff = Math.abs((currentPrice - prev) / (prev || 1)) * 100;
                if (pctDiff >= 0.15 && ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'DOGEUSDT', 'SUIUSDT', 'ADAUSDT'].includes(sym)) {
                  const isUp = currentPrice > prev;
                  if (autoTickChime && alertSoundEnabled) {
                    sound.playCekring();
                  }
                  setNotifications((prevList) => [
                    {
                      id: Math.random().toString(),
                      message: `${sym} bergerak ${isUp ? 'NAIK' : 'TURUN'} ke $${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${isUp ? '+' : '-'}$${diff.toFixed(2)}) • Live TV Sync`,
                      time: new Date().toLocaleTimeString('id-ID'),
                      type: isUp ? 'up' : 'down',
                    },
                    ...prevList.slice(0, 25),
                  ]);
                }

                prevPriceRef.current[sym] = currentPrice;
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
  }, [alerts, alertSoundEnabled, autoTickChime]);

  // Set default target price when coin changes
  useEffect(() => {
    const cur = livePrices[selectedCoin]?.price;
    if (cur && !targetPriceInput) {
      const suggested = direction === 'ABOVE' ? cur * 1.02 : cur * 0.98;
      setTargetPriceInput(suggested > 10 ? suggested.toFixed(2) : suggested.toFixed(4));
    }
  }, [selectedCoin, livePrices, direction, targetPriceInput]);

  if (!isOpen) return null;

  const currentSelectedPrice = livePrices[selectedCoin]?.price;

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(targetPriceInput);
    if (isNaN(price) || price <= 0) return;

    if (alertSoundEnabled) {
      sound.playCekring();
    }
    const newAlert: PriceAlert = {
      id: Math.random().toString(36).substring(2, 9),
      symbol: selectedCoin,
      targetPrice: price,
      direction,
      createdAt: Date.now(),
    };

    setAlerts((prev) => [newAlert, ...prev]);
    setTargetPriceInput('');
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-none">
      <div className="bg-[#0b0f18] border border-[#23314d] rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 border-b border-[#1c273e] bg-[#0e1422]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/30">
              <BellRing className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-mono font-bold tracking-wider text-slate-100">
                  PUSAT ALERT &amp; NOTIFIKASI HARGA REAL-TIME
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-bold">
                  <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                  {wsConnected ? 'TRADINGVIEW & WS REAL-TIME SYNC' : 'CONNECTING LIVE FEED'}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1 font-bold ${
                    alertSoundEnabled
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800/70 text-slate-400 border-slate-700'
                  }`}
                >
                  {alertSoundEnabled ? '🔔 SUARA ALERT: AKTIF' : '🔇 SUARA: MATI'}
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                Peringatan otomatis berbunyi instan saat harga live menyentuh target kustom Anda
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onToggleAlertSound && (
              <button
                onClick={onToggleAlertSound}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold rounded border transition-colors cursor-pointer ${
                  alertSoundEnabled
                    ? 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border-emerald-600/50'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-700'
                }`}
                title="Nyalakan / Matikan Suara Alert"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{alertSoundEnabled ? 'Suara: ON' : 'Suara: OFF'}</span>
              </button>
            )}
            <button
              onClick={() => sound.playCekring(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 rounded transition-colors cursor-pointer"
              title="Klik untuk mendengarkan nada notifikasi"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Tes Cekring 🔔</span>
            </button>
            <button
              onClick={() => setAutoTickChime((prev) => !prev)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold rounded border transition-colors cursor-pointer ${
                autoTickChime
                  ? 'bg-cyan-950/60 text-cyan-300 border-cyan-600/50'
                  : 'bg-[#121929] text-slate-400 border-[#25324e] hover:text-slate-200'
              }`}
              title="Aktifkan bunyi cekring otomatis setiap pergerakan pasar signifikan"
            >
              <span>{autoTickChime ? 'Auto Chime: ON' : 'Auto Chime: OFF'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded border border-[#25324e] hover:bg-[#1a2336] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left Column: Create Custom Price Alert */}
          <div className="space-y-4">
            <div className="bg-[#0e1422] border border-[#1f2b42] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold text-amber-300 uppercase flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-amber-400" />
                  TAMBAH TARGET ALERT HARGA KUSTOM
                </h3>
                {currentSelectedPrice && (
                  <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800">
                    Live: ${currentSelectedPrice >= 10 ? currentSelectedPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : currentSelectedPrice.toFixed(4)}
                  </span>
                )}
              </div>

              <form onSubmit={handleAddAlert} className="space-y-3 font-mono text-xs">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">
                    Pilih Koin (Live Real-Time)
                  </label>
                  <select
                    value={selectedCoin}
                    onChange={(e) => {
                      setSelectedCoin(e.target.value);
                      const p = livePrices[e.target.value]?.price;
                      if (p) {
                        setTargetPriceInput(direction === 'ABOVE' ? (p * 1.02).toFixed(2) : (p * 0.98).toFixed(2));
                      }
                    }}
                    className="w-full bg-[#080c14] border border-[#212d48] rounded px-3 py-2 text-white outline-none cursor-pointer"
                  >
                    {CRYPTO_50_COINS.map((c) => {
                      const lp = livePrices[c.pair]?.price || c.basePriceUSD;
                      return (
                        <option key={c.pair} value={c.pair}>
                          {c.symbol} ({c.name}) • ${lp >= 10 ? lp.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : lp.toFixed(4)}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1">
                      Kondisi Trigger
                    </label>
                    <select
                      value={direction}
                      onChange={(e) => setDirection(e.target.value as any)}
                      className="w-full bg-[#080c14] border border-[#212d48] rounded px-3 py-2 text-white outline-none cursor-pointer"
                    >
                      <option value="ABOVE">Harga Di Atas (&gt;=)</option>
                      <option value="BELOW">Harga Di Bawah (&lt;=)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1">
                      Target Harga ($ USD)
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={targetPriceInput}
                      onChange={(e) => setTargetPriceInput(e.target.value)}
                      placeholder="e.g. 68000"
                      className="w-full bg-[#080c14] border border-[#212d48] rounded px-3 py-2 text-white outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold py-2.5 rounded transition-all cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4 text-black" />
                  <span>BUAT ALERT HARGA REAL-TIME</span>
                </button>
              </form>
            </div>

            {/* Active Custom Alerts List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                  Daftar Target Alert Aktif ({alerts.length}):
                </span>
                <span className="text-[10px] font-mono text-emerald-400">
                  {wsConnected ? '● Live Monitoring' : '○ Standby'}
                </span>
              </div>

              {alerts.length === 0 ? (
                <div className="bg-[#0e1422] p-4 rounded-xl border border-[#1a243a] text-center text-xs font-mono text-slate-500">
                  Belum ada target alert kustom.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {alerts.map((a) => {
                    const current = livePrices[a.symbol]?.price;
                    const diff = current ? current - a.targetPrice : null;
                    const diffPct = current ? ((diff! / a.targetPrice) * 100).toFixed(2) : null;
                    const isReached =
                      current &&
                      (a.direction === 'ABOVE' ? current >= a.targetPrice : current <= a.targetPrice);

                    return (
                      <div
                        key={a.id}
                        className={`border rounded-lg p-3 flex items-center justify-between text-xs font-mono transition-colors ${
                          isReached
                            ? 'bg-emerald-950/30 border-emerald-500/50'
                            : 'bg-[#0e1422] border-[#1e2a42]'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-amber-300">{a.symbol}</span>
                            <span className="text-[10px] bg-[#162035] px-1.5 py-0.2 rounded text-slate-300 border border-[#253452]">
                              {a.direction === 'ABOVE' ? '≥ Kenaikan' : '≤ Penurunan'}
                            </span>
                            {isReached && (
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold animate-pulse">
                                HIT
                              </span>
                            )}
                          </div>
                          <div className="text-sm font-bold text-white">
                            Target: ${a.targetPrice.toLocaleString()}
                          </div>
                          {current && (
                            <div className="text-[10px] text-slate-400 flex items-center gap-2">
                              <span>Live: ${current >= 10 ? current.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : current.toFixed(4)}</span>
                              <span className={diff! >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                ({diff! >= 0 ? '+' : ''}{diffPct}%)
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              sound.playClick();
                              onSelectCoinToChart(a.symbol);
                              onClose();
                            }}
                            className="px-2 py-1 rounded bg-[#131b2c] hover:bg-[#1a253e] text-slate-300 border border-[#212d46] text-[10px] cursor-pointer"
                          >
                            CHART
                          </button>
                          <button
                            onClick={() => handleDeleteAlert(a.id)}
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded border border-red-900/40 cursor-pointer"
                            title="Hapus Alert"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Real-Time Market Notification Log */}
          <div className="bg-[#0e1422] border border-[#1f2b42] rounded-xl p-4 flex flex-col h-[420px]">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a253a] mb-3">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
                LOG PERGERAKAN HARGA REAL-TIME
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setNotifications([])}
                  className="text-[10px] text-slate-400 hover:text-white"
                >
                  Bersihkan
                </button>
                <span className="text-[10px] font-mono bg-cyan-950/60 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
                  LIVE STREAMING
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {notifications.length === 0 ? (
                <div className="py-20 text-center text-xs font-mono text-slate-500">
                  Menunggu pergerakan pasar atau target alert tercapai...
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-lg border text-xs font-mono flex items-start gap-2.5 ${
                      n.type === 'alert'
                        ? 'bg-amber-950/30 border-amber-500/60 text-amber-200'
                        : n.type === 'up'
                        ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                        : 'bg-red-950/20 border-red-800/40 text-red-300'
                    }`}
                  >
                    {n.type === 'alert' ? (
                      <BellRing className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-bounce" />
                    ) : n.type === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold">{n.message}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{n.time}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
