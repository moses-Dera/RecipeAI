import { NextResponse } from "next/server";
import { authService } from "./auth.service";
import { z } from "zod";

export class AuthController {
  async register(req: Request) {
    try {
      const body = await req.json();
      const user = await authService.registerUser(body);
      return NextResponse.json({ user }, { status: 201 });
    } catch (error: any) {
      if (error instanceof z.ZodError) return NextResponse.json({ error: (error as any).errors }, { status: 400 });
      if (error.message === "EMAIL_EXISTS") return NextResponse.json({ error: "Email is already registered" }, { status: 409 });
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
}
export const authController = new AuthController();
