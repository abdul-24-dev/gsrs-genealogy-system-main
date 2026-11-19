import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorizedResponse();

    const searchParams = req.nextUrl.searchParams;
    const focusId = searchParams.get("focusId") || "";
    const familyId = searchParams.get("familyId") || "";

    // If focusId is provided, retrieve pedigree and descendants around that individual
    let targetMemberId = focusId;

    if (!targetMemberId) {
      // Find a suitable root member: preferably Generation 1 or oldest member
      const rootCandidate = await prisma.member.findFirst({
        where: {
          isArchived: false,
          ...(familyId ? { familyId } : {}),
        },
        orderBy: [{ generation: "asc" }, { dateOfBirth: "asc" }, { createdAt: "asc" }],
        select: { id: true },
      });

      if (!rootCandidate) {
        return NextResponse.json({
          nodes: [],
          edges: [],
          focusMember: null,
          message: "No family records found.",
        });
      }
      targetMemberId = rootCandidate.id;
    }

    // Load focus member
    const focusMember = await prisma.member.findUnique({
      where: { id: targetMemberId },
      include: {
        family: { select: { id: true, name: true } },
      },
    });

    if (!focusMember) {
      return NextResponse.json({ error: "Focus member not found." }, { status: 404 });
    }

    // Gather connected individuals (ancestors + descendants + spouses + siblings)
    const collectedIds = new Set<string>([targetMemberId]);

    // 1. Traverse Ancestors (up to 4 levels)
    let currentAncestors = [targetMemberId];
    for (let level = 0; level < 4; level++) {
      if (currentAncestors.length === 0) break;
      const parentRels = await prisma.parentChildRelationship.findMany({
        where: { childId: { in: currentAncestors } },
        select: { parentId: true },
      });
      const nextParents: string[] = [];
      for (const rel of parentRels) {
        if (!collectedIds.has(rel.parentId)) {
          collectedIds.add(rel.parentId);
          nextParents.push(rel.parentId);
        }
      }
      currentAncestors = nextParents;
    }

    // 2. Traverse Descendants (up to 4 levels)
    let currentDescendants = [targetMemberId];
    for (let level = 0; level < 4; level++) {
      if (currentDescendants.length === 0) break;
      const childRels = await prisma.parentChildRelationship.findMany({
        where: { parentId: { in: currentDescendants } },
        select: { childId: true },
      });
      const nextChildren: string[] = [];
      for (const rel of childRels) {
        if (!collectedIds.has(rel.childId)) {
          collectedIds.add(rel.childId);
          nextChildren.push(rel.childId);
        }
      }
      currentDescendants = nextChildren;
    }

    // 3. Spouses of all collected members
    const idList = Array.from(collectedIds);
    const marriages = await prisma.marriageRelationship.findMany({
      where: {
        OR: [
          { spouse1Id: { in: idList } },
          { spouse2Id: { in: idList } },
        ],
      },
    });

    for (const m of marriages) {
      collectedIds.add(m.spouse1Id);
      collectedIds.add(m.spouse2Id);
    }

    // 4. Siblings of the focus member
    const focusParents = await prisma.parentChildRelationship.findMany({
      where: { childId: targetMemberId },
      select: { parentId: true },
    });
    if (focusParents.length > 0) {
      const siblingRels = await prisma.parentChildRelationship.findMany({
        where: { parentId: { in: focusParents.map((p) => p.parentId) } },
        select: { childId: true },
      });
      for (const s of siblingRels) {
        collectedIds.add(s.childId);
      }
    }

    // Fetch full data for all collected members
    const allMemberIds = Array.from(collectedIds);
    const members = await prisma.member.findMany({
      where: { id: { in: allMemberIds } },
      select: {
        id: true,
        memberId: true,
        fullName: true,
        firstName: true,
        surname: true,
        gender: true,
        dateOfBirth: true,
        dateOfDeath: true,
        isDeceased: true,
        photoUrl: true,
        generation: true,
        occupation: true,
        maritalStatus: true,
        family: { select: { id: true, name: true } },
      },
      orderBy: [{ generation: "asc" }, { dateOfBirth: "asc" }],
    });

    // Parent-Child relationships among these members
    const parentChildRels = await prisma.parentChildRelationship.findMany({
      where: {
        parentId: { in: allMemberIds },
        childId: { in: allMemberIds },
      },
      select: {
        id: true,
        parentId: true,
        childId: true,
        relationshipType: true,
      },
    });

    // Marriage relationships among these members
    const marriageRels = await prisma.marriageRelationship.findMany({
      where: {
        spouse1Id: { in: allMemberIds },
        spouse2Id: { in: allMemberIds },
      },
      select: {
        id: true,
        spouse1Id: true,
        spouse2Id: true,
        status: true,
        marriageDate: true,
      },
    });

    return NextResponse.json({
      focusMember,
      members,
      parentChildRels,
      marriageRels,
    });
  } catch (error: any) {
    console.error("Tree data generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate family tree data." },
      { status: 500 }
    );
  }
}
