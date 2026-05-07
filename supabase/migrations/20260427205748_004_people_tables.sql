create table students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  admission_no text not null,
  first_name text not null,
  middle_name text,
  last_name text not null,
  gender text check (gender in ('male','female')),
  date_of_birth date,
  class_id uuid references classes(id),
  stream_id uuid references streams(id),
  photo_url text,
  blood_group text,
  nationality text,
  admission_date date default current_date,
  status text default 'active' check (
    status in ('active','transferred','graduated','inactive')
  ),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz,
  unique (school_id, admission_no)
);

create table guardians (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  full_name text not null,
  phone text,
  email text,
  relationship text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table student_guardians (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  guardian_id uuid not null references guardians(id) on delete cascade,
  is_primary boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (student_id, guardian_id)
);

create table student_enrollments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  academic_year_id uuid references academic_years(id) on delete set null,
  term_id uuid references terms(id) on delete set null,
  class_id uuid not null references classes(id) on delete restrict,
  stream_id uuid references streams(id) on delete set null,
  status text default 'active' check (
    status in ('active','promoted','transferred','repeated','completed')
  ),
  enrolled_at date default current_date,
  ended_at date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table teachers (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  staff_no text,
  full_name text not null,
  phone text,
  email text,
  employment_type text check (
    employment_type in ('full_time','part_time','contract','intern')
  ),
  status text default 'active' check (
    status in ('active','inactive','suspended','left')
  ),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz,
  unique (school_id, staff_no)
);

create table teacher_assignments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  teacher_id uuid not null references teachers(id) on delete cascade,
  subject_id uuid references subjects(id) on delete cascade,
  class_id uuid references classes(id) on delete cascade,
  stream_id uuid references streams(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table timetable_entries
add column teacher_id uuid references teachers(id) on delete set null;

create table attendance (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  class_id uuid references classes(id),
  stream_id uuid references streams(id),
  attendance_date date not null,
  status text not null check (
    status in ('present','absent','late','excused')
  ),
  marked_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (student_id, attendance_date)
);

create table exams (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  term_id uuid references terms(id),
  name text not null,
  exam_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table exam_results (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  exam_id uuid not null references exams(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  marks numeric(5,2),
  grade text,
  remarks text,
  recorded_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (exam_id, student_id, subject_id)
);
