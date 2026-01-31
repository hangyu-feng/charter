// src/worker.ts
import { CandleData, HistogramData } from './utils/dataGenerator';

// Env interface for TS
interface Env {
    VITE_ALPHAVANTAGE_KEY?: string;
    VITE_POLYGON_KEY?: string;
    VITE_FINNHUB_KEY?: string;
    ASSETS: { fetch: (request: Request) => Promise<Response> };
}

// Helper to convert MS timestamp to Seconds
const toSeconds = (ms: number) => Math.floor(ms / 1000);

async function fetchBinanceCandles(symbol: string): Promise<{ candles: CandleData[], volume: HistogramData[] } | null> {
    try {
        const normalizedSymbol = symbol.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${normalizedSymbol}&interval=1m&limit=500`);
        if (!response.ok) return null;
        const data = await response.json();
        
        const candles: CandleData[] = [];
        const volume: HistogramData[] = [];

        data.forEach((k: any) => {
            const time = toSeconds(k[0]);
            const open = parseFloat(k[1]);
            const high = parseFloat(k[2]);
            const low = parseFloat(k[3]);
            const close = parseFloat(k[4]);
            const vol = parseFloat(k[5]);
            const color = close >= open ? '#26a69a' : '#ef5350';
            candles.push({ time, open, high, low, close });
            volume.push({ time, value: vol, color });
        });
        return { candles, volume };
    } catch (e) {
        console.error("Binance fetch failed:", e);
        return null;
    }
}

async function fetchAlphaVantageCandles(symbol: string, apiKey?: string): Promise<{ candles: CandleData[], volume: HistogramData[] } | null> {
    if (!apiKey) return null;
    try {
        const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=1min&apikey=${apiKey}`);
        const data = await response.json();
        if (data["Error Message"] || data["Note"] || !data["Time Series (1min)"]) return null;

        const timeSeries = data["Time Series (1min)"];
        const candles: CandleData[] = [];
        const volume: HistogramData[] = [];
        const keys = Object.keys(timeSeries).sort();

        keys.forEach(key => {
            const point = timeSeries[key];
            const time = Math.floor(new Date(key).getTime() / 1000);
            const open = parseFloat(point["1. open"]);
            const high = parseFloat(point["2. high"]);
            const low = parseFloat(point["3. low"]);
            const close = parseFloat(point["4. close"]);
            const vol = parseFloat(point["5. volume"]);
            const color = close >= open ? '#26a69a' : '#ef5350';
            candles.push({ time, open, high, low, close });
            volume.push({ time, value: vol, color });
        });
        return { candles, volume };
    } catch (e) {
        console.error("Alpha Vantage fetch failed:", e);
        return null;
    }
}

async function fetchFinnhubCandles(symbol: string, apiKey?: string): Promise<{ candles: CandleData[], volume: HistogramData[] } | null> {
    if (!apiKey) return null;
    try {
        const to = Math.floor(Date.now() / 1000);
        const from = to - (60 * 60 * 24); 
        const response = await fetch(`https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=1&from=${from}&to=${to}&token=${apiKey}`);
        const data = await response.json();
        if (data.s !== 'ok') return null;

        const candles: CandleData[] = [];
        const volume: HistogramData[] = [];
        for(let i=0; i < data.t.length; i++) {
             const time = data.t[i];
             const open = data.o[i];
             const high = data.h[i];
             const low = data.l[i];
             const close = data.c[i];
             const vol = data.v[i];
             const color = close >= open ? '#26a69a' : '#ef5350';
             candles.push({ time, open, high, low, close });
             volume.push({ time, value: vol, color });
        }
        return { candles, volume };
    } catch(e) {
         console.error("Finnhub fetch failed:", e);
         return null;
    }
}

export default {
    async fetch(request: Request, env: Env) {
        const url = new URL(request.url);

        // API Route: /api/market-data?symbol=...
        if (url.pathname === '/api/market-data') {
            const symbol = url.searchParams.get('symbol');
            if (!symbol) return new Response('Missing symbol', { status: 400 });

            // 1. Binance
            const binanceData = await fetchBinanceCandles(symbol);
            if (binanceData && binanceData.candles.length > 0) {
                return new Response(JSON.stringify({ ...binanceData, source: 'Binance' }), { headers: { 'Content-Type': 'application/json' }});
            }

            // 2. Alpha Vantage
            const avData = await fetchAlphaVantageCandles(symbol, env.VITE_ALPHAVANTAGE_KEY);
            if (avData && avData.candles.length > 0) {
                return new Response(JSON.stringify({ ...avData, source: 'Alpha Vantage' }), { headers: { 'Content-Type': 'application/json' }});
            }

            // 3. Finnhub
            const finnData = await fetchFinnhubCandles(symbol, env.VITE_FINNHUB_KEY);
            if (finnData && finnData.candles.length > 0) {
                return new Response(JSON.stringify({ ...finnData, source: 'Finnhub' }), { headers: { 'Content-Type': 'application/json' }});
            }

            return new Response(JSON.stringify(null), { headers: { 'Content-Type': 'application/json' }});
        }

        // Static Assets Fallback
        return env.ASSETS.fetch(request);
    }
};
