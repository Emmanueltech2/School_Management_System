import Link from "next/link";
import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Filter,
  GraduationCap,
  Home,
  LayoutDashboard,
  Plus,
  Search,
  Settings,
  UserRound,
  Users
} from "lucide-react";
import { logout } from "@/app/actions";
import { hasActiveRole, type SessionProfile } from "@/lib/auth/session";
import { RolePreviewSwitcher } from "./role-preview-switcher";

type DashboardMetric = {
  label: string;
  value: string;
  change: string;
  icon: DashboardIcon;
};

type DashboardModule = {
  title: string;
  description: string;
  icon: DashboardIcon;
};

type SidebarModule = {
  label: string;
  href: string;
  icon: DashboardIcon;
};

type DashboardIcon =
  | "students"
  | "finance"
  | "academics"
  | "attendance"
  | "calendar"
  | "reports"
  | "settings"
  | "dashboard"
  | "profile";

type RoleDashboardShellProps = {
  session: SessionProfile;
  currentPath: string;
  selectedSection?: string;
  eyebrow: string;
  title: string;
  description: string;
  sidebarModules: SidebarModule[];
  metrics: DashboardMetric[];
  modules: DashboardModule[];
  activity: string[];
};

const iconMap = {
  academics: BookOpen,
  attendance: ClipboardList,
  calendar: CalendarDays,
  dashboard: LayoutDashboard,
  finance: CreditCard,
  profile: UserRound,
  reports: BarChart3,
  settings: Settings,
  students: Users
};

