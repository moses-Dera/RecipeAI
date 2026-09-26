import RecipeEditor from "@/components/recipe/RecipeEditor";
import { getCurrentUser } from "@/lib/modules/auth/auth.service";
import { redirect } from "next/navigation";

export default async function CreateRecipePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }

  return <RecipeEditor />;
}
