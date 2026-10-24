"use client";

import { useState } from "react";
import { loginAdminAction } from "@/app/secure-admin-panel/actions";

interface LoginFormProps {
  onLoggedIn?: (userEmail: string) => void;
}

export default function LoginForm({ onLoggedIn }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      const res = await loginAdminAction(cleanEmail, cleanPassword);

      if (!res.success) {
        setErrorMsg(res.error || "Authentication failed. Please verify your credentials.");
      } else {
        if (onLoggedIn && res.user?.email) {
          onLoggedIn(res.user.email);
        } else {
          window.location.reload();
        }
      }
    } catch (err: any) {
      setErrorMsg("An unexpected authentication error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page flex min-h-[75vh] items-center justify-center py-16">
      <div className="w-full max-w-md border-2 border-line bg-paper p-8 space-y-6 shadow-hard">
        <div className="border-b-2 border-line pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2.5 w-2.5 bg-red-600 rounded-none inline-block" />
            <span className="font-mono text-xs uppercase tracking-widest2 text-accent font-bold">
              Supabase Auth Gateway
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-ink">
            Admin Authentication
          </h1>
          <p className="font-mono text-xs text-muted mt-1">
            Sign in with your authorized administrator credentials.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 border-2 border-red-700 text-red-700 font-mono text-xs animate-reveal-up">
            <strong>ERROR:</strong> {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-widest2 text-ink font-bold mb-1.5">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="admin@example.com"
              className="w-full border-2 border-line bg-paper px-4 py-3 font-mono text-sm text-ink focus:border-accent focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase tracking-widest2 text-ink font-bold mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••••••"
              className="w-full border-2 border-line bg-paper px-4 py-3 font-mono text-sm text-ink focus:border-accent focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full border-2 border-line bg-accent py-4 font-mono text-xs uppercase tracking-widest2 font-bold text-ink shadow-hard-sm hover:bg-ink hover:text-paper transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying Credentials via Supabase Auth…" : "Sign In to Admin Dashboard →"}
          </button>
        </form>

        <div className="border-t border-line/20 pt-4 text-center">
          <p className="font-mono text-[11px] text-muted">
            Authenticated session and role-based authorization enforced via Supabase Auth & RLS.
          </p>
        </div>
      </div>
    </div>
  );
}