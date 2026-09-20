import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/modules/auth/auth.service";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 413 }
      );
    }

    // Generate unique filename
    const ext = file.name.split(".").pop() || "jpg";
    const uniqueName = `${randomBytes(16).toString("hex")}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    let url = "";

    // In production, we upload to Cloudflare R2 (S3-compatible)
    if (process.env.NODE_ENV === "production") {
      const s3Client = new S3Client({
        region: "auto",
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
        },
      });

      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: `recipes/${uniqueName}`,
          Body: buffer,
          ContentType: file.type,
        })
      );

      const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
      url = `${publicUrl}/recipes/${uniqueName}`;
    } else {
      // In development, save locally
      const uploadDir = path.join(process.cwd(), "public", "uploads", "recipes");
      await mkdir(uploadDir, { recursive: true });

      const filePath = path.join(uploadDir, uniqueName);
      await writeFile(filePath, buffer);

      url = `/uploads/recipes/${uniqueName}`;
    }

    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
