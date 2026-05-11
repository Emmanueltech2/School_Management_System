export default function AuthLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[0.9fr_1.1fr]">
      <section className="hidden border-r bg-foreground p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">
            School Management System
          </p>
          <h1 className="mt-8 max-w-xl text-5xl font-semibold leading-tight">
            One operating system for every school you manage.
          </h1>
        </div>
        <div className="grid gap-4 text-sm text-white/78">
          <p>Multi-school by design. Every record belongs to a school.</p>
          <p>Built around admissions, fees, payments, reporting, and accountable access.</p>
        </div>
      </section>
      <section className="flex items-center justify-center px-5 py-10">
        {children}
      </section>
    </main>
  );
}
