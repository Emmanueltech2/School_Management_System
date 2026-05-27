import { RoleDashboardShell } from "../_components/role-dashboard-shell";
import { requireAnyRole } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type DashboardPageProps = {
  searchParams: Promise<{
    section?: string;
  }>;
};

export default async function StudentDashboardPage({ searchParams }: DashboardPageProps) {
  const session = await requireAnyRole(["student"]);
  const params = await searchParams;

  return (
    <RoleDashboardShell
      session={session}
      currentPath="/dashboard/student"
      selectedSection={params.section}
      eyebrow="Student workspace"
      title="Student dashboard"
      description="View timetable, assignments, attendance, results, and personal school information."
      sidebarModules={[
        { label: "Dashboard", href: "/dashboard/student", icon: "dashboard" },
        { label: "School Fees", href: "/dashboard/student", icon: "finance" },
        { label: "Exams", href: "/dashboard/student", icon: "reports" },
        { label: "Attendance", href: "/dashboard/student", icon: "attendance" },
        { label: "Timetable", href: "/dashboard/student", icon: "calendar" },
        { label: "Subjects", href: "/dashboard/student", icon: "academics" },
        { label: "Profile", href: "/dashboard/student", icon: "profile" }
      ]}
      metrics={[
        { label: "Subjects", value: "0", change: "Subject assignments pending", icon: "academics" },
        { label: "Attendance", value: "Ready", change: "Student view planned", icon: "attendance" },
        { label: "Assignments", value: "0", change: "Future LMS support", icon: "calendar" },
        { label: "Results", value: "0", change: "Exam module pending", icon: "reports" }
      ]}
      modules={[
        {
          title: "Timetable",
          description: "View daily classes and upcoming school events.",
          icon: "calendar"
        },
        {
          title: "Assignments",
          description: "Track work assigned by teachers once LMS features are enabled.",
          icon: "academics"
        },
        {
          title: "Attendance",
          description: "Review attendance records and participation history.",
          icon: "attendance"
        },
        {
          title: "Results",
          description: "Access exam results and report cards after grading workflows are built.",
          icon: "reports"
        }
      ]}
      activity={[
        "Connect student portal to class enrollment.",
        "Prepare timetable and academic result views.",
        "Expose fee statement view when finance data exists."
      ]}
    />
  );
}
