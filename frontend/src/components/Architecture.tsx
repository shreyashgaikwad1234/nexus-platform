import React from 'react';
import { Database, Server, Brain, Activity, Globe, Monitor, Code, Layers } from 'lucide-react';

const Architecture = () => {
  return (
    <div className="w-full">
      <div className="mb-16 mt-4">
          <h2 className="font-serif text-5xl md:text-7xl font-bold tracking-tighter leading-none mb-4">System<br/>Architecture.</h2>
          <p className="font-sans text-sm font-bold uppercase tracking-widest text-[var(--muted)]">Nexus V3 Enterprise Data Stack</p>
      </div>

      <div className="max-w-5xl mx-auto space-y-16">
        {/* Layer 1: Data */}
        <div className="relative">
            <h2 className="font-sans text-sm font-bold uppercase tracking-widest text-[var(--text-primary)] mb-6 flex items-center gap-3">
                <span className="w-6 h-6 rounded-none bg-[var(--text-primary)] text-[var(--bg-primary)] flex items-center justify-center text-xs">1</span>
                Data Storage & Engineering Layer
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[var(--card-bg)] editorial-border shadow-editorial p-8 flex flex-col items-start hover:-translate-y-1 hover:translate-x-1 transition-transform">
                    <div className="p-4 bg-[var(--bg-primary)] editorial-border mb-6">
                        <Database className="text-[var(--text-primary)]" size={32} />
                    </div>
                    <div>
                        <h3 className="font-serif text-2xl font-bold text-[var(--text-primary)] mb-3">PostgreSQL Data Warehouse</h3>
                        <p className="font-sans text-sm text-[var(--muted)] leading-relaxed">Stores 100k+ customer records, raw e-commerce tables, and aggregated features. Source of truth for all ML models.</p>
                    </div>
                </div>
                <div className="bg-[var(--card-bg)] editorial-border shadow-editorial p-8 flex flex-col items-start hover:-translate-y-1 hover:translate-x-1 transition-transform">
                    <div className="p-4 bg-[var(--bg-primary)] editorial-border mb-6">
                        <Code className="text-[var(--text-primary)]" size={32} />
                    </div>
                    <div>
                        <h3 className="font-serif text-2xl font-bold text-[var(--text-primary)] mb-3">dbt (Data Build Tool)</h3>
                        <p className="font-sans text-sm text-[var(--muted)] leading-relaxed">Orchestrates SQL transformations. Creates modular staging models and the final `mart_customer_360` table.</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Layer 2: Feature Engineering */}
        <div className="relative">
            <h2 className="font-sans text-sm font-bold uppercase tracking-widest text-[var(--text-primary)] mb-6 flex items-center gap-3">
                <span className="w-6 h-6 rounded-none bg-[var(--text-primary)] text-[var(--bg-primary)] flex items-center justify-center text-xs">2</span>
                Feature Engineering Layer
            </h2>
            <div className="grid grid-cols-1 gap-8">
                <div className="bg-[var(--card-bg)] editorial-border shadow-editorial p-8 flex flex-col md:flex-row items-start md:items-center gap-8 hover:-translate-y-1 hover:translate-x-1 transition-transform">
                    <div className="p-6 bg-[var(--text-primary)] editorial-border shrink-0">
                        <Layers className="text-[var(--bg-primary)]" size={48} />
                    </div>
                    <div className="w-full">
                        <h3 className="font-serif text-3xl font-bold text-[var(--text-primary)] mb-4">Signal Generation</h3>
                        <p className="font-sans text-base text-[var(--muted)] leading-relaxed mb-6 max-w-2xl">Raw data points are engineered into high-fidelity predictive features optimized for machine learning algorithms.</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {[
                                'Recency', 'Frequency', 'Monetary Value', 
                                'Purchase Trend', 'Delivery Delay', 'Sentiment Score',
                                'Customer Lifetime Value', 'Complaint Rate', 'Engagement Index'
                            ].map((feat, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-none"></div>
                                    <span className="text-xs font-mono font-bold text-[var(--text-primary)]">{feat}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-4 border-t border-[var(--border-primary)]">
                            <span className="text-[9px] font-sans font-black uppercase tracking-widest text-[var(--muted)] flex items-center gap-2">
                                Data Flow: Raw Data &rarr; dbt &rarr; Feature Engineering &rarr; XGBoost &rarr; SHAP &rarr; Business Actions
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Layer 3: Machine Learning */}
        <div className="relative">
            <h2 className="font-sans text-sm font-bold uppercase tracking-widest text-[var(--text-primary)] mb-6 flex items-center gap-3">
                <span className="w-6 h-6 rounded-none bg-[var(--text-primary)] text-[var(--bg-primary)] flex items-center justify-center text-xs">3</span>
                Intelligence & Machine Learning Layer
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-[var(--card-bg)] editorial-border shadow-editorial p-8 flex flex-col items-start hover:-translate-y-1 hover:translate-x-1 transition-transform">
                    <div className="p-4 bg-[var(--bg-primary)] editorial-border mb-6">
                        <Brain className="text-[var(--accent)]" size={32} />
                    </div>
                    <div>
                        <h3 className="font-serif text-xl font-bold text-[var(--text-primary)] mb-3">XGBoost Churn Model</h3>
                        <p className="font-sans text-xs text-[var(--muted)] leading-relaxed">Predicts churn probability using Recency, Frequency, Monetary value, and Delivery performance.</p>
                    </div>
                </div>
                <div className="bg-[var(--card-bg)] editorial-border shadow-editorial p-8 flex flex-col items-start hover:-translate-y-1 hover:translate-x-1 transition-transform">
                    <div className="p-4 bg-[var(--bg-primary)] editorial-border mb-6">
                        <Activity className="text-[var(--accent)]" size={32} />
                    </div>
                    <div>
                        <h3 className="font-serif text-xl font-bold text-[var(--text-primary)] mb-3">SHAP Explainability</h3>
                        <p className="font-sans text-xs text-[var(--muted)] leading-relaxed">TreeExplainer breaks down exact feature importance for every individual customer's churn prediction.</p>
                    </div>
                </div>
                <div className="bg-[var(--card-bg)] editorial-border shadow-editorial p-8 flex flex-col items-start hover:-translate-y-1 hover:translate-x-1 transition-transform">
                    <div className="p-4 bg-[var(--bg-primary)] editorial-border mb-6">
                        <Globe className="text-[var(--accent)]" size={32} />
                    </div>
                    <div>
                        <h3 className="font-serif text-xl font-bold text-[var(--text-primary)] mb-3">NLP Pipeline (VADER)</h3>
                        <p className="font-sans text-xs text-[var(--muted)] leading-relaxed">Multilingual language detection, PT-EN translation, and 5-tier sentiment scoring with confidence bands.</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Layer 4: API */}
        <div className="relative">
            <h2 className="font-sans text-sm font-bold uppercase tracking-widest text-[var(--text-primary)] mb-6 flex items-center gap-3">
                <span className="w-6 h-6 rounded-none bg-[var(--text-primary)] text-[var(--bg-primary)] flex items-center justify-center text-xs">4</span>
                Application Programming Interface
            </h2>
            <div className="grid grid-cols-1 gap-8">
                <div className="bg-[var(--card-bg)] editorial-border shadow-editorial p-8 flex flex-col md:flex-row items-start md:items-center gap-8 hover:-translate-y-1 hover:translate-x-1 transition-transform">
                    <div className="p-6 bg-[var(--text-primary)] editorial-border shrink-0">
                        <Server className="text-[var(--bg-primary)]" size={48} />
                    </div>
                    <div>
                        <h3 className="font-serif text-3xl font-bold text-[var(--text-primary)] mb-3">FastAPI Backend</h3>
                        <p className="font-sans text-base text-[var(--muted)] leading-relaxed max-w-2xl">High-performance Python backend. Handles routing, ML model serving, and executing dynamic SQL aggregates via SQLAlchemy with sub-millisecond response times.</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Layer 5: Frontend */}
        <div className="relative">
            <h2 className="font-sans text-sm font-bold uppercase tracking-widest text-[var(--text-primary)] mb-6 flex items-center gap-3">
                <span className="w-6 h-6 rounded-none bg-[var(--text-primary)] text-[var(--bg-primary)] flex items-center justify-center text-xs">5</span>
                Presentation Layer
            </h2>
            <div className="grid grid-cols-1 gap-8">
                <div className="bg-[var(--card-bg)] editorial-border shadow-editorial p-8 flex flex-col md:flex-row items-start md:items-center gap-8 hover:-translate-y-1 hover:translate-x-1 transition-transform">
                    <div className="p-6 bg-[var(--text-primary)] editorial-border shrink-0">
                        <Monitor className="text-[var(--bg-primary)]" size={48} />
                    </div>
                    <div>
                        <h3 className="font-serif text-3xl font-bold text-[var(--text-primary)] mb-3">React + Astro + Tailwind</h3>
                        <p className="font-sans text-base text-[var(--muted)] leading-relaxed max-w-2xl">Component-driven architecture displaying Recharts visualisations. Executive dashboards designed for zero-latency metric interrogation using custom neo-brutalist aesthetics.</p>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Architecture;
