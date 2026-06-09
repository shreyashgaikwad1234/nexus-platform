import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  HeartPulse, AlertTriangle, RefreshCw, Search
} from 'lucide-react';
import { formatCurrency, formatPct, formatHealth } from '../utils/formatters';
import { useTheme } from '../utils/useTheme';

const HealthCenter = () => {
  const isDark = useTheme();
  const textColor = isDark ? '#f6f5f1' : '#0a0a0a';
  const gridColor = isDark ? 'rgba(246, 245, 241, 0.1)' : 'rgba(10, 10, 10, 0.1)';
  const accentColor = isDark ? '#f43f5e' : '#e11d48';

  const [healthData, setHealthData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchId, setSearchId] = useState('');
  const [searchedCustomer, setSearchedCustomer] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const API_URL = import.meta.env.PUBLIC_API_URL;
      const [list, sum] = await Promise.all([
        fetch(`${API_URL}/customer-health?limit=50`).then(res => res.json()),
        fetch(`${API_URL}/customer-health/summary`).then(res => res.json())
      ]);
      setHealthData(list);
      setSummary(sum);
    } catch (error: any) {
      setError(`Failed to connect to Health Engine.`);
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchId) return;
    try {
      const API_URL = import.meta.env.PUBLIC_API_URL;
      const res = await fetch(`${API_URL}/customer-health/${searchId}`);
      const data = await res.json();
      if (data.error) {
        setSearchedCustomer(null);
        alert(data.error);
      } else {
        setSearchedCustomer(data);
      }
    } catch (e) {
      console.error(e);
    }
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

  if (loading && !summary) return (
    <div className="min-h-[70vh] flex items-center justify-center font-sans font-bold uppercase tracking-widest text-[var(--text-primary)]">
      <RefreshCw className="animate-spin mr-3" /> CALCULATING HEALTH SCORES...
    </div>
  );

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-16 mt-4">
          <div>
              <h2 className="font-serif text-5xl md:text-7xl font-bold tracking-tighter leading-none mb-4">Customer<br/>Health.</h2>
              <p className="font-sans text-sm font-bold uppercase tracking-widest text-[var(--muted)]">0-100 Explainable Health Scoring</p>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-[var(--card-bg)] editorial-border shadow-editorial p-8 flex flex-col justify-center">
            <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-4">Average Global Health</h2>
            <div className="text-6xl font-serif font-black text-[var(--text-primary)]">{formatHealth(summary?.average_score)}</div>
        </div>
        <div className="bg-[var(--card-bg)] editorial-border shadow-editorial p-8 md:col-span-2">
            <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--text-primary)] mb-6 border-b border-[var(--border-primary)] pb-4">Health Category Distribution</h2>
            <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={summary?.distribution || []} layout="vertical" margin={{ left: 40 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="health_category" type="category" stroke={textColor} fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{fill: 'var(--text-primary)', opacity: 0.05}} contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-primary)', borderRadius: '0', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 'bold' }} />
                        <Bar dataKey="count" fill="var(--text-primary)" radius={[0, 0, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-[var(--card-bg)] editorial-border shadow-editorial p-8">
            <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--text-primary)] mb-6 flex items-center gap-2 border-b border-[var(--border-primary)] pb-4">
              <Search size={16} className="text-[var(--accent)]" /> Inspect Customer
            </h2>
            <div className="flex gap-0 editorial-border p-1 bg-[var(--bg-primary)]">
                <input 
                    type="text" 
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    placeholder="Enter Unique ID" 
                    className="flex-1 bg-transparent border-none p-3 text-sm font-mono text-[var(--text-primary)] outline-none"
                />
                <button onClick={handleSearch} className="bg-[var(--text-primary)] text-[var(--bg-primary)] px-6 font-bold transition-all hover:bg-[var(--accent)] hover:text-white">
                    <Search size={16} />
                </button>
            </div>

            {searchedCustomer && (
                <div className="mt-8 pt-6 border-t border-[var(--border-primary)] space-y-6">
                    <div>
                        <span className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-widest block mb-2">Score</span>
                        <span className="text-4xl font-serif font-black text-[var(--text-primary)]">{formatHealth(searchedCustomer.health_score)}</span>
                        <span className="text-xs ml-3 font-sans font-bold text-[var(--muted)] uppercase tracking-widest">{searchedCustomer.health_category}</span>
                    </div>
                    <div className="bg-[var(--bg-primary)] p-4 editorial-border">
                        <span className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-widest block mb-2">Health Drivers</span>
                        <span className="text-sm font-sans font-bold text-[var(--text-primary)]">{searchedCustomer.health_drivers}</span>
                    </div>
                    <div className="bg-[var(--bg-primary)] p-4 editorial-border border-l-4 border-l-[var(--accent)]">
                        <span className="text-[10px] text-[var(--accent)] uppercase font-bold tracking-widest block mb-2">Risk Drivers</span>
                        <span className="text-sm font-sans font-bold text-[var(--text-primary)]">{searchedCustomer.risk_drivers}</span>
                    </div>
                </div>
            )}
          </section>
        </div>

        <div className="lg:col-span-8">
            <section className="bg-[var(--card-bg)] editorial-border shadow-editorial p-8 h-[650px] flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--text-primary)] opacity-[0.02] rounded-full -mr-24 -mt-24 pointer-events-none"></div>
                <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--text-primary)] mb-6 border-b border-[var(--border-primary)] pb-4">Top 50 Healthy Profiles</h2>
                <div className="overflow-auto custom-scrollbar flex-1 pr-2 relative z-10">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-[var(--card-bg)] z-20">
                            <tr className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-widest border-b border-[var(--border-primary)]">
                                <th className="pb-4">Customer ID</th>
                                <th className="pb-4">Health</th>
                                <th className="pb-4">Revenue</th>
                                <th className="pb-4">Risk</th>
                                <th className="pb-4">Action / Driver</th>
                            </tr>
                        </thead>
                        <tbody>
                            {healthData.map((h: any, i: number) => (
                                <tr key={i} className="border-b border-[var(--border-primary)] hover:bg-[var(--bg-primary)] transition-colors">
                                    <td className="py-4">
                                        <span className="text-xs font-mono block text-[var(--text-primary)] font-bold">{h.customer_unique_id.substring(0,8)}...</span>
                                        <span className="text-[9px] text-[var(--muted)] uppercase tracking-widest">{h.segment}</span>
                                    </td>
                                    <td className="py-4">
                                        <span className="text-sm font-serif font-black text-[var(--text-primary)] block">{formatHealth(h.health_score)}</span>
                                        <span className="text-[9px] text-[var(--text-primary)] uppercase tracking-widest font-bold bg-[var(--bg-primary)] px-1 mt-1 inline-block editorial-border">{h.health_category}</span>
                                    </td>
                                    <td className="py-4 text-xs font-serif font-bold text-[var(--text-primary)]">
                                        {formatCurrency(h.monetary)}
                                    </td>
                                    <td className="py-4">
                                        <span className="text-xs font-mono font-black text-[var(--accent)] block">{formatPct(h.churn_probability, true)}</span>
                                    </td>
                                    <td className="py-4">
                                        <span className="text-[10px] text-[var(--text-primary)] font-bold block mb-1 uppercase tracking-widest">{h.recommended_action}</span>
                                        <span className="text-[9px] text-[var(--accent)] uppercase tracking-widest block font-bold">{h.top_risk_driver || 'None'}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
      </div>
    </div>
  );
};

export default HealthCenter;
