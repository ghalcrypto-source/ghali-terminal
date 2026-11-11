import React, { useEffect, useRef } from 'react';

// 1. TradingView Ticker Tape Widget
export const TradingViewTickerTape: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.async = true;
    script.type = 'text/javascript';
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: 'TVC:DXY', title: 'DXY Index' },
        { proName: 'BINANCE:BTCUSDT', title: 'BTC/USDT' },
        { proName: 'BINANCE:ETHUSDT', title: 'ETH/USDT' },
        { proName: 'OANDA:XAUUSD', title: 'Gold (XAUUSD)' },
        { proName: 'FX:EURUSD', title: 'EUR/USD' },
        { proName: 'FX:USDJPY', title: 'USD/JPY' },
        { proName: 'FX:GBPUSD', title: 'GBP/USD' },
        { proName: 'BINANCE:SOLUSDT', title: 'SOL/USDT' },
      ],
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: 'adaptive',
      colorTheme: 'dark',
      locale: 'en',
    });

    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="tradingview-widget-container w-full" ref={containerRef}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
};

// 2. TradingView Single Quote Widget
interface TradingViewSingleQuoteProps {
  symbol: string;
  width?: string;
}

export const TradingViewSingleQuote: React.FC<TradingViewSingleQuoteProps> = ({ symbol, width = '100%' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-single-quote.js';
    script.async = true;
    script.type = 'text/javascript';
    script.innerHTML = JSON.stringify({
      symbol,
      width,
      colorTheme: 'dark',
      isTransparent: true,
      locale: 'en',
    });

    containerRef.current.appendChild(script);
  }, [symbol, width]);

  return (
    <div className="tradingview-widget-container w-full" ref={containerRef}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
};

// 3. TradingView Mini Symbol Overview Chart
interface TradingViewMiniChartProps {
  symbol: string;
  height?: number;
}

export const TradingViewMiniChart: React.FC<TradingViewMiniChartProps> = ({ symbol, height = 220 }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.async = true;
    script.type = 'text/javascript';
    script.innerHTML = JSON.stringify({
      symbol,
      width: '100%',
      height,
      locale: 'en',
      dateRange: '1D',
      colorTheme: 'dark',
      isTransparent: true,
      autosize: false,
      largeChartUrl: '',
    });

    containerRef.current.appendChild(script);
  }, [symbol, height]);

  return (
    <div className="tradingview-widget-container w-full overflow-hidden rounded-lg" ref={containerRef}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
};

// 4. TradingView Technical Analysis Gauge Widget
interface TradingViewTechnicalGaugeProps {
  symbol: string;
}

export const TradingViewTechnicalGauge: React.FC<TradingViewTechnicalGaugeProps> = ({ symbol }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js';
    script.async = true;
    script.type = 'text/javascript';
    script.innerHTML = JSON.stringify({
      interval: '1h',
      width: '100%',
      isTransparent: true,
      height: 280,
      symbol,
      showIntervalTabs: true,
      displayMode: 'single',
      locale: 'en',
      colorTheme: 'dark',
    });

    containerRef.current.appendChild(script);
  }, [symbol]);

  return (
    <div className="tradingview-widget-container w-full" ref={containerRef}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
};
