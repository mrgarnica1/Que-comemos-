import { useState, useEffect } from 'react';
import { MagnifyingGlass, Plus, ArrowLeft } from '@phosphor-icons/react';
import { useAppStore } from '../store/useAppStore';
import type { Recipe, Category } from '../data/recipes';

const API_KEY = import.meta.env.VITE_SPOONACULAR_KEY as string | undefined;

interface SpoonacularSummary {
  id: number;
  title: string;
  image: string;
}

interface SpoonacularDetail {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  preparationMinutes: number | null;
  cookingMinutes: number | null;
  servings: number;
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
  summary: string;
  instructions: string;
  analyzedInstructions: { steps: { step: string }[] }[];
  extendedIngredients: {
    name: string;
    amount: number;
    unit: string;
  }[];
}

function mapCategory(types: string[]): Category {
  const t = types.map((s) => s.toLowerCase()).join(' ');
  if (t.includes('soup')) return 'soups';
  if (t.includes('breakfast') || t.includes('brunch')) return 'breakfast';
  if (t.includes('appetizer') || t.includes('snack') || t.includes('side')) return 'sides';
  if (t.includes('seafood') || t.includes('fish')) return 'seafood';
  return 'mains';
}

function mapEmoji(types: string[]): string {
  const t = types.map((s) => s.toLowerCase()).join(' ');
  if (t.includes('taco'))     return '🌮';
  if (t.includes('soup'))     return '🍲';
  if (t.includes('chicken'))  return '🍗';
  if (t.includes('beef'))     return '🥩';
  if (t.includes('pork'))     return '🍖';
  if (t.includes('seafood'))  return '🦐';
  if (t.includes('salad'))    return '🥗';
  return '🍽️';
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').trim();
}

