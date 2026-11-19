import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";

export async function GET() {
  try {
    const session = await requireAuth();
    if (!session) return unauthorizedResponse();

    let settings = await prisma.applicationSettings.findUnique({
      where: { id: "global" },
    });

    if (!settings) {
      settings = await prisma.applicationSettings.create({
        data: {
          id: "global",
          appName: "Genealogical Search and Record System",
          familyOrOrgName: "Family Heritage Archive",
          description: "Preserving family records, history, and lineage across generations.",
          setupCompleted: true,
          theme: "light",
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch settings." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorizedResponse();

    const body = await req.json();
    const { appName, familyOrOrgName, description, theme } = body;

    const settings = await prisma.applicationSettings.upsert({
      where: { id: "global" },
      update: {
        appName: appName?.trim() || undefined,
        familyOrOrgName: familyOrOrgName?.trim() || undefined,
        description: description !== undefined ? description?.trim() : undefined,
        theme: theme || undefined,
      },
      create: {
        id: "global",
        appName: appName?.trim() || "Genealogical Search and Record System",
        familyOrOrgName: familyOrOrgName?.trim() || "Family Heritage Archive",
        description: description?.trim() || "Preserving family records, history, and lineage across generations.",
        setupCompleted: true,
        theme: theme || "light",
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "UPDATE_SETTINGS",
        details: "Application settings updated",
        userId: session.userId,
        userName: session.fullName,
      },
    });

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update settings." }, { status: 500 });
  }
}
