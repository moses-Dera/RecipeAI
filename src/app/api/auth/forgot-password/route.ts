import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import crypto from "crypto";
import { mailService } from "@/lib/modules/mail/mail.service";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // For security, always return success even if email doesn't exist
      return NextResponse.json({ message: "If that email is registered, a reset link has been sent." });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Update user in DB
    await prisma.user.update({
      where: { email },
      data: {
        reset_token: resetToken,
        reset_token_expires: resetTokenExpiry
      }
    });

    // Send email
    await mailService.sendPasswordResetEmail(email, resetToken);

    return NextResponse.json({ message: "If that email is registered, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
