import { NextResponse } from "next/server"
import type { Role } from "@/lib/session"

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { role: Role; name?: string }
    if (!body?.role) return NextResponse.json({ error: "role required" }, { status: 400 })

    const res = NextResponse.json({ ok: true })

    res.cookies.set({
      name: "medai_auth",
      value: "1",
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    })

    res.cookies.set({
      name: "medai_role",
      value: body.role,
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    })

    res.cookies.set({
      name: "medai_name",
      value: body.name || "Clinical User",
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    })

    return res
  } catch {
    return NextResponse.json({ error: "login failed" }, { status: 500 })
  }
}

