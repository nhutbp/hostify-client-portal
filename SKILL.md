---
name: app-base
description: Repo-specific instructions for building and changing this TanStack Start + Prisma VPS portal. Use for frontend features, admin/customer screens, server modules, server functions, APIs, database work, auth, and shared UI.
---

# App Base Skill

Use this skill for every implementation or review inside this repository. Preserve the existing architecture and naming conventions. Do not introduce a second architecture or move unrelated folders unless the user explicitly requests a migration.

## Project architecture

The repository has four important layers:

- `src/features`: frontend feature code.
- `src/routes`: thin TanStack Router route composition and guards.
- `server`: server-only modules, services, repositories, auth, and integrations.
- `prisma`: schema, migrations, seed, and generated Prisma Client.

Shared code is split by responsibility:

- `src/components`: reusable frontend UI primitives and common components.
- `src/layouts`: application shells and navigation layouts.
- `src/config`: API, app configuration, and i18n setup.
- `src/utils`: pure frontend utilities only.
- `shared`: client/server contracts, permissions, roles, and truly shared types.
- `server/common`: server-only errors, cookies, environment, mailer, pagination, and response helpers.
- `server/db`: Prisma bootstrap and database access setup.
- `server/third-party`: external provider adapters such as S3.

## Frontend grouping

Frontend features are grouped by user area:

```text
src/features/
├── auth/                         # unauthenticated authentication flows
├── admin/                        # admin portal
│   ├── appearance/
│   ├── audit/
│   ├── dashboard/
│   ├── media/
│   ├── posts/
│   ├── system/
│   └── users/
└── customer/                     # authenticated customer portal
    ├── dashboard/
    ├── services/
    ├── catalog/
    ├── commerce/
    ├── billing/
    ├── domains/
    ├── proxies/
    ├── via/
    ├── support/
    ├── notifications/
    └── settings/
```

`customer` is the area for a customer who has signed in. `admin` is for staff/admin operations. Do not place customer screens under `admin`, and do not mix admin-only service calls into customer hooks.

Use this feature shape when it applies:

```text
src/features/<area>/<feature>/
├── components/                   # reusable UI for this feature
├── data/                         # static UI options only
├── hooks/                        # TanStack Query/Form orchestration
├── i18n/                         # en.json and vi.json
├── pages/                        # screen composition
│   └── <screen>/
│       ├── index.tsx             # page shell only
│       └── components/           # blocks used only by this screen
├── services/                     # client-facing server-function wrappers
├── store/                        # feature state, only when needed
├── types/                        # client types and view models
└── utils/                        # pure feature mapping/formatting helpers
```

The existing `src/features/auth` is the reference for auth pages. The existing `src/features/admin` is the reference for admin pages. Add `src/features/customer` as customer functionality is implemented.

## Backend module taxonomy

All new server code must belong to one of these module parents, matching the data model:

```text
server/modules/
├── identity/
│   ├── users/
│   ├── organizations/
│   ├── memberships/
│   ├── roles/
│   ├── permissions/
│   ├── auth/
│   └── api-keys/
├── catalog/
│   ├── products/
│   ├── plans/
│   ├── prices/
│   └── addons/
├── commerce/
│   ├── carts/
│   ├── orders/
│   └── coupons/
├── billing/
│   ├── invoices/
│   ├── payments/
│   └── refunds/
├── services/
│   ├── customer-services/
│   ├── service-events/
│   └── service-actions/
├── infrastructure/
│   ├── providers/
│   ├── datacenters/
│   ├── resources/
│   └── ip-pools/
├── provisioning/
│   ├── provisioning-jobs/
│   └── job-attempts/
├── domain-proxy-via/
│   ├── domains/
│   ├── dns-records/
│   ├── proxy-allocations/
│   └── via-accounts/
├── support/
│   ├── tickets/
│   ├── ticket-messages/
│   └── notifications/
└── audit/
    └── audit-logs/
```

Identity modules have been grouped under `server/modules/identity/{users,auth,api-keys}` and audit under `server/modules/audit/audit-logs`. Admin-only adapters live under `server/admin/{appearance,media,posts,system}` because they are not data-domain modules. New modules must use the taxonomy above. Do not add new legacy top-level module folders.

## Backend module layout

Each child module should contain only the layers it needs:

```text
server/modules/<parent>/<child>/
├── <child>.ts                       # public TanStack server functions
├── <child>.schemas.ts               # Zod input validation
├── <child>.errors.ts                # stable domain error codes
├── <child>.constants.ts             # closed values and constants
├── <child>.types.ts                 # shared-safe module types
├── <child>.types.server.ts          # server-only types when needed
├── <child>.repository.server.ts     # Prisma/data access only
├── <child>.service.server.ts        # business workflows
├── <child>.api.ts                   # HTTP adapter only when an HTTP API is required
└── shared/                          # helpers private to this module
```

The existing code uses some files at `server/modules/<legacy-module>/` rather than the nested layout. Follow the nested layout for new modules, and preserve existing imports when editing legacy modules unless the task is a migration.

### Layer rules

- Server functions validate input, authorize the caller, delegate to a service, and return the common response envelope.
- Services own business rules, transactions, orchestration, cookies, email side effects, and lifecycle transitions.
- Repositories own Prisma queries and persistence only; they do not format UI responses or send notifications.
- Schemas validate untrusted input at the server boundary. Never rely only on client validation.
- Errors use stable codes and `createAppError`; do not throw ad hoc strings.
- API handlers stay thin. Do not put Prisma queries or large business workflows in route/API entrypoints.
- A module may call another module through a public service/contract, not by importing its repository internals.
- Provider integrations belong behind adapters in `server/third-party` or the `infrastructure`/`provisioning` modules.

