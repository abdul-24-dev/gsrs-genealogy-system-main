import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const settings = await prisma.applicationSettings.findUnique({
      where: { id: "global" },
    });

    return NextResponse.json({
      authenticated: true,
      user,
      settings: settings || {
        appName: "Genealogical Search and Record System",
        familyOrOrgName: "Family Heritage Archive",
      },
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
