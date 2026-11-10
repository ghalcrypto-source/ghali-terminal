export type ExchangeId = 'BINANCE' | 'BITGET';

export type ChartLayout = '1x1' | '2x1' | '2x2' | '3x1';

export interface ChartSlot {
  id: string;
  symbol: string; // e.g. BTCUSDT
  exchange: ExchangeId;
  interval: string; // e.g. '15', '60', '240', 'D'
  isFutures: boolean;
  indicators?: string[]; // e.g. ['EMA', 'RSI', 'StochRSI']
}

export interface CoinInfo {
  symbol: string; // e.g. 'BTC'
  pair: string; // e.g. 'BTCUSDT'
  name: string;
  category: 'L1' | 'L2' | 'AI' | 'MEME' | 'DEFI' | 'STORAGE' | 'INFRA';
  basePriceUSD: number;
}

export interface TechnicalIndicatorConfig {
  showEMA: boolean;
  showRSI: boolean;
  showStochRSI: boolean;
  showFibonacci: boolean;
  showTrendline: boolean;
  showLiquidityPath: boolean;
}

export interface FibonacciLevels {
  swingHigh: number;
  swingLow: number;
  fib0: number;
  fib236: number;
  fib382: number;
  fib500: number;
  fib618: number; // Golden Pocket
  fib786: number;
  fib1000: number;
  fib1618: number; // Extension
}

export interface ExchangeSentiment {
  symbol: string;
  price: number;
  change24h: number;
  binanceFundingRate: number;
  bitgetFundingRate: number;
  longShortRatio: number;
  longPercentage: number;
  shortPercentage: number;
  openInterestUSD: string;
  liquidations24h: {
    longUSD: string;
    shortUSD: string;
  };
  contrarianSignal: 'EXTREME LONG CROWDING' | 'SHORT SQUEEZE POTENTIAL' | 'NEUTRAL ACCUMULATION' | 'PANIC CAPITULATION';
}

