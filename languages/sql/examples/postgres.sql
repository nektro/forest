-- A PostgreSQL schema with a function, a trigger, and some queries, as a
-- psql script.
\set ON_ERROR_STOP on

CREATE SCHEMA IF NOT EXISTS shop;

CREATE TYPE shop.order_status AS ENUM ('new', 'paid', 'shipped');

CREATE TABLE shop.orders (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id bigint NOT NULL REFERENCES shop.customers (id) ON DELETE CASCADE,
  status shop.order_status NOT NULL DEFAULT 'new',
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total numeric(10, 2) GENERATED ALWAYS AS ((items -> 0 ->> 'price')::numeric) STORED,
  placed_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT positive_total CHECK (total >= 0)
) PARTITION BY RANGE (placed_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS orders_items_idx
  ON shop.orders USING gin (items jsonb_path_ops) WHERE status <> 'shipped';

/* Keep updated_at current. /* Comments nest. */ */
CREATE OR REPLACE FUNCTION shop.touch() RETURNS trigger
LANGUAGE plpgsql AS $body$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END
$body$;

CREATE TRIGGER orders_touch BEFORE UPDATE ON shop.orders
  FOR EACH ROW WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION shop.touch();

CREATE FUNCTION shop.order_count(p_customer bigint, OUT n bigint)
LANGUAGE sql STABLE PARALLEL SAFE
BEGIN ATOMIC
  SELECT count(*) FROM shop.orders WHERE customer_id = p_customer;
END;

WITH recent AS MATERIALIZED (
  SELECT customer_id, sum(total) FILTER (WHERE status = 'paid') AS paid
  FROM shop.orders
  WHERE placed_at > now() - interval '30 days'
  GROUP BY ROLLUP (customer_id)
)
SELECT c.name,
       r.paid,
       rank() OVER (ORDER BY r.paid DESC NULLS LAST) AS position,
       array_agg(DISTINCT o.status ORDER BY o.status) AS statuses,
       CASE WHEN r.paid > 1000 THEN 'gold' ELSE 'standard' END AS tier
FROM recent r
  JOIN shop.customers c ON c.id = r.customer_id
  LEFT JOIN LATERAL (
    SELECT status FROM shop.orders WHERE customer_id = c.id LIMIT 3
  ) o ON true
WHERE c.email ILIKE '%@example.com' AND c.tags && ARRAY['vip', 'beta']
GROUP BY c.name, r.paid
ORDER BY position
FETCH FIRST 10 ROWS ONLY;

INSERT INTO shop.orders (customer_id, items)
VALUES ($1, jsonb_build_array(jsonb_build_object('sku', $2, 'price', $3)))
ON CONFLICT ON CONSTRAINT orders_pkey DO NOTHING
RETURNING id, placed_at AT TIME ZONE 'UTC' AS placed_utc;

UPDATE shop.orders o SET status = 'shipped'
FROM shop.shipments s
WHERE s.order_id = o.id AND s.sent_at IS NOT NULL
RETURNING o.*;

MERGE INTO shop.stock t USING shop.deliveries d ON t.sku = d.sku
WHEN MATCHED THEN UPDATE SET qty = t.qty + d.qty
WHEN NOT MATCHED THEN INSERT (sku, qty) VALUES (d.sku, d.qty);

COPY shop.customers (id, name) FROM stdin;
1	Ada
2	Grace
\.

SELECT name FROM shop.customers WHERE id = :'customer_id' \gset
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM shop.orders WHERE items @> '[{"sku": "x"}]';
GRANT SELECT, INSERT ON ALL TABLES IN SCHEMA shop TO app_user;
