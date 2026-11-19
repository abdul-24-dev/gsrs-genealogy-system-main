import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import path from "path";
import fs from "fs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const doc = await prisma.document.findUnique({
      where: { id },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const fullPath = path.resolve(process.cwd(), doc.filePath);
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: "File not found on disk" }, { status: 404 });
    }

    const fileBuffer = await fs.promises.readFile(fullPath);
    const contentType = doc.fileType || "application/octet-stream";

    const isInline = req.nextUrl.searchParams.get("view") === "inline";
    const disposition = isInline
      ? `inline; filename="${encodeURIComponent(doc.fileName)}"`
      : `attachment; filename="${encodeURIComponent(doc.fileName)}"`;

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": disposition,
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("Document download error:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
