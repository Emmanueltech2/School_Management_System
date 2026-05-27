"use client";

import { useRouter } from "next/navigation";

const previewRoutes = [
  { label: "School Admin", href: "/dashboard/admin" },
  { label: "Finance", href: "/dashboard/finance" },
  { label: "Teacher", href: "/dashboard/teacher" },
  { label: "Parent", href: "/dashboard/parent" },
  { label: "Student", href: "/dashboard/student" }
];

type RolePreviewSwitcherProps = {
  currentPath?: string;
};

export function RolePreviewSwitcher({ currentPath = "" }: RolePreviewSwitcherProps) {
  const router = useRouter();

  return (
    <label className="grid gap-1 text-xs font-medium text-muted-foreground">
      Preview as
      <select
        className="h-10 min-w-40 rounded-md border bg-white px-3 text-sm font-medium text-foreground outline-none ring-primary/20 transition focus:ring-4"
        onChange={(event) => {
          if (event.target.value) {
            router.push(event.target.value);
          }
        }}
        value={currentPath}
      >
        <option value="">Select role</option>
        {previewRoutes.map((route) => (
          <option key={route.href} value={route.href}>
            {route.label}
          </option>
        ))}
      </select>
    </label>
  );
}