## Server function and API pattern

Use the repository's TanStack Start pattern:

```ts
import { createServerFn } from '@tanstack/react-start'
import { createOrderSchema } from './orders.schemas'

export const createOrder = createServerFn({ method: 'POST' })
  .validator(createOrderSchema)
  .handler(async ({ data }) => {
    const { createOrderForCustomer } = await import('./orders.service.server')
    return createOrderForCustomer(data)
  })
```

Use dynamic imports for server-only service modules as in the existing auth entrypoints. Keep Prisma, secrets, mailer, provider credentials, and server cookies out of client bundles.

For protected functions, get the current session on the server and enforce organization/role/service ownership there. A frontend route guard is not authorization.

## Response and error contracts

Use `server/common/response.server.ts`:

- Success: `createSuccessResponse(result, message)`.
- Message-only success: `createMessageResponse(message)`.
- Arrays: `createArrayResponse(items, message)`.
- Pagination: `createPaginatedResponse(items, total, page, limit, message)`.

The success envelope is:

```ts
{
  success: true,
  message: string,
  result: T,
  timestamp: string,
  path: string
}
```

Errors must use `AppError` from `server/common/app-error.server.ts`. Keep `code` and `errorCode` equal to a stable domain code such as `AUTH_001`, `USER_006`, or `ORDER_001`. The frontend should unwrap with `src/utils/response.ts` and translate errors with `src/utils/apiError.ts`.

## Frontend service, hook, and page pattern

The frontend must not call server functions from route files or arbitrary components. Use this flow:

```text
page/component -> hook -> feature service -> server function -> service -> repository/Prisma
```

Feature service example:

```ts
export const customerService = {
  detail: (id: string) =>
    getCustomerService({ data: { id } }).then(unwrapSuccessResponse),
}
```

Feature hooks own query keys, fetching, mutations, and invalidation:

```ts
export const customerServiceKeys = {
  all: ['customer', 'services'] as const,
  detail: (id: string) => [...customerServiceKeys.all, 'detail', id] as const,
}

export function useCustomerService(id?: string) {
  return useQuery({
    queryKey: customerServiceKeys.detail(id ?? ''),
    queryFn: () => customerService.detail(id!),
    enabled: Boolean(id),
  })
}
```

After mutations, invalidate the smallest stable parent key that covers affected data. Do not use a global query-client singleton.

Pages compose UI only. Keep data orchestration in hooks and server calls in services. Split long pages into screen-local components before mixing header, filters, form, table, and submit logic in one file.

## Forms and UI

- Prefer existing `InputField`, `InputFieldPassword`, `CodeField`, `Button`, `Panel`, `FieldGroup`, `Table`, `Pagination`, and `TableActions`.
- Use TanStack Form patterns already present in auth/admin features.
- Validate on the client for feedback, but always validate again with Zod on the server.
- Keep submit logic in a form component or mutation hook, not in a route.
- Password inputs must allow paste and password-manager autofill. Do not add `onPaste={preventDefault}`.
- Keep labels, placeholders, errors, empty states, and action text in i18n files.
- Use `@/` imports for frontend aliases; avoid long relative imports in `src`.
- Feature UI belongs under the feature. Generic UI belongs under `src/components`.
- Keep responsive layout and dark-mode support aligned with existing shared components.

## Routing and auth

- Route files under `src/routes` remain thin.
- Use loaders only for required SSR data, redirects, and guards.
- The server session is the auth source of truth; do not use localStorage as the authority.
- Auth flows live under `src/features/auth` and `server/modules/identity/auth`.
- Admin routes require server-verified dashboard access and permissions.
- Customer routes require an authenticated user and organization/service ownership checks.
- Use `$id/index.tsx` for detail routes and `$id/edit/index.tsx` for edit routes.

## Database and Prisma

When changing the schema:

1. Edit `prisma/schema.prisma`.
2. Run `npm run db:generate`.
3. Use `npm run db:migrate` for local migration development.
4. Use `npm run db:migrate:deploy` for deployment.
5. Use `npm run db:push` only for temporary prototyping.
6. Update repository, service, response types, hooks, and UI.

Rules:

- Do not edit `prisma/generated` manually.
- Prefer enums for closed statuses and lifecycle states.
- Keep database names domain-oriented, not screen-oriented.
- Use transactions for order/payment/service state changes that must be atomic.
- Store money in integer minor units with explicit currency.
- Use idempotency keys for checkout, payment webhooks, provisioning jobs, and service actions.
- Never log passwords, tokens, provider credentials, payment secrets, or full request headers.

## Naming and imports

- Components use PascalCase: `ServiceCard.tsx`, `UserTable.tsx`.
- Hooks use `use<Feature><Purpose>`: `useCustomerServices`, `useAdminUsers`.
- Services use `<domain>Service` or `<area><Domain>Service`.
- Server files use `.server.ts` when they must never enter the client bundle.
- Schemas end with `.schemas.ts`; repositories with `.repository.server.ts`.
- Use domain names consistently across route, feature, server module, schema, and service.
- Keep imports grouped: external packages, aliases, relative imports, then types where practical.

## Verification workflow

Before finishing a change:

1. Check the affected module and its existing neighboring patterns.
2. Confirm authorization is enforced on the server.
3. Run `npm run db:generate` when Prisma or generated types are involved.
4. Run `npm test` for behavior changes.
5. Run `npm run lint`; distinguish pre-existing toolchain errors from errors introduced by the change.
6. Run `npm run build` for route, dependency, SSR, or production-bundle changes.
7. Inspect `git diff` and confirm `.env`, `node_modules`, `dist`, and generated output are not committed.

Do not silently change dependency majors, rename module trees, or push externally unless the user requested that scope.
