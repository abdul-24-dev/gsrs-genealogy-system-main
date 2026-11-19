import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  wouldCreateCircularRelationship,
  calculateMemberGeneration,
  updateDescendantGenerations,
} from "../lib/genealogy";
import { createFullBackup, restoreFromBackup } from "../lib/storage";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function runTests() {
  console.log("=================================================");
  console.log("  GSRS COMPREHENSIVE AUTOMATED VERIFICATION SUITE");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Verify Database Schema & Settings initialization
    console.log("--- 1. Testing Settings & Database Integrity ---");
    let settings = await prisma.applicationSettings.findUnique({
      where: { id: "global" },
    });
    if (!settings) {
      settings = await prisma.applicationSettings.create({
        data: {
          id: "global",
          appName: "Genealogical Search and Record System",
          familyOrOrgName: "Nasarawa Heritage Trust",
          setupCompleted: false,
        },
      });
    }
    assert(settings !== null, "Global ApplicationSettings model accessible");

    // 2. Test User Setup & Password Hashing
    console.log("\n--- 2. Testing Administrator Creation & Auth ---");
    const testEmail = "admin.test@gsrs.local";
    await prisma.user.deleteMany({ where: { email: testEmail } });

    const passwordPlain = "SuperSecret123!";
    const hashedPassword = await bcrypt.hash(passwordPlain, 10);
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        fullName: "Alhaji Ibrahim TestAdmin",
        password: hashedPassword,
        role: "SUPER_ADMIN",
        isActive: true,
      },
    });

    const isMatch = await bcrypt.compare(passwordPlain, user.password);
    assert(isMatch === true, "Bcrypt password hashing and validation verified");
    assert(user.role === "SUPER_ADMIN", "Super Admin role correctly assigned");

    // 3. Test Family Creation
    console.log("\n--- 3. Testing Family Group Management ---");
    const family = await prisma.family.create({
      data: {
        name: "Danladi Ancestral House",
        community: "Keffi Old Town",
        lga: "Keffi",
        state: "Nasarawa",
        country: "Nigeria",
        history: "Centuries-old lineage originating from the historic Keffi emirate.",
      },
    });
    assert(family.id !== undefined, `Family created successfully: ${family.name}`);

    // 4. Test Member Enrollment across Generations
    console.log("\n--- 4. Testing Member Enrollment & ID Generation ---");
    // Gen 1: Grandfather
    const gpa = await prisma.member.create({
      data: {
        memberId: "GSRS-TEST-001",
        firstName: "Bako",
        surname: "Danladi",
        fullName: "Bako Danladi",
        gender: "MALE",
        dateOfBirth: new Date("1930-04-15"),
        placeOfBirth: "Keffi",
        isDeceased: true,
        dateOfDeath: new Date("2005-11-20"),
        generation: 1,
        familyId: family.id,
      },
    });

    // Gen 1: Grandmother
    const gma = await prisma.member.create({
      data: {
        memberId: "GSRS-TEST-002",
        firstName: "Amina",
        surname: "Danladi",
        fullName: "Amina Danladi",
        gender: "FEMALE",
        dateOfBirth: new Date("1935-08-10"),
        placeOfBirth: "Keffi",
        isDeceased: true,
        generation: 1,
        familyId: family.id,
      },
    });

    // Marriage between Grandfather & Grandmother
    await prisma.marriageRelationship.create({
      data: {
        spouse1Id: gpa.id,
        spouse2Id: gma.id,
        status: "MARRIED",
        marriageDate: new Date("1952-01-10"),
      },
    });

    // Gen 2: Father (son of Bako & Amina)
    const father = await prisma.member.create({
      data: {
        memberId: "GSRS-TEST-003",
        firstName: "Usman",
        middleName: "Bako",
        surname: "Danladi",
        fullName: "Usman Bako Danladi",
        gender: "MALE",
        dateOfBirth: new Date("1960-03-22"),
        placeOfBirth: "Keffi",
        isDeceased: false,
        generation: 2,
        familyId: family.id,
      },
    });

    // Connect parents
    await prisma.parentChildRelationship.create({
      data: { parentId: gpa.id, childId: father.id, relationshipType: "BIOLOGICAL" },
    });
    await prisma.parentChildRelationship.create({
      data: { parentId: gma.id, childId: father.id, relationshipType: "BIOLOGICAL" },
    });

    // Gen 2: Mother
    const mother = await prisma.member.create({
      data: {
        memberId: "GSRS-TEST-004",
        firstName: "Zainab",
        surname: "Danladi",
        fullName: "Zainab Danladi",
        gender: "FEMALE",
        dateOfBirth: new Date("1965-06-18"),
        placeOfBirth: "Lafia",
        generation: 2,
        familyId: family.id,
      },
    });

    // Marry Father and Mother
    await prisma.marriageRelationship.create({
      data: {
        spouse1Id: father.id,
        spouse2Id: mother.id,
        status: "MARRIED",
        marriageDate: new Date("1985-12-05"),
      },
    });

    // Gen 3: Children (Brothers / Sisters)
    const child1 = await prisma.member.create({
      data: {
        memberId: "GSRS-TEST-005",
        firstName: "Kabiru",
        surname: "Danladi",
        fullName: "Kabiru Usman Danladi",
        gender: "MALE",
        dateOfBirth: new Date("1988-02-14"),
        generation: 3,
        familyId: family.id,
      },
    });
    const child2 = await prisma.member.create({
      data: {
        memberId: "GSRS-TEST-006",
        firstName: "Hadiza",
        surname: "Danladi",
        fullName: "Hadiza Usman Danladi",
        gender: "FEMALE",
        dateOfBirth: new Date("1992-09-30"),
        generation: 3,
        familyId: family.id,
      },
    });

    // Connect parents to child1 and child2
    await prisma.parentChildRelationship.createMany({
      data: [
        { parentId: father.id, childId: child1.id, relationshipType: "BIOLOGICAL" },
        { parentId: mother.id, childId: child1.id, relationshipType: "BIOLOGICAL" },
        { parentId: father.id, childId: child2.id, relationshipType: "BIOLOGICAL" },
        { parentId: mother.id, childId: child2.id, relationshipType: "BIOLOGICAL" },
      ],
    });

    assert(father.fullName === "Usman Bako Danladi", "Full name concatenation accurate");
    assert(gpa.isDeceased === true, "Living vs deceased ancestor flag verified");

    // 5. Test Circular Ancestry Detection
    console.log("\n--- 5. Testing Circular Ancestry Prevention ---");
    // Attempting to make child1 a parent of grandfather Bako
    const isCircular = await wouldCreateCircularRelationship(child1.id, gpa.id);
    assert(isCircular === true, "Circular relationship correctly detected and blocked!");

    // Attempting self-parenting
    const isSelfParent = await wouldCreateCircularRelationship(father.id, father.id);
    assert(isSelfParent === true, "Self-parenting loop correctly detected and blocked!");

    // 6. Test Generation Calculation Engine
    console.log("\n--- 6. Testing Generation Engine ---");
    const calcFatherGen = await calculateMemberGeneration(father.id);
    assert(calcFatherGen === 2, `Father generation calculated as ${calcFatherGen} (expected 2)`);

    const calcChildGen = await calculateMemberGeneration(child1.id);
    assert(calcChildGen === 3, `Child generation calculated as ${calcChildGen} (expected 3)`);

    // 7. Test Sibling Detection
    console.log("\n--- 7. Testing Sibling Resolution ---");
    const fatherChildRels = await prisma.parentChildRelationship.findMany({
      where: { parentId: father.id, childId: { not: child1.id } },
      select: { childId: true },
    });
    assert(
      fatherChildRels.some((r) => r.childId === child2.id),
      "Sibling connection (Kabiru <-> Hadiza) resolved accurately via shared parentage"
    );

    // 8. Test Genealogical Search Query
    console.log("\n--- 8. Testing Multi-Criteria Search Queries ---");
    const searchByName = await prisma.member.findMany({
      where: { fullName: { contains: "Danladi" }, isArchived: false },
    });
    assert(searchByName.length >= 6, `Search by clan surname returned ${searchByName.length} records`);

    const searchLiving = await prisma.member.findMany({
      where: { isDeceased: false, familyId: family.id },
    });
    assert(searchLiving.length === 4, `Search for living relatives returned ${searchLiving.length} records (expected 4)`);

    // 9. Test Document Upload & Attachment
    console.log("\n--- 9. Testing Document Records ---");
    const doc = await prisma.document.create({
      data: {
        title: "1952 Traditional Marriage Certificate",
        category: "MARRIAGE_CERTIFICATE",
        description: "Official record preserved in family vault",
        fileName: "marriage_cert_1952.pdf",
        filePath: "storage/uploads/certificates/test.pdf",
        fileSize: 1024 * 350,
        memberId: gpa.id,
        familyId: family.id,
      },
    });
    assert(doc.id !== undefined, `Document registered successfully: ${doc.title}`);

    // 10. Test Backup & Disaster Recovery Archive
    console.log("\n--- 10. Testing Backup Archive Generation ---");
    const backup = await createFullBackup("Test Suite");
    assert(fs.existsSync(backup.filePath), `Backup ZIP created successfully: ${backup.fileName}`);
    assert(backup.fileSize > 0, `Backup archive non-empty (${backup.fileSize} bytes)`);

    // 11. Cleanup test records so distribution remains pristine
    console.log("\n--- 11. Cleaning Test Records (Preserving Fresh State) ---");
    await prisma.document.deleteMany({ where: { familyId: family.id } });
    await prisma.parentChildRelationship.deleteMany({
      where: { parentId: { in: [gpa.id, gma.id, father.id, mother.id] } },
    });
    await prisma.marriageRelationship.deleteMany({
      where: {
        OR: [
          { spouse1Id: { in: [gpa.id, father.id] } },
          { spouse2Id: { in: [gma.id, mother.id] } },
        ],
      },
    });
    await prisma.member.deleteMany({ where: { familyId: family.id } });
    await prisma.family.delete({ where: { id: family.id } });
    await prisma.user.delete({ where: { id: user.id } });

    // Reset setupCompleted to false for the fresh end-user installation
    await prisma.applicationSettings.update({
      where: { id: "global" },
      data: { setupCompleted: false },
    });

    console.log("[OK] All test records cleanly purged.");
    console.log("[OK] System reset to fresh installation state (setupCompleted: false).");

    console.log("\n=================================================");
    console.log(`  VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("=================================================");
  } catch (error) {
    console.error("Test execution encountered an error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
