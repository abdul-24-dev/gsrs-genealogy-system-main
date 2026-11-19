import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";
import { deleteUploadedFile } from "@/lib/storage";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorizedResponse();

    const { id } = await params;
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        member: { select: { id: true, fullName: true, memberId: true } },
        family: { select: { id: true, name: true } },
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    return NextResponse.json({ document });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch document." },
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
    const doc = await prisma.document.findUnique({
      where: { id },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    // Delete physical file
    await deleteUploadedFile(doc.filePath);

    // Delete DB record
    await prisma.document.delete({
      where: { id },
    });

    await prisma.activityLog.create({
      data: {
        action: "DELETE_DOCUMENT",
        details: `Deleted document: "${doc.title}"`,
        userId: session.userId,
        userName: session.fullName,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to delete document." },
      { status: 500 }
    );
  }
}
