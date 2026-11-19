"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, FileText, HeartHandshake } from "lucide-react";

export default function EditMemberPage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params.id as string;

  const [families, setFamilies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    surname: "",
    gender: "MALE",
    dateOfBirth: "",
    placeOfBirth: "",
    isDeceased: false,
    dateOfDeath: "",
    placeOfDeath: "",
    maritalStatus: "SINGLE",
    nationality: "Nigerian",
    occupation: "",
    biography: "",
    ancestralOrigin: "",
    notes: "",
    phone: "",
    email: "",
    address: "",
    familyId: "",
  });

  useEffect(() => {
    fetch("/api/families")
      .then((res) => res.json())
      .then((data) => setFamilies(data.families || []))
      .catch(console.error);

    fetch(`/api/members/${memberId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Member not found");
        return res.json();
      })
      .then((data) => {
        const m = data.member;
        setFormData({
          firstName: m.firstName || "",
          middleName: m.middleName || "",
          surname: m.surname || "",
          gender: m.gender || "MALE",
          dateOfBirth: m.dateOfBirth ? m.dateOfBirth.split("T")[0] : "",
          placeOfBirth: m.placeOfBirth || "",
          isDeceased: !!m.isDeceased,
          dateOfDeath: m.dateOfDeath ? m.dateOfDeath.split("T")[0] : "",
          placeOfDeath: m.placeOfDeath || "",
          maritalStatus: m.maritalStatus || "SINGLE",
          nationality: m.nationality || "Nigerian",
          occupation: m.occupation || "",
          biography: m.biography || "",
          ancestralOrigin: m.ancestralOrigin || "",
          notes: m.notes || "",
          phone: m.phone || "",
          email: m.email || "",
          address: m.address || "",
          familyId: m.familyId || "",
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [memberId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const res = await fetch(`/api/members/${memberId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update member");

      router.push(`/members/${memberId}`);
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto animate-pulse">
        <div className="h-8 w-40 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          href={`/members/${memberId}`}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Edit Member Record
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Update personal, biographical, and archival information.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Personal */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-emerald- dark:text-emerald- flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>1. Personal Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Middle Name
                </label>
                <input
                  type="text"
                  value={formData.middleName}
                  onChange={(e) =>
                    setFormData({ ...formData, middleName: e.target.value })
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Surname *
                </label>
                <input
                  type="text"
                  required
                  value={formData.surname}
                  onChange={(e) =>
                    setFormData({ ...formData, surname: e.target.value })
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    setFormData({ ...formData, dateOfBirth: e.target.value })
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Place of Birth
                </label>
                <input
                  type="text"
                  value={formData.placeOfBirth}
                  onChange={(e) =>
                    setFormData({ ...formData, placeOfBirth: e.target.value })
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Marital Status
                </label>
                <select
                  value={formData.maritalStatus}
                  onChange={(e) =>
                    setFormData({ ...formData, maritalStatus: e.target.value })
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
                >
                  <option value="SINGLE">Single</option>
                  <option value="MARRIED">Married</option>
                  <option value="DIVORCED">Divorced</option>
                  <option value="WIDOWED">Widowed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Occupation
                </label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) =>
                    setFormData({ ...formData, occupation: e.target.value })
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Family Group
                </label>
                <select
                  value={formData.familyId}
                  onChange={(e) =>
                    setFormData({ ...formData, familyId: e.target.value })
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
                >
                  <option value="">Independent (No specific group)</option>
                  {families.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Living / Deceased */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editIsDeceased"
                  checked={formData.isDeceased}
                  onChange={(e) =>
                    setFormData({ ...formData, isDeceased: e.target.checked })
                  }
                  className="w-4 h-4 text-emerald- rounded focus:ring-emerald-"
                />
                <label
                  htmlFor="editIsDeceased"
                  className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  Deceased Ancestor
                </label>
              </div>

              {formData.isDeceased && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Date of Death
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfDeath}
                      onChange={(e) =>
                        setFormData({ ...formData, dateOfDeath: e.target.value })
                      }
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Place of Death / Burial Place
                    </label>
                    <input
                      type="text"
                      value={formData.placeOfDeath}
                      onChange={(e) =>
                        setFormData({ ...formData, placeOfDeath: e.target.value })
                      }
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Bio & Contacts */}
          <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold uppercase tracking-wider text-emerald- dark:text-emerald- flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>2. Biography & Contacts</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Life Biography
              </label>
              <textarea
                rows={4}
                value={formData.biography}
                onChange={(e) =>
                  setFormData({ ...formData, biography: e.target.value })
                }
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Residential Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <Link
              href={`/members/${memberId}`}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald- hover:bg-emerald- shadow-lg shadow-emerald-/30 transition-all disabled:opacity-50"
            >
              {saving ? "Saving Changes..." : "Update Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
