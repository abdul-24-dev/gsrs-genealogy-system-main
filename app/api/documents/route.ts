import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";
import { saveUploadedFile } from "@/lib/storage";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorizedResponse();

    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category");
    const memberId = searchParams.get("memberId");
    const familyId = searchParams.get("familyId");
    const search = searchParams.get("search")?.trim() || "";

    const where: any = {};
    if (category) where.category = category;
    if (memberId) where.memberId = memberId;
    if (familyId) where.familyId = familyId;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { fileName: { contains: search } },
      ];
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        member: { select: { id: true, fullName: true, memberId: true } },
        family: { select: { id: true, name: true } },
      },
      orderBy: { uploadDate: "desc" },
    });

    return NextResponse.json({ documents });
  } catch (error: any) {
    console.error("Documents fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorizedResponse();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string | null;
    const category = formData.get("category") as string | null;
    const description = formData.get("description") as string | null;
    const memberId = formData.get("memberId") as string | null;
    const familyId = formData.get("familyId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file was uploaded." }, { status: 400 });
    }

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Document title is required." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds maximum allowed size (25MB)." },
        { status: 400 }
      );
    }

    if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "File format not supported. Only images, PDFs, and text documents are permitted." },
        { status: 400 }
      );
    }

    const subfolder = category ? category.toLowerCase() : "general";
    const uploaded = await saveUploadedFile(file, subfolder);

    const doc = await prisma.document.create({
      data: {
        title: title.trim(),
        category: category || "OTHER",
        description: description?.trim() || null,
        filePath: uploaded.filePath,
        fileName: uploaded.fileName,
        fileType: uploaded.fileType,
        fileSize: uploaded.fileSize,
        memberId: memberId || null,
        familyId: familyId || null,
      },
      include: {
        member: { select: { id: true, fullName: true, memberId: true } },
        family: { select: { id: true, name: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "UPLOAD_DOCUMENT",
        details: `Uploaded document: "${doc.title}" (${doc.category})`,
        userId: session.userId,
        userName: session.fullName,
      },
    });

    return NextResponse.json({ success: true, document: doc }, { status: 201 });
  } catch (error: any) {
    console.error("Document upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload document." },
      { status: 500 }
    );
  }
}
