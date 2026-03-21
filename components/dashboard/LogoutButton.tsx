"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function onLogout() {
    setLoading(true)
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } finally {
      router.push("/login")
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={onLogout}
      disabled={loading}
      className="border-white/10 bg-white/[0.03] hover:border-emerald-500/25 text-white rounded-xl"
    >
      {loading ? "Signing out..." : "Sign out"}
    </Button>
  )
}

