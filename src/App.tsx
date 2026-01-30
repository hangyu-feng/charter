import { useState, useRef, useEffect } from 'react';
import './App.css';
import { ChartComponent } from './components/ChartComponent';
import { TIMEZONES } from './utils/timezoneUtils';
import { SettingsIcon } from './components/SettingsIcon';

interface ChartInstance {
  id: string;
  symbol: string;
}

const SYMBOLS = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'BTCUSD', 'ETHUSD', 'SPX', 'NDX'];

function App() {
  const [charts, setCharts] = useState<ChartInstance[]>([
    { id: '1', symbol: 'BTCUSD' },
    { id: '2', symbol: 'ETHUSD' }
  ]);
  const [timezone, setTimezone] = useState('Local');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  const addChart = () => {
    const randomSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    const newChart: ChartInstance = {
      id: Math.random().toString(36).substr(2, 9),
      symbol: randomSymbol
    };
    setCharts([...charts, newChart]);
  };

  const removeChart = (id: string) => {
    setCharts(charts.filter(c => c.id !== id));
  };

  const updateChartSymbol = (id: string, newSymbol: string) => {
    setCharts(charts.map(c => c.id === id ? { ...c, symbol: newSymbol } : c));
  };

  // Close settings on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">Charter</div>
        <div className="controls">
          <button onClick={addChart}>+ Add Chart</button>
          
          <div className="settings-container" ref={settingsRef}>
            <button 
              className={`settings-button ${isSettingsOpen ? 'active' : ''}`}
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              title="Settings"
            >
              <SettingsIcon />
            </button>
            
            {isSettingsOpen && (
              <div className="settings-dropdown">
                <div className="settings-section">
                  <label className="settings-label">Timezone</label>
                  <select 
                    value={timezone} 
                    onChange={(e) => setTimezone(e.target.value)}
                    className="settings-select"
                  >
                    {TIMEZONES.map(tz => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="chart-grid">
        {charts.map(chart => (
          <div key={chart.id} className="chart-wrapper">
            <ChartComponent 
              symbol={chart.symbol} 
              onClose={() => removeChart(chart.id)}
              onSymbolChange={(newSymbol) => updateChartSymbol(chart.id, newSymbol)}
              timezone={timezone}
            />
          </div>
        ))}
        {charts.length === 0 && (
          <div className="empty-state">
            <p>No charts active.</p>
            <button onClick={addChart}>Add a Chart</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;