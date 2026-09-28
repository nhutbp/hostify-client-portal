ALTER TABLE "products" ADD COLUMN "slug" TEXT;

-- Existing product codes are stable; the UUID suffix keeps historical slugs unique.
UPDATE "products"
SET "slug" = lower(trim(both '-' from regexp_replace("code", '[^a-zA-Z0-9]+', '-', 'g')))
             || '-' || "id"::text;

ALTER TABLE "products" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");
