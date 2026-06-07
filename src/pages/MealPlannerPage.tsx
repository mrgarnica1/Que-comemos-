import { useState } from 'react';
import { X, CalendarBlank, ShoppingCart, Printer, ChefHat } from '@phosphor-icons/react';
import { useAppStore } from '../store/useAppStore';
import type { WeekDay } from '../store/useAppStore';
import { RecipeDetailPage } from '../components/RecipeDetailPage';
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
      <div className="bg-white w-full sm:max-w-md sm:rounded-xl rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#ede4d8] flex-shrink-0">
          <div>
            <h3 className="font-bold text-[#1c1208] text-base">Pick a recipe</h3>
            <p className="text-xs text-[#9a8570]">{DAY_LABELS[day]} — {slot}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#f2ece0]">
            <X size={16} className="text-[#5c4d3c]" />
          </button>
        </div>
        <div className="px-4 py-2 border-b border-[#f5efe6] flex-shrink-0">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipes..."
            className="w-full border border-[#e5dcd0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8fba8f] text-[#1c1208] placeholder:text-[#9a8570]"
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
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#f2ece0] transition-colors text-left"
            >
              <span className="text-2xl">{r.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#1c1208] text-sm truncate">{r.name}</p>
                <p className="text-xs text-[#9a8570]">{r.difficulty} · {r.cookTime} · {r.category}</p>
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

  if (viewRecipe) {
    return <RecipeDetailPage recipe={viewRecipe} onBack={() => setViewRecipe(null)} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#4a5c3d] to-[#2d3d28] rounded-xl mb-3 shadow-lg">
          <CalendarBlank size={28} className="text-white" weight="fill" />
        </div>
        <h1 className="text-3xl font-bold text-[#1c1208] mb-1">Weekly Meal Planner</h1>
        <p className="text-[#7a6a55] text-sm max-w-sm mx-auto">
          Plan your whole week. Click any slot to assign a recipe.
        </p>
        {totalMeals > 0 && (
          <p className="text-[#2d5f30] font-semibold text-sm mt-1">
            {totalMeals} meal{totalMeals !== 1 ? 's' : ''} planned this week
          </p>
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
              className={`rounded-xl border ${
                isWeekend ? 'border-[#d5c9bb] bg-[#f4ede2]/50' : 'border-[#ede4d8] bg-white'
              } shadow-sm overflow-hidden`}
            >
              <div className={`px-3 py-2 text-center border-b ${
                isWeekend ? 'border-[#d5c9bb] bg-[#ede4d4]/50' : 'border-[#ede4d8] bg-[#f8f3eb]/50'
              }`}>
                <p className="text-xs font-bold text-[#9a8570] uppercase tracking-wider">{day}</p>
                <p className="text-xs text-[#9a8570] lg:block hidden">{DAY_LABELS[day]}</p>
              </div>

              <div className="p-2 space-y-2">
                {(['lunch', 'dinner'] as const).map((slot) => {
                  const recipe = slot === 'lunch' ? lunch : dinner;
                  return (
                    <div key={slot}>
                      <p className="text-xs text-[#9a8570] font-medium capitalize mb-1 px-1">{slot}</p>
                      {recipe ? (
                        <div className="group relative rounded-lg bg-white border border-[#e5dcd0] p-2 shadow-sm">
                          <button
                            onClick={() => setViewRecipe(recipe)}
                            className="w-full text-left"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{recipe.emoji}</span>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-[#1c1208] leading-tight truncate">{recipe.name}</p>
                                <p className="text-xs text-[#9a8570]">{recipe.cookTime}</p>
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
                          className="w-full rounded-lg border-2 border-dashed border-[#e5dcd0] hover:border-[#c5ddc7] hover:bg-[#eef3ee] p-3 text-[#9a8570] hover:text-[#2d5f30] transition-all text-xs flex items-center justify-center gap-1"
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
        <div className="bg-white rounded-xl border border-[#e5dcd0] shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#1c1208] flex items-center gap-2">
              <ShoppingCart size={18} className="text-[#2d5f30]" />
              Weekly Shopping List
            </h2>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-sm text-[#5c4d3c] hover:text-[#1c1208] border border-[#e5dcd0] rounded-lg px-3 py-1.5 transition-colors"
            >
              <Printer size={14} />
              Print
            </button>
          </div>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {shoppingList.map((item, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5 border-b border-[#f5efe6] break-inside-avoid">
                <div className="w-4 h-4 rounded border-2 border-[#c5ddc7] flex-shrink-0" />
                <span className="text-sm text-[#5c4d3c] capitalize">{item.name}</span>
                <span className="text-xs text-[#9a8570] ml-auto">{item.amounts}</span>
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
    </div>
  );
}
