export const metadata = {
  title: "Sign in",
}

export default function LoginLayout({ children }) {
  return (
    <div className="login-shell">
      <div className="login-card">
        <h1>Personal Helper</h1>
        <p className="login-note">Enter your password to continue.</p>
        {children}
      </div>
    </div>
  )
}
