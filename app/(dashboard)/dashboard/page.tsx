"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  HeartHandshake,
  Skull,
  GitFork,
  Building,
  FileText,
  UserPlus,
  PlusCircle,
  Search,
  FileSpreadsheet,
  ArrowUpRight,
  Sparkles,
  Calendar,
  Clock,
  HeartPulse,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard data load error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-emerald-900/20 rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-emerald-900/20 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-emerald-900/20 rounded-2xl" />
          <div className="h-72 bg-emerald-900/20 rounded-2xl" />
        </div>
      </div>
    );
  }

  const summary = data?.summary || {
    totalMembers: 0,
    livingMembers: 0,
    deceasedMembers: 0,
    totalGenerations: 1,
    totalFamilies: 0,
    totalDocuments: 0,
  };

  const statCards = [
    {
      title: "Family Members",
      value: summary.totalMembers,
      icon: Users,
      color: "from-emerald-600 to-teal-700",
      href: "/members",
    },
    {
      title: "Living Members",
      value: summary.livingMembers,
      icon: HeartHandshake,
      color: "from-teal-600 to-emerald-600",
      href: "/members?status=living",
    },
    {
      title: "Deceased Ancestors",
      value: summary.deceasedMembers,
      icon: Skull,
      color: "from-slate-600 to-slate-800",
      href: "/members?status=deceased",
    },
    {
      title: "Generations",
      value: summary.totalGenerations,
      icon: GitFork,
      color: "from-emerald-700 to-forest-800",
      href: "/family-tree",
    },
    {
      title: "Family Groups",
      value: summary.totalFamilies,
      icon: Building,
      color: "from-amber-600 to-emerald-700",
      href: "/families",
    },
    {
      title: "Documents & Photos",
      value: summary.totalDocuments,
      icon: FileText,
      color: "from-teal-600 to-cyan-700",
      href: "/documents",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-8 shadow-2xl border border-emerald-800/40">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-4 border border-emerald-400/20 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Genealogical Health & Record Management</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
            Family Heritage Dashboard
          </h1>
          <p className="mt-2 text-sm text-emerald-100/90">
            Digitally preserving ancestral lineage, family histories, and generational well-being across Nasarawa State and beyond.
          </p>

          {/* Quick Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/members/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-lg shadow-emerald-600/30 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Member</span>
            </Link>
            <Link
              href="/families"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800/60 text-white text-sm font-medium border border-emerald-700/60 backdrop-blur-md transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Family Group</span>
            </Link>
            <Link
              href="/family-tree"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800/60 text-white text-sm font-medium border border-emerald-700/60 backdrop-blur-md transition-all"
            >
              <GitFork className="w-4 h-4" />
              <span>Interactive Family Tree</span>
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800/60 text-white text-sm font-medium border border-emerald-700/60 backdrop-blur-md transition-all"
            >
              <Search className="w-4 h-4" />
              <span>Search Records</span>
            </Link>
            <Link
              href="/reports"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800/60 text-white text-sm font-medium border border-emerald-700/60 backdrop-blur-md transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Generate Reports</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="group p-5 bg-white dark:bg-emerald-950/60 rounded-2xl border border-emerald-100 dark:border-emerald-900/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-emerald-300/80">
                  {card.title}
                </span>
                <div
                  className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${card.color} text-white flex items-center justify-center shadow-md`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-emerald-950 dark:text-white">
                  {card.value}
                </span>
                <ArrowUpRight className="w-4 h-4 text-emerald-500 group-hover:text-emerald-600 transition-colors" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Generational Breakdown Chart */}
        <div className="p-6 bg-white dark:bg-emerald-950/60 rounded-2xl border border-emerald-100 dark:border-emerald-900/60 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-emerald-950 dark:text-white">
                Generational Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-emerald-300/80">
                Total family members recorded across generations
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
              {data?.charts?.generationData?.length || 0} Generations
            </span>
          </div>

          <div className="h-64 w-full">
            {data?.charts?.generationData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.charts.generationData}>
                  <XAxis dataKey="generation" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#064e3b",
                      border: "none",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" fill="#059669" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No generational data recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Gender Distribution Pie Chart */}
        <div className="p-6 bg-white dark:bg-emerald-950/60 rounded-2xl border border-emerald-100 dark:border-emerald-900/60 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-emerald-950 dark:text-white">
                Demographic Profile
              </h3>
              <p className="text-xs text-slate-500 dark:text-emerald-300/80">
                Gender ratio of registered family members
              </p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {data?.charts?.genderData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.charts.genderData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {data.charts.genderData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#064e3b",
                      border: "none",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">
                No member records available yet.
              </div>
            )}
          </div>
          {data?.charts?.genderData?.length > 0 && (
            <div className="flex justify-center gap-6 mt-2">
              {data.charts.genderData.map((g: any) => (
                <div key={g.name} className="flex items-center gap-2 text-xs">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: g.color }}
                  />
                  <span className="text-slate-600 dark:text-slate-300">
                    {g.name}: <strong>{g.value}</strong>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tables Row: Recent Members & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Members */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-emerald-950/60 rounded-2xl border border-emerald-100 dark:border-emerald-900/60 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-emerald-950 dark:text-white">
              Recently Enrolled Family Members
            </h3>
            <Link
              href="/members"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              View All
            </Link>
          </div>

          {data?.recentMembers?.length > 0 ? (
            <div className="divide-y divide-emerald-50 dark:divide-emerald-900/40">
              {data.recentMembers.map((m: any) => (
                <div
                  key={m.id}
                  className="py-3.5 flex items-center justify-between hover:bg-emerald-50/50 dark:hover:bg-emerald-900/30 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
                      {m.firstName?.[0]}
                      {m.surname?.[0]}
                    </div>
                    <div>
                      <Link
                        href={`/members/${m.id}`}
                        className="text-sm font-semibold text-slate-900 dark:text-white hover:text-emerald-600 transition-colors"
                      >
                        {m.fullName}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-emerald-300/80">
                        <span>{m.memberId}</span>
                        <span>•</span>
                        <span>Gen {m.generation}</span>
                        {m.family?.name && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                              {m.family.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        m.isDeceased
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                      }`}
                    >
                      {m.isDeceased ? "Deceased" : "Living"}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {formatDate(m.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-slate-400">
              No family members added yet. Click &quot;Add Member&quot; to begin your archive!
            </div>
          )}
        </div>

        {/* Recent Activity Log */}
        <div className="p-6 bg-white dark:bg-emerald-950/60 rounded-2xl border border-emerald-100 dark:border-emerald-900/60 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-emerald-950 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Activity Log</span>
            </h3>
          </div>

          {data?.recentActivities?.length > 0 ? (
            <div className="space-y-4">
              {data.recentActivities.map((act: any) => (
                <div key={act.id} className="flex gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-slate-800 dark:text-slate-200 font-medium">
                      {act.details || act.action}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {formatDate(act.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              No recorded activities yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
