import { useState, useEffect } from 'react';
import { MagnifyingGlass, Plus, ArrowLeft } from '@phosphor-icons/react';
import { useAppStore } from '../store/useAppStore';
import type { Recipe, Category } from '../data/recipes';

interface MealSummary {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

type MealDetail = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strTags: string | null;
  [key: string]: string | null | undefined;
};

function mapCategory(cat: string): Category {
  const c = (cat || '').toLowerCase();
  if (c.includes('seafood') || c.includes('fish')) return 'seafood';
  if (c.includes('breakfast')) return 'breakfast';
  if (c.includes('side')) return 'sides';
  if (c.includes('soup')) return 'soups';
  return 'mains';
}

function mapEmoji(cat: string): string {
  const c = (cat || '').toLowerCase();
  if (c.includes('beef'))    return '🥩';
  if (c.includes('chicken')) return '🍗';
  if (c.includes('pork'))    return '🍖';
  if (c.includes('seafood')) return '🦐';
  if (c.includes('pasta'))   return '🍝';
  if (c.includes('veg'))     return '🥗';
  return '🍽️';
}

function parseInstructions(raw: string): string[] {
  if (!raw) return [];
  const byNumber = raw.match(/(?:^|\n)\s*(?:STEP\s+\d+[:\s]|\d+[).]\s+)[^\n]+/gi);
  if (byNumber && byNumber.length > 2) {
    return byNumber
      .map((s) => s.replace(/^\s*(STEP\s*\d+[:\s]*|\d+[).]\s*)/i, '').trim())
      .filter(Boolean);
  }
  const paras = raw
    .split(/\r?\n\r?\n/)
    .map((s) => s.replace(/\r?\n/g, ' ').trim())
    .filter((s) => s.length > 15);
  if (paras.length > 1) return paras;
  return raw.split(/\r?\n/).map((s) => s.trim()).filter((s) => s.length > 10);
}

function mapToRecipe(d: MealDetail): Recipe {
  const ingredients: Recipe['ingredients'] = [];
  for (let i = 1; i <= 20; i++) {
    const name = d[`strIngredient${i}`];
    const measure = (d[`strMeasure${i}`] || '').trim();
    if (name && name.trim()) {
      ingredients.push({ name: name.trim(), amount: measure, unit: '' });
    }
  }
  const tags = (d.strTags || '')
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  return {
    id: `mealdb-${d.idMeal}`,
    name: d.strMeal,
    spanishName: d.strMeal,
    description: `Traditional ${d.strArea || 'Mexican'} ${(d.strCategory || 'dish').toLowerCase()} sourced from TheMealDB.`,
    category: mapCategory(d.strCategory),
    region: d.strArea || 'Mexico',
    difficulty: 'Medium',
    cookTime: '30 min',
    prepTime: '15 min',
    servings: 4,
    rating: 4.5,
    ratingCount: 100,
    emoji: mapEmoji(d.strCategory),
    photo: d.strMealThumb || undefined,
    ingredients,
    toppings: [],
    instructions: parseInstructions(d.strInstructions),
    tags,
    isCustom: true,
    spiceLevel: 2,
  };
}

interface Props {
  onBack: () => void;
}

