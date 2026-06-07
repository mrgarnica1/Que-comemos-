import { Heart, Star, Clock, Fire } from '@phosphor-icons/react';
import type { Recipe } from '../data/recipes';
import { useAppStore } from '../store/useAppStore';

interface Props {
  recipe: Recipe;
  onClick: () => void;
  matchScore?: number;
}

const difficultyColor: Record<string, string> = {
  Easy:   'bg-[#e8f5e8] text-[#2d6e30]',
  Medium: 'bg-[#fdf3e3] text-[#8b6930]',
  Hard:   'bg-[#fde8e8] text-[#b83535]',
};

export function RecipeCard({ recipe, onClick, matchScore }: Props) {
  const { toggleFavorite, isFavorite } = useAppStore();
  const fav = isFavorite(recipe.id);

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-[#e5dcd0] shadow-sm hover:shadow-md hover:border-[#c5ddc7] transition-all cursor-pointer overflow-hidden animate-fade-in"
    >
      {/* Thumbnail */}
      <div className="relative bg-gradient-to-br from-[#f4ede2] to-[#ede4d4] h-24 flex items-center justify-center select-none overflow-hidden">
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
          <span className="absolute top-1.5 left-1.5 bg-[#2d5f30] text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
            {matchScore} match
          </span>
        )}

        {/* Favorite */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(recipe.id); }}
          className={`absolute top-1.5 right-1.5 p-1 rounded-full transition-all ${
            fav ? 'bg-red-500 text-white' : 'bg-white/80 text-[#9a8570] hover:text-red-400'
          }`}
        >
          <Heart size={12} weight={fav ? 'fill' : 'regular'} />
        </button>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-bold text-[#1c1208] text-sm leading-tight group-hover:text-[#2d5f30] transition-colors truncate">
          {recipe.name}
        </h3>
        <p className="text-[11px] text-[#9a8570] italic truncate mb-2">{recipe.spanishName}</p>

        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${difficultyColor[recipe.difficulty]}`}>
            {recipe.difficulty}
          </span>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3].map((i) => (
              <Fire
                key={i}
                size={9}
                className={recipe.spiceLevel >= i ? 'text-orange-500' : 'text-[#e5dcd0]'}
                weight={recipe.spiceLevel >= i ? 'fill' : 'regular'}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2 text-[11px] text-[#9a8570]">
          <div className="flex items-center gap-0.5">
            <Star size={10} className="text-amber-400" weight="fill" />
            <span className="font-semibold text-[#5c4d3c]">{recipe.rating}</span>
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
