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

## Building for Production

To create a production-ready build:

```bash
npm run build
```

The output will be in the `dist` directory.

## License

MIT