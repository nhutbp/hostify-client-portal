-- All sellable service types share products and product_category_links.
INSERT INTO "product_categories" ("id", "name", "slug", "updated_at")
VALUES
  (gen_random_uuid(), 'Server', 'server', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Tên miền', 'domain', CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;

-- Preserve older products whose legacy category string predates the link table.
INSERT INTO "product_category_links" ("product_id", "category_id")
SELECT p."id", c."id"
FROM "products" p
JOIN "product_categories" c ON c."slug" = lower(p."category")
WHERE lower(p."category") IN ('server', 'domain')
ON CONFLICT DO NOTHING;
