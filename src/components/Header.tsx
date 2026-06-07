import { useState } from 'react';
import { ForkKnife, Snowflake, CalendarBlank, Heart, Plus, CaretDown, PencilSimpleLine, DownloadSimple } from '@phosphor-icons/react';

type Tab = 'recipes' | 'fridge' | 'planner' | 'favorites';

interface Props {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onAddRecipe: () => void;
  onImportRecipe: () => void;
}

const NAV_ITEMS = [
  { id: 'recipes' as Tab,   label: 'Recipes',   Icon: ForkKnife },
  { id: 'fridge' as Tab,    label: 'My Fridge',  Icon: Snowflake },
  { id: 'planner' as Tab,   label: 'Meal Plan',  Icon: CalendarBlank },
  { id: 'favorites' as Tab, label: 'Favorites',  Icon: Heart },
];

export function Header({ activeTab, setActiveTab, onAddRecipe, onImportRecipe }: Props) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-[#e5dcd0] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <button
            onClick={() => setActiveTab('recipes')}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-[#2d5f30] to-[#1a3d1c] rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform text-[17px] leading-none">
              🌮
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

          {/* CTA with dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMenu((v) => !v)}
              className="flex items-center gap-1.5 bg-[#2d5f30] hover:bg-[#245028] text-white text-sm font-medium px-3 py-2 rounded-xl transition-colors shadow-sm"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Add Recipe</span>
              <CaretDown size={12} className={`transition-transform ${showMenu ? 'rotate-180' : ''}`} />
            </button>

            {showMenu && (
              <>
                {/* Backdrop */}
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-1.5 bg-white border border-[#e5dcd0] rounded-xl shadow-xl z-50 overflow-hidden min-w-48">
                  <button
                    onClick={() => { onAddRecipe(); setShowMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-[#1c1208] hover:bg-[#f2ece0] transition-colors text-left"
                  >
                    <PencilSimpleLine size={16} className="text-[#5c4d3c]" />
                    <div>
                      <p className="font-medium">Add Manually</p>
                      <p className="text-[10px] text-[#9a8570]">Write your own recipe</p>
                    </div>
                  </button>
                  <div className="border-t border-[#f0e8de]" />
                  <button
                    onClick={() => { onImportRecipe(); setShowMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-[#1c1208] hover:bg-[#f2ece0] transition-colors text-left"
                  >
                    <DownloadSimple size={16} className="text-[#2d5f30]" />
                    <div>
                      <p className="font-medium">Import from Library</p>
                      <p className="text-[10px] text-[#9a8570]">Browse MealDB recipes</p>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
