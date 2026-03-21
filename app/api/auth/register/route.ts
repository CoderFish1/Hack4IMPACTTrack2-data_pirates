import { NextResponse } from "next/server"
import { setAuthCookies } from "@/lib/auth-cookies"
import type { Role } from "@/lib/session"

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { role: Role; name?: string }
    if (!body?.role) return NextResponse.json({ error: "role required" }, { status: 400 })

    // Simulated registration: store only role + display name.
    await setAuthCookies({ role: body.role, name: body.name })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "register failed" }, { status: 500 })
  }
}

