"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  Search,
  Sun,
  Moon,
  LogOut,
  User,
  Shield,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "./ThemeContext";

interface NavbarProps {
  onToggleSidebar: () => void;
  user?: {
    fullName: string;
    email: string;
    role: string;
  };
}

export default function Navbar({ onToggleSidebar, user }: NavbarProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [quickQuery, setQuickQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(quickQuery.trim())}`);
      setQuickQuery("");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
    } catch {
      router.replace("/login");
    }
  };

  return (
    <header className="sticky top-0 z-30 h-20 bg-white/80 dark:bg-emerald-950/80 backdrop-blur-md border-b border-emerald-100 dark:border-emerald-900/60 transition-colors">
      <div className="flex items-center justify-between h-full px-4 sm:px-8">
        {/* Left: Mobile hamburger & Quick search */}
        <div className="flex items-center gap-4 flex-1 max-w-lg">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/50"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <form onSubmit={handleQuickSearch} className="w-full relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600/60 dark:text-emerald-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              placeholder="Quick search family member, ID, or clan..."
              className="w-full pl-10 pr-4 py-2 bg-emerald-50/50 dark:bg-emerald-900/40 border border-emerald-100 dark:border-emerald-800/60 focus:border-emerald-500 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-emerald-300/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </form>
        </div>

        {/* Right controls: Theme toggle & Profile */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-slate-600 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 transition-colors"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-emerald-700" />
            )}
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/50 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-semibold flex items-center justify-center text-sm shadow-md shadow-emerald-500/20">
                {user?.fullName?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                  {user?.fullName || "Administrator"}
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  {user?.role || "ADMIN"}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
            </button>

            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-emerald-950 rounded-2xl shadow-2xl border border-emerald-100 dark:border-emerald-900/80 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-emerald-100 dark:border-emerald-900/80">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {user?.fullName || "Administrator"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-emerald-300/70 truncate">
                      {user?.email || "admin@familyarchive.local"}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                      <Shield className="w-3 h-3" />
                      <span>{user?.role || "SUPER_ADMIN"}</span>
                    </div>
                  </div>

                  <div className="p-1">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        router.push("/settings");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 rounded-xl"
                    >
                      <User className="w-4 h-4 text-emerald-500" />
                      <span>Account Profile</span>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
