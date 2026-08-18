# eTMS ↔ ERP Integration API — v1.0

API contract between eTMS (Procurement) and ERP. ERP team implements the 3 endpoints below.

| Operation | Endpoint | Who calls |
|-----------|----------|-----------|
| Fetch Purchase Requisitions (PR) | `GET /api/v1/prs` | eTMS |
| Fetch Purchase Orders (PO) | `GET /api/v1/pos` | eTMS |
| Receive approved CS (Award) | `POST /api/v1/cs-awards` | eTMS pushes to ERP |

---

## Conventions

**Base URL** (provided by ERP team): `https://erp.company.com/api/v1`

**Auth** — every request:

```
Authorization: Bearer <shared-token>
Accept: application/json
Content-Type: application/json      (only when there is a body)
```

**Dates:** ISO 8601 (e.g. `2026-08-18T10:30:00+06:00`).  
**Money:** decimal numbers, e.g. `25000.00`.  
**Incremental sync:** pass `since=<ISO 8601>`; ERP returns only records with `updated_at` > `since`. Omit for full list.

**Pagination:**

```
GET /api/v1/prs?since=...&limit=50&cursor=...
```

Response:

```json
{
  "data": [ ... ],
  "pagination": { "next_cursor": "...", "has_more": false }
}
```

**Errors** — always use:

```json
{
  "error": { "code": "VALIDATION_ERROR", "message": "Summary", "details": {} }
}
```

| Status | Code | Meaning |
|--------|------|---------|
| 200 / 201 | – | Success |
| 202 | `DUPLICATE` | Already processed (idempotent) |
| 400 | `BAD_REQUEST` | Malformed body |
| 401 | `UNAUTHORIZED` | Missing/invalid token |
| 403 | `FORBIDDEN` | Not allowed |
| 404 | `NOT_FOUND` | Not found |
| 422 | `VALIDATION_ERROR` | Payload failed validation, `details` has field errors |
| 500 | `INTERNAL_ERROR` | Server error |

---

## 1. Fetch PRs — `GET /api/v1/prs`

Query params: `since`, `status`, `limit`, `cursor`.

```json
{
  "data": [
    {
      "pr_number": "PR-2026-0012",
      "title": "Network Switches & Cables",
      "department": "IT",
      "status": "new",
      "created_at": "2026-08-18T10:00:00+06:00",
      "updated_at": "2026-08-18T10:00:00+06:00",
      "items": [
        { "name": "Cisco Catalyst 1300 24-port", "qty": 6, "unit": "pcs" }
      ]
    }
  ]
}
```

Field rules: `pr_number` unique (idempotency key), `updated_at` required, `items` ≥ 1 with `name`, `qty ≥ 1`, `unit`.

---

## 2. Fetch POs — `GET /api/v1/pos`

Query params: `since`, `status`, `vendor_erp_code`, `limit`, `cursor`.

```json
{
  "data": [
    {
      "po_number": "PO-2026-0102",
      "vendor_erp_code": "V001",
      "po_date": "2026-08-18",
      "status": "new",
      "created_at": "2026-08-18T10:00:00+06:00",
      "updated_at": "2026-08-18T10:00:00+06:00",
      "items": [
        { "name": "Cisco Catalyst 1300 24-port", "qty": 6, "unit_price": 25000.00, "total_price": 150000.00 }
      ]
    }
  ]
}
```

Field rules: `po_number` unique, `vendor_erp_code` must match a vendor in eTMS, `updated_at` required, `items` ≥ 1.

---

## 3. Receive approved CS (Award) — `POST /api/v1/cs-awards`

eTMS calls this when a Comparative Statement is fully approved. Use it to create the PO for the winning vendor.

```json
{
  "cs_number": "CS-12",
  "pr_number": "PR-2026-0012",
  "approved_at": "2026-08-18T10:30:00+06:00",
  "items": [
    {
      "item": 1,
      "name": "Cisco Catalyst 1300 24-port",
      "qty": 6,
      "unit": "pcs",
      "assigned_vendor_erp": "V001",
      "assigned_vendor_name": "Acme Suppliers Ltd",
      "unit_price": 25000.00,
      "total_price": 150000.00
    }
  ]
}
```

**Idempotency:** eTMS may retry. Deduplicate by `cs_number` — if already processed, return `202` and do **not** create a duplicate PO.

Responses: `200`/`201` accepted · `202` duplicate · `422` validation · `401` unauthorized.

---

## End-to-end flow

1. eTMS pulls PRs → `GET /api/v1/prs`.
2. eTMS runs tendering, negotiation, and approval.
3. On approval, eTMS pushes the award → `POST /api/v1/cs-awards` (ERP creates the PO).
4. eTMS pulls the POs → `GET /api/v1/pos` so vendors can raise claims.

## What ERP team must provide

- Host the 3 endpoints with HTTPS + token auth.
- Support `since`, `limit`, `cursor` and the pagination/error envelopes.
- Dedupe CS pushes by `cs_number`.
- Give eTMS the base URL + token.