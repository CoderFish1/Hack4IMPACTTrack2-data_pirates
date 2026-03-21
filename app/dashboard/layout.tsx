import Link from "next/link"
import { getDisplayName, getSessionRole } from "@/lib/session"
import LogoutButton from "@/components/dashboard/LogoutButton"
import { ThemeToggle } from "@/components/dashboard/ThemeToggle"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const role = await getSessionRole()
  const name = await getDisplayName()

  const navItems = role === "doctor"
    ? [
        { href: "/dashboard/doctor", label: "🩺 Doctor Dashboard" },
        { href: "/dashboard/triage", label: "⚡ Triage Console" },
      ]
    : role === "admin"
    ? [
        { href: "/dashboard/admin", label: "🛡 Admin Console" },
        { href: "/dashboard/triage", label: "⚡ Triage Console" },
      ]
    : [
        { href: "/dashboard/patient", label: "🏠 My Dashboard" },
        { href: "/dashboard/triage", label: "⚡ AI Triage" },
        { href: "/passport", label: "🛂 Medical Passport" },
      ]

  // Role-specific metadata
  const roleConfig = role === "doctor"
    ? {
        accent: "text-violet-300/90",
        borderAccent: "border-violet-500/30",
        title: "Doctor",
        features: ["AI Clinical Scribe", "Patient Queue", "Triage Console", "94.7% Diagnostic AI"],
      }
    : role === "admin"
    ? {
        accent: "text-amber-300/90",
        borderAccent: "border-amber-500/30",
        title: "Hospital Admin",
        features: ["Epidemic Radar", "Blood Bank Inventory", "AI Risk Analysis", "Hospital Intelligence"],
      }
    : {
        accent: "text-sky-300/90",
        borderAccent: "border-sky-500/30",
        title: "Patient",
        features: ["AI Diagnostics", "Real-Time Vitals", "Smart Scheduling", "Rx Price Finder", "Pregnancy Tracker", "Blood Donor Finder"],
      }

  return (
    <div className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-4 rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-4 shadow-[0_0_30px_rgba(14,165,233,0.12)]">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.06] ring-1 ring-white/10 backdrop-blur-md">
            <div className="h-2.5 w-2.5 rounded-full bg-[#14b8a6] shadow-[0_0_18px_rgba(20,184,166,0.7)]" />
          </div>
            <div>
              <div className={`text-xs font-black tracking-widest uppercase ${roleConfig.accent}`}>{roleConfig.title} Portal</div>
              <div className="font-black tracking-tight text-lg leading-[1.3] pb-1">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">संजीवनी</span>
                <span className="text-slate-900 dark:text-white ml-1">Lifeline</span>
              </div>
            </div>
        </Link>

        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/passport"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-white/80 hover:text-white hover:border-emerald-500/25 transition-colors"
          >
            Passport
          </Link>
          <ThemeToggle />
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

          {/* AI Features enabled for this role */}
          <div className={`mt-5 rounded-2xl border p-4 ${roleConfig.borderAccent} bg-white/[0.02]`}>
            <div className={`text-xs font-black uppercase tracking-widest mb-3 ${roleConfig.accent}`}>
              🤖 AI Features Active
            </div>
            <ul className="space-y-1.5">
              {roleConfig.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-4">
            <div className="text-xs font-black uppercase tracking-widest text-emerald-300/90">Session</div>
            <div className="mt-2 text-sm text-white/80">
              Role: <span className="font-black text-white">{role ?? "unknown"}</span>
            </div>
            <div className="mt-2 text-xs text-slate-400 leading-relaxed">
              Powered by Llama 3.3 70B via Groq
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

