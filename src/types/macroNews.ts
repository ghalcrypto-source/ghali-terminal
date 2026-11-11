export type MacroCategory =
  | 'FED_FOMC'
  | 'CPI_INFLATION'
  | 'CENTRAL_BANKS'
  | 'GDP_JOBS'
  | 'LIQUIDITY'
  | 'GEOPOLITICS_WAR'
  | 'TRADE_WAR'
  | 'BANKING_CRISIS'
  | 'DEBT_YIELDS'
  | 'CRYPTO_REGULATION';

export interface CategoryDefinition {
  id: MacroCategory;
  label: string;
  description: string;
  keywords: string[];
  color: string;
}

export const MACRO_CATEGORIES: CategoryDefinition[] = [
  {
    id: 'FED_FOMC',
    label: 'Fed & FOMC',
    description: 'Federal Reserve, Powell statements, FOMC rate decisions & dot plots',
    keywords: ['fed', 'federal reserve', 'powell', 'fomc', 'rate decision', 'dot plot', 'quantitative tightening'],
    color: 'emerald',
  },
  {
    id: 'CPI_INFLATION',
    label: 'CPI, PCE & NFP',
    description: 'Inflation metrics, CPI, Core PCE, Non-Farm Payrolls, Producer Price Index',
    keywords: ['cpi', 'pce', 'inflation', 'nfp', 'non-farm payrolls', 'jobs report', 'ppi', 'wage growth'],
    color: 'amber',
  },
  {
    id: 'CENTRAL_BANKS',
    label: 'Interest Rates & Central Banks',
    description: 'ECB, BOJ, BOE, PBOC, rate hikes/cuts, monetary policy policy shifts',
    keywords: ['ecb', 'boj', 'boe', 'pboc', 'central bank', 'interest rate', 'rate hike', 'rate cut', 'yield curve'],
    color: 'blue',
  },
  {
    id: 'GDP_JOBS',
    label: 'GDP & Unemployment',
    description: 'Gross Domestic Product, jobless claims, employment rate, economic growth',
    keywords: ['gdp', 'unemployment', 'jobless claims', 'recession', 'economic growth', 'payrolls'],
    color: 'cyan',
  },
  {
    id: 'LIQUIDITY',
    label: 'Global Liquidity & Policy',
    description: 'Central bank balance sheets, repo operations, dollar liquidity swaps, money supply M2',
    keywords: ['liquidity', 'balance sheet', 'm2', 'repo', 'money supply', 'stimulus', 'quantitative easing'],
    color: 'purple',
  },
  {
    id: 'GEOPOLITICS_WAR',
    label: 'Geopolitics, War & Sanctions',
    description: 'Geopolitical conflicts, military escalation, trade embargoes, sanctions, crude oil risks',
    keywords: ['war', 'geopolitics', 'sanctions', 'conflict', 'military', 'middle east', 'taiwan', 'russia', 'ukraine', 'oil'],
    color: 'red',
  },
  {
    id: 'TRADE_WAR',
    label: 'US-China Trade War',
    description: 'Tariffs, chip bans, export controls, US-China trade friction, BRICS de-dollarization',
    keywords: ['trade war', 'china tariff', 'chip ban', 'semiconductor export', 'us-china', 'de-dollarization', 'brics'],
    color: 'orange',
  },
  {
    id: 'BANKING_CRISIS',
    label: 'Banking & Financial Crisis',
    description: 'Commercial bank insolvencies, credit defaults, systemic risk, liquidity freezes',
    keywords: ['banking crisis', 'bank collapse', 'credit default', 'liquidity crunch', 'contagion', 'systemic risk', 'bank run'],
    color: 'rose',
  },
  {
    id: 'DEBT_YIELDS',
    label: 'Govt Debt & Bond Yields',
    description: 'US Treasuries 10Y/30Y yields, sovereign debt auctions, fiscal deficit, yield curve inversion',
    keywords: ['treasury yield', 'bond yield', '10-year', 'sovereign debt', 'deficit', 'auction', 'yield inversion'],
    color: 'indigo',
  },
  {
    id: 'CRYPTO_REGULATION',
    label: 'Crypto Regulation & Adoption',
    description: 'SEC/CFTC enforcement, Bitcoin Spot ETFs, stablecoin legislation, sovereign BTC holdings',
    keywords: ['sec', 'cftc', 'crypto regulation', 'etf', 'bitcoin reserve', 'stablecoin', 'institutional adoption'],
    color: 'yellow',
  },
];

export interface AssetImpactDetail {
  asset: 'DXY' | 'BTC' | 'ETH' | 'XAUUSD' | 'EURUSD' | 'USDJPY' | 'GBPUSD' | string;
  assetLabel: string;
  direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  effectText: string;
}

export interface AINewsAnalysis {
  summary: string;
  keyFacts: string[];
  whyItMatters: string;
  usdDxyImpact: string;
  cryptoImpact: string;
  goldImpact: string;
  forexImpact: string;
  marketSentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  impactLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  analyzedAtWIB: string;
}

export interface MacroNewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  category: MacroCategory;
  categoryLabel: string;
  country: 'US' | 'EU' | 'UK' | 'CN' | 'JP' | 'ME' | 'GLOBAL';
  pubDateIso: string;
  timestampWIB: string;
  timeAgo: string;
  impactLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  targetAssets: string[];
  assetImpacts: AssetImpactDetail[];
  impactSummaryText: string;
  aiAnalysis?: AINewsAnalysis;
  isLiveApi?: boolean;
}

export interface ApiKeysConfig {
  newsDataKey?: string;
  gnewsKey?: string;
  guardianKey?: string;
  geminiKey?: string;
}
