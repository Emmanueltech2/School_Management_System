import { BarChart3, BookOpen, CreditCard, LockKeyhole, ShieldCheck, Users } from "lucide-react";

export default function AuthLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_0.95fr]">
      <section className="hidden border-r bg-foreground p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <BookOpen className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-accent">Elite Soft</p>
              <p className="text-sm text-white/70">School Management System</p>
            </div>
          </div>

          <h1 className="mt-10 max-w-2xl text-5xl font-semibold leading-tight">
            Secure school operations in one clear workspace.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/72">
            Manage students, academics, finance, and daily school operations with role-based
            access for every user.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {["Admin", "Teacher", "Finance", "Parent", "Student"].map((role) => (
              <span className="rounded-md bg-white/10 px-3 py-1 text-xs font-medium" key={role}>
                {role}
              </span>
            ))}
          </div>

          <div className="mt-10 max-w-xl rounded-lg border border-white/10 bg-white/8 p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-sm font-medium">Today&apos;s dashboard</p>
                <p className="text-xs text-white/58">Live school overview</p>
              </div>
              <span className="rounded-md bg-accent px-2 py-1 text-xs font-semibold text-accent-foreground">
                Operational
              </span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { label: "Students", value: "1,248", icon: Users },
                { label: "Fees paid", value: "82%", icon: CreditCard },
                { label: "Attendance", value: "96%", icon: BarChart3 }
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div className="rounded-md bg-white p-4 text-foreground" key={item.label}>
                    <Icon className="size-4 text-primary" aria-hidden="true" />
                    <p className="mt-4 text-xl font-semibold">{item.value}</p>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 grid gap-2">
              <div className="h-2 rounded-full bg-white/12">
                <div className="h-2 w-3/4 rounded-full bg-primary" />
              </div>
              <div className="h-2 rounded-full bg-white/12">
                <div className="h-2 w-1/2 rounded-full bg-accent" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 text-sm text-white/78">
          <p className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-accent" aria-hidden="true" />
            Protected by secure authentication and school-level access.
          </p>
          <p className="flex items-center gap-2">
            <LockKeyhole className="size-4 text-accent" aria-hidden="true" />
            Multi-school by design. Every record belongs to a school.
          </p>
        </div>
      </section>
      <section className="flex items-center justify-center px-5 py-10">
        {children}
      </section>
    </main>
  );
}
