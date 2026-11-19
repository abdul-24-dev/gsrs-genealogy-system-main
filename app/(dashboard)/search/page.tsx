"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Users2,
  Calendar,
  MapPin,
  Sparkles,
  ArrowRight,
  User,
  HeartHandshake,
  RotateCcw,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function SearchPage() {
  const [families, setFamilies] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Search parameters
  const [q, setQ] = useState("");
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [memberId, setMemberId] = useState("");
  const [familyId, setFamilyId] = useState("");
  const [gender, setGender] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [generation, setGeneration] = useState("");
  const [community, setCommunity] = useState("");
  const [state, setState] = useState("");
  const [status, setStatus] = useState("");

  const [advancedOpen, setAdvancedOpen] = useState(false);

  useEffect(() => {
    fetch("/api/families")
      .then((res) => res.json())
      .then((data) => setFamilies(data.families || []))
      .catch(console.error);

    // Initial search
    handleSearch();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setSearched(true);

    try {
      const params = new URLSearchParams();
      if (q) params.append("q", q);
      if (firstName) params.append("firstName", firstName);
      if (surname) params.append("surname", surname);
      if (memberId) params.append("memberId", memberId);
      if (familyId) params.append("familyId", familyId);
      if (gender) params.append("gender", gender);
      if (birthYear) params.append("birthYear", birthYear);
      if (generation) params.append("generation", generation);
      if (community) params.append("community", community);
      if (state) params.append("state", state);
      if (status) params.append("status", status);

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setQ("");
    setFirstName("");
    setSurname("");
    setMemberId("");
    setFamilyId("");
    setGender("");
    setBirthYear("");
    setGeneration("");
    setCommunity("");
    setState("");
    setStatus("");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Search className="w-6 h-6 text-emerald-" />
          <span>Genealogical Search Engine</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Query records across ancestors, descendants, surnames, and geographical origins.
        </p>
      </div>

      {/* Main Search Box */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search across all fields (name, surname, birthplace, clan, ID)..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-/20 text-slate-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-emerald- hover:bg-emerald- text-white font-semibold text-sm shadow-md shadow-emerald-/30 transition-all"
            >
              {loading ? "Searching..." : "Execute Search"}
            </button>
          </div>

          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="inline-flex items-center gap-1.5 font-semibold text-emerald- dark:text-emerald- hover:underline"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{advancedOpen ? "Hide Advanced Filters" : "Show Multi-Criteria Filters"}</span>
            </button>

            {advancedOpen && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Criteria</span>
              </button>
            )}
          </div>

          {/* Advanced Multi-Criteria Panel */}
          {advancedOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Amina"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Surname (Family Name)
                </label>
                <input
                  type="text"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  placeholder="e.g. Danladi"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Member ID
                </label>
                <input
                  type="text"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  placeholder="e.g. GSRS-1001"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Family Group
                </label>
                <select
                  value={familyId}
                  onChange={(e) => setFamilyId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="">Any Family Group</option>
                  {families.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Birth Year
                </label>
                <input
                  type="number"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  placeholder="e.g. 1965"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Generation Number
                </label>
                <select
                  value={generation}
                  onChange={(e) => setGeneration(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="">Any Generation</option>
                  {[1, 2, 3, 4, 5, 6].map((g) => (
                    <option key={g} value={g}>
                      Generation {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Community / Town
                </label>
                <input
                  type="text"
                  value={community}
                  onChange={(e) => setCommunity(e.target.value)}
                  placeholder="e.g. Keffi, Lafia"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  State of Origin
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Nasarawa"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span>Search Results ({results.length})</span>
          {searched && <span>Database Query Filtered</span>}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-36 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((m) => {
              const parents = m.parentRelations?.map((r: any) => r.parent.fullName);
              const spouses = [
                ...(m.marriagesAsSpouse1 || []).map((rel: any) => rel.spouse2.fullName),
                ...(m.marriagesAsSpouse2 || []).map((rel: any) => rel.spouse1.fullName),
              ];

              return (
                <div
                  key={m.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-emerald- dark:bg-emerald-/40 text-emerald- dark:text-emerald- flex items-center justify-center font-bold text-base shrink-0">
                      {m.firstName?.[0]}
                      {m.surname?.[0]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/members/${m.id}`}
                          className="font-bold text-base text-slate-900 dark:text-white hover:text-emerald- truncate"
                        >
                          {m.fullName}
                        </Link>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            m.isDeceased
                              ? "bg-slate-100 dark:bg-slate-800 text-slate-500"
                              : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600"
                          }`}
                        >
                          {m.isDeceased ? "Deceased" : "Living"}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        {m.memberId} • Gen {m.generation} • {m.gender}
                      </p>

                      <div className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                        {m.family && (
                          <p>
                            <span className="text-slate-400">Family: </span>
                            <span className="font-semibold text-emerald- dark:text-emerald-">
                              {m.family.name}
                            </span>
                          </p>
                        )}
                        <p>
                          <span className="text-slate-400">Birth: </span>
                          <span>
                            {formatDate(m.dateOfBirth)}{" "}
                            {m.placeOfBirth ? `(${m.placeOfBirth})` : ""}
                          </span>
                        </p>
                        <p className="truncate">
                          <span className="text-slate-400">Parents: </span>
                          <span>{parents.length > 0 ? parents.join(", ") : "Not recorded"}</span>
                        </p>
                        {spouses.length > 0 && (
                          <p className="truncate">
                            <span className="text-slate-400">Spouse(s): </span>
                            <span>{spouses.join(", ")}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                    <Link
                      href={`/members/${m.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald- dark:text-emerald- hover:underline"
                    >
                      <span>Open Complete Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              No matching genealogical records
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              Try adjusting your query or resetting the search filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
