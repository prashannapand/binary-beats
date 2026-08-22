import { useCustomer } from '../../context/CustomerContext';
import { Badge } from '../ui/Badge';

export function CustomerNavigation() {
  const { view, setView, orders, bill } = useCustomer();

  const tabs = [
    { id: 'menu', label: 'Menu', icon: '🍽' },
    { id: 'orders', label: 'Orders', icon: '📋', badge: orders.length },
    { id: 'bill', label: 'Bill', icon: '🧾', badge: bill?.status === 'REQUESTED' ? 1 : 0 },
  ];

  return (
    <nav
      className="no-print fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm border-t border-cust-border px-4 py-2 safe-area-bottom"
      role="tablist"
      aria-label="Main navigation"
    >
      <div className="max-w-2xl mx-auto flex items-center justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={view === tab.id}
            onClick={() => setView(tab.id)}
            className={`
              flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-150
              ${view === tab.id
                ? 'bg-brand-100 text-brand-600'
                : 'text-cust-text-muted hover:text-cust-text-primary hover:bg-brand-50'}
            `}
          >
            <span className="text-xl" aria-hidden="true">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
            {tab.badge && (
              <Badge variant="default" size="xs" className="-mt-1">
                {tab.badge}
              </Badge>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}