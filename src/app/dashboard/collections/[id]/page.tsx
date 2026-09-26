import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/modules/auth/auth.service";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FiArrowLeft, FiFolder, FiTrash2 } from "react-icons/fi";

export default async function CollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.id) return redirect("/");

  const collectionId = parseInt((await params).id);
  
  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, user_id: parseInt(user.id) },
    include: {
      saved_recipes: {
        include: {
          recipe: {
            include: { owner: true }
          }
        },
        orderBy: { saved_at: "desc" }
      }
    }
  });

  if (!collection) return redirect("/dashboard?tab=collections");

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <Link href="/dashboard?tab=collections" className="text-brand-primary font-bold hover:underline mb-4 inline-flex items-center gap-2">
          <FiArrowLeft /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-heading font-bold text-text-primary flex items-center gap-3">
          <FiFolder className="text-brand-primary" /> {collection.name}
        </h1>
        {collection.description && <p className="text-text-secondary mt-2">{collection.description}</p>}
      </div>

      {collection.saved_recipes.length === 0 ? (
        <div className="text-center py-12 bg-bg-surface border border-text-secondary/10 rounded-2xl">
          <p className="text-text-secondary">No recipes in this collection yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {collection.saved_recipes.map(({ recipe }) => (
            <div key={recipe.recipe_id} className="group bg-bg-surface border border-text-secondary/10 rounded-2xl overflow-hidden shadow-sm flex flex-col hover:shadow-xl transition-all h-full">
              <Link href={`/recipe/${recipe.recipe_id}`} className="block h-48 bg-text-secondary/5 relative overflow-hidden">
                <Image src={recipe.image_url || "/images/placeholder-1.jpg"} alt={recipe.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
              </Link>
              <div className="p-5 flex-grow flex flex-col">
                <Link href={`/recipe/${recipe.recipe_id}`}>
                  <h3 className="font-heading font-bold text-lg text-text-primary line-clamp-2 group-hover:text-brand-primary transition-colors">{recipe.title}</h3>
                </Link>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-text-secondary/10">
                   <span className="text-sm font-bold text-text-secondary truncate">{recipe.owner?.username || "Platform"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
