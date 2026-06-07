import { ChefHat, Plus } from 'lucide-react';

type Tab = 'recipes' | 'fridge' | 'planner' | 'favorites';

interface Props {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onAddRecipe: () => void;
}

export function Header({ activeTab, setActiveTab, onAddRecipe }: Props) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-orange-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <button
            onClick={() => setActiveTab('recipes')}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <ChefHat size={17} className="text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">
              ¿Qué Comemos?
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { id: 'recipes' as Tab,   label: 'Recipes',   emoji: '🌮' },
              { id: 'fridge' as Tab,    label: 'My Fridge',  emoji: '🧊' },
              { id: 'planner' as Tab,   label: 'Meal Plan',  emoji: '📅' },
              { id: 'favorites' as Tab, label: 'Favorites',  emoji: '❤️' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-base leading-none">{item.emoji}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <button
            onClick={onAddRecipe}
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-3 py-2 rounded-xl transition-colors shadow-sm"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Add Recipe</span>
          </button>
        </div>
      </div>
    </header>
  );
}
