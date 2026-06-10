import pandas as pd
import numpy as np
from sqlalchemy import create_engine
from prophet import Prophet
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:nexus_password@127.0.0.1:5432/nexus_db")
engine = create_engine(DATABASE_URL)

def generate_forecasts():
    print("Loading historical data for forecasting...")
    
    # We will forecast Daily Revenue, Daily Orders, and Active Customers.
    # Get daily revenue and orders
    query_revenue = """
        SELECT DATE_TRUNC('day', o.order_purchase_timestamp::timestamp)::date as ds, 
               SUM(p.payment_value) as y,
               COUNT(DISTINCT o.order_id) as orders,
               COUNT(DISTINCT o.customer_id) as customers
        FROM olist_orders o
        JOIN olist_order_payments p ON o.order_id = p.order_id
        WHERE o.order_status NOT IN ('canceled', 'unavailable')
        GROUP BY 1 ORDER BY 1
    """
    df_raw = pd.read_sql(query_revenue, con=engine)
    df_raw['ds'] = pd.to_datetime(df_raw['ds'])
    
    # Prepare Prophet dataframes
    df_revenue = df_raw[['ds', 'y']].rename(columns={'y': 'y'})
    df_orders = df_raw[['ds', 'orders']].rename(columns={'orders': 'y'})
    df_customers = df_raw[['ds', 'customers']].rename(columns={'customers': 'y'})
    
    forecast_results = []
    
    def run_prophet(df, metric_name):
        print(f"Training Prophet model for {metric_name}...")
        m = Prophet(daily_seasonality=False, yearly_seasonality=True, weekly_seasonality=True)
        m.fit(df)
        
        # Forecast 180 days out
        future = m.make_future_dataframe(periods=180)
        forecast = m.predict(future)
        
        # Keep only the future predictions
        last_actual_date = df['ds'].max()
        future_forecast = forecast[forecast['ds'] > last_actual_date].copy()
        
        # Scenario generation based on standard Prophet bounds
        # yhat is base case, yhat_upper is optimistic, yhat_lower is conservative
        for _, row in future_forecast.iterrows():
            # Ensure no negative predictions
            pred = max(0, row['yhat'])
            lower = max(0, row['yhat_lower'])
            upper = max(0, row['yhat_upper'])
            
            forecast_results.append({
                'forecast_date': row['ds'],
                'metric_name': metric_name,
                'predicted_value': pred,
                'lower_bound': lower,
                'upper_bound': upper,
                'model_name': 'Prophet'
            })
            
    run_prophet(df_revenue, 'Revenue')
    run_prophet(df_orders, 'Orders')
    run_prophet(df_customers, 'Active Customers')
    
    # Format and save
    forecast_df = pd.DataFrame(forecast_results)
    print("Saving forecasts to Postgres...")
    forecast_df.to_sql('forecast_metrics', con=engine, if_exists='replace', index=False)
    print("Revenue Forecasting Engine complete!")

if __name__ == "__main__":
    generate_forecasts()
