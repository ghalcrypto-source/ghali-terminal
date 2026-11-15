import type { VercelRequest, VercelResponse } from '@vercel/node';
import Parser from 'rss-parser';

const rssParser = new Parser({ timeout: 4000 });

function formatWib(rawDate?: string) {
  const dateObj = rawDate ? new Date(rawDate) : new Date();
  const valid = Number.isNaN(dateObj.getTime()) ? new Date() : dateObj;
  const wibString =
    valid.toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }) + ' WIB';

  const diffMins = Math.max(1, Math.floor((Date.now() - valid.getTime()) / 60000));
  const timeAgo =
    diffMins < 60
      ? `${diffMins}m lalu`
      : diffMins < 1440
      ? `${Math.floor(diffMins / 60)}j lalu`
      : `${Math.floor(diffMins / 1440)}h lalu`;

  return { wibString, timeAgo, timestampMs: valid.getTime() };
}

function classifyTheme(text: string): {
  theme: 'AI & Agent' | 'RWA & Inst.' | 'DeFi & On-Chain' | 'Layer 1' | 'Meme & Viral' | 'Regulasi & Makro';
  sentiment: 'BULLISH' | 'BEARISH' | 'VIRAL';
} {
  const lower = text.toLowerCase();
  let sentiment: 'BULLISH' | 'BEARISH' | 'VIRAL' = 'BULLISH';
  if (/(crash|hack|exploit|drain|lawsuit|ban|sec sue|liquidation|drop|plunge|fear)/.test(lower)) {
    sentiment = 'BEARISH';
  } else if (/(surge|soar|boost|viral|ath|record|trending|boom|100x|rally)/.test(lower)) {
    sentiment = 'VIRAL';
  }

  if (/(\bai\b|agent|agentic|compute|gpu|bittensor|tao|virtuals|fetch|render|llm|venice)/.test(lower)) {
    return { theme: 'AI & Agent', sentiment };
  }
  if (/(rwa|real world|etf|blackrock|institutional|treasury|fidelity|custody|pension|sovereign|tokenized)/.test(lower)) {
    return { theme: 'RWA & Inst.', sentiment };
  }
  if (/(meme|pepe|doge|wif|bonk|pump|shib|fartcoin|floki|viral)/.test(lower)) {
    return { theme: 'Meme & Viral', sentiment };
  }
  if (/(defi|dex|yield|staking|restaking|tvl|uniswap|aave|lending|swap|pool|liquidity|stablecoin|usdc|usdt)/.test(lower)) {
    return { theme: 'DeFi & On-Chain', sentiment };
  }
  if (/(sec\b|cftc|fed\b|fomc|cpi|inflation|tariff|regulation|policy|tax|congress|senate|doj)/.test(lower)) {
    return { theme: 'Regulasi & Makro', sentiment };
  }
  return { theme: 'Layer 1', sentiment };
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const nowMs = Date.now();
  const narratives: any[] = [];
  const hotSectors: any[] = [];
  const seen = new Set<string>();
  const sourceStats: Record<string, number> = {
    coingecko: 0,
    dexscreener: 0,
    geckoterminal: 0,
    hackernews: 0,
    rss: 0,
  };

  const pushNarrative = (item: any) => {
    const slug = String(item.title || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 48);
    if (!slug || seen.has(slug)) return;
    seen.add(slug);
    narratives.push(item);
  };

  const cgCategoriesPromise = (async () => {
    try {
      const r = await fetch('https://api.coingecko.com/api/v3/coins/categories', {
        signal: AbortSignal.timeout(4500),
      });
      if (!r.ok) return;
      const cats = await r.json();
      if (!Array.isArray(cats)) return;

      const top = cats
        .filter(
          (c: any) =>
            c &&
            typeof c.name === 'string' &&
            typeof c.market_cap_change_24h === 'number' &&
            (c.volume_24h || 0) > 25_000_000 &&
            (c.market_cap || 0) > 100_000_000
        )
        .sort((a: any, b: any) => b.market_cap_change_24h - a.market_cap_change_24h)
        .slice(0, 8);

      top.forEach((cat: any) => {
        const chg = Number(cat.market_cap_change_24h.toFixed(2));
        hotSectors.push({
          id: cat.id,
          name: cat.name,
          change24h: chg,
          volume24hUSD: cat.volume_24h || 0,
          marketCapUSD: cat.market_cap || 0,
          topCoins: Array.isArray(cat.top_3_coins_id) ? cat.top_3_coins_id : [],
        });
        const { theme } = classifyTheme(cat.name);
        const volStr =
          cat.volume_24h >= 1e9
            ? `$${(cat.volume_24h / 1e9).toFixed(2)}B`
            : `$${(cat.volume_24h / 1e6).toFixed(0)}M`;

        pushNarrative({
          id: `cg-cat-${cat.id}`,
          title: `Sektor Narasi ${cat.name}: ${chg >= 0 ? '+' : ''}${chg}% (24J) · Vol ${volStr}`,
          summary: `Kapitalisasi sektor ${cat.name} bergerak ${chg >= 0 ? 'naik' : 'turun'} ${Math.abs(chg)}% dalam 24 jam terakhir dengan volume ${volStr}.`,
          source: 'CoinGecko Categories API',
          sourceType: 'COINGECKO',
          narrativeTheme: theme,
          sentiment: chg >= 3 ? 'VIRAL' : chg >= 0 ? 'BULLISH' : 'BEARISH',
          metricLabel: `${chg >= 0 ? '+' : ''}${chg}% 24J`,
          change24h: chg,
          url: `https://www.coingecko.com/en/categories/${cat.id}`,
          timestamp: 'Live 24J',
          timestampMs: nowMs - 60000,
          wibTime: formatWib().wibString,
        });
        sourceStats.coingecko++;
      });
    } catch {}
  })();

  const cgTrendingPromise = (async () => {
    try {
      const r = await fetch('https://api.coingecko.com/api/v3/search/trending', {
        signal: AbortSignal.timeout(4500),
      });
      if (!r.ok) return;
      const cgData = await r.json();
      if (Array.isArray(cgData?.coins)) {
        cgData.coins.slice(0, 6).forEach((entry: any) => {
          const coin = entry?.item;
          if (!coin) return;
          const pct24h = Number((coin?.data?.price_change_percentage_24h?.usd ?? 0).toFixed(2));
          const { theme } = classifyTheme(`${coin.name} ${coin.symbol}`);
          pushNarrative({
            id: `cg-coin-${coin.id}`,
            title: `Trending Token: ${coin.name} (${coin.symbol}) Rank #${coin.market_cap_rank || '-'}`,
            summary: `${coin.name} (${coin.symbol}) sedang ramai dicari dalam 24 jam terakhir (${pct24h >= 0 ? '+' : ''}${pct24h}%).`,
            source: 'CoinGecko Trending API',
            sourceType: 'COINGECKO',
            narrativeTheme: theme,
            sentiment: pct24h >= 5 ? 'VIRAL' : pct24h >= 0 ? 'BULLISH' : 'BEARISH',
            metricLabel: `${pct24h >= 0 ? '+' : ''}${pct24h}% 24J`,
            change24h: pct24h,
            url: `https://www.coingecko.com/en/coins/${coin.id}`,
            timestamp: 'Trending 24J',
            timestampMs: nowMs - 120000,
            wibTime: formatWib().wibString,
          });
          sourceStats.coingecko++;
        });
      }
    } catch {}
  })();

  const dexScreenerPromise = (async () => {
    try {
      const r = await fetch('https://api.dexscreener.com/token-boosts/top/v1', {
        signal: AbortSignal.timeout(4000),
      });
      if (!r.ok) return;
      const tokens = await r.json();
      if (!Array.isArray(tokens)) return;
      tokens.slice(0, 6).forEach((t: any, idx: number) => {
        const desc = (t.description || '').replace(/\s+/g, ' ').trim();
        const chain = String(t.chainId || 'onchain').toUpperCase();
        const shortAddr = t.tokenAddress ? `${t.tokenAddress.slice(0, 6)}...${t.tokenAddress.slice(-4)}` : 'Token';
        const { theme } = classifyTheme(`${desc} ${chain} meme`);
        pushNarrative({
          id: `ds-boost-${t.tokenAddress || idx}`,
          title: `[${chain}] On-Chain Boosted Meta: ${desc ? desc.slice(0, 95) : shortAddr}`,
          summary: desc || `Aktivitas boost komunitas di jaringan ${chain}.`,
          source: `DexScreener (${chain})`,
          sourceType: 'DEXSCREENER',
          narrativeTheme: theme === 'Layer 1' ? 'Meme & Viral' : theme,
          sentiment: 'VIRAL',
          metricLabel: t.totalAmount ? `${t.totalAmount} Boosts` : `${chain} DEX`,
          url: t.url || 'https://dexscreener.com',
          timestamp: 'On-Chain Live',
          timestampMs: nowMs - 90000 - idx * 1000,
          wibTime: formatWib().wibString,
        });
        sourceStats.dexscreener++;
      });
    } catch {}
  })();

  const geckoTerminalPromise = (async () => {
    try {
      const r = await fetch('https://api.geckoterminal.com/api/v2/networks/trending_pools', {
        signal: AbortSignal.timeout(4000),
      });
      if (!r.ok) return;
      const json = await r.json();
      const pools = json?.data;
      if (!Array.isArray(pools)) return;
      pools.slice(0, 5).forEach((p: any, idx: number) => {
        const attr = p?.attributes;
        if (!attr?.name) return;
        const chg24 = Number(parseFloat(attr?.price_change_percentage?.h24 || '0').toFixed(2));
        const vol24 = parseFloat(attr?.volume_usd?.h24 || '0');
        const volStr = vol24 >= 1e6 ? `$${(vol24 / 1e6).toFixed(1)}M` : `$${(vol24 / 1e3).toFixed(0)}K`;
        const net = p?.relationships?.network?.data?.id || 'DEX';
        pushNarrative({
          id: `gt-pool-${p.id || idx}`,
          title: `Pool DEX Trending (${String(net).toUpperCase()}): ${attr.name} · Vol ${volStr}`,
          summary: `Likuiditas DEX ${attr.name} mencatat volume 24J ${volStr} (${chg24 >= 0 ? '+' : ''}${chg24}%).`,
          source: 'GeckoTerminal DEX API',
          sourceType: 'GECKOTERMINAL',
          narrativeTheme: 'DeFi & On-Chain',
          sentiment: chg24 >= 5 ? 'VIRAL' : chg24 >= 0 ? 'BULLISH' : 'BEARISH',
          metricLabel: `${chg24 >= 0 ? '+' : ''}${chg24}% · ${volStr}`,
          change24h: chg24,
          url: `https://www.geckoterminal.com/${net}/pools/${attr.address || ''}`,
          timestamp: '24J DEX Pool',
          timestampMs: nowMs - 150000 - idx * 1000,
          wibTime: formatWib().wibString,
        });
        sourceStats.geckoterminal++;
      });
    } catch {}
  })();

  const hnPromise = (async () => {
    try {
      const r = await fetch(
        'https://hn.algolia.com/api/v1/search_by_date?query=bitcoin+OR+crypto+OR+ethereum+OR+solana+OR+stablecoin&tags=story&hitsPerPage=10',
        { signal: AbortSignal.timeout(4000) }
      );
      if (!r.ok) return;
      const data = await r.json();
      if (!Array.isArray(data?.hits)) return;
      data.hits.slice(0, 6).forEach((h: any) => {
        if (!h?.title) return;
        const { theme, sentiment } = classifyTheme(h.title);
        const { wibString, timeAgo, timestampMs } = formatWib(h.created_at);
        pushNarrative({
          id: `hn-${h.objectID}`,
          title: h.title,
          summary: `Diskusi builder di Hacker News (${h.points || 1} poin, ${h.num_comments || 0} komentar).`,
          source: 'HackerNews Crypto API',
          sourceType: 'HACKERNEWS',
          narrativeTheme: theme,
          sentiment,
          metricLabel: `${h.points || 1} pts · ${h.num_comments || 0} cmt`,
          url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
          timestamp: timeAgo,
          timestampMs,
          wibTime: wibString,
        });
        sourceStats.hackernews++;
      });
    } catch {}
  })();

  const rssFeeds = [
    { source: 'CoinTelegraph', url: 'https://cointelegraph.com/rss' },
    { source: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/' },
    { source: 'Decrypt', url: 'https://decrypt.co/feed' },
    { source: 'The Block', url: 'https://www.theblock.co/rss.xml' },
    { source: 'Blockworks', url: 'https://blockworks.co/feed' },
  ];

  const rssPromises = rssFeeds.map(async (f) => {
    try {
      const r = await fetch(f.url, { signal: AbortSignal.timeout(4000) });
      if (!r.ok) return;
      const xml = await r.text();
      const feed = await rssParser.parseString(xml);
      if (Array.isArray(feed?.items)) {
        feed.items.slice(0, 5).forEach((item, idx) => {
          const title = (item.title || '').replace(/<[^>]*>/g, '').trim();
          if (!title) return;
          const summary = (item.contentSnippet || item.content || title)
            .replace(/<[^>]*>/g, '')
            .trim()
            .slice(0, 240);
          const { theme, sentiment } = classifyTheme(`${title} ${summary}`);
          const { wibString, timeAgo, timestampMs } = formatWib(item.pubDate || item.isoDate);
          pushNarrative({
            id: `rss-${f.source.toLowerCase().replace(/\s+/g, '')}-${idx}-${timestampMs}`,
            title,
            summary,
            source: f.source,
            sourceType: 'RSS',
            narrativeTheme: theme,
            sentiment,
            url: item.link || 'https://cointelegraph.com',
            timestamp: timeAgo,
            timestampMs,
            wibTime: wibString,
          });
          sourceStats.rss++;
        });
      }
    } catch {}
  });

  await Promise.allSettled([
    cgCategoriesPromise,
    cgTrendingPromise,
    dexScreenerPromise,
    geckoTerminalPromise,
    hnPromise,
    ...rssPromises,
  ]);

  narratives.sort((a, b) => (b.timestampMs || 0) - (a.timestampMs || 0));

  return res.status(200).json({
    success: true,
    timestamp: nowMs,
    wibNow: formatWib().wibString,
    count: narratives.length,
    hotSectors,
    sourceStats,
    narratives,
  });
}
