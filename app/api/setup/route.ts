import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/session";

export async function GET() {
  try {
    const adminCount = await prisma.user.count();
    const settings = await prisma.applicationSettings.findUnique({
      where: { id: "global" },
    });

    const isSetupCompleted = !!settings?.setupCompleted && adminCount > 0;

    return NextResponse.json({
      setupCompleted: isSetupCompleted,
      appName: settings?.appName || "Genealogical Search and Record System",
      familyOrOrgName: settings?.familyOrOrgName || "Family Heritage Archive",
    });
  } catch (error) {
    console.error("Setup check error:", error);
    return NextResponse.json(
      { error: "Failed to check setup status." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminCount = await prisma.user.count();
    const existingSettings = await prisma.applicationSettings.findUnique({
      where: { id: "global" },
    });

    if (existingSettings?.setupCompleted && adminCount > 0) {
      return NextResponse.json(
        { error: "First-time setup has already been completed." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      fullName,
      email,
      password,
      confirmPassword,
      familyOrOrgName,
      description,
    } = body;

    // Validation
    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: "Administrator name, email, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create Super Admin user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        fullName: fullName.trim(),
        password: hashedPassword,
        role: "SUPER_ADMIN",
        isActive: true,
      },
    });

    // Save Application Settings
    const orgName = (familyOrOrgName || "Family Heritage Archive").trim();
    const desc = (
      description || "Preserving family records, history, and lineage across generations."
    ).trim();

    await prisma.applicationSettings.upsert({
      where: { id: "global" },
      update: {
        familyOrOrgName: orgName,
        description: desc,
        setupCompleted: true,
      },
      create: {
        id: "global",
        appName: "Genealogical Search and Record System",
        familyOrOrgName: orgName,
        description: desc,
        setupCompleted: true,
        theme: "light",
      },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        action: "INITIAL_SETUP",
        details: `First-time setup completed by ${user.fullName} (${user.email})`,
        userId: user.id,
        userName: user.fullName,
      },
    });

    // Auto-create initial session
    await createSession({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      message: "Setup completed successfully.",
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to complete setup." },
      { status: 500 }
    );
  }
}
