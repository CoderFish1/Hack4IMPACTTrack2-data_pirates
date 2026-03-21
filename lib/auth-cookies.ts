import { cookies } from "next/headers"
import type { Role } from "./session"

export async function setAuthCookies(params: { role: Role; name?: string }) {
  const jar = await cookies()

  jar.set({
    name: "medai_auth",
    value: "1",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  jar.set({
    name: "medai_role",
    value: params.role,
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })

  jar.set({
    name: "medai_name",
    value: params.name || "Clinical User",
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function clearAuthCookies() {
  const jar = await cookies()
  jar.set({ name: "medai_auth", value: "", httpOnly: true, path: "/", maxAge: 0 })
  jar.set({ name: "medai_role", value: "", httpOnly: false, path: "/", maxAge: 0 })
  jar.set({ name: "medai_name", value: "", httpOnly: false, path: "/", maxAge: 0 })
}

