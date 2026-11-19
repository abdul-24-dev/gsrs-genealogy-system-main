"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  User,
  Mail,
  Lock,
  Building,
  FileText,
  ArrowRight,
  CheckCircle2,
  TreePine,
  HeartPulse,
} from "lucide-react";

export default function SetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    familyOrOrgName: "Family Heritage Archive",
    description: "Preserving family records, health milestones, ancestry, and generational lineage.",
  });

  useEffect(() => {
    fetch("/api/setup")
      .then((res) => res.json())
      .then((data) => {
        if (data.setupCompleted) {
          router.replace("/login");
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Setup failed.");
      }

      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-emerald-950">
        <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-300">
          <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span>Verifying system configuration...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-slate-50 to-white dark:from-emerald-950 dark:via-emerald-950 dark:to-slate-950 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center selection:bg-emerald-600 selection:text-white">
      <div className="max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-500 text-white shadow-xl mb-4 border border-emerald-400/30">
            <TreePine className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-emerald-950 dark:text-white">
            Genealogical Search and Record System
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-emerald-300">
            Welcome! Set up your primary administrator account and initialize your local family health and heritage archive.
          </p>
        </div>

        {/* Wizard Card */}
        <div className="bg-white dark:bg-emerald-950/80 shadow-xl rounded-2xl border border-emerald-100 dark:border-emerald-900/80 p-8 sm:p-10 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-emerald-100 dark:border-emerald-900/60">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Initial Setup Wizard
            </h2>
            <span className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
              <HeartPulse className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Local-First Secure</span>
            </span>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                1. Master Administrator Profile
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-5 h-5 text-emerald-600/70" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    placeholder="e.g. Ibrahim Abubakar"
                    className="block w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-emerald-900/40 border border-slate-300 dark:border-emerald-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-5 h-5 text-emerald-600/70" />
                  </div>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="admin@familyarchive.local"
                    className="block w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-emerald-900/40 border border-slate-300 dark:border-emerald-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Password (min 8 chars) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-5 h-5 text-emerald-600/70" />
                    </div>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="••••••••"
                      className="block w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-emerald-900/40 border border-slate-300 dark:border-emerald-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600/70" />
                    </div>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="••••••••"
                      className="block w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-emerald-900/40 border border-slate-300 dark:border-emerald-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-emerald-100 dark:border-emerald-900/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                2. Archive Organization Settings
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Family or Archive Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building className="w-5 h-5 text-emerald-600/70" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.familyOrOrgName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        familyOrOrgName: e.target.value,
                      })
                    }
                    placeholder="e.g. Gwandu & Keffi Heritage Archive"
                    className="block w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-emerald-900/40 border border-slate-300 dark:border-emerald-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Purpose
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3.5 pointer-events-none text-slate-400">
                    <FileText className="w-5 h-5 text-emerald-600/70" />
                  </div>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="A brief summary of this family genealogical record system."
                    className="block w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-emerald-900/40 border border-slate-300 dark:border-emerald-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Initializing System...</span>
                </>
              ) : (
                <>
                  <span>Complete Setup & Launch Archive</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center text-xs text-slate-500 dark:text-emerald-400/80">
          <Link href="/" className="hover:underline font-semibold text-emerald-700 dark:text-emerald-300">
            ← Return to Public Home Page
          </Link>
        </div>
      </div>
    </div>
  );
}
