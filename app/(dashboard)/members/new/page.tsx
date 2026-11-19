"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  UserPlus,
  ArrowLeft,
  Calendar,
  Building,
  User,
  HeartHandshake,
  Shield,
  FileText,
  Upload,
} from "lucide-react";

export default function NewMemberPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultFamilyId = searchParams.get("familyId") || "";

  const [families, setFamilies] = useState<any[]>([]);
  const [existingMembers, setExistingMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
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
    photoUrl: "",
    ancestralOrigin: "",
    notes: "",
    phone: "",
    email: "",
    address: "",
    familyId: defaultFamilyId,
    fatherId: "",
    motherId: "",
    spouseId: "",
  });

  useEffect(() => {
    // Load families
    fetch("/api/families")
      .then((res) => res.json())
      .then((data) => setFamilies(data.families || []))
      .catch(console.error);

    // Load existing members for parent and spouse dropdowns
    fetch("/api/members")
      .then((res) => res.json())
      .then((data) => setExistingMembers(data.members || []))
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create member.");

      router.push(`/members/${data.member.id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const potentialFathers = existingMembers.filter((m) => m.gender === "MALE");
  const potentialMothers = existingMembers.filter((m) => m.gender === "FEMALE");

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          href="/members"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Enroll New Family Member
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Record personal history, ancestral connections, and relational lineage.
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
          {/* Section 1: Personal Details */}
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
                  placeholder="e.g. Usman"
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
                  placeholder="e.g. Bello"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Surname (Family Name) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.surname}
                  onChange={(e) =>
                    setFormData({ ...formData, surname: e.target.value })
                  }
                  placeholder="e.g. Danladi"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Gender *
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
                  <option value="OTHER">Other / Unspecified</option>
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
                  placeholder="e.g. Keffi, Nasarawa"
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
                  Nationality
                </label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) =>
                    setFormData({ ...formData, nationality: e.target.value })
                  }
                  placeholder="Nigerian"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Occupation / Trade
                </label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) =>
                    setFormData({ ...formData, occupation: e.target.value })
                  }
                  placeholder="e.g. Farmer, Educator, Public Servant"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
                />
              </div>
            </div>

            {/* Living vs Deceased status */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDeceasedCheck"
                  checked={formData.isDeceased}
                  onChange={(e) =>
                    setFormData({ ...formData, isDeceased: e.target.checked })
                  }
                  className="w-4 h-4 text-emerald- rounded focus:ring-emerald-"
                />
                <label
                  htmlFor="isDeceasedCheck"
                  className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  This family member is deceased (record as ancestor)
                </label>
              </div>

              {formData.isDeceased && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Date of Death (if known)
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
                      placeholder="e.g. Lafia Cemetery"
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Genealogical & Relational Connections */}
          <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold uppercase tracking-wider text-emerald- dark:text-emerald- flex items-center gap-2">
              <HeartHandshake className="w-4 h-4" />
              <span>2. Lineage & Family Connections</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Family Group / Branch
                </label>
                <select
                  value={formData.familyId}
                  onChange={(e) =>
                    setFormData({ ...formData, familyId: e.target.value })
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
                >
                  <option value="">No Specific Group (Independent)</option>
                  {families.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ancestral Origin / Clan
                </label>
                <input
                  type="text"
                  value={formData.ancestralOrigin}
                  onChange={(e) =>
                    setFormData({ ...formData, ancestralOrigin: e.target.value })
                  }
                  placeholder="e.g. Keffi Old Settlement, Alago clan"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Father (Optional)
                </label>
                <select
                  value={formData.fatherId}
                  onChange={(e) =>
                    setFormData({ ...formData, fatherId: e.target.value })
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
                >
                  <option value="">Unknown / None Recorded</option>
                  {potentialFathers.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.fullName} ({f.memberId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mother (Optional)
                </label>
                <select
                  value={formData.motherId}
                  onChange={(e) =>
                    setFormData({ ...formData, motherId: e.target.value })
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
                >
                  <option value="">Unknown / None Recorded</option>
                  {potentialMothers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.memberId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Spouse (Optional)
                </label>
                <select
                  value={formData.spouseId}
                  onChange={(e) =>
                    setFormData({ ...formData, spouseId: e.target.value })
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
                >
                  <option value="">No Spouse / Unmarried</option>
                  {existingMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.memberId})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Biography & Notes */}
          <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold uppercase tracking-wider text-emerald- dark:text-emerald- flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>3. Biography, History & Contacts</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Life Biography & Accomplishments
              </label>
              <textarea
                rows={3}
                value={formData.biography}
                onChange={(e) =>
                  setFormData({ ...formData, biography: e.target.value })
                }
                placeholder="Narrative biography, personal milestones, education, service..."
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Phone (Optional)
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+234 800 000 0000"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="relative@gmail.com"
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
                placeholder="e.g. Sabon Gari, Keffi"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/members"
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald- hover:bg-emerald- shadow-lg shadow-emerald-/30 transition-all disabled:opacity-50"
            >
              {loading ? "Registering..." : "Save Family Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
