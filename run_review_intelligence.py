import pandas as pd
import numpy as np
from sqlalchemy import create_engine
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from deep_translator import GoogleTranslator
from langdetect import detect
import time
import os

# Database connection
engine = create_engine("postgresql://postgres:nexus_password@127.0.0.1:5432/nexus_db")

def run_review_intelligence_v2():
    print("Loading review and customer intelligence data...")
    # Get reviews with customer intelligence linkage
    # Increased limit and removed strict 'desc' ordering to get a better spread of dates for the trend
    query = """
    select 
        r.review_id,
        r.order_id,
        r.review_score,
        r.review_comment_message,
        r.created_at,
        o.customer_id,
        cu.customer_unique_id,
        c.monetary as customer_revenue,
        c.churn_probability,
        c.segment,
        c.recommended_action
    from stg_reviews r
    join stg_orders o on r.order_id = o.order_id
    join stg_customers cu on o.customer_id = cu.customer_id
    join customer_intelligence c on cu.customer_unique_id = c.customer_unique_id
    where r.review_comment_message is not null
    order by r.created_at asc  -- Changed to asc to see older data or just remove order for random
    limit 1000 
    """
    df = pd.read_sql(query, con=engine)
    
    # If we still have mostly one month, let's just take a random sample from the whole table instead
    if len(df['created_at'].dt.to_period('M').unique()) <= 1:
        print("Detected narrow date range, taking a random sample instead...")
        query = """
        select 
            r.review_id,
            r.order_id,
            r.review_score,
            r.review_comment_message,
            r.created_at,
            o.customer_id,
            cu.customer_unique_id,
            c.monetary as customer_revenue,
            c.churn_probability,
            c.segment,
            c.recommended_action
        from stg_reviews r
        join stg_orders o on r.order_id = o.order_id
        join stg_customers cu on o.customer_id = cu.customer_id
        join customer_intelligence c on cu.customer_unique_id = c.customer_unique_id
        where r.review_comment_message is not null
        order by random()
        limit 1000
        """
        df = pd.read_sql(query, con=engine)

    print(f"Processing {len(df)} reviews for NLP Pipeline V2...")
    
    analyzer = SentimentIntensityAnalyzer()
    translator = GoogleTranslator(source='pt', target='en')
    
    translated_texts = []
    languages = []
    
    print("Executing Multilingual NLP Pipeline (Detect & Translate)...")
    for idx, text in enumerate(df['review_comment_message']):
        if idx % 50 == 0:
            print(f"Processed {idx}/{len(df)}...")
        
        clean_text = str(text).strip()
        if not clean_text:
            translated_texts.append("")
            languages.append("unknown")
            continue

        lang = 'pt'
        try:
            if len(clean_text) > 5:
                lang = detect(clean_text)
        except:
            pass
            
        try:
            if lang == 'pt':
                # Deep Translator Call
                translated = translator.translate(clean_text)
                translated_texts.append(translated if translated else clean_text)
            elif lang == 'en':
                translated_texts.append(clean_text)
            else:
                # Try to translate anyway if it's not English
                translated = translator.translate(clean_text)
                translated_texts.append(translated if translated else clean_text)
            languages.append(lang)
        except Exception as e:
            languages.append(lang)
            translated_texts.append(clean_text)
            
    df['original_review'] = df['review_comment_message']
    df['translated_review'] = translated_texts
    df['language'] = languages
    
    # 2. Advanced Sentiment Analysis
    print("Scoring sentiment on English translations...")
    df['sentiment_score'] = df['translated_review'].apply(lambda x: analyzer.polarity_scores(str(x))['compound'] if x else 0)
    
    def get_5_tier_sentiment(score):
        if score >= 0.5: return 'Very Positive'
        elif score >= 0.05: return 'Positive'
        elif score <= -0.5: return 'Very Negative'
        elif score <= -0.05: return 'Negative'
        else: return 'Neutral'
    
    df['sentiment_label'] = df['sentiment_score'].apply(get_5_tier_sentiment)
    
    # Confidence score: Strength of sentiment + alignment with review_score
    # If sentiment is positive and score is 5, confidence is high.
    # If sentiment is negative and score is 1, confidence is high.
    def calculate_confidence(row):
        sent = row['sentiment_score']
        score = row['review_score']
        normalized_score = (score - 3) / 2 # -1 to 1
        
        # Alignment between text sentiment and numerical score
        alignment = 1.0 - abs(sent - normalized_score) / 2
        strength = abs(sent)
        
        return round((alignment * 0.4) + (strength * 0.6), 4)

    df['confidence_score'] = df.apply(calculate_confidence, axis=1)
    
    # 3. Complaint & Category Logic
    df['complaint_flag'] = ((df['sentiment_score'] <= -0.05) | (df['review_score'] <= 2)).astype(int)
    
    categories = {
        'Delivery Issues': ['delivery', 'late', 'arrive', 'wait', 'time', 'post office', 'tracking', 'delay', 'freight', 'shipping'],
        'Product Quality': ['quality', 'broken', 'defect', 'material', 'bad', 'poor', 'ruin', 'fragile', 'work', 'small', 'size'],
        'Customer Service': ['support', 'contact', 'respond', 'seller', 'service', 'rude', 'ignore', 'answer', 'chat'],
        'Pricing': ['price', 'expensive', 'cost', 'value', 'cheap', 'money', 'worth'],
        'Payment Issues': ['payment', 'card', 'refund', 'charge', 'invoice', 'billet', 'boleto']
    }
    
    def categorize(text):
        text = str(text).lower()
        for cat, keywords in categories.items():
            if any(kw in text for kw in keywords):
                return cat
        return 'Other'

    df['review_category'] = df['translated_review'].apply(categorize)
    
    # 4. Review-to-Revenue Linkage
    print("Linking reviews to Revenue Intelligence...")
    df['revenue_at_risk'] = df['customer_revenue'] * df['churn_probability']
    df['health_score'] = ((1.0 - df['churn_probability']) * 100).astype(int)
    
    def get_health_category(score):
        if score >= 80: return 'Excellent'
        elif score >= 50: return 'Fair'
        else: return 'Critical'
        
    df['health_category'] = df['health_score'].apply(get_health_category)
    
    # Final Formatting
    output_df = df[[
        'customer_id', 'customer_unique_id', 'review_id', 'order_id',
        'original_review', 'translated_review', 'language',
        'sentiment_score', 'sentiment_label', 'confidence_score',
        'complaint_flag', 'review_category', 
        'customer_revenue', 'churn_probability', 'revenue_at_risk', 
        'health_score', 'health_category', 'recommended_action', 'created_at'
    ]]
    
    # Save to PostgreSQL
    print("Saving Review Intelligence V2 to Postgres...")
    output_df.to_sql('customer_review_intelligence', con=engine, if_exists='replace', index=False, chunksize=1000)
    
    print("Review Intelligence Engine V2 complete!")

if __name__ == "__main__":
    run_review_intelligence_v2()
