import { AuthCallbackClient } from "./auth-callback-client";
import { createClient } from "@/lib/supabase/server";

type AuthCallbackPageProps = {
  searchParams: Promise<{
    code?: string;
    error?: string;
    error_description?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function AuthCallbackPage({ searchParams }: AuthCallbackPageProps) {
  const params = await searchParams;
  let ready = false;
  let status = "No verified session found. Open the newest invite or reset email link.";

  if (params.error_description) {
    status = params.error_description;
  } else if (params.code) {
    status = "Preparing your secure password reset session...";
  } else {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
      ready = true;
      status = "Create your password to finish setup.";
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <AuthCallbackClient
        code={params.code}
        errorDescription={params.error_description}
        initialReady={ready}
        initialStatus={status}
      />
    </main>
  );
}
