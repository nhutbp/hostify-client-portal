# Plan phát triển nền tảng quản lý dịch vụ hạ tầng

## 1. Mục tiêu

Xây dựng một cổng dịch vụ cho phép khách hàng:

- Đăng ký, đăng nhập và quản lý tài khoản.
- Xem toàn bộ dịch vụ đã mua, trạng thái kích hoạt, thời hạn và thông tin cấu hình.
- Mua mới, nâng cấp, hạ cấp hoặc gia hạn dịch vụ.
- Theo dõi đơn hàng, thanh toán, hóa đơn và lịch sử giao dịch.
- Nhận thông báo, mở ticket hỗ trợ và xem lịch sử xử lý.

Hệ thống quản trị cho phép nhân viên quản lý catalog, đơn hàng, tài nguyên hạ tầng, provisioning, thanh toán, khách hàng và hỗ trợ.

Hình ảnh tham chiếu thể hiện hướng UX chính: sidebar portal, trang mua dịch vụ, nhóm sản phẩm, gói cấu hình sẵn, tùy chỉnh cấu hình, giỏ hàng và tổng quan đơn hàng.

## Quy ước tổ chức source code

Source hiện tại đang tổ chức theo hai lớp rõ ràng: `src/features` cho frontend feature, `server/modules` cho backend domain module. Convention chuẩn khi mở rộng là frontend tách riêng khu vực `admin` và `customer`; backend tổ chức theo module cha/domain lớn rồi chia thành các module con.

```text
ssr-base/
├── src/                              # frontend
│   ├── features/                     # group theo khu vực người dùng và nghiệp vụ
│   │   ├── auth/                     # login, register, reset password, auth state
│   │   │   ├── context/
│   │   │   ├── guards/
│   │   │   ├── hooks/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   ├── admin/                    # admin portal, đã có một phần trong source hiện tại
│   │   │   ├── appearance/
│   │   │   ├── audit/
│   │   │   ├── dashboard/
│   │   │   ├── media/
│   │   │   ├── posts/
│   │   │   ├── system/
│   │   │   └── users/
│   │   └── customer/                 # customer portal sau khi đăng nhập
│   │       ├── dashboard/
│   │       ├── services/
│   │       ├── catalog/
│   │       ├── commerce/
│   │       ├── billing/
│   │       ├── domains/
│   │       ├── proxies/
│   │       ├── via/
│   │       ├── support/
│   │       ├── notifications/
│   │       └── settings/
│   ├── components/                   # UI dùng chung: common, form, table, ui
│   ├── layouts/                      # blank, full, header, sidebar
│   ├── integrations/                 # tanstack-query và integration khác
│   ├── routes/                       # route composition, không chứa business logic lớn
│   ├── config/                       # API, app info, i18n
│   ├── constants/                    # constant frontend
│   ├── data/                         # static data
│   ├── types/                        # type thật sự dùng chung
│   └── utils/                        # utility thuần, không chứa nghiệp vụ module
├── server/                           # backend/server-only
│   ├── modules/                      # luôn bám theo Phân vùng module dữ liệu
│   │   ├── identity/
│   │   │   ├── users/
│   │   │   ├── organizations/
│   │   │   ├── memberships/
│   │   │   ├── roles/
│   │   │   ├── permissions/
│   │   │   ├── auth/
│   │   │   └── api-keys/
│   │   ├── catalog/
│   │   │   ├── products/
│   │   │   ├── plans/
│   │   │   ├── prices/
│   │   │   └── addons/
│   │   ├── commerce/
│   │   │   ├── carts/
│   │   │   ├── orders/
│   │   │   └── coupons/
│   │   ├── billing/
│   │   │   ├── invoices/
│   │   │   ├── payments/
│   │   │   └── refunds/
│   │   ├── services/                  # Dịch vụ khách hàng và vòng đời
│   │   │   ├── customer-services/
│   │   │   ├── service-events/
│   │   │   └── service-actions/
│   │   ├── infrastructure/           # Provider, node, IP, capacity
│   │   │   ├── providers/
│   │   │   ├── datacenters/
│   │   │   ├── resources/
│   │   │   └── ip-pools/
│   │   ├── provisioning/              # Job cấp phát/thay đổi dịch vụ
│   │   │   ├── provisioning-jobs/
│   │   │   └── job-attempts/
│   │   ├── domain-proxy-via/          # Domain / Proxy / VIA
│   │   │   ├── domains/
│   │   │   ├── dns-records/
│   │   │   ├── proxy-allocations/
│   │   │   └── via-accounts/
│   │   ├── support/                   # Ticket, SLA, thông báo
│   │   │   ├── tickets/
│   │   │   ├── ticket-messages/
│   │   │   └── notifications/
│   │   └── audit/                     # Theo dõi thao tác và thay đổi
│   │       └── audit-logs/
│   ├── common/                       # error, auth context, cookies, mailer, pagination
│   ├── db/                           # Prisma client/connection
│   ├── third-party/                  # S3 và provider adapters
│   └── shared/                       # constant server-only
├── shared/                           # contract/type dùng chung client-server
└── prisma/                           # schema, migration, seed, generated client
```

