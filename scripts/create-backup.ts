import { createFullBackup } from "../lib/storage";

async function main() {
  console.log("Starting GSRS CLI Backup...");
  try {
    const backup = await createFullBackup("CLI");
    console.log(`Backup completed successfully!`);
    console.log(`File: ${backup.fileName}`);
    console.log(`Location: ${backup.filePath}`);
    console.log(`Size: ${(backup.fileSize / 1024 / 1024).toFixed(2)} MB`);
  } catch (error) {
    console.error("Backup failed:", error);
    process.exit(1);
  }
}

main();
