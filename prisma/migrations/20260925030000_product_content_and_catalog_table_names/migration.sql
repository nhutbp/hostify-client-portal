BEGIN;

ALTER TABLE "products" ADD COLUMN "content" TEXT NOT NULL DEFAULT '';

-- Move rich-text content saved by the previous version into the first-class column.
UPDATE "products" AS product
SET "content" = meta."meta_value" #>> '{}'
FROM "product_meta" AS meta
WHERE meta."product_id" = product."id"
  AND meta."meta_key" = 'content'
  AND jsonb_typeof(meta."meta_value") = 'string';

DELETE FROM "product_meta" WHERE "meta_key" = 'content';

ALTER TABLE "plans" RENAME TO "product_plans";
ALTER TABLE "prices" RENAME TO "product_prices";
ALTER TABLE "addons" RENAME TO "product_addons";

ALTER TABLE "product_plans" RENAME CONSTRAINT "plans_pkey" TO "product_plans_pkey";
ALTER TABLE "product_plans" RENAME CONSTRAINT "plans_product_id_fkey" TO "product_plans_product_id_fkey";
ALTER INDEX "plans_status_product_id_idx" RENAME TO "product_plans_status_product_id_idx";
ALTER INDEX "plans_product_id_code_key" RENAME TO "product_plans_product_id_code_key";

ALTER TABLE "product_prices" RENAME CONSTRAINT "prices_pkey" TO "product_prices_pkey";
ALTER TABLE "product_prices" RENAME CONSTRAINT "prices_plan_id_fkey" TO "product_prices_plan_id_fkey";
ALTER INDEX "prices_plan_id_status_effective_from_idx" RENAME TO "product_prices_plan_id_status_effective_from_idx";

ALTER TABLE "product_addons" RENAME CONSTRAINT "addons_pkey" TO "product_addons_pkey";
ALTER TABLE "product_addons" RENAME CONSTRAINT "addons_product_id_fkey" TO "product_addons_product_id_fkey";
ALTER INDEX "addons_code_key" RENAME TO "product_addons_code_key";
ALTER INDEX "addons_product_id_status_idx" RENAME TO "product_addons_product_id_status_idx";

COMMIT;
