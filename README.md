# Charter

Charter is a high-performance financial data visualization dashboard built for speed and simplicity. It features a responsive multi-chart grid layout capable of rendering real-time market data simulations with minimal resource overhead.

![Charter Dashboard](https://github.com/user-attachments/assets/placeholder-image)

## Features

- **High-Performance Charting:** Powered by [TradingView Lightweight Charts™](https://github.com/tradingview/lightweight-charts), ensuring smooth 60fps rendering even with high-frequency data updates.
- **Multi-Chart Grid:** Dynamic grid layout that adapts to your screen size. Add or remove charts on the fly to monitor multiple assets simultaneously.
- **Real-Time Data Simulation:** Includes a robust client-side data generator that streams realistic Candlestick (OHLC) and Volume data, simulating live market conditions without external API dependencies.
- **Modern Tech Stack:** Built with React 19, TypeScript, and Vite for a lightning-fast development experience and type-safe codebase.
- **Dark Mode:** Sleek, distraction-free dark interface optimized for prolonged viewing.

## Tech Stack

- **Frontend Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Charting Library:** lightweight-charts (v5.x)
- **Styling:** CSS Modules / Vanilla CSS

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd charter
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser at `http://localhost:5173`

## Configuration & API Keys

This project uses Cloudflare Workers for the backend proxy. You will need API keys for the market data providers (Alpha Vantage, Finnhub, etc.).

### Local Development

For local testing, create a `.dev.vars` file in the project root:

1. Create the file:
   ```bash
   touch .dev.vars
   ```

2. Add your keys:
   ```env
   VITE_ALPHAVANTAGE_KEY=your_actual_key
   VITE_FINNHUB_KEY=your_actual_key
   VITE_MASSIVE_KEY=your_actual_key
   ```
   *Note: `.dev.vars` is git-ignored to keep your secrets safe.*

### Cloudflare Deployment

To deploy to Cloudflare, you must upload your secrets securely using Wrangler:

1. **Upload Secrets:**
   ```bash
   npx wrangler secret put VITE_ALPHAVANTAGE_KEY
   npx wrangler secret put VITE_FINNHUB_KEY
   npx wrangler secret put VITE_MASSIVE_KEY
   ```
   *You will be prompted to paste the value for each key.*

2. **Deploy:**
   ```bash
   npm run deploy
   ```
   *(Or `npx wrangler deploy`)*

## Building for Production

To create a production-ready build:

```bash
npm run build
```

The output will be in the `dist` directory.

## Self-Hosting on Linux

If you prefer to host this on a traditional Linux server (e.g., Ubuntu/Debian) instead of Cloudflare Workers:

1. **Build the Frontend:**
   ```bash
   npm run build
   ```
   This generates static files in the `dist/` folder.

2. **Set up a Web Server (Nginx example):**
   - Install Nginx: `sudo apt install nginx`
   - Copy the `dist/` contents to `/var/www/charter`
   - Configure a new site in `/etc/nginx/sites-available/charter`:
     ```nginx
     server {
         listen 80;
         server_name your-domain.com;
         root /var/www/charter;
         index index.html;

         location / {
             try_files $uri $uri/ /index.html;
         }

         # Optional: Proxy API requests if you move the worker logic to a local Node.js server
         # location /api/ {
         #     proxy_pass http://localhost:3000;
         # }
     }
     ```
   - Enable the site: `sudo ln -s /etc/nginx/sites-available/charter /etc/nginx/sites-enabled/`
   - Restart Nginx: `sudo systemctl restart nginx`

3. **Backend Logic:**
   Since the current backend logic is in `src/worker.ts` (Cloudflare Worker), you would need to adapt this code to a standard Node.js Express server or similar if you need the API proxying features on your Linux host.

## License

MIT