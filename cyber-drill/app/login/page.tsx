"use client";

import { useState } from "react";
import { login, signup } from "./actions";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setMessage(null);
    setLoading(true);

    const result = isSignUp ? await signup(formData) : await login(formData);

    if (result?.error) {
      setError(result.error);
    } else if (result?.message) {
      setMessage(result.message);
    }

    setLoading(false);
  }

  return (
    <div className="cyber-grid flex min-h-screen items-center justify-center bg-[#0a0a0f]">
      {/* Decorative glow orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm px-4">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 ring-1 ring-cyan-500/20">
            <svg className="h-7 w-7 text-cyan-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
          </div>
          <h1 className="gradient-text text-2xl font-bold tracking-tight">CyberDrill</h1>
          <p className="mt-1 text-sm text-zinc-500">Cybersecurity Training Platform</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-6 text-center text-lg font-semibold text-zinc-100">
            {isSignUp ? "Create an account" : "Welcome back"}
          </h2>

          <form action={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="h-11 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-all focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/25"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                className="h-11 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-all focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/25"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-sm font-semibold text-zinc-950 transition-all hover:from-cyan-400 hover:to-cyan-300 hover:shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50"
            >
              {loading ? (
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : isSignUp ? (
                "Create account"
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-zinc-500">
              {isSignUp ? "Already have an account?" : "Don\u2019t have an account?"}{" "}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setMessage(null);
              }}
              className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
