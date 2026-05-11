import Link from "next/link";
import { Building2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
  return (
    <div className="w-full max-w-2xl rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Building2 className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Create your school</h1>
          <p className="text-sm text-muted-foreground">
            This creates the school and the first school admin account.
          </p>
        </div>
      </div>

      <form className="grid gap-4 md:grid-cols-2">
        <Input label="School name" name="schoolName" placeholder="Elite Academy" />
        <Input label="School code" name="schoolCode" placeholder="ELITE" />
        <Input label="Admin full name" name="fullName" placeholder="Jane Admin" />
        <Input label="Phone" name="phone" placeholder="+254..." />
        <Input label="Email" name="email" type="email" placeholder="admin@school.ac.ke" />
        <Input label="Password" name="password" type="password" placeholder="Create password" />
        <Button className="mt-2 md:col-span-2" type="submit">
          <UserPlus className="size-4" aria-hidden="true" />
          Create school account
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link className="font-medium text-primary hover:underline" href="/login">
          Sign in
        </Link>
      </p>
    </div>
  );
}
