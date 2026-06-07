import { Heart, Clock, Star, Flame } from 'lucide-react';
import type { Recipe } from '../data/recipes';
import { useAppStore } from '../store/useAppStore';

interface Props {
  recipe: Recipe;
  onClick: () => void;
  matchScore?: number;
}

const difficultyColor: Record<string, string> = {
  Easy:   'bg-green-100 text-green-700',
  Medium: 'bg-amber-100 text-amber-700',
  Hard:   'bg-red-100 text-red-700',
};

export function RecipeCard({ recipe, onClick, matchScore }: Props) {
  const { toggleFavorite, isFavorite } = useAppStore();
  const fav = isFavorite(recipe.id);

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-orange-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all cursor-pointer overflow-hidden animate-fade-in"
    >
      {/* Thumbnail */}
      <div className="relative bg-gradient-to-br from-orange-50 to-amber-50 h-24 flex items-center justify-center select-none overflow-hidden">
        {recipe.photo ? (
          <img
            src={recipe.photo}
            alt={recipe.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <span className={`text-4xl ${recipe.photo ? 'hidden' : ''}`}>{recipe.emoji}</span>

        {/* Badges */}
        {recipe.isCustom && (
          <span className="absolute top-1.5 left-1.5 bg-purple-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
            Mine
          </span>
        )}
        {matchScore !== undefined && matchScore > 0 && (
          <span className="absolute top-1.5 left-1.5 bg-green-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
            {matchScore} match
          </span>
        )}

        {/* Favorite */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(recipe.id); }}
          className={`absolute top-1.5 right-1.5 p-1 rounded-full transition-all ${
            fav ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-400 hover:text-red-400'
          }`}
        >
          <Heart size={12} fill={fav ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-bold text-gray-900 text-sm leading-tight group-hover:text-orange-600 transition-colors truncate">
          {recipe.name}
        </h3>
        <p className="text-[11px] text-orange-400 italic truncate mb-2">{recipe.spanishName}</p>

        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${difficultyColor[recipe.difficulty]}`}>
            {recipe.difficulty}
          </span>
          <div className="flex items-center gap-0.5">
            {[1,2,3].map((i) => (
              <Flame key={i} size={9} className={recipe.spiceLevel >= i ? 'text-orange-500' : 'text-gray-200'} fill={recipe.spiceLevel >= i ? 'currentColor' : 'none'} />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2 text-[11px] text-gray-500">
          <div className="flex items-center gap-0.5">
            <Star size={10} className="text-amber-400" fill="currentColor" />
            <span className="font-semibold text-gray-700">{recipe.rating}</span>
          </div>
          <div className="flex items-center gap-0.5">
            <Clock size={10} />
            <span>{recipe.cookTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
