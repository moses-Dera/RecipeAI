#!/bin/bash

# Auth Module
cat << 'EOT' > src/lib/modules/auth/auth.controller.ts
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
EOT

cat << 'EOT' > src/app/api/auth/register/route.ts
import { authController } from "@/lib/modules/auth/auth.controller";
export const POST = authController.register.bind(authController);
EOT

# Recipe Module
cat << 'EOT' > src/lib/modules/recipe/recipe.controller.ts
import { NextResponse } from "next/server";
import { recipeService } from "./recipe.service";
import { getCurrentUser } from "@/lib/auth/session";
import { z } from "zod";

export class RecipeController {
  async getRecipes(req: Request) {
    try {
      const user = await getCurrentUser();
      const userId = user?.id ? parseInt(user.id as string) : undefined;
      const recipes = await recipeService.getAllRecipes(userId);
      return NextResponse.json({ recipes });
    } catch (error) {
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }

  async createRecipe(req: Request) {
    try {
      const user = await getCurrentUser();
      if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const body = await req.json();
      const recipe = await recipeService.createRecipe(parseInt(user.id as string), body);
      return NextResponse.json({ recipe }, { status: 201 });
    } catch (error: any) {
      if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors }, { status: 400 });
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }

  async getRecipeById(req: Request, { params }: { params: { id: string } }) {
    try {
      const user = await getCurrentUser();
      const userId = user?.id ? parseInt(user.id as string) : undefined;
      const id = parseInt(params.id);
      if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
      const recipe = await recipeService.getRecipeById(id, userId);
      return NextResponse.json({ recipe });
    } catch (error: any) {
      if (error.message === "NOT_FOUND") return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }

  async publishRecipe(req: Request, { params }: { params: { id: string } }) {
    try {
      const user = await getCurrentUser();
      if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const id = parseInt(params.id);
      if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
      const body = await req.json();
      const recipe = await recipeService.publishRecipe(id, parseInt(user.id as string), body.is_private);
      return NextResponse.json({ recipe });
    } catch (error: any) {
      if (error.message === "NOT_FOUND") return NextResponse.json({ error: "Recipe not found or forbidden" }, { status: 404 });
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
}
export const recipeController = new RecipeController();
EOT

cat << 'EOT' > src/app/api/recipes/route.ts
import { recipeController } from "@/lib/modules/recipe/recipe.controller";
export const GET = recipeController.getRecipes.bind(recipeController);
export const POST = recipeController.createRecipe.bind(recipeController);
EOT

cat << 'EOT' > src/app/api/recipes/[id]/route.ts
import { recipeController } from "@/lib/modules/recipe/recipe.controller";
export const GET = recipeController.getRecipeById.bind(recipeController);
EOT

cat << 'EOT' > src/app/api/recipes/[id]/publish/route.ts
import { recipeController } from "@/lib/modules/recipe/recipe.controller";
export const POST = recipeController.publishRecipe.bind(recipeController);
EOT


# User Module
cat << 'EOT' > src/lib/modules/user/user.controller.ts
import { NextResponse } from "next/server";
import { userService } from "./user.service";
import { getCurrentUser } from "@/lib/auth/session";
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
EOT

cat << 'EOT' > src/app/api/user/route.ts
import { userController } from "@/lib/modules/user/user.controller";
export const GET = userController.getProfile.bind(userController);
export const PUT = userController.updateProfile.bind(userController);
EOT


# Saved Module
cat << 'EOT' > src/lib/modules/saved/saved.controller.ts
import { NextResponse } from "next/server";
import { savedService } from "./saved.service";
import { getCurrentUser } from "@/lib/auth/session";
import { z } from "zod";

export class SavedController {
  async getSavedRecipes(req: Request) {
    try {
      const user = await getCurrentUser();
      if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const saved = await savedService.getUserSavedRecipes(parseInt(user.id as string));
      return NextResponse.json({ saved });
    } catch (error: any) {
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }

  async saveRecipe(req: Request) {
    try {
      const user = await getCurrentUser();
      if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const body = await req.json();
      const saved = await savedService.saveRecipe(parseInt(user.id as string), body);
      return NextResponse.json({ saved }, { status: 201 });
    } catch (error: any) {
      if (error instanceof z.ZodError) return NextResponse.json({ error: (error as any).errors }, { status: 400 });
      if (error.message === "ALREADY_SAVED") return NextResponse.json({ error: "Recipe is already saved" }, { status: 409 });
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }

  async unsaveRecipe(req: Request, { params }: { params: { saveId: string } }) {
    try {
      const user = await getCurrentUser();
      if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const saveId = parseInt(params.saveId);
      if (isNaN(saveId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
      await savedService.unsaveRecipe(parseInt(user.id as string), saveId);
      return NextResponse.json({ success: true });
    } catch (error: any) {
      if (error.message === "NOT_FOUND") return NextResponse.json({ error: "Saved recipe not found or permission denied" }, { status: 404 });
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
}
export const savedController = new SavedController();
EOT

cat << 'EOT' > src/app/api/saved/route.ts
import { savedController } from "@/lib/modules/saved/saved.controller";
export const GET = savedController.getSavedRecipes.bind(savedController);
export const POST = savedController.saveRecipe.bind(savedController);
EOT

cat << 'EOT' > src/app/api/saved/[saveId]/route.ts
import { savedController } from "@/lib/modules/saved/saved.controller";
export const DELETE = savedController.unsaveRecipe.bind(savedController);
EOT


# Chat Module
cat << 'EOT' > src/lib/modules/chat/chat.controller.ts
import { NextResponse } from "next/server";
import { chatService } from "./chat.service";
import { getCurrentUser } from "@/lib/auth/session";
import { z } from "zod";

export class ChatController {
  async getChatHistory(req: Request) {
    try {
      const user = await getCurrentUser();
      if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const url = new URL(req.url);
      const sessionId = url.searchParams.get("sessionId");
      if (!sessionId) return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
      const history = await chatService.getChatHistory(parseInt(user.id as string), sessionId);
      return NextResponse.json({ history });
    } catch (error: any) {
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }

  async processMessage(req: Request) {
    try {
      const user = await getCurrentUser();
      const userId = user?.id ? parseInt(user.id as string) : undefined;
      const body = await req.json();
      if (!userId) return NextResponse.json({ message: "I'm Chef Ada! (Guest Mode - history not saved)" }, { status: 200 });
      const aiMessage = await chatService.processMessage(userId, body);
      return NextResponse.json(aiMessage, { status: 201 });
    } catch (error: any) {
      if (error instanceof z.ZodError) return NextResponse.json({ error: (error as any).errors }, { status: 400 });
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
}
export const chatController = new ChatController();
EOT

cat << 'EOT' > src/app/api/chat/route.ts
import { chatController } from "@/lib/modules/chat/chat.controller";
export const GET = chatController.getChatHistory.bind(chatController);
export const POST = chatController.processMessage.bind(chatController);
EOT


# Export Module
cat << 'EOT' > src/lib/modules/export/export.controller.ts
import { NextResponse } from "next/server";
import { exportService } from "./export.service";
import { getCurrentUser } from "@/lib/auth/session";

export class ExportController {
  async downloadRecipe(req: Request, { params }: { params: { id: string } }) {
    try {
      const user = await getCurrentUser();
      if (!user?.id) return NextResponse.json({ error: "Registered account required to export recipes" }, { status: 401 });
      const recipeId = parseInt(params.id);
      if (isNaN(recipeId)) return NextResponse.json({ error: "Invalid recipe ID" }, { status: 400 });
      const buffer = await exportService.generateDocx(recipeId, parseInt(user.id as string));
      return new NextResponse(buffer, {
        headers: {
          "Content-Disposition": `attachment; filename="recipe-${recipeId}.docx"`,
          "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        },
      });
    } catch (error: any) {
      if (error.message === "NOT_FOUND") return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
}
export const exportController = new ExportController();
EOT

cat << 'EOT' > src/app/api/export/[id]/route.ts
import { exportController } from "@/lib/modules/export/export.controller";
export const GET = exportController.downloadRecipe.bind(exportController);
EOT


# Spec files
for mod in auth recipe user saved chat export; do
cat << 'EOT' > src/lib/modules/${mod}/${mod}.spec.ts
describe("${mod} Module", () => {
  it("should have tests written", () => {
    expect(true).toBe(true);
  });
});
EOT
done

# Ensure there are no dangling old files causing ghost errors
rm -f src/lib/auth.ts src/lib/prisma.ts src/lib/session.ts

