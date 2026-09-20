import { authController } from "@/lib/modules/auth/auth.controller";
export const POST = authController.register.bind(authController);
