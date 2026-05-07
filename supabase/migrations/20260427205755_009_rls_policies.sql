alter table profiles enable row level security;
alter table schools enable row level security;
alter table academic_years enable row level security;
alter table terms enable row level security;
alter table classes enable row level security;
alter table streams enable row level security;
alter table subjects enable row level security;
alter table class_subjects enable row level security;
alter table timetable_periods enable row level security;
alter table timetable_entries enable row level security;
alter table students enable row level security;
alter table guardians enable row level security;
alter table student_guardians enable row level security;
alter table student_enrollments enable row level security;
alter table teachers enable row level security;
alter table teacher_assignments enable row level security;
alter table attendance enable row level security;
alter table exams enable row level security;
alter table exam_results enable row level security;
alter table fee_items enable row level security;
alter table fee_invoices enable row level security;
alter table fee_invoice_items enable row level security;
alter table payment_methods enable row level security;
alter table school_payment_accounts enable row level security;
alter table fee_payments enable row level security;
alter table payment_allocations enable row level security;
alter table receipts enable row level security;
alter table fee_adjustments enable row level security;
alter table fee_refunds enable row level security;
alter table mpesa_transactions enable row level security;
alter table document_sequences enable row level security;
alter table documents enable row level security;
alter table audit_logs enable row level security;

create policy "Users can view own profile"
on profiles
for select
using (id = auth.uid());

create policy "Super admin can view all schools"
on schools
for select
using (has_role(array['super_admin']));

create policy "School users can view own school"
on schools
for select
using (same_school(id));

create policy "School users can view students in their school"
on students
for select
using (same_school(school_id) or has_role(array['super_admin']));

create policy "Admins can manage students"
on students
for all
using (has_role(array['super_admin', 'school_admin']))
with check (has_role(array['super_admin', 'school_admin']));

create policy "Parents can view their children"
on students
for select
using (
  exists (
    select 1
    from student_guardians sg
    join guardians g on g.id = sg.guardian_id
    where sg.student_id = students.id
    and g.profile_id = auth.uid()
  )
);

create policy "School users can view guardians in their school"
on guardians
for select
using (same_school(school_id) or has_role(array['super_admin']));

create policy "Admins can manage guardians"
on guardians
for all
using (has_role(array['super_admin', 'school_admin']))
with check (has_role(array['super_admin', 'school_admin']));

create policy "School users can view academic years"
on academic_years
for select
using (same_school(school_id) or has_role(array['super_admin']));

create policy "School users can view terms"
on terms
for select
using (same_school(school_id) or has_role(array['super_admin']));

create policy "School users can view classes"
on classes
for select
using (same_school(school_id) or has_role(array['super_admin']));

create policy "School users can view streams"
on streams
for select
using (same_school(school_id) or has_role(array['super_admin']));

create policy "School users can view subjects"
on subjects
for select
using (same_school(school_id) or has_role(array['super_admin']));

create policy "Admins can manage academic setup"
on academic_years
for all
using (has_role(array['super_admin', 'school_admin']))
with check (has_role(array['super_admin', 'school_admin']));

create policy "Admins can manage terms"
on terms
for all
using (has_role(array['super_admin', 'school_admin']))
with check (has_role(array['super_admin', 'school_admin']));

create policy "Admins can manage classes"
on classes
for all
using (has_role(array['super_admin', 'school_admin']))
with check (has_role(array['super_admin', 'school_admin']));

create policy "Admins can manage streams"
on streams
for all
using (has_role(array['super_admin', 'school_admin']))
with check (has_role(array['super_admin', 'school_admin']));

create policy "Admins can manage subjects"
on subjects
for all
using (has_role(array['super_admin', 'school_admin']))
with check (has_role(array['super_admin', 'school_admin']));

create policy "School users can view attendance"
on attendance
for select
using (same_school(school_id) or has_role(array['super_admin']));

create policy "Teachers can mark attendance"
on attendance
for insert
with check (has_role(array['teacher', 'school_admin']));

create policy "Teachers can update attendance"
on attendance
for update
using (has_role(array['teacher', 'school_admin']))
with check (has_role(array['teacher', 'school_admin']));

create policy "School users can view exam results"
on exam_results
for select
using (same_school(school_id) or has_role(array['super_admin']));

create policy "Teachers can record exam results"
on exam_results
for insert
with check (has_role(array['teacher', 'school_admin']));

create policy "Teachers can update exam results"
on exam_results
for update
using (has_role(array['teacher', 'school_admin']))
with check (has_role(array['teacher', 'school_admin']));

create policy "School users can view invoices in their school"
on fee_invoices
for select
using (same_school(school_id) or has_role(array['super_admin']));

create policy "Bursar and admin can manage invoices"
on fee_invoices
for all
using (has_role(array['super_admin', 'school_admin', 'bursar']))
with check (has_role(array['super_admin', 'school_admin', 'bursar']));

create policy "Bursar and admin can manage payments"
on fee_payments
for all
using (has_role(array['super_admin', 'school_admin', 'bursar']))
with check (has_role(array['super_admin', 'school_admin', 'bursar']));

create policy "School users can view payments"
on fee_payments
for select
using (same_school(school_id) or has_role(array['super_admin']));

create policy "School users can view documents"
on documents
for select
using (same_school(school_id) or has_role(array['super_admin']));

create policy "Admins can manage documents"
on documents
for all
using (has_role(array['super_admin', 'school_admin']))
with check (has_role(array['super_admin', 'school_admin']));
