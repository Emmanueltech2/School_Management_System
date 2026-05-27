import Link from "next/link";
import { Building2, CreditCard, GraduationCap, ShieldCheck, Users } from "lucide-react";
import { logout } from "@/app/actions";
import {
  formatRoleName,
  getDashboardPath,
  hasActiveRole,
  requireSessionProfile
} from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { RolePreviewSwitcher } from "./_components/role-preview-switcher";

export const dynamic = "force-dynamic";

const cards = [
  {
    title: "School setup",
    value: "Ready",
    icon: Building2
  },
  {
    title: "Students",
    value: "0",
    icon: Users
  },
  {
    title: "Classes",
    value: "0",
    icon: GraduationCap
  },
  {
    title: "Payments",
    value: "KES 0",
    icon: CreditCard
  }
];

type SchoolSummary = {
  name: string;
  code: string | null;
  email: string | null;
  phone: string | null;
  status: string;
};

async function getSchoolSummary(schoolId: string | null) {
  if (!schoolId) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("schools")
    .select("name, code, email, phone, status")
    .eq("id", schoolId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data as SchoolSummary | null;
}

export default async function DashboardPage() {
  const { profile, primaryRole, roles } = await requireSessionProfile();
  const isSuperAdmin = hasActiveRole(roles, "super_admin");
  const primaryRoleLabel =
    roles.find((role) => role.role === primaryRole)?.displayName ?? formatRoleName(primaryRole);
  const school = await getSchoolSummary(profile.school_id);
  const roleLinks = roles
    .map((role) => ({
      label: role.displayName,
      href: getDashboardPath(role.role)
    }))
    .filter(
      (item, index, items) =>
        item.href !== "/dashboard" && items.findIndex((candidate) => candidate.href === item.href) === index
    );

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-medium text-primary">School Management System</p>
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {profile.full_name} • {primaryRoleLabel}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isSuperAdmin ? <RolePreviewSwitcher /> : null}
            <form action={logout}>
              <button className="rounded-md bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[240px_1fr]">
        <nav className="rounded-lg border bg-card p-3">
          {[
            { label: "Overview", href: "/dashboard" },
            ...(isSuperAdmin ? [{ label: "Admin panel", href: "/admin" }] : []),
            ...roleLinks,
            { label: "Students", href: "/dashboard" },
            { label: "Guardians", href: "/dashboard" },
            { label: "Fees", href: "/dashboard" },
            { label: "Payments", href: "/dashboard" },
            { label: "Reports", href: "/dashboard" }
          ].map((item) => (
            <Link
              className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              href={item.href}
              key={item.label}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <section className="grid gap-6">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-2xl font-semibold">Authentication & school setup</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              This shell is ready for Supabase Auth, school onboarding, profile creation, and
              default system initialization.
            </p>
            {isSuperAdmin ? (
              <Link
                className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                href="/admin"
              >
                <ShieldCheck className="size-4" aria-hidden="true" />
                Open admin panel
              </Link>
            ) : null}
          </div>

          {school ? (
            <div className="rounded-lg border bg-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-primary">School workspace</p>
                  <h2 className="mt-1 text-2xl font-semibold">{school.name}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {school.code ?? "No code"} • {school.email ?? "No email"} •{" "}
                    {school.phone ?? "No phone"}
                  </p>
                </div>
                <span className="rounded-md bg-secondary px-3 py-1 text-sm font-medium capitalize text-secondary-foreground">
                  {school.status}
                </span>
              </div>
            </div>
          ) : null}

          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold">Active roles</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              These roles come from the RBAC assignments when available, with `profiles.role` as a
              fallback.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {roles.map((role) => (
                <span
                  className="rounded-md bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground"
                  key={`${role.role}-${role.schoolId ?? "platform"}`}
                >
                  {role.displayName}
                  {role.schoolId ? "" : " • Platform"}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
              const Icon = card.icon;

              return (
                <article className="rounded-lg border bg-card p-5" key={card.title}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                    <Icon className="size-5 text-primary" aria-hidden="true" />
                  </div>
                  <p className="mt-4 text-2xl font-semibold">{card.value}</p>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
