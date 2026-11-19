-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Family" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "origin" TEXT,
    "community" TEXT,
    "lga" TEXT,
    "state" TEXT,
    "country" TEXT DEFAULT 'Nigeria',
    "history" TEXT,
    "emblemUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Family_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "surname" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "gender" TEXT NOT NULL DEFAULT 'MALE',
    "dateOfBirth" TIMESTAMP(3),
    "placeOfBirth" TEXT,
    "isDeceased" BOOLEAN NOT NULL DEFAULT false,
    "dateOfDeath" TIMESTAMP(3),
    "placeOfDeath" TEXT,
    "maritalStatus" TEXT DEFAULT 'SINGLE',
    "nationality" TEXT DEFAULT 'Nigerian',
    "occupation" TEXT,
    "biography" TEXT,
    "photoUrl" TEXT,
    "generation" INTEGER NOT NULL DEFAULT 1,
    "ancestralOrigin" TEXT,
    "notes" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "familyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentChildRelationship" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "relationshipType" TEXT NOT NULL DEFAULT 'BIOLOGICAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParentChildRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarriageRelationship" (
    "id" TEXT NOT NULL,
    "spouse1Id" TEXT NOT NULL,
    "spouse2Id" TEXT NOT NULL,
    "marriageDate" TIMESTAMP(3),
    "marriagePlace" TEXT,
    "status" TEXT NOT NULL DEFAULT 'MARRIED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarriageRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'OTHER',
    "description" TEXT,
    "filePath" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "memberId" TEXT,
    "familyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "userId" TEXT,
    "userName" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationSettings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "appName" TEXT NOT NULL DEFAULT 'Genealogical Search and Record System',
    "familyOrOrgName" TEXT NOT NULL DEFAULT 'Family Heritage Archive',
    "description" TEXT DEFAULT 'Preserving family records, history, and lineage across generations.',
    "setupCompleted" BOOLEAN NOT NULL DEFAULT false,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "allowedRegistration" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BackupRecord" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BackupRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Family_name_idx" ON "Family"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Member_memberId_key" ON "Member"("memberId");

-- CreateIndex
CREATE INDEX "Member_fullName_idx" ON "Member"("fullName");

-- CreateIndex
CREATE INDEX "Member_surname_idx" ON "Member"("surname");

-- CreateIndex
CREATE INDEX "Member_memberId_idx" ON "Member"("memberId");

-- CreateIndex
CREATE INDEX "Member_familyId_idx" ON "Member"("familyId");

-- CreateIndex
CREATE INDEX "Member_generation_idx" ON "Member"("generation");

-- CreateIndex
CREATE INDEX "ParentChildRelationship_parentId_idx" ON "ParentChildRelationship"("parentId");

-- CreateIndex
CREATE INDEX "ParentChildRelationship_childId_idx" ON "ParentChildRelationship"("childId");

-- CreateIndex
CREATE UNIQUE INDEX "ParentChildRelationship_parentId_childId_key" ON "ParentChildRelationship"("parentId", "childId");

-- CreateIndex
CREATE INDEX "MarriageRelationship_spouse1Id_idx" ON "MarriageRelationship"("spouse1Id");

-- CreateIndex
CREATE INDEX "MarriageRelationship_spouse2Id_idx" ON "MarriageRelationship"("spouse2Id");

-- CreateIndex
CREATE UNIQUE INDEX "MarriageRelationship_spouse1Id_spouse2Id_key" ON "MarriageRelationship"("spouse1Id", "spouse2Id");

-- CreateIndex
CREATE INDEX "Document_memberId_idx" ON "Document"("memberId");

-- CreateIndex
CREATE INDEX "Document_familyId_idx" ON "Document"("familyId");

-- CreateIndex
CREATE INDEX "Document_category_idx" ON "Document"("category");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentChildRelationship" ADD CONSTRAINT "ParentChildRelationship_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentChildRelationship" ADD CONSTRAINT "ParentChildRelationship_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarriageRelationship" ADD CONSTRAINT "MarriageRelationship_spouse1Id_fkey" FOREIGN KEY ("spouse1Id") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarriageRelationship" ADD CONSTRAINT "MarriageRelationship_spouse2Id_fkey" FOREIGN KEY ("spouse2Id") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
