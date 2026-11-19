import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorizedResponse();

    const params = req.nextUrl.searchParams;
    const q = params.get("q")?.trim() || "";
    const firstName = params.get("firstName")?.trim() || "";
    const surname = params.get("surname")?.trim() || "";
    const memberId = params.get("memberId")?.trim() || "";
    const familyId = params.get("familyId")?.trim() || "";
    const gender = params.get("gender")?.trim() || "";
    const birthYear = params.get("birthYear")?.trim() || "";
    const generation = params.get("generation")?.trim() || "";
    const community = params.get("community")?.trim() || "";
    const state = params.get("state")?.trim() || "";
    const status = params.get("status")?.trim() || ""; // living, deceased

    const where: any = {
      isArchived: false,
    };

    if (q) {
      where.OR = [
        { fullName: { contains: q } },
        { firstName: { contains: q } },
        { surname: { contains: q } },
        { memberId: { contains: q } },
        { placeOfBirth: { contains: q } },
        { occupation: { contains: q } },
        { ancestralOrigin: { contains: q } },
      ];
    }

    if (firstName) where.firstName = { contains: firstName };
    if (surname) where.surname = { contains: surname };
    if (memberId) where.memberId = { contains: memberId };
    if (familyId) where.familyId = familyId;
    if (gender) where.gender = gender;
    if (generation) where.generation = parseInt(generation, 10);
    if (status === "living") where.isDeceased = false;
    if (status === "deceased") where.isDeceased = true;

    // Search by community or state via Family relation or member's ancestralOrigin/placeOfBirth
    if (community || state) {
      where.AND = where.AND || [];
      if (community) {
        where.AND.push({
          OR: [
            { placeOfBirth: { contains: community } },
            { ancestralOrigin: { contains: community } },
            { family: { community: { contains: community } } },
          ],
        });
      }
      if (state) {
        where.AND.push({
          OR: [
            { placeOfBirth: { contains: state } },
            { ancestralOrigin: { contains: state } },
            { family: { state: { contains: state } } },
          ],
        });
      }
    }

    let members = await prisma.member.findMany({
      where,
      include: {
        family: { select: { id: true, name: true, community: true, state: true } },
        parentRelations: {
          include: {
            parent: {
              select: { id: true, fullName: true, gender: true, memberId: true },
            },
          },
        },
        childRelations: {
          include: {
            child: {
              select: { id: true, fullName: true, gender: true, memberId: true },
            },
          },
        },
        marriagesAsSpouse1: {
          include: {
            spouse2: {
              select: { id: true, fullName: true, gender: true, memberId: true },
            },
          },
        },
        marriagesAsSpouse2: {
          include: {
            spouse1: {
              select: { id: true, fullName: true, gender: true, memberId: true },
            },
          },
        },
      },
      orderBy: [{ generation: "asc" }, { surname: "asc" }],
      take: 100,
    });

    // Post-filter by birth year if requested (SQLite doesn't have native EXTRACT(YEAR))
    if (birthYear) {
      const targetYear = parseInt(birthYear, 10);
      if (!isNaN(targetYear)) {
        members = members.filter((m) => {
          if (!m.dateOfBirth) return false;
          return new Date(m.dateOfBirth).getFullYear() === targetYear;
        });
      }
    }

    return NextResponse.json({
      results: members,
      totalCount: members.length,
    });
  } catch (error: any) {
    console.error("Genealogical search error:", error);
    return NextResponse.json(
      { error: "Search query failed." },
      { status: 500 }
    );
  }
}
