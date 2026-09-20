import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with authentic Nigerian recipes...");

  const recipes = [
    {
      title: "Classic Party Jollof",
      ingredients: JSON.stringify([
        { name: "Long grain parboiled rice", quantity: "3", unit: "cups" },
        { name: "Plum tomatoes", quantity: "6", unit: "medium" },
        { name: "Red bell peppers (Tatashe)", quantity: "3", unit: "large" },
        { name: "Habanero peppers (Ata rodo)", quantity: "2", unit: "medium" },
        { name: "Tomato paste", quantity: "150", unit: "g" },
        { name: "Red onions", quantity: "2", unit: "large" },
        { name: "Vegetable oil", quantity: "0.5", unit: "cup" },
        { name: "Chicken or beef stock", quantity: "2", unit: "cups" },
      ]),
      steps: JSON.stringify([
        "Blend the tomatoes, red bell peppers, habanero peppers, and one onion until smooth.",
        "Boil the blended pepper mix in a pot until the water evaporates and it forms a thick paste.",
        "Heat the vegetable oil in a large pot. Slice the remaining onion and fry until translucent.",
        "Add the tomato paste and fry for about 5 minutes, stirring continuously to prevent burning.",
        "Add the boiled pepper paste and fry for another 10-15 minutes.",
        "Pour in the stock, add your spices (curry, thyme, bay leaves, bouillon cubes) and bring to a boil.",
        "Wash the rice thoroughly to remove excess starch. Add the rice to the boiling sauce.",
        "Cover the pot tightly with foil to trap the steam. Cook on low heat for 30-40 minutes until the rice is tender and slightly burnt at the bottom (for that authentic party flavor!).",
      ]),
      nutrition: JSON.stringify([
        "Rich in complex carbohydrates for sustained energy",
        "Tomatoes and bell peppers provide high Vitamin C and lycopene",
        "Contains Vitamin A from red bell peppers (Tatashe)",
        "Habanero peppers boost metabolism and contain capsaicin",
        "Onions provide quercetin, a powerful antioxidant",
      ]),
      region: "West Africa",
      image_url: "/images/placeholder-1.jpg",
      prep_time_min: 45,
      difficulty: "medium",
      is_private: false,
      meal_type: ["dinner", "party"],
      occasion: ["party", "sunday"],
    },
    {
      title: "Authentic Suya Skewers",
      ingredients: JSON.stringify([
        { name: "Beef (Sirloin or Flank)", quantity: "500", unit: "g" },
        { name: "Suya spice (Yaji)", quantity: "1", unit: "cup" },
        { name: "Vegetable oil", quantity: "3", unit: "tbsp" },
        { name: "Red onions (sliced)", quantity: "1", unit: "large" },
        { name: "Tomatoes (sliced)", quantity: "2", unit: "medium" },
      ]),
      steps: JSON.stringify([
        "Slice the beef into very thin, wide pieces.",
        "Thread the beef slices onto wooden skewers.",
        "Brush the beef with vegetable oil and generously coat both sides with Suya spice.",
        "Let it marinate in the fridge for at least 1 hour.",
        "Grill the skewers over open coals (or a hot grill pan) for 3-5 minutes on each side until charred and cooked through.",
        "Serve hot with freshly sliced onions and tomatoes.",
      ]),
      nutrition: JSON.stringify([
        "Excellent source of high-quality protein for muscle repair",
        "Rich in iron and zinc from lean beef",
        "Groundnut (peanut) in Yaji spice provides healthy fats and Vitamin E",
        "Ginger and cloves in Suya spice have anti-inflammatory properties",
        "Low in carbohydrates, suitable for keto and low-carb diets",
      ]),
      region: "Northern Nigeria",
      image_url: "/images/placeholder-2.jpg",
      prep_time_min: 30,
      difficulty: "medium",
      is_private: false,
      meal_type: ["snack", "dinner"],
      occasion: ["street_food", "weekend"],
    },
    {
      title: "Pounded Yam & Egusi",
      ingredients: JSON.stringify([
        { name: "Ground Egusi (Melon seeds)", quantity: "2", unit: "cups" },
        { name: "Palm oil", quantity: "0.5", unit: "cup" },
        { name: "Assorted meat (Beef, Tripe, Cow skin)", quantity: "1", unit: "kg" },
        { name: "Stockfish and Smoked fish", quantity: "300", unit: "g" },
        { name: "Ground crayfish", quantity: "3", unit: "tbsp" },
        { name: "Bitterleaf or Spinach", quantity: "2", unit: "cups" },
      ]),
      steps: JSON.stringify([
        "Boil the assorted meats and stockfish with onions and seasoning until tender. Reserve the stock.",
        "Mix the ground egusi with a little water to form a thick paste.",
        "Heat the palm oil in a pot. Add chopped onions and fry slightly.",
        "Add the egusi paste in small lumps and fry for 10 minutes, stirring gently so the lumps don't completely break.",
        "Pour in the meat stock, assorted meats, and smoked fish. Cook for 15 minutes.",
        "Add crayfish and seasoning. Finally, add the washed vegetables and simmer for 5 minutes.",
        "Serve hot with freshly pounded yam.",
      ]),
      nutrition: JSON.stringify([
        "Egusi (melon seeds) are rich in protein, healthy fats, and B vitamins",
        "Palm oil is one of the richest natural sources of Vitamin A and E",
        "Bitterleaf is a potent source of antioxidants and aids digestion",
        "Stockfish provides omega-3 fatty acids and calcium",
        "Pounded yam provides complex carbohydrates and dietary fiber",
        "Crayfish adds calcium and phosphorus for strong bones",
      ]),
      region: "South East",
      image_url: "/images/placeholder-3.jpg",
      prep_time_min: 60,
      difficulty: "hard",
      is_private: false,
      meal_type: ["dinner", "lunch"],
      occasion: ["everyday", "celebration"],
    },
    {
      title: "Spicy Pepper Soup",
      ingredients: JSON.stringify([
        { name: "Catfish or Goat meat", quantity: "1", unit: "kg" },
        { name: "Pepper soup spice mix", quantity: "2", unit: "tbsp" },
        { name: "Habanero peppers", quantity: "3", unit: "medium" },
        { name: "Scent leaves (Efirin)", quantity: "1", unit: "handful" },
        { name: "Lemongrass", quantity: "1", unit: "stalk" },
      ]),
      steps: JSON.stringify([
        "Clean the meat or fish thoroughly (if using catfish, wash with hot water to remove slime).",
        "Place in a pot with water, chopped onions, and bouillon cubes. Bring to a boil.",
        "Add the pepper soup spice, blended habanero peppers, and lemongrass.",
        "Cook until the meat or fish is tender and the broth is flavorful.",
        "Add chopped scent leaves, simmer for 2 minutes, and serve extremely hot.",
      ]),
      nutrition: JSON.stringify([
        "Catfish is rich in omega-3 fatty acids and lean protein",
        "Pepper soup spices (Uda, Ehuru, Gbafilo) have medicinal and anti-inflammatory properties",
        "Capsaicin from habanero peppers boosts immunity and metabolism",
        "Scent leaves (Efirin) are rich in Vitamins A and C",
        "Low calorie and hydrating, excellent during cold or flu recovery",
        "Lemongrass supports digestion and has calming properties",
      ]),
      region: "South South",
      image_url: "/images/placeholder-4.jpg",
      prep_time_min: 40,
      difficulty: "easy",
      is_private: false,
      meal_type: ["starter", "dinner"],
      occasion: ["comfort", "rainy_day"],
    },
  ];

  for (const recipeData of recipes) {
    const recipe = await prisma.recipe.create({
      data: recipeData,
    });
    console.log(`Created recipe: ${recipe.title}`);
  }

  console.log("Database seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
