import { useState, useMemo } from 'react';
import { Plus, X, Snowflake, Sparkle, CaretDown } from '@phosphor-icons/react';
import { useAppStore } from '../store/useAppStore';
import { RecipeCard } from '../components/RecipeCard';
import { RecipeDetailPage } from '../components/RecipeDetailPage';
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
        const aPct = a.score / a.recipe.toppings.length;
        const bPct = b.score / b.recipe.toppings.length;
        return bPct - aPct;
      });
  }, [selectedToppings, recipes]);

  const visibleToppings = showAll ? ALL_TOPPINGS : ALL_TOPPINGS.slice(0, 16);

  if (selectedRecipe) {
    return <RecipeDetailPage recipe={selectedRecipe} onBack={() => setSelectedRecipe(null)} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#2d7a5f] to-[#1a5c47] rounded-xl mb-3 shadow-lg">
          <Snowflake size={28} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-[#1c1208] mb-1">What's In My Fridge?</h1>
        <p className="text-[#7a6a55] text-sm max-w-sm mx-auto">
          Select the toppings and ingredients you have — we'll find the best matching recipes for you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Topping selector */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-[#e5dcd0] shadow-sm p-5 sticky top-24">
            <h2 className="font-semibold text-[#1c1208] mb-1 flex items-center gap-2">
              <span>🧅</span> Select your toppings
            </h2>
            <p className="text-xs text-[#9a8570] mb-4">Tap to add what you have available</p>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {visibleToppings.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleTopping(t)}
                  className={`text-xs px-2.5 py-1.5 rounded-full border transition-all font-medium ${
                    selectedToppings.includes(t)
                      ? 'bg-[#2d5f30] text-white border-[#2d5f30] shadow-sm'
                      : 'bg-white text-[#5c4d3c] border-[#e5dcd0] hover:border-[#c5ddc7]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {!showAll && ALL_TOPPINGS.length > 16 && (
              <button
                onClick={() => setShowAll(true)}
                className="flex items-center gap-1 text-xs text-[#2d5f30] hover:text-[#245028] font-medium mb-3"
              >
                <CaretDown size={13} />
                Show {ALL_TOPPINGS.length - 16} more
              </button>
            )}

            <div className="flex gap-2 mt-2">
              <input
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
                placeholder="Add other ingredient..."
                className="flex-1 border border-[#e5dcd0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#8fba8f] text-[#1c1208] placeholder:text-[#9a8570]"
              />
              <button
                onClick={addCustom}
                className="p-2 bg-[#2d5f30] text-white rounded-lg hover:bg-[#245028] transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>

            {selectedToppings.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#ede4d8]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-[#9a8570] uppercase tracking-wider">
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
                      className="flex items-center gap-1 text-xs bg-[#eef3ee] text-[#2d5f30] border border-[#c5ddc7] px-2.5 py-1 rounded-full"
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
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-[#e5dcd0]">
              <div className="text-5xl mb-3">👈</div>
              <p className="text-[#5c4d3c] font-medium">Select toppings to find matching recipes</p>
              <p className="text-[#9a8570] text-sm mt-1">Start by picking what's in your fridge</p>
            </div>
          ) : scoredRecipes.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-[#e5dcd0]">
              <div className="text-5xl mb-3">🤔</div>
              <p className="text-[#5c4d3c] font-medium">No recipes match those toppings</p>
              <p className="text-[#9a8570] text-sm mt-1">Try adding more common toppings like cilantro or lime</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Sparkle size={16} className="text-[#2d5f30]" weight="fill" />
                <p className="text-sm font-semibold text-[#1c1208]">
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
    </div>
  );
}
