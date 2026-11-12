import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  try {
    const liquidityData = {
      timestamp: Date.now(),
      macroDiagnosis: 'ROTASI LIKUIDITAS: FASE KONSOLIDASI BITCOIN MENUJU SOLANA & AGEN AI',
      btcDominance: 58.4,
      ethDominance: 13.6,
      altcoinsDominance: 28.0,
      stablecoins: {
        totalCirculatingUSD: '$218.4B',
        net7dMintedUSD: '+$2.15B',
        usdtMarketCap: '$175.6B',
        usdcMarketCap: '$39.8B',
        liquidityStatus: 'EXPANSION INFLOW (Dry Powder Bertambah)',
      },
      currentFlowStage: {
        title: 'Stage 2: Selective Layer 1 & AI High-Beta Rotation',
        description: 'Uang hasil profit-taking dari Bitcoin tidak keluar ke Fiat, melainkan dialihkan ke ekosistem Solana, SUI, dan narasi Agen AI.',
        riskLevel: 'MODERATE_AGGRESSIVE',
        altseasonIndex: 38,
      },
      sectors: [
        {
          name: 'Layer 1 & High-Throughput Chains',
          tickers: ['SOL', 'SUI', 'BNB', 'AVAX'],
          flowDirection: 'INFLOW',
          net24hUSD: '+$780M',
          velocityScore: 92,
          color: '#14f195',
          status: 'Magnet Likuiditas Institusional Utama',
        },
        {
          name: 'AI Agents & Decentralized Compute',
          tickers: ['TAO', 'RENDER', 'VIRTUAL', 'FET'],
          flowDirection: 'INFLOW',
          net24hUSD: '+$340M',
          velocityScore: 88,
          color: '#a855f7',
          status: 'Rotasi Spekulatif Berkecepatan Tinggi',
        },
        {
          name: 'Memes & Community Momentum',
          tickers: ['DOGE', 'PEPE', 'WIF', 'FARTCOIN'],
          flowDirection: 'MIXED',
          net24hUSD: '+$140M',
          velocityScore: 76,
          color: '#f59e0b',
          status: 'Likuiditas Ritel Masuk Cepat Keluar Cepat',
        },
        {
          name: 'DeFi & RWA Real-World Assets',
          tickers: ['AAVE', 'MKR', 'ONDO', 'PENDLE'],
          flowDirection: 'INFLOW',
          net24hUSD: '+$115M',
          velocityScore: 64,
          color: '#3b82f6',
          status: 'Penguncian Yield Institusional Jangka Panjang',
        },
        {
          name: 'Layer 2 Rollups & Modular Infra',
          tickers: ['ARB', 'OP', 'STRK', 'TIA'],
          flowDirection: 'OUTFLOW',
          net24hUSD: '-$85M',
          velocityScore: 42,
          color: '#ef4444',
          status: 'Tekanan Dilusi Pasokan & Token Unlock',
        },
      ],
      flowRoute: [
        { step: 1, from: 'Fiat / Spot ETF Inflow', to: 'Bitcoin Vault Reserve', percentage: '55%', note: 'Jangkar likuiditas makro' },
        { step: 2, from: 'Bitcoin Profit Taking', to: 'Solana & Major L1s', percentage: '24%', note: 'Rotasi beta tinggi' },
        { step: 3, from: 'L1 Profits', to: 'AI Agents & Viral Memes', percentage: '14%', note: 'Mencari asimetri return' },
        { step: 4, from: 'Risk-Off Hedging', to: 'USDT/USDC Dry Powder', percentage: '7%', note: 'Menunggu koreksi' },
      ],
    };

    return res.status(200).json({
      success: true,
      ...liquidityData,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch liquidity flow' });
  }
}
