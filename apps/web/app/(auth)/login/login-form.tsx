"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "./actions";

const initialState = {
  ok: false,
  message: ""
};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <Input label="Email" name="email" type="email" placeholder="admin@school.ac.ke" required />
      <Input label="Password" name="password" type="password" placeholder="Enter password" required />

      <div className="flex items-center justify-between gap-3 text-sm">
        <label className="flex items-center gap-2 text-muted-foreground">
          <input
            className="size-4 rounded border-input text-primary focus:ring-primary"
            name="remember"
            type="checkbox"
          />
          Remember me
        </label>
        <Link className="font-medium text-primary hover:underline" href="/forgot-password">
          Forgot password?
        </Link>
      </div>

      {state.message ? (
        <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.message}
        </p>
      ) : null}

      <Button className="mt-2" disabled={isPending} type="submit">
        <LogIn className="size-4" aria-hidden="true" />
        {isPending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
