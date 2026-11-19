import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";
import {
  wouldCreateCircularRelationship,
  calculateMemberGeneration,
  updateDescendantGenerations,
} from "@/lib/genealogy";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorizedResponse();

    const { id } = await params;
    const body = await req.json();
    const { type, targetMemberId, relationshipType, marriageDate, marriagePlace, status, notes } = body;

    if (!targetMemberId) {
      return NextResponse.json(
        { error: "Target member ID is required." },
        { status: 400 }
      );
    }

    if (id === targetMemberId) {
      return NextResponse.json(
        { error: "A member cannot have a relationship with themselves." },
        { status: 400 }
      );
    }

    if (type === "parent") {
      // id is the child, targetMemberId is the parent
      const isCircular = await wouldCreateCircularRelationship(targetMemberId, id);
      if (isCircular) {
        return NextResponse.json(
          { error: "Cannot add parent: this would create an invalid circular family ancestry." },
          { status: 400 }
        );
      }

      // Check if relationship already exists
      const existing = await prisma.parentChildRelationship.findFirst({
        where: { parentId: targetMemberId, childId: id },
      });

      if (existing) {
        return NextResponse.json(
          { error: "This parent relationship already exists." },
          { status: 400 }
        );
      }

      await prisma.parentChildRelationship.create({
        data: {
          parentId: targetMemberId,
          childId: id,
          relationshipType: relationshipType || "BIOLOGICAL",
        },
      });

      // Recalculate generations
      const newGen = await calculateMemberGeneration(id);
      await prisma.member.update({
        where: { id },
        data: { generation: newGen },
      });
      await updateDescendantGenerations(id, newGen);

      return NextResponse.json({ success: true, message: "Parent added successfully." });
    } else if (type === "child") {
      // id is the parent, targetMemberId is the child
      const isCircular = await wouldCreateCircularRelationship(id, targetMemberId);
      if (isCircular) {
        return NextResponse.json(
          { error: "Cannot add child: this would create an invalid circular family ancestry." },
          { status: 400 }
        );
      }

      const existing = await prisma.parentChildRelationship.findFirst({
        where: { parentId: id, childId: targetMemberId },
      });

      if (existing) {
        return NextResponse.json(
          { error: "This child relationship already exists." },
          { status: 400 }
        );
      }

      await prisma.parentChildRelationship.create({
        data: {
          parentId: id,
          childId: targetMemberId,
          relationshipType: relationshipType || "BIOLOGICAL",
        },
      });

      // Recalculate child generation
      const newGen = await calculateMemberGeneration(targetMemberId);
      await prisma.member.update({
        where: { id: targetMemberId },
        data: { generation: newGen },
      });
      await updateDescendantGenerations(targetMemberId, newGen);

      return NextResponse.json({ success: true, message: "Child added successfully." });
    } else if (type === "spouse") {
      // Check existing marriage
      const existing = await prisma.marriageRelationship.findFirst({
        where: {
          OR: [
            { spouse1Id: id, spouse2Id: targetMemberId },
            { spouse1Id: targetMemberId, spouse2Id: id },
          ],
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: "A marriage relationship already exists between these members." },
          { status: 400 }
        );
      }

      await prisma.marriageRelationship.create({
        data: {
          spouse1Id: id,
          spouse2Id: targetMemberId,
          marriageDate: marriageDate ? new Date(marriageDate) : null,
          marriagePlace: marriagePlace?.trim() || null,
          status: status || "MARRIED",
          notes: notes?.trim() || null,
        },
      });

      await prisma.member.update({
        where: { id },
        data: { maritalStatus: "MARRIED" },
      });
      await prisma.member.update({
        where: { id: targetMemberId },
        data: { maritalStatus: "MARRIED" },
      });

      return NextResponse.json({ success: true, message: "Spouse linked successfully." });
    } else {
      return NextResponse.json(
        { error: "Invalid relationship type specified." },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Add relationship error:", error);
    return NextResponse.json(
      { error: "Failed to create relationship." },
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
    const { searchParams } = req.nextUrl;
    const relType = searchParams.get("type"); // parent, child, spouse
    const relId = searchParams.get("relId");

    if (!relType || !relId) {
      return NextResponse.json(
        { error: "Relationship type and ID are required." },
        { status: 400 }
      );
    }

    if (relType === "parent" || relType === "child") {
      const deleted = await prisma.parentChildRelationship.delete({
        where: { id: relId },
      });

      // Recalculate child's generation
      const newGen = await calculateMemberGeneration(deleted.childId);
      await prisma.member.update({
        where: { id: deleted.childId },
        data: { generation: newGen },
      });
      await updateDescendantGenerations(deleted.childId, newGen);
    } else if (relType === "spouse") {
      await prisma.marriageRelationship.delete({
        where: { id: relId },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Relationship removed successfully.",
    });
  } catch (error: any) {
    console.error("Delete relationship error:", error);
    return NextResponse.json(
      { error: "Failed to remove relationship." },
      { status: 500 }
    );
  }
}
