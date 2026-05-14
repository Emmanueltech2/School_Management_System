import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  ClipboardList,
  MailPlus,
  ShieldCheck
} from "lucide-react";
import { InviteSchoolAdminForm } from "./invite-school-admin-form";
import { logout } from "@/app/actions";
import { requireSuperAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const setupSteps = [
  "Create school record",
  "Invite school administrator",
  "Link admin profile to school",
  "Prepare default payment methods",
  "Prepare invoice and receipt sequences"
];

export default async function AdminPage() {
  const { profile, roles } = await requireSuperAdmin();

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-medium text-primary">Restricted workspace</p>
            <h1 className="text-xl font-semibold">Admin panel</h1>
            <p className="text-sm text-muted-foreground">{profile.full_name}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {roles.map((role) => (
                <span
                  className="rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                  key={`${role.role}-${role.schoolId ?? "platform"}`}
                >
                  {role.displayName}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              className="rounded-md bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80"
              href="/dashboard"
            >
              Back to dashboard
            </Link>
            <form action={logout}>
              <button className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-white hover:bg-foreground/90">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold">Super admin tools</p>
              <p className="text-sm text-muted-foreground">Platform-level setup</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {setupSteps.map((step) => (
              <div className="flex items-start gap-2 text-sm text-muted-foreground" key={step}>
                <CheckCircle2 className="mt-0.5 size-4 text-primary" aria-hidden="true" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </aside>

        <section className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: "Schools pending", value: "0", icon: Building2 },
              { title: "Invites sent", value: "0", icon: MailPlus },
              { title: "Setup checks", value: "Ready", icon: ClipboardList }
            ].map((item) => {
              const Icon = item.icon;

              return (
                <article className="rounded-lg border bg-card p-5" key={item.title}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
                    <Icon className="size-5 text-primary" aria-hidden="true" />
                  </div>
                  <p className="mt-4 text-2xl font-semibold">{item.value}</p>
                </article>
              );
            })}
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Invite school admin</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Super admins create schools and invite the first school administrator. The admin
                  receives a Supabase email to set their password before signing in.
                </p>
              </div>
              <div className="hidden rounded-md bg-secondary px-3 py-2 text-sm font-medium text-muted-foreground md:block">
                Super admin only
              </div>
            </div>

            <InviteSchoolAdminForm />
          </div>
        </section>
      </div>
    </main>
  );
}
