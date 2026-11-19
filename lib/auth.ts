import { getSession } from "./session";
import { prisma } from "./db";
import { NextResponse } from "next/server";

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    return null;
  }
  return session;
}

export async function checkSetupStatus() {
  const settings = await prisma.applicationSettings.findUnique({
    where: { id: "global" },
  });
  const adminCount = await prisma.user.count();
  return {
    setupCompleted: !!settings?.setupCompleted && adminCount > 0,
    adminCount,
    settings,
  };
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: "Unauthorized. Please log in to continue." },
    { status: 401 }
  );
}

export function forbiddenResponse() {
  return NextResponse.json(
    { error: "Forbidden. You do not have permission to perform this action." },
    { status: 403 }
  );
}
