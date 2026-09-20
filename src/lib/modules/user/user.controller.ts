import { NextResponse } from "next/server";
import { userService } from "./user.service";
import { getCurrentUser } from "@/lib/modules/auth/auth.service";
import { z } from "zod";

export class UserController {
  async getProfile(req: Request) {
    try {
      const user = await getCurrentUser();
      if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const profile = await userService.getUserProfile(parseInt(user.id as string));
      return NextResponse.json({ profile });
    } catch (error: any) {
      if (error.message === "NOT_FOUND") return NextResponse.json({ error: "User not found" }, { status: 404 });
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }

  async updateProfile(req: Request) {
    try {
      const user = await getCurrentUser();
      if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const body = await req.json();
      const updated = await userService.updateProfile(parseInt(user.id as string), body);
      return NextResponse.json({ profile: updated });
    } catch (error: any) {
      if (error instanceof z.ZodError) return NextResponse.json({ error: (error as any).errors }, { status: 400 });
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
}
export const userController = new UserController();
