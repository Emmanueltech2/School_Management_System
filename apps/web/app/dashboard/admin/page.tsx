import { RoleDashboardShell } from "../_components/role-dashboard-shell";
import { requireAnyRole } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type DashboardPageProps = {
  searchParams: Promise<{
    section?: string;
  }>;
};

export default async function SchoolAdminDashboardPage({ searchParams }: DashboardPageProps) {
  const session = await requireAnyRole(["school_admin"]);
  const params = await searchParams;

  return (
    <RoleDashboardShell
      session={session}
      currentPath="/dashboard/admin"
      selectedSection={params.section}
      eyebrow="School workspace"
      title="School admin dashboard"
      description="Manage school setup, staff, students, academic structure, and operational settings for one school."
      sidebarModules={[
        { label: "Dashboard", href: "/dashboard/admin", icon: "dashboard" },
        { label: "School Profile", href: "/dashboard/admin?section=school-profile", icon: "settings" },
        { label: "Admissions", href: "/dashboard/admin/admissions", icon: "students" },
        { label: "Students", href: "/dashboard/admin?section=students", icon: "students" },
        { label: "Staff Users", href: "/dashboard/admin?section=staff-users", icon: "profile" },
        { label: "Classes", href: "/dashboard/admin?section=classes", icon: "academics" },
        { label: "Attendance", href: "/dashboard/admin?section=attendance", icon: "attendance" },
        { label: "Reports", href: "/dashboard/admin?section=reports", icon: "reports" }
      ]}
      metrics={[
        { label: "Students", value: "0", change: "Ready for admissions", icon: "students" },
        { label: "Staff users", value: "0", change: "Invite teachers and officers", icon: "academics" },
        { label: "Classes", value: "0", change: "Create classes and streams", icon: "attendance" },
        { label: "Setup status", value: "Ready", change: "School onboarding shell", icon: "reports" }
      ]}
      modules={[
        {
          title: "School profile",
          description: "Maintain official school identity, contacts, status, and setup details.",
          icon: "settings"
        },
        {
          title: "Staff users",
          description: "Invite teachers, finance officers, registrars, and support staff.",
          icon: "students"
        },
        {
          title: "Classes and streams",
          description: "Build the academic structure that students and teachers attach to.",
          icon: "academics"
        },
        {
          title: "Reports",
          description: "Prepare operational visibility across students, finance, and academics.",
          icon: "reports"
        }
      ]}
      activity={[
        "Confirm school profile fields and branding assets.",
        "Create classes, streams, and academic year structure.",
        "Invite the first teachers and finance officers."
      ]}
    />
  );
}
