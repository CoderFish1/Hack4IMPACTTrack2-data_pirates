import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

type Role = "patient" | "doctor" | "admin"

function roleToDashboard(role: Role): string {
  if (role === "patient") return "/dashboard/patient"
  if (role === "doctor") return "/dashboard/doctor"
  return "/dashboard/admin"
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protect only dashboards.
  if (!pathname.startsWith("/dashboard")) return NextResponse.next()

  const isDashboardHome = pathname === "/dashboard"
  const roleCookie = req.cookies.get("medai_role")?.value
  const authedCookie = req.cookies.get("medai_auth")?.value

  const authed = authedCookie === "1"
  const role = roleCookie as Role | undefined

  if (!authed || !role) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  if (isDashboardHome) {
    const url = req.nextUrl.clone()
    url.pathname = roleToDashboard(role)
    return NextResponse.redirect(url)
  }

  // Demo mode: keep dashboard routes protected by auth, but allow cross-role
  // navigation through the ecosystem pages from the shared sidebar.
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
}

