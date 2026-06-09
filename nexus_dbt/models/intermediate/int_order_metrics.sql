with orders as (
    select * from {{ ref('stg_orders') }}
),

order_items as (
    select * from {{ ref('stg_order_items') }}
),

payments as (
    select
        order_id,
        sum(payment_value) as order_payment_total
    from {{ ref('stg_payments') }}
    group by 1
),

reviews as (
    select
        order_id,
        avg(review_score) as avg_review_score
    from {{ ref('stg_reviews') }}
    group by 1
),

customer_orders as (
    select
        o.order_id,
        o.customer_id,
        o.purchase_at,
        o.order_status,
        o.delivered_customer_at,
        o.estimated_delivery_at,
        p.order_payment_total,
        r.avg_review_score,
        -- Window Functions for Behavioral Metrics
        lag(o.purchase_at) over(partition by o.customer_id order by o.purchase_at) as previous_order_at,
        count(o.order_id) over(partition by o.customer_id order by o.purchase_at rows between unbounded preceding and current row) as order_sequence_number
    from orders o
    left join payments p on o.order_id = p.order_id
    left join reviews r on o.order_id = r.order_id
)

select
    *,
    extract(day from (purchase_at - previous_order_at)) as days_since_previous_order,
    case when delivered_customer_at > estimated_delivery_at then 1 else 0 end as is_late_delivery
from customer_orders
