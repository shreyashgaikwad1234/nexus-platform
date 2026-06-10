import pandas as pd
import numpy as np
from sqlalchemy import create_engine
import xgboost as xgb
import shap
import pickle
import os
import time

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:nexus_password@127.0.0.1:5432/nexus_db")
engine = create_engine(DATABASE_URL)

def generate_shap_explanations():
    print("Loading Customer Intelligence data and model...")
    # We need the features used for training
    features = ['frequency', 'monetary', 'avg_order_value', 'avg_review_score', 'late_delivery_rate', 'customer_tenure']
    
    # Load data
    df = pd.read_sql("SELECT customer_unique_id, frequency, monetary, avg_order_value, avg_review_score, late_delivery_rate, customer_tenure, churn_probability FROM customer_intelligence", con=engine)
    X = df[features].fillna(0)
    
    # Load model
    model_path = 'nexus-platform/models/churn_model.pkl'
    if not os.path.exists(model_path):
        print(f"Error: Model not found at {model_path}. Train the intelligence engine first.")
        return
        
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
        
    print("Initializing SHAP TreeExplainer...")
    explainer = shap.TreeExplainer(model)
    
    # To avoid memory issues on 100k rows, we'll process in chunks or just explain a sample.
    # For production, explain all active/at-risk customers. For this script, we explain top 5000 at-risk + random sample
    print("Selecting cohort for explanation...")
    # Let's explain all for completeness, SHAP TreeExplainer is fast
    print("Calculating SHAP values (this may take a minute)...")
    shap_values = explainer.shap_values(X)
    
    # SHAP values array is same shape as X
    # Map raw features to business language
    feature_mapping = {
        'frequency': ('Low Purchase Frequency', 'High Purchase Frequency'),
        'monetary': ('Low Lifetime Value', 'High Lifetime Value'),
        'avg_order_value': ('Low Average Order Value', 'High Average Order Value'),
        'avg_review_score': ('Negative Review Sentiment', 'Positive Review Sentiment'),
        'late_delivery_rate': ('Reliable Delivery', 'High Delivery Delay Rate'),
        'customer_tenure': ('New Customer Risk', 'Established Customer History')
    }
    
    print("Extracting Top Risk Drivers...")
    explanations = []
    
    # Process row by row
    for i in range(len(df)):
        if i % 10000 == 0:
            print(f"Processed {i}/{len(df)}")
            
        row_shap = shap_values[i]
        
        # Sort features by absolute SHAP value to find top drivers
        # We want to identify the top *risk* drivers (positive SHAP pushes towards churn)
        # So we sort by actual SHAP value (descending) to get top risk contributors
        
        # Create a list of tuples: (feature_index, shap_value)
        feature_impacts = [(j, row_shap[j]) for j in range(len(features))]
        
        # Sort by absolute impact to find the most "important" drivers for this customer, 
        # whether they are keeping them or pushing them away
        feature_impacts.sort(key=lambda x: abs(x[1]), reverse=True)
        
        top_drivers = []
        for j, impact in feature_impacts[:3]: # Get top 3
            feature_name = features[j]
            raw_value = X.iloc[i, j]
            
            # Translate to business terminology based on impact direction
            # If impact > 0, it's pushing TOWARDS churn (Risk)
            # If impact < 0, it's pulling AWAY from churn (Retention)
            if impact > 0:
                # Risk terminology
                business_term = feature_mapping[feature_name][0] if feature_name in ['frequency', 'monetary', 'avg_order_value', 'avg_review_score', 'customer_tenure'] else feature_mapping[feature_name][1]
            else:
                # Retention terminology
                business_term = feature_mapping[feature_name][1] if feature_name in ['frequency', 'monetary', 'avg_order_value', 'avg_review_score', 'customer_tenure'] else feature_mapping[feature_name][0]
                
            top_drivers.append({
                'name': business_term,
                'impact': round(float(impact), 4),
                'raw_feature': feature_name,
                'raw_value': float(raw_value)
            })
            
        explanations.append({
            'customer_id': df.iloc[i]['customer_unique_id'],
            'top_driver_1': top_drivers[0]['name'] if len(top_drivers) > 0 else None,
            'top_driver_1_impact': top_drivers[0]['impact'] if len(top_drivers) > 0 else 0,
            'top_driver_2': top_drivers[1]['name'] if len(top_drivers) > 1 else None,
            'top_driver_2_impact': top_drivers[1]['impact'] if len(top_drivers) > 1 else 0,
            'top_driver_3': top_drivers[2]['name'] if len(top_drivers) > 2 else None,
            'top_driver_3_impact': top_drivers[2]['impact'] if len(top_drivers) > 2 else 0,
            'shap_score': round(float(sum(row_shap)), 4), # Base score + shap_score = prediction log odds
            'created_at': pd.Timestamp.now()
        })
        
    explanations_df = pd.DataFrame(explanations)
    
    print("Saving Customer Explanations to Postgres...")
    explanations_df.to_sql('customer_explanations', con=engine, if_exists='replace', index=False, chunksize=5000)
    print("SHAP Explainability Engine complete!")

if __name__ == "__main__":
    generate_shap_explanations()
