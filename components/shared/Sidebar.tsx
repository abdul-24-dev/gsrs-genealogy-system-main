"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users2,
  UserCheck,
  GitFork,
  Search,
  FolderArchive,
  FileSpreadsheet,
  BarChart3,
  Shield,
  Settings,
  Sparkles,
  X,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  appName?: string;
  familyOrOrgName?: string;
}

const navItems = [
  { name: "Public Home", href: "/", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Families", href: "/families", icon: Users2 },
  { name: "Family Members", href: "/members", icon: UserCheck },
  { name: "Family Tree", href: "/family-tree", icon: GitFork },
  { name: "Genealogical Search", href: "/search", icon: Search },
  { name: "Historical Documents", href: "/documents", icon: FolderArchive },
  { name: "Reports & Exports", href: "/reports", icon: FileSpreadsheet },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "User Management", href: "/users", icon: Shield },
  { name: "System Settings", href: "/settings", icon: Settings },
];

export default function Sidebar({
  isOpen,
  onClose,
  appName = "GSRS",
  familyOrOrgName = "Family Archive",
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-emerald-950/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-72 bg-emerald-950 text-slate-200 border-r border-emerald-900/60 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-emerald-900/80 bg-emerald-900/40">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-base leading-tight tracking-wide">
                GSRS
              </span>
              <span className="text-xs text-emerald-300/80 truncate max-w-[150px]">
                {familyOrOrgName}
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider uppercase text-emerald-400/80">
            Heritage & Health Archive
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => onClose()}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group",
                  isActive
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                    : "text-slate-300 hover:bg-emerald-900/40 hover:text-white"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-colors",
                    isActive
                      ? "text-white"
                      : "text-emerald-400/70 group-hover:text-emerald-300"
                  )}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Footer info badge */}
        <div className="p-4 border-t border-emerald-900/60 bg-emerald-900/20">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-900/50 border border-emerald-800/60">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-200">
                Local-First Health & Lineage
              </span>
              <span className="text-[10px] text-emerald-300/80">
                SQLite Engine v1.0
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
