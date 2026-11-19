"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  GitFork,
  Printer,
  Compass,
  ArrowRight,
  Heart,
  User,
  RotateCw,
} from "lucide-react";
import { formatYear } from "@/lib/utils";

interface TreeNode {
  id: string;
  memberId: string;
  fullName: string;
  gender: string;
  generation: number;
  dateOfBirth?: string | null;
  dateOfDeath?: string | null;
  isDeceased: boolean;
  occupation?: string | null;
  family?: { name: string } | null;
  x?: number;
  y?: number;
}

interface TreeProps {
  focusMember: any;
  members: TreeNode[];
  parentChildRels: any[];
  marriageRels: any[];
  onSelectMember?: (id: string) => void;
  onFocusMember: (id: string) => void;
}

export default function FamilyTreeCanvas({
  focusMember,
  members,
  parentChildRels,
  marriageRels,
  onFocusMember,
}: TreeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [orientation, setOrientation] = useState<"vertical" | "horizontal">("vertical");
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);

  // Layout calculation
  const generationGroups: { [gen: number]: TreeNode[] } = {};
  for (const m of members) {
    const gen = m.generation || 1;
    if (!generationGroups[gen]) generationGroups[gen] = [];
    generationGroups[gen].push(m);
  }

  const sortedGens = Object.keys(generationGroups)
    .map(Number)
    .sort((a, b) => a - b);

  // Position calculation
  const nodeMap = new Map<string, TreeNode>();
  const cardWidth = 220;
  const cardHeight = 110;
  const colGap = 60;
  const rowGap = 120;

  if (orientation === "vertical") {
    // Generations stacked vertically
    sortedGens.forEach((gen, rowIdx) => {
      const list = generationGroups[gen];
      const totalWidth = list.length * (cardWidth + colGap) - colGap;
      const startX = -totalWidth / 2;

      list.forEach((node, colIdx) => {
        const x = startX + colIdx * (cardWidth + colGap);
        const y = rowIdx * (cardHeight + rowGap);
        nodeMap.set(node.id, { ...node, x, y });
      });
    });
  } else {
    // Generations stacked horizontally
    sortedGens.forEach((gen, colIdx) => {
      const list = generationGroups[gen];
      const totalHeight = list.length * (cardHeight + colGap) - colGap;
      const startY = -totalHeight / 2;

      list.forEach((node, rowIdx) => {
        const x = colIdx * (cardWidth + rowGap);
        const y = startY + rowIdx * (cardHeight + colGap);
        nodeMap.set(node.id, { ...node, x, y });
      });
    });
  }

  const positionedNodes = Array.from(nodeMap.values());

  // Center on focus member initially
  useEffect(() => {
    if (focusMember && nodeMap.has(focusMember.id) && containerRef.current) {
      const target = nodeMap.get(focusMember.id)!;
      const rect = containerRef.current.getBoundingClientRect();
      setPan({
        x: rect.width / 2 - (target.x! + cardWidth / 2) * zoom,
        y: rect.height / 2 - (target.y! + cardHeight / 2) * zoom,
      });
    }
  }, [focusMember?.id, orientation]);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".tree-node-card")) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);
    if (focusMember && nodeMap.has(focusMember.id) && containerRef.current) {
      const target = nodeMap.get(focusMember.id)!;
      const rect = containerRef.current.getBoundingClientRect();
      setPan({
        x: rect.width / 2 - (target.x! + cardWidth / 2),
        y: rect.height / 2 - (target.y! + cardHeight / 2),
      });
    } else {
      setPan({ x: 300, y: 150 });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="relative w-full h-[700px] bg-slate-100 dark:bg-emerald-950/80 rounded-3xl border border-emerald-100 dark:border-emerald-900/60 overflow-hidden shadow-inner select-none">
      {/* Interactive Controls Bar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-white/90 dark:bg-emerald-950/90 backdrop-blur-md p-1.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/60 shadow-md">
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.15, 2.0))}
          className="p-2 text-slate-600 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 rounded-xl"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.15, 0.4))}
          className="p-2 text-slate-600 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 rounded-xl"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetView}
          className="p-2 text-slate-600 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 rounded-xl"
          title="Reset View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <div className="w-px h-5 bg-emerald-200 dark:bg-emerald-800 mx-1" />
        <button
          onClick={() =>
            setOrientation(orientation === "vertical" ? "horizontal" : "vertical")
          }
          className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 rounded-xl flex items-center gap-1.5"
          title="Toggle Layout Orientation"
        >
          <RotateCw className="w-3.5 h-3.5 text-emerald-500" />
          <span>{orientation === "vertical" ? "Vertical" : "Horizontal"}</span>
        </button>
        <button
          onClick={handlePrint}
          className="p-2 text-slate-600 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 rounded-xl"
          title="Print or Export PDF"
        >
          <Printer className="w-4 h-4" />
        </button>
      </div>

      {/* Generation Level Badges (on side) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-white/90 dark:bg-emerald-950/90 backdrop-blur-md p-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/60 shadow-md text-xs">
        <span className="font-bold text-slate-700 dark:text-emerald-300 text-[11px] mb-1">
          Generations in View
        </span>
        <div className="flex flex-wrap gap-1.5 max-w-[200px]">
          {sortedGens.map((g) => (
            <span
              key={g}
              className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px]"
            >
              Gen {g} ({generationGroups[g]?.length})
            </span>
          ))}
        </div>
      </div>

      {/* Canvas workspace */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`w-full h-full cursor-grab ${
          isDragging ? "cursor-grabbing" : ""
        }`}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
            transition: isDragging ? "none" : "transform 0.1s ease-out",
          }}
          className="relative w-0 h-0"
        >
          {/* SVG Connectors Layer */}
          <svg
            className="absolute top-0 left-0 overflow-visible pointer-events-none"
            style={{ width: 1, height: 1 }}
          >
            <defs>
              <linearGradient id="parentChildGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#059669" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Parent-Child Connector Lines */}
            {parentChildRels.map((rel) => {
              const p = nodeMap.get(rel.parentId);
              const c = nodeMap.get(rel.childId);
              if (!p || !c || p.x === undefined || c.x === undefined) return null;

              if (orientation === "vertical") {
                const startX = p.x + cardWidth / 2;
                const startY = p.y! + cardHeight;
                const endX = c.x + cardWidth / 2;
                const endY = c.y!;
                const midY = (startY + endY) / 2;

                const pathData = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
                return (
                  <path
                    key={`pc-${rel.id}`}
                    d={pathData}
                    fill="none"
                    stroke="#059669"
                    strokeWidth="2.5"
                    strokeDasharray={rel.relationshipType === "ADOPTED" ? "4 4" : "none"}
                    opacity="0.75"
                  />
                );
              } else {
                const startX = p.x + cardWidth;
                const startY = p.y! + cardHeight / 2;
                const endX = c.x;
                const endY = c.y! + cardHeight / 2;
                const midX = (startX + endX) / 2;

                const pathData = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
                return (
                  <path
                    key={`pc-${rel.id}`}
                    d={pathData}
                    fill="none"
                    stroke="#059669"
                    strokeWidth="2.5"
                    strokeDasharray={rel.relationshipType === "ADOPTED" ? "4 4" : "none"}
                    opacity="0.75"
                  />
                );
              }
            })}

            {/* Marriage Connector Lines */}
            {marriageRels.map((m) => {
              const s1 = nodeMap.get(m.spouse1Id);
              const s2 = nodeMap.get(m.spouse2Id);
              if (!s1 || !s2 || s1.x === undefined || s2.x === undefined) return null;

              const x1 = s1.x + cardWidth / 2;
              const y1 = s1.y! + cardHeight / 2;
              const x2 = s2.x + cardWidth / 2;
              const y2 = s2.y! + cardHeight / 2;

              return (
                <line
                  key={`mar-${m.id}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                  opacity="0.85"
                />
              );
            })}
          </svg>

          {/* HTML Interactive Profile Cards */}
          {positionedNodes.map((node) => {
            const isFocus = focusMember?.id === node.id;
            const birthYear = formatYear(node.dateOfBirth);
            const deathYear = formatYear(node.dateOfDeath);
            const lifespan = birthYear
              ? `${birthYear} – ${node.isDeceased ? deathYear || "Deceased" : "Living"}`
              : node.isDeceased
              ? "Deceased"
              : "Living";

            return (
              <div
                key={node.id}
                style={{
                  position: "absolute",
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  width: `${cardWidth}px`,
                  height: `${cardHeight}px`,
                }}
                onClick={() => setSelectedNode(node)}
                className={`tree-node-card rounded-2xl p-3.5 border transition-all cursor-pointer flex flex-col justify-between shadow-md ${
                  isFocus
                    ? "bg-emerald-950 text-white border-emerald-500 ring-4 ring-emerald-500/30"
                    : "bg-white dark:bg-emerald-950/70 border-emerald-100 dark:border-emerald-900/60 text-slate-800 dark:text-slate-100 hover:border-emerald-500 dark:hover:border-emerald-400"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      node.gender === "MALE"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
                        : "bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300"
                    }`}
                  >
                    {node.fullName.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4
                      className={`font-bold text-xs leading-tight truncate ${
                        isFocus ? "text-white" : "text-slate-900 dark:text-white"
                      }`}
                      title={node.fullName}
                    >
                      {node.fullName}
                    </h4>
                    <p
                      className={`text-[10px] mt-0.5 truncate ${
                        isFocus ? "text-emerald-200/80" : "text-slate-500 dark:text-emerald-300/80"
                      }`}
                    >
                      {node.occupation || node.family?.name || "Family Member"}
                    </p>
                    <p
                      className={`text-[10px] font-semibold mt-0.5 ${
                        node.isDeceased ? "text-slate-400" : "text-emerald-500"
                      }`}
                    >
                      {lifespan}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-emerald-50 dark:border-emerald-900/40">
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {node.memberId}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded font-medium ${
                      isFocus
                        ? "bg-emerald-600 text-white"
                        : "bg-emerald-50 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300"
                    }`}
                  >
                    Gen {node.generation}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Node Quick Detail Drawer */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-30 bg-white dark:bg-emerald-950 rounded-2xl border border-emerald-100 dark:border-emerald-900/80 p-5 shadow-2xl animate-in slide-in-from-bottom-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-mono text-xs font-bold text-emerald-600">
                {selectedNode.memberId}
              </span>
              <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                {selectedNode.fullName}
              </h3>
              <p className="text-xs text-slate-400">
                Generation {selectedNode.generation} • {selectedNode.gender}
              </p>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold p-1"
            >
              ✕
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-100 dark:border-emerald-900/60 flex gap-2">
            <button
              onClick={() => {
                onFocusMember(selectedNode.id);
                setSelectedNode(null);
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold text-center transition-colors shadow-md shadow-emerald-600/20"
            >
              Center Tree Here
            </button>

            <Link
              href={`/members/${selectedNode.id}`}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-900 dark:text-emerald-200 text-xs font-semibold text-center transition-colors"
            >
              Open Profile
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
