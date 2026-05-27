import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  school_id: string | null;
  full_name: string;
  phone: string | null;
  role: string;
  avatar_url: string | null;
  last_login_at: string | null;
  is_active: boolean | null;
};

export type ActiveRole = {
  role: string;
  displayName: string;
  schoolId: string | null;
};

export type SessionProfile = {
  user: User;
  profile: Profile;
  roles: ActiveRole[];
  primaryRole: string;
};

export function getDashboardPath(role: string) {
  switch (role) {
    case "super_admin":
      return "/admin";
    case "school_admin":
      return "/dashboard/admin";
    case "teacher":
      return "/dashboard/teacher";
    case "finance_officer":
      return "/dashboard/finance";
    case "bursar":
      return "/dashboard/finance";
    case "parent":
      return "/dashboard/parent";
    case "student":
      return "/dashboard/student";
    default:
      return "/dashboard";
  }
}

export function hasActiveRole(roles: ActiveRole[], role: string) {
  return roles.some((activeRole) => activeRole.role === role);
}

function getFallbackRole(profile: Profile): ActiveRole {
  return {
    role: profile.role,
    displayName: formatRoleName(profile.role),
    schoolId: profile.school_id
  };
}

export function formatRoleName(role: string) {
  return role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getPrimaryRole(profile: Profile, roles: ActiveRole[]) {
  const priority = [
    "super_admin",
    "school_admin",
    "finance_officer",
    "bursar",
    "teacher",
    "parent",
    "student"
  ];

  return priority.find((role) => roles.some((activeRole) => activeRole.role === role)) ?? profile.role;
}

export async function getProfileForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, school_id, full_name, phone, role, avatar_url, last_login_at, is_active")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function getRolesForUser(
  supabase: SupabaseClient,
  profile: Profile
): Promise<ActiveRole[]> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("school_id, roles(name, display_name)")
    .eq("user_id", profile.id)
    .eq("is_active", true);

  if (error) {
    return [getFallbackRole(profile)];
  }

  const roles = (data ?? [])
    .map((assignment) => {
      const role = Array.isArray(assignment.roles) ? assignment.roles[0] : assignment.roles;

      if (!role?.name) {
        return null;
      }

      return {
        role: role.name as string,
        displayName: (role.display_name as string | null) ?? formatRoleName(role.name as string),
        schoolId: assignment.school_id as string | null
      };
    })
    .filter((role): role is ActiveRole => role !== null);

  return roles.length > 0 ? roles : [getFallbackRole(profile)];
}

export async function getSessionProfile(): Promise<SessionProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const profile = await getProfileForUser(supabase, user.id);

  if (!profile || profile.is_active === false) {
    return null;
  }

  const roles = await getRolesForUser(supabase, profile);
  const primaryRole = getPrimaryRole(profile, roles);

  return { user, profile, roles, primaryRole };
}

export async function requireSessionProfile() {
  const sessionProfile = await getSessionProfile();

  if (!sessionProfile) {
    redirect("/login");
  }

  return sessionProfile;
}

export async function requireSuperAdmin() {
  const sessionProfile = await requireSessionProfile();

  if (!hasActiveRole(sessionProfile.roles, "super_admin")) {
    redirect(getDashboardPath(sessionProfile.primaryRole));
  }

  return sessionProfile;
}

export async function requireAnyRole(allowedRoles: string[]) {
  const sessionProfile = await requireSessionProfile();

  const canAccess =
    hasActiveRole(sessionProfile.roles, "super_admin") ||
    allowedRoles.some((role) => hasActiveRole(sessionProfile.roles, role));

  if (!canAccess) {
    redirect(getDashboardPath(sessionProfile.primaryRole));
  }

  return sessionProfile;
}
