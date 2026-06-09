import React, { useState, useEffect } from 'react';
import { 
  Database, AlertTriangle, RefreshCw, CheckCircle2, XCircle, Clock, Server, Layers, ShieldCheck
} from 'lucide-react';
import { useTheme } from '../utils/useTheme';
import { formatPct } from '../utils/formatters';

const DataQualityCenter = () => {
  const isDark = useTheme();

  const [dq, setDq] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = import.meta.env.PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/data-quality`);
      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      setDq(data);
    } catch (error: any) {
      setError(`Failed to connect to Data Quality Engine.`);
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

  if (loading && !dq) return (
    <div className="min-h-[70vh] flex items-center justify-center font-sans font-bold uppercase tracking-widest text-[var(--text-primary)]">
      <RefreshCw className="animate-spin mr-3" /> VERIFYING DATA INTEGRITY...
    </div>
  );

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-16 mt-4">
          <div>
              <h2 className="font-serif text-5xl md:text-7xl font-bold tracking-tighter leading-none mb-4">Data<br/>Integrity.</h2>
              <p className="font-sans text-sm font-bold uppercase tracking-widest text-[var(--muted)]">Analytics Engineering Pipeline Monitor</p>
          </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <div className="bg-[var(--card-bg)] editorial-border shadow-editorial p-8 hover:-translate-y-1 transition-transform">
            <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-4 flex items-center gap-2">
                <ShieldCheck size={16} className="text-[var(--accent)]" /> Data Trust Score
            </h2>
            <div className="text-5xl font-serif font-black text-[var(--text-primary)]">{formatPct(dq?.data_trust_score, false)}</div>
        </div>
        <div className="bg-[var(--card-bg)] editorial-border shadow-editorial p-8 hover:-translate-y-1 transition-transform">
            <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-4 flex items-center gap-2">
                <Layers size={16} className="text-[var(--accent)]" /> Data Coverage
            </h2>
            <div className="text-5xl font-serif font-black text-[var(--text-primary)]">{formatPct(dq?.data_coverage, false)}</div>
        </div>
        <div className="bg-[var(--card-bg)] editorial-border shadow-editorial p-8 hover:-translate-y-1 transition-transform">
            <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-4 flex items-center gap-2">
                <Clock size={16} className="text-[var(--accent)]" /> Freshness Lag
            </h2>
            <div className="text-5xl font-serif font-black text-[var(--text-primary)]">{dq?.freshness_lag_hours?.toFixed(2)} <span className="text-lg font-sans text-[var(--muted)]">hrs</span></div>
        </div>
        <div className="bg-[var(--card-bg)] editorial-border shadow-editorial p-8 hover:-translate-y-1 transition-transform">
            <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-4 flex items-center gap-2">
                <AlertTriangle size={16} className={dq?.failed_tests > 0 ? "text-[var(--accent)]" : "text-[var(--text-primary)]"} /> Failed dbt Tests
            </h2>
            <div className={`text-5xl font-serif font-black ${dq?.failed_tests > 0 ? "text-[var(--accent)]" : "text-[var(--text-primary)]"}`}>{dq?.failed_tests}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <section className="bg-[var(--card-bg)] editorial-border shadow-editorial p-8">
                <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--text-primary)] mb-6 border-b border-[var(--border-primary)] pb-4">dbt Test Results</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-widest border-b border-[var(--border-primary)] bg-[var(--bg-primary)]">
                                <th className="p-4 pl-6">Model</th>
                                <th className="p-4">Test Type</th>
                                <th className="p-4">Execution</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(dq?.tests || []).map((t: any, i: number) => (
                                <tr key={i} className="border-b border-[var(--border-primary)] hover:bg-[var(--bg-primary)] transition-colors">
                                    <td className="p-4 pl-6 text-xs font-mono text-[var(--muted)]">{t.model}</td>
                                    <td className="p-4 text-xs font-bold text-[var(--text-primary)] font-sans">{t.test}</td>
                                    <td className="p-4 text-xs font-mono text-[var(--muted)]">{t.execution_time}</td>
                                    <td className="p-4">
                                        {t.status === 'Pass' ? 
                                            <span className="inline-flex items-center gap-1 px-2 py-1 editorial-border bg-[var(--bg-primary)] text-[9px] text-[var(--text-primary)] font-black uppercase"><CheckCircle2 size={12}/> Pass</span> :
                                            <span className="inline-flex items-center gap-1 px-2 py-1 editorial-border bg-[var(--accent)] text-white text-[9px] font-black uppercase"><XCircle size={12}/> Fail</span>
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
          </div>

          <div className="lg:col-span-4 space-y-8">
              <section className="bg-[var(--card-bg)] editorial-border shadow-editorial p-8">
                  <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--text-primary)] mb-6 flex items-center gap-2 border-b border-[var(--border-primary)] pb-4">
                      <Server size={16} /> System Health
                  </h2>
                  <div className="space-y-4">
                      {dq && Object.entries(dq.system_health).map(([system, status]: any, i: number) => (
                          <div key={i} className="flex justify-between items-center bg-[var(--bg-primary)] p-4 editorial-border">
                              <span className="text-xs font-sans font-bold text-[var(--text-primary)]">{system}</span>
                              <span className={`text-[9px] font-black uppercase px-2 py-1 editorial-border ${status.includes('Online') || status.includes('Built') || status.includes('Updated') || status.includes('Calibrated') ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'bg-[var(--accent)] text-white'}`}>
                                  {status}
                              </span>
                          </div>
                      ))}
                  </div>
              </section>

              <section className="bg-[var(--card-bg)] editorial-border shadow-editorial p-8">
                  <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--text-primary)] mb-6 border-b border-[var(--border-primary)] pb-4">Data Anomalies</h2>
                  <div className="space-y-6">
                      <div>
                          <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-sans font-bold text-[var(--text-primary)] uppercase tracking-widest">Null Values</span>
                              <span className="text-xs font-serif font-black text-[var(--accent)]">{formatPct(dq?.null_percentage, true)}</span>
                          </div>
                          <div className="w-full bg-[var(--grid-color)] h-1 editorial-border">
                              <div className="bg-[var(--accent)] h-full" style={{ width: `${(dq?.null_percentage || 0) * 100}%` }}></div>
                          </div>
                      </div>
                      
                      <div>
                          <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-sans font-bold text-[var(--text-primary)] uppercase tracking-widest">Duplicates</span>
                              <span className="text-xs font-serif font-black text-[var(--text-primary)]">{formatPct(dq?.duplicate_percentage, true)}</span>
                          </div>
                          <div className="w-full bg-[var(--grid-color)] h-1 editorial-border">
                              <div className="bg-[var(--text-primary)] h-full" style={{ width: `${(dq?.duplicate_percentage || 0) * 100}%` }}></div>
                          </div>
                      </div>
                  </div>
              </section>
          </div>
      </div>
    </div>
  );
};

export default DataQualityCenter;
