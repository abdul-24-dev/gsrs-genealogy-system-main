"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Archive,
  Download,
  RotateCcw,
  KeyRound,
  Building,
  CheckCircle2,
  HardDrive,
  Info,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { formatFileSize, formatDate } from "@/lib/utils";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({
    appName: "Genealogical Search and Record System",
    familyOrOrgName: "Family Heritage Archive",
    description: "",
  });
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Status feedback
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [backupMsg, setBackupMsg] = useState<string | null>(null);
  const [backupLoading, setBackupLoading] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [sRes, bRes] = await Promise.all([
        fetch("/api/settings").then((r) => r.json()),
        fetch("/api/backups").then((r) => r.json()),
      ]);
      if (sRes.settings) setSettings(sRes.settings);
      if (bRes.backups) setBackups(bRes.backups);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSuccess(false);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 4000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(false);

    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setPwError("Password must be at least 8 characters long.");
      return;
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");

      setPwSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPwSuccess(false), 4000);
    } catch (err: any) {
      setPwError(err.message);
    }
  };

  const handleCreateBackup = async () => {
    setBackupLoading(true);
    setBackupMsg(null);
    try {
      const res = await fetch("/api/backups", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create backup");
      setBackupMsg(`Full backup created successfully: ${data.backup.fileName}`);
      loadData();
    } catch (err: any) {
      setBackupMsg(`Backup failed: ${err.message}`);
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestoreBackup = async (backupId: string, fileName: string) => {
    if (
      !confirm(
        `Are you sure you want to restore from "${fileName}"? A safety backup of the current database will be saved automatically prior to restoration.`
      )
    ) {
      return;
    }

    setBackupLoading(true);
    setBackupMsg("Restoring database and archive documents...");

    try {
      const formData = new FormData();
      formData.append("backupId", backupId);

      const res = await fetch("/api/backups", {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Restore failed");

      setBackupMsg("Archive successfully restored! Reloading application...");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setBackupMsg(`Restoration failed: ${err.message}`);
      setBackupLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-emerald-" />
          <span>System Settings & Backups</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Archive branding, credentials, disaster recovery backups, and storage management.
        </p>
      </div>

      {/* Backup & Disaster Recovery Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Archive className="w-5 h-5 text-emerald-" />
              <span>Full Archive Backup & Restoration</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Backups bundle your SQLite database, uploaded photos, and family records into a portable ZIP archive.
            </p>
          </div>

          <button
            onClick={handleCreateBackup}
            disabled={backupLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald- hover:bg-emerald- text-white text-xs font-semibold shadow-md shadow-emerald-/30 transition-all disabled:opacity-50 self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>{backupLoading ? "Creating Archive..." : "Create Full Backup"}</span>
          </button>
        </div>

        {backupMsg && (
          <div className="p-3.5 rounded-xl bg-emerald- dark:bg-emerald-/40 border border-emerald- dark:border-emerald- text-emerald- dark:text-emerald- text-xs font-medium">
            {backupMsg}
          </div>
        )}

        {/* Backup History Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Backup File Name</th>
                <th className="py-2.5 px-3">Date Created</th>
                <th className="py-2.5 px-3">Archive Size</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {backups.length > 0 ? (
                backups.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-mono font-medium text-slate-800 dark:text-slate-200">
                      {b.fileName}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {formatDate(b.createdAt)}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">
                      {formatFileSize(b.fileSize)}
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
                      <a
                        href={`/api/backups/${b.id}/download`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald- dark:bg-emerald-/30 text-emerald- dark:text-emerald- font-semibold hover:bg-emerald-"
                        title="Download ZIP to USB/external drive"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </a>
                      <button
                        onClick={() => handleRestoreBackup(b.id, b.fileName)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-semibold hover:bg-amber-100"
                        title="Restore this state"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Restore</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400 text-xs">
                    No backups created yet. Click &quot;Create Full Backup&quot; to preserve your family archive.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Archive Branding & Identity */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
          <Building className="w-5 h-5 text-emerald-" />
          <span>Archive Branding & General Configuration</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Personalize the title and heritage organization shown across the system.
        </p>

        {settingsSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings saved successfully.</span>
          </div>
        )}

        <form onSubmit={handleUpdateSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Application Name
              </label>
              <input
                type="text"
                value={settings.appName || ""}
                onChange={(e) =>
                  setSettings({ ...settings, appName: e.target.value })
                }
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Family / Organization Title
              </label>
              <input
                type="text"
                value={settings.familyOrOrgName || ""}
                onChange={(e) =>
                  setSettings({ ...settings, familyOrOrgName: e.target.value })
                }
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description / Heritage Motto
            </label>
            <textarea
              rows={2}
              value={settings.description || ""}
              onChange={(e) =>
                setSettings({ ...settings, description: e.target.value })
              }
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-emerald- hover:bg-emerald- text-white text-xs font-semibold shadow-md transition-all"
          >
            Save General Settings
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
          <KeyRound className="w-5 h-5 text-emerald-" />
          <span>Security & Password Management</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Update your administrator authentication credentials.
        </p>

        {pwSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Password successfully updated.</span>
          </div>
        )}

        {pwError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-medium">
            {pwError}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Current Password *
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                New Password (min 8 chars) *
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold shadow-md transition-all"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* About & Technical Architecture Information */}
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-xs text-slate-500 dark:text-slate-400 space-y-2">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold">
          <Info className="w-4 h-4 text-emerald-" />
          <span>About Genealogical Search and Record System (GSRS)</span>
        </div>
        <p>
          Version 1.0.0 Production Release. Designed for academic and municipal family record preservation in Nasarawa State, Nigeria.
        </p>
        <p>
          Architecture: Local-First Next.js 15 (App Router), TypeScript, SQLite 3 with Prisma ORM. No internet connection or cloud hosting required.
        </p>
      </div>
    </div>
  );
}
