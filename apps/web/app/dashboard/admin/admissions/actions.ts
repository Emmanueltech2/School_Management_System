"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAnyRole } from "@/lib/auth/session";

type AdmissionState = {
  ok: boolean;
  message: string;
};

function getRequiredString(formData: FormData, name: string) {
  const value = formData.get(name);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${name} is required.`);
  }

  return value.trim();
}

function getOptionalString(formData: FormData, name: string) {
  const value = formData.get(name);

  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  return value.trim();
}

function getSchoolId(session: Awaited<ReturnType<typeof requireAnyRole>>) {
  return (
    session.profile.school_id ??
    session.roles.find((role) => role.role === "school_admin" && role.schoolId)?.schoolId ??
    null
  );
}

export async function admitStudent(
  _previousState: AdmissionState,
  formData: FormData
): Promise<AdmissionState> {
  const session = await requireAnyRole(["school_admin"]);
  const schoolId = getSchoolId(session);

  if (!schoolId) {
    return {
      ok: false,
      message: "Admissions require a school-scoped admin account."
    };
  }

  const supabase = await createClient();

  try {
    const admissionNo = getRequiredString(formData, "admissionNo");
    const firstName = getRequiredString(formData, "firstName");
    const lastName = getRequiredString(formData, "lastName");
    const middleName = getOptionalString(formData, "middleName");
    const gender = getOptionalString(formData, "gender");
    const dateOfBirth = getOptionalString(formData, "dateOfBirth");
    const classId = getOptionalString(formData, "classId");
    const streamId = getOptionalString(formData, "streamId");
    const admissionDate = getOptionalString(formData, "admissionDate");
    const guardianName = getOptionalString(formData, "guardianName");
    const guardianPhone = getOptionalString(formData, "guardianPhone");
    const guardianEmail = getOptionalString(formData, "guardianEmail");
    const relationship = getOptionalString(formData, "relationship");

    const { data: student, error: studentError } = await supabase
      .from("students")
      .insert({
        school_id: schoolId,
        admission_no: admissionNo,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        gender,
        date_of_birth: dateOfBirth,
        class_id: classId,
        stream_id: streamId,
        admission_date: admissionDate,
        status: "active"
      })
      .select("id")
      .single();

    if (studentError) {
      throw studentError;
    }

    if (classId) {
      const { error: enrollmentError } = await supabase.from("student_enrollments").insert({
        school_id: schoolId,
        student_id: student.id,
        class_id: classId,
        stream_id: streamId,
        status: "active",
        enrolled_at: admissionDate
      });

      if (enrollmentError) {
        throw enrollmentError;
      }
    }

    if (guardianName) {
      const { data: guardian, error: guardianError } = await supabase
        .from("guardians")
        .insert({
          school_id: schoolId,
          full_name: guardianName,
          phone: guardianPhone,
          email: guardianEmail,
          relationship
        })
        .select("id")
        .single();

      if (guardianError) {
        throw guardianError;
      }

      const { error: linkError } = await supabase.from("student_guardians").insert({
        school_id: schoolId,
        student_id: student.id,
        guardian_id: guardian.id,
        is_primary: true
      });

      if (linkError) {
        throw linkError;
      }
    }

    revalidatePath("/dashboard/admin/admissions");
    revalidatePath("/dashboard/admin");

    return {
      ok: true,
      message: `Admitted ${firstName} ${lastName} successfully.`
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not admit student."
    };
  }
}
