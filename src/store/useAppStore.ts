import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { INITIAL_RECIPES } from '../data/recipes';
import type { Recipe } from '../data/recipes';

export type WeekDay = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface MealPlan {
  [day: string]: {
    lunch?: string;   // recipe id
    dinner?: string;  // recipe id
  };
}

interface AppState {
  recipes: Recipe[];
  mealPlan: MealPlan;
  favoriteIds: string[];
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
  assignMeal: (day: WeekDay, slot: 'lunch' | 'dinner', recipeId: string | undefined) => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      recipes: INITIAL_RECIPES,
      mealPlan: {},
      favoriteIds: [],

      addRecipe: (recipe) =>
        set((s) => ({ recipes: [...s.recipes, recipe] })),

      updateRecipe: (recipe) =>
        set((s) => ({
          recipes: s.recipes.map((r) => (r.id === recipe.id ? recipe : r)),
        })),

      deleteRecipe: (id) =>
        set((s) => ({
          recipes: s.recipes.filter((r) => r.id !== id),
        })),

      assignMeal: (day, slot, recipeId) =>
        set((s) => ({
          mealPlan: {
            ...s.mealPlan,
            [day]: {
              ...s.mealPlan[day],
              [slot]: recipeId,
            },
          },
        })),

      toggleFavorite: (id) =>
        set((s) => ({
          favoriteIds: s.favoriteIds.includes(id)
            ? s.favoriteIds.filter((f) => f !== id)
            : [...s.favoriteIds, id],
        })),

      isFavorite: (id) => get().favoriteIds.includes(id),
    }),
    { name: 'que-comemos-store' }
  )
);
