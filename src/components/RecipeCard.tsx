import { Heart, Clock, Star, Flame, Users } from 'lucide-react';
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

const categoryEmoji: Record<string, string> = {
  tacos:     '🌮',
  soups:     '🍲',
  antojitos: '🫓',
  mains:     '🍖',
  seafood:   '🦐',
  breakfast: '🌅',
  sides:     '🌽',
};

export function RecipeCard({ recipe, onClick, matchScore }: Props) {
  const { toggleFavorite, isFavorite } = useAppStore();
  const fav = isFavorite(recipe.id);

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-orange-100 shadow-sm hover:shadow-lg hover:border-orange-200 transition-all cursor-pointer animate-fade-in overflow-hidden"
    >
      {/* Emoji banner */}
      <div className="relative bg-gradient-to-br from-orange-50 to-amber-50 h-32 flex items-center justify-center text-6xl select-none">
        {recipe.emoji || categoryEmoji[recipe.category] || '🍽️'}
        {recipe.isCustom && (
          <span className="absolute top-2 left-2 bg-purple-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            My Recipe
          </span>
        )}
        {matchScore !== undefined && matchScore > 0 && (
          <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            {matchScore} topping{matchScore !== 1 ? 's' : ''} match
          </span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(recipe.id); }}
          className={`absolute top-2 right-2 p-1.5 rounded-full transition-all ${
            fav
              ? 'bg-red-500 text-white scale-110'
              : 'bg-white/80 text-gray-400 hover:text-red-400 hover:bg-white'
          }`}
        >
          <Heart size={15} fill={fav ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <h3 className="font-bold text-gray-900 text-base leading-tight group-hover:text-orange-600 transition-colors">
              {recipe.name}
            </h3>
            <p className="text-xs text-orange-400 font-medium italic">{recipe.spanishName}</p>
          </div>
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 mt-1.5 mb-3 leading-relaxed">
          {recipe.description}
        </p>

        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${difficultyColor[recipe.difficulty]}`}>
            {recipe.difficulty}
          </span>
          <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full capitalize">
            {recipe.category}
          </span>
          <div className="flex items-center gap-0.5 ml-auto">
            {[1, 2, 3].map((i) => (
              <Flame
                key={i}
                size={12}
                className={recipe.spiceLevel >= i ? 'text-orange-500' : 'text-gray-200'}
                fill={recipe.spiceLevel >= i ? 'currentColor' : 'none'}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500 pt-2 border-t border-gray-50">
          <div className="flex items-center gap-1">
            <Star size={12} className="text-amber-400" fill="currentColor" />
            <span className="font-semibold text-gray-700">{recipe.rating}</span>
            <span className="text-gray-400">({recipe.ratingCount.toLocaleString()})</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{recipe.cookTime}</span>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <Users size={12} />
            <span>{recipe.servings}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
