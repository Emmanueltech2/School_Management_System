import Link from "next/link";
import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FileText,
  Filter,
  GraduationCap,
  Home,
  LayoutDashboard,
  Menu,
  Moon,
  Plus,
  ReceiptText,
  Search,
  Settings,
  UserRound,
  Users
} from "lucide-react";
import { logout } from "@/app/actions";
import { hasActiveRole, requireAnyRole } from "@/lib/auth/session";
import { RolePreviewSwitcher } from "../_components/role-preview-switcher";

export const dynamic = "force-dynamic";

type DashboardPageProps = {
  searchParams: Promise<{
    section?: string;
  }>;
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

type SidebarModule = {
  label: string;
  href: string;
  icon: DashboardIcon;
};

const sidebarModules: SidebarModule[] = [
  { label: "Dashboard", href: "/dashboard/finance", icon: "dashboard" },
  { label: "School Fees", href: "/dashboard/finance", icon: "finance" },
  { label: "Invoices", href: "/dashboard/finance", icon: "reports" },
  { label: "Payments", href: "/dashboard/finance", icon: "calendar" },
  { label: "Receipts", href: "/dashboard/finance", icon: "attendance" },
  { label: "MPesa", href: "/dashboard/finance", icon: "finance" },
  { label: "Reports", href: "/dashboard/finance", icon: "reports" }
];

const metrics = [
  { label: "Collected", value: "KES 0", change: "No payments recorded yet", icon: "finance" },
  { label: "Outstanding", value: "KES 0", change: "Balances will appear here", icon: "reports" },
  { label: "Receipts", value: "0", change: "Receipt sequence is ready", icon: "attendance" },
  { label: "MPesa", value: "Ready", change: "Integration module planned", icon: "calendar" }
] satisfies Array<{ label: string; value: string; change: string; icon: DashboardIcon }>;

const modules = [
  {
    title: "Fee invoices",
    description: "Generate term invoices and line items for students and classes.",
    icon: "finance"
  },
  {
    title: "Payments",
    description: "Record cash, bank, cheque, and MPesa payments against invoices.",
    icon: "calendar"
  },
  {
    title: "MPesa reconciliation",
    description: "Review transactions and match them to student accounts.",
    icon: "reports"
  },
  {
    title: "Balances",
    description: "Track outstanding amounts, overpayments, and statements.",
    icon: "students"
  }
] satisfies Array<{ title: string; description: string; icon: DashboardIcon }>;

const activity = [
  "Set fee items for the active term.",
  "Prepare invoice generation workflow.",
  "Connect MPesa callback and reconciliation screens."
];

const iconMap = {
  academics: FileText,
  attendance: ReceiptText,
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

export default async function FinanceDashboardPage({ searchParams }: DashboardPageProps) {
  const session = await requireAnyRole(["finance_officer", "bursar"]);
  const params = await searchParams;
  const canPreviewRoles = hasActiveRole(session.roles, "super_admin");
  const activeSection = params.section ?? toSectionKey(sidebarModules[0].label);
  const selectedModule =
    sidebarModules.find((module) => toSectionKey(module.label) === activeSection) ?? sidebarModules[0];
  const selectedModuleDetail = modules.find(
    (module) => toSectionKey(module.title) === toSectionKey(selectedModule.label)
  );
  const SelectedIcon = iconMap[selectedModule.icon];
  const isDashboardSection = activeSection === "dashboard";
  const moduleRows = getModuleRows(selectedModule.label);
  const initials = session.profile.full_name
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-slate-950">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <Link className="flex h-[76px] items-center gap-3 border-b border-slate-200 px-6" href="/dashboard">
            <div className="flex size-10 items-center justify-center rounded-md bg-emerald-600 text-white">
              <GraduationCap className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-base font-semibold">Elite Soft SMS</p>
              <p className="text-xs font-medium text-slate-500">Education ERP</p>
            </div>
          </Link>

          <nav className="flex-1 overflow-y-auto px-3 py-5">
            <p className="mb-2 px-3 text-xs font-semibold uppercase text-slate-400">Main menu</p>
            <div className="grid gap-1">
              {sidebarModules.map((item) => {
                const Icon = iconMap[item.icon];
                const sectionKey = toSectionKey(item.label);
                const isActive = sectionKey === activeSection;

                return (
                  <Link
                    className={`flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition ${
                      isActive
                        ? "border-l-4 border-emerald-500 bg-white text-slate-950 shadow-sm ring-1 ring-slate-200"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                    }`}
                    href={`${item.href}?section=${sectionKey}`}
                    key={`${item.href}-${sectionKey}`}
                  >
                    <Icon className={`size-4 ${isActive ? "text-emerald-600" : "text-slate-500"}`} />
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {isActive ? <span className="size-1.5 rounded-full bg-emerald-500" /> : null}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="m-3 grid gap-3">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold">Current user</p>
              <p className="mt-1 text-sm text-slate-600">{session.profile.full_name}</p>
              <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <Home className="size-3.5" aria-hidden="true" />
                {session.profile.school_id ? "School scoped" : "Platform scoped"}
              </div>
            </div>

            <div className="rounded-md bg-slate-950 p-4 text-white">
              <p className="text-sm font-semibold">Development mode</p>
              <p className="mt-2 text-xs leading-5 text-white/70">
                Module previews are interactive placeholders for layout and workflow planning.
              </p>
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="flex h-[76px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <button
                  className="flex size-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 lg:hidden"
                  type="button"
                >
                  <Menu className="size-5" aria-hidden="true" />
                </button>
                <div>
                  <p className="text-sm font-medium text-emerald-700">Finance workspace</p>
                  <h1 className="text-xl font-bold">Finance dashboard</h1>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden h-10 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 md:flex">
                  <Search className="size-4" aria-hidden="true" />
                  Search modules
                </div>
                {canPreviewRoles ? <RolePreviewSwitcher currentPath="/dashboard/finance" /> : null}
                <button className="flex size-10 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100" type="button">
                  <Bell className="size-5" aria-hidden="true" />
                </button>
                <button className="flex size-10 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100" type="button">
                  <Moon className="size-5" aria-hidden="true" />
                </button>
                <div className="hidden items-center gap-3 px-2 py-1.5 sm:flex">
                  <div className="flex size-10 items-center justify-center rounded-md bg-emerald-50 text-sm font-bold text-emerald-700">
                    {initials}
                  </div>
                  <div className="leading-4">
                    <p className="text-sm font-semibold">{session.profile.full_name}</p>
                    <p className="text-xs font-medium text-slate-500">Finance workspace</p>
                  </div>
                  <ChevronDown className="size-4 text-slate-400" />
                </div>
                <form action={logout}>
                  <button className="hidden rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:block">
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          </header>

          <div className="grid gap-7 px-4 py-6 sm:px-6 lg:px-8">
            <section>
              <p className="text-sm font-medium text-slate-500">Finance workspace</p>
              <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold tracking-normal text-slate-950">
                    {isDashboardSection ? "Finance dashboard" : selectedModule.label}
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                    {isDashboardSection
                      ? "Prepare fee invoices, record payments, reconcile MPesa transactions, and generate receipts."
                      : selectedModuleDetail?.description ??
                        `${selectedModule.label} workspace preview for this role.`}
                  </p>
                </div>
                {!isDashboardSection ? (
                  <div className="flex flex-wrap gap-2">
                    <button className="inline-flex h-10 items-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700" type="button">
                      <Plus className="size-4" aria-hidden="true" />
                      New record
                    </button>
                    <button className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50" type="button">
                      <Filter className="size-4" aria-hidden="true" />
                      Filter
                    </button>
                    <button className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50" type="button">
                      <BarChart3 className="size-4" aria-hidden="true" />
                      Reports
                    </button>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="grid gap-6 border-b border-slate-200 p-6 xl:grid-cols-[1fr_auto]">
                <div className="flex items-start gap-4">
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                    {isDashboardSection ? (
                      <UserRound className="size-8" aria-hidden="true" />
                    ) : (
                      <SelectedIcon className="size-8" aria-hidden="true" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-400">
                      {isDashboardSection ? "Finance workspace" : "Selected module"}
                    </p>
                    <h3 className="mt-2 text-2xl font-bold">
                      {isDashboardSection ? session.profile.full_name : selectedModule.label}
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {session.roles.map((role) => (
                        <span
                          className="rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                          key={`${role.role}-${role.schoolId ?? "platform"}`}
                        >
                          {role.displayName}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4 xl:min-w-[280px]">
                  <p className="text-sm font-semibold text-slate-500">
                    {isDashboardSection ? "Today" : "Selected module"}
                  </p>
                  <p className="mt-2 text-2xl font-bold">
                    {isDashboardSection ? "Workspace ready" : selectedModule.label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {isDashboardSection
                      ? "This role area is prepared for real data, permissions, and workflows."
                      : "This area will become a dedicated module page as we build the feature."}
                  </p>
                  {!isDashboardSection ? (
                    <div className="mt-4 h-2 rounded-full bg-slate-200">
                      <div className="h-2 w-2/3 rounded-full bg-emerald-600" />
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
                {(isDashboardSection
                  ? metrics
                  : [
                      { label: "Records", value: "0", change: `${selectedModule.label} module placeholder`, icon: selectedModule.icon },
                      { label: "Pending tasks", value: "Ready", change: `${selectedModule.label} module placeholder`, icon: selectedModule.icon },
                      { label: "Reports", value: "Ready", change: `${selectedModule.label} module placeholder`, icon: selectedModule.icon },
                      { label: "Settings", value: "Ready", change: `${selectedModule.label} module placeholder`, icon: selectedModule.icon }
                    ]).map((metric) => {
                  const Icon = iconMap[metric.icon];

                  return (
                    <article className="rounded-md border border-slate-200 bg-slate-50 p-5" key={metric.label}>
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-500">{metric.label}</p>
                        <div className="flex size-10 items-center justify-center rounded-md bg-white text-emerald-700 shadow-sm">
                          <Icon className="size-5" aria-hidden="true" />
                        </div>
                      </div>
                      <p className="mt-4 text-2xl font-bold">{metric.value}</p>
                      <p className="mt-1 text-sm text-slate-500">{metric.change}</p>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold">
                      {isDashboardSection ? "Modules" : `${selectedModule.label} preview`}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {isDashboardSection
                        ? "Role-specific areas ready for implementation."
                        : "Focused representation of this module before we build the full workflow."}
                    </p>
                  </div>
                  <Link className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700" href="/dashboard">
                    Overview
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {(isDashboardSection
                    ? modules
                    : [
                        {
                          title: `${selectedModule.label} overview`,
                          description:
                            selectedModuleDetail?.description ??
                            "Summary cards, filters, and important records will live here.",
                          icon: selectedModule.icon
                        },
                        {
                          title: "Recent records",
                          description:
                            "A table-style area for newest entries, statuses, and quick actions.",
                          icon: "reports" as DashboardIcon
                        }
                      ]).map((module) => {
                    const Icon = iconMap[module.icon];

                    return (
                      <article
                        className="group flex min-h-[96px] items-start gap-4 rounded-md border border-slate-200 bg-white p-4 transition hover:border-emerald-200 hover:shadow-sm"
                        key={module.title}
                      >
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-slate-50 text-emerald-700 ring-1 ring-slate-200">
                          <Icon className="size-5" aria-hidden="true" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold">{module.title}</h3>
                          <p className="mt-1 text-sm leading-6 text-slate-500">{module.description}</p>
                        </div>
                        <ChevronRight className="size-5 shrink-0 text-slate-300 group-hover:text-emerald-600" />
                      </article>
                    );
                  })}
                </div>

                {!isDashboardSection ? (
                  <div className="mt-5 overflow-x-auto rounded-md border border-slate-200">
                    <table className="w-full min-w-[640px] text-left text-sm">
                      <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                        <tr>
                          <th className="px-4 py-3">Item</th>
                          <th className="px-4 py-3">Owner</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Note</th>
                        </tr>
                      </thead>
                      <tbody>
                        {moduleRows.map((row) => (
                          <tr className="border-t border-slate-100" key={row.name}>
                            <td className="px-4 py-4 font-semibold">{row.name}</td>
                            <td className="px-4 py-4 text-slate-500">{row.owner}</td>
                            <td className="px-4 py-4">
                              <span className="rounded-md bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                                {row.status}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-slate-500">{row.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </div>

              <aside className="grid gap-6">
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-bold">Activity queue</h2>
                  <div className="mt-4 grid gap-3">
                    {activity.map((item) => (
                      <div className="flex gap-3 rounded-md bg-slate-50 p-3" key={item}>
                        <span className="mt-2 size-2 rounded-full bg-emerald-600" />
                        <p className="text-sm leading-6 text-slate-600">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-bold">Role access</h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {session.roles.map((role) => (
                      <span
                        className="rounded-md bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700"
                        key={`${role.role}-${role.schoolId ?? "platform"}`}
                      >
                        {role.displayName}
                      </span>
                    ))}
                  </div>
                </div>
              </aside>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
