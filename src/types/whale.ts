export type AuthorType = 'KOL' | 'SMART_MONEY_WHALE' | 'ONCHAIN_TRACKER' | 'MARKET_MAKER';

export type TradeStance =
  | 'HEAVY ACCUMULATION'
  | 'DISTRIBUTION / PROFIT TAKE'
  | 'SHORT SQUEEZE WARNING'
  | 'PARABOLIC BREAKOUT'
  | 'CAPITULATION BOTTOM';

export interface WhaleAnalysisItem {
  id: string;
  authorName: string;
  authorHandle: string;
  authorType: AuthorType;
  avatarBg: string;
  targetCoin: string; // e.g. 'BTC'
  coinPair: string; // e.g. 'BTCUSDT'
  timestamp: string;
  stance: TradeStance;
  title: string;
  analysisText: string;
  onChainTelemetry?: {
    walletAddress?: string;
    actionValueUSD: string;
    flowDirection: 'INFLOW_EXCHANGE' | 'OUTFLOW_COLD_STORAGE' | 'LEVERAGED_POSITION';
    exchangeDestination?: string;
  };
  contrarianTake: string;
  keyLevels: {
    entryOrSupport: string;
    targetPrice: string;
    invalidationStop: string;
  };
}
