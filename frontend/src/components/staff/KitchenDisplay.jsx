import { useStaff } from '../../context/StaffContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../ui/Skeleton';

export function KitchenDisplay() {
  const { orders, activeTab, handleOrderStatus, loading } = useStaff();

  if (activeTab !== 'kitchen') return null;

  const kitchenOrders = orders.filter(o =>
    ['CONFIRMED', 'PREPARING', 'READY'].includes(o.status)
  ).sort((a, b) => {
    const statusOrder = { CONFIRMED: 0, PREPARING: 1, READY: 2 };
    return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 animate-pulse">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <KitchenOrderSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-staff-900">Kitchen Display</h2>
          <p className="text-sm text-staff-500">{kitchenOrders.length} active orders</p>
        </div>
      </div>

      {kitchenOrders.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {kitchenOrders.map((order) => (
            <KitchenOrderCard key={order.id} order={order} onStatus={handleOrderStatus} />
          ))}
        </div>
      ) : (
        <Card variant="default" padding="xl" className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-staff-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="font-display text-lg font-semibold text-staff-900 mb-1">No active kitchen orders</h3>
          <p className="text-staff-500">Orders will appear here when confirmed</p>
        </Card>
      )}
    </div>
  );
}

function KitchenOrderCard({ order, onStatus }) {
  const statusConfig = {
    CONFIRMED: { label: 'Start', next: 'PREPARING', variant: 'primary', icon: '▶️' },
    PREPARING: { label: 'Ready', next: 'READY', variant: 'success', icon: '✅' },
    READY: { label: 'Served', next: 'SERVED', variant: 'secondary', icon: '🍽' },
  };

  const config = statusConfig[order.status] || { label: 'Next', next: 'PREPARING', variant: 'primary' };
  const orderAge = order.created_at ? getOrderAge(order.created_at) : '—';

  return (
    <Card variant={order.status === 'CONFIRMED' && orderAge > 15 ? 'elevated' : 'default'} padding="lg" className={order.status === 'CONFIRMED' && orderAge > 15 ? 'ring-2 ring-warning-300' : ''}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-600">TABLE {order.table_number}</p>
            <h3 className="font-display text-xl font-semibold text-staff-900">Order #{order.id.slice(0, 8)}</h3>
          </div>
          <Badge variant={order.status.toLowerCase()} dot className="text-xs">
            {order.status}
          </Badge>
        </div>

        <div className="border-t border-staff-200 pt-4 space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center font-bold text-brand-700 text-sm">
                  {item.quantity}
                </span>
                <div>
                  <p className="font-medium text-staff-900">{item.name}</p>
                  {item.item_note && <p className="text-xs text-staff-500 italic">{item.item_note}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-staff-200">
          <span className="text-sm text-staff-500">Order age: {orderAge} min</span>
          <Button
            variant={config.variant}
            size="lg"
            onClick={() => onStatus(order, config.next)}
            className="w-full sm:w-auto"
          >
            {config.icon} {config.label}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function KitchenOrderSkeleton() {
  return (
    <Card variant="default" padding="lg" className="animate-pulse">
      <div className="space-y-4">
        <div className="flex justify-between">
          <div className="h-4 w-24 bg-staff-200 rounded" />
          <div className="h-5 w-20 bg-staff-200 rounded" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-staff-200 rounded" />
          ))}
        </div>
        <div className="h-12 bg-staff-200 rounded" />
      </div>
    </Card>
  );
}

function getOrderAge(createdAt) {
  const diff = Date.now() - new Date(createdAt).getTime();
  return Math.floor(diff / 60000);
}