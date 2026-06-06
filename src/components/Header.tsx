import { useState } from 'react';
import { ChefHat, Menu, X, Heart, Calendar, Plus, Search } from 'lucide-react';

type Tab = 'recipes' | 'fridge' | 'planner' | 'favorites';

interface Props {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onAddRecipe: () => void;
}

export function Header({ activeTab, setActiveTab, onAddRecipe }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'recipes',   label: 'Recipes',   icon: <Search size={18} /> },
    { id: 'fridge',    label: 'My Fridge',  icon: <ChefHat size={18} /> },
    { id: 'planner',   label: 'Meal Plan',  icon: <Calendar size={18} /> },
    { id: 'favorites', label: 'Favorites',  icon: <Heart size={18} /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-orange-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => setActiveTab('recipes')}
            className="flex items-center gap-2 group"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <ChefHat size={20} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold text-gray-900">¿Qué Comemos?</span>
              <span className="text-xs text-orange-500 font-medium block leading-none">Authentic Mexican Recipes</span>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={onAddRecipe}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors shadow-sm"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add Recipe</span>
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-orange-100 bg-white animate-fade-in">
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
