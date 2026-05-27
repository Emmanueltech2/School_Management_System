import Link from "next/link";
import {
  ArrowLeft,
  ClipboardList,
  UserPlus,
  Users
} from "lucide-react";
import { AdmissionForm } from "./admission-form";
import { AdminSidebar } from "../admin-sidebar";
import { logout } from "@/app/actions";
import { requireAnyRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { RolePreviewSwitcher } from "@/app/dashboard/_components/role-preview-switcher";

export const dynamic = "force-dynamic";

type ClassOption = {
  id: string;
  name: string;
};

type StreamOption = {
  id: string;
  class_id: string;
  name: string;
};

type RecentStudent = {
  id: string;
  admission_no: string;
  first_name: string;
  last_name: string;
  admission_date: string | null;
  status: string | null;
  classes: { name: string } | { name: string }[] | null;
  streams: { name: string } | { name: string }[] | null;
};

function getSchoolId(session: Awaited<ReturnType<typeof requireAnyRole>>) {
  return (
    session.profile.school_id ??
    session.roles.find((role) => role.role === "school_admin" && role.schoolId)?.schoolId ??
    null
  );
}

function getRelationName(relation: { name: string } | { name: string }[] | null) {
  if (Array.isArray(relation)) {
    return relation[0]?.name ?? null;
  }

  return relation?.name ?? null;
}

async function getAdmissionsData(schoolId: string | null) {
  if (!schoolId) {
    return {
      classes: [] as ClassOption[],
      streams: [] as StreamOption[],
      recentStudents: [] as RecentStudent[],
      totalStudents: 0
    };
  }

  const supabase = await createClient();
  const [
    { data: classes, error: classesError },
    { data: streams, error: streamsError },
    { data: recentStudents, error: studentsError },
    { count: totalStudents, error: countError }
  ] = await Promise.all([
    supabase.from("classes").select("id, name").eq("school_id", schoolId).order("name"),
    supabase.from("streams").select("id, class_id, name").eq("school_id", schoolId).order("name"),
    supabase
      .from("students")
      .select("id, admission_no, first_name, last_name, admission_date, status, classes(name), streams(name)")
      .eq("school_id", schoolId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("school_id", schoolId)
      .is("deleted_at", null)
  ]);

  if (classesError) {
    throw classesError;
  }

  if (streamsError) {
    throw streamsError;
  }

  if (studentsError) {
    throw studentsError;
  }

  if (countError) {
    throw countError;
  }

  return {
    classes: (classes ?? []) as ClassOption[],
    streams: (streams ?? []) as StreamOption[],
    recentStudents: (recentStudents ?? []) as unknown as RecentStudent[],
    totalStudents: totalStudents ?? 0
  };
}

export default async function AdmissionsPage() {
  const session = await requireAnyRole(["school_admin"]);
  const schoolId = getSchoolId(session);
  const { classes, streams, recentStudents, totalStudents } = await getAdmissionsData(schoolId);
  const canPreviewRoles = session.roles.some((role) => role.role === "super_admin");

  return (
    <main className="min-h-screen bg-[#f6f8fb]">
      <div className="mx-auto grid min-h-screen max-w-[1500px] lg:grid-cols-[280px_1fr]">
        <AdminSidebar activeHref="/dashboard/admin/admissions" subtitle="Admissions" />

        <section className="min-w-0">
          <header className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="text-sm font-medium text-primary">Admissions workflow</p>
                <h1 className="text-xl font-semibold">Student admissions</h1>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {canPreviewRoles ? <RolePreviewSwitcher currentPath="/dashboard/admin" /> : null}
                <Link
                  className="inline-flex items-center gap-2 rounded-md border bg-white px-4 py-2 text-sm font-medium hover:bg-secondary"
                  href="/dashboard/admin"
                >
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  Admin dashboard
                </Link>
                <form action={logout}>
                  <button className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-white hover:bg-foreground/90">
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          </header>

          <div className="grid gap-6 px-5 py-6">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { title: "Total students", value: String(totalStudents), icon: Users },
                { title: "Classes ready", value: String(classes.length), icon: ClipboardList },
                { title: "Admission status", value: schoolId ? "Ready" : "Needs school", icon: UserPlus }
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <article className="rounded-lg border bg-card p-5" key={item.title}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
                      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-5" aria-hidden="true" />
                      </div>
                    </div>
                    <p className="mt-4 text-2xl font-semibold">{item.value}</p>
                  </article>
                );
              })}
            </div>

            <div className="rounded-lg border bg-card p-6">
              <AdmissionForm classes={classes} streams={streams} />
            </div>

            <div className="rounded-lg border bg-card p-6">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Recent admissions</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Newly admitted students will appear here for quick review.
                  </p>
                </div>
                <span className="rounded-md bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
                  {recentStudents.length} shown
                </span>
              </div>

              {recentStudents.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border">
                  <div className="min-w-[760px]">
                    <div className="grid grid-cols-[0.9fr_1.2fr_1fr_0.8fr_0.8fr] bg-secondary px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <span>Admission no</span>
                      <span>Student</span>
                      <span>Class</span>
                      <span>Status</span>
                      <span>Date</span>
                    </div>
                    {recentStudents.map((student) => (
                      <div
                        className="grid grid-cols-[0.9fr_1.2fr_1fr_0.8fr_0.8fr] gap-3 border-t bg-white px-4 py-4 text-sm"
                        key={student.id}
                      >
                        <span className="font-medium">{student.admission_no}</span>
                        <span>{student.first_name} {student.last_name}</span>
                        <span className="text-muted-foreground">
                          {getRelationName(student.classes) ?? "Unassigned"}
                          {getRelationName(student.streams) ? ` ${getRelationName(student.streams)}` : ""}
                        </span>
                        <span>
                          <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium capitalize text-primary">
                            {student.status ?? "active"}
                          </span>
                        </span>
                        <span className="text-muted-foreground">{student.admission_date ?? "Today"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                  No students admitted yet. Use the admission form above to create the first student
                  record.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
