---
name: app-base
description: Repo-specific guide for the TanStack Start source base. Use it for Prisma schema changes, SSR auth, frontend folder structure, feature/page/component splitting, shared component usage, TanStack Query, and code organization rules in this repository.
---

# App Base Guide

Use this skill when working inside this repo so changes stay aligned with the current architecture.

## Core Rules

- SSR is the source of truth for auth
- Keep route files thin
- Keep server logic in `server`
- Keep feature logic in `src/features/<feature>`
- Use `@/` imports instead of long relative paths
- Split large page files into smaller components early
- Prefer reusable components over copy-paste UI
- Keep frontend composition aligned with the existing design system
- Never hardcode visible UI text when a translation key can be used
- Focused flows across the app should use card-based layouts and stay dark-mode ready

## Server Structure

Keep server code in the `server` tree and split it by concern:

- `server/common`: env, cookies, mailer, and other shared server helpers
- `server/db`: Prisma bootstrap and database access setup
- `server/modules/auth`: auth entrypoints, service layer, schemas, types, email templates, and password helpers
- `server/modules/users`: user repository and user-domain constants/types

Server rules:

- Keep business logic that touches database, cookies, tokens, or email on the server
- Keep UI/service wrappers in `src/features/*/services`
- Do not import Prisma or mailer code into React components
- Keep auth token creation, verification, refresh, and reset flows inside `server/modules/auth`
- Keep env access centralized in `server/common/env.server.ts`
- Keep repositories focused on data access, not presentation

### Standard module layout

Every domain module should follow this shape, adding only the folders it needs:

```text
server/modules/<domain>/
  <domain>.api.ts                 # HTTP/API entrypoints and contracts
  <domain>.ts                     # TanStack server functions/RPC entrypoints
  <domain>.schemas.ts             # Zod input/output validation
  <domain>.errors.ts              # Stable domain error codes
  <domain>.constants.ts           # Closed values and domain constants
  <domain>.types.server.ts        # Server-only types
  <domain>.repository.server.ts   # Prisma/data access only
  <domain>.service.server.ts      # Auth + business workflows
  shared/                         # Domain helpers shared by sub-features
  <sub-feature>/                  # Optional bounded sub-domain
```

Do not import Prisma from `src/features`. Frontend services are the only client-facing adapter for server functions. Keep API handlers thin: validate input, call a service, and return the common response envelope.

## Database Workflow

When the schema changes:

1. Edit `prisma/schema.prisma`
2. Run `npm run db:generate`
3. Apply the schema with `npm run db:migrate` for local migration development, `npm run db:migrate:deploy` for committed migrations, or `npm run db:push` only for temporary prototyping
4. Update server code, feature types, hooks, and UI

Use these rules:

- Prefer enums for status fields and other closed sets
- Prefer `@map` for snake_case database columns when source code should stay camelCase
- Do not edit generated Prisma Client files directly
- Keep table and field names aligned with the domain, not the UI

## Response And Error Contracts

Use a single response contract across the app:

- Success: `{ success: true, message, result, timestamp, path }`
- Arrays: still return data inside `result`
- Paginated payloads: keep pagination metadata inside `result`
- Message-only success responses: still wrap them in the same success contract
- Errors: return stable codes like `AUTH_001`, `AUTH_002`, and keep `code` plus `errorCode` aligned
- Frontend must translate by code first and only fall back to server messages when needed

Recommended files:

- `server/common/response.server.ts`
- `server/common/app-error.server.ts`
- `src/utils/apiError.ts`

## Query Workflow

- Use TanStack Query in feature hooks
- Keep fetching, mutation, and invalidation in hooks or services
- Do not put query logic directly in route files
- Use `useQueryClient()` in React code instead of a global query client singleton
- Invalidate queries with stable query keys after mutations

## Feature Structure

Use this layout for new features:

- `pages`: page entry and composition
- `components`: feature-specific UI pieces
- `hooks`: query and mutation orchestration
- `services`: client-facing wrappers around server functions
- `store`: feature state
- `types`: feature types, enums, and constants
- `context`: feature-specific providers

The canonical screen layout is:

