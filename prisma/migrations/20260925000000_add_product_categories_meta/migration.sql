CREATE TABLE "product_categories" (
    "id" UUID NOT NULL,
    "parent_id" UUID,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "product_categories_slug_key" ON "product_categories"("slug");
CREATE INDEX "product_categories_name_idx" ON "product_categories"("name");
CREATE INDEX "product_categories_parent_id_idx" ON "product_categories"("parent_id");
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "product_meta" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "meta_key" TEXT NOT NULL,
    "meta_value" JSONB NOT NULL,
    "value_type" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "product_meta_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "product_meta_product_id_meta_key_key" ON "product_meta"("product_id", "meta_key");
CREATE INDEX "product_meta_product_id_idx" ON "product_meta"("product_id");
ALTER TABLE "product_meta" ADD CONSTRAINT "product_meta_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "product_category_links" (
    "product_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    CONSTRAINT "product_category_links_pkey" PRIMARY KEY ("product_id", "category_id")
);

CREATE INDEX "product_category_links_category_id_idx" ON "product_category_links"("category_id");
ALTER TABLE "product_category_links" ADD CONSTRAINT "product_category_links_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_category_links" ADD CONSTRAINT "product_category_links_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "product_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "product_categories" ("id", "name", "slug", "updated_at")
VALUES
  (gen_random_uuid(), 'VPS', 'vps', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Hosting', 'hosting', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Máy chủ vật lý', 'physical', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Proxy', 'proxy', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'VIA', 'via', CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "product_categories" ("id", "name", "slug", "updated_at")
SELECT gen_random_uuid(), legacy."category", 'legacy-' || md5(legacy."category"), CURRENT_TIMESTAMP
FROM (SELECT DISTINCT "category" FROM "products" WHERE lower("category") NOT IN ('vps', 'hosting', 'proxy', 'via', 'physical', 'máy chủ vật lý')) legacy
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "product_category_links" ("product_id", "category_id")
SELECT p."id", c."id"
FROM "products" p
JOIN "product_categories" c ON c."slug" = CASE lower(p."category")
  WHEN 'vps' THEN 'vps'
  WHEN 'hosting' THEN 'hosting'
  WHEN 'proxy' THEN 'proxy'
  WHEN 'via' THEN 'via'
  WHEN 'physical' THEN 'physical'
  WHEN 'máy chủ vật lý' THEN 'physical'
  ELSE 'legacy-' || md5(p."category") END
ON CONFLICT DO NOTHING;

INSERT INTO "product_meta" ("id", "product_id", "meta_key", "meta_value", "value_type", "updated_at")
SELECT gen_random_uuid(), p."id", m.key, m.value, jsonb_typeof(m.value), CURRENT_TIMESTAMP
FROM "products" p
CROSS JOIN LATERAL jsonb_each(CASE WHEN jsonb_typeof(p."metadata") = 'object' THEN p."metadata" ELSE '{}'::jsonb END) m
ON CONFLICT ("product_id", "meta_key") DO NOTHING;