function mapToRecipe(d: SpoonacularDetail): Recipe {
  const ingredients: Recipe['ingredients'] = d.extendedIngredients.map((ing) => ({
    name: ing.name,
    amount: String(ing.amount % 1 === 0 ? ing.amount : ing.amount.toFixed(2)),
    unit: ing.unit,
  }));

  const steps =
    d.analyzedInstructions?.[0]?.steps.map((s) => s.step) ||
    (d.instructions ? stripHtml(d.instructions).split('\n').filter((s) => s.trim().length > 10) : []);

  const tags = [
    ...d.diets.map((t) => t.toLowerCase().replace(/\s+/g, '-')),
    ...d.dishTypes.map((t) => t.toLowerCase().replace(/\s+/g, '-')),
  ].slice(0, 5);

  const cookTime = d.cookingMinutes && d.cookingMinutes > 0
    ? `${d.cookingMinutes} min`
    : `${d.readyInMinutes} min`;
  const prepTime = d.preparationMinutes && d.preparationMinutes > 0
    ? `${d.preparationMinutes} min`
    : '15 min';

  return {
    id: `spoonacular-${d.id}`,
    name: d.title,
    spanishName: d.title,
    description: stripHtml(d.summary).slice(0, 200) + '…',
    category: mapCategory(d.dishTypes),
    region: d.cuisines.find((c) => c !== 'Mexican') || 'Mexico',
    difficulty: d.readyInMinutes > 60 ? 'Hard' : d.readyInMinutes > 30 ? 'Medium' : 'Easy',
    cookTime,
    prepTime,
    servings: d.servings,
    rating: 4.5,
    ratingCount: 100,
    emoji: mapEmoji(d.dishTypes),
    photo: d.image || undefined,
    ingredients,
    toppings: [],
    instructions: steps,
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
  const [meals, setMeals] = useState<SpoonacularSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<SpoonacularDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [justImported, setJustImported] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!API_KEY) {
      setLoadError('No API key configured. Add VITE_SPOONACULAR_KEY to your environment.');
      setLoading(false);
      return;
    }
    fetch(
      `https://api.spoonacular.com/recipes/complexSearch?cuisine=mexican&number=100&apiKey=${API_KEY}`
    )
      .then((r) => r.json())
      .then((data) => {
        setMeals(data.results || []);
        setLoading(false);
      })
      .catch(() => {
        setLoadError('Could not load recipes. Check your connection.');
        setLoading(false);
      });
  }, []);

  const selectMeal = async (id: number) => {
    setSelectedId(id);
    setDetail(null);
    setLoadingDetail(true);
    try {
      const r = await fetch(
        `https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}`
      );
      const data = await r.json();
      setDetail(data);
    } catch {
      setDetail(null);
    }
    setLoadingDetail(false);
  };

  const handleImport = () => {
    if (!detail) return;
    addRecipe(mapToRecipe(detail));
    setJustImported((prev) => new Set([...prev, detail.id]));
  };

  const isAdded = (id: number) =>
    justImported.has(id) || existing.some((r) => r.id === `spoonacular-${id}`);

  const filtered = meals.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  const selectedMeal = meals.find((m) => m.id === selectedId);

  return (
    <div className="min-h-screen bg-[#f8f3eb]">
      {/* Sticky sub-header */}
      <div className="sticky top-14 z-20 bg-white border-b border-[#e5dcd0] px-4 py-3 flex items-center gap-3">
        <button
          onClick={selectedId !== null ? () => { setSelectedId(null); setDetail(null); } : onBack}
          className="flex items-center gap-1.5 text-sm font-medium text-[#5c4d3c] hover:text-[#1c1208] transition-colors flex-shrink-0"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="flex-1">
          {selectedId === null ? (
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
              <p className="font-semibold text-[#1c1208] text-sm truncate">{selectedMeal?.title}</p>
              <p className="text-xs text-[#9a8570]">Review & import</p>
            </div>
          )}
        </div>
      </div>

      {/* Page content */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        {selectedId === null ? (
          <>
            <p className="text-xs text-[#9a8570] mb-3">
              {loading ? 'Loading…' : `${filtered.length} Mexican recipes from Spoonacular`}
            </p>

            {loading && (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#e5dcd0] border-t-[#2d5f30] animate-spin" />
                <p className="text-[#7a6a55] text-sm">Loading recipes…</p>
              </div>
            )}

            {loadError && (
              <div className="text-center py-20 px-4">
                <p className="text-4xl mb-3">🔑</p>
                <p className="text-[#5c4d3c] font-medium text-sm mb-1">API key required</p>
                <p className="text-[#9a8570] text-xs max-w-xs mx-auto">{loadError}</p>
              </div>
            )}

            {!loading && !loadError && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filtered.map((meal) => {
                  const done = isAdded(meal.id);
                  return (
                    <button
                      key={meal.id}
                      onClick={() => selectMeal(meal.id)}
                      className={`relative rounded-xl overflow-hidden border transition-all text-left group ${
                        done
                          ? 'border-[#c5ddc7] opacity-75'
                          : 'border-[#e5dcd0] hover:border-[#c5ddc7] hover:shadow-md'
                      }`}
                    >
                      <div className="relative h-28 bg-[#f4ede2] overflow-hidden">
                        <img
                          src={meal.image}
                          alt={meal.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {done && (
                          <div className="absolute top-1.5 right-1.5 bg-[#2d5f30] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                            Added ✓
                          </div>
                        )}
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-semibold text-[#1c1208] line-clamp-2 leading-tight">
                          {meal.title}
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
                    src={detail.image}
                    alt={detail.title}
                    className="w-full h-52 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h2 className="text-white font-bold text-lg leading-tight">{detail.title}</h2>
                    <p className="text-white/75 text-xs mt-0.5">
                      {detail.readyInMinutes} min · {detail.servings} servings
                    </p>
                  </div>
                </div>

                {/* Import button + tags */}
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div className="flex flex-wrap gap-1">
                    {detail.diets.slice(0, 4).map((t) => (
                      <span key={t} className="text-[10px] bg-[#eef3ee] text-[#2d5f30] border border-[#c5ddc7] px-2 py-0.5 rounded-full capitalize">
                        {t}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={handleImport}
                    disabled={isAdded(detail.id)}
                    className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg transition-all flex-shrink-0 ${
                      isAdded(detail.id)
                        ? 'bg-[#e8f0e8] text-[#2d5f30] cursor-default'
                        : 'bg-[#2d5f30] hover:bg-[#245028] text-white shadow-sm'
                    }`}
                  >
                    <Plus size={14} />
                    {isAdded(detail.id) ? 'Added!' : 'Add to Collection'}
                  </button>
                </div>

                {/* Ingredients */}
                <p className="text-xs font-semibold text-[#9a8570] uppercase tracking-wider mb-2">Ingredients</p>
                <div className="bg-white rounded-xl border border-[#e5dcd0] mb-5 overflow-hidden">
                  {detail.extendedIngredients.map((ing, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-2.5 border-b border-[#f5efe6] last:border-0">
                      <span className="text-sm text-[#5c4d3c] capitalize">{ing.name}</span>
                      <span className="text-xs text-[#9a8570] font-medium">
                        {ing.amount % 1 === 0 ? ing.amount : ing.amount.toFixed(2)} {ing.unit}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Instructions */}
                <p className="text-xs font-semibold text-[#9a8570] uppercase tracking-wider mb-3">Instructions</p>
                <div className="space-y-4 pb-8">
                  {(detail.analyzedInstructions?.[0]?.steps || []).map((s, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#2d5f30] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-sm text-[#5c4d3c] leading-relaxed">{s.step}</p>
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
