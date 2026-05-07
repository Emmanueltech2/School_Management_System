create table academic_years (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  name text not null,
  start_date date,
  end_date date,
  is_active boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table terms (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  academic_year_id uuid not null references academic_years(id) on delete cascade,
  name text not null,
  start_date date,
  end_date date,
  is_active boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  name text not null,
  level text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table streams (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  class_id uuid not null references classes(id) on delete cascade,
  name text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table subjects (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  name text not null,
  code text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (school_id, name)
);

create table class_subjects (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  class_id uuid not null references classes(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  is_compulsory boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (class_id, subject_id)
);

create table timetable_periods (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  name text not null,
  start_time time not null,
  end_time time not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table timetable_entries (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  class_id uuid not null references classes(id) on delete cascade,
  stream_id uuid references streams(id) on delete set null,
  subject_id uuid references subjects(id) on delete set null,
  period_id uuid references timetable_periods(id) on delete cascade,
  day_of_week int not null check (day_of_week between 1 and 7),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
