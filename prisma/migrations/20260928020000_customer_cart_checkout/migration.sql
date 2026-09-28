ALTER TABLE "carts" ADD COLUMN "coupon_code" TEXT;

ALTER TABLE "orders"
  ADD COLUMN "payment_method" TEXT,
  ADD COLUMN "coupon_code" TEXT,
  ADD COLUMN "customer_note" TEXT,
  ADD COLUMN "terms_accepted_at" TIMESTAMPTZ;
