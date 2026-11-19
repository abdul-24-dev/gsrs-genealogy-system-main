import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";

export async function GET() {
  try {
    const session = await requireAuth();
    if (!session) return unauthorizedResponse();

    const [
      totalMembers,
      livingMembers,
      deceasedMembers,
      totalFamilies,
      totalDocuments,
      maleCount,
      femaleCount,
      recentMembers,
      recentActivities,
      allMembers,
      familiesWithCounts,
    ] = await Promise.all([
      prisma.member.count({ where: { isArchived: false } }),
      prisma.member.count({ where: { isArchived: false, isDeceased: false } }),
      prisma.member.count({ where: { isArchived: false, isDeceased: true } }),
      prisma.family.count(),
      prisma.document.count(),
      prisma.member.count({ where: { isArchived: false, gender: "MALE" } }),
      prisma.member.count({ where: { isArchived: false, gender: "FEMALE" } }),
      prisma.member.findMany({
        where: { isArchived: false },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { family: { select: { name: true } } },
      }),
      prisma.activityLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.member.findMany({
        where: { isArchived: false },
        select: { generation: true, dateOfBirth: true, createdAt: true },
      }),
      prisma.family.findMany({
        include: {
          _count: { select: { members: true } },
        },
        orderBy: { members: { _count: "desc" } },
        take: 10,
      }),
    ]);

    // Calculate generation distribution
    const generationMap: { [key: number]: number } = {};
    for (const m of allMembers) {
      const gen = m.generation || 1;
      generationMap[gen] = (generationMap[gen] || 0) + 1;
    }
    const generationData = Object.keys(generationMap)
      .map((k) => ({
        generation: `Gen ${k}`,
        count: generationMap[parseInt(k, 10)],
      }))
      .sort((a, b) => a.generation.localeCompare(b.generation, undefined, { numeric: true }));

    // Calculate birth decade distribution
    const decadeMap: { [key: string]: number } = {};
    for (const m of allMembers) {
      if (m.dateOfBirth) {
        const year = new Date(m.dateOfBirth).getFullYear();
        if (!isNaN(year)) {
          const decade = `${Math.floor(year / 10) * 10}s`;
          decadeMap[decade] = (decadeMap[decade] || 0) + 1;
        }
      }
    }
    const decadeData = Object.keys(decadeMap)
      .map((k) => ({
        decade: k,
        count: decadeMap[k],
      }))
      .sort((a, b) => a.decade.localeCompare(b.decade));

    // Members per family
    const familyData = familiesWithCounts.map((f) => ({
      name: f.name,
      count: f._count.members,
    }));

    // Gender distribution with emerald/health palette
    const genderData = [
      { name: "Male", value: maleCount, color: "#059669" },
      { name: "Female", value: femaleCount, color: "#34D399" },
      {
        name: "Other / Unspecified",
        value: totalMembers - (maleCount + femaleCount),
        color: "#6EE7B7",
      },
    ].filter((g) => g.value > 0);

    // Living vs Deceased
    const lifeStatusData = [
      { name: "Living", value: livingMembers, color: "#16A34A" },
      { name: "Deceased", value: deceasedMembers, color: "#64748B" },
    ];

    const maxGeneration = allMembers.reduce(
      (max, m) => Math.max(max, m.generation || 1),
      1
    );

    return NextResponse.json({
      summary: {
        totalMembers,
        livingMembers,
        deceasedMembers,
        totalGenerations: maxGeneration,
        totalFamilies,
        totalDocuments,
      },
      charts: {
        genderData,
        lifeStatusData,
        generationData,
        decadeData,
        familyData,
      },
      recentMembers,
      recentActivities,
    });
  } catch (error: any) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json(
      { error: "Failed to generate analytics." },
      { status: 500 }
    );
  }
}
