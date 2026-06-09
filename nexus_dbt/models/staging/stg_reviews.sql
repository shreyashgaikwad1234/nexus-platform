with source as (
    select * from {{ source('olist', 'olist_order_reviews') }}
)

select
    review_id,
    order_id,
    review_score,
    review_comment_title,
    review_comment_message,
    cast(review_creation_date as timestamp) as created_at,
    cast(review_answer_timestamp as timestamp) as answered_at
from source
