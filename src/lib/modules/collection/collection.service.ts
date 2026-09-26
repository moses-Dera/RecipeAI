import { collectionRepository } from "./collection.repository";

export class CollectionService {
  async getUserCollections(userId: number) {
    return collectionRepository.getCollections(userId);
  }

  async createCollection(userId: number, name: string, description?: string) {
    if (!name) throw new Error("BAD_REQUEST");
    try {
      return await collectionRepository.createCollection(userId, name, description);
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error("ALREADY_EXISTS");
      }
      throw error;
    }
  }

  async deleteCollection(userId: number, collectionId: number) {
    const result = await collectionRepository.deleteCollection(userId, collectionId);
    if (result.count === 0) throw new Error("NOT_FOUND");
    return { success: true };
  }
}

export const collectionService = new CollectionService();
