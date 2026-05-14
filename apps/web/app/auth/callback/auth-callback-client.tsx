"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const [status, setStatus] = useState("Preparing your account...");
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function prepareSession() {
      const urlErrorDescription = searchParams.get("error_description");

      if (urlErrorDescription) {
        setStatus(urlErrorDescription);
        return;
      }

      const code = searchParams.get("code");

      if (code) {
        setStatus(
          "This email link is using the wrong Supabase template format. It must use token_hash and open /auth/confirm first."
        );
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

      setStatus("No verified session found. Open the newest invite or reset email link.");
    }

    void prepareSession();
  }, [searchParams, supabase]);

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
      ) : null}
    </div>
  );
}
