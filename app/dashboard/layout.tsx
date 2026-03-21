import Link from "next/link"
import { getDisplayName, getSessionRole } from "@/lib/session"
import LogoutButton from "@/components/dashboard/LogoutButton"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const role = await getSessionRole()
  const name = await getDisplayName()

  const navItems = role === "doctor"
    ? [
        { href: "/dashboard/doctor", label: "AI Scribe" },
        { href: "/dashboard/triage", label: "Triage Console" },
      ]
    : role === "admin"
    ? [
        { href: "/dashboard/admin", label: "Epidemic Radar" },
        { href: "/dashboard/triage", label: "Triage Console" },
      ]
    : [
        { href: "/dashboard/patient", label: "My Dashboard" },
        { href: "/dashboard/triage", label: "AI Triage" },
        { href: "/passport", label: "Medical Passport" },
      ]

  return (
    <div className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-4 rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-4 shadow-[0_0_30px_rgba(14,165,233,0.12)]">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.06] ring-1 ring-white/10 backdrop-blur-md">
            <div className="h-2.5 w-2.5 rounded-full bg-[#14b8a6] shadow-[0_0_18px_rgba(20,184,166,0.7)]" />
          </div>
          <div>
            <div className="text-sm font-black tracking-widest uppercase text-emerald-300/90">MedAI Console</div>
            <div className="text-white text-lg font-black leading-tight">
              {role === "doctor" ? "Doctor" : role === "admin" ? "Hospital Admin" : "Patient"} • {name}
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/passport"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-white/80 hover:text-white hover:border-emerald-500/25 transition-colors"
          >
            Passport
          </Link>
          <LogoutButton />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <aside className="lg:sticky lg:top-6 h-fit rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-4 shadow-[0_0_30px_rgba(14,165,233,0.12)]">
          <nav className="space-y-2">
            {navItems.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className={[
                  "block rounded-2xl border px-4 py-3 text-sm font-black transition-all",
                  "border-white/[0.08] bg-white/[0.02] text-white/75 hover:border-sky-500/50 hover:text-white hover:shadow-[0_0_30px_rgba(14,165,233,0.18)]",
                ].join(" ")}
              >
                {it.label}
              </Link>
            ))}
          </nav>

          <div className="mt-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-4">
            <div className="text-xs font-black uppercase tracking-widest text-emerald-300/90">Session</div>
            <div className="mt-2 text-sm text-white/80">
              Role: <span className="font-black text-white">{role ?? "unknown"}</span>
            </div>
            <div className="mt-2 text-xs text-slate-300 leading-relaxed">
              This hackathon build uses cookie-based simulated auth.
            </div>
          </div>

          <div className="mt-4 sm:hidden">
            <LogoutButton />
          </div>
        </aside>

        <main>{children}</main>
      </div>
    </div>
  )
}

