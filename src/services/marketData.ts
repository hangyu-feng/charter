import type { CandleData, HistogramData } from '../utils/dataGenerator';

export async function fetchMarketData(symbol: string): Promise<{ candles: CandleData[], volume: HistogramData[], source: string } | null> {
    try {
        const response = await fetch(`/api/market-data?symbol=${symbol}`);
        if (!response.ok) return null;
        
        const data = await response.json();
        return data; // returns { candles, volume, source } or null
    } catch (e) {
        console.error("Fetch market data failed:", e);
        return null;
    }
}