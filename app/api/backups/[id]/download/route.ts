import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";
import path from "path";
import fs from "fs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorizedResponse();

    const { id } = await params;
    const record = await prisma.backupRecord.findUnique({
      where: { id },
    });

    if (!record) {
      return NextResponse.json({ error: "Backup not found." }, { status: 404 });
    }

    const fullPath = path.resolve(process.cwd(), record.filePath);
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: "Backup file not found on disk." }, { status: 404 });
    }

    const fileBuffer = await fs.promises.readFile(fullPath);
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${record.fileName}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Download failed." }, { status: 500 });
  }
}
