import { prisma } from "./db";

/**
 * Checks if adding `parentId` as a parent of `childId` creates a circular relationship.
 * A circular relationship occurs if `parentId` is already a descendant of `childId`.
 */
export async function wouldCreateCircularRelationship(
  parentId: string,
  childId: string
): Promise<boolean> {
  if (parentId === childId) {
    return true; // Self-parenting
  }

  // Traverse descendants of childId to see if parentId is among them
  const visited = new Set<string>();
  const queue = [childId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === parentId) {
      return true; // Cycle detected: child is an ancestor of proposed parent
    }

    if (!visited.has(current)) {
      visited.add(current);

      const children = await prisma.parentChildRelationship.findMany({
        where: { parentId: current },
        select: { childId: true },
      });

      for (const rel of children) {
        if (!visited.has(rel.childId)) {
          queue.push(rel.childId);
        }
      }
    }
  }

  return false;
}

/**
 * Computes or adjusts generation level based on parents.
 * Root generation is 1. If parents exist, member generation is max(parent generations) + 1.
 */
export async function calculateMemberGeneration(memberId: string): Promise<number> {
  const parentRelationships = await prisma.parentChildRelationship.findMany({
    where: { childId: memberId },
    include: {
      parent: {
        select: { generation: true },
      },
    },
  });

  if (parentRelationships.length === 0) {
    return 1;
  }

  const maxParentGen = Math.max(
    ...parentRelationships.map((r) => r.parent.generation || 1)
  );

  return maxParentGen + 1;
}

/**
 * Propagate updated generation to all descendants
 */
export async function updateDescendantGenerations(memberId: string, currentGen: number) {
  const children = await prisma.parentChildRelationship.findMany({
    where: { parentId: memberId },
    select: { childId: true },
  });

  for (const item of children) {
    const newChildGen = currentGen + 1;
    await prisma.member.update({
      where: { id: item.childId },
      data: { generation: newChildGen },
    });
    await updateDescendantGenerations(item.childId, newChildGen);
  }
}
