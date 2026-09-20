import { userController } from "@/lib/modules/user/user.controller";
export const GET = userController.getProfile.bind(userController);
export const PUT = userController.updateProfile.bind(userController);
