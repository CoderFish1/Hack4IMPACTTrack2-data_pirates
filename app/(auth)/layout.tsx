import type { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-xl px-4 py-10 sm:py-16">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
          <div className="h-2.5 w-2.5 rounded-full bg-[#14b8a6] shadow-[0_0_18px_rgba(20,184,166,0.65)]" />
          <span className="text-xs font-black tracking-widest text-emerald-300/90 uppercase">MedAI Portal</span>
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-white">
          Secure enterprise triage
        </h1>
        <p className="mt-2 text-slate-300">
          Simulated authentication for this hackathon prototype.
        </p>
      </div>
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-6 sm:p-8 shadow-[0_0_0_1px_rgba(20,184,166,0.08)]">
        {children}
      </div>
    </div>
  )
}

