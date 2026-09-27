CREATE TABLE "product_tags" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "product_tags_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "product_tags_slug_key" ON "product_tags"("slug");

-- These category slugs are the server-side catalog identifiers.
INSERT INTO "product_categories" ("id", "name", "slug", "updated_at")
VALUES
  (gen_random_uuid(), 'VPS', 'vps', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Hosting', 'hosting', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Máy chủ vật lý', 'physical', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Server', 'server', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Proxy', 'proxy', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'VIA', 'via', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Tên miền', 'domain', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Dịch vụ khác', 'other', CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "product_tags" ("id", "name", "slug", "updated_at")
VALUES
  (gen_random_uuid(), 'Phổ biến', 'popular', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Hiệu năng cao', 'high-performance', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Doanh nghiệp', 'business', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Tiết kiệm', 'economy', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Mới', 'new', CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;
