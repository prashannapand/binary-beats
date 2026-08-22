import { useStaff } from '../../context/StaffContext';
import { Badge } from '../ui/Badge';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'orders', label: 'Orders', icon: '📋' },
  { id: 'tables', label: 'Tables', icon: '🪑' },
  { id: 'menu', label: 'Menu', icon: '🍽' },
  { id: 'bills', label: 'Bills', icon: '🧾' },
  { id: 'kitchen', label: 'Kitchen', icon: '👨‍🍳' },
];

export function StaffNavigation() {
  const { activeTab, setActiveTab, orders, bills } = useStaff();

  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
  const billRequests = bills.filter(b => b.status === 'REQUESTED').length;

  return (
    <nav
      className="sticky top-14 z-20 bg-white/95 backdrop-blur-sm border-b border-staff-200 px-4 py-2"
      role="tablist"
      aria-label="Staff navigation"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-1 overflow-x-auto pb-2 -mx-4 px-4" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full
                whitespace-nowrap transition-all duration-150
                ${activeTab === tab.id
                  ? 'bg-staff-900 text-white'
                  : 'text-staff-500 hover:text-staff-700 hover:bg-staff-100'}
              `}
            >
              <span aria-hidden="true">{tab.icon}</span>
              {tab.label}
              {(tab.id === 'orders' && pendingOrders > 0) && (
                <Badge variant="pending" size="sm">{pendingOrders}</Badge>
              )}
              {(tab.id === 'bills' && billRequests > 0) && (
                <Badge variant="requested" size="sm">{billRequests}</Badge>
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}