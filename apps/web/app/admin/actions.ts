"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/auth/session";
import { getConfirmUrl } from "@/lib/auth/urls";

type InviteSchoolAdminState = {
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

async function assignUserRole({
  supabase,
  userId,
  schoolId,
  roleName
}: {
  supabase: ReturnType<typeof createAdminClient>;
  userId: string;
  schoolId: string | null;
  roleName: string;
}) {
  const { data: role, error: roleError } = await supabase
    .from("roles")
    .select("id")
    .eq("name", roleName)
    .single();

  if (roleError) {
    return;
  }

  await supabase.from("user_roles").insert({
    user_id: userId,
    school_id: schoolId,
    role_id: role.id,
    is_active: true
  });
}

export async function inviteSchoolAdmin(
  _previousState: InviteSchoolAdminState,
  formData: FormData
): Promise<InviteSchoolAdminState> {
  await requireSuperAdmin();

  const supabase = createAdminClient();

  try {
    const schoolName = getRequiredString(formData, "schoolName");
    const adminName = getRequiredString(formData, "adminName");
    const adminEmail = getRequiredString(formData, "adminEmail").toLowerCase();
    const schoolCode = getOptionalString(formData, "schoolCode");
    const schoolEmail = getOptionalString(formData, "schoolEmail");
    const schoolPhone = getOptionalString(formData, "schoolPhone");
    const adminPhone = getOptionalString(formData, "adminPhone");

    const { data: school, error: schoolError } = await supabase
      .from("schools")
      .insert({
        name: schoolName,
        code: schoolCode,
        email: schoolEmail,
        phone: schoolPhone,
        status: "pending"
      })
      .select("id")
      .single();

    if (schoolError) {
      throw schoolError;
    }

    const { data: invite, error: inviteError } =
      await supabase.auth.admin.inviteUserByEmail(adminEmail, {
        data: {
          full_name: adminName,
          school_id: school.id,
          role: "school_admin"
        },
        redirectTo: getConfirmUrl("invite")
      });

    if (inviteError) {
      throw inviteError;
    }

    const userId = invite.user?.id;

    if (!userId) {
      throw new Error("Supabase did not return an invited user id.");
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      school_id: school.id,
      full_name: adminName,
      phone: adminPhone,
      role: "school_admin",
      is_active: true
    });

    if (profileError) {
      throw profileError;
    }

    await assignUserRole({
      supabase,
      userId,
      schoolId: school.id,
      roleName: "school_admin"
    });

    const { error: paymentMethodsError } = await supabase.from("payment_methods").insert([
      { school_id: school.id, name: "Cash", type: "cash" },
      { school_id: school.id, name: "MPesa", type: "mpesa" },
      { school_id: school.id, name: "Bank", type: "bank" }
    ]);

    if (paymentMethodsError) {
      throw paymentMethodsError;
    }

    const { error: sequencesError } = await supabase.from("document_sequences").insert([
      { school_id: school.id, document_type: "invoice", prefix: "INV" },
      { school_id: school.id, document_type: "receipt", prefix: "RCT" }
    ]);

    if (sequencesError) {
      throw sequencesError;
    }

    revalidatePath("/admin");

    return {
      ok: true,
      message: `Invitation sent to ${adminEmail}.`
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not invite school admin."
    };
  }
}
