create table schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique,
  phone text,
  email text,
  address text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  school_id uuid references schools(id) on delete cascade,
  full_name text not null,
  phone text,
  role text not null check (
    role in ('super_admin','school_admin','teacher','bursar','parent','student')
  ),
  avatar_url text,
  last_login_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
