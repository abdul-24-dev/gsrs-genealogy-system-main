import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("=== GSRS Database Initialization ===");

  const storageDir = path.resolve(process.cwd(), "storage");
  const uploadsDir = path.resolve(storageDir, "uploads");
  const backupsDir = path.resolve(storageDir, "backups");

  if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });

  // Ensure default application settings row exists
  const settings = await prisma.applicationSettings.findUnique({
    where: { id: "global" },
  });

  if (!settings) {
    await prisma.applicationSettings.create({
      data: {
        id: "global",
        appName: "Genealogical Search and Record System",
        familyOrOrgName: "Family Heritage Archive",
        description: "Preserving family records, history, and lineage across generations.",
        setupCompleted: false,
        theme: "light",
      },
    });
    console.log("Created initial application settings record (setupCompleted: false).");
  } else {
    console.log(`Settings exist: setupCompleted = ${settings.setupCompleted}`);
  }

  const userCount = await prisma.user.count();
  console.log(`Current registered users: ${userCount}`);
  console.log("=== Database Initialization Completed Successfully ===");
}

main()
  .catch((e) => {
    console.error("Initialization error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
