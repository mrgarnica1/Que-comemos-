import { X, Clock, Users, Star, MapPin, Flame, Heart, Calendar, ChefHat } from 'lucide-react';
import type { Recipe } from '../data/recipes';
import { useAppStore } from '../store/useAppStore';
import type { WeekDay } from '../store/useAppStore';
import { useState } from 'react';

interface Props {
  recipe: Recipe;
  onClose: () => void;
  onEdit?: () => void;
}

const DAYS: WeekDay[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function RecipeModal({ recipe, onClose, onEdit }: Props) {
  const { toggleFavorite, isFavorite, assignMeal } = useAppStore();
  const fav = isFavorite(recipe.id);
  const [planDay, setPlanDay] = useState<WeekDay>('Mon');
  const [planSlot, setPlanSlot] = useState<'lunch' | 'dinner'>('dinner');
  const [planned, setPlanned] = useState(false);
  const [activeSection, setActiveSection] = useState<'ingredients' | 'instructions'>('ingredients');

  const handlePlan = () => {
    assignMeal(planDay, planSlot, recipe.id);
    setPlanned(true);
    setTimeout(() => setPlanned(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-3xl shadow-2xl max-h-[92vh] flex flex-col animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 p-6 pb-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-gray-500 hover:text-gray-900 transition-all shadow-sm"
          >
            <X size={18} />
          </button>

          <div className="text-5xl mb-3">{recipe.emoji}</div>
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">{recipe.name}</h2>
          <p className="text-orange-500 italic font-medium text-sm mt-0.5">{recipe.spanishName}</p>
          <p className="text-gray-600 text-sm mt-2 leading-relaxed">{recipe.description}</p>

          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <div className="flex items-center gap-1 text-sm">
              <Star size={14} className="text-amber-400" fill="currentColor" />
              <span className="font-semibold text-gray-800">{recipe.rating}</span>
              <span className="text-gray-500">({recipe.ratingCount.toLocaleString()})</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Clock size={14} />
              <span>Cook: {recipe.cookTime}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Clock size={14} className="opacity-0 w-0" />
              <span>Prep: {recipe.prepTime}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Users size={14} />
              <span>{recipe.servings} servings</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <MapPin size={14} />
              <span>{recipe.region}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
              recipe.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-700'
            }`}>
              <ChefHat size={10} className="inline mr-1" />
              {recipe.difficulty}
            </span>
            <div className="flex items-center gap-0.5">
              <span className="text-xs text-gray-500 mr-1">Spice:</span>
              {[1, 2, 3].map((i) => (
                <Flame key={i} size={13} className={recipe.spiceLevel >= i ? 'text-orange-500' : 'text-gray-200'} fill={recipe.spiceLevel >= i ? 'currentColor' : 'none'} />
              ))}
            </div>
            {recipe.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full capitalize">
                #{tag}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => toggleFavorite(recipe.id)}
              className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-xl border transition-all ${
                fav
                  ? 'bg-red-50 text-red-500 border-red-200'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-red-200 hover:text-red-500'
              }`}
            >
              <Heart size={14} fill={fav ? 'currentColor' : 'none'} />
              {fav ? 'Saved' : 'Save'}
            </button>
            {onEdit && recipe.isCustom && (
              <button
                onClick={onEdit}
                className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-all"
              >
                Edit Recipe
              </button>
            )}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 min-h-0">
          {/* Quick Plan */}
          <div className="px-6 py-4 border-b border-orange-50 bg-amber-50/50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Add to Meal Plan</p>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={planDay}
                onChange={(e) => setPlanDay(e.target.value as WeekDay)}
                className="text-sm border border-orange-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
              >
                {DAYS.map((d) => <option key={d}>{d}</option>)}
              </select>
              <select
                value={planSlot}
                onChange={(e) => setPlanSlot(e.target.value as 'lunch' | 'dinner')}
                className="text-sm border border-orange-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
              >
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
              </select>
              <button
                onClick={handlePlan}
                className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-xl transition-all ${
                  planned
                    ? 'bg-green-500 text-white'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
              >
                <Calendar size={14} />
                {planned ? 'Added!' : 'Add to Plan'}
              </button>
            </div>
          </div>

          {/* Toppings */}
          <div className="px-6 py-4 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Toppings & Garnishes</p>
            <div className="flex flex-wrap gap-1.5">
              {recipe.toppings.map((t) => (
                <span key={t} className="text-xs bg-orange-50 text-orange-700 border border-orange-100 px-2.5 py-1 rounded-full">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {(['ingredients', 'instructions'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setActiveSection(s)}
                className={`flex-1 py-3 text-sm font-semibold capitalize transition-all ${
                  activeSection === s
                    ? 'text-orange-600 border-b-2 border-orange-500'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {s}
                {s === 'ingredients' && ` (${recipe.ingredients.length})`}
              </button>
            ))}
          </div>

          {activeSection === 'ingredients' && (
            <div className="px-6 py-4 space-y-2">
              {recipe.ingredients.map((ing, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-700 capitalize">{ing.name}</span>
                  <span className="text-sm font-medium text-gray-900 bg-orange-50 px-2 py-0.5 rounded-lg">
                    {ing.amount} {ing.unit}
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'instructions' && (
            <div className="px-6 py-4 space-y-4">
              {recipe.instructions.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed pt-1">{step}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
