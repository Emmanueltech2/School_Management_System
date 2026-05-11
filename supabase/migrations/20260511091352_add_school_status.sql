alter table schools
add column status text not null default 'active'
check (status in ('pending', 'active', 'inactive', 'suspended', 'archived'));
