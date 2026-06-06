import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { RecipeCard } from '../components/RecipeCard';
import { RecipeModal } from '../components/RecipeModal';
import { AddRecipeModal } from '../components/AddRecipeModal';
import { useAppStore } from '../store/useAppStore';
import { CATEGORIES } from '../data/recipes';
import type { Recipe, Difficulty, Category } from '../data/recipes';

type SortOption = 'rating' | 'difficulty-asc' | 'difficulty-desc' | 'toppings-asc' | 'toppings-desc' | 'cooktime';

const DIFFICULTY_ORDER: Record<Difficulty, number> = { Easy: 1, Medium: 2, Hard: 3 };

export function RecipesPage() {
  const { recipes } = useAppStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [spiceFilter, setSpiceFilter] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [editRecipe, setEditRecipe] = useState<Recipe | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = recipes.filter((r) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !r.name.toLowerCase().includes(q) &&
          !r.spanishName.toLowerCase().includes(q) &&
          !r.description.toLowerCase().includes(q) &&
          !r.tags.some((t) => t.includes(q)) &&
          !r.region.toLowerCase().includes(q)
        ) return false;
      }
      if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
      if (selectedDifficulty !== 'all' && r.difficulty !== selectedDifficulty) return false;
      if (spiceFilter !== 'all' && r.spiceLevel !== spiceFilter) return false;
      return true;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'rating': return b.rating - a.rating;
        case 'difficulty-asc': return DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty];
        case 'difficulty-desc': return DIFFICULTY_ORDER[b.difficulty] - DIFFICULTY_ORDER[a.difficulty];
        case 'toppings-asc': return a.toppings.length - b.toppings.length;
        case 'toppings-desc': return b.toppings.length - a.toppings.length;
        case 'cooktime': return a.cookTime.localeCompare(b.cookTime);
        default: return 0;
      }
    });

    return result;
  }, [recipes, search, selectedCategory, selectedDifficulty, spiceFilter, sortBy]);

  const activeFilterCount = [
    selectedCategory !== 'all',
    selectedDifficulty !== 'all',
    spiceFilter !== 'all',
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          Authentic Hole-in-the-Wall<br />
          <span className="text-orange-500">Mexican Recipes</span>
        </h1>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Taquería favorites, regional classics, and abuela's secrets — all in one place.
        </p>
      </div>

      {/* Search + Sort */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipes, regions, tags..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="appearance-none pl-3 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white cursor-pointer"
          >
            <option value="rating">⭐ Top Rated</option>
            <option value="difficulty-asc">🟢 Easiest First</option>
            <option value="difficulty-desc">🔴 Hardest First</option>
            <option value="toppings-asc">🥗 Fewest Toppings</option>
            <option value="toppings-desc">🥗 Most Toppings</option>
            <option value="cooktime">⏱ Cook Time</option>
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2.5 border rounded-xl text-sm font-medium transition-all ${
            showFilters || activeFilterCount > 0
              ? 'bg-orange-50 border-orange-300 text-orange-600'
              : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
          }`}
        >
          <SlidersHorizontal size={16} />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white border border-orange-100 rounded-2xl p-4 mb-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Difficulty</label>
              <div className="flex gap-1.5 flex-wrap">
                {(['all', 'Easy', 'Medium', 'Hard'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDifficulty(d)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      selectedDifficulty === d
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    {d === 'all' ? 'Any' : d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Spice Level</label>
              <div className="flex gap-1.5 flex-wrap">
                {([['all', 'Any'], [1, '🌶️ Mild'], [2, '🌶️🌶️ Medium'], [3, '🌶️🌶️🌶️ Hot']] as const).map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setSpiceFilter(v as number | 'all')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      spiceFilter === v
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end">
              {activeFilterCount > 0 && (
                <button
                  onClick={() => { setSelectedCategory('all'); setSelectedDifficulty('all'); setSpiceFilter('all'); }}
                  className="text-sm text-red-500 hover:text-red-700 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border flex-shrink-0 ${
              selectedCategory === cat.value
                ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600'
            }`}
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-xs text-gray-400 font-medium mb-4">
        {filtered.length} recipe{filtered.length !== 1 ? 's' : ''} found
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🌮</div>
          <p className="text-gray-500 font-medium">No recipes match your search.</p>
          <button onClick={() => { setSearch(''); setSelectedCategory('all'); setSelectedDifficulty('all'); setSpiceFilter('all'); }} className="mt-3 text-orange-500 text-sm hover:underline">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={() => setSelectedRecipe(recipe)}
            />
          ))}
        </div>
      )}

      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onEdit={() => { setEditRecipe(selectedRecipe); setSelectedRecipe(null); }}
        />
      )}
      {editRecipe && (
        <AddRecipeModal
          editRecipe={editRecipe}
          onClose={() => setEditRecipe(null)}
        />
      )}
    </div>
  );
}
