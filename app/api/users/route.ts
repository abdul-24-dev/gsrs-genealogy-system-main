import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await requireAuth();
    if (!session) return unauthorizedResponse();

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to list users." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorizedResponse();

    if (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN") {
      return forbiddenResponse();
    }

    const { email, fullName, password, role } = await req.json();

    if (!email || !fullName || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A user with this email address already exists." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const validRoles = ["SUPER_ADMIN", "ADMIN", "CONTRIBUTOR", "VIEWER"];
    const userRole = validRoles.includes(role) ? role : "CONTRIBUTOR";

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        fullName: fullName.trim(),
        password: hashedPassword,
        role: userRole,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "CREATE_USER",
        details: `Created user account: ${user.fullName} (${user.role})`,
        userId: session.userId,
        userName: session.fullName,
      },
    });

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to create user." }, { status: 500 });
  }
}
