import { prisma } from "@/lib/db/prisma";

export class CollectionRepository {
  async getCollections(userId: number) {
    return prisma.collection.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
      include: {
        _count: {
          select: { saved_recipes: true },
        },
      },
    });
  }

  async createCollection(userId: number, name: string, description?: string) {
    return prisma.collection.create({
      data: {
        user_id: userId,
        name,
        description,
      },
    });
  }

  async deleteCollection(userId: number, collectionId: number) {
    return prisma.collection.deleteMany({
      where: {
        id: collectionId,
        user_id: userId,
      },
    });
  }
}

export const collectionRepository = new CollectionRepository();
