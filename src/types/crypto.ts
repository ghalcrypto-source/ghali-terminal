export type ExchangeId = 'BINANCE' | 'BITGET';

export type ChartLayout = '1x1' | '2x1' | '2x2' | '3x1';

export interface ChartSlot {
  id: string;
  symbol: string; // e.g. BTCUSDT
  exchange: ExchangeId;
  interval: string; // e.g. '15', '60', '240', 'D'
  isFutures: boolean;
}

export interface ExchangeSentiment {
  symbol: string;
  price: number;
  change24h: number;
  binanceFundingRate: number; // e.g. 0.0125 (%)
  bitgetFundingRate: number; // e.g. 0.0118 (%)
  longShortRatio: number; // e.g. 2.45 (2.45 longs for every 1 short)
  longPercentage: number; // e.g. 71%
  shortPercentage: number; // e.g. 29%
  openInterestUSD: string; // e.g. "$4.82B"
  liquidations24h: {
    longUSD: string;
    shortUSD: string;
  };
  contrarianSignal: 'EXTREME LONG CROWDING' | 'SHORT SQUEEZE POTENTIAL' | 'NEUTRAL ACCUMULATION' | 'PANIC CAPITULATION';
}
