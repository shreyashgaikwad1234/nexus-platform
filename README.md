# Nexus Enterprise Platform (v3.0.0-PRO)

![React](https://img.shields.io/badge/Frontend-React-61DAFB)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791)
![dbt](https://img.shields.io/badge/Data-dbt-FF694B)
![XGBoost](https://img.shields.io/badge/ML-XGBoost-F4B400)
![SHAP](https://img.shields.io/badge/Explainability-SHAP-E91E63)
![Prophet](https://img.shields.io/badge/Forecasting-Prophet-7B68EE)
![TailwindCSS](https://img.shields.io/badge/UI-TailwindCSS-38BDF8)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000)
![Render](https://img.shields.io/badge/API-Render-46E3B7)

**Architecture:** Astro | **Backend:** FastAPI | **ML:** XGBoost | **UI:** TailwindCSS

Nexus is a world-class, enterprise-grade AI Customer Retention Intelligence Platform designed to protect and grow global revenue streams. Inspired by industry-leading analytics and intelligence products, it combines advanced machine learning (XGBoost + Prophet) with a cinematic, high-density Command Center for real-time churn prediction, behavioral explanation, and strategic forecasting.

## 🚀 Key Features
### 🧠 Advanced AI & ML Core
* **Predictive Churn Engine:** Real-time customer risk scoring using a custom-trained XGBoost model.
* **Explainable AI (SHAP):** Human-readable rationale for every decision, visualizing exactly how features like "Delivery Delay" or "Monetary Value" influenced the churn risk.
* **Strategic Forecasting:** 180-Day Prophet predictions estimating future revenue, orders, and active users with confidence intervals.

### 🏛️ Enterprise Command Center
* **Review Intelligence:** Multilingual NLP pipeline (VADER) processing customer feedback to correlate customer satisfaction with revenue at risk.
* **Global Data Quality:** Analytics Engineering pipeline monitor tracking dbt test results, freshness lag, and anomalies.
* **Full-Screen Intelligence:** Dedicated modal workflows for analysts to deep-dive into suspicious at-risk profiles, including CSV exports and targeted intervention protocols.

### 📊 Business Intelligence
* **Executive Summary:** Real-time KPI tracking for Revenue Protected, Revenue at Risk Identified, and Retention Uplift Potential.
* **Dual-Theme Architecture:** Seamless transition between high-contrast "Enterprise Light" and premium "Midnight Dark" modes with perfect editorial typography.

## 🛠️ Tech Stack
| Layer | Technology |
| :--- | :--- |
| **Frontend** | AstroJS, React, TypeScript |
| **Styling** | Tailwind CSS (v4), Framer Motion, Recharts |
| **Backend** | FastAPI, Uvicorn, Python 3.11 |
| **ML/DS** | XGBoost, SHAP, Prophet, Pandas, NumPy, VADER NLP |
| **Data Eng** | dbt (Data Build Tool), PostgreSQL |

## 🏗️ System Architecture
Nexus uses a sophisticated Multi-Layer Architecture:

* **Data Storage & Engineering:** PostgreSQL warehouse orchestrated by dbt to create modular staging models and the final `mart_customer_360` table.
* **Feature Engineering:** Raw data engineered into high-fidelity predictive signals (Recency, Frequency, Sentiment).
* **Intelligence Layer:** XGBoost churn model, SHAP explainability, and NLP pipelines calculating real-time metrics.
* **API Gateway:** High-performance FastAPI backend serving model inferences with sub-millisecond response times.
* **Presentation:** Component-driven Astro + React frontend utilizing a custom neo-brutalist / high-fashion data aesthetic.

## 💻 Installation & Setup

### 1. Backend Setup
```bash
# Clone the repository
git clone https://github.com/shreyashgaikwad1234/nexus-platform.git
cd nexus-platform/backend

# Create virtual environment & Install Python dependencies
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run the Intelligence Engine (FastAPI)
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
# Navigate to the frontend
cd ../frontend

# Install Node dependencies
npm install

# Start the Command Center
npm run dev
```

## 🕵️ Data Science Deep-Dive
### The Model: XGBoost + Prophet
Nexus addresses customer churn and revenue forecasting using a dual-engine approach. XGBoost identifies the subtle behavioral patterns indicating a customer is likely to leave, while Prophet handles time-series forecasting to predict macro-level business trends, handling seasonality and holidays automatically.

### Interpretability: SHAP
In enterprise decision-making, a "Black Box" is unacceptable. Nexus utilizes SHAP (SHapley Additive exPlanations) to break down the model's output. Analysts can see exactly which behavioral drivers push a customer toward churning (Risk) or retaining, enabling highly targeted intervention protocols.

## 📈 Executive Impact
Nexus is designed to demonstrate three core proficiencies:
* **Staff-Level Engineering:** Modular Astro architecture, complex state management, and an uncompromising editorial aesthetic.
* **Product Thinking:** Focus on actionable business value (Revenue Protected, ROI of Campaigns) over purely academic metrics.
* **Data Science Maturity:** Combining predictive modeling, time-series forecasting, and NLP into a unified, explainable product.

## ⚖️ License
Distributed under the MIT License. See `LICENSE` for more information.

---
**Nexus Enterprise** • Securing and Scaling Global Revenue through Neural Intelligence.