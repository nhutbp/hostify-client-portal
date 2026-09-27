ALTER TABLE "product_categories" ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'SERVICE';

CREATE INDEX "product_categories_kind_name_idx" ON "product_categories"("kind", "name");

INSERT INTO "product_categories" ("id", "name", "slug", "kind", "updated_at")
VALUES
  (gen_random_uuid(), 'Mobifone', 'mobifone', 'PROVIDER', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'VNPT', 'vnpt', 'PROVIDER', CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;
