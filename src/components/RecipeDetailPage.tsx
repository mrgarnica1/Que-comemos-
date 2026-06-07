import { useState } from 'react';
import {
  ArrowLeft, Heart, Star, Clock, Users, MapPin,
  Fire, CalendarBlank, CheckCircle, Minus, Plus,
} from '@phosphor-icons/react';
import type { Recipe } from '../data/recipes';
import { useAppStore } from '../store/useAppStore';
import type { WeekDay } from '../store/useAppStore';

interface Props {
  recipe: Recipe;
  onBack: () => void;
  onEdit?: () => void;
}

const DAYS: WeekDay[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function scaleAmount(amount: string, factor: number): string {
  if (!amount || factor === 1) return amount;
  const t = amount.trim();

  const mixed = t.match(/^(\d+)\s+(\d+)\/(\d+)(.*)/);
  if (mixed) {
    const val = (parseInt(mixed[1]) + parseInt(mixed[2]) / parseInt(mixed[3])) * factor;
    return fmtNum(val) + mixed[4];
  }
  const frac = t.match(/^(\d+)\/(\d+)(.*)/);
  if (frac) {
    const val = (parseInt(frac[1]) / parseInt(frac[2])) * factor;
    return fmtNum(val) + frac[3];
  }
  const num = t.match(/^(\d+(?:\.\d+)?)(.*)/);
  if (num) {
    const val = parseFloat(num[1]) * factor;
    return fmtNum(val) + num[2];
  }
  return t;
}

function fmtNum(n: number): string {
  if (n <= 0) return '0';
  const r = Math.round(n * 8) / 8;
  const whole = Math.floor(r);
  const frac = r - whole;
  const fracMap: [number, string][] = [
    [0.125, '⅛'], [0.25, '¼'], [0.375, '⅜'],
    [0.5, '½'],   [0.625, '⅝'], [0.75, '¾'], [0.875, '⅞'],
  ];
  const fracStr = fracMap.find(([v]) => Math.abs(frac - v) < 0.05)?.[1] ?? '';
  if (whole === 0) return fracStr || String(Math.round(n));
  if (!fracStr)    return String(whole);
  return `${whole} ${fracStr}`;
}

export function RecipeDetailPage({ recipe, onBack, onEdit }: Props) {
  const { toggleFavorite, isFavorite, assignMeal } = useAppStore();
  const fav = isFavorite(recipe.id);
  const [currentServings, setCurrentServings] = useState(recipe.servings);
  const [planDay, setPlanDay] = useState<WeekDay>('Mon');
  const [planSlot, setPlanSlot] = useState<'lunch' | 'dinner'>('dinner');
  const [planned, setPlanned] = useState(false);
  const [activeSection, setActiveSection] = useState<'ingredients' | 'instructions'>('ingredients');

  const scaleFactor = currentServings / recipe.servings;

  const handlePlan = () => {
    assignMeal(planDay, planSlot, recipe.id);
    setPlanned(true);
    setTimeout(() => setPlanned(false), 2000);
  };

  const difficultyStyle =
    recipe.difficulty === 'Easy'
      ? 'bg-green-500/20 text-green-200 border border-green-500/30'
      : recipe.difficulty === 'Medium'
      ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30'
      : 'bg-red-500/20 text-red-200 border border-red-500/30';

  return (
    <div className="min-h-screen bg-white">
      {/* ── Dark Hero ─────────────────────────────────────── */}
      <div className="bg-gradient-to-b from-[#0f1e10] via-[#1a2f1b] to-[#243826]">
        <div className="px-5 pt-5 pb-10 max-w-2xl mx-auto">
          {/* Back + Edit + Favorite */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <div className="flex items-center gap-2">
              {onEdit && recipe.isCustom && (
                <button
                  onClick={onEdit}
                  className="text-white/80 hover:text-white text-sm font-medium px-3 py-1.5 rounded-xl border border-white/25 hover:border-white/50 transition-all"
                >
                  Edit
                </button>
              )}
              <button
                onClick={() => toggleFavorite(recipe.id)}
                className={`p-2 rounded-full transition-all ${
                  fav
                    ? 'bg-red-500 text-white'
                    : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                }`}
              >
                <Heart size={18} weight={fav ? 'fill' : 'regular'} />
              </button>
            </div>
          </div>

          {/* Photo or Emoji */}
          {recipe.photo ? (
            <div className="w-36 h-36 rounded-2xl overflow-hidden mx-auto mb-5 shadow-xl ring-2 ring-white/10">
              <img src={recipe.photo} alt={recipe.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="text-center mb-4">
              <span className="text-8xl leading-none drop-shadow-lg">{recipe.emoji}</span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl font-bold text-white text-center leading-tight">{recipe.name}</h1>
          <p className="text-[#7dc77d] italic text-center mt-1.5 text-sm font-medium">{recipe.spanishName}</p>
          <p className="text-white/80 text-sm text-center mt-3 leading-relaxed max-w-md mx-auto">
            {recipe.description}
          </p>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-4 mt-5 flex-wrap text-sm">
            <div className="flex items-center gap-1 text-white">
              <Star size={14} weight="fill" className="text-amber-400" />
              <span className="font-semibold">{recipe.rating}</span>
              <span className="text-white/60 text-xs">({recipe.ratingCount.toLocaleString()})</span>
            </div>
            <div className="flex items-center gap-1 text-white/85">
              <Clock size={14} />
              <span>{recipe.cookTime}</span>
            </div>
            <div className="flex items-center gap-1 text-white/85">
              <MapPin size={14} />
              <span>{recipe.region}</span>
            </div>
          </div>

          {/* Servings adjuster */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <Users size={14} className="text-white/70" />
            <span className="text-white/70 text-sm">Servings</span>
            <div className="flex items-center gap-1 bg-white/12 rounded-xl px-3 py-1.5">
              <button
                onClick={() => setCurrentServings((s) => Math.max(1, s - 1))}
                className="text-white/70 hover:text-white w-5 h-5 flex items-center justify-center transition-colors"
              >
                <Minus size={12} />
              </button>
              <span className="text-white font-bold min-w-6 text-center text-sm">{currentServings}</span>
              <button
                onClick={() => setCurrentServings((s) => s + 1)}
                className="text-white/70 hover:text-white w-5 h-5 flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            </div>
            {currentServings !== recipe.servings && (
              <button
                onClick={() => setCurrentServings(recipe.servings)}
                className="text-white/50 text-xs hover:text-white/80 transition-colors"
              >
                reset
              </button>
            )}
          </div>

          {/* Badges */}
          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${difficultyStyle}`}>
              {recipe.difficulty}
            </span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3].map((i) => (
                <Fire
                  key={i}
                  size={14}
                  className={recipe.spiceLevel >= i ? 'text-orange-400' : 'text-white/20'}
                  weight="fill"
                />
              ))}
            </div>
            {recipe.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[11px] text-white/65 bg-white/10 px-2 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
          </div>

          <p className="text-center text-white/55 text-xs mt-3">Prep: {recipe.prepTime}</p>
        </div>
      </div>

      {/* ── White content area ────────────────────────────── */}
      <div className="max-w-2xl mx-auto">
        {/* Meal Plan */}
        <div className="px-5 py-4 border-b border-[#f0e8de] bg-[#faf5ef]">
          <p className="text-xs font-semibold text-[#9a8570] uppercase tracking-wider mb-3">
            Add to Meal Plan
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={planDay}
              onChange={(e) => setPlanDay(e.target.value as WeekDay)}
              className="text-sm border border-[#e5dcd0] rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#8fba8f] text-[#1c1208]"
            >
              {DAYS.map((d) => <option key={d}>{d}</option>)}
            </select>
            <select
              value={planSlot}
              onChange={(e) => setPlanSlot(e.target.value as 'lunch' | 'dinner')}
              className="text-sm border border-[#e5dcd0] rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#8fba8f] text-[#1c1208]"
            >
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
            </select>
            <button
              onClick={handlePlan}
              className="flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 rounded-xl bg-[#2d5f30] hover:bg-[#245028] text-white transition-colors"
            >
              {planned ? <CheckCircle size={14} weight="fill" /> : <CalendarBlank size={14} />}
              {planned ? 'Added!' : 'Add to Plan'}
            </button>
          </div>
        </div>

        {/* Toppings */}
        <div className="px-5 py-4 border-b border-[#ede4d8]">
          <p className="text-xs font-semibold text-[#9a8570] uppercase tracking-wider mb-3">
            Toppings & Garnishes
          </p>
          <div className="flex flex-wrap gap-1.5">
            {recipe.toppings.map((t) => (
              <span
                key={t}
                className="text-xs bg-[#eef3ee] text-[#2d5f30] border border-[#c5ddc7] px-2.5 py-1 rounded-full"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Ingredients / Instructions tabs */}
        <div className="flex border-b border-[#ede4d8] sticky top-14 bg-white z-10">
          {(['ingredients', 'instructions'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setActiveSection(s)}
              className={`flex-1 py-3 text-sm font-semibold capitalize transition-all ${
                activeSection === s
                  ? 'text-[#2d5f30] border-b-2 border-[#2d5f30]'
                  : 'text-[#9a8570] hover:text-[#5c4d3c]'
              }`}
            >
              {s}
              {s === 'ingredients' && ` (${recipe.ingredients.length})`}
            </button>
          ))}
        </div>

        {activeSection === 'ingredients' && (
          <div className="px-5 py-4 space-y-1 pb-8">
            {scaleFactor !== 1 && (
              <p className="text-xs text-[#2d5f30] bg-[#eef3ee] border border-[#c5ddc7] rounded-lg px-3 py-1.5 mb-3">
                Scaled to {currentServings} servings ({scaleFactor > 1 ? '+' : ''}{Math.round((scaleFactor - 1) * 100)}%)
              </p>
            )}
            {recipe.ingredients.map((ing, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2.5 border-b border-[#f5efe6] last:border-0"
              >
                <span className="text-sm text-[#5c4d3c] capitalize">{ing.name}</span>
                <span className="text-sm font-medium text-[#1c1208] bg-[#f2ece0] px-2.5 py-0.5 rounded-lg">
                  {scaleAmount(ing.amount, scaleFactor)} {ing.unit}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'instructions' && (
          <div className="px-5 py-4 space-y-5 pb-8">
            {recipe.instructions.map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-[#2d5f30] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-[#5c4d3c] leading-relaxed pt-1">{step}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
