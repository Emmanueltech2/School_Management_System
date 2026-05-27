import { RoleDashboardShell } from "../_components/role-dashboard-shell";
import { requireAnyRole } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type DashboardPageProps = {
  searchParams: Promise<{
    section?: string;
  }>;
};

export default async function ParentDashboardPage({ searchParams }: DashboardPageProps) {
  const session = await requireAnyRole(["parent"]);
  const params = await searchParams;

  return (
    <RoleDashboardShell
      session={session}
      currentPath="/dashboard/parent"
      selectedSection={params.section}
      eyebrow="Guardian workspace"
      title="Parent dashboard"
      description="View linked students, fee balances, attendance, academic progress, and school communication."
      sidebarModules={[
        { label: "Dashboard", href: "/dashboard/parent", icon: "dashboard" },
        { label: "Children", href: "/dashboard/parent", icon: "students" },
        { label: "School Fees", href: "/dashboard/parent", icon: "finance" },
        { label: "Attendance", href: "/dashboard/parent", icon: "attendance" },
        { label: "Exams", href: "/dashboard/parent", icon: "reports" },
        { label: "Messages", href: "/dashboard/parent", icon: "calendar" },
        { label: "Profile", href: "/dashboard/parent", icon: "profile" }
      ]}
      metrics={[
        { label: "Linked students", value: "0", change: "Guardian links pending", icon: "students" },
        { label: "Fee balance", value: "KES 0", change: "No statement generated", icon: "finance" },
        { label: "Attendance", value: "Ready", change: "Visibility planned", icon: "attendance" },
        { label: "Messages", value: "0", change: "Communication module pending", icon: "reports" }
      ]}
      modules={[
        {
          title: "Linked students",
          description: "See children connected to this guardian profile.",
          icon: "students"
        },
        {
          title: "Fee balances",
          description: "Review balances, invoices, receipts, and payment history.",
          icon: "finance"
        },
        {
          title: "Attendance",
          description: "Track daily attendance and school participation.",
          icon: "attendance"
        },
        {
          title: "Report cards",
          description: "View academic progress once exams and grading are enabled.",
          icon: "reports"
        }
      ]}
      activity={[
        "Link guardian profiles to students.",
        "Expose fee statement views for guardians.",
        "Prepare school communication and notification history."
      ]}
    />
  );
}
