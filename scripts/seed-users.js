const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("==========================================================");
  console.log("  GSRS AUTO-SEEDING: USER ACCOUNTS & DEMO HERITAGE DATA   ");
  console.log("==========================================================\n");

  const commonPassword = "Password123!";
  const hashedPassword = await bcrypt.hash(commonPassword, 10);

  // 1. Enable Setup Completed in Application Settings
  console.log("[1/5] Configuring Application Settings...");
  await prisma.applicationSettings.upsert({
    where: { id: "global" },
    update: {
      appName: "Genealogical Search and Record System",
      familyOrOrgName: "Danladi & Keffi Heritage Archive",
      description: "Preserving family records, health milestones, ancestry, and generational lineage across Nasarawa State.",
      setupCompleted: true,
      theme: "light",
    },
    create: {
      id: "global",
      appName: "Genealogical Search and Record System",
      familyOrOrgName: "Danladi & Keffi Heritage Archive",
      description: "Preserving family records, health milestones, ancestry, and generational lineage across Nasarawa State.",
      setupCompleted: true,
      theme: "light",
    },
  });

  // 2. Create the 4 Standard Role Accounts
  console.log("[2/5] Creating Authorized User Accounts...");

  const users = [
    {
      email: "admin@gsrs.local",
      fullName: "Alhaji Ibrahim Danladi",
      role: "SUPER_ADMIN",
    },
    {
      email: "archivist@gsrs.local",
      fullName: "Fatima Usman",
      role: "ADMIN",
    },
    {
      email: "contributor@gsrs.local",
      fullName: "Kabiru Danladi",
      role: "CONTRIBUTOR",
    },
    {
      email: "viewer@gsrs.local",
      fullName: "Aisha Bello",
      role: "VIEWER",
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        fullName: u.fullName,
        password: hashedPassword,
        role: u.role,
        isActive: true,
      },
      create: {
        email: u.email,
        fullName: u.fullName,
        password: hashedPassword,
        role: u.role,
        isActive: true,
      },
    });
    console.log(`  ✓ ${u.role}: ${u.email} (${u.fullName})`);
  }

  // 3. Create Sample Family Group in Nasarawa State
  console.log("\n[3/5] Seeding Family Heritage Clan in Nasarawa State...");
  let family = await prisma.family.findFirst({
    where: { name: "Danladi Ancestral Dynasty" },
  });

  if (!family) {
    family = await prisma.family.create({
      data: {
        name: "Danladi Ancestral Dynasty",
        description: "Prominent ancestral lineage rooted in traditional trade, scholarship, and community leadership in Keffi Emirate.",
        origin: "Keffi Old Town",
        community: "Keffi City",
        lga: "Keffi",
        state: "Nasarawa",
        country: "Nigeria",
        history: "A venerable lineage spanning generations, known for contributions to education, civic administration, and agriculture across Nasarawa State.",
      },
    });
  }
  console.log(`  ✓ Family Group: ${family.name} (Keffi, Nasarawa)`);

  // 4. Create 3 Generations of Family Members
  console.log("\n[4/5] Enrolling 3 Generations of Relatives for Lineage & Tree...");

  // Generation 1: Patriarch & Matriarch (Ancestors)
  let gpa = await prisma.member.findUnique({ where: { memberId: "GSRS-1001" } });
  if (!gpa) {
    gpa = await prisma.member.create({
      data: {
        memberId: "GSRS-1001",
        firstName: "Bako",
        surname: "Danladi",
        fullName: "Bako Danladi",
        gender: "MALE",
        dateOfBirth: new Date("1932-04-12"),
        placeOfBirth: "Keffi, Nasarawa State",
        isDeceased: true,
        dateOfDeath: new Date("2008-09-15"),
        placeOfDeath: "Keffi General Hospital",
        maritalStatus: "MARRIED",
        nationality: "Nigerian",
        occupation: "Master Merchant & Community Elder",
        biography: "Foundational patriarch of the family house in Keffi. Revered community leader and counselor.",
        generation: 1,
        ancestralOrigin: "Keffi Old Settlement",
        familyId: family.id,
      },
    });
  }

  let gma = await prisma.member.findUnique({ where: { memberId: "GSRS-1002" } });
  if (!gma) {
    gma = await prisma.member.create({
      data: {
        memberId: "GSRS-1002",
        firstName: "Amina",
        surname: "Danladi",
        fullName: "Amina Danladi",
        gender: "FEMALE",
        dateOfBirth: new Date("1938-08-20"),
        placeOfBirth: "Keffi, Nasarawa State",
        isDeceased: true,
        dateOfDeath: new Date("2015-03-10"),
        placeOfDeath: "Keffi",
        maritalStatus: "MARRIED",
        nationality: "Nigerian",
        occupation: "Matriarch & Textile Trader",
        biography: "Beloved matriarch remembered for community hospitality and cultural mentorship.",
        generation: 1,
        ancestralOrigin: "Keffi",
        familyId: family.id,
      },
    });
  }

  // Marriage Gen 1
  const m1 = await prisma.marriageRelationship.findFirst({
    where: {
      OR: [
        { spouse1Id: gpa.id, spouse2Id: gma.id },
        { spouse1Id: gma.id, spouse2Id: gpa.id },
      ],
    },
  });
  if (!m1) {
    await prisma.marriageRelationship.create({
      data: {
        spouse1Id: gpa.id,
        spouse2Id: gma.id,
        status: "MARRIED",
        marriageDate: new Date("1954-01-15"),
        marriagePlace: "Keffi Central Mosque",
      },
    });
  }

  // Generation 2: Father & Mother
  let father = await prisma.member.findUnique({ where: { memberId: "GSRS-1003" } });
  if (!father) {
    father = await prisma.member.create({
      data: {
        memberId: "GSRS-1003",
        firstName: "Usman",
        middleName: "Bako",
        surname: "Danladi",
        fullName: "Usman Bako Danladi",
        gender: "MALE",
        dateOfBirth: new Date("1962-06-18"),
        placeOfBirth: "Keffi, Nasarawa State",
        isDeceased: false,
        maritalStatus: "MARRIED",
        nationality: "Nigerian",
        occupation: "Senior Civil Administrator (Rtd)",
        biography: "Dedicated career in state public service and agricultural development.",
        generation: 2,
        ancestralOrigin: "Keffi",
        phone: "+234 803 123 4567",
        email: "usman.danladi@gsrs.local",
        address: "GRA Keffi, Nasarawa State",
        familyId: family.id,
      },
    });

    // Connect to Gen 1 parents
    await prisma.parentChildRelationship.createMany({
      data: [
        { parentId: gpa.id, childId: father.id, relationshipType: "BIOLOGICAL" },
        { parentId: gma.id, childId: father.id, relationshipType: "BIOLOGICAL" },
      ],
    });
  }

  let mother = await prisma.member.findUnique({ where: { memberId: "GSRS-1004" } });
  if (!mother) {
    mother = await prisma.member.create({
      data: {
        memberId: "GSRS-1004",
        firstName: "Zainab",
        middleName: "Aliyu",
        surname: "Danladi",
        fullName: "Zainab Aliyu Danladi",
        gender: "FEMALE",
        dateOfBirth: new Date("1968-11-04"),
        placeOfBirth: "Lafia, Nasarawa State",
        isDeceased: false,
        maritalStatus: "MARRIED",
        nationality: "Nigerian",
        occupation: "Educationist & School Principal",
        biography: "Passionate advocate for girl-child education in Nasarawa State.",
        generation: 2,
        ancestralOrigin: "Lafia / Keffi",
        phone: "+234 802 987 6543",
        familyId: family.id,
      },
    });

    // Marry Father and Mother
    await prisma.marriageRelationship.create({
      data: {
        spouse1Id: father.id,
        spouse2Id: mother.id,
        status: "MARRIED",
        marriageDate: new Date("1988-12-10"),
        marriagePlace: "Keffi",
      },
    });
  }

  // Generation 3: Children (Younger Adults & Youth)
  const childrenData = [
    {
      memberId: "GSRS-1005",
      firstName: "Kabiru",
      middleName: "Usman",
      surname: "Danladi",
      fullName: "Kabiru Usman Danladi",
      gender: "MALE",
      dateOfBirth: new Date("1991-03-25"),
      placeOfBirth: "Keffi, Nasarawa State",
      occupation: "Software Engineer & Genealogist",
      maritalStatus: "SINGLE",
    },
    {
      memberId: "GSRS-1006",
      firstName: "Hadiza",
      middleName: "Usman",
      surname: "Danladi",
      fullName: "Hadiza Usman Danladi",
      gender: "FEMALE",
      dateOfBirth: new Date("1995-07-14"),
      placeOfBirth: "Keffi, Nasarawa State",
      occupation: "Medical Doctor & Health Specialist",
      maritalStatus: "SINGLE",
    },
    {
      memberId: "GSRS-1007",
      firstName: "Farouk",
      middleName: "Usman",
      surname: "Danladi",
      fullName: "Farouk Usman Danladi",
      gender: "MALE",
      dateOfBirth: new Date("2000-10-09"),
      placeOfBirth: "Keffi, Nasarawa State",
      occupation: "University Student",
      maritalStatus: "SINGLE",
    },
  ];

  for (const c of childrenData) {
    let child = await prisma.member.findUnique({ where: { memberId: c.memberId } });
    if (!child) {
      child = await prisma.member.create({
        data: {
          ...c,
          isDeceased: false,
          nationality: "Nigerian",
          generation: 3,
          ancestralOrigin: "Keffi, Nasarawa",
          familyId: family.id,
        },
      });

      // Connect to Father and Mother
      await prisma.parentChildRelationship.createMany({
        data: [
          { parentId: father.id, childId: child.id, relationshipType: "BIOLOGICAL" },
          { parentId: mother.id, childId: child.id, relationshipType: "BIOLOGICAL" },
        ],
      });
    }
  }

  // 5. Activity Logs
  console.log("\n[5/5] Recording Audit Activities...");
  await prisma.activityLog.create({
    data: {
      action: "INITIAL_SEED",
      details: "Auto-generated standard role accounts and 3-generation heritage lineage for testing.",
      userName: "System Initializer",
    },
  });

  console.log("\n==========================================================");
  console.log("  SEEDING COMPLETED SUCCESSFULLY! READY FOR TESTING       ");
  console.log("==========================================================");
}

main()
  .catch((e) => {
    console.error("Error running seed script:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