Khi bổ sung domain mới, frontend phải xác định trước khu vực sử dụng: `src/features/admin/<domain>` hoặc `src/features/customer/<domain>`. Backend luôn đặt dưới một trong các module cha của mục “Phân vùng module dữ liệu”: `identity`, `catalog`, `commerce`, `billing`, `services`, `infrastructure`, `provisioning`, `domain-proxy-via`, `support` hoặc `audit`. Ví dụ: `server/modules/identity/users`, `server/modules/catalog/products`, `server/modules/commerce/orders`, `server/modules/billing/invoices` và `server/modules/services/customer-services`. Mỗi module con sở hữu schema/validator, service/use case, repository và API/server function của chính nó. Chỉ đưa code vào `components`, `shared` hoặc `utils` khi thực sự dùng chung.

## 2. Phạm vi dịch vụ

### Nhóm dịch vụ

1. VPS
   - Starter, Standard, Professional, Enterprise.
   - vCPU, RAM, NVMe SSD, bandwidth, IPv4/IPv6, location, OS.
   - Snapshot, backup, firewall, console, reboot, rebuild, reinstall.
2. Web hosting
   - Shared hosting, WordPress hosting, reseller hosting.
   - Disk quota, database, email, SSL, backup, control panel.
3. Server vật lý
   - Dedicated server, colocation, thuê máy chủ theo cấu hình.
   - CPU, RAM, disk, uplink, IP, datacenter, SLA.
4. VIA/account
   - Loại tài khoản, số lượng, khu vực, thời hạn, trạng thái bàn giao.
   - Quy trình kiểm duyệt và giới hạn truy cập.
5. Proxy
   - IPv4/IPv6, residential/datacenter/mobile, quốc gia, pool IP, bandwidth, rotation.
6. Domain
   - Tìm kiếm, đăng ký, transfer, gia hạn, DNS, nameserver, WHOIS privacy.
7. Dịch vụ bổ sung
   - Backup, SSL, license, monitoring, migration, support package, IP bổ sung.

## 3. Vai trò người dùng

### Khách hàng

- Quản lý thông tin cá nhân, bảo mật, MFA và API key.
- Xem dashboard và danh sách dịch vụ.
- Mua, gia hạn, nâng cấp, hủy hoặc yêu cầu hỗ trợ.
- Quản lý thành viên/team và quyền truy cập dịch vụ.

### Nhân viên hỗ trợ

- Xem khách hàng, dịch vụ và ticket được phân công.
- Gửi thông báo, cập nhật trạng thái xử lý.

### Nhân viên vận hành

- Quản lý node, datacenter, IP pool, server và job provisioning.
- Theo dõi health check, quota, cảnh báo và SLA.

### Kế toán

- Quản lý đơn hàng, giao dịch, hóa đơn, hoàn tiền và đối soát.

### Quản trị viên

- Quản lý toàn bộ hệ thống, catalog, pricing, policy, role và audit log.

## 4. Các khu vực giao diện

### Portal khách hàng

- Dashboard tổng quan.
- Mua dịch vụ.
- Dịch vụ của tôi.
- Chi tiết từng dịch vụ.
- Domain.
- Đơn hàng và thanh toán.
- Hóa đơn.
- Ticket hỗ trợ.
- Thông báo.
- Team và phân quyền.
- Cài đặt tài khoản.

### Trang mua dịch vụ

