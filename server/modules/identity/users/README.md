# Backend module

This directory owns one bounded context from the VPS service platform.

Implementation rules:
- schemas validate untrusted server input with Zod.
- repository.server.ts is the only layer that accesses Prisma.
- service.server.ts owns authorization, business rules and lifecycle transitions.
- public server functions use the common response envelope and dynamic imports.
- provider credentials are references/ciphertext only; never expose plaintext secrets.
- other modules use public services/contracts, never internal repositories.

This module is scaffolded according to the backend taxonomy in the VPS service management docs.
