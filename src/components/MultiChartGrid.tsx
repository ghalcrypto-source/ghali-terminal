import React, { useState } from 'react';
import {
  Grid2X2,
  Columns2,
  Square,
  Columns3,
  Maximize2,
  RotateCcw,
  SlidersHorizontal,
  Flame,
} from 'lucide-react';
import { ChartLayout, ChartSlot, ExchangeId } from '../types/crypto';
import { TradingViewWidget } from './TradingViewWidget';
import { sound } from '../audio/soundEngine';

const AVAILABLE_PAIRS = [
  'BTCUSDT',
  'ETHUSDT',
  'SOLUSDT',
  'BNBUSDT',
  'DOGEUSDT',
  'XRPUSDT',
  'SUIUSDT',
  'PEPEUSDT',
  'AVAXUSDT',
  'LINKUSDT',
];

const TIMEFRAMES = [
  { label: '1m', value: '1' },
  { label: '5m', value: '5' },
  { label: '15m', value: '15' },
  { label: '1h', value: '60' },
  { label: '4h', value: '240' },
  { label: '1D', value: 'D' },
];

interface MultiChartGridProps {
  externalSymbol?: string;
}

export const MultiChartGrid: React.FC<MultiChartGridProps> = ({ externalSymbol }) => {
  const [layout, setLayout] = useState<ChartLayout>('2x1');

  const [slots, setSlots] = useState<ChartSlot[]>([
    {
      id: 'slot-1',
      symbol: externalSymbol || 'BTCUSDT',
      exchange: 'BINANCE',
      interval: '15',
      isFutures: true,
    },
    {
      id: 'slot-2',
      symbol: externalSymbol || 'BTCUSDT',
      exchange: 'BITGET',
      interval: '15',
      isFutures: true,
    },
    {
      id: 'slot-3',
      symbol: 'ETHUSDT',
      exchange: 'BINANCE',
      interval: '60',
      isFutures: true,
    },
    {
      id: 'slot-4',
      symbol: 'SOLUSDT',
      exchange: 'BITGET',
      interval: '60',
      isFutures: true,
    },
  ]);

  React.useEffect(() => {
    if (externalSymbol) {
      setSlots((prev) => [
        { ...prev[0], symbol: externalSymbol },
        { ...prev[1], symbol: externalSymbol },
        prev[2],
        prev[3],
      ]);
    }
  }, [externalSymbol]);

  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);

  const updateSlot = (id: string, updates: Partial<ChartSlot>) => {
    sound.playClick(1100);
    setSlots((prev) =>
      prev.map((slot) => (slot.id === id ? { ...slot, ...updates } : slot))
    );
  };

  const applyPreset = (presetType: 'binance-vs-bitget' | 'majors-quad' | 'sol-eth-btc') => {
    sound.playSonarPing();
    if (presetType === 'binance-vs-bitget') {
      setLayout('2x1');
      setSlots([
        { id: 'slot-1', symbol: 'BTCUSDT', exchange: 'BINANCE', interval: '15', isFutures: true },
        { id: 'slot-2', symbol: 'BTCUSDT', exchange: 'BITGET', interval: '15', isFutures: true },
        slots[2],
        slots[3],
      ]);
    } else if (presetType === 'majors-quad') {
      setLayout('2x2');
      setSlots([
        { id: 'slot-1', symbol: 'BTCUSDT', exchange: 'BINANCE', interval: '60', isFutures: true },
        { id: 'slot-2', symbol: 'ETHUSDT', exchange: 'BITGET', interval: '60', isFutures: true },
        { id: 'slot-3', symbol: 'SOLUSDT', exchange: 'BINANCE', interval: '60', isFutures: true },
        { id: 'slot-4', symbol: 'BNBUSDT', exchange: 'BITGET', interval: '60', isFutures: true },
      ]);
    } else if (presetType === 'sol-eth-btc') {
      setLayout('3x1');
      setSlots([
        { id: 'slot-1', symbol: 'BTCUSDT', exchange: 'BINANCE', interval: '15', isFutures: true },
        { id: 'slot-2', symbol: 'ETHUSDT', exchange: 'BINANCE', interval: '15', isFutures: true },
        { id: 'slot-3', symbol: 'SOLUSDT', exchange: 'BITGET', interval: '15', isFutures: true },
        slots[3],
      ]);
    }
  };

  // Determine which slots to display based on layout
  const visibleSlots = (() => {
    if (layout === '1x1') return [slots[0]];
    if (layout === '2x1') return [slots[0], slots[1]];
    if (layout === '3x1') return [slots[0], slots[1], slots[2]];
    return slots; // 2x2
  })();

  const gridClass = (() => {
    if (layout === '1x1') return 'grid-cols-1 grid-rows-1';
    if (layout === '2x1') return 'grid-cols-1 lg:grid-cols-2 grid-rows-1';
    if (layout === '3x1') return 'grid-cols-1 lg:grid-cols-3 grid-rows-1';
    return 'grid-cols-1 md:grid-cols-2 grid-rows-2'; // 2x2
  })();

  return (
    <div className="w-full h-full flex flex-col bg-[#070a0f] text-slate-100 overflow-hidden">
      {/* Top Multichart Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-2 bg-[#0c101a] border-b border-[#1b253b] z-10 shrink-0">
        {/* Left: Presets & Info */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-[#121826] border border-[#232f48] px-2.5 py-1 rounded text-xs font-mono font-bold text-amber-400">
            <span>MULTICHART SYSTEM</span>
            <span className="text-[10px] text-slate-400 font-normal">BINANCE & BITGET</span>
          </div>

          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase hidden sm:inline">
              PRESETS:
            </span>
            <button
              onClick={() => applyPreset('binance-vs-bitget')}
              className="px-2 py-1 rounded bg-[#121929] hover:bg-[#1b263e] border border-[#1e2a42] text-[11px] font-mono text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Binance vs Bitget BTC
            </button>
            <button
              onClick={() => applyPreset('majors-quad')}
              className="px-2 py-1 rounded bg-[#121929] hover:bg-[#1b263e] border border-[#1e2a42] text-[11px] font-mono text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              4-Majors Quad
            </button>
            <button
              onClick={() => applyPreset('sol-eth-btc')}
              className="px-2 py-1 rounded bg-[#121929] hover:bg-[#1b263e] border border-[#1e2a42] text-[11px] font-mono text-slate-300 hover:text-white transition-colors cursor-pointer hidden md:inline-block"
            >
              BTC • ETH • SOL
            </button>
          </div>
        </div>

        {/* Right: Layout Switcher */}
        <div className="flex items-center gap-1 bg-[#101626] border border-[#1d273d] p-0.5 rounded">
          <button
            onClick={() => {
              sound.playClick();
              setLayout('1x1');
            }}
            title="Single Chart (1x1)"
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              layout === '1x1'
                ? 'bg-amber-500 text-black font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Square className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setLayout('2x1');
            }}
            title="Dual Side-by-Side (2x1)"
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              layout === '2x1'
                ? 'bg-amber-500 text-black font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Columns2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setLayout('3x1');
            }}
            title="Triple Columns (3x1)"
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              layout === '3x1'
                ? 'bg-amber-500 text-black font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Columns3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setLayout('2x2');
            }}
            title="Quad Grid (2x2)"
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              layout === '2x2'
                ? 'bg-amber-500 text-black font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid2X2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid Canvas */}
      <div className={`flex-1 grid ${gridClass} gap-1 p-1 bg-[#06080d] overflow-hidden`}>
        {visibleSlots.map((slot, index) => {
          const isBinance = slot.exchange === 'BINANCE';

          return (
            <div
              key={slot.id}
              className="flex flex-col bg-[#0a0d14] border border-[#182236] rounded overflow-hidden relative shadow-lg min-h-[260px]"
            >
              {/* Header toolbar for each slot */}
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#0f1420] border-b border-[#1a253a] text-xs font-mono shrink-0">
                {/* Left: Pair & Exchange */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500">#{index + 1}</span>

                  {/* Pair selector */}
                  <select
                    value={slot.symbol}
                    onChange={(e) => updateSlot(slot.id, { symbol: e.target.value })}
                    className="bg-[#151c2d] text-slate-100 border border-[#23314d] rounded px-1.5 py-0.5 text-xs font-bold font-mono outline-none cursor-pointer hover:border-amber-400"
                  >
                    {AVAILABLE_PAIRS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>

                  {/* Exchange Toggle */}
                  <button
                    onClick={() =>
                      updateSlot(slot.id, {
                        exchange: isBinance ? 'BITGET' : 'BINANCE',
                      })
                    }
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer border ${
                      isBinance
                        ? 'bg-[#f3ba2f]/15 text-[#f3ba2f] border-[#f3ba2f]/40 hover:bg-[#f3ba2f]/25'
                        : 'bg-[#00f0ff]/15 text-[#00f0ff] border-[#00f0ff]/40 hover:bg-[#00f0ff]/25'
                    }`}
                  >
                    {slot.exchange}
                  </button>

                  {/* Market type: Perp / Spot */}
                  <button
                    onClick={() => updateSlot(slot.id, { isFutures: !slot.isFutures })}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition-colors cursor-pointer ${
                      slot.isFutures
                        ? 'bg-amber-950/40 text-amber-300 border-amber-600/40'
                        : 'bg-[#182236] text-slate-300 border-[#283958]'
                    }`}
                  >
                    {slot.isFutures ? 'PERP / FUTURES' : 'SPOT'}
                  </button>
                </div>

                {/* Right: Timeframes & Fullscreen */}
                <div className="flex items-center gap-1">
                  <div className="flex items-center bg-[#131a29] border border-[#1e2a42] rounded px-0.5 py-0.5">
                    {TIMEFRAMES.map((tf) => (
                      <button
                        key={tf.value}
                        onClick={() => updateSlot(slot.id, { interval: tf.value })}
                        className={`px-1.5 py-0.2 rounded text-[10px] transition-colors cursor-pointer ${
                          slot.interval === tf.value
                            ? 'bg-amber-500 text-black font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {tf.label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      sound.playClick();
                      // Set as single chart
                      if (layout === '1x1') {
                        setLayout('2x1');
                      } else {
                        // Move this slot to index 0 and switch to 1x1
                        const reordered = [slot, ...slots.filter((s) => s.id !== slot.id)];
                        setSlots(reordered);
                        setLayout('1x1');
                      }
                    }}
                    title={layout === '1x1' ? 'Restore Multichart' : 'Maximize Chart'}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#1a2336] cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Chart Canvas Embed */}
              <div className="flex-1 w-full h-full relative overflow-hidden">
                <TradingViewWidget
                  symbol={slot.symbol}
                  exchange={slot.exchange}
                  interval={slot.interval}
                  isFutures={slot.isFutures}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