export function ImportPage({ onBack }: Props) {
  const { addRecipe, recipes: existing } = useAppStore();
  const [meals, setMeals] = useState<MealSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<MealSummary | null>(null);
  const [detail, setDetail] = useState<MealDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [justImported, setJustImported] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('https://www.themealdb.com/api/json/v1/1/filter.php?a=Mexican')
      .then((r) => r.json())
      .then((data) => { setMeals(data.meals || []); setLoading(false); })
      .catch(() => { setLoadError('Could not load recipes. Check your connection.'); setLoading(false); });
  }, []);

  const selectMeal = async (meal: MealSummary) => {
    setSelected(meal);
    setDetail(null);
    setLoadingDetail(true);
    try {
      const r = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
      const data = await r.json();
      setDetail(data.meals?.[0] ?? null);
    } catch {
      setDetail(null);
    }
    setLoadingDetail(false);
  };

  const handleImport = () => {
    if (!detail) return;
    addRecipe(mapToRecipe(detail));
    setJustImported((prev) => new Set([...prev, detail.idMeal]));
  };

  const isAdded = (id: string) =>
    justImported.has(id) || existing.some((r) => r.id === `mealdb-${id}`);

  const filtered = meals.filter((m) =>
    m.strMeal.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8f3eb]">
      {/* Sticky sub-header */}
      <div className="sticky top-14 z-20 bg-white border-b border-[#e5dcd0] px-4 py-3 flex items-center gap-3">
        <button
          onClick={selected ? () => { setSelected(null); setDetail(null); } : onBack}
          className="flex items-center gap-1.5 text-sm font-medium text-[#5c4d3c] hover:text-[#1c1208] transition-colors flex-shrink-0"
        >
          <ArrowLeft size={16} />
          {selected ? 'Back' : 'Back'}
        </button>
        <div className="flex-1">
          {!selected ? (
            <div className="relative">
              <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a8570]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Mexican recipes..."
                className="w-full pl-8 pr-3 py-2 border border-[#e5dcd0] rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#8fba8f] text-[#1c1208] placeholder:text-[#9a8570] bg-white"
              />
            </div>
          ) : (
            <div>
              <p className="font-semibold text-[#1c1208] text-sm truncate">{selected.strMeal}</p>
              <p className="text-xs text-[#9a8570]">Review & import</p>
            </div>
          )}
        </div>
      </div>

      {/* Page content */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        {!selected ? (
          <>
            <p className="text-xs text-[#9a8570] mb-3">
              {loading ? 'Loading…' : `${filtered.length} Mexican recipes from TheMealDB`}
            </p>

            {loading && (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#e5dcd0] border-t-[#2d5f30] animate-spin" />
                <p className="text-[#7a6a55] text-sm">Loading recipes…</p>
              </div>
            )}

            {loadError && (
              <div className="text-center py-20">
                <p className="text-red-500 text-sm">{loadError}</p>
              </div>
            )}

            {!loading && !loadError && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filtered.map((meal) => {
                  const done = isAdded(meal.idMeal);
                  return (
                    <button
                      key={meal.idMeal}
                      onClick={() => selectMeal(meal)}
                      className={`relative rounded-xl overflow-hidden border transition-all text-left group ${
                        done
                          ? 'border-[#c5ddc7] opacity-75'
                          : 'border-[#e5dcd0] hover:border-[#c5ddc7] hover:shadow-md'
                      }`}
                    >
                      <div className="relative h-28 bg-[#f4ede2] overflow-hidden">
                        <img
                          src={meal.strMealThumb + '/preview'}
                          alt={meal.strMeal}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => { (e.target as HTMLImageElement).src = meal.strMealThumb; }}
                        />
                        {done && (
                          <div className="absolute top-1.5 right-1.5 bg-[#2d5f30] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                            Added ✓
                          </div>
                        )}
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-semibold text-[#1c1208] line-clamp-2 leading-tight">
                          {meal.strMeal}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* Detail view */
          <>
            {loadingDetail ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 rounded-full border-2 border-[#e5dcd0] border-t-[#2d5f30] animate-spin" />
              </div>
            ) : detail ? (
              <>
                {/* Hero image */}
                <div className="relative rounded-xl overflow-hidden mb-5">
                  <img
                    src={detail.strMealThumb ?? ''}
                    alt={detail.strMeal}
                    className="w-full h-52 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h2 className="text-white font-bold text-lg leading-tight">{detail.strMeal}</h2>
                    <p className="text-white/75 text-xs mt-0.5">{detail.strArea} · {detail.strCategory}</p>
                  </div>
                </div>

                {/* Import button + tags */}
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div className="flex flex-wrap gap-1">
                    {(detail.strTags || '').split(',').filter(Boolean).map((t) => (
                      <span key={t} className="text-[10px] bg-[#eef3ee] text-[#2d5f30] border border-[#c5ddc7] px-2 py-0.5 rounded-full">
                        {t.trim()}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={handleImport}
                    disabled={isAdded(detail.idMeal)}
                    className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg transition-all flex-shrink-0 ${
                      isAdded(detail.idMeal)
                        ? 'bg-[#e8f0e8] text-[#2d5f30] cursor-default'
                        : 'bg-[#2d5f30] hover:bg-[#245028] text-white shadow-sm'
                    }`}
                  >
                    <Plus size={14} />
                    {isAdded(detail.idMeal) ? 'Added!' : 'Add to Collection'}
                  </button>
                </div>

                {/* Ingredients */}
                <p className="text-xs font-semibold text-[#9a8570] uppercase tracking-wider mb-2">Ingredients</p>
                <div className="bg-white rounded-xl border border-[#e5dcd0] mb-5 overflow-hidden">
                  {Array.from({ length: 20 }, (_, i) => {
                    const name = detail[`strIngredient${i + 1}`];
                    const measure = detail[`strMeasure${i + 1}`];
                    if (!name || !name.trim()) return null;
                    return (
                      <div key={i} className="flex items-center justify-between px-4 py-2.5 border-b border-[#f5efe6] last:border-0">
                        <span className="text-sm text-[#5c4d3c] capitalize">{name.trim()}</span>
                        <span className="text-xs text-[#9a8570] font-medium">{measure}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Instructions */}
                <p className="text-xs font-semibold text-[#9a8570] uppercase tracking-wider mb-3">Instructions</p>
                <div className="space-y-4 pb-8">
                  {parseInstructions(detail.strInstructions).map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#2d5f30] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-sm text-[#5c4d3c] leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-[#5c4d3c] text-sm">Could not load recipe details.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
