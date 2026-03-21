"use client"

import { useMemo, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Key } from "lucide-react"

type Role = "patient" | "doctor" | "admin"

const ROLE_META: Record<Role, { title: string; subtitle: string }> = {
  patient: { title: "Patient", subtitle: "Self-triage & health insights" },
  doctor: { title: "Doctor", subtitle: "Triage queue & clinical workflows" },
  admin: { title: "Hospital Admin", subtitle: "Population insights & ops" },
}

import { Suspense } from "react"
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-emerald-400">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get("next") || "/dashboard/triage"

  const [loading, setLoading] = useState<Role | null>(null)
  const [apiKey, setApiKey] = useState("")
  const [keySaved, setKeySaved] = useState(false)

  useEffect(() => {
    const savedKey = localStorage.getItem("smart-health-api-key")
    if (savedKey) setApiKey(savedKey)
  }, [])

  const saveApiKey = () => {
    localStorage.setItem("smart-health-api-key", apiKey)
    setKeySaved(true)
    setTimeout(() => setKeySaved(false), 2000)
  }

  async function handleInstantLogin(role: Role) {
    setLoading(role)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, name: `Demo ${ROLE_META[role].title}` }),
      })
      if (!res.ok) throw new Error("Login failed")
      // Route by role
      const roleRoute: Record<Role, string> = {
        patient: "/dashboard/patient",
        doctor: "/dashboard/doctor",
        admin: "/dashboard/admin",
      }
      router.push(params.get("next") || roleRoute[role])
    } catch (err) {
      alert("Unable to log in. Please try again.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">One-Click Demo Access</h2>
          <p className="mt-2 text-slate-300">Select a role to instantly bypass authentication for judging purposes.</p>
        </div>
        <Link href="/" className="px-4 py-2 text-xs font-bold bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white transition-colors">
          &larr; Home
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-1">
        {(Object.keys(ROLE_META) as Role[]).map((r) => {
          const isLoading = loading === r
          return (
            <button
              key={r}
              onClick={() => handleInstantLogin(r)}
              disabled={loading !== null}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition-all backdrop-blur-md hover:border-emerald-500/50 hover:bg-emerald-500/10 group"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-black text-white group-hover:text-emerald-300 transition-colors">{ROLE_META[r].title} Access</div>
                  <div className="mt-1 text-sm text-slate-400">{ROLE_META[r].subtitle}</div>
                </div>
                {isLoading ? (
                  <div className="h-5 w-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                ) : (
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 group-hover:bg-emerald-500/20 text-emerald-400 font-bold transition-all">
                    →
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <div className="pt-4 border-t border-white/10">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
          <Key className="h-4 w-4 text-emerald-400" /> API Integrations (Optional)
        </h3>
        <Card className="border-white/10 bg-black/40 p-4 backdrop-blur-xl rounded-2xl">
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
            OpenAI API Key (For Live Triage)
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="flex-1 rounded-xl border border-white/10 bg-transparent px-4 py-2.5 text-sm text-white outline-none ring-0 placeholder:text-slate-600 focus:border-emerald-500/50 focus:bg-white/5 transition-all"
            />
            <Button
              onClick={saveApiKey}
              className="bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-500/30 rounded-xl px-6"
            >
              {keySaved ? "Saved!" : "Set Key"}
            </Button>
          </div>
          <p className="mt-2 text-[10px] text-slate-500 uppercase tracking-wider font-bold">
            Keys are stored locally on your device and never sent to our servers.
          </p>
        </Card>
      </div>

      <p className="text-center text-xs text-slate-500 font-medium">
        Bypassing standard auth for hackathon evaluation.
      </p>
    </motion.div>
  )
}

