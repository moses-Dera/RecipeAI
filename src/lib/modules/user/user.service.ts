import { userRepository } from "./user.repository";
import { UpdateProfileDTO, UpdateProfileSchema } from "./user.schema";

export class UserService {
  async getUserProfile(userId: number) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error("NOT_FOUND");
    return user;
  }

  async updateProfile(userId: number, data: UpdateProfileDTO) {
    const validated = UpdateProfileSchema.parse(data);
    return userRepository.update(userId, validated);
  }

  async deleteAccount(userId: number) {
    return userRepository.deleteAccount(userId);
  }
}

export const userService = new UserService();
