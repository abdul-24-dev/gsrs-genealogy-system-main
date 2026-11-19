"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  Users,
  GitFork,
  Calendar,
  Building,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";

export default function AnalyticsPage() {
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
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  const charts = data?.charts || {};
  const summary = data?.summary || {};

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-emerald-" />
          <span>Demographic & Lineage Analytics</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Visual metrics depicting family generational spans, birth decades, and gender balance.
        </p>
      </div>

      {/* Row 1: Generational Distribution & Decade Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Generational Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Members per Generation Level
            </h3>
            <p className="text-xs text-slate-400">
              Depth of ancestral lineage recorded in the archive
            </p>
          </div>

          <div className="h-72 w-full">
            {charts.generationData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.generationData}>
                  <XAxis dataKey="generation" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
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

        {/* Births by Decade */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Birth Distribution Across Decades
            </h3>
            <p className="text-xs text-slate-400">
              Historical timeline of family members born across eras
            </p>
          </div>

          <div className="h-72 w-full">
            {charts.decadeData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.decadeData}>
                  <XAxis dataKey="decade" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "none",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.25}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Record birth dates to visualize timeline distribution.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Gender Demographics & Members per Family Group */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gender Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Gender Demographics
            </h3>
            <p className="text-xs text-slate-400">
              Male vs. Female balance in the family archive
            </p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {charts.genderData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.genderData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {charts.genderData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "none",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">No data available.</div>
            )}
          </div>

          {charts.genderData?.length > 0 && (
            <div className="flex justify-center gap-6 mt-2">
              {charts.genderData.map((g: any) => (
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

        {/* Members Per Family Group */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Family Group Distribution
            </h3>
            <p className="text-xs text-slate-400">
              Enrolled members grouped by family clan
            </p>
          </div>

          <div className="h-64 w-full">
            {charts.familyData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.familyData} layout="vertical">
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#94a3b8"
                    fontSize={11}
                    width={110}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "none",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No family groups created yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
