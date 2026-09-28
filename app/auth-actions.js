"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import {
  SESSION_COOKIE,
  createSessionToken,
  passwordMatches,
  sitePassword,
} from "@/lib/password"

function sessionCookieOptions(maxAge) {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  }
}

export async function login(_previousState, formData) {
  if (!sitePassword()) {
    return {
      error: "This site is not ready for sign-in yet. Add SITE_PASSWORD to the .env file and restart.",
    }
  }

  const submitted = formData.get("password")
  const password = typeof submitted === "string" ? submitted : ""

  if (!(await passwordMatches(password))) {
    return { error: "That password is incorrect." }
  }

  const token = await createSessionToken()
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions(60 * 60 * 24 * 14))
  redirect("/")
}

export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, "", sessionCookieOptions(0))
  redirect("/login")
}
