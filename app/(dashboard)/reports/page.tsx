"use client";

import React, { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  Download,
  Printer,
  FileText,
  Users2,
  HeartHandshake,
  Skull,
  GitFork,
  Sparkles,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDate } from "@/lib/utils";

export default function ReportsPage() {
  const [reportType, setReportType] = useState<
    "all_members" | "families" | "living" | "deceased" | "generations"
  >("all_members");

  const [members, setMembers] = useState<any[]>([]);
  const [families, setFamilies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/members").then((r) => r.json()),
      fetch("/api/families").then((r) => r.json()),
    ])
      .then(([mRes, fRes]) => {
        setMembers(mRes.members || []);
        setFamilies(fRes.families || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Filtered members according to report type
  const getFilteredData = () => {
    switch (reportType) {
      case "living":
        return members.filter((m) => !m.isDeceased);
      case "deceased":
        return members.filter((m) => m.isDeceased);
      default:
        return members;
    }
  };

  const filteredMembers = getFilteredData();

  // Export CSV
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";

    if (reportType === "families") {
      csvContent += "Family Name,Community,LGA,State,Country,Members Count\n";
      families.forEach((f) => {
        const row = [
          `"${f.name}"`,
          `"${f.community || ""}"`,
          `"${f.lga || ""}"`,
          `"${f.state || ""}"`,
          `"${f.country || "Nigeria"}"`,
          f._count?.members || 0,
        ].join(",");
        csvContent += row + "\n";
      });
    } else {
      csvContent +=
        "Member ID,Full Name,Gender,Birth Date,Birth Place,Status,Generation,Family Group,Occupation\n";
      filteredMembers.forEach((m) => {
        const row = [
          `"${m.memberId}"`,
          `"${m.fullName}"`,
          `"${m.gender}"`,
          `"${m.dateOfBirth ? m.dateOfBirth.split("T")[0] : ""}"`,
          `"${m.placeOfBirth || ""}"`,
          `"${m.isDeceased ? "Deceased" : "Living"}"`,
          m.generation,
          `"${m.family?.name || ""}"`,
          `"${m.occupation || ""}"`,
        ].join(",");
        csvContent += row + "\n";
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `GSRS-${reportType}-Report-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export PDF with jsPDF and autoTable
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Header styling
    doc.setFontSize(18);
    doc.setTextColor(6, 78, 59); // Deep Navy
    doc.text("GENEALOGICAL SEARCH AND RECORD SYSTEM (GSRS)", 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105);
    const reportTitle =
      reportType === "families"
        ? "Family Groups & Heritage Communities Report"
        : reportType === "living"
        ? "Living Family Members Census Report"
        : reportType === "deceased"
        ? "Deceased Ancestors & Lineage History Report"
        : reportType === "generations"
        ? "Generational Hierarchy & Pedigree Report"
        : "Complete Family Lineage Roster";

    doc.text(reportTitle, 14, 28);

    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated on: ${currentDate} | Local-First Family Archive`, 14, 34);

    if (reportType === "families") {
      const tableRows = families.map((f) => [
        f.name,
        f.community || "N/A",
        f.lga || "N/A",
        f.state || "Nasarawa",
        (f._count?.members || 0).toString(),
      ]);

      autoTable(doc, {
        startY: 40,
        head: [["Family Name", "Community", "LGA", "State", "Enrolled Members"]],
        body: tableRows,
        theme: "striped",
        headStyles: { fillColor: [6, 78, 59], textColor: [255, 255, 255] },
        styles: { fontSize: 9 },
      });
    } else {
      const tableRows = filteredMembers.map((m) => [
        m.memberId,
        m.fullName,
        m.gender,
        `Gen ${m.generation}`,
        formatDate(m.dateOfBirth),
        m.family?.name || "Independent",
        m.isDeceased ? "Deceased" : "Living",
      ]);

      autoTable(doc, {
        startY: 40,
        head: [
          ["Member ID", "Full Name", "Gender", "Gen", "Birth Date", "Family Group", "Status"],
        ],
        body: tableRows,
        theme: "striped",
        headStyles: { fillColor: [6, 78, 59], textColor: [255, 255, 255] },
        styles: { fontSize: 8.5 },
      });
    }

    doc.save(
      `GSRS-${reportType}-Report-${new Date().toISOString().split("T")[0]}.pdf`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-emerald-" />
            <span>Reports & Exports</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Generate printable PDF documents and CSV data extracts from the family database.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Layout</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald- hover:bg-emerald- text-white text-xs font-semibold shadow-md shadow-emerald-/30 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Report Types Selector Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setReportType("all_members")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            reportType === "all_members"
              ? "bg-emerald- text-white shadow-md shadow-emerald-/20"
              : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>All Members ({members.length})</span>
        </button>

        <button
          onClick={() => setReportType("families")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            reportType === "families"
              ? "bg-emerald- text-white shadow-md shadow-emerald-/20"
              : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <Users2 className="w-3.5 h-3.5" />
          <span>Family Groups ({families.length})</span>
        </button>

        <button
          onClick={() => setReportType("living")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            reportType === "living"
              ? "bg-emerald- text-white shadow-md shadow-emerald-/20"
              : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>Living Relatives</span>
        </button>

        <button
          onClick={() => setReportType("deceased")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            reportType === "deceased"
              ? "bg-emerald- text-white shadow-md shadow-emerald-/20"
              : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <Skull className="w-3.5 h-3.5" />
          <span>Deceased Ancestors</span>
        </button>

        <button
          onClick={() => setReportType("generations")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            reportType === "generations"
              ? "bg-emerald- text-white shadow-md shadow-emerald-/20"
              : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <GitFork className="w-3.5 h-3.5" />
          <span>Generational Census</span>
        </button>
      </div>

      {/* Report Preview Document Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald- font-mono">
                Official Archive Document
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {reportType === "families"
                  ? "Family Groups & Heritage Communities Report"
                  : reportType === "living"
                  ? "Living Family Members Census Report"
                  : reportType === "deceased"
                  ? "Deceased Ancestors & Lineage History Report"
                  : reportType === "generations"
                  ? "Generational Hierarchy Report"
                  : "Complete Family Lineage Roster"}
              </h2>
            </div>
            <div className="text-right text-xs text-slate-400">
              <p>Total Records: {reportType === "families" ? families.length : filteredMembers.length}</p>
              <p>Generated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Data Table */}
        {reportType === "families" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Family Group Name</th>
                  <th className="py-3 px-4">Community</th>
                  <th className="py-3 px-4">LGA</th>
                  <th className="py-3 px-4">State</th>
                  <th className="py-3 px-4 text-right">Enrolled Relatives</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {families.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {f.name}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
                      {f.community || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
                      {f.lga || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
                      {f.state || "Nasarawa"}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-">
                      {f._count?.members || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Member ID</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Gender</th>
                  <th className="py-3 px-4">Generation</th>
                  <th className="py-3 px-4">Birth Date</th>
                  <th className="py-3 px-4">Family Group</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-emerald- dark:text-emerald-">
                      {m.memberId}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {m.fullName}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
                      {m.gender}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <span className="px-2 py-0.5 rounded font-medium bg-emerald- dark:bg-emerald-/30 text-emerald- dark:text-emerald-">
                        Gen {m.generation}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
                      {formatDate(m.dateOfBirth)}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
                      {m.family?.name || "Independent"}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          m.isDeceased
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-500"
                            : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600"
                        }`}
                      >
                        {m.isDeceased ? "Deceased" : "Living"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
