import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Settings,
  UserPlus,
  UserRound,
  Users
} from "lucide-react";

const adminNavItems = [
  { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
  { label: "School Profile", href: "/dashboard/admin?section=school-profile", icon: Settings },
  { label: "Admissions", href: "/dashboard/admin/admissions", icon: UserPlus },
  { label: "Students", href: "/dashboard/admin?section=students", icon: Users },
  { label: "Staff Users", href: "/dashboard/admin?section=staff-users", icon: UserRound },
  { label: "Classes", href: "/dashboard/admin?section=classes", icon: BookOpen },
  { label: "Attendance", href: "/dashboard/admin?section=attendance", icon: ClipboardList },
  { label: "Reports", href: "/dashboard/admin?section=reports", icon: BarChart3 }
];

type AdminSidebarProps = {
  activeHref: string;
  subtitle?: string;
};

export function AdminSidebar({ activeHref, subtitle = "School admin" }: AdminSidebarProps) {
  return (
    <aside className="hidden border-r bg-white px-4 py-5 lg:block">
      <Link className="mb-7 flex items-center gap-3 px-2" href="/dashboard/admin">
        <div className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <GraduationCap className="size-6" aria-hidden="true" />
        </div>
        <div>
          <p className="text-base font-semibold">Elite Soft SMS</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </Link>

      <div className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        School admin
      </div>
      <nav className="grid gap-1">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === activeHref;

          return (
            <Link
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
              href={item.href}
              key={item.href}
            >
              <Icon className="size-4" aria-hidden="true" />
              {item.label}
              {isActive ? <span className="ml-auto size-1.5 rounded-full bg-white" /> : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
