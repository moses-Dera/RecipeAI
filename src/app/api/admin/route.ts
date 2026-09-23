import { NextRequest, NextResponse } from "next/server";
import { adminService } from "@/lib/modules/admin/admin.service";
import { withAuth } from "@/lib/modules/auth/auth.guard";

// GET handler — returns read-only AI config from .env + platform metrics
const getHandler = async (req: NextRequest) => {
  try {
    const settings = await adminService.getSystemSettings();
    const metrics = await adminService.getPlatformMetrics();
    
    return NextResponse.json({ settings, metrics }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch admin data" }, { status: 500 });
  }
};

export const GET = withAuth(getHandler, "admin");
