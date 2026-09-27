-- Preserve any metadata written to the legacy JSON column since the earlier backfill.
INSERT INTO "product_meta" ("id", "product_id", "meta_key", "meta_value", "value_type", "updated_at")
SELECT gen_random_uuid(), p."id", entry.key, entry.value, jsonb_typeof(entry.value), CURRENT_TIMESTAMP
FROM "products" p
CROSS JOIN LATERAL jsonb_each(
  CASE WHEN jsonb_typeof(p."metadata") = 'object' THEN p."metadata" ELSE '{}'::jsonb END
) entry
ON CONFLICT ("product_id", "meta_key") DO NOTHING;

-- A product can now have exactly one category. Stop rather than discard ambiguous links.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "products" p
    LEFT JOIN "product_category_links" link ON link."product_id" = p."id"
    GROUP BY p."id"
    HAVING COUNT(link."category_id") <> 1
  ) THEN
    RAISE EXCEPTION 'Cannot migrate products: each product must have exactly one category link';
  END IF;
END $$;

ALTER TABLE "products" ADD COLUMN "category_id" UUID;

UPDATE "products" p
SET "category_id" = link."category_id"
FROM "product_category_links" link
WHERE link."product_id" = p."id";

ALTER TABLE "products" ALTER COLUMN "category_id" SET NOT NULL;
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES "product_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

DROP INDEX "products_category_status_idx";
CREATE INDEX "products_category_id_status_idx" ON "products"("category_id", "status");

DROP TABLE "product_category_links";
ALTER TABLE "products" DROP COLUMN "category";
ALTER TABLE "products" DROP COLUMN "metadata";
