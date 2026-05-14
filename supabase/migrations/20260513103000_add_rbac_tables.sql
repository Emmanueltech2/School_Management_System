create table roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_name text not null,
  description text,
  is_system boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles
drop constraint if exists profiles_role_check;

alter table profiles
add constraint profiles_role_check
check (
  role in (
    'super_admin',
    'school_admin',
    'teacher',
    'finance_officer',
    'bursar',
    'parent',
    'student'
  )
);

create table permissions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references roles(id) on delete cascade,
  permission_id uuid not null references permissions(id) on delete cascade,
  created_at timestamptz default now(),
  unique (role_id, permission_id)
);

create table user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  school_id uuid references schools(id) on delete cascade,
  role_id uuid not null references roles(id) on delete cascade,
  is_active boolean not null default true,
  assigned_by uuid references profiles(id) on delete set null,
  assigned_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, school_id, role_id)
);

insert into roles (name, display_name, description)
values
  ('super_admin', 'Super Admin', 'Platform-wide owner and support administrator'),
  ('school_admin', 'School Admin', 'Administrator for one school'),
  ('finance_officer', 'Finance Officer', 'Fees, invoices, payments, receipts, and finance reports'),
  ('bursar', 'Bursar', 'Legacy finance role kept for backward compatibility'),
  ('teacher', 'Teacher', 'Academic and classroom operations'),
  ('parent', 'Parent/Guardian', 'Parent or guardian portal access'),
  ('student', 'Student', 'Student portal access')
on conflict (name) do update
set
  display_name = excluded.display_name,
  description = excluded.description;

insert into permissions (name, description)
values
  ('platform.manage', 'Manage platform-wide settings and schools'),
  ('schools.create', 'Create schools'),
  ('schools.read', 'Read schools'),
  ('schools.update', 'Update schools'),
  ('users.invite', 'Invite users'),
  ('users.manage', 'Manage users and roles'),
  ('students.read', 'Read students'),
  ('students.create', 'Create students'),
  ('students.update', 'Update students'),
  ('guardians.read', 'Read guardians'),
  ('guardians.manage', 'Manage guardians'),
  ('academics.read', 'Read academic setup'),
  ('academics.manage', 'Manage academic setup'),
  ('fees.read', 'Read fees and invoices'),
  ('fees.manage', 'Manage fee setup and invoices'),
  ('payments.record', 'Record payments'),
  ('reports.view', 'View reports'),
  ('profile.read_own', 'Read own profile')
on conflict (name) do update
set description = excluded.description;

insert into role_permissions (role_id, permission_id)
select r.id, p.id
from roles r
join permissions p on p.name = any (
  case r.name
    when 'super_admin' then array[
      'platform.manage',
      'schools.create',
      'schools.read',
      'schools.update',
      'users.invite',
      'users.manage',
      'students.read',
      'students.create',
      'students.update',
      'guardians.read',
      'guardians.manage',
      'academics.read',
      'academics.manage',
      'fees.read',
      'fees.manage',
      'payments.record',
      'reports.view',
      'profile.read_own'
    ]
    when 'school_admin' then array[
      'schools.read',
      'schools.update',
      'users.invite',
      'users.manage',
      'students.read',
      'students.create',
      'students.update',
      'guardians.read',
      'guardians.manage',
      'academics.read',
      'academics.manage',
      'fees.read',
      'fees.manage',
      'payments.record',
      'reports.view',
      'profile.read_own'
    ]
    when 'finance_officer' then array[
      'students.read',
      'guardians.read',
      'fees.read',
      'fees.manage',
      'payments.record',
      'reports.view',
      'profile.read_own'
    ]
    when 'bursar' then array[
      'students.read',
      'guardians.read',
      'fees.read',
      'fees.manage',
      'payments.record',
      'reports.view',
      'profile.read_own'
    ]
    when 'teacher' then array[
      'students.read',
      'academics.read',
      'profile.read_own'
    ]
    when 'parent' then array[
      'students.read',
      'fees.read',
      'profile.read_own'
    ]
    when 'student' then array[
      'academics.read',
      'fees.read',
      'profile.read_own'
    ]
    else array[]::text[]
  end
)
on conflict (role_id, permission_id) do nothing;

insert into user_roles (user_id, school_id, role_id, is_active)
select p.id, p.school_id, r.id, p.is_active
from profiles p
join roles r on r.name = p.role
on conflict (user_id, school_id, role_id) do update
set is_active = excluded.is_active;

create index idx_roles_name on roles(name);
create index idx_permissions_name on permissions(name);
create index idx_role_permissions_role on role_permissions(role_id);
create index idx_role_permissions_permission on role_permissions(permission_id);
create index idx_user_roles_user on user_roles(user_id);
create index idx_user_roles_school on user_roles(school_id);
create index idx_user_roles_role on user_roles(role_id);
create index idx_user_roles_active_scope on user_roles(user_id, school_id, is_active);
create unique index idx_user_roles_platform_unique
on user_roles(user_id, role_id)
where school_id is null;

create trigger set_roles_updated_at before update on roles for each row execute function set_updated_at();
create trigger set_permissions_updated_at before update on permissions for each row execute function set_updated_at();
create trigger set_user_roles_updated_at before update on user_roles for each row execute function set_updated_at();

alter table roles enable row level security;
alter table permissions enable row level security;
alter table role_permissions enable row level security;
alter table user_roles enable row level security;

create or replace function has_role(allowed_roles text[])
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from profiles p
    where p.id = auth.uid()
    and p.role = any(allowed_roles)
    and p.is_active = true
  )
  or exists (
    select 1
    from user_roles ur
    join roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
    and ur.is_active = true
    and r.name = any(allowed_roles)
  );
$$;

create or replace function same_school(target_school_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from profiles p
    where p.id = auth.uid()
    and p.school_id = target_school_id
    and p.is_active = true
  )
  or exists (
    select 1
    from user_roles ur
    where ur.user_id = auth.uid()
    and ur.school_id = target_school_id
    and ur.is_active = true
  );
$$;

create or replace function has_permission(permission_name text, target_school_id uuid default null)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from user_roles ur
    join roles r on r.id = ur.role_id
    join role_permissions rp on rp.role_id = r.id
    join permissions p on p.id = rp.permission_id
    where ur.user_id = auth.uid()
    and ur.is_active = true
    and p.name = permission_name
    and (
      ur.school_id is null
      or target_school_id is null
      or ur.school_id = target_school_id
    )
  );
$$;

create policy "Active users can view roles"
on roles
for select
using (exists (
  select 1 from profiles p where p.id = auth.uid() and p.is_active = true
));

create policy "Active users can view permissions"
on permissions
for select
using (exists (
  select 1 from profiles p where p.id = auth.uid() and p.is_active = true
));

create policy "Active users can view role permissions"
on role_permissions
for select
using (exists (
  select 1 from profiles p where p.id = auth.uid() and p.is_active = true
));

create policy "Users can view own role assignments"
on user_roles
for select
using (user_id = auth.uid());

create policy "Super admin can view all role assignments"
on user_roles
for select
using (has_role(array['super_admin']));

create policy "School admins can view role assignments in their school"
on user_roles
for select
using (
  has_role(array['school_admin'])
  and same_school(school_id)
);

create policy "Super admin can manage role assignments"
on user_roles
for all
using (has_role(array['super_admin']))
with check (has_role(array['super_admin']));

create policy "School admins can manage school role assignments"
on user_roles
for all
using (
  has_role(array['school_admin'])
  and same_school(school_id)
)
with check (
  has_role(array['school_admin'])
  and same_school(school_id)
);
