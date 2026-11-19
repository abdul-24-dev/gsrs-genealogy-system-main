import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";

const UPLOAD_DIR = path.resolve(process.cwd(), process.env.UPLOAD_DIR || "storage/uploads");
const BACKUP_DIR = path.resolve(process.cwd(), process.env.BACKUP_DIR || "storage/backups");
const DB_PATH = path.resolve(process.cwd(), "storage/gsrs.db");

// Ensure directories exist
export function ensureDirectories() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  const storageDir = path.resolve(process.cwd(), "storage");
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }
}

export async function saveUploadedFile(
  file: File,
  subfolder: string = ""
): Promise<{ fileName: string; filePath: string; fileSize: number; fileType: string }> {
  ensureDirectories();

  const targetDir = subfolder ? path.join(UPLOAD_DIR, subfolder) : UPLOAD_DIR;
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uniqueName = `${timestamp}-${sanitizedName}`;
  const fullPath = path.join(targetDir, uniqueName);

  await fs.promises.writeFile(fullPath, buffer);

  // Storing relative path for portability across folders and systems
  const relativePath = path.join("storage", "uploads", subfolder, uniqueName).replace(/\\/g, "/");

  return {
    fileName: file.name,
    filePath: relativePath,
    fileSize: file.size,
    fileType: file.type || "application/octet-stream",
  };
}

export async function deleteUploadedFile(relativePath: string): Promise<boolean> {
  try {
    const fullPath = path.resolve(process.cwd(), relativePath);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
      return true;
    }
  } catch (err) {
    console.error("Failed to delete file:", err);
  }
  return false;
}

export async function createFullBackup(createdBy: string = "Administrator"): Promise<{
  fileName: string;
  filePath: string;
  fileSize: number;
}> {
  ensureDirectories();

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFileName = `GSRS-Backup-${timestamp}.zip`;
  const backupFilePath = path.join(BACKUP_DIR, backupFileName);

  const zip = new AdmZip();

  // 1. Add manifest
  const manifest = {
    appName: "Genealogical Search and Record System (GSRS)",
    version: "1.0.0",
    createdAt: new Date().toISOString(),
    createdBy,
  };
  zip.addFile(
    "backup-manifest.json",
    Buffer.from(JSON.stringify(manifest, null, 2), "utf-8")
  );

  // 2. Add SQLite database if exists
  if (fs.existsSync(DB_PATH)) {
    zip.addLocalFile(DB_PATH, "database");
  }

  // 3. Add uploads folder
  if (fs.existsSync(UPLOAD_DIR)) {
    const entries = fs.readdirSync(UPLOAD_DIR);
    if (entries.length > 0) {
      zip.addLocalFolder(UPLOAD_DIR, "uploads");
    }
  }

  zip.writeZip(backupFilePath);
  const stats = fs.statSync(backupFilePath);

  return {
    fileName: backupFileName,
    filePath: path.join("storage", "backups", backupFileName).replace(/\\/g, "/"),
    fileSize: stats.size,
  };
}

export async function restoreFromBackup(zipFilePath: string): Promise<boolean> {
  ensureDirectories();

  if (!fs.existsSync(zipFilePath)) {
    throw new Error("Backup file not found at " + zipFilePath);
  }

  // 1. Safety backup of existing DB
  if (fs.existsSync(DB_PATH)) {
    const safetyCopy = path.join(
      BACKUP_DIR,
      `pre-restore-safety-${Date.now()}.db`
    );
    fs.copyFileSync(DB_PATH, safetyCopy);
  }

  // 2. Extract zip contents
  const zip = new AdmZip(zipFilePath);
  const zipEntries = zip.getEntries();

  for (const entry of zipEntries) {
    if (entry.entryName === "database/gsrs.db") {
      const content = entry.getData();
      await fs.promises.writeFile(DB_PATH, content);
    } else if (entry.entryName.startsWith("uploads/") && !entry.isDirectory) {
      const relativePathInUploads = entry.entryName.replace(/^uploads\//, "");
      if (relativePathInUploads) {
        const dest = path.join(UPLOAD_DIR, relativePathInUploads);
        const dirOfDest = path.dirname(dest);
        if (!fs.existsSync(dirOfDest)) fs.mkdirSync(dirOfDest, { recursive: true });
        await fs.promises.writeFile(dest, entry.getData());
      }
    }
  }

  return true;
}
