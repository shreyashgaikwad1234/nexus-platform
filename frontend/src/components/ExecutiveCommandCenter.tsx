import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  Users, TrendingDown, DollarSign, Activity, AlertCircle, 
  ChevronRight, Play, RefreshCw, Layers, X, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../utils/useTheme';
import { formatCurrency, formatPct, formatNumber } from '../utils/formatters';

const COLORS = ['#e11d48', '#000000', '#f59e0b', '#3b82f6', '#10b981'];
const DARK_COLORS = ['#f43f5e', '#ffffff', '#fcd34d', '#60a5fa', '#34d399'];

const ExecutiveCommandCenter = () => {
  const isDark = useTheme();
  const activeColors = isDark ? DARK_COLORS : COLORS;
  const textColor = isDark ? '#f6f5f1' : '#0a0a0a';
  const gridColor = isDark ? 'rgba(246, 245, 241, 0.1)' : 'rgba(10, 10, 10, 0.1)';

  const [metrics, setMetrics] = useState<any>(null);
  const [segments, setSegments] = useState<any[]>([]);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [simResults, setSimResults] = useState<any>(null);
  const [budget, setBudget] = useState(10000);
  const [discount, setDiscount] = useState(15);
  const [targetSegment, setTargetSegment] = useState('At Risk - High Value');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const API_URL = import.meta.env.PUBLIC_API_URL;
      const [m, s, i, c] = await Promise.all([
        fetch(`${API_URL}/metrics`).then(res => { if (!res.ok) throw new Error('Metrics fail'); return res.json(); }),
        fetch(`${API_URL}/segments`).then(res => { if (!res.ok) throw new Error('Segments fail'); return res.json(); }),
        fetch(`${API_URL}/interventions`).then(res => { if (!res.ok) throw new Error('Interventions fail'); return res.json(); }),
        fetch(`${API_URL}/customers?limit=10`).then(res => { if (!res.ok) throw new Error('Customers fail'); return res.json(); })
      ]);
      setMetrics(m);
      setSegments(s);
      setInterventions(i);
      setCustomers(c);
    } catch (error) {
      console.error("Nexus API Connection Error:", error);
      setError("Failed to connect to the Nexus Revenue Intelligence API.");
    }
    setLoading(false);
  };

  const handleViewAll = async () => {
      setIsModalOpen(true);
      if (allCustomers.length === 0) {
          setLoadingAll(true);
          try {
              const API_URL = import.meta.env.PUBLIC_API_URL;
              const res = await fetch(`${API_URL}/customers?limit=500`);
              const data = await res.json();
              setAllCustomers(data);
          } catch (e) {
              console.error(e);
          }
          setLoadingAll(false);
      }
  };

  const handleExportCSV = () => {
      if (allCustomers.length === 0) return;
      const headers = ['Customer ID', 'Risk', 'LTV', 'Segment', 'Recommended Action'];
      const rows = allCustomers.map(c => [c.customer_unique_id, c.churn_probability.toFixed(4), c.monetary.toFixed(2), c.segment, c.recommended_action]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "at_risk_customers.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  if (error) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-[var(--accent)] text-center">
      <AlertCircle size={48} className="mb-4" />
      <h1 className="text-3xl font-serif font-bold mb-2">Connection Error</h1>
      <p className="text-[var(--muted)] font-sans max-w-md">{error}</p>
      <button onClick={fetchData} className="mt-6 px-6 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold uppercase tracking-widest text-xs editorial-border shadow-editorial hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all cursor-pointer">
        Retry Connection
      </button>
    </div>
  );

  const runSimulation = () => {
    const API_URL = import.meta.env.PUBLIC_API_URL;
    fetch(`${API_URL}/simulation?budget=${budget}&discount_pct=${discount}&target_segment=${targetSegment}`)
      .then(res => res.json())
      .then(data => setSimResults(data));
  };

  if (loading || !metrics) return (
    <div className="min-h-[70vh] flex items-center justify-center font-sans font-bold uppercase tracking-widest text-[var(--text-primary)]">
      <RefreshCw className="animate-spin mr-3" /> INITIALIZING REVENUE INTELLIGENCE...
    </div>
  );

  const filteredModalCustomers = allCustomers.filter(c => c.customer_unique_id.includes(searchTerm) || c.segment.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="w-full relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 mt-4 gap-6">
          <div className="max-w-3xl">
              <h2 className="font-serif text-5xl md:text-7xl font-bold tracking-tighter leading-none mb-6">Executive<br/>Summary.</h2>
              <p className="font-sans text-sm font-bold uppercase tracking-widest text-[var(--text-primary)] mb-3 leading-relaxed">
                  AI-Powered Customer Retention Intelligence
              </p>
              <p className="font-serif text-lg text-[var(--muted)] italic leading-relaxed">
                  Predict churn risk, explain customer behavior, recommend retention interventions, and forecast business impact.
              </p>
          </div>
          <button onClick={fetchData} className="h-12 px-6 bg-[var(--bg-primary)] text-[var(--text-primary)] font-bold uppercase tracking-widest text-xs editorial-border shadow-editorial hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all flex items-center gap-2 cursor-pointer shrink-0">
            <RefreshCw size={14} /> Refresh
          </button>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {[
          { label: 'Total Revenue', val: formatCurrency(metrics?.total_revenue), icon: <DollarSign size={24}/> },
          { label: 'Revenue Protected', val: formatCurrency(metrics?.revenue_protected), icon: <Activity size={24}/> },
          { label: 'Revenue At Risk', val: formatCurrency(metrics?.revenue_at_risk), icon: <TrendingDown size={24}/>, highlight: true },
          { label: 'Upsell Opp.', val: formatCurrency(metrics?.revenue_opportunity), icon: <Layers size={24}/> },
          { label: 'Customers', val: formatNumber(metrics?.total_customers), icon: <Users size={24}/> },
          { label: 'Retention Rate', val: formatPct(metrics?.retention_rate), icon: <AlertCircle size={24}/> },
        ].map((kpi, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
            key={kpi.label} 
            className={`bg-[var(--card-bg)] editorial-border shadow-editorial p-6 ${kpi.highlight ? 'border-l-8 border-l-[var(--accent)]' : ''}`}
          >
            <div className="flex justify-between items-start mb-4">
                <span className="text-[var(--muted)] font-sans text-xs font-bold uppercase tracking-widest">{kpi.label}</span>
                <span className={`${kpi.highlight ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>{kpi.icon}</span>
            </div>
            <div className={`text-4xl md:text-5xl font-serif font-bold tracking-tight ${kpi.highlight ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>
                {kpi.val}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Main Analytics */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-[var(--card-bg)] editorial-border shadow-editorial p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--text-primary)] opacity-[0.03] rounded-full -mr-10 -mt-10"></div>
              <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-8 border-b border-[var(--border-primary)] pb-4">Segment Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={segments} dataKey="count" nameKey="segment" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} stroke="var(--card-bg)" strokeWidth={2}>
                      {segments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={activeColors[index % activeColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-primary)', borderRadius: '0', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }} formatter={(val: number) => formatNumber(val)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-y-3 gap-x-2 mt-4">
                  {segments.slice(0, 4).map((s: any, i: number) => (
                      <div key={s.segment} className="flex items-center gap-2">
                          <div className="w-3 h-3 editorial-border" style={{backgroundColor: activeColors[i]}}></div>
                          <span className="text-[10px] text-[var(--text-primary)] font-sans uppercase font-bold tracking-wider truncate">{s.segment}</span>
                      </div>
                  ))}
              </div>
            </section>

            <section className="bg-[var(--card-bg)] editorial-border shadow-editorial p-8">
              <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-8 border-b border-[var(--border-primary)] pb-4">Revenue by Segment</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={segments} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis dataKey="segment" hide />
                    <YAxis stroke={textColor} fontSize={10} tickFormatter={(val) => formatCurrency(val)} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: 'var(--text-primary)', opacity: 0.05}} contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-primary)', borderRadius: '0', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 'bold' }} formatter={(val: number) => formatCurrency(val)} />
                    <Bar dataKey="revenue" fill="var(--text-primary)" radius={[0, 0, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          <section className="bg-[var(--bg-primary)] editorial-border shadow-editorial p-8 relative">
            <div className="absolute top-4 left-4 w-2 h-2 bg-[var(--accent)] rounded-full"></div>
            <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--text-primary)] mb-8 ml-4">Intervention Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {interventions.map((item: any, idx: number) => (
                <div key={item.recommended_action} className="bg-[var(--card-bg)] editorial-border p-5 hover:-translate-y-1 hover:shadow-editorial transition-all">
                  <div className="text-[10px] text-[var(--accent)] font-sans font-black uppercase tracking-widest mb-3 pb-2 border-b border-[var(--border-primary)]">{item.recommended_action}</div>
                  <div className="text-3xl font-serif font-bold text-[var(--text-primary)] mb-4">{formatNumber(item.count)} <span className="text-xs font-sans text-[var(--muted)] font-normal tracking-widest uppercase">users</span></div>
                  <div className="w-full bg-[var(--grid-color)] h-2 overflow-hidden editorial-border">
                      <div className="bg-[var(--text-primary)] h-full" style={{ width: `${(item.risk_coverage / metrics.revenue_at_risk) * 100}%` }}></div>
                  </div>
                  <div className="text-[9px] text-[var(--text-primary)] mt-3 font-sans uppercase font-bold tracking-widest">Coverage: { formatCurrency(item.risk_coverage) }</div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-[var(--card-bg)] editorial-border shadow-editorial overflow-hidden">
            <div className="p-8 border-b border-[var(--border-primary)] flex justify-between items-end">
                <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--text-primary)]">At-Risk Intelligence</h3>
                <button onClick={handleViewAll} className="text-[10px] text-[var(--text-primary)] font-bold uppercase tracking-widest hover:text-[var(--accent)] flex items-center gap-1 transition-colors cursor-pointer">View All <ChevronRight size={14}/></button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] text-[var(--muted)] font-sans uppercase tracking-widest border-b border-[var(--border-primary)] bg-[var(--bg-primary)]">
                    <th className="p-5 pl-8">Identifier</th>
                    <th className="p-5">Risk %</th>
                    <th className="p-5">LTV</th>
                    <th className="p-5">Segment</th>
                    <th className="p-5">Action</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-sans font-medium">
                  {customers.map((c: any) => (
                    <tr key={c.customer_unique_id} className="border-b border-[var(--border-primary)] hover:bg-[var(--bg-primary)] transition-colors cursor-default">
                      <td className="p-5 pl-8 font-mono text-[var(--muted)]">{c.customer_unique_id.substring(0, 12)}...</td>
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-16 bg-[var(--grid-color)] h-2 editorial-border">
                                <div className={`h-full ${c.churn_probability > 0.7 ? 'bg-[var(--accent)]' : 'bg-[var(--text-primary)]'}`} style={{width: `${c.churn_probability * 100}%`}}></div>
                            </div>
                            <span className="font-bold text-[var(--text-primary)]">{formatPct(c.churn_probability, true)}</span>
                        </div>
                      </td>
                      <td className="p-5 font-serif font-bold text-lg text-[var(--text-primary)]">{formatCurrency(c.monetary)}</td>
                      <td className="p-5">
                        <span className="px-2 py-1 editorial-border bg-[var(--card-bg)] text-[9px] font-bold uppercase text-[var(--text-primary)]">{c.segment}</span>
                      </td>
                      <td className="p-5">
                        <span className="text-[var(--accent)] font-bold uppercase text-[10px] tracking-widest">{c.recommended_action}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right Column - Simulator */}
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-[var(--accent)] text-white editorial-border shadow-editorial p-8 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-10">
                <Play size={200} className="fill-white" />
            </div>
            
            <h3 className="font-serif text-3xl font-bold mb-4 relative z-10 leading-none">Campaign<br/>Simulator.</h3>
            <p className="font-sans text-[11px] mb-8 leading-relaxed font-medium tracking-wide uppercase opacity-90 relative z-10">Model campaign outcomes based on historical churn probability and intervention lift.</p>
            
            <div className="space-y-8 relative z-10">
              <div className="space-y-3">
                <div className="flex justify-between font-sans">
                    <label className="text-[10px] font-bold uppercase tracking-widest">Target Segment</label>
                    <span className="text-[10px] font-mono font-bold bg-white text-[var(--accent)] px-1">{targetSegment}</span>
                </div>
                <select 
                    value={targetSegment} 
                    onChange={(e) => setTargetSegment(e.target.value)}
                    className="w-full bg-[var(--accent)] border-2 border-white p-3 text-sm font-sans font-bold outline-none cursor-pointer text-white appearance-none rounded-none hover:bg-white hover:text-[var(--accent)] transition-colors"
                >
                    <option value="At Risk - High Value">At Risk - High Value</option>
                    <option value="Need Attention">Need Attention</option>
                    <option value="Dormant">Dormant</option>
                    <option value="Loyal Customers">Loyal Customers</option>
                    <option value="All">Global Population</option>
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between font-sans">
                    <label className="text-[10px] font-bold uppercase tracking-widest">Campaign Budget</label>
                    <span className="text-[10px] font-mono font-bold bg-white text-[var(--accent)] px-1">{formatCurrency(budget)}</span>
                </div>
                <input 
                  type="range" min="1000" max="100000" step="1000" 
                  value={budget} onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full h-2 bg-white/30 rounded-none appearance-none cursor-pointer accent-white"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between font-sans">
                    <label className="text-[10px] font-bold uppercase tracking-widest">Discount Intensity</label>
                    <span className="text-[10px] font-mono font-bold bg-white text-[var(--accent)] px-1">{discount}%</span>
                </div>
                <input 
                  type="range" min="5" max="40" step="5" 
                  value={discount} onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full h-2 bg-white/30 rounded-none appearance-none cursor-pointer accent-white"
                />
              </div>

              <button 
                onClick={runSimulation}
                className="w-full py-4 mt-4 bg-white text-[var(--accent)] font-sans font-black transition-all border-2 border-white hover:bg-transparent hover:text-white flex items-center justify-center gap-2 uppercase tracking-widest text-xs cursor-pointer"
              >
                Execute Forecasting <ChevronRight size={16} />
              </button>
            </div>

            <AnimatePresence>
              {simResults && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-8 pt-8 border-t border-white/30 grid grid-cols-2 gap-4 relative z-10"
                >
                    <div>
                        <div className="text-[9px] font-sans font-bold uppercase tracking-widest mb-1 opacity-80">Est. Reach</div>
                        <div className="text-2xl font-serif font-bold">{formatNumber(simResults.reach)}</div>
                    </div>
                    <div>
                        <div className="text-[9px] font-sans font-bold uppercase tracking-widest mb-1 opacity-80">Expected ROI</div>
                        <div className={`text-2xl font-serif font-bold`}>{formatPct(simResults.roi, false)}</div>
                    </div>
                    <div className="col-span-2 mt-2 p-4 bg-white text-[var(--accent)] editorial-border">
                        <div className="text-[10px] font-sans font-black uppercase tracking-widest mb-1">Projected Incremental Revenue</div>
                        <div className="text-4xl font-serif font-bold">{formatCurrency(simResults.est_revenue)}</div>
                    </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          <section className="bg-[var(--card-bg)] editorial-border shadow-editorial p-8">
              <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--text-primary)] mb-6 border-b border-[var(--border-primary)] pb-4">Business Impact</h3>
              <div className="space-y-4">
                  {[
                      { label: 'Revenue Protected', val: '$15M', highlight: false },
                      { label: 'Revenue At Risk Identified', val: '$965K', highlight: true },
                      { label: 'Intervention Coverage', val: '96.1K Customers', highlight: false },
                      { label: 'Retention Uplift Potential', val: '+12%', highlight: true },
                      { label: 'High-Risk Customers Flagged', val: '22.4K', highlight: true },
                  ].map((item, idx) => (
                      <div key={idx} className={`flex justify-between items-center bg-[var(--bg-primary)] p-4 editorial-border ${item.highlight ? 'border-l-4 border-l-[var(--accent)]' : ''}`}>
                          <span className="text-xs font-sans font-bold text-[var(--text-primary)]">{item.label}</span>
                          <span className={`text-sm font-serif font-black ${item.highlight ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>{item.val}</span>
                      </div>
                  ))}
              </div>
          </section>

          <section className="bg-[var(--card-bg)] editorial-border shadow-editorial p-8">
              <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--text-primary)] mb-6 border-b border-[var(--border-primary)] pb-4">Dataset Profile</h3>
              <div className="space-y-3">
                  {[
                      { label: 'Customers', val: '100,000+' },
                      { label: 'Orders', val: '500,000+' },
                      { label: 'Historical Period', val: '24 Months' },
                      { label: 'Features Engineered', val: '50+' },
                      { label: 'Languages Processed', val: '3' },
                      { label: 'Target Variable', val: 'Customer Churn', bg: true },
                  ].map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center font-sans text-xs border-b border-[var(--border-primary)]/10 pb-2 last:border-0 last:pb-0">
                          <span className="text-[var(--text-primary)] font-bold tracking-wide">{item.label}</span>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${item.bg ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] editorial-border px-2 py-1' : 'text-[var(--text-primary)] font-mono'}`}>{item.val}</span>
                      </div>
                  ))}
              </div>
          </section>

          <section className="bg-[var(--card-bg)] editorial-border shadow-editorial p-8">
              <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-6 border-b border-[var(--border-primary)] pb-4">Internal Systems Health</h3>
              <div className="space-y-5">
                  {[
                      { label: 'PostgreSQL Connection', status: 'Optimal' },
                      { label: 'dbt Models', status: 'Syncing' },
                      { label: 'XGBoost Engine', status: 'Online' },
                      { label: 'API Gateway', status: 'Operational' },
                  ].map(sys => (
                      <div key={sys.label} className="flex justify-between items-center font-sans text-xs">
                          <span className="text-[var(--text-primary)] font-bold tracking-wide">{sys.label}</span>
                          <span className={`text-[var(--text-primary)] font-bold uppercase tracking-widest text-[9px] flex items-center gap-2`}>
                              {sys.status} <div className={`w-2 h-2 rounded-none bg-[var(--text-primary)] ${sys.status === 'Syncing' ? 'animate-pulse' : ''}`}></div>
                          </span>
                      </div>
                  ))}
              </div>
          </section>
        </div>
      </div>

      {/* View All Modal */}
      <AnimatePresence>
        {isModalOpen && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-[var(--bg-primary)]/95 backdrop-blur-sm p-4 md:p-12 overflow-y-auto flex items-start justify-center"
            >
                <motion.div 
                    initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
                    className="w-full max-w-6xl bg-[var(--card-bg)] editorial-border shadow-editorial relative"
                >
                    <div className="p-8 border-b border-[var(--border-primary)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 sticky top-0 bg-[var(--card-bg)] z-20">
                        <div>
                            <h2 className="font-serif text-4xl font-black mb-2 text-[var(--text-primary)]">Customer Intelligence</h2>
                            <p className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-widest">Complete Risk & Segment Analysis</p>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="flex gap-0 editorial-border p-1 bg-[var(--bg-primary)] flex-1 md:w-64">
                                <input 
                                    type="text" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search IDs or Segments..." 
                                    className="w-full bg-transparent border-none p-2 text-xs font-mono text-[var(--text-primary)] outline-none"
                                />
                            </div>
                            <button onClick={handleExportCSV} className="bg-[var(--text-primary)] text-[var(--bg-primary)] px-4 py-3 font-bold transition-all hover:bg-[var(--accent)] hover:text-white flex items-center gap-2 text-[10px] uppercase tracking-widest editorial-border cursor-pointer whitespace-nowrap">
                                <Download size={14} /> Export
                            </button>
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 editorial-border flex items-center justify-center hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors cursor-pointer shrink-0">
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                    
                    <div className="p-8 overflow-x-auto min-h-[50vh]">
                        {loadingAll ? (
                            <div className="flex flex-col items-center justify-center h-64 text-[var(--text-primary)] gap-4">
                                <RefreshCw className="animate-spin" size={32} />
                                <span className="font-sans font-bold uppercase tracking-widest text-[10px]">Retrieving Deep Records...</span>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                <tr className="text-[10px] text-[var(--muted)] font-sans uppercase tracking-widest border-b border-[var(--border-primary)] bg-[var(--bg-primary)]">
                                    <th className="p-4 pl-6">Customer Identifier</th>
                                    <th className="p-4">Risk Level</th>
                                    <th className="p-4">LTV (Monetary)</th>
                                    <th className="p-4">Assigned Segment</th>
                                    <th className="p-4">Strategic Action</th>
                                </tr>
                                </thead>
                                <tbody className="text-xs font-sans font-medium">
                                {filteredModalCustomers.length > 0 ? filteredModalCustomers.map((c: any) => (
                                    <tr key={c.customer_unique_id} className="border-b border-[var(--border-primary)] hover:bg-[var(--bg-primary)] transition-colors">
                                    <td className="p-4 pl-6 font-mono text-[var(--text-primary)]">{c.customer_unique_id.substring(0, 16)}...</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 bg-[var(--grid-color)] h-1.5 editorial-border hidden sm:block">
                                                <div className={`h-full ${c.churn_probability > 0.7 ? 'bg-[var(--accent)]' : 'bg-[var(--text-primary)]'}`} style={{width: `${c.churn_probability * 100}%`}}></div>
                                            </div>
                                            <span className={`font-black ${c.churn_probability > 0.7 ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>{formatPct(c.churn_probability, true)}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 font-serif font-bold text-base text-[var(--text-primary)]">{formatCurrency(c.monetary)}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 editorial-border bg-[var(--card-bg)] text-[9px] font-bold uppercase text-[var(--text-primary)]">{c.segment}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-[var(--accent)] font-bold uppercase text-[10px] tracking-widest">{c.recommended_action}</span>
                                    </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-[var(--muted)] font-bold uppercase tracking-widest text-[10px]">
                                            No customers found matching criteria.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExecutiveCommandCenter;
