import pandas as pd
import numpy as np
from sqlalchemy import create_engine
import os

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:nexus_password@127.0.0.1:5432/nexus_db")
engine = create_engine(DATABASE_URL)

def calculate_customer_health():
    print("Loading intelligence and review data for Health Scoring...")
    
    # 1. Load Core Intelligence Data
    query = """
        SELECT 
            customer_unique_id,
            frequency,
            monetary,
            churn_probability,
            late_delivery_rate,
            recency,
            is_repeat_customer,
            customer_tenure
        FROM customer_intelligence
    """
    df = pd.read_sql(query, con=engine)
    
    # 2. Load Sentiment Data (Average per customer)
    sentiment_query = """
        SELECT 
            customer_unique_id, 
            AVG(sentiment_score) as avg_sentiment 
        FROM customer_review_intelligence 
        GROUP BY 1
    """
    sent_df = pd.read_sql(sentiment_query, con=engine)
    
    # Merge datasets
    df = df.merge(sent_df, on='customer_unique_id', how='left')
    df['avg_sentiment'] = df['avg_sentiment'].fillna(0.3) # Default to slightly positive for no reviews
    
    print("Executing Weighted Scoring Engine...")
    
    # Components & Normalization
    # Purchase Frequency (20%): Log normalized
    df['score_freq'] = np.clip(np.log1p(df['frequency']) / np.log1p(df['frequency'].max()), 0, 1) * 100
    
    # Revenue Trend (20%): We'll use tenure as a proxy for trend stability in this dataset
    df['score_revenue'] = np.clip(df['monetary'] / df['monetary'].quantile(0.95), 0, 1) * 100
    
    # Churn Risk (25%): Inverse of churn probability
    df['score_churn'] = (1.0 - df['churn_probability']) * 100
    
    # Review Sentiment (15%): Scaled -1 to 1 into 0 to 100
    df['score_sentiment'] = ((df['avg_sentiment'] + 1) / 2) * 100
    
    # Delivery Performance (10%): Inverse of late delivery rate
    df['score_delivery'] = (1.0 - df['late_delivery_rate']) * 100
    
    # Recency (10%): Inverse of recency normalized
    df['score_recency'] = (1.0 - (df['recency'] / 365.0)).clip(0, 1) * 100
    
    # Calculate Final Health Score
    df['health_score'] = (
        (df['score_freq'] * 0.20) +
        (df['score_revenue'] * 0.20) +
        (df['score_churn'] * 0.25) +
        (df['score_sentiment'] * 0.15) +
        (df['score_delivery'] * 0.10) +
        (df['score_recency'] * 0.10)
    ).round(2)
    
    # Assign Health Categories
    def get_health_cat(score):
        if score >= 90: return 'Excellent'
        elif score >= 75: return 'Healthy'
        elif score >= 50: return 'Warning'
        elif score >= 25: return 'At Risk'
        else: return 'Critical'
        
    df['health_category'] = df['health_score'].apply(get_health_cat)
    
    # 3. Add Health Drivers & Risk Drivers (Business language)
    def get_drivers(row):
        drivers = []
        if row['score_freq'] > 70: drivers.append('High Purchase Frequency')
        if row['score_delivery'] > 90: drivers.append('Consistent Deliveries')
        if row['score_sentiment'] > 80: drivers.append('Positive Brand Sentiment')
        return ", ".join(drivers[:2]) if drivers else 'Standard Profile'
        
    def get_risks(row):
        risks = []
        if row['churn_probability'] > 0.5: risks.append('High Churn Probability')
        if row['late_delivery_rate'] > 0.2: risks.append('Delivery Delays')
        if row['recency'] > 180: risks.append('Recent Inactivity')
        return ", ".join(risks[:2]) if risks else 'Low Immediate Risk'

    df['health_drivers'] = df.apply(get_drivers, axis=1)
    df['risk_drivers'] = df.apply(get_risks, axis=1)
    
    # Select final columns
    output_df = df[[
        'customer_unique_id', 'health_score', 'health_category', 
        'health_drivers', 'risk_drivers', 'monetary'
    ]]
    
    print("Saving Customer Health Scores to Postgres...")
    output_df.to_sql('customer_health_scores', con=engine, if_exists='replace', index=False, chunksize=5000)
    print("Customer Health Scoring Engine complete!")

if __name__ == "__main__":
    calculate_customer_health()
