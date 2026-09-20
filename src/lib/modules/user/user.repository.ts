import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

export class UserRepository {
  async findById(userId: number) {
    return prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        username: true,
        email: true,
        role: true,
        profile_img: true,
        created_at: true,
      }
    });
  }

  async update(userId: number, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { user_id: userId },
      data,
      select: {
        user_id: true,
        username: true,
        profile_img: true,
      }
    });
  }
}

export const userRepository = new UserRepository();
