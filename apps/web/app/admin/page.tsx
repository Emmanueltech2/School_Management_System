import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  ClipboardList,
  MailPlus,
  ShieldCheck,
  Users
} from "lucide-react";
import { AssignSchoolAdminForm } from "./assign-school-admin-form";
import { InviteSchoolAdminForm } from "./invite-school-admin-form";
import { logout } from "@/app/actions";
import { requireSuperAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { RolePreviewSwitcher } from "@/app/dashboard/_components/role-preview-switcher";

export const dynamic = "force-dynamic";

const setupSteps = [
  "Create school record",
  "Invite school administrator",
  "Link admin profile to school",
  "Prepare default payment methods",
  "Prepare invoice and receipt sequences"
];

const previewLinks = [
  { label: "School Admin", href: "/dashboard/admin" },
  { label: "Finance", href: "/dashboard/finance" },
  { label: "Teacher", href: "/dashboard/teacher" },
  { label: "Parent", href: "/dashboard/parent" },
  { label: "Student", href: "/dashboard/student" }
];

type School = {
  id: string;
  name: string;
  code: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  created_at: string | null;
};

type SchoolOption = {
  id: string;
  name: string;
  code: string | null;
};

type SchoolAdminProfile = {
  school_id: string | null;
  profiles:
    | {
        full_name: string;
        phone: string | null;
      }
    | {
        full_name: string;
        phone: string | null;
      }[]
    | null;
};

async function getAdminOverview() {
  const supabase = createAdminClient();

  const [
    { data: schools, error: schoolsError },
    { data: schoolAdmins, error: adminsError },
    { count: totalSchools, error: totalError },
    { count: pendingSchools, error: pendingError },
    { data: schoolOptions, error: schoolOptionsError }
  ] = await Promise.all([
      supabase
        .from("schools")
        .select("id, name, code, email, phone, status, created_at")
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("user_roles")
        .select("school_id, profiles!user_roles_user_id_fkey(full_name, phone), roles!inner(name)")
        .eq("is_active", true)
        .eq("roles.name", "school_admin"),
      supabase.from("schools").select("id", { count: "exact", head: true }),
      supabase.from("schools").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("schools").select("id, name, code").order("name", { ascending: true })
    ]);

  if (schoolsError) {
    throw schoolsError;
  }

  if (adminsError) {
    throw adminsError;
  }

  if (totalError) {
    throw totalError;
  }

  if (pendingError) {
    throw pendingError;
  }

  if (schoolOptionsError) {
    throw schoolOptionsError;
  }

  const schoolRows = (schools ?? []) as School[];
  const schoolOptionRows = (schoolOptions ?? []) as SchoolOption[];
  const adminRows = (schoolAdmins ?? []) as unknown as SchoolAdminProfile[];
  const adminBySchool = new Map(
    adminRows
      .filter((admin) => admin.school_id)
      .map((admin) => [
        admin.school_id as string,
        Array.isArray(admin.profiles) ? (admin.profiles[0] ?? null) : admin.profiles
      ])
  );

  return {
    schools: schoolRows,
    schoolOptions: schoolOptionRows,
    schoolAdmins: adminBySchool,
    stats: {
      totalSchools: totalSchools ?? schoolRows.length,
      pendingSchools:
        pendingSchools ?? schoolRows.filter((school) => school.status === "pending").length,
      assignedAdmins: adminRows.length
    }
  };
}

export default async function AdminPage() {
  const { profile, roles } = await requireSuperAdmin();
  const { schools, schoolOptions, schoolAdmins, stats } = await getAdminOverview();

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
            <RolePreviewSwitcher />
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
          <div className="rounded-lg border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-primary">Development preview</p>
                <h2 className="mt-1 text-2xl font-semibold">Role dashboard interfaces</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Use these links to preview the new Edudash-inspired role workspaces without
                  changing your real super admin account.
                </p>
              </div>
              <RolePreviewSwitcher />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {previewLinks.map((item) => (
                <Link
                  className="rounded-lg border bg-white p-4 text-sm font-semibold transition hover:border-primary hover:text-primary"
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                  <span className="mt-1 block text-xs font-normal text-muted-foreground">
                    Open preview
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: "Schools created", value: String(stats.totalSchools), icon: Building2 },
              { title: "Schools pending", value: String(stats.pendingSchools), icon: MailPlus },
              { title: "School admins", value: String(stats.assignedAdmins), icon: Users }
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

          <div className="rounded-lg border bg-card p-6">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Assign admin to existing school</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Use this when a school already exists and you need to add another school admin or
                  link an existing user to that school.
                </p>
              </div>
              <div className="hidden rounded-md bg-secondary px-3 py-2 text-sm font-medium text-muted-foreground md:block">
                Existing school
              </div>
            </div>

            <AssignSchoolAdminForm schools={schoolOptions} />
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Recent schools</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Schools created from this panel and their first administrator assignment.
                </p>
              </div>
              <ClipboardList className="size-5 text-primary" aria-hidden="true" />
            </div>

            {schools.length > 0 ? (
              <div className="overflow-x-auto rounded-md border">
                <div className="min-w-[760px]">
                  <div className="grid grid-cols-[1.4fr_0.8fr_1fr_0.7fr] bg-secondary px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <span>School</span>
                    <span>Status</span>
                    <span>School admin</span>
                    <span>Contact</span>
                  </div>
                  {schools.map((school) => {
                    const admin = schoolAdmins.get(school.id);

                    return (
                      <div
                        className="grid grid-cols-[1.4fr_0.8fr_1fr_0.7fr] gap-3 border-t px-4 py-4 text-sm"
                        key={school.id}
                      >
                        <div>
                          <p className="font-medium">{school.name}</p>
                          <p className="text-muted-foreground">{school.code ?? "No code yet"}</p>
                        </div>
                        <div>
                          <span className="rounded-md bg-secondary px-2.5 py-1 text-xs font-medium capitalize text-secondary-foreground">
                            {school.status}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{admin?.full_name ?? "Not assigned"}</p>
                          <p className="text-muted-foreground">
                            {school.email ?? "No school email"}
                          </p>
                        </div>
                        <p className="text-muted-foreground">
                          {school.phone ?? admin?.phone ?? "No phone"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
                No schools have been created yet. Use the invite form above to create the first
                school and school admin.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
