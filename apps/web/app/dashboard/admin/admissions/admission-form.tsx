"use client";

import { useActionState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { admitStudent } from "./actions";

type Option = {
  id: string;
  name: string;
};

type StreamOption = Option & {
  class_id: string;
};

type AdmissionFormProps = {
  classes: Option[];
  streams: StreamOption[];
};

const initialState = {
  ok: false,
  message: ""
};

export function AdmissionForm({ classes, streams }: AdmissionFormProps) {
  const [state, formAction, isPending] = useActionState(admitStudent, initialState);

  return (
    <form action={formAction} className="grid gap-5">
      <div>
        <h2 className="text-lg font-semibold">Student details</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Capture the core admission record and optional class placement.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Input label="Admission number" name="admissionNo" placeholder="ADM-001" required />
        <Input label="First name" name="firstName" placeholder="Amina" required />
        <Input label="Middle name" name="middleName" placeholder="Optional" />
        <Input label="Last name" name="lastName" placeholder="Otieno" required />
        <label className="grid gap-2 text-sm font-medium">
          Gender
          <select
            className="h-10 rounded-md border bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            name="gender"
          >
            <option value="">Select gender</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </label>
        <Input label="Date of birth" name="dateOfBirth" type="date" />
        <Input label="Admission date" name="admissionDate" type="date" />
        <label className="grid gap-2 text-sm font-medium">
          Class
          <select
            className="h-10 rounded-md border bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            name="classId"
          >
            <option value="">Assign later</option>
            {classes.map((classItem) => (
              <option key={classItem.id} value={classItem.id}>
                {classItem.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Stream
          <select
            className="h-10 rounded-md border bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            name="streamId"
          >
            <option value="">Assign later</option>
            {streams.map((stream) => (
              <option key={stream.id} value={stream.id}>
                {stream.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="rounded-lg border bg-secondary/40 p-4">
        <h3 className="font-semibold">Guardian details</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Optional for now, but recommended for parent portal and fee communication.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Input label="Guardian name" name="guardianName" placeholder="Grace Otieno" />
          <Input label="Phone" name="guardianPhone" placeholder="+254..." />
          <Input label="Email" name="guardianEmail" type="email" placeholder="parent@example.com" />
          <Input label="Relationship" name="relationship" placeholder="Mother" />
        </div>
      </div>

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

      <div className="flex justify-end">
        <Button disabled={isPending} type="submit">
          <UserPlus className="size-4" aria-hidden="true" />
          {isPending ? "Admitting student..." : "Admit student"}
        </Button>
      </div>
    </form>
  );
}
