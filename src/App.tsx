import { useState } from 'react';
import { Header } from './components/Header';
import { RecipesPage } from './pages/RecipesPage';
import { FridgePage } from './pages/FridgePage';
import { MealPlannerPage } from './pages/MealPlannerPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { AddRecipeModal } from './components/AddRecipeModal';
import { ImportRecipeModal } from './components/ImportRecipeModal';
import { ForkKnife, Snowflake, CalendarBlank, Heart } from '@phosphor-icons/react';

type Tab = 'recipes' | 'fridge' | 'planner' | 'favorites';

const NAV_ITEMS = [
  { id: 'recipes' as Tab,   label: 'Recipes', Icon: ForkKnife },
  { id: 'fridge' as Tab,    label: 'Fridge',  Icon: Snowflake },
  { id: 'planner' as Tab,   label: 'Plan',    Icon: CalendarBlank },
  { id: 'favorites' as Tab, label: 'Saved',   Icon: Heart },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('recipes');
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [showImportRecipe, setShowImportRecipe] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f3eb]">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddRecipe={() => setShowAddRecipe(true)}
        onImportRecipe={() => setShowImportRecipe(true)}
      />

      <main>
        {activeTab === 'recipes'   && <RecipesPage />}
        {activeTab === 'fridge'    && <FridgePage />}
        {activeTab === 'planner'   && <MealPlannerPage />}
        {activeTab === 'favorites' && <FavoritesPage />}
      </main>

      {/* Bottom nav — mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5dcd0] z-30">
        <div className="flex">
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex flex-col items-center gap-1 pt-3 pb-6 text-xs font-medium transition-colors ${
                  active ? 'text-[#2d5f30]' : 'text-[#9a8570]'
                }`}
              >
                <Icon size={22} weight={active ? 'fill' : 'regular'} />
                {label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Spacer for mobile bottom nav */}
      <div className="md:hidden h-28" />

      {showAddRecipe && (
        <AddRecipeModal onClose={() => setShowAddRecipe(false)} />
      )}
      {showImportRecipe && (
        <ImportRecipeModal onClose={() => setShowImportRecipe(false)} />
      )}
    </div>
  );
}
