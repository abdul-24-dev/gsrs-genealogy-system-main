import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";
import { createFullBackup, restoreFromBackup, saveUploadedFile } from "@/lib/storage";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const session = await requireAuth();
    if (!session) return unauthorizedResponse();

    const backups = await prisma.backupRecord.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ backups });
  } catch (error: any) {
    console.error("Backups list error:", error);
    return NextResponse.json({ error: "Failed to list backups." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorizedResponse();

    const backup = await createFullBackup(session.fullName);

    const record = await prisma.backupRecord.create({
      data: {
        fileName: backup.fileName,
        filePath: backup.filePath,
        fileSize: backup.fileSize,
        status: "SUCCESS",
        createdBy: session.fullName,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "CREATE_BACKUP",
        details: `Created full system backup: ${backup.fileName}`,
        userId: session.userId,
        userName: session.fullName,
      },
    });

    return NextResponse.json({ success: true, backup: record }, { status: 201 });
  } catch (error: any) {
    console.error("Backup creation error:", error);
    return NextResponse.json({ error: "Failed to create backup." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorizedResponse();

    const formData = await req.formData();
    const file = formData.get("backupFile") as File | null;
    const backupId = formData.get("backupId") as string | null;

    let targetZipPath = "";

    if (file) {
      if (!file.name.endsWith(".zip")) {
        return NextResponse.json(
          { error: "Invalid backup format. Only GSRS .zip archives are supported." },
          { status: 400 }
        );
      }
      const uploaded = await saveUploadedFile(file, "temp-restores");
      targetZipPath = path.resolve(process.cwd(), uploaded.filePath);
    } else if (backupId) {
      const record = await prisma.backupRecord.findUnique({
        where: { id: backupId },
      });
      if (!record) {
        return NextResponse.json({ error: "Backup record not found." }, { status: 404 });
      }
      targetZipPath = path.resolve(process.cwd(), record.filePath);
    } else {
      return NextResponse.json(
        { error: "Please provide a backup file or select an existing backup." },
        { status: 400 }
      );
    }

    if (!fs.existsSync(targetZipPath)) {
      return NextResponse.json(
        { error: "Specified backup file does not exist on disk." },
        { status: 404 }
      );
    }

    // Execute restoration
    await restoreFromBackup(targetZipPath);

    await prisma.activityLog.create({
      data: {
        action: "RESTORE_BACKUP",
        details: `System restored from backup archive: ${path.basename(targetZipPath)}`,
        userId: session.userId,
        userName: session.fullName,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Database and records successfully restored from backup.",
    });
  } catch (error: any) {
    console.error("Restore error:", error);
    return NextResponse.json(
      { error: "Restoration failed: " + (error.message || "Unknown error") },
      { status: 500 }
    );
  }
}
