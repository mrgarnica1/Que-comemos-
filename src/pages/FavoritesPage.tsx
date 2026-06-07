import { useState } from 'react';
import { Heart } from '@phosphor-icons/react';
import { useAppStore } from '../store/useAppStore';
import { RecipeCard } from '../components/RecipeCard';
import { RecipeDetailPage } from '../components/RecipeDetailPage';
import type { Recipe } from '../data/recipes';

export function FavoritesPage() {
  const { recipes, favoriteIds } = useAppStore();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const favorites = recipes.filter((r) => favoriteIds.includes(r.id));

  if (selectedRecipe) {
    return <RecipeDetailPage recipe={selectedRecipe} onBack={() => setSelectedRecipe(null)} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl mb-3 shadow-lg">
          <Heart size={28} className="text-white" weight="fill" />
        </div>
        <h1 className="text-3xl font-bold text-[#1c1208] mb-1">My Favorites</h1>
        <p className="text-[#7a6a55] text-sm">
          {favorites.length > 0
            ? `${favorites.length} recipe${favorites.length !== 1 ? 's' : ''} saved`
            : 'Save recipes by tapping the heart icon'}
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">💔</div>
          <p className="text-[#5c4d3c] font-medium text-lg mb-2">No favorites yet</p>
          <p className="text-[#9a8570] text-sm max-w-xs mx-auto">
            Browse the recipe collection and tap the ❤️ on any recipe to save it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {favorites.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={() => setSelectedRecipe(recipe)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
