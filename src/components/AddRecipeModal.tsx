import { useState } from 'react';
import { X, Plus, Trash } from '@phosphor-icons/react';
import type { Recipe, Difficulty, Category, Ingredient } from '../data/recipes';
import { useAppStore } from '../store/useAppStore';

interface Props {
  onClose: () => void;
  editRecipe?: Recipe;
}

const EMOJIS = ['🌮', '🍲', '🫓', '🍖', '🦐', '🌅', '🌽', '🥘', '🍗', '🥩', '🌯', '🫔', '🍳', '🥗', '🫙'];
const CATEGORIES: Category[] = ['tacos', 'soups', 'antojitos', 'mains', 'seafood', 'breakfast', 'sides'];

export function AddRecipeModal({ onClose, editRecipe }: Props) {
  const { addRecipe, updateRecipe } = useAppStore();
  const isEdit = !!editRecipe;

  const [form, setForm] = useState({
    name: editRecipe?.name || '',
    spanishName: editRecipe?.spanishName || '',
    description: editRecipe?.description || '',
    category: editRecipe?.category || 'mains' as Category,
    region: editRecipe?.region || '',
    difficulty: editRecipe?.difficulty || 'Easy' as Difficulty,
    cookTime: editRecipe?.cookTime || '',
    prepTime: editRecipe?.prepTime || '',
    servings: editRecipe?.servings || 4,
    emoji: editRecipe?.emoji || '🍽️',
    spiceLevel: editRecipe?.spiceLevel || 1 as 1 | 2 | 3,
    toppingInput: '',
    toppings: editRecipe?.toppings || [] as string[],
    stepInput: '',
    instructions: editRecipe?.instructions || [] as string[],
    ingredients: editRecipe?.ingredients || [] as Ingredient[],
    ingName: '',
    ingAmount: '',
    ingUnit: '',
    tagInput: '',
    tags: editRecipe?.tags || [] as string[],
  });

  const set = (key: string, val: unknown) => setForm((f) => ({ ...f, [key]: val }));

  const addTopping = () => {
    if (!form.toppingInput.trim()) return;
    set('toppings', [...form.toppings, form.toppingInput.trim().toLowerCase()]);
    set('toppingInput', '');
  };

  const addStep = () => {
    if (!form.stepInput.trim()) return;
    set('instructions', [...form.instructions, form.stepInput.trim()]);
    set('stepInput', '');
  };

  const addIngredient = () => {
    if (!form.ingName.trim()) return;
    set('ingredients', [...form.ingredients, { name: form.ingName.trim(), amount: form.ingAmount, unit: form.ingUnit }]);
    set('ingName', '');
    set('ingAmount', '');
    set('ingUnit', '');
  };

  const addTag = () => {
    if (!form.tagInput.trim()) return;
    set('tags', [...form.tags, form.tagInput.trim().toLowerCase().replace(/\s+/g, '-')]);
    set('tagInput', '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim()) return;

    const recipe: Recipe = {
      id: editRecipe?.id || `custom-${Date.now()}`,
      name: form.name,
      spanishName: form.spanishName || form.name,
      description: form.description,
      category: form.category,
      region: form.region || 'My Kitchen',
      difficulty: form.difficulty,
      cookTime: form.cookTime || '?',
      prepTime: form.prepTime || '?',
      servings: Number(form.servings),
      rating: editRecipe?.rating || 5.0,
      ratingCount: editRecipe?.ratingCount || 1,
      emoji: form.emoji,
      ingredients: form.ingredients,
      toppings: form.toppings,
      instructions: form.instructions,
      tags: form.tags,
      isCustom: true,
      spiceLevel: form.spiceLevel,
    };

    if (isEdit) updateRecipe(recipe);
    else addRecipe(recipe);
    onClose();
  };

  const inputClass = 'w-full border border-[#e5dcd0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8fba8f] focus:border-[#8fba8f] bg-white text-[#1c1208] placeholder:text-[#9a8570]';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full sm:max-w-xl sm:rounded-2xl rounded-t-3xl shadow-2xl max-h-[92vh] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ede4d8] flex-shrink-0">
          <h2 className="text-lg font-bold text-[#1c1208]">{isEdit ? 'Edit Recipe' : 'Add Your Recipe'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[#f2ece0] text-[#5c4d3c] transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 min-h-0 px-6 py-4 space-y-5">
          {/* Emoji picker */}
          <div>
            <label className="text-xs font-semibold text-[#9a8570] uppercase tracking-wider block mb-2">Pick an Emoji</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => set('emoji', e)}
                  className={`text-2xl p-1.5 rounded-xl transition-all ${
                    form.emoji === e
                      ? 'bg-[#e8f0e8] ring-2 ring-[#2d5f30] scale-110'
                      : 'hover:bg-[#f2ece0]'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Basic info */}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#7a6a55] block mb-1">Recipe Name *</label>
              <input required value={form.name} onChange={(e) => set('name', e.target.value)} className={inputClass} placeholder="e.g. Grandma's Red Enchiladas" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#7a6a55] block mb-1">Spanish Name</label>
              <input value={form.spanishName} onChange={(e) => set('spanishName', e.target.value)} className={inputClass} placeholder="e.g. Enchiladas Rojas de Abuelita" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#7a6a55] block mb-1">Description *</label>
              <textarea required value={form.description} onChange={(e) => set('description', e.target.value)} rows={2} className={inputClass + ' resize-none'} placeholder="What makes this recipe special?" />
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#7a6a55] block mb-1">Category</label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)} className={inputClass}>
                {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#7a6a55] block mb-1">Difficulty</label>
              <select value={form.difficulty} onChange={(e) => set('difficulty', e.target.value as Difficulty)} className={inputClass}>
                <option>Easy</option><option>Medium</option><option>Hard</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#7a6a55] block mb-1">Cook Time</label>
              <input value={form.cookTime} onChange={(e) => set('cookTime', e.target.value)} className={inputClass} placeholder="e.g. 30 min" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#7a6a55] block mb-1">Prep Time</label>
              <input value={form.prepTime} onChange={(e) => set('prepTime', e.target.value)} className={inputClass} placeholder="e.g. 15 min" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#7a6a55] block mb-1">Servings</label>
              <input type="number" min={1} max={100} value={form.servings} onChange={(e) => set('servings', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#7a6a55] block mb-1">Region</label>
              <input value={form.region} onChange={(e) => set('region', e.target.value)} className={inputClass} placeholder="e.g. Oaxaca" />
            </div>
          </div>

          {/* Spice level */}
          <div>
            <label className="text-xs font-semibold text-[#7a6a55] block mb-2">Spice Level</label>
            <div className="flex gap-2">
              {([1, 2, 3] as const).map((l) => (
                <button key={l} type="button" onClick={() => set('spiceLevel', l)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                    form.spiceLevel === l
                      ? 'bg-[#2d5f30] text-white border-[#2d5f30]'
                      : 'bg-white text-[#5c4d3c] border-[#e5dcd0] hover:border-[#c5ddc7]'
                  }`}>
                  {'🌶️'.repeat(l)}
                </button>
              ))}
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <label className="text-xs font-semibold text-[#9a8570] uppercase tracking-wider block mb-2">Ingredients</label>
            {form.ingredients.map((ing, i) => (
              <div key={i} className="flex items-center gap-2 mb-1.5 bg-[#f2ece0] rounded-lg px-3 py-1.5">
                <span className="text-sm text-[#5c4d3c] flex-1 capitalize">{ing.name}</span>
                <span className="text-xs text-[#2d5f30] font-medium">{ing.amount} {ing.unit}</span>
                <button type="button" onClick={() => set('ingredients', form.ingredients.filter((_, j) => j !== i))} className="text-[#9a8570] hover:text-red-500">
                  <Trash size={13} />
                </button>
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <input value={form.ingName} onChange={(e) => set('ingName', e.target.value)} className={inputClass + ' flex-2'} placeholder="Ingredient name" />
              <input value={form.ingAmount} onChange={(e) => set('ingAmount', e.target.value)} className={inputClass + ' w-16'} placeholder="Qty" />
              <input value={form.ingUnit} onChange={(e) => set('ingUnit', e.target.value)} className={inputClass + ' w-20'} placeholder="Unit" />
              <button type="button" onClick={addIngredient} className="p-2 bg-[#2d5f30] text-white rounded-xl hover:bg-[#245028] transition-colors flex-shrink-0">
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Toppings */}
          <div>
            <label className="text-xs font-semibold text-[#9a8570] uppercase tracking-wider block mb-2">Toppings</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.toppings.map((t, i) => (
                <span key={i} className="flex items-center gap-1 text-xs bg-[#eef3ee] text-[#2d5f30] border border-[#c5ddc7] px-2 py-1 rounded-full">
                  {t}
                  <button type="button" onClick={() => set('toppings', form.toppings.filter((_, j) => j !== i))} className="hover:text-red-600">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={form.toppingInput} onChange={(e) => set('toppingInput', e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTopping(); } }}
                className={inputClass} placeholder="e.g. cilantro, lime..." />
              <button type="button" onClick={addTopping} className="p-2 bg-[#2d5f30] text-white rounded-xl hover:bg-[#245028] transition-colors flex-shrink-0">
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="text-xs font-semibold text-[#9a8570] uppercase tracking-wider block mb-2">Instructions</label>
            {form.instructions.map((step, i) => (
              <div key={i} className="flex items-start gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-[#2d5f30] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                <span className="text-sm text-[#5c4d3c] flex-1 leading-relaxed">{step}</span>
                <button type="button" onClick={() => set('instructions', form.instructions.filter((_, j) => j !== i))} className="text-[#9a8570] hover:text-red-500 mt-0.5">
                  <Trash size={13} />
                </button>
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <textarea value={form.stepInput} onChange={(e) => set('stepInput', e.target.value)} rows={2}
                className={inputClass + ' resize-none'} placeholder="Describe the step..." />
              <button type="button" onClick={addStep} className="p-2 bg-[#2d5f30] text-white rounded-xl hover:bg-[#245028] transition-colors self-start flex-shrink-0">
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-semibold text-[#9a8570] uppercase tracking-wider block mb-2">Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.tags.map((t, i) => (
                <span key={i} className="flex items-center gap-1 text-xs bg-[#f2ece0] text-[#5c4d3c] px-2 py-1 rounded-full">
                  #{t}
                  <button type="button" onClick={() => set('tags', form.tags.filter((_, j) => j !== i))} className="hover:text-red-600">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={form.tagInput} onChange={(e) => set('tagInput', e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                className={inputClass} placeholder="e.g. quick, street-food..." />
              <button type="button" onClick={addTag} className="p-2 bg-[#5c4d3c] text-white rounded-xl hover:bg-[#3d3228] transition-colors flex-shrink-0">
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="pb-4">
            <button
              type="submit"
              className="w-full bg-[#2d5f30] hover:bg-[#245028] text-white font-semibold py-3 rounded-xl transition-colors text-sm shadow-md"
            >
              {isEdit ? 'Save Changes' : 'Add Recipe to Collection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
