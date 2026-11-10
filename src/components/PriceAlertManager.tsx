import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { CRYPTO_50_COINS } from '../types/crypto';
import { sound } from '../audio/soundEngine';

export interface PriceAlert {
  id: string;
  symbol: string; // e.g. BTCUSDT
  targetPrice: number;
  direction: 'ABOVE' | 'BELOW';
  createdAt: number;
  triggered?: boolean;
}

interface PriceAlertManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCoinToChart: (symbol: string) => void;
}

export const PriceAlertManager: React.FC<PriceAlertManagerProps> = ({
  isOpen,
  onClose,
  onSelectCoinToChart,
}) => {
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => {
    try {
      const saved = localStorage.getItem('ghali_price_alerts');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [
      {
        id: 'alert-1',
        symbol: 'BTCUSDT',
        targetPrice: 95000,
        direction: 'ABOVE',
        createdAt: Date.now() - 3600000,
      },
      {
        id: 'alert-2',
        symbol: 'ETHUSDT',
        targetPrice: 3400,
        direction: 'BELOW',
        createdAt: Date.now() - 7200000,
      },
    ];
  });

  const [notifications, setNotifications] = useState<
    { id: string; message: string; time: string; type: 'up' | 'down' }[]
  >([]);

  const [selectedCoin, setSelectedCoin] = useState('BTCUSDT');
  const [targetPriceInput, setTargetPriceInput] = useState('95000');
  const [direction, setDirection] = useState<'ABOVE' | 'BELOW'>('ABOVE');

  // Save alerts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ghali_price_alerts', JSON.stringify(alerts));
    } catch (_) {}
  }, [alerts]);

  // Simulate real-time price fluctuation and $1 movement detector
  useEffect(() => {
    const timer = setInterval(() => {
      // Pick a random coin from 50 coins to simulate a $1+ price tick
      const randomCoin = CRYPTO_50_COINS[Math.floor(Math.random() * CRYPTO_50_COINS.length)];
      const delta = (Math.random() * 4 - 1.95); // e.g. -1.95 to +2.05 ($1+ movement)
      if (Math.abs(delta) >= 1.0) {
        const isUp = delta > 0;
        const msg = `${randomCoin.symbol} bergerak ${isUp ? 'NAIK' : 'TURUN'} sebesar $${Math.abs(delta).toFixed(2)} (Harga terkini: $${(randomCoin.basePriceUSD + delta).toLocaleString()})`;
        
        sound.playDialTick();

        setNotifications((prev) => [
          {
            id: Math.random().toString(),
            message: msg,
            time: new Date().toLocaleTimeString(),
            type: isUp ? 'up' : 'down',
          },
          ...prev.slice(0, 15), // keep last 15
        ]);
      }
    }, 5000); // every 5 seconds check $1 tick

    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(targetPriceInput);
    if (isNaN(price) || price <= 0) return;

    sound.playClick(1400);
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
    sound.playClick();
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-none">
      <div className="bg-[#0b0f18] border border-[#23314d] rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1c273e] bg-[#0e1422]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-red-500/10 border border-red-500/30">
              <BellRing className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold tracking-wider text-slate-100">
                PUSAT ALERT & NOTIFIKASI PERGERAKAN $1
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                Notifikasi instan setiap koin naik atau turun $1 • Target Harga Kustom • Log Real-Time
              </p>
            </div>
          </div>
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

        {/* Content Layout */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left Column: Create Custom Price Alert */}
          <div className="space-y-4">
            <div className="bg-[#0e1422] border border-[#1f2b42] rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-mono font-bold text-amber-300 uppercase flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                TAMBAH TARGET ALERT HARGA KUSTOM
              </h3>

              <form onSubmit={handleAddAlert} className="space-y-3 font-mono text-xs">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">
                    Pilih Koin (50 Koin)
                  </label>
                  <select
                    value={selectedCoin}
                    onChange={(e) => setSelectedCoin(e.target.value)}
                    className="w-full bg-[#080c14] border border-[#212d48] rounded px-3 py-2 text-white outline-none cursor-pointer"
                  >
                    {CRYPTO_50_COINS.map((c) => (
                      <option key={c.pair} value={c.pair}>
                        {c.symbol} ({c.name}) • ${c.basePriceUSD.toLocaleString()}
                      </option>
                    ))}
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
                      placeholder="e.g. 96000"
                      className="w-full bg-[#080c14] border border-[#212d48] rounded px-3 py-2 text-white outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold py-2.5 rounded transition-all cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4 text-black" />
                  <span>BUAT ALERT HARGA BARU</span>
                </button>
              </form>
            </div>

            {/* Active Custom Alerts List */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Daftar Target Alert Aktif ({alerts.length}):
              </span>

              {alerts.length === 0 ? (
                <div className="bg-[#0e1422] p-4 rounded-xl border border-[#1a243a] text-center text-xs font-mono text-slate-500">
                  Belum ada target alert kustom.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {alerts.map((a) => (
                    <div
                      key={a.id}
                      className="bg-[#0e1422] border border-[#1e2a42] rounded-lg p-3 flex items-center justify-between text-xs font-mono"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-300">{a.symbol}</span>
                          <span className="text-[10px] bg-[#162035] px-1.5 py-0.2 rounded text-slate-300 border border-[#253452]">
                            {a.direction === 'ABOVE' ? '≥ Kenaikan' : '≤ Penurunan'}
                          </span>
                        </div>
                        <div className="text-sm font-bold text-white mt-0.5">
                          ${a.targetPrice.toLocaleString()}
                        </div>
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
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Real-Time $1 Price Fluctuation Notification Log */}
          <div className="bg-[#0e1422] border border-[#1f2b42] rounded-xl p-4 flex flex-col h-[420px]">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a253a] mb-3">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
                LOG NOTIFIKASI FLUKTUASI $1 (REAL-TIME)
              </span>
              <span className="text-[10px] font-mono bg-cyan-950/60 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
                AKTIF // 50 KOIN
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {notifications.length === 0 ? (
                <div className="py-20 text-center text-xs font-mono text-slate-500">
                  Menunggu pergerakan $1 pada koin-koin terpantau...
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-lg border text-xs font-mono flex items-start gap-2.5 ${
                      n.type === 'up'
                        ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                        : 'bg-red-950/20 border-red-800/40 text-red-300'
                    }`}
                  >
                    {n.type === 'up' ? (
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
