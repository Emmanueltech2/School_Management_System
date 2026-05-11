import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Reset password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your account email to receive a reset link.
        </p>
      </div>

      <form className="grid gap-4">
        <Input label="Email" name="email" type="email" placeholder="admin@school.ac.ke" />
        <Button type="submit">
          <Mail className="size-4" aria-hidden="true" />
          Send reset link
        </Button>
      </form>

      <Link className="mt-6 block text-sm font-medium text-primary hover:underline" href="/login">
        Back to login
      </Link>
    </div>
  );
}
