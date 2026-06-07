import { ForkKnife, Snowflake, CalendarBlank, Heart, Plus, ChefHat } from '@phosphor-icons/react';

type Tab = 'recipes' | 'fridge' | 'planner' | 'favorites';

interface Props {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onAddRecipe: () => void;
}

const NAV_ITEMS = [
  { id: 'recipes' as Tab,   label: 'Recipes',   Icon: ForkKnife },
  { id: 'fridge' as Tab,    label: 'My Fridge',  Icon: Snowflake },
  { id: 'planner' as Tab,   label: 'Meal Plan',  Icon: CalendarBlank },
  { id: 'favorites' as Tab, label: 'Favorites',  Icon: Heart },
];

export function Header({ activeTab, setActiveTab, onAddRecipe }: Props) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-[#e5dcd0] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <button
            onClick={() => setActiveTab('recipes')}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-[#2d5f30] to-[#1a3d1c] rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <ChefHat size={17} className="text-white" />
            </div>
            <span className="text-lg font-bold text-[#1c1208] tracking-tight">
              ¿Qué Comemos?
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ id, label, Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-[#e8f0e8] text-[#2d5f30]'
                      : 'text-[#5c4d3c] hover:bg-[#f2ece0] hover:text-[#1c1208]'
                  }`}
                >
                  <Icon size={16} weight={active ? 'fill' : 'regular'} />
                  {label}
                </button>
              );
            })}
          </nav>

          <button
            onClick={onAddRecipe}
            className="flex items-center gap-1.5 bg-[#2d5f30] hover:bg-[#245028] text-white text-sm font-medium px-3 py-2 rounded-xl transition-colors shadow-sm"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Add Recipe</span>
          </button>
        </div>
      </div>
    </header>
  );
}
