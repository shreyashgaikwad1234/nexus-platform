import React from 'react';
import { BookOpen, Code, Database, Brain, DollarSign } from 'lucide-react';
import { useTheme } from '../utils/useTheme';

const InterviewMode = () => {
  const isDark = useTheme();

  const metrics = [
    {
      name: "Customer Health Score",
      formula: "20% Freq + 20% Rev Trend + 25% Churn Risk + 15% Sentiment + 10% Delivery + 10% Recency",
      meaning: "A 0-100 scale quantifying the holistic relationship and engagement of a customer.",
      inputs: "purchase frequency, monetary value, XGBoost churn prob, NLP sentiment score, delivery lag, recency",
      output: "Float [0-100], mapped to Categories (Excellent, Healthy, Warning, At Risk, Critical)",
      icon: <Brain className="text-[var(--text-primary)]" />
    },
    {
      name: "Revenue At Risk",
      formula: "Customer LTV × Churn Probability × Exposure Factor",
      meaning: "The weighted financial value in jeopardy if a customer churns. Exposure Factor scales aggressiveness (e.g. 90% exposure if Churn > 80%).",
      inputs: "Monetary Value (LTV), XGBoost churn probability",
      output: "Float (Currency)",
      icon: <DollarSign className="text-[var(--text-primary)]" />
    },
    {
      name: "Retention Rate",
      formula: "COUNT(Customers where Churn Risk < 30%) / Total Customers",
      meaning: "The percentage of the customer base mathematically projected to remain active in the next 12 months.",
      inputs: "XGBoost churn probability",
      output: "Float (Percentage)",
      icon: <Database className="text-[var(--text-primary)]" />
    },
    {
      name: "SHAP Explainability",
      formula: "Base Log-Odds + Σ(Feature SHAP Values) = Prediction Log-Odds",
      meaning: "Provides exact mathematical contribution of every feature (e.g. Delivery Delay) to the final XGBoost churn probability.",
      inputs: "Trained XGBoost model, Raw Customer Features",
      output: "Array of positive/negative floats for every feature.",
      icon: <Code className="text-[var(--text-primary)]" />
    }
  ];

  return (
    <div className="w-full">
      <div className="mb-16 mt-4">
          <h2 className="font-serif text-5xl md:text-7xl font-bold tracking-tighter leading-none mb-4">Metric<br/>Definitions.</h2>
          <p className="font-sans text-sm font-bold uppercase tracking-widest text-[var(--muted)]">Core Logic & ML Auditing</p>
      </div>

      <div className="space-y-8 max-w-5xl mx-auto">
        {metrics.map((m, i) => (
            <div key={i} className="bg-[var(--card-bg)] editorial-border shadow-editorial p-8 hover:-translate-y-1 transition-transform">
                <div className="flex items-center gap-4 mb-6 border-b border-[var(--border-primary)] pb-4">
                    <div className="p-3 bg-[var(--bg-primary)] editorial-border">
                        {m.icon}
                    </div>
                    <h2 className="font-serif text-3xl font-black text-[var(--text-primary)]">{m.name}</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <span className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-widest block mb-2">Business Meaning</span>
                            <p className="text-sm font-serif text-[var(--text-primary)] leading-relaxed italic">{m.meaning}</p>
                        </div>
                        <div>
                            <span className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-widest block mb-2">Mathematical Formula</span>
                            <div className="bg-[var(--bg-primary)] editorial-border p-4">
                                <code className="text-xs font-mono text-[var(--accent)] font-bold">{m.formula}</code>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-6 bg-[var(--bg-primary)] p-6 editorial-border">
                        <div>
                            <span className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-widest block mb-2 border-b border-[var(--border-primary)] pb-1">Data Inputs</span>
                            <p className="text-xs font-mono text-[var(--text-primary)] leading-relaxed">{m.inputs}</p>
                        </div>
                        <div>
                            <span className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-widest block mb-2 border-b border-[var(--border-primary)] pb-1">Model Outputs</span>
                            <p className="text-xs font-mono text-[var(--accent)] font-bold leading-relaxed">{m.output}</p>
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default InterviewMode;
