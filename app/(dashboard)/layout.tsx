"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/shared/Sidebar";
import Navbar from "@/components/shared/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Unauthorized");
        }
        return res.json();
      })
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
          setSettings(data.settings);
          setLoading(false);
        } else {
          router.replace("/login");
        }
      })
      .catch(() => {
        router.replace("/login");
      });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3 text-emerald-700 dark:text-emerald-300">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading GSRS Archive...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        appName={settings?.appName}
        familyOrOrgName={settings?.familyOrOrgName}
      />

      <div className="lg:pl-72 flex flex-col flex-1">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(true)}
          user={user}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
