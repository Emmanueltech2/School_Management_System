"use server";

import { createClient } from "@/lib/supabase/server";
import { getAuthCallbackUrl } from "@/lib/auth/urls";

type ForgotPasswordState = {
  ok: boolean;
  message: string;
};

export async function sendPasswordReset(
  _previousState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const value = formData.get("email");

  if (typeof value !== "string" || value.trim().length === 0) {
    return {
      ok: false,
      message: "Email is required."
    };
  }

  const email = value.trim().toLowerCase();
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getAuthCallbackUrl()
  });

  if (error) {
    return {
      ok: false,
      message: error.message
    };
  }

  return {
    ok: true,
    message: "If that email exists, Supabase will send a password reset link."
  };
}
