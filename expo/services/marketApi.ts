const ALPHA_VANTAGE_KEY = '0HFXKJZSXV4WJMPI';
const FINNHUB_TOKEN = 'd72ivvpr01qlfd9nee2gd72ivvpr01qlfd9nee30';

const ALPHA_VANTAGE_BASE = 'https://www.alphavantage.co/query';
const FINNHUB_BASE = 'https://finnhub.io/api/v1';

export interface FinnhubQuote {
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
}

export interface AlphaVantageGlobalQuote {
  '01. symbol': string;
  '02. open': string;
  '03. high': string;
  '04. low': string;
  '05. price': string;
  '06. volume': string;
  '07. latest trading day': string;
  '08. previous close': string;
  '09. change': string;
  '10. change percent': string;
}

export async function fetchFinnhubQuote(symbol: string): Promise<FinnhubQuote | null> {
  try {
    const url = `${FINNHUB_BASE}/quote?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_TOKEN}`;
    console.log(`[API] Finnhub fetch: ${symbol}`);
    const res = await fetch(url);
    if (!res.ok) {
      console.log(`[API] Finnhub error for ${symbol}: ${res.status}`);
      return null;
    }
    const data = await res.json() as FinnhubQuote;
    if (data.c === 0 && data.d === null && data.dp === null) {
      console.log(`[API] Finnhub no data for ${symbol}`);
      return null;
    }
    console.log(`[API] Finnhub ${symbol}: price=${data.c}, change=${data.d}, dp=${data.dp}`);
    return data;
  } catch (err) {
    console.log(`[API] Finnhub error for ${symbol}:`, err);
    return null;
  }
}

export async function fetchAlphaVantageQuote(symbol: string): Promise<AlphaVantageGlobalQuote | null> {
  try {
    const url = `${ALPHA_VANTAGE_BASE}?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${ALPHA_VANTAGE_KEY}`;
    console.log(`[API] Alpha Vantage fetch: ${symbol}`);
    const res = await fetch(url);
    if (!res.ok) {
      console.log(`[API] Alpha Vantage error for ${symbol}: ${res.status}`);
      return null;
    }
    const data = await res.json() as { 'Global Quote'?: AlphaVantageGlobalQuote; Note?: string; Information?: string };
    if (data.Note || data.Information) {
      console.log(`[API] Alpha Vantage rate limit: ${data.Note || data.Information}`);
      return null;
    }
    const quote = data['Global Quote'];
    if (!quote || !quote['05. price']) {
      console.log(`[API] Alpha Vantage no data for ${symbol}`);
      return null;
    }
    console.log(`[API] Alpha Vantage ${symbol}: price=${quote['05. price']}, change=${quote['09. change']}`);
    return quote;
  } catch (err) {
    console.log(`[API] Alpha Vantage error for ${symbol}:`, err);
    return null;
  }
}

export const FINNHUB_SYMBOLS = [
  'AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA',
  'SPY', 'QQQ', 'DIA', 'IWM',
  'SOXX', 'XLK', 'XLF', 'XLE', 'XLY', 'XLP', 'XLI', 'XLB',
  'XLC', 'XLU', 'XLV', 'XLRE', 'XBI', 'ICLN', 'HACK', 'GDX',
  'ITA', 'BITO', 'IBB',
] as const;

export const ALPHA_VANTAGE_SYMBOLS = [
  'SPY', 'QQQ', 'DIA', 'AAPL', 'TSLA',
] as const;

export interface NormalizedQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  volume?: number;
  source: 'finnhub' | 'alphavantage';
}

export function normalizeFinnhubQuote(symbol: string, q: FinnhubQuote): NormalizedQuote {
  return {
    symbol,
    price: q.c,
    change: q.d ?? 0,
    changePercent: q.dp ?? 0,
    high: q.h,
    low: q.l,
    open: q.o,
    prevClose: q.pc,
    source: 'finnhub',
  };
}

export function normalizeAlphaVantageQuote(q: AlphaVantageGlobalQuote): NormalizedQuote {
  return {
    symbol: q['01. symbol'],
    price: parseFloat(q['05. price']),
    change: parseFloat(q['09. change']),
    changePercent: parseFloat(q['10. change percent']?.replace('%', '') ?? '0'),
    high: parseFloat(q['03. high']),
    low: parseFloat(q['04. low']),
    open: parseFloat(q['02. open']),
    prevClose: parseFloat(q['08. previous close']),
    volume: parseInt(q['06. volume'], 10) || undefined,
    source: 'alphavantage',
  };
}

export async function fetchBatchQuotesFinnhub(symbols: string[]): Promise<Map<string, NormalizedQuote>> {
  const results = new Map<string, NormalizedQuote>();
  const batchSize = 8;
  
  for (let i = 0; i < symbols.length; i += batchSize) {
    const batch = symbols.slice(i, i + batchSize);
    const promises = batch.map(async (sym) => {
      const q = await fetchFinnhubQuote(sym);
      if (q && q.c > 0) {
        results.set(sym, normalizeFinnhubQuote(sym, q));
      }
    });
    await Promise.all(promises);
    
    if (i + batchSize < symbols.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  
  console.log(`[API] Batch Finnhub: fetched ${results.size}/${symbols.length} quotes`);
  return results;
}

export async function fetchQuoteWithFallback(symbol: string): Promise<NormalizedQuote | null> {
  const finnhub = await fetchFinnhubQuote(symbol);
  if (finnhub && finnhub.c > 0) {
    return normalizeFinnhubQuote(symbol, finnhub);
  }
  
  const av = await fetchAlphaVantageQuote(symbol);
  if (av) {
    return normalizeAlphaVantageQuote(av);
  }
  
  return null;
}
