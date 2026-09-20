export function Footer() {
  return (
    <footer className="w-full bg-bg-surface border-t border-text-secondary/10 py-8 mt-auto">
      <div className="container mx-auto px-4 text-center text-text-secondary text-sm">
        <p>&copy; {new Date().getFullYear()} RecipeAI. All rights reserved.</p>
      </div>
    </footer>
  );
}
