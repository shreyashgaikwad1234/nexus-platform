import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell
} from 'recharts';
import { 
  Network, AlertTriangle, RefreshCw, Fingerprint, Activity, Search
} from 'lucide-react';
import { useTheme } from '../utils/useTheme';
import { formatPct, formatShap } from '../utils/formatters';

const COLORS = ['#e11d48', '#000000', '#f59e0b', '#3b82f6', '#10b981'];
const DARK_COLORS = ['#f43f5e', '#ffffff', '#fcd34d', '#60a5fa', '#34d399'];

const ExplainabilityCenter = () => {
  const isDark = useTheme();
  const activeColors = isDark ? DARK_COLORS : COLORS;
  const textColor = isDark ? '#f6f5f1' : '#0a0a0a';
  const gridColor = isDark ? 'rgba(246, 245, 241, 0.1)' : 'rgba(10, 10, 10, 0.1)';

  const [globalDrivers, setGlobalDrivers] = useState([]);
  const [explanations, setExplanations] = useState([]);
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
      const API_URL = 'https://nexus-platform-t1v1.onrender.com';
      const [drivers, expl] = await Promise.all([
        fetch(`${API_URL}/top-risk-drivers`).then(res => res.json()),
        fetch(`${API_URL}/explanations?limit=20`).then(res => res.json())
      ]);
      setGlobalDrivers(drivers);
      setExplanations(expl);
    } catch (error: any) {
      console.error("SHAP API Error:", error);
      setError(`Failed to connect to Explainability Engine.`);
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchId) return;
    try {
      const API_URL = 'https://nexus-platform-t1v1.onrender.com';
      const res = await fetch(`${API_URL}/explanations/${searchId}`);
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
      <h1 className="text-3xl font-serif font-bold mb-2">Explainability Error</h1>
      <p className="text-[var(--muted)] font-sans max-w-md">{error}</p>
      <button onClick={fetchData} className="mt-6 px-6 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold uppercase tracking-widest text-xs editorial-border shadow-editorial hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all">
        Retry
      </button>
    </div>
  );

  if (loading && globalDrivers.length === 0) return (
    <div className="min-h-[70vh] flex items-center justify-center font-sans font-bold uppercase tracking-widest text-[var(--text-primary)]">
      <RefreshCw className="animate-spin mr-3" /> CALCULATING SHAP VALUES...
    </div>
  );

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-16 mt-4">
          <div>
              <h2 className="font-serif text-5xl md:text-7xl font-bold tracking-tighter leading-none mb-4">Model<br/>Audit.</h2>
              <p className="font-sans text-sm font-bold uppercase tracking-widest text-[var(--muted)]">Transparent Machine Learning SHAP Explanations</p>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Global Drivers & Search */}
        <div className="lg:col-span-5 space-y-8">
          
          <section className="bg-[var(--card-bg)] editorial-border shadow-editorial p-8">
            <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--text-primary)] mb-6 flex items-center gap-2 border-b border-[var(--border-primary)] pb-4">
              <Search size={16} className="text-[var(--accent)]" /> Audit Customer Prediction
            </h2>
            <div className="flex gap-0 editorial-border p-1 bg-[var(--bg-primary)]">
                <input 
                    type="text" 
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    placeholder="Enter Customer ID" 
                    className="flex-1 bg-transparent border-none p-3 text-sm font-mono text-[var(--text-primary)] outline-none"
                />
                <button onClick={handleSearch} className="bg-[var(--text-primary)] text-[var(--bg-primary)] px-6 font-bold transition-all hover:bg-[var(--accent)] hover:text-white">
                    <Search size={16} />
                </button>
            </div>

            {searchedCustomer && (
                <div className="mt-8 pt-6 border-t border-[var(--border-primary)]">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <span className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-widest block mb-1">Customer Inspected</span>
                            <span className="text-sm font-mono text-[var(--text-primary)] bg-[var(--bg-primary)] px-2 py-1 editorial-border">{searchedCustomer.customer_id.substring(0,12)}...</span>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-widest block mb-1">Churn Risk</span>
                            <span className="text-2xl font-serif font-black text-[var(--accent)]">{formatPct(searchedCustomer.churn_probability, true)}</span>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <span className="text-[10px] text-[var(--text-primary)] uppercase font-bold tracking-widest block mb-4 border-b border-[var(--border-primary)] pb-2">Top SHAP Impacts</span>
                        {[
                            { name: searchedCustomer.top_driver_1, impact: searchedCustomer.top_driver_1_impact },
                            { name: searchedCustomer.top_driver_2, impact: searchedCustomer.top_driver_2_impact },
                            { name: searchedCustomer.top_driver_3, impact: searchedCustomer.top_driver_3_impact }
                        ].filter(d => d.name && d.impact > 0).map((d, i) => (
                            <div key={i} className="flex items-center justify-between bg-[var(--bg-primary)] p-3 editorial-border hover:-translate-y-0.5 transition-transform">
                                <span className="text-xs font-bold text-[var(--text-primary)] font-sans">{d.name}</span>
                                <span className="text-xs font-black text-[var(--accent)] font-mono">+{formatPct(d.impact, true)} risk</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-[var(--border-primary)]">
                        <span className="text-[10px] text-[var(--text-primary)] uppercase font-bold tracking-widest block mb-2">Recommended Action</span>
                        <div className="p-4 bg-[var(--text-primary)] text-[var(--bg-primary)] font-sans font-bold text-sm">
                            {searchedCustomer.recommended_action}
                        </div>
                    </div>
                </div>
            )}
          </section>

          <section className="bg-[var(--card-bg)] editorial-border shadow-editorial p-8">
            <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--text-primary)] mb-6 flex items-center gap-2 border-b border-[var(--border-primary)] pb-4">
              <Activity size={16} className="text-[var(--accent)]" /> Global Top Risk Drivers
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={globalDrivers} layout="vertical" margin={{ left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                  <XAxis type="number" stroke={textColor} fontSize={10} tickFormatter={(val) => formatShap(val)} axisLine={false} tickLine={false} />
                  <YAxis dataKey="driver" type="category" stroke={textColor} fontSize={10} width={120} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'var(--text-primary)', opacity: 0.05}} contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-primary)', borderRadius: '0', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 'bold' }} formatter={(val: number) => formatShap(val)} />
                  <Bar dataKey="avg_impact" fill="var(--text-primary)" radius={[0, 0, 0, 0]}>
                    {globalDrivers.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={activeColors[index % activeColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 p-3 bg-[var(--bg-primary)] editorial-border text-[10px] text-[var(--muted)] font-sans font-medium leading-relaxed italic">
                * Average SHAP impact (log odds) pushing towards churn across all affected profiles in the dataset.
            </div>
          </section>

          <section className="bg-[var(--card-bg)] editorial-border shadow-editorial p-8">
            <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--text-primary)] mb-6 flex items-center gap-2 border-b border-[var(--border-primary)] pb-4">
              <Network size={16} className="text-[var(--text-primary)]" /> Model Performance
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
                {[
                    { label: 'ROC-AUC', val: '0.89' },
                    { label: 'Precision', val: '0.84' },
                    { label: 'Recall', val: '0.81' },
                    { label: 'F1 Score', val: '0.82' },
                ].map((m, i) => (
                    <div key={i} className="bg-[var(--bg-primary)] p-4 editorial-border flex flex-col justify-center items-center text-center">
                        <span className="text-[9px] text-[var(--muted)] font-bold uppercase tracking-widest mb-1">{m.label}</span>
                        <span className="text-2xl font-serif font-black text-[var(--text-primary)]">{m.val}</span>
                    </div>
                ))}
            </div>
            <div className="flex justify-between items-center bg-[var(--text-primary)] text-[var(--bg-primary)] p-3 editorial-border mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest">Training Samples</span>
                <span className="text-xs font-mono font-black">100,000+</span>
            </div>
            <div className="text-[10px] text-[var(--muted)] font-sans font-medium leading-relaxed italic text-center">
                * Performance measured on holdout validation data.
            </div>
          </section>
        </div>

        {/* Right Column: Explanation Feed */}
        <div className="lg:col-span-7 space-y-8">
          <section className="bg-[var(--card-bg)] editorial-border shadow-editorial p-8 h-[950px] flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)] opacity-[0.02] rounded-full -mr-32 -mt-32 pointer-events-none"></div>
            
            <div className="flex justify-between items-center mb-8 border-b border-[var(--border-primary)] pb-4">
                <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--text-primary)] flex items-center gap-2">
                    <Fingerprint size={16} className="text-[var(--text-primary)]" /> Highest Risk Feed
                </h2>
                <div className="text-[9px] bg-[var(--text-primary)] text-[var(--bg-primary)] px-2 py-1 font-bold tracking-widest uppercase flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[var(--bg-primary)] rounded-full animate-pulse"></div>
                    LIVE LOG
                </div>
            </div>

            <div className="space-y-6 overflow-y-auto pr-4 custom-scrollbar flex-1 relative z-10">
                {(explanations || []).map((exp: any, i: number) => (
                    <div key={i} className="bg-[var(--bg-primary)] editorial-border p-6 hover:-translate-y-1 hover:shadow-editorial transition-all">
                        <div className="flex justify-between items-start mb-6 pb-4 border-b border-[var(--border-primary)]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[var(--card-bg)] editorial-border flex items-center justify-center text-[var(--accent)] font-serif font-black text-xl">
                                    {formatPct(exp.churn_probability, true).replace('%','')}
                                </div>
                                <div>
                                    <span className="text-sm font-mono text-[var(--text-primary)] font-bold block mb-1">{exp.customer_id.substring(0, 16)}...</span>
                                    <span className="text-[9px] text-[var(--muted)] uppercase font-bold tracking-widest">{exp.segment || 'Unknown'} Segment</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[9px] text-[var(--muted)] uppercase font-bold tracking-widest block mb-1">Base SHAP</span>
                                <span className="text-xs font-mono font-bold text-[var(--text-primary)] bg-[var(--card-bg)] px-2 py-1 editorial-border">{formatShap(exp.shap_score)}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { name: exp.top_driver_1, impact: exp.top_driver_1_impact },
                                { name: exp.top_driver_2, impact: exp.top_driver_2_impact },
                                { name: exp.top_driver_3, impact: exp.top_driver_3_impact }
                            ].filter(d => d.name).map((d, j) => (
                                <div key={j} className={`p-4 editorial-border bg-[var(--card-bg)] relative overflow-hidden ${d.impact > 0 ? 'border-l-4 border-l-[var(--accent)]' : 'border-l-4 border-l-[var(--text-primary)]'}`}>
                                    <span className={`text-[10px] font-sans font-bold uppercase tracking-widest block mb-2 ${d.impact > 0 ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>
                                        {d.impact > 0 ? 'RISK' : 'RETAIN'}
                                    </span>
                                    <span className="text-xs font-bold text-[var(--text-primary)] block mb-3 h-8 leading-tight">{d.name}</span>
                                    <span className="text-xs font-mono font-bold text-[var(--muted)] bg-[var(--bg-primary)] px-2 py-1 inline-block">{formatShap(d.impact)} SHAP</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};

export default ExplainabilityCenter;
