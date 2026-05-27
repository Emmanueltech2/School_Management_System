"use client";

import { useActionState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { assignSchoolAdmin } from "./actions";

type SchoolOption = {
  id: string;
  name: string;
  code: string | null;
};

type AssignSchoolAdminFormProps = {
  schools: SchoolOption[];
};

const initialState = {
  ok: false,
  message: ""
};

export function AssignSchoolAdminForm({ schools }: AssignSchoolAdminFormProps) {
  const [state, formAction, isPending] = useActionState(assignSchoolAdmin, initialState);
  const hasSchools = schools.length > 0;

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <label className="grid gap-2 text-sm font-medium md:col-span-2">
        School
        <select
          className="h-11 rounded-md border bg-white px-3 text-sm outline-none ring-primary/20 transition focus:ring-4"
          disabled={!hasSchools}
          name="schoolId"
          required
        >
          <option value="">Select a school</option>
          {schools.map((school) => (
            <option key={school.id} value={school.id}>
              {school.name}
              {school.code ? ` (${school.code})` : ""}
            </option>
          ))}
        </select>
      </label>

      <Input label="Admin full name" name="adminName" placeholder="Jane Admin" required />
      <Input label="Admin email" name="adminEmail" type="email" placeholder="admin@school.ac.ke" required />
      <Input label="Admin phone" name="adminPhone" placeholder="+254..." />

      <div className="rounded-md border bg-secondary/50 p-4 md:col-span-2">
        <p className="flex items-center gap-2 text-sm font-medium">
          <UserPlus className="size-4 text-primary" aria-hidden="true" />
          Existing school assignment
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          If the email is new, Supabase sends an invite. If the user already exists, the school
          admin role is added immediately.
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

      <Button className="md:col-span-2" disabled={isPending || !hasSchools} type="submit">
        <UserPlus className="size-4" aria-hidden="true" />
        {isPending ? "Assigning admin..." : "Assign school admin"}
      </Button>
    </form>
  );
}
