import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const allowedTypes = new Set(["invite", "recovery", "signup", "email_change"]);

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const rawType = requestUrl.searchParams.get("type");
  const type = rawType && allowedTypes.has(rawType) ? (rawType as EmailOtpType) : null;
  const next = requestUrl.searchParams.get("next") ?? "/auth/callback";

  if (!tokenHash) {
    return NextResponse.redirect(
      new URL(
        "/auth/callback?error=missing-token&error_description=The+email+link+is+missing+token_hash.+Use+the+Supabase+email+template+variables+TokenHash+and+SiteURL,+then+send+a+new+email.",
        requestUrl.origin
      )
    );
  }

  if (!type) {
    return NextResponse.redirect(
      new URL(
        "/auth/callback?error=missing-type&error_description=The+email+link+is+missing+a+valid+type.",
        requestUrl.origin
      )
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type
  });

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/auth/callback?error=verify-failed&error_description=${encodeURIComponent(error.message)}`,
        requestUrl.origin
      )
    );
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
