import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";
import { calculateMemberGeneration, updateDescendantGenerations } from "@/lib/genealogy";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorizedResponse();

    const { id } = await params;
    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        family: true,
        parentRelations: {
          include: {
            parent: {
              select: {
                id: true,
                memberId: true,
                fullName: true,
                gender: true,
                photoUrl: true,
                dateOfBirth: true,
                dateOfDeath: true,
                isDeceased: true,
              },
            },
          },
        },
        childRelations: {
          include: {
            child: {
              select: {
                id: true,
                memberId: true,
                fullName: true,
                gender: true,
                photoUrl: true,
                dateOfBirth: true,
                dateOfDeath: true,
                isDeceased: true,
              },
            },
          },
        },
        marriagesAsSpouse1: {
          include: {
            spouse2: {
              select: {
                id: true,
                memberId: true,
                fullName: true,
                gender: true,
                photoUrl: true,
                dateOfBirth: true,
                dateOfDeath: true,
                isDeceased: true,
              },
            },
          },
        },
        marriagesAsSpouse2: {
          include: {
            spouse1: {
              select: {
                id: true,
                memberId: true,
                fullName: true,
                gender: true,
                photoUrl: true,
                dateOfBirth: true,
                dateOfDeath: true,
                isDeceased: true,
              },
            },
          },
        },
        documents: {
          orderBy: { uploadDate: "desc" },
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found." }, { status: 404 });
    }

    // Find siblings (individuals sharing any of the same parents)
    const parentIds = member.parentRelations.map((r) => r.parentId);
    let siblings: any[] = [];
    if (parentIds.length > 0) {
      const siblingRelations = await prisma.parentChildRelationship.findMany({
        where: {
          parentId: { in: parentIds },
          childId: { not: member.id },
        },
        include: {
          child: {
            select: {
              id: true,
              memberId: true,
              fullName: true,
              gender: true,
              photoUrl: true,
              dateOfBirth: true,
              dateOfDeath: true,
              isDeceased: true,
            },
          },
        },
      });

      // Deduplicate siblings
      const siblingMap = new Map<string, any>();
      for (const rel of siblingRelations) {
        if (!siblingMap.has(rel.child.id)) {
          siblingMap.set(rel.child.id, rel.child);
        }
      }
      siblings = Array.from(siblingMap.values());
    }

    return NextResponse.json({ member, siblings });
  } catch (error: any) {
    console.error("Member detail fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch member details." },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorizedResponse();

    const { id } = await params;
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
      isArchived,
    } = body;

    const existing = await prisma.member.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Member not found." }, { status: 404 });
    }

    let fullName = existing.fullName;
    if (firstName || surname || middleName !== undefined) {
      const fn = firstName ? firstName.trim() : existing.firstName;
      const mn = middleName !== undefined ? (middleName ? ` ${middleName.trim()} ` : " ") : (existing.middleName ? ` ${existing.middleName} ` : " ");
      const sn = surname ? surname.trim() : existing.surname;
      fullName = `${fn}${mn}${sn}`.replace(/\s+/g, " ");
    }

    const updated = await prisma.member.update({
      where: { id },
      data: {
        firstName: firstName ? firstName.trim() : undefined,
        middleName: middleName !== undefined ? (middleName ? middleName.trim() : null) : undefined,
        surname: surname ? surname.trim() : undefined,
        fullName,
        gender: gender || undefined,
        dateOfBirth: dateOfBirth !== undefined ? (dateOfBirth ? new Date(dateOfBirth) : null) : undefined,
        placeOfBirth: placeOfBirth !== undefined ? (placeOfBirth ? placeOfBirth.trim() : null) : undefined,
        isDeceased: isDeceased !== undefined ? !!isDeceased : undefined,
        dateOfDeath: dateOfDeath !== undefined ? (dateOfDeath ? new Date(dateOfDeath) : null) : undefined,
        placeOfDeath: placeOfDeath !== undefined ? (placeOfDeath ? placeOfDeath.trim() : null) : undefined,
        maritalStatus: maritalStatus || undefined,
        nationality: nationality !== undefined ? nationality : undefined,
        occupation: occupation !== undefined ? (occupation ? occupation.trim() : null) : undefined,
        biography: biography !== undefined ? (biography ? biography.trim() : null) : undefined,
        photoUrl: photoUrl !== undefined ? photoUrl : undefined,
        ancestralOrigin: ancestralOrigin !== undefined ? (ancestralOrigin ? ancestralOrigin.trim() : null) : undefined,
        notes: notes !== undefined ? (notes ? notes.trim() : null) : undefined,
        phone: phone !== undefined ? (phone ? phone.trim() : null) : undefined,
        email: email !== undefined ? (email ? email.trim() : null) : undefined,
        address: address !== undefined ? (address ? address.trim() : null) : undefined,
        familyId: familyId !== undefined ? (familyId || null) : undefined,
        isArchived: isArchived !== undefined ? !!isArchived : undefined,
      },
    });

    // Check if generation needs update
    const calculatedGen = await calculateMemberGeneration(id);
    if (calculatedGen !== updated.generation) {
      await prisma.member.update({
        where: { id },
        data: { generation: calculatedGen },
      });
      await updateDescendantGenerations(id, calculatedGen);
    }

    await prisma.activityLog.create({
      data: {
        action: "UPDATE_MEMBER",
        details: `Updated details for ${updated.fullName} (${updated.memberId})`,
        userId: session.userId,
        userName: session.fullName,
      },
    });

    return NextResponse.json({ success: true, member: updated });
  } catch (error: any) {
    console.error("Member update error:", error);
    return NextResponse.json(
      { error: "Failed to update member." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorizedResponse();

    const { id } = await params;
    const member = await prisma.member.findUnique({
      where: { id },
      select: { fullName: true, memberId: true },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found." }, { status: 404 });
    }

    // Delete relationships cleanly (cascades automatically per schema)
    await prisma.member.delete({
      where: { id },
    });

    await prisma.activityLog.create({
      data: {
        action: "DELETE_MEMBER",
        details: `Deleted member: ${member.fullName} (${member.memberId})`,
        userId: session.userId,
        userName: session.fullName,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Member deleted successfully.",
    });
  } catch (error: any) {
    console.error("Member delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete member." },
      { status: 500 }
    );
  }
}
