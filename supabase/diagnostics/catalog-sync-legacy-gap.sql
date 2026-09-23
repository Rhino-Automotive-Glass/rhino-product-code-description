-- Read-only checks. Run before and after approved migration; save results.

SELECT
  (SELECT count(*) FROM public.product_codes) AS source_rows,
  (SELECT count(*) FROM public.products) AS products,
  (SELECT count(*) FROM public.brands) AS brands,
  (SELECT count(*) FROM public.product_brands) AS product_brands,
  (SELECT count(*) FROM public.product_codes pc
   WHERE NOT EXISTS (
     SELECT 1 FROM public.products p WHERE p.product_code_id=pc.id
   )) AS missing_products;

SELECT pc.id,pc.status,pc.created_at,pc.verified,
       pc.compatibility_data->'items'->0->>'marca' AS first_marca,
       pc.compatibility_data->'items'->0->>'modelo' AS first_model
FROM public.product_codes pc
WHERE NOT EXISTS (
  SELECT 1 FROM public.products p WHERE p.product_code_id=pc.id
)
ORDER BY pc.created_at,pc.id;

SELECT product_code_id,count(*) AS products_per_source
FROM public.products
GROUP BY product_code_id
HAVING count(*)>1;

SELECT p.id,p.product_code_id,p.primary_brand_id
FROM public.products p
WHERE p.primary_brand_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.product_brands pb
    WHERE pb.product_id=p.id AND pb.brand_id=p.primary_brand_id
  );

SELECT p.product_code_id,p.id,p.status,p.price,p.stock,p.images,
       p.model,p."subModel",p.primary_brand_id,
       array_agg(b.name ORDER BY b.name) FILTER (WHERE b.id IS NOT NULL) AS brand_names
FROM public.products p
LEFT JOIN public.product_brands pb ON pb.product_id=p.id
LEFT JOIN public.brands b ON b.id=pb.brand_id
GROUP BY p.product_code_id,p.id,p.status,p.price,p.stock,p.images,
         p.model,p."subModel",p.primary_brand_id
ORDER BY p.created_at DESC
LIMIT 50;
