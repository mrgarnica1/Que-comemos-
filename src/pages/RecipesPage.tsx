import { useState, useMemo } from 'react';
import { MagnifyingGlass, Faders, X } from '@phosphor-icons/react';
import { RecipeCard } from '../components/RecipeCard';
import { RecipeDetailPage } from '../components/RecipeDetailPage';
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
  const [sortBy, setSortBy] = useState<SortOption>('difficulty-asc');
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
        case 'rating':          return b.rating - a.rating;
        case 'difficulty-asc':  return DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty];
        case 'difficulty-desc': return DIFFICULTY_ORDER[b.difficulty] - DIFFICULTY_ORDER[a.difficulty];
        case 'toppings-asc':    return a.toppings.length - b.toppings.length;
        case 'toppings-desc':   return b.toppings.length - a.toppings.length;
        case 'cooktime':        return a.cookTime.localeCompare(b.cookTime);
        default: return 0;
      }
    });
    return result;
  }, [recipes, search, selectedCategory, selectedDifficulty, spiceFilter, sortBy]);

  const activeFilterCount = [
    selectedDifficulty !== 'all',
    spiceFilter !== 'all',
    sortBy !== 'difficulty-asc',
  ].filter(Boolean).length;

  // ── Full-page recipe detail ──────────────────────────────
  if (selectedRecipe) {
    return (
      <>
        <RecipeDetailPage
          recipe={selectedRecipe}
          onBack={() => setSelectedRecipe(null)}
          onEdit={
            selectedRecipe.isCustom
              ? () => { setEditRecipe(selectedRecipe); setSelectedRecipe(null); }
              : undefined
          }
        />
        {editRecipe && (
          <AddRecipeModal editRecipe={editRecipe} onClose={() => setEditRecipe(null)} />
        )}
      </>
    );
  }

  // ── Recipe grid ─────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
      {/* Search + Filter */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a8570]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipes, regions, tags..."
            className="w-full pl-8 pr-8 py-2.5 border border-[#e5dcd0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8fba8f] bg-white text-[#1c1208] placeholder:text-[#9a8570]"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a8570] hover:text-[#5c4d3c]">
              <X size={13} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-2.5 border rounded-xl text-sm font-medium transition-all flex-shrink-0 ${
            showFilters || activeFilterCount > 0
              ? 'bg-[#e8f0e8] border-[#c5ddc7] text-[#2d5f30]'
              : 'border-[#e5dcd0] text-[#5c4d3c] hover:border-[#c5ddc7] bg-white'
          }`}
        >
          <Faders size={15} />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 bg-[#2d5f30] text-white text-[10px] rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white border border-[#e8f0e8] rounded-2xl p-4 mb-3 animate-fade-in space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#9a8570] uppercase tracking-wider block mb-2">Sort By</label>
            <div className="flex gap-1.5 flex-wrap">
              {[
                ['rating',          '⭐ Top Rated'],
                ['difficulty-asc',  '🟢 Easiest'],
                ['difficulty-desc', '🔴 Hardest'],
                ['toppings-asc',    '🥗 Fewest Toppings'],
                ['toppings-desc',   '🥗 Most Toppings'],
                ['cooktime',        '⏱ Cook Time'],
              ].map(([v, l]) => (
                <button key={v} onClick={() => setSortBy(v as SortOption)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    sortBy === v
                      ? 'bg-[#2d5f30] text-white border-[#2d5f30]'
                      : 'bg-white text-[#5c4d3c] border-[#e5dcd0] hover:border-[#c5ddc7]'
                  }`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#9a8570] uppercase tracking-wider block mb-2">Difficulty</label>
            <div className="flex gap-1.5 flex-wrap">
              {(['all', 'Easy', 'Medium', 'Hard'] as const).map((d) => (
                <button key={d} onClick={() => setSelectedDifficulty(d)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    selectedDifficulty === d
                      ? 'bg-[#2d5f30] text-white border-[#2d5f30]'
                      : 'bg-white text-[#5c4d3c] border-[#e5dcd0] hover:border-[#c5ddc7]'
                  }`}>
                  {d === 'all' ? 'Any' : d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#9a8570] uppercase tracking-wider block mb-2">Spice Level</label>
            <div className="flex gap-1.5 flex-wrap">
              {([['all', 'Any'], [1, '🌶️ Mild'], [2, '🌶️🌶️ Medium'], [3, '🌶️🌶️🌶️ Hot']] as const).map(([v, l]) => (
                <button key={String(v)} onClick={() => setSpiceFilter(v as number | 'all')}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    spiceFilter === v
                      ? 'bg-[#2d5f30] text-white border-[#2d5f30]'
                      : 'bg-white text-[#5c4d3c] border-[#e5dcd0] hover:border-[#c5ddc7]'
                  }`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={() => { setSelectedDifficulty('all'); setSpiceFilter('all'); setSortBy('difficulty-asc'); }}
              className="text-xs text-red-500 hover:text-red-700 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-3">
        {CATEGORIES.map((cat) => (
          <button key={cat.value} onClick={() => setSelectedCategory(cat.value)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border flex-shrink-0 ${
              selectedCategory === cat.value
                ? 'bg-[#2d5f30] text-white border-[#2d5f30] shadow-sm'
                : 'bg-white text-[#5c4d3c] border-[#e5dcd0] hover:border-[#c5ddc7] hover:text-[#2d5f30]'
            }`}>
            <span>{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-[#9a8570] mb-3">
        {filtered.length} recipe{filtered.length !== 1 ? 's' : ''}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🌮</div>
          <p className="text-[#5c4d3c] text-sm font-medium">No recipes match your search.</p>
          <button
            onClick={() => { setSearch(''); setSelectedCategory('all'); setSelectedDifficulty('all'); setSpiceFilter('all'); }}
            className="mt-2 text-[#2d5f30] text-sm hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} onClick={() => setSelectedRecipe(recipe)} />
          ))}
        </div>
      )}

      {editRecipe && (
        <AddRecipeModal editRecipe={editRecipe} onClose={() => setEditRecipe(null)} />
      )}
    </div>
  );
}
