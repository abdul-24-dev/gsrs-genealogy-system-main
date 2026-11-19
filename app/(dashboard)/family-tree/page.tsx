"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  GitFork,
  Search,
  Users2,
  Sparkles,
  ArrowRight,
  User,
  Compass,
} from "lucide-react";
import FamilyTreeCanvas from "@/components/genealogy/FamilyTreeCanvas";

export default function FamilyTreePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFocus = searchParams.get("focusId") || "";
  const initialFamily = searchParams.get("familyId") || "";

  const [focusId, setFocusId] = useState(initialFocus);
  const [familyId, setFamilyId] = useState(initialFamily);
  const [families, setFamilies] = useState<any[]>([]);
  const [treeData, setTreeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Search input within the tree
  const [memberSearch, setMemberSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const loadTree = async (fId: string, famId: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (fId) params.append("focusId", fId);
      if (famId) params.append("familyId", famId);

      const res = await fetch(`/api/tree?${params.toString()}`);
      const data = await res.json();
      setTreeData(data);
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
    loadTree(focusId, familyId);
  }, [focusId, familyId]);

  // Debounced member search for tree jump
  useEffect(() => {
    if (!memberSearch.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      fetch(`/api/members?search=${encodeURIComponent(memberSearch.trim())}`)
        .then((res) => res.json())
        .then((data) => setSearchResults((data.members || []).slice(0, 5)))
        .catch(console.error);
    }, 250);

    return () => clearTimeout(timer);
  }, [memberSearch]);

  const handleSelectSearchResult = (id: string) => {
    setFocusId(id);
    setMemberSearch("");
    setSearchResults([]);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <GitFork className="w-6 h-6 text-emerald-600" />
            <span>Interactive Family Tree</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Explore ancestral lineages, descendancy hierarchies, and generational branches.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Family Group Selector */}
          <select
            value={familyId}
            onChange={(e) => {
              setFamilyId(e.target.value);
              setFocusId("");
            }}
            className="px-3.5 py-2 bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Family Groups</option>
            {families.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          {/* Quick Search Person in Tree */}
          <div className="relative">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Find & center relative..."
                className="pl-8 pr-4 py-2 bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-56 shadow-sm"
              />
            </div>

            {searchResults.length > 0 && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-emerald-950 rounded-2xl border border-emerald-100 dark:border-emerald-800 shadow-2xl py-1 z-40">
                {searchResults.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleSelectSearchResult(m.id)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 dark:hover:bg-emerald-900 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold block text-slate-800 dark:text-slate-100">
                        {m.fullName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {m.memberId} • Gen {m.generation}
                      </span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Canvas or Empty State */}
      {loading ? (
        <div className="h-[700px] w-full bg-slate-100 dark:bg-slate-900 rounded-3xl animate-pulse flex items-center justify-center text-slate-400 text-sm">
          Generating relational pedigree graph...
        </div>
      ) : treeData?.members?.length > 0 ? (
        <FamilyTreeCanvas
          focusMember={treeData.focusMember}
          members={treeData.members}
          parentChildRels={treeData.parentChildRels}
          marriageRels={treeData.marriageRels}
          onFocusMember={(id) => setFocusId(id)}
        />
      ) : (
        <div className="h-[500px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center justify-center text-center">
          <GitFork className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            No Lineage Relationships Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-6">
            To view a family tree, register family members and link parent-child or marriage connections.
          </p>
          <button
            onClick={() => router.push("/members/new")}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all"
          >
            Add First Family Member
          </button>
        </div>
      )}
    </div>
  );
}
