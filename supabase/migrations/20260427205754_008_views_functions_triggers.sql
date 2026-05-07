create view student_fee_statement as
select
  s.id as student_id,
  s.school_id,
  s.admission_no,
  s.first_name,
  s.last_name,
  fi.id as invoice_id,
  fi.invoice_no,
  fi.total_amount,
  fi.amount_paid,
  fi.balance,
  fi.status,
  fi.created_at as invoice_date
from students s
join fee_invoices fi on fi.student_id = s.id
where s.deleted_at is null
and fi.deleted_at is null;

create or replace function recalculate_invoice_payment()
returns trigger
language plpgsql
as $$
declare
  target_invoice_id uuid;
begin
  target_invoice_id := coalesce(new.invoice_id, old.invoice_id);

  update fee_invoices
  set amount_paid = coalesce((
    select sum(amount)
    from payment_allocations
    where invoice_id = target_invoice_id
  ), 0)
  where id = target_invoice_id;

  update fee_invoices
  set status =
    case
      when amount_paid <= 0 then 'unpaid'
      when amount_paid < total_amount then 'partial'
      when amount_paid >= total_amount then 'paid'
      else status
    end
  where id = target_invoice_id;

  return null;
end;
$$;

create trigger trg_recalculate_invoice_payment
after insert or update or delete on payment_allocations
for each row
execute function recalculate_invoice_payment();

create or replace function auth_profile()
returns table (
  user_id uuid,
  school_id uuid,
  role text
)
language sql
security definer
stable
as $$
  select id, school_id, role
  from profiles
  where id = auth.uid()
  and is_active = true;
$$;

create or replace function has_role(allowed_roles text[])
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from profiles
    where id = auth.uid()
    and role = any(allowed_roles)
    and is_active = true
  );
$$;

create or replace function same_school(target_school_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from profiles
    where id = auth.uid()
    and school_id = target_school_id
    and is_active = true
  );
$$;

create index idx_profiles_school on profiles(school_id);
create index idx_students_school on students(school_id);
create index idx_students_class on students(class_id);
create index idx_students_profile on students(profile_id);
create index idx_students_deleted_at on students(deleted_at);
create index idx_guardians_school on guardians(school_id);
create index idx_guardians_profile on guardians(profile_id);
create index idx_student_guardians_student on student_guardians(student_id);
create index idx_student_guardians_guardian on student_guardians(guardian_id);
create index idx_student_enrollments_student on student_enrollments(student_id);
create index idx_student_enrollments_school_year on student_enrollments(school_id, academic_year_id);
create index idx_teachers_school on teachers(school_id);
create index idx_teachers_profile on teachers(profile_id);
create index idx_classes_school on classes(school_id);
create index idx_streams_class on streams(class_id);
create index idx_subjects_school on subjects(school_id);
create index idx_class_subjects_school on class_subjects(school_id);
create index idx_teacher_assignments_teacher on teacher_assignments(teacher_id);
create index idx_teacher_assignments_class on teacher_assignments(class_id);
create index idx_timetable_entries_school on timetable_entries(school_id);
create index idx_timetable_entries_class_day on timetable_entries(class_id, day_of_week);
create index idx_attendance_school_date on attendance(school_id, attendance_date);
create index idx_attendance_student_date on attendance(student_id, attendance_date);
create index idx_fee_invoices_student on fee_invoices(student_id);
create index idx_fee_invoices_school_status on fee_invoices(school_id, status);
create index idx_fee_invoice_items_invoice on fee_invoice_items(invoice_id);
create index idx_fee_payments_student on fee_payments(student_id);
create index idx_fee_payments_school_status on fee_payments(school_id, payment_status);
create index idx_payment_allocations_payment on payment_allocations(payment_id);
create index idx_payment_allocations_invoice on payment_allocations(invoice_id);
create index idx_school_payment_accounts_school on school_payment_accounts(school_id);
create index idx_mpesa_transactions_invoice on mpesa_transactions(invoice_id);
create index idx_mpesa_transactions_receipt on mpesa_transactions(mpesa_receipt_number);
create index idx_exam_results_student on exam_results(student_id);
create index idx_exam_results_exam on exam_results(exam_id);
create index idx_documents_school on documents(school_id);
create index idx_documents_owner on documents(owner_type, owner_id);
create index idx_audit_logs_school on audit_logs(school_id);
create index idx_audit_logs_actor on audit_logs(actor_id);
create index idx_audit_logs_entity on audit_logs(entity_type, entity_id);

create trigger set_schools_updated_at before update on schools for each row execute function set_updated_at();
create trigger set_profiles_updated_at before update on profiles for each row execute function set_updated_at();
create trigger set_academic_years_updated_at before update on academic_years for each row execute function set_updated_at();
create trigger set_terms_updated_at before update on terms for each row execute function set_updated_at();
create trigger set_classes_updated_at before update on classes for each row execute function set_updated_at();
create trigger set_streams_updated_at before update on streams for each row execute function set_updated_at();
create trigger set_subjects_updated_at before update on subjects for each row execute function set_updated_at();
create trigger set_students_updated_at before update on students for each row execute function set_updated_at();
create trigger set_guardians_updated_at before update on guardians for each row execute function set_updated_at();
create trigger set_teachers_updated_at before update on teachers for each row execute function set_updated_at();
create trigger set_attendance_updated_at before update on attendance for each row execute function set_updated_at();
create trigger set_fee_invoices_updated_at before update on fee_invoices for each row execute function set_updated_at();
create trigger set_fee_payments_updated_at before update on fee_payments for each row execute function set_updated_at();
create trigger set_documents_updated_at before update on documents for each row execute function set_updated_at();
create trigger set_exam_results_updated_at before update on exam_results for each row execute function set_updated_at();
