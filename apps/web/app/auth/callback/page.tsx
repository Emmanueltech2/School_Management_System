import { Suspense } from "react";
import { AuthCallbackClient } from "./auth-callback-client";

export default function AuthCallbackPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <Suspense fallback={<div className="text-sm text-muted-foreground">Preparing account...</div>}>
        <AuthCallbackClient />
      </Suspense>
    </main>
  );
}
