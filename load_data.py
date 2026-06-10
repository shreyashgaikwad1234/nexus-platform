import os
import pandas as pd
from sqlalchemy import create_engine
import time

# Database connection details
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:nexus_password@127.0.0.1:5432/nexus_db")

# Directory containing Olist CSVs
DATA_DIR = 'nexus-platform/data'

def load_csvs_to_postgres():
    print("Waiting for Postgres to be ready...")
    time.sleep(10) # Give Postgres a moment to start
    
    # Create engine
    engine = create_engine(DATABASE_URL)
    
    # List all files in the data directory
    files = [f for f in os.listdir(DATA_DIR) if f.endswith('.csv')]
    
    if not files:
        print(f"No CSV files found in {DATA_DIR}.")
        return

    for file in files:
        # Standardize table names
        table_name = file.replace('.csv', '').replace('_dataset', '')
        # Handle the specific case for category translation
        if 'product_category_name_translation' in table_name:
            table_name = 'product_category_name_translation'
            
        file_path = os.path.join(DATA_DIR, file)
        
        print(f"Loading {file} into table {table_name}...")
        try:
            # Load CSV into DataFrame
            df = pd.read_csv(file_path)
            
            # Write to Postgres
            df.to_sql(table_name, con=engine, if_exists='replace', index=False, schema='public')
            print(f"Successfully loaded {table_name}.")
        except Exception as e:
            print(f"Error loading {file}: {e}")

if __name__ == "__main__":
    load_csvs_to_postgres()
