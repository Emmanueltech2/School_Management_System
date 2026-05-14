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

## User Roles

Current MVP roles:
- super_admin
- school_admin
- finance_officer
- teacher
- bursar
- parent
- student

Display `bursar` as "Finance Officer" in the UI unless the database role is renamed by migration.

Role scope rules:
- super_admin users are platform owners and must have `profiles.school_id = null`
- school_admin users belong to exactly one school through `profiles.school_id`
- teacher, finance_officer, bursar, parent, and student users must be scoped to one school
- parent access is limited to linked children through `student_guardians`
- every school-scoped query must filter by `school_id`

RBAC is backward compatible:
- `profiles.role` and `profiles.school_id` remain the compatibility path for current RLS
- `roles`, `permissions`, `role_permissions`, and `user_roles` support multi-role users
- new user creation should write both `profiles.role` and `user_roles`
- future RLS and dashboard routing should gradually move to `user_roles`

Dashboard routing target:
- super_admin -> `/dashboard/platform`
- school_admin -> `/dashboard/admin`
- teacher -> `/dashboard/teacher`
- finance_officer -> `/dashboard/finance`
- bursar -> `/dashboard/finance`
- parent -> `/dashboard/parent`
- student -> `/dashboard/student`

School onboarding rule:
- only super_admin can create schools
- only super_admin can invite the first school_admin
- school_admin users cannot create schools

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
