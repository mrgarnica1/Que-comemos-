import { useState } from 'react';
import { Header } from './components/Header';
import { RecipesPage } from './pages/RecipesPage';
import { FridgePage } from './pages/FridgePage';
import { MealPlannerPage } from './pages/MealPlannerPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { AddRecipeModal } from './components/AddRecipeModal';

type Tab = 'recipes' | 'fridge' | 'planner' | 'favorites';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('recipes');
  const [showAddRecipe, setShowAddRecipe] = useState(false);

  return (
    <div className="min-h-screen bg-[#fdf8f4]">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddRecipe={() => setShowAddRecipe(true)}
      />

      <main>
        {activeTab === 'recipes'   && <RecipesPage />}
        {activeTab === 'fridge'    && <FridgePage />}
        {activeTab === 'planner'   && <MealPlannerPage />}
        {activeTab === 'favorites' && <FavoritesPage />}
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30">
        <div className="flex">
          {[
            { id: 'recipes' as Tab,   label: 'Recipes',   emoji: '🌮' },
            { id: 'fridge' as Tab,    label: 'Fridge',    emoji: '🧊' },
            { id: 'planner' as Tab,   label: 'Plan',      emoji: '📅' },
            { id: 'favorites' as Tab, label: 'Saved',     emoji: '❤️' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-medium transition-colors ${
                activeTab === item.id ? 'text-orange-500' : 'text-gray-400'
              }`}
            >
              <span className="text-xl leading-none">{item.emoji}</span>
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Bottom padding for mobile nav */}
      <div className="md:hidden h-20" />

      {showAddRecipe && (
        <AddRecipeModal onClose={() => setShowAddRecipe(false)} />
      )}
    </div>
  );
}
