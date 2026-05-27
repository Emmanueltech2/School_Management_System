import { RoleDashboardShell } from "../_components/role-dashboard-shell";
import { requireAnyRole } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type DashboardPageProps = {
  searchParams: Promise<{
    section?: string;
  }>;
};

export default async function TeacherDashboardPage({ searchParams }: DashboardPageProps) {
  const session = await requireAnyRole(["teacher"]);
  const params = await searchParams;

  return (
    <RoleDashboardShell
      session={session}
      currentPath="/dashboard/teacher"
      selectedSection={params.section}
      eyebrow="Teacher workspace"
      title="Teacher dashboard"
      description="Access assigned classes, student records, academic tasks, attendance, and marks entry."
      sidebarModules={[
        { label: "Dashboard", href: "/dashboard/teacher", icon: "dashboard" },
        { label: "Classes", href: "/dashboard/teacher", icon: "students" },
        { label: "Subjects", href: "/dashboard/teacher", icon: "academics" },
        { label: "Attendance", href: "/dashboard/teacher", icon: "attendance" },
        { label: "Exams", href: "/dashboard/teacher", icon: "reports" },
        { label: "Timetable", href: "/dashboard/teacher", icon: "calendar" },
        { label: "Reports", href: "/dashboard/teacher", icon: "reports" }
      ]}
      metrics={[
        { label: "Assigned classes", value: "0", change: "Timetable pending", icon: "academics" },
        { label: "Students", value: "0", change: "Class roster will sync", icon: "students" },
        { label: "Attendance", value: "Ready", change: "Module placeholder", icon: "attendance" },
        { label: "Assessments", value: "0", change: "Marks entry planned", icon: "reports" }
      ]}
      modules={[
        {
          title: "Assigned classes",
          description: "View class lists, class teacher responsibilities, and student rosters.",
          icon: "students"
        },
        {
          title: "Subjects",
          description: "Manage subject-specific teaching tasks and learning records.",
          icon: "academics"
        },
        {
          title: "Attendance",
          description: "Mark attendance and review daily participation trends.",
          icon: "attendance"
        },
        {
          title: "Marks entry",
          description: "Enter assessment scores and prepare academic reports.",
          icon: "reports"
        }
      ]}
      activity={[
        "Assign teacher to classes and subjects.",
        "Prepare attendance entry for class sessions.",
        "Create assessment entry screens for exams."
      ]}
    />
  );
}
