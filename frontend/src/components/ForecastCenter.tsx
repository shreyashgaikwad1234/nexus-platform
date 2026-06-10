import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  LineChart as LineChartIcon, AlertTriangle, RefreshCw, DollarSign, Users, ShoppingCart
} from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { useTheme } from '../utils/useTheme';

const ForecastCenter = () => {
  const isDark = useTheme();
  const textColor = isDark ? '#f6f5f1' : '#0a0a0a';
  const gridColor = isDark ? 'rgba(246, 245, 241, 0.1)' : 'rgba(10, 10, 10, 0.1)';
  const accentColor = isDark ? '#f43f5e' : '#e11d48';

  const [forecasts, setForecasts] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState('Revenue');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const API_URL = 'https://nexus-platform-t1v1.onrender.com';
      const [fc, sum] = await Promise.all([
        fetch(`${API_URL}/forecasts`).then(res => res.json()),
        fetch(`${API_URL}/forecasts/summary`).then(res => res.json())
      ]);
      setForecasts(fc);
      setSummary(sum);
    } catch (error: any) {
      setError(`Failed to connect to Forecasting Engine.`);
    }
    setLoading(false);
  };

  if (error) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-[var(--accent)] text-center">
      <AlertTriangle size={48} className="mb-4" />
      <h1 className="text-3xl font-serif font-bold mb-2">Connection Error</h1>
      <p className="text-[var(--muted)] font-sans max-w-md">{error}</p>
      <button onClick={fetchData} className="mt-6 px-6 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold uppercase tracking-widest text-xs editorial-border shadow-editorial hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all">
        Retry
      </button>
    </div>
  );

  if (loading && !forecasts) return (
    <div className="min-h-[70vh] flex items-center justify-center font-sans font-bold uppercase tracking-widest text-[var(--text-primary)]">
      <RefreshCw className="animate-spin mr-3" /> RUNNING PROPHET MODELS...
    </div>
  );

  const getMetricIcon = (metric: string) => {
      if (metric === 'Revenue') return <DollarSign className="text-[var(--text-primary)]" />;
      if (metric === 'Orders') return <ShoppingCart className="text-[var(--text-primary)]" />;
      return <Users className="text-[var(--text-primary)]" />;
  };

  const formatValue = (metric: string, val: number) => {
      return metric === 'Revenue' ? formatCurrency(val) : formatNumber(val);
  };

  const currentData = forecasts ? forecasts[selectedMetric] : [];

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-16 mt-4">
          <div>
              <h2 className="font-serif text-5xl md:text-7xl font-bold tracking-tighter leading-none mb-4">Strategic<br/>Forecast.</h2>
              <p className="font-sans text-sm font-bold uppercase tracking-widest text-[var(--muted)]">180-Day Prophet Predictions</p>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {(summary || []).map((s: any, i: number) => (
              <div 
                  key={i} 
                  className={`bg-[var(--card-bg)] editorial-border shadow-editorial p-8 cursor-pointer hover:-translate-y-1 hover:-translate-x-1 transition-all ${selectedMetric === s.metric_name ? 'border-b-8 border-b-[var(--text-primary)] bg-[var(--bg-primary)]' : ''}`}
                  onClick={() => setSelectedMetric(s.metric_name)}
              >
                  <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-4 flex items-center gap-2">
                      {getMetricIcon(s.metric_name)} 30-Day {s.metric_name}
                  </h2>
                  <div className="text-5xl font-serif font-black text-[var(--text-primary)] mb-4">
                      {formatValue(s.metric_name, s.total_predicted)}
                  </div>
                  <div className="text-[10px] text-[var(--text-primary)] uppercase font-bold tracking-widest bg-[var(--card-bg)] inline-block px-2 py-1 editorial-border">
                      Band: {formatValue(s.metric_name, s.total_lower)} - {formatValue(s.metric_name, s.total_upper)}
                  </div>
              </div>
          ))}
      </div>

      <div className="bg-[var(--card-bg)] editorial-border shadow-editorial p-8 h-[600px]">
          <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--text-primary)] mb-8 flex items-center justify-between border-b border-[var(--border-primary)] pb-4">
              <span>{selectedMetric} Projection (180 Days)</span>
              <span className="text-[9px] bg-[var(--text-primary)] text-[var(--bg-primary)] px-2 py-1 font-bold tracking-widest uppercase">PROPHET MODEL</span>
          </h2>
          <div className="h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={currentData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                      <XAxis dataKey="forecast_date" stroke={textColor} fontSize={10} tickFormatter={(tick) => new Date(tick).toLocaleDateString()} axisLine={false} tickLine={false} dy={10} />
                      <YAxis stroke={textColor} fontSize={10} tickFormatter={(val) => formatValue(selectedMetric, val)} axisLine={false} tickLine={false} dx={-10} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-primary)', borderRadius: '0', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 'bold' }} labelFormatter={(label) => new Date(label).toLocaleDateString()} formatter={(val: number) => formatValue(selectedMetric, val)} />
                      <Line type="monotone" dataKey="predicted_value" stroke="var(--text-primary)" strokeWidth={3} dot={false} name="Expected" activeDot={{ r: 6, fill: accentColor, stroke: 'var(--card-bg)' }} />
                      <Line type="monotone" dataKey="upper_bound" stroke="var(--muted)" strokeDasharray="5 5" strokeWidth={1} dot={false} name="Optimistic" />
                      <Line type="monotone" dataKey="lower_bound" stroke="var(--muted)" strokeDasharray="5 5" strokeWidth={1} dot={false} name="Conservative" />
                  </LineChart>
              </ResponsiveContainer>
          </div>
      </div>

    </div>
  );
};

export default ForecastCenter;