```text
src/features/admin/<feature>/
  components/                     # reusable feature components
  data/                            # static options and UI data only
  hooks/                           # TanStack Query/Form orchestration
  i18n/                            # en.json and vi.json
  pages/
    <screen>/
      index.tsx                    # composition shell only
      components/                  # blocks used only by this screen
  services/                        # wrappers around server functions
  types/                           # client types and view models
  utils/                           # pure formatting/mapping helpers
```

Use the same name at each boundary: `server/modules/<feature>`, `src/features/admin/<feature>`, and `src/routes/.../<feature>`. A feature service must unwrap the common response contract; hooks must call the service, own query keys, mutations, and invalidation; pages must not import server functions directly.

For pages with more than one section, split one level deeper:

- `src/features/<feature>/pages/<page>/index.tsx`: page shell and composition only
- `src/features/<feature>/pages/<page>/components/*`: page-local blocks

Use this when a page has:

- header plus form plus footer
- toolbar plus filters plus list
- hero section plus content cards
- multiple reusable blocks that would make the page file too long

## Page Splitting Rule

If a page starts holding more than one concern, split it.

Split when you see any of these:

- form section plus header plus footer in one file
- list view plus toolbar plus filters in one file
- fetch logic mixed with rendering
- multiple reusable blocks repeated inside one page

Keep the page file as an assembly layer only. Move blocks into components and keep data access in hooks.

## Frontend Component Rules

Use existing shared components first:

- `Panel` for centered cards, auth shells, and boxed content
- `Button` for actions, with shared variants instead of custom button styling
- `InputField`, `InputFieldPassword`, and `CodeField` for forms
- `Table`, `Pagination`, `SelectionColumn`, and `TableActions` for list screens
- `FieldGroup` for consistent form spacing and grouping

Patterns to follow:

- Keep form validation close to the form component
- Keep submit handlers in feature forms or hooks, not in route files
- Keep layout wrappers separate from business logic
- Keep translation keys in the UI layer
- Do not hardcode labels, placeholders, helper text, empty states, or error text if a translation key is available
- Keep dark-mode support on shared components and page wrappers
- Focused screens should prefer centered card shells and should not rely on full-page loading overlays

If a page gets long, split it by responsibility:

- `Header.tsx`
- `Filters.tsx`
- `Form.tsx`
- `List.tsx`
- `EmptyState.tsx`
- `Footer.tsx`

Avoid this:

- one huge page file with all JSX, validation, fetch logic, and repeated sections mixed together

For dashboard routes, use `pages/<screen>/index.tsx` rather than putting a screen directly under `pages`. Dynamic routes must use `$id/index.tsx` and `$id/edit/index.tsx`; never create a generic `$section.tsx` beside an `$id` route because the two patterns collide.

## Auth Rules

- Keep login, register, verify email, forgot password, and reset password in the auth feature
- Server auth code lives under `server/modules/auth`
- Client wrappers live under `src/features/auth/services`
- Session and token handling must stay server-side
- Do not rely on localStorage as the auth source of truth
- Keep page copy translated and keep focused views card-based with dark-mode parity

## Component Rules

- Shared UI belongs in `src/components`
- Feature-specific UI belongs inside the feature folder
- Keep components small and single-purpose
- If a component mixes layout, form state, and business logic, split it
- Prefer composition over large prop bags

## Route Rules

- Route files should mostly render a feature page or redirect
- Avoid direct database or fetch logic in route files
- Use loaders only when SSR data is required for the route
- Keep dashboard guards and auth guards driven by server/session data
- Use static route files for static menu entries and thin route files that only set `head`/guards and render a feature page
- Keep route path parameters aligned with the page contract; use `$id/index` for detail and `$id/edit/index` for edit

## Reference UI Pattern

The auth screens in this repo are a canonical example of the frontend pattern:

- `src/features/auth/pages/login/index.tsx` uses `Panel` and composes a form component
- `src/features/auth/pages/login/components/LoginForm.tsx` owns TanStack Form state and submit logic
- `src/features/auth/pages/register/index.tsx` and `reset-password/index.tsx` follow the same split
- Verification flows should keep page-level copy separate from form logic

## Naming Rules

- Use descriptive domain-based names
- Put reusable constants close to the domain they belong to
- Keep `types` for feature-specific types and enums
- Keep server helpers small and grouped by domain

## Good Finish Checklist

- Schema changed and Prisma regenerated
- Query logic moved out of routes
- Large page files split into smaller components
- Shared UI extracted where useful
- SSR auth still works as the single source of truth
