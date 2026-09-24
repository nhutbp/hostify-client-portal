# Backend modules

Backend code is grouped by the data-domain taxonomy defined in:

- `docs/vps-service-management-database-and-system-diagrams.md`
- `docs/vps-service-management-platform-plan.md`

Every new server module belongs to exactly one of:

`identity`, `catalog`, `commerce`, `billing`, `services`, `infrastructure`, `provisioning`, `domain-proxy-via`, `support`, or `audit`.

Legacy modules remain in place until a dedicated migration. New code must not add another top-level domain outside this list.
