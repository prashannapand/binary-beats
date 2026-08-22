import { useCustomer } from '../../context/CustomerContext';

const CATEGORY_ICONS = {
  momo: '🥟',
  chowmein: '🍜',
  noodles: '🍜',
  pizza: '🍕',
  drinks: '🥤',
  beverages: '🥤',
  desserts: '🍰',
  other: '🍽',
};

function categoryIcon(name) {
  return CATEGORY_ICONS[name?.toLowerCase()] || '🍽';
}

export function CategoryTabs() {
  const { menu, view, activeCategory, setActiveCategory } = useCustomer();

  if (view !== 'menu' || !menu.length) return null;

  const select = (id) => {
    setActiveCategory(id);
    document.getElementById('menu-scroll-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav
      className="no-print sticky top-[57px] z-20 bg-white/95 backdrop-blur border-b border-cust-border"
      role="tablist"
      aria-label="Menu categories"
    >
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2.5">
          <button
            role="tab"
            aria-selected={activeCategory === 'all'}
            onClick={() => select('all')}
            className={`flex-shrink-0 px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
              activeCategory === 'all'
                ? 'bg-staff-900 text-white'
                : 'bg-cust-surface text-cust-text-secondary hover:bg-brand-50'
            }`}
          >
            All
          </button>
          {menu.map((category) => (
            <button
              key={category.id}
              role="tab"
              aria-selected={activeCategory === category.id}
              onClick={() => select(category.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                activeCategory === category.id
                  ? 'bg-staff-900 text-white'
                  : 'bg-cust-surface text-cust-text-secondary hover:bg-brand-50'
              }`}
            >
              <span aria-hidden="true">{categoryIcon(category.name)}</span>
              {category.name}
              {category.items.some((i) => i.is_special && i.state === 'AVAILABLE') && (
                <span className="text-warning-500" aria-hidden="true">★</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}