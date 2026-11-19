"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  UserCheck,
  UserPlus,
  Search,
  Filter,
  Users2,
  Calendar,
  Sparkles,
  ArrowRight,
  Archive,
  RotateCcw,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function MembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [families, setFamilies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedFamily, setSelectedFamily] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(""); // living, deceased
  const [selectedGen, setSelectedGen] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedFamily) params.append("familyId", selectedFamily);
      if (selectedGender) params.append("gender", selectedGender);
      if (selectedStatus) params.append("status", selectedStatus);
      if (selectedGen) params.append("generation", selectedGen);
      if (showArchived) params.append("archived", "true");

      const res = await fetch(`/api/members?${params.toString()}`);
      const data = await res.json();
      setMembers(data.members || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/families")
      .then((res) => res.json())
      .then((data) => setFamilies(data.families || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    loadMembers();
  }, [selectedFamily, selectedGender, selectedStatus, selectedGen, showArchived]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadMembers();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Family Members Directory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Comprehensive register of ancestors, descendants, and living relatives.
          </p>
        </div>

        <Link
          href="/members/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald- hover:bg-emerald- text-white text-sm font-semibold shadow-lg shadow-emerald-/30 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Family Member</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by full name, surname, member ID, birthplace, or occupation..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-/20"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-sm font-medium transition-all"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Family Filter */}
          <select
            value={selectedFamily}
            onChange={(e) => setSelectedFamily(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Family Groups</option>
            {families.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          {/* Gender Filter */}
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Genders</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">Living & Deceased</option>
            <option value="living">Living Only</option>
            <option value="deceased">Deceased Only</option>
          </select>

          {/* Generation Filter */}
          <select
            value={selectedGen}
            onChange={(e) => setSelectedGen(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Generations</option>
            {[1, 2, 3, 4, 5, 6, 7].map((g) => (
              <option key={g} value={g}>
                Generation {g}
              </option>
            ))}
          </select>

          {/* Archive Toggle */}
          <div className="flex items-center gap-2 px-2">
            <input
              type="checkbox"
              id="archivedCheck"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="rounded text-emerald- focus:ring-emerald- w-4 h-4"
            />
            <label
              htmlFor="archivedCheck"
              className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer"
            >
              Show Archived
            </label>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            ))}
          </div>
        ) : members.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Member ID</th>
                  <th className="py-3.5 px-4">Full Name</th>
                  <th className="py-3.5 px-4">Family Group</th>
                  <th className="py-3.5 px-4">Gender</th>
                  <th className="py-3.5 px-4">Generation</th>
                  <th className="py-3.5 px-4">Birth Date</th>
                  <th className="py-3.5 px-4">Parents</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {members.map((m) => {
                  const parentNames = m.parentRelations
                    ?.map((r: any) => r.parent.fullName)
                    .join(", ");

                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono text-xs text-emerald- dark:text-emerald- font-semibold">
                        {m.memberId}
                      </td>
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/members/${m.id}`}
                          className="font-semibold text-slate-900 dark:text-white hover:text-emerald- transition-colors flex items-center gap-2"
                        >
                          {m.fullName}
                        </Link>
                        {m.occupation && (
                          <span className="text-[11px] text-slate-400 block">
                            {m.occupation}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                        {m.family?.name || "Independent"}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                        {m.gender}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald- dark:bg-emerald-/30 text-emerald- dark:text-emerald-">
                          Gen {m.generation}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                        {formatDate(m.dateOfBirth)}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 max-w-[180px] truncate">
                        {parentNames || "Unknown"}
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
                          className="text-xs font-bold text-emerald- dark:text-emerald- hover:underline"
                        >
                          View Profile
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400 text-sm">
            No family members match your filter criteria.
          </div>
        )}
      </div>
    </div>
  );
}
