import { useState } from 'react';
import { X, ChefHat, Calendar, ShoppingCart, Printer } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { WeekDay } from '../store/useAppStore';
import { RecipeModal } from '../components/RecipeModal';
import type { Recipe } from '../data/recipes';

const DAYS: WeekDay[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_LABELS: Record<WeekDay, string> = {
  Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday',
  Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday',
};

interface RecipePickerProps {
  day: WeekDay;
  slot: 'lunch' | 'dinner';
  onClose: () => void;
}

function RecipePicker({ day, slot, onClose }: RecipePickerProps) {
  const { recipes, assignMeal } = useAppStore();
  const [search, setSearch] = useState('');

  const filtered = recipes.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.category.includes(search.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl shadow-2xl max-h-[80vh] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h3 className="font-bold text-gray-900 text-base">Pick a recipe</h3>
            <p className="text-xs text-gray-500">{DAY_LABELS[day]} — {slot}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>
        <div className="px-4 py-2 border-b border-gray-50 flex-shrink-0">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipes..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            autoFocus
          />
        </div>
        <div className="overflow-y-auto flex-1 min-h-0 py-2">
          <button
            onClick={() => { assignMeal(day, slot, undefined); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-500 text-sm font-medium transition-colors"
          >
            <X size={16} />
            Remove this meal
          </button>
          {filtered.map((r) => (
            <button
              key={r.id}
              onClick={() => { assignMeal(day, slot, r.id); onClose(); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors text-left"
            >
              <span className="text-2xl">{r.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">{r.name}</p>
                <p className="text-xs text-gray-400">{r.difficulty} · {r.cookTime} · {r.category}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function buildShoppingList(
  recipes: Recipe[],
  mealPlan: Record<string, { lunch?: string; dinner?: string }>
) {
  const ingredientMap = new Map<string, string[]>();

  DAYS.forEach((day) => {
    const plan = mealPlan[day] || {};
    [plan.lunch, plan.dinner].forEach((rid) => {
      if (!rid) return;
      const recipe = recipes.find((r) => r.id === rid);
      if (!recipe) return;
      recipe.ingredients.forEach((ing) => {
        const key = ing.name.toLowerCase();
        const existing = ingredientMap.get(key) || [];
        existing.push(`${ing.amount} ${ing.unit}`.trim());
        ingredientMap.set(key, existing);
      });
    });
  });

  return Array.from(ingredientMap.entries())
    .map(([name, amounts]) => ({ name, amounts: [...new Set(amounts)].join(', ') }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function MealPlannerPage() {
  const { recipes, mealPlan, assignMeal } = useAppStore();
  const [picker, setPicker] = useState<{ day: WeekDay; slot: 'lunch' | 'dinner' } | null>(null);
  const [viewRecipe, setViewRecipe] = useState<Recipe | null>(null);

  const getRecipe = (id?: string) => id ? recipes.find((r) => r.id === id) : undefined;

  const totalMeals = DAYS.reduce((acc, d) => {
    const day = mealPlan[d] || {};
    return acc + (day.lunch ? 1 : 0) + (day.dinner ? 1 : 0);
  }, 0);

  const shoppingList = buildShoppingList(recipes, mealPlan);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl mb-3 shadow-lg">
          <Calendar size={28} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Weekly Meal Planner</h1>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          Plan your whole week. Click any slot to assign a recipe.
        </p>
        {totalMeals > 0 && (
          <p className="text-orange-500 font-semibold text-sm mt-1">{totalMeals} meal{totalMeals !== 1 ? 's' : ''} planned this week</p>
        )}
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 mb-8">
        {DAYS.map((day) => {
          const dayPlan = mealPlan[day] || {};
          const lunch = getRecipe(dayPlan.lunch);
          const dinner = getRecipe(dayPlan.dinner);
          const isWeekend = day === 'Sat' || day === 'Sun';

          return (
            <div
              key={day}
              className={`rounded-2xl border ${isWeekend ? 'border-orange-200 bg-orange-50/50' : 'border-gray-100 bg-white'} shadow-sm overflow-hidden`}
            >
              <div className={`px-3 py-2 text-center border-b ${isWeekend ? 'border-orange-200 bg-orange-100/50' : 'border-gray-100 bg-gray-50/50'}`}>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{day}</p>
                <p className="text-xs text-gray-400 lg:block hidden">{DAY_LABELS[day]}</p>
              </div>

              <div className="p-2 space-y-2">
                {(['lunch', 'dinner'] as const).map((slot) => {
                  const recipe = slot === 'lunch' ? lunch : dinner;
                  return (
                    <div key={slot}>
                      <p className="text-xs text-gray-400 font-medium capitalize mb-1 px-1">{slot}</p>
                      {recipe ? (
                        <div className="group relative rounded-xl bg-white border border-orange-100 p-2 shadow-sm">
                          <button
                            onClick={() => setViewRecipe(recipe)}
                            className="w-full text-left"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{recipe.emoji}</span>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-gray-800 leading-tight truncate">{recipe.name}</p>
                                <p className="text-xs text-gray-400">{recipe.cookTime}</p>
                              </div>
                            </div>
                          </button>
                          <button
                            onClick={() => assignMeal(day, slot, undefined)}
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-0.5 rounded-full bg-red-100 text-red-400 hover:text-red-600 transition-all"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setPicker({ day, slot })}
                          className="w-full rounded-xl border-2 border-dashed border-gray-200 hover:border-orange-300 hover:bg-orange-50 p-3 text-gray-400 hover:text-orange-500 transition-all text-xs flex items-center justify-center gap-1"
                        >
                          <ChefHat size={12} />
                          Add meal
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Shopping list */}
      {shoppingList.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <ShoppingCart size={18} className="text-orange-500" />
              Weekly Shopping List
            </h2>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
            >
              <Printer size={14} />
              Print
            </button>
          </div>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {shoppingList.map((item, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5 border-b border-gray-50 break-inside-avoid">
                <div className="w-4 h-4 rounded border-2 border-gray-300 flex-shrink-0" />
                <span className="text-sm text-gray-700 capitalize">{item.name}</span>
                <span className="text-xs text-gray-400 ml-auto">{item.amounts}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {picker && (
        <RecipePicker
          day={picker.day}
          slot={picker.slot}
          onClose={() => setPicker(null)}
        />
      )}
      {viewRecipe && (
        <RecipeModal
          recipe={viewRecipe}
          onClose={() => setViewRecipe(null)}
        />
      )}
    </div>
  );
}
