"use client"

import { useActionState } from "react"
import { login } from "@/app/auth-actions"

export function LoginForm({ configured }) {
  const [state, formAction, pending] = useActionState(login, null)

  return (
    <form className="login-form" action={formAction} aria-busy={pending}>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
          disabled={!configured || pending}
        />
      </div>
      {state?.error ? (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      ) : null}
      {!configured ? (
        <p className="form-error" role="status">
          Add SITE_PASSWORD to the .env file, then restart.
        </p>
      ) : null}
      <button type="submit" disabled={!configured || pending}>
        {pending ? "Checking…" : "Continue"}
      </button>
    </form>
  )
}
