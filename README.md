# Charter 📈

Charter is a high-performance financial data visualization dashboard built for speed and simplicity. It features a responsive multi-chart grid layout capable of rendering real-time market data simulations and live data from multiple global providers.

![Charter Dashboard](https://github.com/user-attachments/assets/placeholder-image)

## 🚀 Key Features

- **High-Performance Charting:** Powered by [TradingView Lightweight Charts™](https://github.com/tradingview/lightweight-charts), ensuring smooth 60fps rendering even with high-frequency updates.
- **Full-Stack Architecture:** A seamless integration of a React 19 frontend and a Cloudflare Worker backend proxy.
- **Smart Data Fallback Chain:** Automatically cycles through multiple market data providers to maximize data availability and respect free-tier rate limits.
- **Dynamic Multi-Chart Grid:** Add, remove, and reorganize charts on the fly. Monitor Stocks, Crypto, and Forex in a single unified view.
- **Local Simulation Mode:** Robust client-side data generator allows for offline development and testing without API keys.
- **Edge Optimized:** Built to run efficiently on Cloudflare's global edge network.

## 📡 API Providers

The application aggregates data from several providers using an intelligent fallback mechanism:

| Provider | Data Type | Key Required | Description |
| :--- | :--- | :--- | :--- |
| **Binance (.com)** | Crypto | No | Primary source for crypto pairs. High rate limits. |
| **Binance (.us)** | Crypto | No | Secondary source for US-based crypto pairs. |
| **Alpha Vantage** | Stocks/Forex | Yes | Primary source for equities. Used as the first tier for stocks. |
| **Finnhub** | Stocks/Forex | Yes | Secondary source for equities. Reliable fallback. |

## 🛠 Tech Stack

- **Frontend:** React 19, TypeScript, CSS Modules
- **Backend/API:** Cloudflare Workers (TypeScript)
- **Visualization:** Lightweight Charts v5
- **Build System:** Vite (aliased to Rolldown)
- **Deployment:** Cloudflare Pages & Workers

## 📂 Project Structure

```text
├── src/
│   ├── worker.ts          # Cloudflare Worker (Backend API Proxy & Asset Server)
│   ├── services/
│   │   └── marketData.ts  # Frontend service for API communication
│   ├── components/        # React components (ChartComponent, UI elements)
│   ├── utils/             # Data simulation, formatting, and timezone helpers
│   ├── App.tsx            # Main application logic and grid management
│   └── main.tsx           # Application entry point
├── wrangler.json          # Cloudflare configuration (Assets & Worker settings)
├── vite.config.ts         # Vite configuration with local API proxy
└── CLOUD_LIMITS_ANALYSIS.md # Deep dive into API and Cloudflare limits
```

## 💻 Getting Started

### Prerequisites

- **Node.js:** v18 or higher
- **npm:** Included with Node.js

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd charter
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Local Development

#### 1. Frontend Development (HMR)
```bash
npm run dev
```
*Note: This proxies `/api` requests to `http://127.0.0.1:8787`. Run the worker below to see live data.*

#### 2. Backend Development (Worker)
```bash
npx wrangler dev
```

## ⚙️ Configuration & Secrets

To use live Stock/Forex data, you must provide API keys in the environment.

### Local Environment (`.dev.vars`)
Create a `.dev.vars` file in the root directory:
```env
VITE_ALPHAVANTAGE_KEY=your_alphavantage_key
VITE_FINNHUB_KEY=your_finnhub_key
```

### Production Secrets
Upload your secrets securely to Cloudflare:
```bash
npx wrangler secret put VITE_ALPHAVANTAGE_KEY
npx wrangler secret put VITE_FINNHUB_KEY
```

## 🚢 Deployment

```bash
npm run deploy
```

## 📄 License

MIT
