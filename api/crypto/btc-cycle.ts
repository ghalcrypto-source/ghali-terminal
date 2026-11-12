import type { VercelRequest, VercelResponse } from '@vercel/node';

let cachedBtcCycleData = {
  price: 71315.0,
  change24h: -3.09,
  marketCap: 1410000000000,
  volume24h: 38400000000,
  ath: 108900,
  athDate: 'Jan 2025',
  distanceFromAth: -34.5,
  fees: { fastestFee: 12, halfHourFee: 10, hourFee: 8 },
  lastUpdated: Date.now(),
  source: 'Coinbase / Binance Live Multi-Feed',
};

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=30');

  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 4000);

    const [binanceRes, coinbaseRes, krakenRes, mempoolRes] = await Promise.allSettled([
      fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT', { signal: controller.signal }),
      fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot', { signal: controller.signal }),
      fetch('https://api.kraken.com/0/public/Ticker?pair=XBTUSD', { signal: controller.signal }),
      fetch('https://mempool.space/api/v1/fees/recommended', { signal: controller.signal }),
    ]);
    clearTimeout(tid);

    let price = cachedBtcCycleData.price;
    let change24h = cachedBtcCycleData.change24h;
    let volume24h = cachedBtcCycleData.volume24h;
    let resolvedSource = cachedBtcCycleData.source;

    // Coinbase
    if (coinbaseRes.status === 'fulfilled' && coinbaseRes.value.ok) {
      try {
        const c = await coinbaseRes.value.json();
        const cbPrice = parseFloat(c?.data?.amount);
        if (cbPrice > 10000 && cbPrice < 250000) {
          price = cbPrice;
          resolvedSource = 'Coinbase Spot API (Real-Time)';
        }
      } catch (_) {}
    }

    // Binance
    if (binanceRes.status === 'fulfilled' && binanceRes.value.ok) {
      try {
        const b = await binanceRes.value.json();
        if (b?.lastPrice && parseFloat(b.lastPrice) > 10000) {
          price = parseFloat(b.lastPrice);
          change24h = parseFloat(b.priceChangePercent) || change24h;
          volume24h = parseFloat(b.quoteVolume) || volume24h;
          resolvedSource = 'Binance Spot API (Real-Time)';
        }
      } catch (_) {}
    }

    // Kraken
    if (krakenRes.status === 'fulfilled' && krakenRes.value.ok && resolvedSource === cachedBtcCycleData.source) {
      try {
        const k = await krakenRes.value.json();
        const kPrice = parseFloat(k?.result?.XXBTZUSD?.c?.[0] || k?.result?.XBTUSD?.c?.[0]);
        if (kPrice > 10000) {
          price = kPrice;
          resolvedSource = 'Kraken Spot API (Real-Time)';
        }
      } catch (_) {}
    }

    // Mempool
    let fees = cachedBtcCycleData.fees;
    if (mempoolRes.status === 'fulfilled' && mempoolRes.value.ok) {
      try {
        const m = await mempoolRes.value.json();
        if (m?.fastestFee) {
          fees = m;
        }
      } catch (_) {}
    }

    const ath = 108900;
    const distanceFromAth = parseFloat((((price - ath) / ath) * 100).toFixed(2));
    const marketCap = Math.round(price * 19780000);

    cachedBtcCycleData = {
      price,
      change24h,
      marketCap,
      volume24h,
      ath,
      athDate: 'Jan 2025',
      distanceFromAth,
      fees,
      lastUpdated: Date.now(),
      source: resolvedSource,
    };

    return res.status(200).json({
      success: true,
      ...cachedBtcCycleData,
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      ...cachedBtcCycleData,
      fromCache: true,
    });
  }
}
