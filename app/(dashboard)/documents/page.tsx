"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FolderArchive,
  Upload,
  Search,
  Download,
  Trash2,
  FileText,
  Image as ImageIcon,
  User,
  Plus,
  Filter,
} from "lucide-react";
import { formatDate, formatFileSize } from "@/lib/utils";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMember, setSelectedMember] = useState("");

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState("PHOTOGRAPH");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadMemberId, setUploadMemberId] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedMember) params.append("memberId", selectedMember);

      const res = await fetch(`/api/documents?${params.toString()}`);
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/members")
      .then((res) => res.json())
      .then((data) => setMembers(data.members || []))
      .catch(console.error);

    loadDocuments();
  }, [selectedCategory, selectedMember]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadDocuments();
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    if (!uploadFile) {
      setUploadError("Please choose a file to upload.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("title", uploadTitle);
      formData.append("category", uploadCategory);
      formData.append("description", uploadDesc);
      if (uploadMemberId) formData.append("memberId", uploadMemberId);

      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Upload failed");

      setShowUploadModal(false);
      setUploadTitle("");
      setUploadDesc("");
      setUploadFile(null);
      setUploadMemberId("");
      loadDocuments();
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/documents/${docId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete document");
      loadDocuments();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <FolderArchive className="w-6 h-6 text-emerald-" />
            <span>Historical Documents & Photographs</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Secure digital repository for birth certificates, marriage records, wills, and historical portraits.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald- hover:bg-emerald- text-white text-sm font-semibold shadow-lg shadow-emerald-/30 transition-all self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Archive File</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents by title, file name, or notes..."
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

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Categories</option>
            <option value="PHOTOGRAPH">Historical Photographs</option>
            <option value="BIRTH_CERTIFICATE">Birth Certificates</option>
            <option value="MARRIAGE_CERTIFICATE">Marriage Certificates</option>
            <option value="DEATH_CERTIFICATE">Death Certificates</option>
            <option value="HISTORICAL_DOCUMENT">Historical Records</option>
            <option value="OTHER">Other Documents</option>
          </select>

          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none max-w-xs"
          >
            <option value="">All Family Relatives</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.fullName} ({m.memberId})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : documents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => {
            const isImage = doc.fileType?.startsWith("image/");
            return (
              <div
                key={doc.id}
                className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald- dark:bg-emerald-/40 text-emerald- dark:text-emerald-">
                      {doc.category.replace(/_/g, " ")}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {formatFileSize(doc.fileSize)}
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald- dark:text-emerald- flex items-center justify-center shrink-0">
                      {isImage ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {doc.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 truncate">
                        {doc.fileName}
                      </p>
                    </div>
                  </div>

                  {doc.member && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Linked relative: </span>
                      <Link
                        href={`/members/${doc.member.id}`}
                        className="font-semibold text-emerald- dark:text-emerald- hover:underline"
                      >
                        {doc.member.fullName}
                      </Link>
                    </div>
                  )}

                  {doc.description && (
                    <p className="mt-2 text-xs text-slate-500 line-clamp-2">
                      {doc.description}
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Uploaded {formatDate(doc.uploadDate)}
                  </span>

                  <div className="flex items-center gap-2">
                    <a
                      href={`/api/documents/${doc.id}/download`}
                      className="p-1.5 rounded-lg text-emerald- hover:bg-emerald- dark:hover:bg-emerald-/40"
                      title="Download File"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(doc.id, doc.title)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <FolderArchive className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            No historical documents found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Upload family photographs, certificates, letters, and artifacts to preserve them locally.
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald- text-white text-xs font-semibold"
          >
            Upload First Document
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Upload Historical Artifact / Document
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Stored locally on this computer in the protected storage directory.
            </p>

            {uploadError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. 1972 Marriage Certificate"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
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
                  Link to Family Member (Optional)
                </label>
                <select
                  value={uploadMemberId}
                  onChange={(e) => setUploadMemberId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
                >
                  <option value="">None / General Family Archive</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.memberId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Context
                </label>
                <textarea
                  rows={2}
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  placeholder="Notes, date taken, location, or historical relevance..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  File (Images, PDF, Word, TXT - max 25MB) *
                </label>
                <input
                  type="file"
                  required
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald- file:text-emerald- hover:file:bg-emerald-"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-emerald- hover:bg-emerald- transition-all disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Save to Archive"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
