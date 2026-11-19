"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users2,
  MapPin,
  Calendar,
  Building,
  UserPlus,
  ArrowLeft,
  Trash2,
  FileText,
  User,
  GitFork,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function FamilyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const familyId = params.id as string;

  const [family, setFamily] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFamily = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/families/${familyId}`);
      if (!res.ok) throw new Error("Family not found");
      const data = await res.json();
      setFamily(data.family);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (familyId) loadFamily();
  }, [familyId]);

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${family.name}"? Members belonging to this family will NOT be deleted, only unlinked.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/families/${familyId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete family");
      router.replace("/families");
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-40 bg-emerald-900/20 rounded-lg" />
        <div className="h-48 bg-emerald-900/20 rounded-2xl" />
      </div>
    );
  }

  if (error || !family) {
    return (
      <div className="p-8 text-center bg-white dark:bg-emerald-950/80 rounded-2xl border border-emerald-100 dark:border-emerald-900/80">
        <p className="text-red-500 font-semibold mb-4">{error || "Family not found."}</p>
        <Link
          href="/families"
          className="inline-flex items-center gap-2 text-sm text-emerald-600 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Families</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/families"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Families</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href={`/family-tree?familyId=${family.id}`}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
          >
            <GitFork className="w-4 h-4 text-emerald-600" />
            <span>View Lineage Tree</span>
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Group</span>
          </button>
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-white dark:bg-emerald-950/60 rounded-2xl border border-emerald-100 dark:border-emerald-900/60 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl shadow-xl shadow-emerald-500/20">
              <Users2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-emerald-950 dark:text-white">
                {family.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500 dark:text-emerald-300/80">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {family.community ? `${family.community}, ` : ""}
                  {family.lga ? `${family.lga}, ` : ""}
                  {family.state || "Nasarawa"}, {family.country || "Nigeria"}
                </span>
                <span>•</span>
                <span>Created {formatDate(family.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 bg-emerald-50 dark:bg-emerald-900/40 px-6 py-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <div className="text-center">
              <span className="block text-xl font-bold text-emerald-950 dark:text-white">
                {family._count?.members || 0}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Members</span>
            </div>
            <div className="w-px h-8 bg-emerald-200 dark:bg-emerald-800" />
            <div className="text-center">
              <span className="block text-xl font-bold text-emerald-950 dark:text-white">
                {family._count?.documents || 0}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Documents</span>
            </div>
          </div>
        </div>

        {family.description && (
          <div className="mt-6 pt-6 border-t border-emerald-100 dark:border-emerald-900/60">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Description
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {family.description}
            </p>
          </div>
        )}

        {family.history && (
          <div className="mt-6 pt-6 border-t border-emerald-100 dark:border-emerald-900/60">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Family History & Historical Background
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {family.history}
            </p>
          </div>
        )}
      </div>

      {/* Member Roster in this Family */}
      <div className="bg-white dark:bg-emerald-950/60 rounded-2xl border border-emerald-100 dark:border-emerald-900/60 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-emerald-950 dark:text-white">
              Family Members Roster
            </h2>
            <p className="text-xs text-slate-500 dark:text-emerald-300/80">
              All enrolled relatives associated with {family.name}
            </p>
          </div>

          <Link
            href={`/members/new?familyId=${family.id}`}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Member to Group</span>
          </Link>
        </div>

        {family.members?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-emerald-50 dark:bg-emerald-900/40 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-emerald-300/80 border-b border-emerald-100 dark:border-emerald-900/60">
                <tr>
                  <th className="py-3 px-4">Member ID</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Gender</th>
                  <th className="py-3 px-4">Generation</th>
                  <th className="py-3 px-4">Birth Date / Place</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50 dark:divide-emerald-900/40">
                {family.members.map((m: any) => (
                  <tr
                    key={m.id}
                    className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/30 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      {m.memberId}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      <Link href={`/members/${m.id}`} className="hover:underline">
                        {m.fullName}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                      {m.gender}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                        Gen {m.generation}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                      {formatDate(m.dateOfBirth)}{" "}
                      {m.placeOfBirth ? `(${m.placeOfBirth})` : ""}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          m.isDeceased
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                            : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                        }`}
                      >
                        {m.isDeceased ? "Deceased" : "Living"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/members/${m.id}`}
                        className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-400">
            No members are currently enrolled under this family group. Click &quot;Add Member to Group&quot; to register relatives.
          </div>
        )}
      </div>
    </div>
  );
}
