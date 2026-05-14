import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Reset password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your account email to receive a reset link.
        </p>
      </div>

      <ForgotPasswordForm />

      <Link className="mt-6 block text-sm font-medium text-primary hover:underline" href="/login">
        Back to login
      </Link>
    </div>
  );
}
