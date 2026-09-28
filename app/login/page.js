import { sitePassword } from "@/lib/password"
import { LoginForm } from "./login-form"

export const dynamic = "force-dynamic"

export default function LoginPage() {
  return <LoginForm configured={sitePassword().length > 0} />
}
