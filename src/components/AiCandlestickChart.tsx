import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  createChart,
  CandlestickSeries,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  Time,
} from 'lightweight-charts';
import {
  Sparkles,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  EyeOff,
  Trash2,
} from 'lucide-react';
import { ExchangeId, AiChartDrawingResult, CandleBar } from '../types/crypto';
import { sound } from '../audio/soundEngine';

interface AiCandlestickChartProps {
  symbol: string;
  exchange: ExchangeId;
  interval: string;
  isFutures: boolean;
}

function mapIntervalToBinanceWs(interval: string): string {
  switch (String(interval)) {
    case '1':
      return '1m';
    case '5':
      return '5m';
    case '15':
      return '15m';
    case '60':
      return '1h';
    case '240':
      return '4h';
    case 'D':
    case '1D':
      return '1d';
    default:
      return '15m';
  }
}

function fmtPrice(p: number): string {
  if (p >= 1000) return p.toLocaleString('en-US', { maximumFractionDigits: 1 });
  if (p >= 1) return p.toFixed(3);
  if (p >= 0.01) return p.toFixed(5);
  return p.toFixed(7);
}

export const AiCandlestickChart: React.FC<AiCandlestickChartProps> = ({
  symbol,
  exchange,
  interval,
  isFutures,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const chartMountRef = useRef<HTMLDivElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick', Time> | null>(null);

  const [candles, setCandles] = useState<CandleBar[]>([]);
  const candlesRef = useRef<CandleBar[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [drawingResult, setDrawingResult] = useState<AiChartDrawingResult | null>(null);
  const drawingRef = useRef<AiChartDrawingResult | null>(null);
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'fibonacci' | 'elliott' | 'trendline' | 'ict' | 'snr'
  >('all');
  const [showHudSummary, setShowHudSummary] = useState<boolean>(true);
  const [showDrawings, setShowDrawings] = useState<boolean>(true);
  const showDrawingsRef = useRef<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    candlesRef.current = candles;
  }, [candles]);

  useEffect(() => {
    drawingRef.current = drawingResult;
  }, [drawingResult]);

  useEffect(() => {
    showDrawingsRef.current = showDrawings;
  }, [showDrawings]);

  // Helper to convert (time, price) -> (x, y) pixel coordinates synced to lightweight-charts
  const renderOverlay = useCallback(() => {
    const canvas = overlayCanvasRef.current;
    const chart = chartInstanceRef.current;
    const series = candleSeriesRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !chart || !series || !wrapper) return;

    const dpr = window.devicePixelRatio || 1;
    const width = wrapper.clientWidth;
    const height = wrapper.clientHeight;
    if (width <= 0 || height <= 0) return;

    if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const drawing = drawingRef.current;
    const barList = candlesRef.current;
    if (!drawing || !showDrawingsRef.current || barList.length < 2) return;

    const timeScale = chart.timeScale();
    const plotRightEdge = Math.max(40, width - 64);

    // Reference anchor for future timestamp extrapolation
    const lastBar = barList[barList.length - 1];
    const prevBar = barList[Math.max(0, barList.length - 10)];
    const lastX = timeScale.timeToCoordinate(lastBar.time as Time);
    const prevX = timeScale.timeToCoordinate(prevBar.time as Time);
    const dt = Math.max(1, lastBar.time - prevBar.time);
    const pxPerSec =
      lastX !== null && prevX !== null ? (lastX - prevX) / dt : 0.008;

    const toX = (t: number): number | null => {
      const direct = timeScale.timeToCoordinate(t as Time);
      if (direct !== null) return direct;
      if (lastX !== null && t >= lastBar.time) {
        return Math.min(plotRightEdge, lastX + (t - lastBar.time) * pxPerSec);
      }
      if (prevX !== null && t < barList[0].time) {
        const firstX = timeScale.timeToCoordinate(barList[0].time as Time);
        if (firstX !== null) return firstX - (barList[0].time - t) * pxPerSec;
      }
      return null;
    };

    const toY = (p: number): number | null => {
      return series.priceToCoordinate(p);
    };

    // 1. ZONES (ICT Order Blocks, FVG, SnR Supply/Demand)
    for (const z of drawing.zones || []) {
      const yTop = toY(z.topPrice);
      const yBot = toY(z.bottomPrice);
      if (yTop === null || yBot === null) continue;
      const x1Raw = toX(z.startTime);
      const x2Raw = toX(z.endTime);
      const x1 = x1Raw !== null ? Math.max(0, x1Raw) : 20;
      const x2 = x2Raw !== null ? Math.min(plotRightEdge, x2Raw) : plotRightEdge;
      if (x2 <= x1) continue;

      const boxTop = Math.min(yTop, yBot);
      const boxHeight = Math.max(4, Math.abs(yBot - yTop));
      const color = z.color || '#22d3ee';
      const alpha = z.fillAlpha ?? 0.16;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.fillRect(x1, boxTop, x2 - x1, boxHeight);

      ctx.globalAlpha = 0.78;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.strokeRect(x1, boxTop, x2 - x1, boxHeight);

      // Zone badge label
      ctx.font = '600 10px "JetBrains Mono", monospace';
      const textWidth = ctx.measureText(z.label).width;
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = '#080d17';
      ctx.fillRect(x1 + 4, boxTop + 2, textWidth + 8, 14);
      ctx.globalAlpha = 1;
      ctx.fillStyle = color;
      ctx.fillText(z.label, x1 + 8, boxTop + 12);
      ctx.restore();
    }

    // 2. FIBONACCI RETRACEMENT + GOLDEN POCKET BAND
    for (const fib of drawing.fibs || []) {
      const x1Raw = toX(fib.startTime);
      const x1 = x1Raw !== null ? Math.max(0, Math.min(x1Raw, plotRightEdge - 80)) : 24;
      const x2 = plotRightEdge;

      // Golden Pocket shading between 0.618 and 0.650
      const gp618 = fib.levels.find((l) => Math.abs(l.ratio - 0.618) < 0.01);
      const gp650 = fib.levels.find((l) => Math.abs(l.ratio - 0.65) < 0.01);
      if (gp618 && gp650) {
        const y618 = toY(gp618.price);
        const y650 = toY(gp650.price);
        if (y618 !== null && y650 !== null) {
          const gpTop = Math.min(y618, y650);
          const gpH = Math.max(3, Math.abs(y650 - y618));
          ctx.save();
          ctx.fillStyle = 'rgba(245, 158, 11, 0.18)';
          ctx.fillRect(x1, gpTop, x2 - x1, gpH);
          ctx.restore();
        }
      }

      for (const lvl of fib.levels) {
        const y = toY(lvl.price);
        if (y === null || y < 8 || y > height - 24) continue;
        const isGolden = lvl.highlight;
        const lineColor = isGolden
          ? '#f59e0b'
          : lvl.ratio === 0 || lvl.ratio === 1
          ? '#94a3b8'
          : lvl.ratio === 0.5
          ? '#38bdf8'
          : 'rgba(148, 163, 184, 0.55)';

        ctx.save();
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = isGolden ? 1.5 : 1;
        ctx.setLineDash(isGolden ? [] : [5, 4]);
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.stroke();

        // Ratio + Price Tag
        const tag = `${lvl.label} ($${fmtPrice(lvl.price)})`;
        ctx.font = `${isGolden ? '700' : '500'} 10px "JetBrains Mono", monospace`;
        const tw = ctx.measureText(tag).width;
        const labelX = Math.max(x1 + 4, x2 - tw - 10);
        ctx.fillStyle = 'rgba(7, 10, 15, 0.85)';
        ctx.fillRect(labelX - 3, y - 12, tw + 6, 12);
        ctx.fillStyle = isGolden ? '#fbbf24' : '#cbd5e1';
        ctx.fillText(tag, labelX, y - 3);
        ctx.restore();
      }
    }

    // 3. TRENDLINES & ICT STRUCTURAL LINES (BOS / CHoCH / BSL / SSL / SnR Mid)
    for (const line of drawing.lines || []) {
      if (!line.points || line.points.length < 2) continue;
      const p0 = line.points[0];
      const p1 = line.points[line.points.length - 1];
      const x0 = toX(p0.time);
      const y0 = toY(p0.price);
      const x1 = toX(p1.time);
      const y1 = toY(p1.price);
      if (x0 === null || y0 === null || x1 === null || y1 === null) continue;

      let endX = x1;
      let endY = y1;
      if (line.extendRight && Math.abs(x1 - x0) > 2) {
        const slope = (y1 - y0) / (x1 - x0);
        endX = plotRightEdge;
        endY = y0 + slope * (endX - x0);
      }

      const color = line.color || '#10b981';
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = line.width || 1.8;
      if (line.style === 'dashed') ctx.setLineDash([6, 4]);
      else if (line.style === 'dotted') ctx.setLineDash([2, 3]);
      else ctx.setLineDash([]);

      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Anchor dots
      ctx.setLineDash([]);
      ctx.fillStyle = color;
      [
        [x0, y0],
        [x1, y1],
      ].forEach(([cx, cy]) => {
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Line label near end point
      if (line.label) {
        ctx.font = '600 10px "JetBrains Mono", monospace';
        const tw = ctx.measureText(line.label).width;
        const lx = Math.min(plotRightEdge - tw - 6, Math.max(8, (x0 + endX) / 2 - tw / 2));
        const ly = Math.max(16, Math.min(height - 28, (y0 + endY) / 2 - 6));
        ctx.fillStyle = 'rgba(7, 10, 15, 0.88)';
        ctx.fillRect(lx - 4, ly - 10, tw + 8, 13);
        ctx.fillStyle = color;
        ctx.fillText(line.label, lx, ly);
      }
      ctx.restore();
    }

    // 4. ELLIOTT WAVE PATHS & CIRCLED WAVE NODES
    for (const wave of drawing.waves || []) {
      const pts = wave.points || [];
      if (pts.length < 2) continue;
      const color = wave.color || '#a78bfa';

      const coords = pts
        .map((pt) => {
          const x = toX(pt.time);
          const y = toY(pt.price);
          return x !== null && y !== null ? { ...pt, x, y } : null;
        })
        .filter(Boolean) as Array<{
        x: number;
        y: number;
        waveLabel: string;
        isProjected?: boolean;
      }>;

      if (coords.length < 2) continue;

      ctx.save();
      for (let i = 1; i < coords.length; i++) {
        const a = coords[i - 1];
        const b = coords[i];
        ctx.strokeStyle = b.isProjected ? '#f59e0b' : color;
        ctx.lineWidth = 2.2;
        ctx.setLineDash(b.isProjected ? [5, 4] : []);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // Draw wave badges (0), (1), (2), (3), (4), (5)
      ctx.setLineDash([]);
      coords.forEach((pt, idx) => {
        const isPeak =
          idx > 0 && idx < coords.length - 1
            ? pt.y < coords[idx - 1].y
            : idx % 2 === 1;
        const badgeColor = pt.isProjected ? '#f59e0b' : color;

        ctx.fillStyle = badgeColor;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fill();

        const labelY = isPeak ? Math.max(14, pt.y - 16) : Math.min(height - 22, pt.y + 16);
        ctx.font = '700 10px "JetBrains Mono", monospace';
        const tw = ctx.measureText(pt.waveLabel).width;
        const rx = pt.x - tw / 2 - 5;
        const ry = labelY - 9;

        ctx.fillStyle = '#090d16';
        ctx.strokeStyle = badgeColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(rx, ry, tw + 10, 15, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.fillText(pt.waveLabel, pt.x - tw / 2, labelY + 2);
      });
      ctx.restore();
    }

    // 5. ACTION MARKERS (AI LONG / AI SHORT / AI WAIT)
    for (const m of drawing.markers || []) {
      const mx = toX(m.time);
      const my = toY(m.price);
      if (mx === null || my === null) continue;
      const color = m.color || '#10b981';
      const offsetY = m.position === 'above' ? my - 22 : my + 22;

      ctx.save();
      ctx.font = '700 10px "JetBrains Mono", monospace';
      const tw = ctx.measureText(m.text).width;
      const bx = Math.min(plotRightEdge - tw - 12, Math.max(6, mx - tw / 2 - 5));
      const by = Math.max(10, Math.min(height - 26, offsetY - 8));

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(bx, by, tw + 10, 16, 4);
      ctx.fill();

      ctx.fillStyle = '#05080d';
      ctx.fillText(m.text, bx + 5, by + 11.5);
      ctx.restore();
    }
  }, []);

  const runAiDrawing = async (candleData: CandleBar[], mode: string, promptText: string) => {
    if (candleData.length === 0) return;
    setAnalyzing(true);
    setShowDrawings(true);
    try {
      const res = await fetch('/api/crypto/ai-chart-draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          exchange,
          interval,
          isFutures,
          mode,
          prompt: promptText,
          candles: candleData,
        }),
      });
      const data = await res.json();
      if (data.success && data.drawing) {
        setDrawingResult(data.drawing);
        drawingRef.current = data.drawing;
        showDrawingsRef.current = true;
        requestAnimationFrame(renderOverlay);
        sound.playCekring(true);
      } else {
        setErrorMsg(data.error || 'Gagal menghasilkan analisis teknikal AI.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error AI request.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Fetch historical klines + trigger initial AI technical draw
  const fetchCandles = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(
        `/api/crypto/klines?symbol=${encodeURIComponent(
          symbol
        )}&exchange=${exchange}&interval=${interval}&isFutures=${isFutures}&limit=180`
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.candles) && data.candles.length > 10) {
        setCandles(data.candles);
        candlesRef.current = data.candles;
        runAiDrawing(data.candles, selectedCategory, userPrompt);
      } else {
        setErrorMsg('Gagal memuat data candlestick.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Koneksi ke server candlestick gagal.');
    } finally {
      setLoading(false);
    }
  }, [symbol, exchange, interval, isFutures]);

  useEffect(() => {
    fetchCandles();
  }, [fetchCandles]);

  // Real-time Binance WebSocket tick update on rightmost candlestick
  useEffect(() => {
    const cleanPair = symbol.toLowerCase().replace(/[^a-z0-9]/g, '') || 'btcusdt';
    const tf = mapIntervalToBinanceWs(interval);
    const wsUrl = isFutures
      ? `wss://fstream.binance.com/ws/${cleanPair}@kline_${tf}`
      : `wss://stream.binance.com:9443/ws/${cleanPair}@kline_${tf}`;

    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          const k = msg?.k;
          if (!k) return;
          const liveBar: CandleBar = {
            time: Math.floor(Number(k.t) / 1000),
            open: Number(k.o),
            high: Number(k.h),
            low: Number(k.l),
            close: Number(k.c),
            volume: Number(k.v || 0),
          };
          if (!Number.isFinite(liveBar.close)) return;

          if (candleSeriesRef.current) {
            candleSeriesRef.current.update({
              time: liveBar.time as Time,
              open: liveBar.open,
              high: liveBar.high,
              low: liveBar.low,
              close: liveBar.close,
            });
          }

          const arr = candlesRef.current;
          if (arr.length > 0) {
            const last = arr[arr.length - 1];
            if (last.time === liveBar.time) {
              arr[arr.length - 1] = liveBar;
            } else if (liveBar.time > last.time) {
              arr.push(liveBar);
              if (arr.length > 260) arr.shift();
            }
          }
          requestAnimationFrame(renderOverlay);
        } catch (_) {}
      };
    } catch (_) {}

    return () => {
      if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
        ws.close();
      }
    };
  }, [symbol, interval, isFutures, renderOverlay]);

  // Initialize Lightweight Chart
  useEffect(() => {
    if (!chartMountRef.current || !wrapperRef.current) return;
    chartMountRef.current.innerHTML = '';

    const chart = createChart(chartMountRef.current, {
      width: wrapperRef.current.clientWidth || 600,
      height: wrapperRef.current.clientHeight || 360,
      layout: {
        background: { color: '#070a0f' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.04)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.04)' },
      },
      crosshair: {
        mode: 1,
      },
      timeScale: {
        borderColor: '#1e293b',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 10,
      },
      rightPriceScale: {
        borderColor: '#1e293b',
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#f43f5e',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e',
    });

    chartInstanceRef.current = chart;
    candleSeriesRef.current = candleSeries;

    const syncOverlay = () => {
      requestAnimationFrame(renderOverlay);
    };

    chart.timeScale().subscribeVisibleTimeRangeChange(syncOverlay);
    chart.timeScale().subscribeVisibleLogicalRangeChange(syncOverlay);
    chart.subscribeCrosshairMove(syncOverlay);

    const resizeObserver = new ResizeObserver(() => {
      if (wrapperRef.current && chartInstanceRef.current) {
        chartInstanceRef.current.applyOptions({
          width: wrapperRef.current.clientWidth,
          height: wrapperRef.current.clientHeight,
        });
        syncOverlay();
      }
    });
    resizeObserver.observe(wrapperRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.timeScale().unsubscribeVisibleTimeRangeChange(syncOverlay);
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(syncOverlay);
      chart.unsubscribeCrosshairMove(syncOverlay);
      chart.remove();
      chartInstanceRef.current = null;
      candleSeriesRef.current = null;
    };
  }, [renderOverlay]);

  // Populate historical candles into series & trigger overlay draw
  useEffect(() => {
    if (!candleSeriesRef.current || candles.length === 0) return;
    const formatted: CandlestickData<Time>[] = candles.map((c) => ({
      time: c.time as Time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));
    candleSeriesRef.current.setData(formatted);
    if (chartInstanceRef.current) {
      chartInstanceRef.current.timeScale().fitContent();
    }
    requestAnimationFrame(renderOverlay);
  }, [candles, renderOverlay]);

  useEffect(() => {
    requestAnimationFrame(renderOverlay);
  }, [drawingResult, showDrawings, renderOverlay]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick(1200);
    runAiDrawing(candles, selectedCategory, userPrompt);
  };

  const handleCategorySelect = (
    cat: 'all' | 'fibonacci' | 'elliott' | 'trendline' | 'ict' | 'snr'
  ) => {
    sound.playClick();
    setSelectedCategory(cat);
    runAiDrawing(candles, cat, userPrompt);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#070a0f] text-slate-100 relative overflow-hidden font-mono">
      {/* Top AI Tool Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-2.5 sm:px-3 py-1.5 bg-[#0b101d] border-b border-[#1b253b] z-25 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full">
          {[
            { id: 'all', label: 'Full AI' },
            { id: 'fibonacci', label: 'Fibonacci' },
            { id: 'elliott', label: 'Elliott Wave' },
            { id: 'trendline', label: 'Trendline' },
            { id: 'ict', label: 'ICT / SMC' },
            { id: 'snr', label: 'SnR' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleCategorySelect(tab.id as any)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                selectedCategory === tab.id
                  ? 'bg-amber-500 text-black font-bold'
                  : 'bg-[#121929] hover:bg-[#1a253e] text-slate-300 border border-[#1e2a42]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {drawingResult && (
            <button
              onClick={() => {
                sound.playClick();
                setShowDrawings((prev) => !prev);
              }}
              title={showDrawings ? 'Sembunyikan garis AI' : 'Tampilkan garis AI'}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] border transition-colors cursor-pointer ${
                showDrawings
                  ? 'bg-[#131d31] text-amber-300 border-amber-500/35'
                  : 'bg-[#121929] text-slate-400 border-[#23314d]'
              }`}
            >
              <EyeOff className="w-3 h-3" />
              <span className="hidden sm:inline">{showDrawings ? 'Sembunyikan' : 'Tampilkan'}</span>
            </button>
          )}
          {drawingResult && (
            <button
              onClick={() => {
                sound.playClick();
                setDrawingResult(null);
                drawingRef.current = null;
                requestAnimationFrame(renderOverlay);
              }}
              title="Hapus semua gambar AI"
              className="flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-[#121929] hover:bg-red-950/50 text-slate-300 hover:text-red-300 border border-[#23314d] transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={fetchCandles}
            disabled={loading || analyzing}
            className="flex items-center gap-1 bg-[#121929] hover:bg-[#1a263e] text-slate-300 border border-[#23314d] px-2 py-1 rounded text-[10px] transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${loading || analyzing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Interactive AI Prompt Input Bar */}
      <form
        onSubmit={handleManualSubmit}
        className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-[#090e18] border-b border-[#182236] z-20 shrink-0"
      >
        <input
          type="text"
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          placeholder="Minta AI gambar teknikal... misal: gambar fibonacci golden pocket & elliott wave"
          className="flex-1 min-w-0 bg-[#04060a] border border-[#202d48] rounded px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-amber-400"
        />
        <button
          type="submit"
          disabled={analyzing}
          className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-bold text-xs px-3 py-1.5 rounded transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Menggambar...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gambar AI</span>
            </>
          )}
        </button>
      </form>

      {/* Main Chart Canvas Viewport + Synced Drawing Canvas Overlay */}
      <div ref={wrapperRef} className="flex-1 w-full relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 z-30 bg-[#070a0f]/90 flex flex-col items-center justify-center gap-2 text-amber-300">
            <Loader2 className="w-7 h-7 animate-spin text-amber-400" />
            <span className="text-xs tracking-wider uppercase">
              Memuat Candlestick Live {symbol}...
            </span>
          </div>
        )}

        {errorMsg && (
          <div className="absolute inset-x-4 top-4 z-30 bg-red-950/85 border border-red-700 p-3 rounded-lg text-xs text-red-200 flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={fetchCandles} className="underline text-amber-300 cursor-pointer">
              Coba Lagi
            </button>
          </div>
        )}

        {/* Lightweight Charts Mount */}
        <div ref={chartMountRef} className="w-full h-full" />

        {/* Pixel-Locked AI Technical Drawing Overlay Canvas */}
        <canvas
          ref={overlayCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {/* Collapsible AI Setup Summary HUD */}
        {drawingResult && !loading && (
          <div className="absolute top-2.5 left-2.5 z-20 max-w-[300px] sm:max-w-sm bg-[#080d19]/92 border border-[#23314d] rounded-xl shadow-2xl overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => setShowHudSummary((prev) => !prev)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-[#0c1324] hover:bg-[#111b31] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                    drawingResult.bias === 'BULLISH'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : drawingResult.bias === 'BEARISH'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {drawingResult.bias}
                </span>
                <span className="font-semibold text-slate-100 truncate text-[11px]">
                  {drawingResult.headline}
                </span>
              </div>
              {showHudSummary ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              )}
            </button>

            {showHudSummary && (
              <div className="p-3 space-y-2 border-t border-[#1b253b]">
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  {drawingResult.summary}
                </p>

                <div className="grid grid-cols-2 gap-1.5 text-[11px] tabular-nums">
                  <div className="bg-[#121927] p-2 rounded border border-[#1e2a42]">
                    <span className="text-[10px] text-slate-400 block">Entry</span>
                    <span className="text-amber-300 font-bold">
                      {drawingResult.entryZone || 'Market'}
                    </span>
                  </div>
                  <div className="bg-[#121927] p-2 rounded border border-[#1e2a42]">
                    <span className="text-[10px] text-slate-400 block">Stop Loss</span>
                    <span className="text-red-400 font-bold">
                      {drawingResult.stopLoss || 'Swing Pivot'}
                    </span>
                  </div>
                </div>

                {drawingResult.targets && drawingResult.targets.length > 0 && (
                  <div className="flex items-center justify-between text-[11px] tabular-nums pt-0.5">
                    <span className="text-slate-400">Target TP:</span>
                    <span className="text-emerald-400 font-bold">
                      {drawingResult.targets.join(' · ')}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
