"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  HeartHandshake,
  GitFork,
  ArrowLeft,
  Calendar,
  MapPin,
  Briefcase,
  Edit,
  Trash2,
  Plus,
  FileText,
  Upload,
  Link2,
  Sparkles,
  Phone,
  Mail,
  Home,
  X,
  Download,
} from "lucide-react";
import { formatDate, calculateAge, formatFileSize } from "@/lib/utils";

export default function MemberProfilePage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Relationship modal state
  const [showRelModal, setShowRelModal] = useState(false);
  const [relType, setRelType] = useState<"parent" | "child" | "spouse">("parent");
  const [targetMemberId, setTargetMemberId] = useState("");
  const [relCategory, setRelCategory] = useState("BIOLOGICAL");
  const [availableCandidates, setAvailableCandidates] = useState<any[]>([]);
  const [relSubmitting, setRelSubmitting] = useState(false);
  const [relError, setRelError] = useState<string | null>(null);

  // Document upload modal state
  const [showDocModal, setShowDocModal] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [docCategory, setDocCategory] = useState("PHOTOGRAPH");
  const [docDescription, setDocDescription] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docSubmitting, setDocSubmitting] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);

  const loadMember = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/members/${memberId}`);
      if (!res.ok) throw new Error("Member not found");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (memberId) loadMember();
  }, [memberId]);

  // Load candidate members for relationship picker
  const openRelModal = async (type: "parent" | "child" | "spouse") => {
    setRelType(type);
    setRelError(null);
    setTargetMemberId("");
    setShowRelModal(true);

    try {
      const res = await fetch("/api/members");
      const json = await res.json();
      // Exclude self from candidates
      const filtered = (json.members || []).filter((m: any) => m.id !== memberId);
      setAvailableCandidates(filtered);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddRelationship = async (e: React.FormEvent) => {
    e.preventDefault();
    setRelError(null);
    if (!targetMemberId) {
      setRelError("Please select a member.");
      return;
    }

    setRelSubmitting(true);
    try {
      const res = await fetch(`/api/members/${memberId}/relationships`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: relType,
          targetMemberId,
          relationshipType: relCategory,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to add relationship.");

      setShowRelModal(false);
      loadMember();
    } catch (err: any) {
      setRelError(err.message);
    } finally {
      setRelSubmitting(false);
    }
  };

  const handleRemoveRelationship = async (
    type: "parent" | "child" | "spouse",
    relId: string
  ) => {
    if (!confirm("Are you sure you want to remove this family relationship link?")) {
      return;
    }

    try {
      const res = await fetch(
        `/api/members/${memberId}/relationships?type=${type}&relId=${relId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to remove relationship");
      loadMember();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setDocError(null);

    if (!docFile) {
      setDocError("Please select a file to upload.");
      return;
    }

    setDocSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", docFile);
      formData.append("title", docTitle);
      formData.append("category", docCategory);
      formData.append("description", docDescription);
      formData.append("memberId", memberId);

      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.error || "Upload failed");

      setShowDocModal(false);
      setDocFile(null);
      setDocTitle("");
      setDocDescription("");
      loadMember();
    } catch (err: any) {
      setDocError(err.message);
    } finally {
      setDocSubmitting(false);
    }
  };

  const handleDeleteMember = async () => {
    if (
      !confirm(
        `Are you sure you want to permanently delete ${member?.fullName} (${member?.memberId})? Connected family links will be safely cleaned up.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/members/${memberId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete member");
      router.replace("/members");
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="grid grid-cols-2 gap-6">
          <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !data?.member) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <p className="text-red-500 font-semibold mb-4">{error || "Member not found."}</p>
        <Link
          href="/members"
          className="inline-flex items-center gap-2 text-sm text-emerald- font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Members</span>
        </Link>
      </div>
    );
  }

  const { member, siblings } = data;

  // Extract spouses from both marriage relation angles
  const spouses = [
    ...(member.marriagesAsSpouse1 || []).map((m: any) => ({
      relId: m.id,
      person: m.spouse2,
      status: m.status,
      date: m.marriageDate,
    })),
    ...(member.marriagesAsSpouse2 || []).map((m: any) => ({
      relId: m.id,
      person: m.spouse1,
      status: m.status,
      date: m.marriageDate,
    })),
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Bar Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          href="/members"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Member Directory</span>
        </Link>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href={`/family-tree?focusId=${member.id}`}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald- hover:bg-emerald- text-white text-xs font-semibold shadow-md shadow-emerald-/20 transition-all"
          >
            <GitFork className="w-4 h-4" />
            <span>Focus Family Tree</span>
          </Link>

          <Link
            href={`/members/${member.id}/edit`}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </Link>

          <button
            onClick={handleDeleteMember}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Record</span>
          </button>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald- to-emerald- text-white flex items-center justify-center font-bold text-3xl shadow-xl shadow-emerald-/20 shrink-0">
              {member.firstName?.[0]}
              {member.surname?.[0]}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {member.fullName}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    member.isDeceased
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                  }`}
                >
                  {member.isDeceased ? "Deceased" : "Living"}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span className="font-mono text-emerald- dark:text-emerald- font-bold">
                  {member.memberId}
                </span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald- dark:bg-emerald-/40 text-emerald- dark:text-emerald-">
                  Generation {member.generation}
                </span>
                {member.family && (
                  <>
                    <span>•</span>
                    <Link
                      href={`/families/${member.family.id}`}
                      className="text-emerald- dark:text-emerald- hover:underline"
                    >
                      {member.family.name}
                    </Link>
                  </>
                )}
                <span>•</span>
                <span>{member.gender}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 bg-slate-50 dark:bg-slate-800/60 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Age</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {calculateAge(member.dateOfBirth, member.dateOfDeath, member.isDeceased)}
              </span>
            </div>
            <div className="w-px h-6 bg-slate-300 dark:bg-slate-700" />
            <div>
              <span className="text-slate-400 block font-medium">Born</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {formatDate(member.dateOfBirth)}
              </span>
            </div>
            {member.isDeceased && (
              <>
                <div className="w-px h-6 bg-slate-300 dark:bg-slate-700" />
                <div>
                  <span className="text-slate-400 block font-medium">Died</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {formatDate(member.dateOfDeath)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Life details summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block">Place of Birth</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {member.placeOfBirth || "Unspecified"}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block">Occupation / Profession</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {member.occupation || "Unspecified"}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block">Ancestral Clan / Origin</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {member.ancestralOrigin || "Unspecified"}
            </span>
          </div>
        </div>

        {/* Biography */}
        {member.biography && (
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Life Biography & History
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {member.biography}
            </p>
          </div>
        )}
      </div>

      {/* Relational Hierarchy Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Parents Card */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Parents & Ancestors
              </h3>
              <p className="text-xs text-slate-400">Biological and adoptive parents</p>
            </div>
            <button
              onClick={() => openRelModal("parent")}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-emerald- dark:bg-emerald-/30 text-emerald- dark:text-emerald- hover:bg-emerald-"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Link Parent</span>
            </button>
          </div>

          {member.parentRelations?.length > 0 ? (
            <div className="space-y-3">
              {member.parentRelations.map((rel: any) => (
                <div
                  key={rel.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald- dark:bg-emerald-/40 text-emerald- dark:text-emerald- flex items-center justify-center font-bold text-xs">
                      {rel.parent.gender === "MALE" ? "Father" : "Mother"}
                    </div>
                    <div>
                      <Link
                        href={`/members/${rel.parent.id}`}
                        className="text-sm font-semibold text-slate-900 dark:text-white hover:text-emerald-"
                      >
                        {rel.parent.fullName}
                      </Link>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {rel.parent.memberId} • {rel.relationshipType}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveRelationship("parent", rel.id)}
                    className="text-slate-400 hover:text-red-500 p-1"
                    title="Remove link"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-4 text-center">
              No parents linked. Click &quot;Link Parent&quot; to connect ancestors.
            </p>
          )}
        </div>

        {/* Spouses Card */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Spouse(s) & Marriage Records
              </h3>
              <p className="text-xs text-slate-400">Current and historical spouses</p>
            </div>
            <button
              onClick={() => openRelModal("spouse")}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-emerald- dark:bg-emerald-/30 text-emerald- dark:text-emerald- hover:bg-emerald-"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Link Spouse</span>
            </button>
          </div>

          {spouses.length > 0 ? (
            <div className="space-y-3">
              {spouses.map((s: any) => (
                <div
                  key={s.relId}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-300 flex items-center justify-center font-bold text-xs">
                      Spouse
                    </div>
                    <div>
                      <Link
                        href={`/members/${s.person.id}`}
                        className="text-sm font-semibold text-slate-900 dark:text-white hover:text-emerald-"
                      >
                        {s.person.fullName}
                      </Link>
                      <p className="text-[11px] text-slate-400">
                        {s.person.memberId} • {s.status}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveRelationship("spouse", s.relId)}
                    className="text-slate-400 hover:text-red-500 p-1"
                    title="Remove link"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-4 text-center">
              No spouses recorded.
            </p>
          )}
        </div>

        {/* Children Card */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Children & Descendants ({member.childRelations?.length || 0})
              </h3>
              <p className="text-xs text-slate-400">Recorded offspring</p>
            </div>
            <button
              onClick={() => openRelModal("child")}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-emerald- dark:bg-emerald-/30 text-emerald- dark:text-emerald- hover:bg-emerald-"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Link Child</span>
            </button>
          </div>

          {member.childRelations?.length > 0 ? (
            <div className="space-y-3">
              {member.childRelations.map((rel: any) => (
                <div
                  key={rel.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                      Child
                    </div>
                    <div>
                      <Link
                        href={`/members/${rel.child.id}`}
                        className="text-sm font-semibold text-slate-900 dark:text-white hover:text-emerald-"
                      >
                        {rel.child.fullName}
                      </Link>
                      <p className="text-[11px] text-slate-400">
                        {rel.child.memberId} • {formatDate(rel.child.dateOfBirth)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveRelationship("child", rel.id)}
                    className="text-slate-400 hover:text-red-500 p-1"
                    title="Remove link"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-4 text-center">
              No children linked. Click &quot;Link Child&quot; to connect descendants.
            </p>
          )}
        </div>

        {/* Siblings Card */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Brothers & Sisters ({siblings?.length || 0})
              </h3>
              <p className="text-xs text-slate-400">
                Automatically calculated based on shared parents
              </p>
            </div>
          </div>

          {siblings?.length > 0 ? (
            <div className="space-y-3">
              {siblings.map((sib: any) => (
                <div
                  key={sib.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold text-xs">
                      {sib.gender === "MALE" ? "Brother" : "Sister"}
                    </div>
                    <div>
                      <Link
                        href={`/members/${sib.id}`}
                        className="text-sm font-semibold text-slate-900 dark:text-white hover:text-emerald-"
                      >
                        {sib.fullName}
                      </Link>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {sib.memberId}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-4 text-center">
              No siblings detected. Linking parents will automatically detect brothers and sisters.
            </p>
          )}
        </div>
      </div>

      {/* Supporting Documents & Historical Records Section */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Photographs & Supporting Documents ({member.documents?.length || 0})
            </h3>
            <p className="text-xs text-slate-400">
              Certificates, portrait photos, and historical artifacts for {member.fullName}
            </p>
          </div>

          <button
            onClick={() => setShowDocModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald- hover:bg-emerald- text-white text-xs font-semibold shadow-md transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </button>
        </div>

        {member.documents?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {member.documents.map((doc: any) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald- dark:bg-emerald-/40 text-emerald- dark:text-emerald-">
                      {doc.category.replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatFileSize(doc.fileSize)}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {doc.title}
                  </h4>
                  {doc.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {doc.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    {formatDate(doc.uploadDate)}
                  </span>
                  <a
                    href={`/api/documents/${doc.id}/download`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald- dark:text-emerald- hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No historical documents uploaded for this member. Click &quot;Upload Document&quot; to preserve birth certificates, marriage certificates, or photos.
          </div>
        )}
      </div>

      {/* Relationship Linking Modal */}
      {showRelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Link Family Relationship
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Connect {member.fullName} to another relative in the archive.
            </p>

            {relError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs">
                {relError}
              </div>
            )}

            <form onSubmit={handleAddRelationship} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Relationship Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRelType("parent")}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      relType === "parent"
                        ? "bg-emerald- text-white border-emerald-"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    Parent
                  </button>
                  <button
                    type="button"
                    onClick={() => setRelType("child")}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      relType === "child"
                        ? "bg-emerald- text-white border-emerald-"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    Child
                  </button>
                  <button
                    type="button"
                    onClick={() => setRelType("spouse")}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      relType === "spouse"
                        ? "bg-emerald- text-white border-emerald-"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    Spouse
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Relative *
                </label>
                <select
                  required
                  value={targetMemberId}
                  onChange={(e) => setTargetMemberId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
                >
                  <option value="">-- Choose Member --</option>
                  {availableCandidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.memberId} • Gen {c.generation})
                    </option>
                  ))}
                </select>
              </div>

              {relType !== "spouse" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Connection Category
                  </label>
                  <select
                    value={relCategory}
                    onChange={(e) => setRelCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
                  >
                    <option value="BIOLOGICAL">Biological</option>
                    <option value="ADOPTED">Adopted</option>
                    <option value="STEP">Step</option>
                    <option value="FOSTER">Foster</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRelModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={relSubmitting}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-emerald- hover:bg-emerald- transition-all disabled:opacity-50"
                >
                  {relSubmitting ? "Linking..." : "Establish Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Upload Modal */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Upload Document for {member.fullName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Add photographs, birth/marriage/death certificates, or historical records.
            </p>

            {docError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs">
                {docError}
              </div>
            )}

            <form onSubmit={handleUploadDocument} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Birth Certificate / 1985 Portrait"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
                >
                  <option value="PHOTOGRAPH">Historical Photograph</option>
                  <option value="BIRTH_CERTIFICATE">Birth Certificate</option>
                  <option value="MARRIAGE_CERTIFICATE">Marriage Certificate</option>
                  <option value="DEATH_CERTIFICATE">Death Certificate</option>
                  <option value="HISTORICAL_DOCUMENT">Historical Record</option>
                  <option value="OTHER">Other Supporting Document</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Annotation
                </label>
                <textarea
                  rows={2}
                  value={docDescription}
                  onChange={(e) => setDocDescription(e.target.value)}
                  placeholder="Notes about document origin or significance..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select File (Images, PDF, Docs) *
                </label>
                <input
                  type="file"
                  required
                  onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald- file:text-emerald- hover:file:bg-emerald-"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={docSubmitting}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-emerald- hover:bg-emerald- transition-all disabled:opacity-50"
                >
                  {docSubmitting ? "Uploading..." : "Save Document"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
