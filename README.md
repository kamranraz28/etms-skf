# ETMS — Laravel 12 + Inertia React + MySQL 8

Pixel-faithful port of the original React UI to **Laravel 12 / PHP 8.2 / MySQL 8 / Inertia React TS**.
The frontend uses the **exact same** Tailwind config, CSS tokens (`index.css`), AppShell, and component
structure as the original Vite/React project — no UI redesign.

## Setup

```bash
# 1. Install
composer install
npm install

# 2. Configure .env (copy and edit DB creds)
cp .env.example .env
php artisan key:generate

# 3. Database (MySQL 8)
mysql -u root -e "CREATE DATABASE etms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
php artisan migrate --seed

# 4. Storage symlink (for vendor bid PDFs)
php artisan storage:link

# 5. Run
php artisan serve   # http://localhost:8000
npm run dev
```

## Default accounts (password: `password`)

| Email                     | Role         |
|---------------------------|--------------|
| admin@etms.test           | admin        |
| procurement@etms.test     | procurement  |
| approver@etms.test        | approver     |
| vendor1@etms.test         | vendor (Acme)|
| vendor2@etms.test         | vendor (Globex)|
| vendor3@etms.test         | vendor (Initech)|

## Workflow

1. Procurement creates a **PR** (or syncs from mock ERP).
2. Procurement creates a **Tender** from the PR and invites active vendors.
3. Vendors submit **per-item priced bids** (with optional PDF) before the deadline.
4. Procurement closes the tender and **generates the CS**.
5. CS detail shows the **per-item award matrix** — pick a vendor per line item (radio).
6. Submit → **Approver** decides → **Admin** decides → push to **ERP**
   (one PO per vendor with awarded line items).
