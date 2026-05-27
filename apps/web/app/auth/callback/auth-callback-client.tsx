"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

type AuthCallbackClientProps = {
  code?: string;
  errorDescription?: string;
  initialReady: boolean;
  initialStatus: string;
};

export function AuthCallbackClient({
  code,
  errorDescription,
  initialReady,
  initialStatus
}: AuthCallbackClientProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [status, setStatus] = useState(initialStatus);
  const [ready, setReady] = useState(initialReady);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function prepareClientSession() {
      if (initialReady) {
        return;
      }

      if (errorDescription) {
        setStatus(errorDescription);
        return;
      }

      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const hashError = hashParams.get("error_description");

      if (hashError) {
        setStatus(hashError);
        return;
      }

      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (error) {
          setStatus(error.message);
          return;
        }

        window.history.replaceState(null, "", window.location.pathname);
        setReady(true);
        setStatus("Create your password to finish setup.");
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          setStatus(
            `${error.message}. Send a fresh reset email from the same browser, or use the token_hash Supabase email template.`
          );
          return;
        }

        window.history.replaceState(null, "", window.location.pathname);
        setReady(true);
        setStatus("Create your password to finish setup.");
        return;
      }

      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (session) {
        setReady(true);
        setStatus("Create your password to finish setup.");
        return;
      }

      setStatus("No verified reset session found. Open the newest password reset email link.");
    }

    void prepareClientSession();
  }, [code, errorDescription, initialReady, supabase]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.length < 8) {
      setStatus("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsSubmitting(false);

    if (error) {
      setStatus(error.message);
      return;
    }

    setStatus("Password updated successfully. Redirecting...");
    router.push("/dashboard");
  }

  return (
    <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-8 flex items-start gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <KeyRound className="size-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-medium text-primary">Account setup</p>
          <h1 className="text-2xl font-semibold">Set your password</h1>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{status}</p>
        </div>
      </div>

      {ready ? (
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <Input
            label="New password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Create password"
            required
            type="password"
            value={password}
          />
          <Input
            label="Confirm password"
            name="confirmPassword"
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirm password"
            required
            type="password"
            value={confirmPassword}
          />
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Saving..." : "Save password"}
          </Button>
        </form>
      ) : (
        <Link
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          href="/forgot-password"
        >
          Request a new reset link
        </Link>
      )}
    </div>
  );
}
