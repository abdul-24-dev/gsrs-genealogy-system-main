"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ArrowRight, TreePine, HeartPulse } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-slate-50 to-white dark:from-emerald-950 dark:via-emerald-950 dark:to-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-emerald-600 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-500 text-white flex items-center justify-center shadow-lg border border-emerald-400/20">
            <TreePine className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-emerald-950 dark:text-white">
          GSRS Portal Login
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-emerald-300">
          Genealogical Search and Record System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-emerald-950/80 py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-emerald-100 dark:border-emerald-900/80 backdrop-blur-md">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5 text-emerald-600/70" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-emerald-900/40 border border-slate-300 dark:border-emerald-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="admin@familyarchive.local"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5 text-emerald-600/70" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-emerald-900/40 border border-slate-300 dark:border-emerald-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/30 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Archive</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-emerald-100 dark:border-emerald-900/60 pt-4 flex items-center justify-between text-xs">
            <Link
              href="/"
              className="text-emerald-700 dark:text-emerald-300 hover:underline font-semibold"
            >
              ← Back to Home
            </Link>
            <Link
              href="/setup"
              className="text-slate-500 hover:text-slate-800 dark:hover:text-white"
            >
              First-Time Setup
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
