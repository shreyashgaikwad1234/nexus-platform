with order_metrics as (
    select * from {{ ref('int_order_metrics') }}
),

customers as (
    select * from {{ ref('stg_customers') }}
),

today_date as (
    select max(purchase_at) + interval '1 day' as today from order_metrics
),

customer_agg as (
    select
        c.customer_unique_id,
        min(om.purchase_at) as first_purchase_at,
        max(om.purchase_at) as last_purchase_at,
        count(distinct om.order_id) as frequency,
        sum(om.order_payment_total) as monetary,
        avg(om.order_payment_total) as avg_order_value,
        avg(om.avg_review_score) as avg_review_score,
        avg(om.is_late_delivery) as late_delivery_rate
    from order_metrics om
    join customers c on om.customer_id = c.customer_id
    group by 1
)

select
    a.*,
    extract(day from ((select today from today_date) - a.last_purchase_at)) as recency,
    extract(day from (a.last_purchase_at - a.first_purchase_at)) as customer_tenure,
    case when a.frequency > 1 then 1 else 0 end as is_repeat_customer
from customer_agg a