- Bộ lọc theo nhóm dịch vụ, location, giá và nhu cầu.
- Tab gói có sẵn và tùy chỉnh cấu hình.
- Card gói có giá, chu kỳ thanh toán, thông số và CTA.
- So sánh nhanh các gói.
- Giỏ hàng và tổng quan chi phí.
- VAT, coupon, credit, phí setup và tổng tiền.
- Ước tính thời gian kích hoạt.

### Admin console

- Dashboard vận hành và doanh thu.
- Catalog và bảng giá.
- Khách hàng.
- Đơn hàng và thanh toán.
- Dịch vụ đã provision.
- Infrastructure.
- Provisioning jobs.
- Ticket và SLA.
- Khuyến mãi.
- Audit log và system settings.

## 5. Luồng nghiệp vụ chính

### Mua dịch vụ

1. Khách hàng chọn nhóm dịch vụ.
2. Chọn gói hoặc cấu hình tùy chỉnh.
3. Chọn chu kỳ thanh toán, location và add-on.
4. Hệ thống kiểm tra tồn kho/capacity.
5. Thêm vào giỏ hàng.
6. Tạo order và payment intent.
7. Nhận webhook thanh toán thành công.
8. Tạo provisioning job.
9. Provisioner cấp tài nguyên từ provider tương ứng.
10. Ghi nhận credential an toàn và kích hoạt service.
11. Gửi email/thông báo cho khách hàng.

### Nâng cấp dịch vụ

1. Khách hàng chọn dịch vụ đang hoạt động.
2. Hệ thống hiển thị gói có thể nâng cấp.
3. Tính phần chênh lệch theo thời gian còn lại.
4. Tạo order upgrade.
5. Thanh toán và chạy change-plan job.
6. Cập nhật cấu hình, quota và lịch sử dịch vụ.

### Gia hạn tự động

- Tạo renewal invoice trước ngày hết hạn.
- Thử thu tiền theo retry policy.
- Thông báo trước hạn, thất bại thanh toán và quá hạn.
- Grace period trước khi suspend/terminate.

### Hủy và hoàn tiền

- Hỗ trợ yêu cầu hủy, thời điểm có hiệu lực và lý do.
- Áp dụng chính sách refund theo loại dịch vụ.
- Xác nhận trước hành động terminate dữ liệu/tài nguyên.

## 6. Kiến trúc đề xuất

### Các lớp chính

- Web portal: React/TanStack Start, responsive desktop/mobile.
- API/application: module hóa theo customer, catalog, order, billing, service, provisioning, support.
- Database: PostgreSQL với Prisma.
- Queue: Redis + worker hoặc message broker tương đương.
- Payment adapters: cổng thanh toán nội địa và quốc tế.
- Provisioner adapters: Proxmox, VMware, SolusVM, cPanel/Plesk, registrar, proxy provider, server vendor.
- Object storage: backup, invoice PDF, log export.
- Observability: structured logs, metrics, tracing, alerting.

### Nguyên tắc tích hợp

- Mỗi provider có adapter độc lập, không để logic provider rải trong domain service.
- Mọi thao tác cấp phát là idempotent.
- Webhook phải xác thực chữ ký và có cơ chế chống xử lý lặp.
- Credential chỉ hiển thị một lần hoặc qua secret vault.
- Thay đổi trạng thái dịch vụ phải có audit log.

## 7. Mô hình dữ liệu cốt lõi

- `User`, `Organization`, `Membership`, `Role`, `Permission`.
- `Product`, `ProductPlan`, `PlanFeature`, `Price`, `BillingCycle`, `Addon`.
- `Cart`, `CartItem`, `Order`, `OrderItem`, `Invoice`, `Payment`, `Refund`.
- `CustomerService`, `ServiceCredential`, `ServiceEvent`, `ServiceAction`.
- `ProvisioningJob`, `Provider`, `ProviderResource`, `Datacenter`, `IpPool`.
- `Domain`, `DnsRecord`, `ProxyAllocation`, `ViaAccount`.
- `Ticket`, `TicketMessage`, `SlaPolicy`, `Notification`.
- `Coupon`, `Credit`, `UsageRecord`, `AuditLog`.

## 8. API/module cần triển khai

### Customer/catalog

