"use client";

import { useActionState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendPasswordReset } from "./actions";

const initialState = {
  ok: false,
  message: ""
};

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(sendPasswordReset, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <Input label="Email" name="email" type="email" placeholder="admin@school.ac.ke" required />

      {state.message ? (
        <p
          className={`rounded-md border px-3 py-2 text-sm ${
            state.ok
              ? "border-primary/25 bg-primary/10 text-primary"
              : "border-destructive/25 bg-destructive/10 text-destructive"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <Button disabled={isPending} type="submit">
        <Mail className="size-4" aria-hidden="true" />
        {isPending ? "Sending..." : "Send reset link"}
      </Button>
    </form>
  );
}
