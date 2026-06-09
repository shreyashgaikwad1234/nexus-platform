# Nexus Platform

**AI-Powered Customer Retention Intelligence**

The **Nexus Platform** is an enterprise-grade analytics engineering and machine learning platform. It predicts customer churn risk, explains underlying behavior using transparent ML models, recommends targeted retention interventions, and forecasts strategic business impact—all unified within a stunning, "Editorial High-Tech" executive dashboard.

## 🚀 Key Capabilities

- **Predictive Churn Engine:** Leverages XGBoost to identify at-risk customers by analyzing recency, frequency, monetary value, and behavioral signals.
- **Transparent AI (SHAP):** Provides exact mathematical contribution of every feature to the final prediction, removing the "black box" of machine learning.
- **Campaign Simulator:** Dynamically forecast ROI, expected reach, and incremental revenue based on customizable budgets and discount intensities.
- **Multilingual NLP Review Intelligence:** Processes customer feedback through VADER sentiment analysis to correlate customer satisfaction with revenue at risk.
- **Analytics Engineering:** Robust data pipeline constructed with **dbt** (Data Build Tool) ensuring data integrity, uniqueness, and consistency.
- **Executive Command Center:** A bespoke, Neo-brutalist (Vogue meets Data) React frontend that seamlessly transitions between Light and Dark modes.

## 🛠️ Technology Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | Astro, React, Tailwind CSS, Recharts, Framer Motion, TypeScript |
| **Backend API** | FastAPI, Python, SQLAlchemy, Uvicorn |
| **Machine Learning** | XGBoost, SHAP, Prophet, Pandas, NumPy, VADER NLP |
| **Data Engineering** | dbt (Data Build Tool), PostgreSQL |

## 🏗️ Repository Structure

```text
/
├── frontend/           # Astro + React Executive Dashboard
├── backend/            # FastAPI ML Serving & Intelligence API
├── screenshots/        # Application showcase images
├── docs/               # Architecture diagrams and system design docs
├── dbt_project/        # (Optional) Source data models and transformations
├── .env.example        # Reference environment variables
├── render.yaml         # Backend deployment configuration
└── README.md           # This document
```

## 🌐 Deployment Guide

This project is configured for cloud deployment using **Vercel** (Frontend) and **Render** (Backend).

### Backend (Render)
1. Fork or clone this repository.
2. Sign in to [Render](https://render.com/) and create a new **Web Service**.
3. Connect your GitHub repository.
4. Render will automatically detect the `render.yaml` blueprint in the root directory.
5. In the Render dashboard, set your Environment Variables:
   - `DATABASE_URL`: Your PostgreSQL connection string.
   - `ALLOWED_ORIGINS`: e.g., `https://nexus-platform-frontend.vercel.app`

### Frontend (Vercel)
1. Sign in to [Vercel](https://vercel.com/) and click **Add New Project**.
2. Import the repository and set the **Root Directory** to `frontend`.
3. Vercel will auto-detect **Astro** as the framework.
4. Set the Environment Variables:
   - `PUBLIC_API_URL`: Your deployed Render backend URL (e.g., `https://nexus-backend.onrender.com`).
5. Click **Deploy**.

## 💻 Local Development

### 1. Database Setup
Ensure you have a PostgreSQL database running locally or in the cloud. Update the connection string in your `.env` file.

### 2. Backend API
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Copy .env.example to .env and update credentials
cp .env.example .env

# Run the FastAPI server
uvicorn main:app --reload --port 8000
```

### 3. Frontend Dashboard
```bash
cd frontend
npm install

# Copy .env.example to .env and configure the backend URL
cp .env.example .env

# Start the Astro dev server
npm run dev
```

Visit `http://localhost:4321` to view the Executive Command Center.

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
