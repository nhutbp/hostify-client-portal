# App Base

Source nền TanStack Start + React + TypeScript, Prisma/PostgreSQL, Tailwind CSS. Các module đang giữ lại: xác thực, tài khoản và phân quyền, dashboard cơ bản, media, bài viết, giao diện, cài đặt hệ thống và audit log.

## Cấu trúc

- `src/routes`: route và kiểm tra quyền truy cập.
- `src/features`: giao diện theo từng tính năng.
- `src/components`: thành phần UI dùng chung.
- `server/modules`: server functions, service và repository.
- `shared`: mã vai trò, quyền và module dùng chung.
- `prisma/schema.prisma`: schema database.
- `prisma/migrations`: migration khởi tạo cho source base.

## Chạy local

1. Cài dependency: `npm ci`.
2. Tạo `.env.local` với `DATABASE_URL`, biến mail và các cấu hình cần thiết. Không commit thông tin bí mật.
3. Tạo database trống, sau đó chạy `npm run db:migrate:deploy`.
4. Tạo tài khoản quản trị ban đầu bằng `SEED_ROOT_PASSWORD=... npm run db:seed`. Có thể đặt `SEED_ROOT_LOGIN` và `SEED_ROOT_EMAIL`.
5. Chạy `npm run dev`.

`npm run db:generate` tạo Prisma Client; `npx tsc --noEmit` kiểm tra kiểu; `npm run build` tạo bản production; `npm test` chạy test.

## Lưu ý migration

Migration đã được thay bằng một baseline cho database **trống** để không tạo lại các bảng nghiệp vụ đã gỡ. Không chạy baseline này trực tiếp trên database cũ: lịch sử migration và dữ liệu hiện có sẽ không khớp. Nếu cần chuyển dữ liệu từ bản cũ, hãy sao lưu rồi xây dựng kế hoạch chuyển đổi riêng; việc dọn source không xóa dữ liệu production.

## Quy ước phát triển

Giữ route mỏng, đặt truy cập database trong `server`, kiểm tra quyền trên server, và cập nhật đồng bộ schema, permission catalog, seed, bản dịch cùng giao diện khi thêm module mới.