function toSectionKey(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function getModuleRows(moduleLabel: string) {
  return [
    {
      name: `${moduleLabel} setup`,
      owner: "System",
      status: "Ready",
      note: "Interface prepared"
    },
    {
      name: `${moduleLabel} records`,
      owner: "School team",
      status: "Pending",
      note: "Awaiting real data"
    },
    {
      name: `${moduleLabel} reports`,
      owner: "Admin",
      status: "Planned",
      note: "Reports placeholder"
    }
  ];
}

export function RoleDashboardShell({
  session,
  currentPath,
  selectedSection,
  eyebrow,
  title,
  description,
  sidebarModules,
  metrics,
  modules,
  activity
}: RoleDashboardShellProps) {
  const canPreviewRoles = hasActiveRole(session.roles, "super_admin");
  const activeSection = selectedSection ?? toSectionKey(sidebarModules[0]?.label ?? "dashboard");
  const selectedModule =
    sidebarModules.find((module) => toSectionKey(module.label) === activeSection) ??
    sidebarModules[0];
  const selectedModuleDetail = modules.find(
    (module) => toSectionKey(module.title) === toSectionKey(selectedModule?.label ?? "")
  );
  const SelectedIcon = selectedModule ? iconMap[selectedModule.icon] : LayoutDashboard;
  const isDashboardSection = activeSection === "dashboard";
  const moduleRows = getModuleRows(selectedModule?.label ?? "Module");

  return (
    <main className="min-h-screen bg-[#f6f8fb]">
      <div className="mx-auto grid min-h-screen max-w-[1500px] lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r bg-white px-4 py-5 lg:block">
          <Link className="mb-7 flex items-center gap-3 px-2" href="/dashboard">
            <div className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="size-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-base font-semibold">Elite Soft SMS</p>
              <p className="text-xs text-muted-foreground">Education ERP</p>
            </div>
          </Link>

          <div className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Main menu
          </div>
          <nav className="grid gap-1">
            {sidebarModules.map((item) => {
              const Icon = iconMap[item.icon];
              const sectionKey = toSectionKey(item.label);
              const opensAnotherPage = item.href !== currentPath;
              const isActive = opensAnotherPage ? item.href === currentPath : sectionKey === activeSection;

              return (
                <Link
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                  href={opensAnotherPage ? item.href : `${currentPath}?section=${sectionKey}`}
                  key={`${item.href}-${sectionKey}`}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {item.label}
                  {isActive ? <span className="ml-auto size-1.5 rounded-full bg-white" /> : null}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-lg border bg-secondary/50 p-4">
            <p className="text-sm font-semibold">Current user</p>
            <p className="mt-1 text-sm text-muted-foreground">{session.profile.full_name}</p>
            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-primary">
              <Home className="size-3.5" aria-hidden="true" />
              {session.profile.school_id ? "School scoped" : "Platform scoped"}
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-foreground p-4 text-white">
            <p className="text-sm font-semibold">Development mode</p>
            <p className="mt-2 text-xs leading-5 text-white/70">
              Module previews are interactive placeholders for layout and workflow planning.
            </p>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="text-sm font-medium text-primary">{eyebrow}</p>
                <h1 className="text-xl font-semibold">{title}</h1>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="hidden h-10 items-center gap-2 rounded-md border bg-white px-3 text-sm text-muted-foreground md:flex">
                  <Search className="size-4" aria-hidden="true" />
                  Search modules
                </div>
                {canPreviewRoles ? <RolePreviewSwitcher currentPath={currentPath} /> : null}
                <button
                  className="flex size-10 items-center justify-center rounded-md border bg-white text-muted-foreground hover:text-foreground"
                  type="button"
                >
                  <Bell className="size-4" aria-hidden="true" />
                </button>
                <form action={logout}>
                  <button className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-white hover:bg-foreground/90">
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          </header>

          <div className="grid gap-6 px-5 py-6">
            <div className="grid gap-4 xl:grid-cols-[1.5fr_0.8fr]">
              <div className="rounded-lg border bg-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-3xl">
                    <p className="text-sm font-medium text-primary">{eyebrow}</p>
                    <h2 className="mt-2 text-2xl font-semibold">
                      {isDashboardSection ? title : selectedModule?.label}
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                      {isDashboardSection
                        ? description
                        : selectedModuleDetail?.description ??
                          `${selectedModule?.label} workspace preview for this role.`}
                    </p>
                  </div>
                  <div className="rounded-lg bg-primary/10 p-3 text-primary">
                    {isDashboardSection ? (
                      <UserRound className="size-6" aria-hidden="true" />
                    ) : (
                      <SelectedIcon className="size-6" aria-hidden="true" />
                    )}
                  </div>
                </div>
                {!isDashboardSection ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                      type="button"
                    >
                      <Plus className="size-4" aria-hidden="true" />
                      New record
                    </button>
                    <button
                      className="inline-flex items-center gap-2 rounded-md border bg-white px-4 py-2 text-sm font-medium hover:bg-secondary"
                      type="button"
                    >
                      <Filter className="size-4" aria-hidden="true" />
                      Filter
                    </button>
                    <button
                      className="inline-flex items-center gap-2 rounded-md border bg-white px-4 py-2 text-sm font-medium hover:bg-secondary"
                      type="button"
                    >
                      <BarChart3 className="size-4" aria-hidden="true" />
                      Reports
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="rounded-lg border bg-card p-6">
                <p className="text-sm font-medium text-muted-foreground">
                  {isDashboardSection ? "Today" : "Selected module"}
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {isDashboardSection ? "Workspace ready" : selectedModule?.label}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {isDashboardSection
                    ? "This role area is prepared for real data, permissions, and workflows."
                    : "This area will become a dedicated module page as we build the feature."}
                </p>
                {!isDashboardSection ? (
                  <div className="mt-4 h-2 rounded-full bg-secondary">
                    <div className="h-2 w-2/3 rounded-full bg-primary" />
                  </div>
                ) : null}
              </div>
            </div>

            {isDashboardSection ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => {
                  const Icon = iconMap[metric.icon];

                  return (
                    <article className="rounded-lg border bg-card p-5" key={metric.label}>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="size-5" aria-hidden="true" />
                        </div>
                      </div>
                      <p className="mt-4 text-2xl font-semibold">{metric.value}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{metric.change}</p>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {["Records", "Pending tasks", "Reports", "Settings"].map((item, index) => (
                  <article className="rounded-lg border bg-card p-5" key={item}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-muted-foreground">{item}</p>
                      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <SelectedIcon className="size-5" aria-hidden="true" />
                      </div>
                    </div>
                    <p className="mt-4 text-2xl font-semibold">{index === 0 ? "0" : "Ready"}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedModule?.label} module placeholder
                    </p>
                  </article>
                ))}
              </div>
            )}

            <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
              <div className="rounded-lg border bg-card p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {isDashboardSection ? "Modules" : `${selectedModule?.label} preview`}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {isDashboardSection
                        ? "Role-specific areas ready for implementation."
                        : "Focused representation of this module before we build the full workflow."}
                    </p>
                  </div>
                  <Link
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary"
                    href="/dashboard"
                  >
                    Overview
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {(isDashboardSection
                    ? modules
                    : [
                        {
                          title: `${selectedModule?.label} overview`,
                          description:
                            selectedModuleDetail?.description ??
                            "Summary cards, filters, and important records will live here.",
                          icon: selectedModule?.icon ?? "dashboard"
                        },
                        {
                          title: "Recent records",
                          description:
                            "A table-style area for newest entries, statuses, and quick actions.",
                          icon: "reports"
                        }
                      ]).map((module) => {
                    const Icon = iconMap[module.icon as DashboardIcon];

                    return (
                      <article className="rounded-lg border bg-white p-5" key={module.title}>
                        <div className="flex items-start gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                            <Icon className="size-5" aria-hidden="true" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{module.title}</h3>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                              {module.description}
                            </p>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {!isDashboardSection ? (
                  <div className="mt-5 overflow-hidden rounded-lg border">
                    <div className="grid grid-cols-[1.2fr_0.8fr_0.7fr_1fr] bg-secondary px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <span>Item</span>
                      <span>Owner</span>
                      <span>Status</span>
                      <span>Note</span>
                    </div>
                    {moduleRows.map((row) => (
                      <div
                        className="grid grid-cols-[1.2fr_0.8fr_0.7fr_1fr] gap-3 border-t bg-white px-4 py-4 text-sm"
                        key={row.name}
                      >
                        <span className="font-medium">{row.name}</span>
                        <span className="text-muted-foreground">{row.owner}</span>
                        <span>
                          <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                            {row.status}
                          </span>
                        </span>
                        <span className="text-muted-foreground">{row.note}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <aside className="grid gap-6">
                <div className="rounded-lg border bg-card p-6">
                  <h2 className="text-lg font-semibold">Activity queue</h2>
                  <div className="mt-4 grid gap-3">
                    {activity.map((item) => (
                      <div className="flex gap-3 rounded-md bg-secondary/60 p-3" key={item}>
                        <span className="mt-1 size-2 rounded-full bg-primary" />
                        <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border bg-card p-6">
                  <h2 className="text-lg font-semibold">Role access</h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {session.roles.map((role) => (
                      <span
                        className="rounded-md bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground"
                        key={`${role.role}-${role.schoolId ?? "platform"}`}
                      >
                        {role.displayName}
                      </span>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
