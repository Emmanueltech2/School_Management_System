"use client";

import { useActionState } from "react";
import { MailPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { inviteSchoolAdmin } from "./actions";

const initialState = {
  ok: false,
  message: ""
};

export function InviteSchoolAdminForm() {
  const [state, formAction, isPending] = useActionState(inviteSchoolAdmin, initialState);

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <Input label="School name" name="schoolName" placeholder="St. Mary's Academy" required />
      <Input label="School code" name="schoolCode" placeholder="SMA" />
      <Input label="School email" name="schoolEmail" type="email" placeholder="info@school.ac.ke" />
      <Input label="School phone" name="schoolPhone" placeholder="+254..." />
      <Input label="Admin full name" name="adminName" placeholder="Jane Admin" required />
      <Input label="Admin email" name="adminEmail" type="email" placeholder="admin@school.ac.ke" required />
      <Input label="Admin phone" name="adminPhone" placeholder="+254..." />

      <div className="rounded-md border bg-secondary/50 p-4 md:col-span-2">
        <p className="flex items-center gap-2 text-sm font-medium">
          <MailPlus className="size-4 text-primary" aria-hidden="true" />
          Invitation and role assignment
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          The invited user will become `school_admin`, linked to the new `school_id`. Super admin
          users remain platform users with `school_id = null`.
        </p>
      </div>

      {state.message ? (
        <p
          className={`rounded-md border px-3 py-2 text-sm md:col-span-2 ${
            state.ok
              ? "border-primary/25 bg-primary/10 text-primary"
              : "border-destructive/25 bg-destructive/10 text-destructive"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <Button className="md:col-span-2" disabled={isPending} type="submit">
        <MailPlus className="size-4" aria-hidden="true" />
        {isPending ? "Sending invite..." : "Send school admin invite"}
      </Button>
    </form>
  );
}