- `GET /catalog/categories`
- `GET /catalog/products`
- `GET /catalog/plans/:id`
- `GET /catalog/compare`

### Cart/order/billing

- `POST /cart/items`
- `GET /cart`
- `POST /orders`
- `POST /payments/intent`
- `POST /payments/webhook/:provider`
- `GET /invoices`

### Customer services

- `GET /me/services`
- `GET /me/services/:id`
- `POST /me/services/:id/actions`
- `POST /me/services/:id/upgrade`
- `POST /me/services/:id/renew`

### Operations/admin

- CRUD catalog/pricing.
- CRUD provider/datacenter/resource pool.
- Queue/retry/cancel provisioning jobs.
- Service suspend, resume, terminate.
- Audit and reporting APIs.

## 9. Bảo mật và compliance

- Password hashing bằng Argon2id.
- MFA cho tài khoản quản trị và tùy chọn cho khách hàng.
- RBAC theo organization và từng service.
- Rate limit login, checkout, API và webhook.
- CSRF protection, secure cookie, CSP và security headers.
- Mã hóa credential bằng secret manager/KMS.
- Không lưu dữ liệu thẻ thanh toán trực tiếp.
- Audit mọi thao tác nhạy cảm.
- Backup database, disaster recovery và retention policy.

## 10. Lộ trình phát triển

### Phase 0 — Foundation

- Chuẩn hóa domain model, auth, RBAC, audit log.
- Thiết lập môi trường dev/staging/production.
- Hoàn thiện design system và layout portal.

### Phase 1 — Catalog và portal cơ bản

- Catalog nhóm dịch vụ, gói, giá và add-on.
- Trang mua dịch vụ theo giao diện tham chiếu.
- Dashboard và danh sách dịch vụ khách hàng.
- Cart và order draft.

### Phase 2 — Payment và kích hoạt

- Payment adapter và webhook.
- Invoice, VAT, coupon, refund.
- Provisioning job/worker.
- Tích hợp provider đầu tiên cho VPS.

### Phase 3 — Quản lý dịch vụ

- Chi tiết VPS, action reboot/rebuild/snapshot.
- Nâng cấp, gia hạn, suspend và terminate.
- Email/in-app notification.

### Phase 4 — Mở rộng dịch vụ

- Hosting, domain, proxy, VIA, dedicated server.
- Provider adapters tương ứng.
- Resource inventory và capacity planning.

### Phase 5 — Vận hành và tăng trưởng

- Ticket/SLA/support center.
- Team account và API access.
- Monitoring, alerting, reports, affiliate và promotion.
- Self-service automation và mobile optimization.

## 11. Tiêu chí nghiệm thu MVP

- Khách hàng đăng ký/đăng nhập và xem dashboard.
- Xem được catalog VPS và so sánh các gói.
- Thêm sản phẩm vào giỏ hàng, tạo order và thanh toán sandbox.
- Webhook tạo provisioning job không trùng lặp.
- Dịch vụ VPS sau khi cấp phát hiển thị đúng trạng thái và thông số.
- Khách hàng xem được lịch sử order, invoice và notification.
- Admin chỉnh được gói, giá, trạng thái service và retry job.
- Không commit secret; audit log ghi nhận các thao tác nhạy cảm.

## 12. Rủi ro cần quản lý

- Provider API không ổn định hoặc khác nhau giữa các datacenter.
- Provisioning thất bại giữa chừng cần retry/rollback.
- Sai lệch giá, VAT, prorate và timezone.
- Credential bị lộ qua log, email hoặc frontend.
- Dữ liệu domain/proxy/VIA có yêu cầu policy riêng.
- Quá nhiều thao tác admin nhưng thiếu audit và approval flow.

## 13. Backlog ưu tiên tiếp theo

1. Chốt product catalog và schema pricing.
2. Hoàn thiện migration cho `Product`, `Plan`, `Price`, `CustomerService`.
3. Tạo API catalog và trang mua dịch vụ theo hình tham chiếu.
4. Tạo cart/order state machine.
5. Tích hợp payment sandbox.
6. Thiết kế provisioning adapter đầu tiên cho VPS.
7. Xây dựng trang “Dịch vụ của tôi” và service detail.
8. Thêm renewal, upgrade, notification và support ticket.
