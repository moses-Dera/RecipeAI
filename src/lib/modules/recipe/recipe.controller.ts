import { NextResponse } from "next/server";
import { recipeService } from "./recipe.service";
import { getCurrentUser } from "@/lib/modules/auth/auth.service";
import { z } from "zod";

export class RecipeController {
  async getRecipes(req: Request) {
    try {
      const user = await getCurrentUser();
      const userId = user?.id ? parseInt(user.id) : undefined;

      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "12");

      const result = await recipeService.getAllRecipes(userId, page, limit);
      return NextResponse.json(result);
    } catch (error) {
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }

  async getMyRecipes(req: Request) {
    try {
      const user = await getCurrentUser();
      if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "12");

      const result = await recipeService.getRecipesByOwner(parseInt(user.id), page, limit);
      return NextResponse.json(result);
    } catch (error) {
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }

  async createRecipe(req: Request) {
    try {
      const user = await getCurrentUser();
      if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      if (user.role !== "admin") return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
      const body = await req.json();
      const recipe = await recipeService.createRecipe(body, parseInt(user.id));
      return NextResponse.json({ recipe }, { status: 201 });
    } catch (error: any) {
      if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors }, { status: 400 });
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }

  async getRecipeById(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
      const user = await getCurrentUser();
      const userId = user?.id ? parseInt(user.id) : undefined;
      const id = parseInt((await params).id);
      if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
      const recipe = await recipeService.getRecipeById(id, userId);
      return NextResponse.json({ recipe });
    } catch (error: any) {
      if (error.message === "NOT_FOUND") return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }

  async updateRecipe(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
      const user = await getCurrentUser();
      if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const id = parseInt((await params).id);
      if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
      const body = await req.json();
      const recipe = await recipeService.updateRecipe(id, body, parseInt(user.id), user.role);
      return NextResponse.json({ recipe });
    } catch (error: any) {
      if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors }, { status: 400 });
      if (error.message === "NOT_FOUND") return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }

  async deleteRecipe(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
      const user = await getCurrentUser();
      if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const id = parseInt((await params).id);
      if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
      await recipeService.deleteRecipe(id, parseInt(user.id), user.role);
      return NextResponse.json({ success: true });
    } catch (error: any) {
      if (error.message === "NOT_FOUND") return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }

  async publishRecipe(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
      const user = await getCurrentUser();
      if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const id = parseInt((await params).id);
      if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
      const body = await req.json();
      const result = body.is_private
        ? await recipeService.unpublishRecipe(id, parseInt(user.id))
        : await recipeService.publishRecipe(id, parseInt(user.id));
      return NextResponse.json(result);
    } catch (error: any) {
      if (error.message === "NOT_FOUND") return NextResponse.json({ error: "Recipe not found or forbidden" }, { status: 404 });
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
}

export const recipeController = new RecipeController();
