create table documents (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  uploaded_by uuid references profiles(id) on delete set null,
  owner_type text not null check (
    owner_type in ('student','teacher','guardian','school','invoice','exam')
  ),
  owner_id uuid,
  file_name text not null,
  file_path text not null,
  file_type text,
  file_size bigint,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) on delete cascade,
  actor_id uuid references profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);
