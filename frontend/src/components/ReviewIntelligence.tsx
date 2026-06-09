import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { 
  MessageSquare, ThumbsUp, ThumbsDown, BarChart3, TrendingUp, 
  AlertTriangle, RefreshCw, Star, Languages, HeartPulse, DollarSign, Activity
} from 'lucide-react';
import { formatCurrency, formatPct, formatNumber, formatShap } from '../utils/formatters';
import { useTheme } from '../utils/useTheme';

const COLORS = ['#e11d48', '#000000', '#f59e0b', '#3b82f6', '#10b981'];
const DARK_COLORS = ['#f43f5e', '#ffffff', '#fcd34d', '#60a5fa', '#34d399'];

const ReviewIntelligence = () => {
  const isDark = useTheme();
  const activeColors = isDark ? DARK_COLORS : COLORS;
  const textColor = isDark ? '#f6f5f1' : '#0a0a0a';
  const gridColor = isDark ? 'rgba(246, 245, 241, 0.1)' : 'rgba(10, 10, 10, 0.1)';
  const accentColor = isDark ? '#f43f5e' : '#e11d48';

  const [summary, setSummary] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterSent, setFilterSent] = useState('All');
  const [filterCat, setFilterCat] = useState('All');

  useEffect(() => {
    fetchData();
  }, [filterSent, filterCat]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({ limit: '20' });
      if (filterSent !== 'All') query.append('sentiment', filterSent);
      if (filterCat !== 'All') query.append('category', filterCat);

      const baseUrl = import.meta.env.PUBLIC_API_URL || 'http://localhost:8000';

      const [sum, trnd, rec] = await Promise.all([
        fetch(`${baseUrl}/reviews/summary`).then(res => { if (!res.ok) throw new Error('Summary API failed'); return res.json(); }),
        fetch(`${baseUrl}/reviews/sentiment-trends`).then(res => { if (!res.ok) throw new Error('Trends API failed'); return res.json(); }),
        fetch(`${baseUrl}/reviews?${query.toString()}`).then(res => { if (!res.ok) throw new Error('Reviews API failed'); return res.json(); })
      ]);
      
      setSummary(sum);
      setTrends(trnd);
      setRecentReviews(rec);
    } catch (error: any) {
      setError(`Connection Error. Please verify the backend is running.`);
    }
    setLoading(false);
  };

  if (error) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-[var(--accent)] text-center">
      <AlertTriangle size={48} className="mb-4" />
      <h1 className="text-3xl font-serif font-bold mb-2">Review Connection Error</h1>
      <p className="text-[var(--muted)] font-sans max-w-md">{error}</p>
      <button onClick={fetchData} className="mt-6 px-6 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold uppercase tracking-widest text-xs editorial-border shadow-editorial hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all">
        Retry
      </button>
    </div>
  );

  if (loading && !summary) return (
    <div className="min-h-[70vh] flex items-center justify-center font-sans font-bold uppercase tracking-widest text-[var(--text-primary)]">
      <RefreshCw className="animate-spin mr-3" /> ANALYZING SENTIMENT...
    </div>
  );

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-16 mt-4">
          <div>
              <h2 className="font-serif text-5xl md:text-7xl font-bold tracking-tighter leading-none mb-4">Review<br/>Intelligence.</h2>
              <p className="font-sans text-sm font-bold uppercase tracking-widest text-[var(--muted)]">Multilingual NLP & RevOps Linkage</p>
          </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
        {[
          { label: 'CSAT Index', val: formatPct(summary?.kpis?.csat_index, true), icon: <Star size={20} /> },
          { label: 'Avg Sentiment', val: formatShap(summary?.kpis?.avg_sentiment), icon: <ThumbsUp size={20} /> },
          { label: 'Complaint Rate', val: formatPct(summary?.kpis?.complaint_rate, true), icon: <ThumbsDown size={20} /> },
          { label: 'Rev @ Risk', val: formatCurrency(summary?.kpis?.rev_at_risk_negative), icon: <DollarSign size={20} />, highlight: true },
          { label: 'High Value Complaints', val: formatNumber(summary?.kpis?.high_value_complaints), icon: <AlertTriangle size={20} /> },
        ].map((kpi, i) => (
          <div key={i} className={`bg-[var(--card-bg)] editorial-border shadow-editorial p-6 hover:-translate-y-1 transition-transform ${kpi.highlight ? 'border-b-4 border-b-[var(--accent)]' : ''}`}>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[var(--muted)] text-[10px] font-bold uppercase tracking-widest">{kpi.label}</span>
              <span className={kpi.highlight ? "text-[var(--accent)]" : "text-[var(--text-primary)]"}>{kpi.icon}</span>
            </div>
            <div className={`text-3xl font-serif font-black ${kpi.highlight ? "text-[var(--accent)]" : "text-[var(--text-primary)]"}`}>{kpi.val}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Analytics Left */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-[var(--card-bg)] editorial-border shadow-editorial p-8">
                <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--text-primary)] mb-6 flex items-center gap-2 border-b border-[var(--border-primary)] pb-4">
                <TrendingUp size={16} className="text-[var(--accent)]" /> Sentiment Stability
                </h2>
                <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trends || []}>
                    <defs>
                        <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--text-primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--text-primary)" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis dataKey="month" stroke={textColor} fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke={textColor} fontSize={10} domain={[-1, 1]} tickFormatter={(val) => formatShap(val)} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{stroke: 'var(--border-primary)', strokeWidth: 1}} contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-primary)', borderRadius: '0', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 'bold' }} formatter={(val: number) => formatShap(val)} />
                    <Area type="monotone" dataKey="avg_sentiment" stroke="var(--text-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorSent)" />
                    </AreaChart>
                </ResponsiveContainer>
                </div>
            </section>

            <section className="bg-[var(--card-bg)] editorial-border shadow-editorial p-8">
                <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--text-primary)] mb-6 flex items-center gap-2 border-b border-[var(--border-primary)] pb-4">
                <BarChart3 size={16} className="text-[var(--accent)]" /> Risk by Category
                </h2>
                <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={(summary?.categories || []).filter((c: any) => c.review_category !== 'Other')}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis dataKey="review_category" stroke={textColor} fontSize={10} hide />
                    <YAxis stroke={textColor} fontSize={10} tickFormatter={(val) => formatCurrency(val)} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: 'var(--text-primary)', opacity: 0.05}} contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-primary)', borderRadius: '0', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 'bold' }} formatter={(val: number) => formatCurrency(val)} />
                    <Bar dataKey="rev_risk" fill="var(--text-primary)" radius={[0, 0, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-6">
                  {(summary?.categories || []).filter((c: any) => c.review_category !== 'Other').slice(0, 4).map((c: any, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[var(--text-primary)]"></div>
                      <span className="text-[9px] text-[var(--muted)] font-bold uppercase tracking-widest truncate">{c.review_category}</span>
                    </div>
                  ))}
                </div>
            </section>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-[var(--card-bg)] editorial-border shadow-editorial p-8">
              <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--text-primary)] mb-6 flex items-center gap-2 border-b border-[var(--border-primary)] pb-4">
                <Activity size={16} className="text-[var(--accent)]" /> Churn Correlation
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary?.churn_sentiment || []} layout="vertical" margin={{ left: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                    <XAxis type="number" stroke={textColor} fontSize={10} domain={[0, 1]} tickFormatter={(val) => formatPct(val, true)} axisLine={false} tickLine={false} />
                    <YAxis dataKey="sentiment_label" type="category" stroke={textColor} fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: 'var(--text-primary)', opacity: 0.05}} contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-primary)', borderRadius: '0', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 'bold' }} formatter={(val: number) => formatPct(val, true)} />
                    <Bar dataKey="avg_churn" fill="var(--text-primary)" radius={[0, 0, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="bg-[var(--card-bg)] editorial-border shadow-editorial p-8">
              <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--text-primary)] mb-6 flex items-center gap-2 border-b border-[var(--border-primary)] pb-4">
                <DollarSign size={16} className="text-[var(--accent)]" /> Revenue Exposure
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={summary?.churn_sentiment || []} dataKey="revenue_risk" nameKey="sentiment_label" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} stroke="var(--card-bg)" strokeWidth={2}>
                      {(summary?.churn_sentiment || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={activeColors[index % activeColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-primary)', borderRadius: '0', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }} formatter={(val: number) => formatCurrency(val)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-[var(--card-bg)] editorial-border shadow-editorial p-8">
              <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--text-primary)] mb-6 flex items-center gap-2 border-b border-[var(--border-primary)] pb-4">
                <AlertTriangle size={16} className="text-[var(--accent)]" /> High-Risk Leaders
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[9px] text-[var(--muted)] uppercase font-bold tracking-widest border-b border-[var(--border-primary)] pb-2 bg-[var(--bg-primary)]">
                      <th className="p-3 pl-4">Customer</th>
                      <th className="p-3">Revenue</th>
                      <th className="p-3">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentReviews
                      .sort((a, b) => b.customer_revenue - a.customer_revenue)
                      .filter(r => r.sentiment_score < 0)
                      .slice(0, 5)
                      .map((r, i) => (
                        <tr key={i} className="border-b border-[var(--border-primary)] hover:bg-[var(--bg-primary)]">
                          <td className="p-3 pl-4 text-xs font-mono text-[var(--muted)]">{r.customer_unique_id.substring(0, 8)}...</td>
                          <td className="p-3 text-sm font-serif font-bold text-[var(--text-primary)]">{formatCurrency(r.customer_revenue)}</td>
                          <td className="p-3 text-xs text-[var(--accent)] font-black">{formatPct(r.churn_probability, true)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="bg-[var(--card-bg)] editorial-border shadow-editorial p-8">
              <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--text-primary)] mb-6 flex items-center gap-2 border-b border-[var(--border-primary)] pb-4">
                <TrendingUp size={16} className="text-[var(--accent)]" /> Complaint Volume
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis dataKey="month" stroke={textColor} fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke={textColor} fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-primary)', borderRadius: '0', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 'bold' }} />
                    <Line type="monotone" dataKey="volume" stroke={accentColor} strokeWidth={3} dot={{ r: 4, fill: accentColor, stroke: 'var(--card-bg)' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>
        </div>

        {/* Review Explorer V2 */}
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-[var(--bg-primary)] editorial-border shadow-editorial p-8 h-[1050px] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-8 border-b border-[var(--border-primary)] pb-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--text-primary)] font-sans">Review Explorer</h2>
                {loading && <RefreshCw size={14} className="animate-spin text-[var(--text-primary)]" />}
            </div>
            
            <div className="space-y-4 mb-8">
                <div className="grid grid-cols-2 gap-4">
                    <select value={filterSent} onChange={e => setFilterSent(e.target.value)} className="bg-[var(--card-bg)] editorial-border p-3 text-[10px] font-bold uppercase text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors cursor-pointer appearance-none rounded-none">
                        <option value="All">All Sentiment</option>
                        <option value="Very Positive">Very Positive</option>
                        <option value="Positive">Positive</option>
                        <option value="Neutral">Neutral</option>
                        <option value="Negative">Negative</option>
                        <option value="Very Negative">Very Negative</option>
                    </select>
                    <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="bg-[var(--card-bg)] editorial-border p-3 text-[10px] font-bold uppercase text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors cursor-pointer appearance-none rounded-none">
                        <option value="All">All Categories</option>
                        <option value="Delivery Issues">Delivery Issues</option>
                        <option value="Product Quality">Product Quality</option>
                        <option value="Customer Service">Customer Service</option>
                        <option value="Pricing">Pricing</option>
                        <option value="Payment Issues">Payment Issues</option>
                    </select>
                </div>
            </div>

            <div className="space-y-6 overflow-y-auto pr-4 custom-scrollbar flex-1">
              {(recentReviews || []).map((r: any, i: number) => (
                <div key={i} className="bg-[var(--card-bg)] editorial-border p-6 hover:-translate-y-1 hover:shadow-editorial transition-all group">
                  
                  <div className="flex justify-between items-start mb-4 border-b border-[var(--border-primary)] pb-3">
                    <span className={`px-2 py-1 editorial-border text-[9px] font-black uppercase tracking-widest ${(r?.sentiment_score || 0) > 0 ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'bg-[var(--accent)] text-white'}`}>
                        {r?.sentiment_label || 'Neutral'} (Conf: {formatPct(r?.confidence_score, true)})
                    </span>
                    <span className="text-[9px] text-[var(--text-primary)] font-black uppercase tracking-widest">{r?.review_category || 'General'}</span>
                  </div>

                  <div className="mb-6">
                      <div className="flex items-center gap-2 text-[9px] text-[var(--muted)] uppercase font-bold tracking-widest mb-3">
                          <Languages size={12} className="text-[var(--text-primary)]" /> Multilingual Stream ({r?.language || '??'} &rarr; en)
                      </div>
                      <p className="text-base text-[var(--text-primary)] leading-relaxed font-serif italic border-l-2 border-[var(--border-primary)] pl-4">"{r?.translated_review || 'No content.'}"</p>
                  </div>

                  {r?.language !== 'en' && r?.language !== 'unknown' && (
                    <div className="mb-6 bg-[var(--bg-primary)] p-4 editorial-border hidden group-hover:block transition-all">
                        <div className="text-[9px] text-[var(--text-primary)] uppercase font-bold tracking-widest mb-2">Original Source ({r?.language})</div>
                        <p className="text-xs text-[var(--muted)] font-serif italic">"{r?.original_review}"</p>
                    </div>
                  )}

                  <div className="bg-[var(--bg-primary)] editorial-border p-4 space-y-4">
                      <div className="flex justify-between items-center text-[9px] uppercase font-bold tracking-widest text-[var(--muted)]">
                          <span className="flex items-center gap-2"><HeartPulse size={14} className="text-[var(--text-primary)]"/> Health Profile</span>
                          <span className={`font-black tracking-widest ${r?.health_category === 'Poor' ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>{r?.health_category || 'Fair'} ({r?.health_score || 0})</span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] uppercase font-bold tracking-widest text-[var(--muted)]">
                          <span className="flex items-center gap-2"><DollarSign size={14} className="text-[var(--text-primary)]"/> Revenue / Risk</span>
                          <span className="text-[var(--text-primary)] font-bold">{formatCurrency(r?.customer_revenue)} / <span className="text-[var(--accent)]">{formatCurrency(r?.revenue_at_risk)}</span></span>
                      </div>
                      <div className="pt-3 mt-3 border-t border-[var(--border-primary)]">
                          <span className="text-[9px] text-[var(--text-primary)] uppercase font-bold tracking-widest block mb-2">Intervention Protocol</span>
                          <span className="text-xs text-[var(--accent)] font-black uppercase tracking-widest">{r?.recommended_action || 'Automated Outreach'}</span>
                      </div>
                  </div>
                </div>
              ))}
              {(!recentReviews || recentReviews.length === 0) && (
                  <div className="text-center text-[var(--muted)] text-sm mt-12 font-mono uppercase tracking-widest">No Intelligence Data Found.</div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ReviewIntelligence;
