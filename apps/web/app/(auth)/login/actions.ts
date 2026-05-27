"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getDashboardPath,
  getPrimaryRole,
  getProfileForUser,
  getRolesForUser
} from "@/lib/auth/session";

type LoginState = {
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

export async function login(
  _previousState: LoginState,
  formData: FormData
): Promise<LoginState> {
  let redirectTo: string | null = null;

  try {
    const supabase = await createClient();

    const email = getRequiredString(formData, "email").toLowerCase();
    const password = getRequiredString(formData, "password");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data.user) {
      return {
        ok: false,
        message: error?.message ?? "Could not sign in."
      };
    }

    const profile = await getProfileForUser(supabase, data.user.id);

    if (!profile || profile.is_active === false) {
      await supabase.auth.signOut();

      return {
        ok: false,
        message: "Your account profile is not active. Contact support."
      };
    }

    await supabase
      .from("profiles")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", data.user.id);

    const roles = await getRolesForUser(supabase, profile);
    const primaryRole = getPrimaryRole(profile, roles);
    redirectTo = getDashboardPath(primaryRole);
  } catch (error) {
    console.error("Login failed", error);

    return {
      ok: false,
      message: "Sign in could not be completed. Check the Vercel Supabase environment variables and profile setup."
    };
  }

  if (redirectTo) {
    redirect(redirectTo);
  }

  return {
    ok: false,
    message: "Could not determine where to send this user after sign in."
  };
}
