import { NextResponse } from "next/server"

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set({ name: "medai_auth", value: "", httpOnly: true, path: "/", maxAge: 0 })
  res.cookies.set({ name: "medai_role", value: "", httpOnly: false, path: "/", maxAge: 0 })
  res.cookies.set({ name: "medai_name", value: "", httpOnly: false, path: "/", maxAge: 0 })
  return res
}

