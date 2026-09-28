import Link from "next/link"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { signOut } from "@/app/auth-actions"
import { SESSION_COOKIE, isValidSession } from "@/lib/password"

export const dynamic = "force-dynamic"

export default async function SiteLayout({ children }) {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value

  if (!(await isValidSession(token))) {
    redirect("/login")
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <Link className="brand-link" href="/">
          Personal Helper
        </Link>
        <form action={signOut}>
          <button className="sign-out" type="submit">
            Sign out
          </button>
        </form>
      </header>
      <main className="site-main">{children}</main>
    </div>
  )
}
