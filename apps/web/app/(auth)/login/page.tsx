import Link from "next/link";
import { GraduationCap, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <GraduationCap className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Sign in to continue.</p>
        </div>
      </div>

      <form className="grid gap-4">
        <Input label="Email" name="email" type="email" placeholder="admin@school.ac.ke" />
        <Input label="Password" name="password" type="password" placeholder="Enter password" />
        <Button className="mt-2" type="submit">
          <LogIn className="size-4" aria-hidden="true" />
          Sign in
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-between text-sm">
        <Link className="font-medium text-primary hover:underline" href="/forgot-password">
          Forgot password?
        </Link>
        <Link className="font-medium text-primary hover:underline" href="/signup">
          Create school
        </Link>
      </div>
    </div>
  );
}
