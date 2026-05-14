import { GraduationCap, LockKeyhole, ShieldCheck } from "lucide-react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-8 flex items-start gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <GraduationCap className="size-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-medium text-primary">Elite Soft SMS</p>
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Secure access for administrators, teachers, finance officers, parents, and students.
          </p>
        </div>
      </div>

      <LoginForm />

      <div className="mt-6 grid gap-3 rounded-md border bg-secondary/50 p-3 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
          Protected by secure authentication.
        </p>
        <p className="flex items-center gap-2">
          <LockKeyhole className="size-4 text-primary" aria-hidden="true" />
          Access is controlled by your school role.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {["Admin", "Teacher", "Finance", "Parent", "Student"].map((role) => (
          <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium" key={role}>
            {role}
          </span>
        ))}
      </div>

      <footer className="mt-8 border-t pt-4 text-xs leading-5 text-muted-foreground">
        <p>© 2026 Elite Soft Technologies</p>
        <p>Version 0.1.0 • Support: support@elitesoft.africa</p>
      </footer>
    </div>
  );
}
