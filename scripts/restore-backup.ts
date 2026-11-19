import { restoreFromBackup } from "../lib/storage";
import path from "path";
import fs from "fs";

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Usage: ts-node scripts/restore-backup.ts <path-to-backup-zip>");
    process.exit(1);
  }

  const zipPath = path.resolve(process.cwd(), args[0]);
  if (!fs.existsSync(zipPath)) {
    console.error(`Error: Backup file not found at ${zipPath}`);
    process.exit(1);
  }

  console.log(`Starting restoration from ${zipPath}...`);
  try {
    await restoreFromBackup(zipPath);
    console.log("Restoration completed successfully!");
  } catch (err) {
    console.error("Restoration failed:", err);
    process.exit(1);
  }
}

main();
