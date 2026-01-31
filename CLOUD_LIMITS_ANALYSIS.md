# Cloudflare Workers & API Usage Analysis

This document outlines the expected resource usage and potential limitations for the Charter application on the Cloudflare Workers Free Tier.

## 1. Cloudflare Workers (Free Tier)

Cloudflare's Free Tier is highly generous for proxy-style applications like this.

| Resource | Free Tier Limit | Charter Usage | Verdict |
| :--- | :--- | :--- | :--- |
| **Requests** | 100,000 / day | 1 request per chart load/refresh | **Safe.** Requires >100k daily chart interactions. |
| **CPU Time** | 10ms per request | ~1-2ms (parsing & formatting) | **Safe.** Most time is spent waiting for external APIs (I/O), which is free. |
| **Subrequests** | 50 per request | 1-2 fetches per worker execution | **Safe.** We only fetch from one provider at a time. |

## 2. External Market Data Providers

The primary bottleneck for this application is not Cloudflare, but the rate limits of the free API keys used for market data.

| Provider | Free Tier Limit | Behavior in Charter |
| :--- | :--- | :--- |
| **Binance** | High (Weight based) | Primary source. Extremely reliable for Crypto. No key required. |
| **Finnhub** | 60 requests / minute | Secondary source. Good for Stocks/Forex. |
| **Alpha Vantage** | 25 requests / day | Tertiary source. Very restrictive; used as a last resort. |
| **Massive** | 5 requests / minute | Currently not implemented in `worker.ts`, but listed in `.env`. |

## 3. Operational Logic & Cost Efficiency

The application is architected to minimize "expensive" API calls by following a fallback chain in `src/worker.ts`:

1. **Binance (Free/Unlimited):** Checked first. If the symbol is a crypto pair (e.g., BTCUSDT), it handles the request without consuming "expensive" stock API credits.
2. **Alpha Vantage:** Checked next if Binance fails.
3. **Finnhub:** Checked last.

## 4. Scalability Warnings

- **Traffic Spikes:** If the site receives more than 25 unique stock symbol requests in a day, Alpha Vantage will start returning errors.
- **Concurrent Users:** If 10+ users are active simultaneously and refreshing stock charts every minute, Finnhub's 60/min limit may be reached.
- **Solution:** For higher traffic, consider implementing **Cloudflare KV (Key-Value) Cache** to cache API responses for 1 minute, preventing redundant calls to external providers for the same symbol.
