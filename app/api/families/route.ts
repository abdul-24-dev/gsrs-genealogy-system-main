import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorizedResponse();

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search") || "";

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { origin: { contains: search } },
        { community: { contains: search } },
        { state: { contains: search } },
      ];
    }

    const families = await prisma.family.findMany({
      where,
      include: {
        _count: {
          select: { members: true, documents: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ families });
  } catch (error: any) {
    console.error("Families fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch families." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorizedResponse();

    const body = await req.json();
    const { name, description, origin, community, lga, state, country, history, emblemUrl } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Family name is required." },
        { status: 400 }
      );
    }

    const family = await prisma.family.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        origin: origin?.trim() || null,
        community: community?.trim() || null,
        lga: lga?.trim() || null,
        state: state?.trim() || null,
        country: country?.trim() || "Nigeria",
        history: history?.trim() || null,
        emblemUrl: emblemUrl || null,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "CREATE_FAMILY",
        details: `Created family: ${family.name}`,
        userId: session.userId,
        userName: session.fullName,
      },
    });

    return NextResponse.json({ success: true, family }, { status: 201 });
  } catch (error: any) {
    console.error("Family creation error:", error);
    return NextResponse.json(
      { error: "Failed to create family." },
      { status: 500 }
    );
  }
}
