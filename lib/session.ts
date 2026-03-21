import { cookies } from "next/headers"

export type Role = "patient" | "doctor" | "admin"

export async function getSessionRole(): Promise<Role | null> {
  const jar = await cookies()
  const role = jar.get("medai_role")?.value
  if (role === "patient" || role === "doctor" || role === "admin") return role
  return null
}

export async function isAuthed(): Promise<boolean> {
  const jar = await cookies()
  return jar.get("medai_auth")?.value === "1"
}

export async function getDisplayName(): Promise<string> {
  const jar = await cookies()
  return jar.get("medai_name")?.value || "Clinical User"
}

