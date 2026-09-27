BEGIN;

INSERT INTO "product_categories" ("id", "name", "slug", "kind", "updated_at")
VALUES (gen_random_uuid(), 'Nhà cung cấp', 'nha-cung-cap', 'PROVIDER', CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;

UPDATE "product_categories" AS child
SET "parent_id" = parent."id"
FROM "product_categories" AS parent
WHERE parent."slug" = 'nha-cung-cap'
  AND parent."kind" = 'PROVIDER'
  AND child."kind" = 'PROVIDER'
  AND child."id" <> parent."id"
  AND child."parent_id" IS NULL;

ALTER TABLE "products" ADD COLUMN "provider_category_id" UUID;
CREATE INDEX "products_provider_category_id_idx" ON "products"("provider_category_id");
ALTER TABLE "products" ADD CONSTRAINT "products_provider_category_id_fkey"
  FOREIGN KEY ("provider_category_id") REFERENCES "product_categories"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;
