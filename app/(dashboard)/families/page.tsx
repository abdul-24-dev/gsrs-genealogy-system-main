"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users2,
  Plus,
  Search,
  MapPin,
  Calendar,
  Building,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function FamiliesPage() {
  const [families, setFamilies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    origin: "",
    community: "",
    lga: "",
    state: "Nasarawa",
    country: "Nigeria",
    history: "",
  });

  const loadFamilies = async (query = "") => {
    try {
      setLoading(true);
      const res = await fetch(`/api/families?search=${encodeURIComponent(query)}`);
      const data = await res.json();
      setFamilies(data.families || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFamilies();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadFamilies(search);
  };

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const res = await fetch("/api/families", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create family.");

      setShowModal(false);
      setFormData({
        name: "",
        description: "",
        origin: "",
        community: "",
        lga: "",
        state: "Nasarawa",
        country: "Nigeria",
        history: "",
      });
      loadFamilies();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Family Groups & Clans
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Organize records by family branches, ancestral communities, and local heritage.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-lg shadow-emerald-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Family Group</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search family by name, ancestral community, LGA, or state..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-sm font-medium transition-all"
          >
            Search
          </button>
        </form>
      </div>

      {/* Family Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : families.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {families.map((fam) => (
            <div
              key={fam.id}
              className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between p-6"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
                      <Users2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                        {fam.name}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {fam.community ? `${fam.community}, ` : ""}
                        {fam.state || "Nasarawa"}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                  {fam.description || fam.history || "No historical notes provided."}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <span>{fam._count?.members || 0} Members</span>
                  <span>•</span>
                  <span>{fam._count?.documents || 0} Docs</span>
                </div>

                <Link
                  href={`/families/${fam.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <Users2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            No family groups found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            Create your first family group (e.g. Al-Makura Royal Lineage, Mai-Angwa Family) to start organizing lineages.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Add Family Group</span>
          </button>
        </div>
      )}

      {/* Modal: Create Family */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Create New Family Group
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Enter the family lineage details and geographical heritage.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateFamily} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Family Group Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Bako Ancestral House"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Community / Clan
                  </label>
                  <input
                    type="text"
                    value={formData.community}
                    onChange={(e) => setFormData({ ...formData, community: e.target.value })}
                    placeholder="e.g. Keffi, Lafia, Akwanga"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    LGA
                  </label>
                  <input
                    type="text"
                    value={formData.lga}
                    onChange={(e) => setFormData({ ...formData, lga: e.target.value })}
                    placeholder="e.g. Keffi LGA"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="Nasarawa"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Nigeria"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Brief Family Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summary of this family branch..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Family History & Heritage
                </label>
                <textarea
                  rows={3}
                  value={formData.history}
                  onChange={(e) => setFormData({ ...formData, history: e.target.value })}
                  placeholder="Detailed oral or written lineage history, migration, origins..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Create Family"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