// 50 TOP CRYPTO COINS ACROSS BINANCE & BITGET
export const CRYPTO_50_COINS: CoinInfo[] = [
  { symbol: 'BTC', pair: 'BTCUSDT', name: 'Bitcoin', category: 'L1', basePriceUSD: 94820 },
  { symbol: 'ETH', pair: 'ETHUSDT', name: 'Ethereum', category: 'L1', basePriceUSD: 3410 },
  { symbol: 'SOL', pair: 'SOLUSDT', name: 'Solana', category: 'L1', basePriceUSD: 218.4 },
  { symbol: 'BNB', pair: 'BNBUSDT', name: 'BNB', category: 'L1', basePriceUSD: 662.5 },
  { symbol: 'XRP', pair: 'XRPUSDT', name: 'Ripple', category: 'L1', basePriceUSD: 2.45 },
  { symbol: 'DOGE', pair: 'DOGEUSDT', name: 'Dogecoin', category: 'MEME', basePriceUSD: 0.385 },
  { symbol: 'ADA', pair: 'ADAUSDT', name: 'Cardano', category: 'L1', basePriceUSD: 0.98 },
  { symbol: 'AVAX', pair: 'AVAXUSDT', name: 'Avalanche', category: 'L1', basePriceUSD: 38.6 },
  { symbol: 'SUI', pair: 'SUIUSDT', name: 'Sui', category: 'L1', basePriceUSD: 3.48 },
  { symbol: 'LINK', pair: 'LINKUSDT', name: 'Chainlink', category: 'INFRA', basePriceUSD: 19.8 },
  { symbol: 'PEPE', pair: 'PEPEUSDT', name: 'Pepe', category: 'MEME', basePriceUSD: 0.0000185 },
  { symbol: 'SHIB', pair: 'SHIBUSDT', name: 'Shiba Inu', category: 'MEME', basePriceUSD: 0.000024 },
  { symbol: 'NEAR', pair: 'NEARUSDT', name: 'NEAR Protocol', category: 'L1', basePriceUSD: 6.82 },
  { symbol: 'APT', pair: 'APTUSDT', name: 'Aptos', category: 'L1', basePriceUSD: 11.2 },
  { symbol: 'TAO', pair: 'TAOUSDT', name: 'Bittensor', category: 'AI', basePriceUSD: 584.2 },
  { symbol: 'RENDER', pair: 'RENDERUSDT', name: 'Render', category: 'AI', basePriceUSD: 8.75 },
  { symbol: 'INJ', pair: 'INJUSDT', name: 'Injective', category: 'DEFI', basePriceUSD: 26.4 },
  { symbol: 'TIA', pair: 'TIAUSDT', name: 'Celestia', category: 'INFRA', basePriceUSD: 5.62 },
  { symbol: 'ARB', pair: 'ARBUSDT', name: 'Arbitrum', category: 'L2', basePriceUSD: 0.82 },
  { symbol: 'OP', pair: 'OPUSDT', name: 'Optimism', category: 'L2', basePriceUSD: 1.84 },
  { symbol: 'FET', pair: 'FETUSDT', name: 'Artificial Superintelligence', category: 'AI', basePriceUSD: 1.48 },
  { symbol: 'WIF', pair: 'WIFUSDT', name: 'dogwifhat', category: 'MEME', basePriceUSD: 2.88 },
  { symbol: 'BONK', pair: 'BONKUSDT', name: 'Bonk', category: 'MEME', basePriceUSD: 0.000032 },
  { symbol: 'FLOKI', pair: 'FLOKIUSDT', name: 'Floki', category: 'MEME', basePriceUSD: 0.00022 },
  { symbol: 'SEI', pair: 'SEIUSDT', name: 'Sei', category: 'L1', basePriceUSD: 0.54 },
  { symbol: 'KAS', pair: 'KASUSDT', name: 'Kaspa', category: 'L1', basePriceUSD: 0.165 },
  { symbol: 'ICP', pair: 'ICPUSDT', name: 'Internet Computer', category: 'L1', basePriceUSD: 11.4 },
  { symbol: 'DOT', pair: 'DOTUSDT', name: 'Polkadot', category: 'L1', basePriceUSD: 7.9 },
  { symbol: 'UNI', pair: 'UNIUSDT', name: 'Uniswap', category: 'DEFI', basePriceUSD: 11.8 },
  { symbol: 'AAVE', pair: 'AAVEUSDT', name: 'Aave', category: 'DEFI', basePriceUSD: 245.0 },
  { symbol: 'VIRTUAL', pair: 'VIRTUALUSDT', name: 'Virtuals Protocol', category: 'AI', basePriceUSD: 2.84 },
  { symbol: 'FARTCOIN', pair: 'FARTCOINUSDT', name: 'Fartcoin AI', category: 'MEME', basePriceUSD: 0.94 },
  { symbol: 'PENGU', pair: 'PENGUUSDT', name: 'Pudgy Penguins', category: 'MEME', basePriceUSD: 0.038 },
  { symbol: 'JUP', pair: 'JUPUSDT', name: 'Jupiter', category: 'DEFI', basePriceUSD: 1.15 },
  { symbol: 'RAY', pair: 'RAYUSDT', name: 'Raydium', category: 'DEFI', basePriceUSD: 5.4 },
  { symbol: 'ONDO', pair: 'ONDOUSDT', name: 'Ondo Finance', category: 'DEFI', basePriceUSD: 1.28 },
  { symbol: 'HBAR', pair: 'HBARUSDT', name: 'Hedera', category: 'L1', basePriceUSD: 0.28 },
  { symbol: 'ALGO', pair: 'ALGOUSDT', name: 'Algorand', category: 'L1', basePriceUSD: 0.32 },
  { symbol: 'LTC', pair: 'LTCUSDT', name: 'Litecoin', category: 'L1', basePriceUSD: 104.2 },
  { symbol: 'BCH', pair: 'BCHUSDT', name: 'Bitcoin Cash', category: 'L1', basePriceUSD: 498.0 },
  { symbol: 'FIL', pair: 'FILUSDT', name: 'Filecoin', category: 'STORAGE', basePriceUSD: 5.85 },
  { symbol: 'STX', pair: 'STXUSDT', name: 'Stacks', category: 'L2', basePriceUSD: 1.95 },
  { symbol: 'IMX', pair: 'IMXUSDT', name: 'Immutable', category: 'L2', basePriceUSD: 1.65 },
  { symbol: 'GRT', pair: 'GRTUSDT', name: 'The Graph', category: 'INFRA', basePriceUSD: 0.24 },
  { symbol: 'PYTH', pair: 'PYTHUSDT', name: 'Pyth Network', category: 'INFRA', basePriceUSD: 0.44 },
  { symbol: 'ENA', pair: 'ENAUSDT', name: 'Ethena', category: 'DEFI', basePriceUSD: 0.78 },
  { symbol: 'WLD', pair: 'WLDUSDT', name: 'Worldcoin', category: 'AI', basePriceUSD: 2.85 },
  { symbol: 'LDO', pair: 'LDOUSDT', name: 'Lido DAO', category: 'DEFI', basePriceUSD: 1.74 },
  { symbol: 'CRV', pair: 'CRVUSDT', name: 'Curve DAO', category: 'DEFI', basePriceUSD: 0.68 },
  { symbol: 'MKR', pair: 'MKRUSDT', name: 'Maker', category: 'DEFI', basePriceUSD: 1840.0 },
];
