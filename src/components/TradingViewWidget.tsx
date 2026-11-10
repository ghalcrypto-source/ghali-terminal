import React, { useEffect, useRef, memo } from 'react';
import { ExchangeId } from '../types/crypto';

interface TradingViewWidgetProps {
  symbol: string; // e.g. BTCUSDT
  exchange: ExchangeId;
  interval: string; // e.g. '15', '60', '240', 'D'
  isFutures: boolean;
  indicators?: string[]; // e.g. ['EMA', 'RSI', 'StochRSI', 'MACD']
}

export const TradingViewWidget: React.FC<TradingViewWidgetProps> = memo(({
  symbol,
  exchange,
  interval,
  isFutures,
  indicators = ['EMA', 'RSI', 'StochRSI'],
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const formattedSymbol = (() => {
    const cleanSym = symbol.toUpperCase().replace('/', '');
    if (exchange === 'BITGET') {
      return isFutures ? `BITGET:${cleanSym}.P` : `BITGET:${cleanSym}`;
    }
    return isFutures ? `BINANCE:${cleanSym}.P` : `BINANCE:${cleanSym}`;
  })();

  const containerId = `tv_chart_${exchange}_${symbol.replace(/[^a-zA-Z0-9]/g, '_')}_${isFutures ? 'perp' : 'spot'}`;

  // Map indicator names to TradingView study IDs
  const studiesList = indicators
    .map((ind) => {
      switch (ind) {
        case 'EMA':
          return 'STD;EMA';
        case 'RSI':
          return 'STD;RSI';
        case 'StochRSI':
          return 'STD;Stochastic_RSI';
        case 'MACD':
          return 'STD;MACD';
        case 'Bollinger':
          return 'STD;Bollinger_Bands';
        case 'Volume':
          return 'STD;Volume';
        default:
          return null;
      }
    })
    .filter(Boolean) as string[];

  useEffect(() => {
    let script: HTMLScriptElement | null = null;
    const currentContainer = containerRef.current;

    if (!currentContainer) return;

    currentContainer.innerHTML = '';

    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container__widget';
    widgetContainer.style.height = '100%';
    widgetContainer.style.width = '100%';
    currentContainer.appendChild(widgetContainer);

    script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: formattedSymbol,
      interval: interval,
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      enable_publishing: false,
      backgroundColor: '#0a0d14',
      gridColor: 'rgba(255, 255, 255, 0.04)',
      hide_top_toolbar: false,
      hide_side_toolbar: false, // ENABLES TRENDLINE, FIBONACCI, PATH, BRUSH, SHAPES
      withdateranges: true,
      hide_legend: false,
      save_image: true,
      calendar: false,
      hide_volume: false,
      support_host: 'https://www.tradingview.com',
      studies: studiesList,
    });

    currentContainer.appendChild(script);

    return () => {
      if (currentContainer) {
        currentContainer.innerHTML = '';
      }
    };
  }, [formattedSymbol, interval, indicators.join(',')]);

  return (
    <div
      ref={containerRef}
      id={containerId}
      className="tradingview-widget-container w-full h-full bg-[#0a0d14]"
      style={{ minHeight: '300px' }}
    />
  );
});
