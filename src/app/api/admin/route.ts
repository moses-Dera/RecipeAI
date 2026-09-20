import { NextRequest, NextResponse } from "next/server";
import { adminService } from "@/lib/modules/admin/admin.service";
import { SystemSettingsSchema } from "@/lib/modules/admin/admin.schema";
import { withAuth } from "@/lib/modules/auth/auth.guard";

// GET handler using the withAuth wrapper
const getHandler = async (req: NextRequest) => {
  try {
    const settings = await adminService.getSystemSettings();
    const metrics = await adminService.getPlatformMetrics();
    
    return NextResponse.json({ settings, metrics }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch admin data" }, { status: 500 });
  }
};

// POST handler using the withAuth wrapper
const postHandler = async (req: NextRequest) => {
  try {
    const body = await req.json();
    
    // Validate request body
    const validatedData = SystemSettingsSchema.parse(body);
    
    // Update settings in database
    const result = await adminService.updateLLMSettings(validatedData);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Invalid payload" }, { status: 400 });
  }
};

export const GET = withAuth(getHandler, "admin");
export const POST = withAuth(postHandler, "admin");
