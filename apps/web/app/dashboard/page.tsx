import Link from "next/link";
import { Building2, CreditCard, GraduationCap, Users } from "lucide-react";

const cards = [
  {
    title: "School setup",
    value: "Ready",
    icon: Building2
  },
  {
    title: "Students",
    value: "0",
    icon: Users
  },
  {
    title: "Classes",
    value: "0",
    icon: GraduationCap
  },
  {
    title: "Payments",
    value: "KES 0",
    icon: CreditCard
  }
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-medium text-primary">School Management System</p>
            <h1 className="text-xl font-semibold">Dashboard</h1>
          </div>
          <Link
            className="rounded-md bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80"
            href="/login"
          >
            Sign out
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[240px_1fr]">
        <nav className="rounded-lg border bg-card p-3">
          {["Overview", "Students", "Guardians", "Fees", "Payments", "Reports"].map((item) => (
            <Link
              className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              href="/dashboard"
              key={item}
            >
              {item}
            </Link>
          ))}
        </nav>

        <section className="grid gap-6">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-2xl font-semibold">Authentication & school setup</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              This shell is ready for Supabase Auth, school onboarding, profile creation, and
              default system initialization.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
              const Icon = card.icon;

              return (
                <article className="rounded-lg border bg-card p-5" key={card.title}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                    <Icon className="size-5 text-primary" aria-hidden="true" />
                  </div>
                  <p className="mt-4 text-2xl font-semibold">{card.value}</p>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
