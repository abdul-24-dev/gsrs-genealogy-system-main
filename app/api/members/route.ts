import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";
import {
  wouldCreateCircularRelationship,
  calculateMemberGeneration,
  updateDescendantGenerations,
} from "@/lib/genealogy";

async function generateNextMemberId(): Promise<string> {
  const lastMember = await prisma.member.findFirst({
    orderBy: { createdAt: "desc" },
    select: { memberId: true },
  });

  if (!lastMember || !lastMember.memberId.startsWith("GSRS-")) {
    return "GSRS-1001";
  }

  const parts = lastMember.memberId.split("-");
  const num = parseInt(parts[1], 10);
  if (isNaN(num)) return `GSRS-${Date.now().toString().slice(-4)}`;
  return `GSRS-${num + 1}`;
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorizedResponse();

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const familyId = searchParams.get("familyId") || "";
    const gender = searchParams.get("gender") || "";
    const status = searchParams.get("status") || ""; // living, deceased
    const generation = searchParams.get("generation");
    const includeArchived = searchParams.get("archived") === "true";

    const where: any = {
      isArchived: includeArchived ? undefined : false,
    };

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { firstName: { contains: search } },
        { surname: { contains: search } },
        { memberId: { contains: search } },
        { occupation: { contains: search } },
        { placeOfBirth: { contains: search } },
      ];
    }

    if (familyId) where.familyId = familyId;
    if (gender) where.gender = gender;
    if (generation) where.generation = parseInt(generation, 10);
    if (status === "living") where.isDeceased = false;
    if (status === "deceased") where.isDeceased = true;

    const members = await prisma.member.findMany({
      where,
      include: {
        family: { select: { id: true, name: true } },
        parentRelations: {
          include: {
            parent: {
              select: { id: true, memberId: true, fullName: true, gender: true },
            },
          },
        },
        childRelations: {
          include: {
            child: {
              select: { id: true, memberId: true, fullName: true, gender: true },
            },
          },
        },
        marriagesAsSpouse1: {
          include: {
            spouse2: {
              select: { id: true, memberId: true, fullName: true, gender: true },
            },
          },
        },
        marriagesAsSpouse2: {
          include: {
            spouse1: {
              select: { id: true, memberId: true, fullName: true, gender: true },
            },
          },
        },
      },
      orderBy: [{ generation: "asc" }, { surname: "asc" }, { firstName: "asc" }],
    });

    return NextResponse.json({ members });
  } catch (error: any) {
    console.error("Members fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch members." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorizedResponse();

    const body = await req.json();
    const {
      firstName,
      middleName,
      surname,
      gender,
      dateOfBirth,
      placeOfBirth,
      isDeceased,
      dateOfDeath,
      placeOfDeath,
      maritalStatus,
      nationality,
      occupation,
      biography,
      photoUrl,
      ancestralOrigin,
      notes,
      phone,
      email,
      address,
      familyId,
      fatherId,
      motherId,
      spouseId,
    } = body;

    if (!firstName?.trim() || !surname?.trim()) {
      return NextResponse.json(
        { error: "First name and surname are required." },
        { status: 400 }
      );
    }

    const mid = middleName?.trim() ? ` ${middleName.trim()} ` : " ";
    const fullName = `${firstName.trim()}${mid}${surname.trim()}`.replace(/\s+/g, " ");
    const memberId = await generateNextMemberId();

    const member = await prisma.member.create({
      data: {
        memberId,
        firstName: firstName.trim(),
        middleName: middleName?.trim() || null,
        surname: surname.trim(),
        fullName,
        gender: gender || "MALE",
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        placeOfBirth: placeOfBirth?.trim() || null,
        isDeceased: !!isDeceased,
        dateOfDeath: isDeceased && dateOfDeath ? new Date(dateOfDeath) : null,
        placeOfDeath: isDeceased && placeOfDeath ? placeOfDeath.trim() : null,
        maritalStatus: maritalStatus || "SINGLE",
        nationality: nationality?.trim() || "Nigerian",
        occupation: occupation?.trim() || null,
        biography: biography?.trim() || null,
        photoUrl: photoUrl || null,
        ancestralOrigin: ancestralOrigin?.trim() || null,
        notes: notes?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        address: address?.trim() || null,
        familyId: familyId || null,
        generation: 1, // Will recalculate if parents exist
      },
    });

    // Handle father relationship
    if (fatherId && fatherId !== member.id) {
      const isCircular = await wouldCreateCircularRelationship(fatherId, member.id);
      if (!isCircular) {
        await prisma.parentChildRelationship.create({
          data: {
            parentId: fatherId,
            childId: member.id,
            relationshipType: "BIOLOGICAL",
          },
        });
      }
    }

    // Handle mother relationship
    if (motherId && motherId !== member.id) {
      const isCircular = await wouldCreateCircularRelationship(motherId, member.id);
      if (!isCircular) {
        await prisma.parentChildRelationship.create({
          data: {
            parentId: motherId,
            childId: member.id,
            relationshipType: "BIOLOGICAL",
          },
        });
      }
    }

    // Handle spouse relationship
    if (spouseId && spouseId !== member.id) {
      await prisma.marriageRelationship.create({
        data: {
          spouse1Id: member.id,
          spouse2Id: spouseId,
          status: "MARRIED",
        },
      });
      // Update marital status on both
      await prisma.member.update({
        where: { id: member.id },
        data: { maritalStatus: "MARRIED" },
      });
      await prisma.member.update({
        where: { id: spouseId },
        data: { maritalStatus: "MARRIED" },
      });
    }

    // Recalculate generation level
    const calculatedGen = await calculateMemberGeneration(member.id);
    if (calculatedGen !== 1) {
      await prisma.member.update({
        where: { id: member.id },
        data: { generation: calculatedGen },
      });
      await updateDescendantGenerations(member.id, calculatedGen);
    }

    await prisma.activityLog.create({
      data: {
        action: "CREATE_MEMBER",
        details: `Added family member: ${member.fullName} (${member.memberId})`,
        userId: session.userId,
        userName: session.fullName,
      },
    });

    return NextResponse.json({ success: true, member }, { status: 201 });
  } catch (error: any) {
    console.error("Member creation error:", error);
    return NextResponse.json(
      { error: "Failed to create member." },
      { status: 500 }
    );
  }
}
