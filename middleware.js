import { NextResponse } from "next/server"
import { SESSION_COOKIE, isValidSession } from "./lib/password"

export async function middleware(request) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(SESSION_COOKIE)?.value
  const authenticated = await isValidSession(token)

  if (pathname === "/login") {
    if (authenticated) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    return NextResponse.next()
  }

  if (!authenticated) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
