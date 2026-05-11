# School Management System - AI Context

## Project Overview

This project is a scalable multi-school management system.

Core modules:
- authentication
- school onboarding
- students
- guardians
- fees
- invoices
- payments
- receipts
- MPesa integration
- documents
- reporting

The system is multi-tenant using `school_id`.

---

## Tech Stack

### Frontend
- Next.js
- React
- Tailwind CSS
- shadcn/ui

### Backend
- Supabase

### Database
- PostgreSQL

### Auth
- Supabase Auth

### Storage
- Supabase Storage

### CI/CD
- GitHub Actions

---

## Current Project Status

Completed:
- Supabase local setup
- Supabase cloud setup
- migration architecture
- GitHub Actions CI/CD
- develop branch workflow
- database schema foundation

Current focus:
- frontend setup
- authentication pages
- school onboarding

---

## Database Rules

### Important
This is a migration-driven database project.

NEVER modify production schema manually.

All schema changes must use:

```bash
npx supabase migration new migration_name
```

Then:
- test locally
- commit
- push
- let GitHub Actions deploy

---

## Multi-Tenant Rule

Most major tables contain:

```sql
school_id uuid not null
```

Data must always remain isolated per school.

---

## Important Tables

### Core
- schools
- profiles

### Academic
- academic_years
- terms
- classes
- streams
- subjects

### People
- students
- guardians
- student_guardians
- teachers

### Fees
- fee_items
- fee_invoices
- fee_invoice_items
- fee_payments
- payment_allocations
- receipts
- mpesa_transactions

### Audit
- documents
- audit_logs

---

## Fees Workflow

Workflow:

Invoice -> Payment -> Allocation -> Balance -> Receipt

Supported payments:
- MPesa
- bank
- cash
- cheque

---

## Git Workflow

### Main Branches

main:
- production-ready code

develop:
- active integration branch

feature/*:
- individual tasks/features

---

## Feature Workflow

Example:

```bash
git checkout develop
git pull
git checkout -b feature/login-page
```

After development:

```bash
git add .
git commit -m "Build login page"
git push
```

Then merge:
- feature/* -> develop
- develop -> main

---

## CI/CD

GitHub Actions automatically deploys Supabase migrations.

Workflow file:

```txt
.github/workflows/supabase-migrations.yml
```

---

## Frontend Structure

```txt
apps/
+-- web/
    +-- app/
    |   +-- (auth)/
    |   |   +-- login/
    |   |   +-- signup/
    |   |   +-- forgot-password/
    |   +-- dashboard/
    +-- components/
    +-- lib/
        +-- supabase/

packages/
+-- sdk/
+-- types/
+-- utils/
+-- validations/
```

---

## Design Principles

- scalable architecture
- modular development
- migration-driven schema
- multi-tenant safety
- reusable components
- strict role-based access
- AI-friendly repository structure

---

## Current Priorities

1. Connect auth pages to Supabase Auth
2. Build school onboarding logic
3. Create school admin profile flow
4. Auto-create school defaults
5. Protect dashboard routes
6. Review required RLS policies

---

## Commands

### Local Supabase

```bash
npx supabase start
```

### Reset database

```bash
npx supabase db reset
```

### Create migration

```bash
npx supabase migration new migration_name
```

### Push migrations

```bash
npx supabase db push
```

### Start frontend

```bash
npm run dev
```

---

## Important Notes

- Attendance module is postponed for now
- Transport module is future scope
- Mobile app will use React Native + Expo later
- PostgreSQL portability is important
- Avoid unnecessary vendor lock-in
