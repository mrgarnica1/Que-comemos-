import { useState, useMemo } from 'react';
import { Plus, X, Refrigerator, Sparkles, ChevronDown } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { RecipeCard } from '../components/RecipeCard';
import { RecipeModal } from '../components/RecipeModal';
import { ALL_TOPPINGS } from '../data/recipes';
import type { Recipe } from '../data/recipes';

export function FridgePage() {
  const { recipes } = useAppStore();
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showAll, setShowAll] = useState(false);

  const toggleTopping = (t: string) => {
    setSelectedToppings((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const addCustom = () => {
    const t = customInput.trim().toLowerCase();
    if (!t || selectedToppings.includes(t)) return;
    setSelectedToppings((prev) => [...prev, t]);
    setCustomInput('');
  };

  const scoredRecipes = useMemo(() => {
    if (selectedToppings.length === 0) return [];
    return recipes
      .map((r) => ({
        recipe: r,
        score: r.toppings.filter((t) =>
          selectedToppings.some((s) => t.toLowerCase().includes(s) || s.includes(t.toLowerCase()))
        ).length,
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        const aTotal = a.recipe.toppings.length;
        const bTotal = b.recipe.toppings.length;
        const aPct = a.score / aTotal;
        const bPct = b.score / bTotal;
        return bPct - aPct;
      });
  }, [selectedToppings, recipes]);

  const visibleToppings = showAll ? ALL_TOPPINGS : ALL_TOPPINGS.slice(0, 16);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-2xl mb-3 shadow-lg">
          <Refrigerator size={28} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">What's In My Fridge?</h1>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          Select the toppings and ingredients you have — we'll find the best matching recipes for you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Topping selector */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
            <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <span>🧅</span> Select your toppings
            </h2>
            <p className="text-xs text-gray-400 mb-4">Tap to add what you have available</p>

            {/* Common toppings grid */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {visibleToppings.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleTopping(t)}
                  className={`text-xs px-2.5 py-1.5 rounded-full border transition-all font-medium ${
                    selectedToppings.includes(t)
                      ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {!showAll && ALL_TOPPINGS.length > 16 && (
              <button
                onClick={() => setShowAll(true)}
                className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-700 font-medium mb-3"
              >
                <ChevronDown size={13} />
                Show {ALL_TOPPINGS.length - 16} more
              </button>
            )}

            {/* Custom input */}
            <div className="flex gap-2 mt-2">
              <input
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
                placeholder="Add other ingredient..."
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              <button
                onClick={addCustom}
                className="p-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Selected toppings */}
            {selectedToppings.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    In my fridge ({selectedToppings.length})
                  </p>
                  <button
                    onClick={() => setSelectedToppings([])}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedToppings.map((t) => (
                    <span
                      key={t}
                      className="flex items-center gap-1 text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full"
                    >
                      {t}
                      <button onClick={() => toggleTopping(t)} className="hover:text-red-500 ml-0.5">
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-2">
          {selectedToppings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
              <div className="text-5xl mb-3">👈</div>
              <p className="text-gray-500 font-medium">Select toppings to find matching recipes</p>
              <p className="text-gray-400 text-sm mt-1">Start by picking what's in your fridge</p>
            </div>
          ) : scoredRecipes.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
              <div className="text-5xl mb-3">🤔</div>
              <p className="text-gray-500 font-medium">No recipes match those toppings</p>
              <p className="text-gray-400 text-sm mt-1">Try adding more common toppings like cilantro or lime</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-orange-500" />
                <p className="text-sm font-semibold text-gray-700">
                  {scoredRecipes.length} recipe{scoredRecipes.length !== 1 ? 's' : ''} match your fridge
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {scoredRecipes.map(({ recipe, score }) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onClick={() => setSelectedRecipe(recipe)}
                    matchScore={score}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  );
}
