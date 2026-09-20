import { NextResponse } from "next/server";
import { getCurrentUser } from "./auth.service";

/**
 * Higher-order function (AuthGuard) for protecting API routes in controllers.
 */
export function withAuth(handler: Function, requireRole?: string) {
  return async (req: Request, context: any) => {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Since role is not currently typed on the basic NextAuth user session by default,
    // we bypass the TS warning by casting to any. 
    if (requireRole && (user as any).role !== requireRole) {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    return handler(req, context);
  };
}
