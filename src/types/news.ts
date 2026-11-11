export type NewsSource = 'CoinDesk' | 'Cointelegraph' | 'Decrypt' | 'The Block' | 'Bloomberg Crypto' | 'Reuters' | string;

export type NewsSentiment = 'BULLISH' | 'BEARISH' | 'CONTRARIAN ALERT' | 'NEUTRAL';

export interface CryptoNewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  category: 'MACRO' | 'BITCOIN' | 'ALTCOINS' | 'REGULATORY' | 'DEFI';
  timestamp: string;
  sentiment: NewsSentiment;
  crowdConsensus: string;
  contrarianAngle: string;
  imageUrl?: string;
}

export interface MarketMover {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24hUSD: string;
  marketCapUSD: string;
  exchange: 'BINANCE' | 'BITGET' | 'BOTH';
  contrarianStatus: 'OVERBOUGHT PEAK' | 'OVERSOLD BOUNCE' | 'MOMENTUM CHASE' | 'PANIC CAPITULATION';
}

export interface UserSession {
  isLoggedIn: boolean;
  traderName: string;
  role: string;
  avatarSeed: string;
  connectedExchanges: ('BINANCE' | 'BITGET')[];
  riskPreference: 'CONVEX ASYMMETRIC' | 'DEEP VALUE' | 'MOMENTUM SQUEEZE';
}
