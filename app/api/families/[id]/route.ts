import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorizedResponse();

    const { id } = await params;
    const family = await prisma.family.findUnique({
      where: { id },
      include: {
        members: {
          orderBy: [{ generation: "asc" }, { surname: "asc" }],
        },
        documents: {
          orderBy: { uploadDate: "desc" },
        },
        _count: {
          select: { members: true, documents: true },
        },
      },
    });

    if (!family) {
      return NextResponse.json({ error: "Family not found." }, { status: 404 });
    }

    return NextResponse.json({ family });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch family details." },
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
    const { name, description, origin, community, lga, state, country, history, emblemUrl } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Family name is required." },
        { status: 400 }
      );
    }

    const family = await prisma.family.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        origin: origin?.trim() || null,
        community: community?.trim() || null,
        lga: lga?.trim() || null,
        state: state?.trim() || null,
        country: country?.trim() || "Nigeria",
        history: history?.trim() || null,
        emblemUrl: emblemUrl !== undefined ? emblemUrl : undefined,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "UPDATE_FAMILY",
        details: `Updated family: ${family.name}`,
        userId: session.userId,
        userName: session.fullName,
      },
    });

    return NextResponse.json({ success: true, family });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update family." },
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
    const family = await prisma.family.findUnique({
      where: { id },
      select: { name: true },
    });

    if (!family) {
      return NextResponse.json({ error: "Family not found." }, { status: 404 });
    }

    // Unlink members before deleting family to preserve human records
    await prisma.member.updateMany({
      where: { familyId: id },
      data: { familyId: null },
    });

    await prisma.family.delete({
      where: { id },
    });

    await prisma.activityLog.create({
      data: {
        action: "DELETE_FAMILY",
        details: `Deleted family: ${family.name}`,
        userId: session.userId,
        userName: session.fullName,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Family deleted successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to delete family." },
      { status: 500 }
    );
  }
}
