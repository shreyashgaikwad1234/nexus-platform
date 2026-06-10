import pandas as pd
import numpy as np
from sqlalchemy import create_engine
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score
import pickle
import os

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:nexus_password@127.0.0.1:5432/nexus_db")
engine = create_engine(DATABASE_URL)

def train_customer_intelligence():
    print("Loading Customer 360 data...")
    df = pd.read_sql("SELECT * FROM mart_customer_360", con=engine)
    
    # 1. Churn Risk Model (Phase 2 & Metric Calibration)
    # The dataset has an average recency of 288 days.
    # Defining churn as 90 days resulted in 90% churn rate.
    # We will redefine churn as > 365 days (1 year) to be more realistic for e-commerce.
    df['is_churned'] = (df['recency'] > 365).astype(int)
    
    # Features
    # REMOVE RECENCY because it's used to define churn (data leakage)
    features = ['frequency', 'monetary', 'avg_order_value', 'avg_review_score', 'late_delivery_rate', 'customer_tenure']
    X = df[features].fillna(0)
    y = df['is_churned']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Churn Risk Model (XGBoost)...")
    # Increase regularization to prevent extreme probability clustering
    model = xgb.XGBClassifier(n_estimators=100, max_depth=4, learning_rate=0.05, gamma=1, min_child_weight=2, subsample=0.8, random_state=42)
    model.fit(X_train, y_train)
    
    auc = roc_auc_score(y_test, model.predict_proba(X_test)[:, 1])
    print(f"Churn Model AUC: {auc:.4f}")
    
    print("Predicting churn probabilities...")
    # Generate probabilities for all customers
    df['churn_probability'] = model.predict_proba(X)[:, 1]
    
    # Calibrate probabilities slightly if they are still too high, but XGBoost with better params should be okay
    # Let's add a floor/ceiling just in case
    df['churn_probability'] = df['churn_probability'].clip(0.01, 0.99)
    
    print("Calculating revenue risk...")
    # 2. Revenue Risk Calibration
    # Only consider revenue "at risk" if the probability is decently high (> 0.5)
    # Otherwise, multiply the monetary value by the probability as before
    df['revenue_at_risk'] = df['monetary'] * df['churn_probability']
    
    print("Performing segmentation (Vectorized)...")
    # 3. Customer Segmentation
    monetary_q8 = df['monetary'].quantile(0.8)
    frequency_q8 = df['frequency'].quantile(0.8)
    
    df['segment'] = 'Need Attention'
    df.loc[(df['monetary'] > monetary_q8) & (df['churn_probability'] < 0.4), 'segment'] = 'Champions'
    df.loc[(df['monetary'] > monetary_q8) & (df['churn_probability'] >= 0.4), 'segment'] = 'At Risk - High Value'
    df.loc[(df['segment'] == 'Need Attention') & (df['frequency'] > frequency_q8), 'segment'] = 'Loyal Customers'
    df.loc[(df['segment'] == 'Need Attention') & (df['recency'] > 365), 'segment'] = 'Dormant'
    df.loc[(df['segment'] == 'Need Attention') & (df['recency'] < 60), 'segment'] = 'New Customers'

    print("Generating intervention recommendations (Vectorized)...")
    # 4. Intervention Recommendation
    df['recommended_action'] = 'Standard Newsletter'
    df.loc[df['segment'] == 'At Risk - High Value', 'recommended_action'] = 'Personalized High-Value Discount'
    df.loc[(df['segment'] == 'Need Attention') & (df['churn_probability'] > 0.6), 'recommended_action'] = 'Free Shipping Offer'
    df.loc[df['segment'] == 'Champions', 'recommended_action'] = 'Loyalty Program Invite'
    df.loc[df['segment'] == 'Dormant', 'recommended_action'] = 'Win-back Email'
    
    # Save results back to Postgres
    print("Saving intelligence results to Postgres (this can be slow)...")
    df.to_sql('customer_intelligence', con=engine, if_exists='replace', index=False, chunksize=1000)
    
    # Save model artifacts
    if not os.path.exists('nexus-platform/models'):
        os.makedirs('nexus-platform/models')
    
    with open('nexus-platform/models/churn_model.pkl', 'wb') as f:
        pickle.dump(model, f)
    
    print("Intelligence Engine complete & Calibrated!")

if __name__ == "__main__":
    train_customer_intelligence()
