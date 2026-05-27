"use server";

import { revalidatePath } from "next/cache";
import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/auth/session";
import { getAuthCallbackUrl } from "@/lib/auth/urls";

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
    throw roleError;
  }

  let existingRoleQuery = supabase
    .from("user_roles")
    .select("id, is_active")
    .eq("user_id", userId)
    .eq("role_id", role.id);

  existingRoleQuery = schoolId
    ? existingRoleQuery.eq("school_id", schoolId)
    : existingRoleQuery.is("school_id", null);

  const { data: existingRole, error: existingRoleError } = await existingRoleQuery.maybeSingle();

  if (existingRoleError) {
    throw existingRoleError;
  }

  if (existingRole) {
    if (!existingRole.is_active) {
      const { error: updateError } = await supabase
        .from("user_roles")
        .update({ is_active: true })
        .eq("id", existingRole.id);

      if (updateError) {
        throw updateError;
      }
    }

    return;
  }

  const { error: assignError } = await supabase.from("user_roles").insert({
    user_id: userId,
    school_id: schoolId,
    role_id: role.id,
    is_active: true
  });

  if (assignError) {
    throw assignError;
  }
}

async function findAuthUserByEmail({
  supabase,
  email
}: {
  supabase: ReturnType<typeof createAdminClient>;
  email: string;
}) {
  let page = 1;

  while (page <= 10) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000
    });

    if (error) {
      throw error;
    }

    const user = data.users.find(
      (candidate) => candidate.email?.toLowerCase() === email.toLowerCase()
    );

    if (user) {
      return user;
    }

    if (data.users.length < 1000) {
      return null;
    }

    page += 1;
  }

  return null;
}

async function upsertSchoolAdminProfile({
  supabase,
  user,
  schoolId,
  fullName,
  phone
}: {
  supabase: ReturnType<typeof createAdminClient>;
  user: User;
  schoolId: string;
  fullName: string;
  phone: string | null;
}) {
  const { data: currentProfile, error: currentProfileError } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .maybeSingle();

  if (currentProfileError) {
    throw currentProfileError;
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    school_id: schoolId,
    full_name: fullName || currentProfile?.full_name || user.email || "School Admin",
    phone: phone ?? currentProfile?.phone ?? null,
    role: "school_admin",
    is_active: true
  });

  if (profileError) {
    throw profileError;
  }
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
        redirectTo: getAuthCallbackUrl()
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

export async function assignSchoolAdmin(
  _previousState: InviteSchoolAdminState,
  formData: FormData
): Promise<InviteSchoolAdminState> {
  await requireSuperAdmin();

  const supabase = createAdminClient();

  try {
    const schoolId = getRequiredString(formData, "schoolId");
    const adminName = getRequiredString(formData, "adminName");
    const adminEmail = getRequiredString(formData, "adminEmail").toLowerCase();
    const adminPhone = getOptionalString(formData, "adminPhone");

    const { data: school, error: schoolError } = await supabase
      .from("schools")
      .select("id, name")
      .eq("id", schoolId)
      .single();

    if (schoolError) {
      throw schoolError;
    }

    let user = await findAuthUserByEmail({ supabase, email: adminEmail });
    let sentInvite = false;

    if (!user) {
      const { data: invite, error: inviteError } =
        await supabase.auth.admin.inviteUserByEmail(adminEmail, {
          data: {
            full_name: adminName,
            school_id: school.id,
            role: "school_admin"
          },
          redirectTo: getAuthCallbackUrl()
        });

      if (inviteError) {
        throw inviteError;
      }

      if (!invite.user) {
        throw new Error("Supabase did not return an invited user id.");
      }

      user = invite.user;
      sentInvite = true;
    }

    await upsertSchoolAdminProfile({
      supabase,
      user,
      schoolId: school.id,
      fullName: adminName,
      phone: adminPhone
    });

    await assignUserRole({
      supabase,
      userId: user.id,
      schoolId: school.id,
      roleName: "school_admin"
    });

    revalidatePath("/admin");
    revalidatePath("/dashboard");

    return {
      ok: true,
      message: sentInvite
        ? `Invitation sent to ${adminEmail} and linked to ${school.name}.`
        : `${adminEmail} is now a school admin for ${school.name}.`
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not assign school admin."
    };
  }
}
