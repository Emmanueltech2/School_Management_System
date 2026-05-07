create table mpesa_transactions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  student_id uuid references students(id) on delete set null,
  invoice_id uuid references fee_invoices(id) on delete set null,
  school_payment_account_id uuid references school_payment_accounts(id) on delete set null,
  phone_number text not null,
  amount numeric(12,2) not null,
  checkout_request_id text,
  merchant_request_id text,
  mpesa_receipt_number text,
  transaction_date timestamptz,
  status text default 'pending' check (
    status in ('pending','success','failed','cancelled','timeout')
  ),
  raw_request jsonb,
  raw_callback jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
