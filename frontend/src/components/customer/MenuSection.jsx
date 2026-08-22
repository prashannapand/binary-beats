import { useCustomer } from '../../context/CustomerContext';
import { MenuItemCard } from './MenuItemCard';

export function MenuSection() {
  const { menu, view, activeCategory, addItem } = useCustomer();

  if (view !== 'menu') return null;

  const categories = menu || [];
  const visibleCategories =
    activeCategory === 'all' ? categories : categories.filter((c) => c.id === activeCategory);

  const specials = categories.flatMap((c) =>
    c.items.filter((i) => i.is_special && i.state === 'AVAILABLE'),
  );

  if (!categories.length) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center animate-fade-in">
        <svg className="w-12 h-12 mx-auto mb-3 text-staff-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <p className="font-medium text-cust-text-primary">No menu items available</p>
        <p className="text-sm text-cust-text-muted mt-1">Check back later or ask staff for assistance.</p>
      </main>
    );
  }

  return (
    <main id="menu-scroll-anchor" className="max-w-2xl mx-auto px-4 pb-32 space-y-7 animate-fade-in scroll-mt-28">
      {specials.length > 0 && activeCategory === 'all' && (
        <section className="bg-gradient-to-br from-brand-50 to-cust-surface border border-brand-200 rounded-2xl p-4" aria-labelledby="specials-heading">
          <div className="flex items-center gap-2 mb-3">
            <span aria-hidden="true">⭐</span>
            <h2 id="specials-heading" className="text-sm font-bold uppercase tracking-wider text-brand-700">
              Today's Special
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {specials.map((item) => (
              <MenuItemCard key={`sp-${item.id}`} item={item} onAdd={addItem} featured compact />
            ))}
          </div>
        </section>
      )}

      {visibleCategories.map((category) => {
        const items = category.items.filter((i) => i.state !== 'HIDDEN');
        if (!items.length) return null;
        return (
          <section key={category.id} aria-labelledby={`cat-${category.id}`}>
            <h2 id={`cat-${category.id}`} className="font-display text-xl font-semibold text-cust-text-primary mb-3">
              {category.name}
              <span className="ml-2 text-sm font-sans font-normal text-cust-text-muted">{items.length}</span>
            </h2>
            <div className="space-y-3">
              {items.map((item) => (
                <MenuItemCard key={item.id} item={item} onAdd={addItem} />
              ))}
            </div>
          </section>
        );
      })}

      {visibleCategories.every((c) => c.items.filter((i) => i.state !== 'HIDDEN').length === 0) && (
        <p className="text-center py-8 text-sm text-cust-text-muted">Nothing available in this category right now.</p>
      )}
    </main>
  );
}