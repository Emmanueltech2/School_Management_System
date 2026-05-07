create table fee_items (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  name text not null,
  category text check (
    category in ('tuition','admission','transport','meal','activity','exam','boarding','uniform','other')
  ),
  amount numeric(12,2) not null default 0,
  class_id uuid references classes(id),
  term_id uuid references terms(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table fee_invoices (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  invoice_no text,
  student_id uuid not null references students(id) on delete cascade,
  term_id uuid references terms(id),
  total_amount numeric(12,2) not null default 0,
  amount_paid numeric(12,2) not null default 0,
  balance numeric(12,2) generated always as (total_amount - amount_paid) stored,
  status text default 'unpaid' check (
    status in ('unpaid','partial','paid','cancelled')
  ),
  due_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz,
  unique (school_id, invoice_no)
);

create table fee_invoice_items (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  invoice_id uuid not null references fee_invoices(id) on delete cascade,
  fee_item_id uuid references fee_items(id) on delete set null,
  description text not null,
  amount numeric(12,2) not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table payment_methods (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) on delete cascade,
  name text not null,
  type text not null check (
    type in ('cash','mpesa','bank','cheque','adjustment')
  ),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table school_payment_accounts (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  account_name text not null,
  provider text not null check (
    provider in ('mpesa_paybill','mpesa_till','bank','cash')
  ),
  bank_name text,
  bank_account_number text,
  paybill_number text,
  till_number text,
  reference_type text default 'admission_no' check (
    reference_type in ('admission_no','invoice_no','student_id','custom')
  ),
  is_default boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table fee_payments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  invoice_id uuid references fee_invoices(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  payment_method_id uuid references payment_methods(id),
  school_payment_account_id uuid references school_payment_accounts(id) on delete set null,
  amount numeric(12,2) not null,
  payment_method text,
  reference_no text,
  bank_name text,
  bank_account_no text,
  bank_reference_no text,
  cheque_no text,
  payment_status text default 'confirmed' check (
    payment_status in ('pending','confirmed','rejected','reversed')
  ),
  paid_at timestamptz default now(),
  received_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table payment_allocations (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  payment_id uuid not null references fee_payments(id) on delete cascade,
  invoice_id uuid not null references fee_invoices(id) on delete cascade,
  amount numeric(12,2) not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table receipts (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  payment_id uuid not null references fee_payments(id) on delete cascade,
  receipt_no text not null,
  issued_to text,
  issued_by uuid references profiles(id),
  issued_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (school_id, receipt_no)
);

create table fee_adjustments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  student_id uuid references students(id),
  invoice_id uuid references fee_invoices(id),
  type text not null check (
    type in ('discount','waiver','scholarship')
  ),
  amount numeric(12,2) not null,
  reason text,
  approved_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table fee_refunds (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  payment_id uuid references fee_payments(id),
  student_id uuid references students(id),
  amount numeric(12,2) not null,
  reason text,
  processed_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table document_sequences (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  document_type text not null check (
    document_type in ('invoice','receipt')
  ),
  current_number bigint not null default 0,
  prefix text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (school_id, document_type)
);
