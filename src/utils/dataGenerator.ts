export interface CandleData {
    time: number; // Unix timestamp
    open: number;
    high: number;
    low: number;
    close: number;
}

export interface HistogramData {
    time: number;
    value: number;
    color?: string;
}

// Generate a random number between min and max
const random = (min: number, max: number) => Math.random() * (max - min) + min;

export const generateInitialData = (count: number = 1000, startPrice: number = 100): { candles: CandleData[], volume: HistogramData[] } => {
    const candles: CandleData[] = [];
    const volume: HistogramData[] = [];
    let currentPrice = startPrice;
    
    // Align to nearest minute
    const now = Math.floor(Date.now() / 1000);
    let currentTime = now - count * 60; 

    for (let i = 0; i < count; i++) {
        const volatility = 0.005; // 0.5% volatility
        const change = currentPrice * volatility * random(-1, 1);
        const open = currentPrice;
        const close = currentPrice + change;
        const high = Math.max(open, close) + currentPrice * volatility * random(0, 0.5);
        const low = Math.min(open, close) - currentPrice * volatility * random(0, 0.5);

        // Volume logic
        const volumeValue = Math.floor(random(100, 1000) * (1 + Math.abs(change) * 10));
        const color = close >= open ? '#26a69a' : '#ef5350';

        const candle: CandleData = {
            time: currentTime,
            open,
            high,
            low,
            close
        };

        candles.push(candle);
        volume.push({
            time: currentTime,
            value: volumeValue,
            color: color
        });

        currentPrice = close;
        currentTime += 60; 
    }

    return { candles, volume };
};

export const generateNextBar = (lastBar: CandleData): { candle: CandleData, volume: HistogramData } => {
    const nextTime = lastBar.time + 60;
    // Open at last close
    const open = lastBar.close;
    // Initial state of new bar is just the open price
    const close = open;
    const high = open;
    const low = open;

    return {
        candle: {
            time: nextTime,
            open,
            high,
            low,
            close
        },
        volume: {
            time: nextTime,
            value: 0, // Reset volume
            color: '#26a69a'
        }
    };
};

export const updateBar = (currentBar: CandleData, currentVolume: HistogramData): { candle: CandleData, volume: HistogramData } => {
    const volatility = 0.001; // Smaller volatility for tick updates
    const change = currentBar.close * volatility * random(-1, 1);
    const close = currentBar.close + change;
    const high = Math.max(currentBar.high, close);
    const low = Math.min(currentBar.low, close);
    
    // Add some volume
    const newVolume = currentVolume.value + Math.floor(random(1, 10));
    const color = close >= currentBar.open ? '#26a69a' : '#ef5350';

    return {
        candle: {
            ...currentBar,
            high,
            low,
            close
        },
        volume: {
            ...currentVolume,
            value: newVolume,
            color
        }
    };
};
