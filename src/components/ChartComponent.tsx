import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CrosshairMode, CandlestickSeries, HistogramSeries } from 'lightweight-charts';
import type { ISeriesApi, Time } from 'lightweight-charts';
import { generateInitialData, generateNextBar, updateBar } from '../utils/dataGenerator';
import type { CandleData, HistogramData } from '../utils/dataGenerator';
import { createTimezoneFormatters } from '../utils/timezoneUtils';

interface ChartComponentProps {
    symbol: string;
    color?: string;
    onClose?: () => void;
    onSymbolChange?: (symbol: string) => void;
    timezone?: string;
}

export const ChartComponent: React.FC<ChartComponentProps> = ({ symbol, onClose, onSymbolChange, timezone = 'Local' }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
    const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
    
    const lastCandleRef = useRef<CandleData | null>(null);
    const lastVolumeRef = useRef<HistogramData | null>(null);

    // Reset data when symbol changes
    useEffect(() => {
        if (!candlestickSeriesRef.current || !volumeSeriesRef.current) return;

        // Generate new random data for the new symbol
        // Use a seeded random or just random start price to make it look different
        const startPrice = Math.random() * 1000 + 50;
        const { candles, volume } = generateInitialData(500, startPrice);
        
        const chartCandles = candles.map(c => ({ ...c, time: c.time as Time }));
        const chartVolume = volume.map(v => ({ ...v, time: v.time as Time }));

        candlestickSeriesRef.current.setData(chartCandles);
        volumeSeriesRef.current.setData(chartVolume);
        
        lastCandleRef.current = candles[candles.length - 1];
        lastVolumeRef.current = volume[volume.length - 1];
        
        if (chartRef.current) {
            chartRef.current.timeScale().fitContent();
        }
    }, [symbol]);

    // Initialize Chart
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const initChart = (width: number, height: number) => {
             const formatters = createTimezoneFormatters(timezone);
             
             const chart = createChart(chartContainerRef.current!, {
                layout: {
                    background: { type: ColorType.Solid, color: '#1a1a1a' },
                    textColor: '#d1d4dc',
                },
                grid: {
                    vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
                    horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
                },
                crosshair: {
                    mode: CrosshairMode.Normal,
                },
                rightPriceScale: {
                    borderColor: 'rgba(197, 203, 206, 0.8)',
                },
                timeScale: {
                    borderColor: 'rgba(197, 203, 206, 0.8)',
                    timeVisible: true,
                    secondsVisible: false,
                    tickMarkFormatter: formatters.timeScale.tickMarkFormatter,
                },
                localization: {
                    timeFormatter: formatters.localization.timeFormatter,
                },
                width: width,
                height: height,
            });

            const candlestickSeries = chart.addSeries(CandlestickSeries, {
                upColor: '#26a69a',
                downColor: '#ef5350',
                borderVisible: false,
                wickUpColor: '#26a69a',
                wickDownColor: '#ef5350',
            });

            const volumeSeries = chart.addSeries(HistogramSeries, {
                priceFormat: {
                    type: 'volume',
                },
                priceScaleId: '', // Set as an overlay
            });

            volumeSeries.priceScale().applyOptions({
                scaleMargins: {
                    top: 0.8, // Highest volume bar will be 80% down the chart
                    bottom: 0,
                },
            });

            chartRef.current = chart;
            candlestickSeriesRef.current = candlestickSeries;
            volumeSeriesRef.current = volumeSeries;

            // Generate and set initial data
            const { candles, volume } = generateInitialData(500, Math.random() * 1000 + 50);
            
            // Transform data to match strict Time type
            const chartCandles = candles.map(c => ({ ...c, time: c.time as Time }));
            const chartVolume = volume.map(v => ({ ...v, time: v.time as Time }));

            candlestickSeries.setData(chartCandles);
            volumeSeries.setData(chartVolume);
            
            lastCandleRef.current = candles[candles.length - 1];
            lastVolumeRef.current = volume[volume.length - 1];

            chart.timeScale().fitContent();
        };

        const resizeObserver = new ResizeObserver((entries) => {
            if (!entries[0]) return;
            const { width, height } = entries[0].contentRect;
            
            if (width === 0 || height === 0) return;

            if (chartRef.current) {
                chartRef.current.applyOptions({ width, height });
            } else {
                initChart(width, height);
            }
        });

        resizeObserver.observe(chartContainerRef.current);

        return () => {
            resizeObserver.disconnect();
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
                candlestickSeriesRef.current = null;
                volumeSeriesRef.current = null;
            }
        };
    }, []); // Init only once.

    // Handle Timezone Update
    useEffect(() => {
        if (chartRef.current) {
            const formatters = createTimezoneFormatters(timezone);
            chartRef.current.applyOptions({
                localization: formatters.localization,
                timeScale: formatters.timeScale,
            });
        }
    }, [timezone]);

    // Live Data Simulation
    useEffect(() => {
        const interval = setInterval(() => {
            if (lastCandleRef.current && lastVolumeRef.current && candlestickSeriesRef.current && volumeSeriesRef.current) {
                const now = Math.floor(Date.now() / 1000);
                const nextMinute = lastCandleRef.current.time + 60;
                
                let candle: CandleData;
                let volume: HistogramData;

                if (now >= nextMinute) {
                    // Start new bar
                    const next = generateNextBar(lastCandleRef.current);
                    candle = next.candle;
                    volume = next.volume;
                } else {
                    // Update current bar
                    const updated = updateBar(lastCandleRef.current, lastVolumeRef.current);
                    candle = updated.candle;
                    volume = updated.volume;
                }
                
                candlestickSeriesRef.current.update({ ...candle, time: candle.time as Time });
                volumeSeriesRef.current.update({ ...volume, time: volume.time as Time });
                
                lastCandleRef.current = candle;
                lastVolumeRef.current = volume;
            }
        }, 200); // 200ms updates

        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', border: '1px solid #333', display: 'flex', flexDirection: 'column' }}>
            <div style={{ 
                position: 'absolute', 
                top: 8, 
                left: 8, 
                zIndex: 10, 
                display: 'flex', 
                gap: '8px',
                alignItems: 'center',
                background: 'rgba(0,0,0,0.5)',
                padding: '4px 8px',
                borderRadius: '4px',
                backdropFilter: 'blur(4px)'
            }}>
                <input 
                    type="text" 
                    value={symbol} 
                    onChange={(e) => onSymbolChange?.(e.target.value)}
                    style={{ 
                        fontWeight: 'bold', 
                        fontSize: '14px', 
                        background: 'transparent', 
                        border: 'none', 
                        color: 'inherit',
                        width: '80px',
                        outline: 'none'
                    }}
                />
                {onClose && (
                    <button 
                        onClick={onClose}
                        style={{ 
                            padding: '2px 6px', 
                            fontSize: '12px', 
                            background: 'transparent', 
                            border: '1px solid #555',
                            lineHeight: 1
                        }}
                    >
                        ✕
                    </button>
                )}
            </div>
            <div ref={chartContainerRef} style={{ flex: 1, width: '100%' }} />
        </div>
    );
};
