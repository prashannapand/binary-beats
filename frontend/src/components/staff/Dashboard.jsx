import { useStaff } from '../../context/StaffContext';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../ui/Skeleton';

export function Dashboard() {
  const { dashboard, activeTab, loading, setActiveTab } = useStaff();

  if (activeTab !== 'dashboard') return null;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 animate-pulse">
        <Skeleton variant="card" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} variant="card" className="h-24" />)}
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Tables"
          value={dashboard.active_tables}
          icon="🪑"
          color="brand"
        />
        <StatCard
          label="Pending Orders"
          value={dashboard.pending_orders}
          icon="📋"
          color="warning"
          badge={dashboard.pending_orders > 0}
        />
        <StatCard
          label="Bill Requests"
          value={dashboard.bill_requests}
          icon="🧾"
          color="info"
          badge={dashboard.bill_requests > 0}
        />
        <StatCard
          label="Today's Revenue"
          value={`Rs. ${Number(dashboard.daily_revenue || 0).toLocaleString()}`}
          icon="💰"
          color="success"
        />
      </div>

      <Card variant="elevated" padding="lg">
        <h2 className="font-display text-lg font-semibold text-staff-900 mb-4">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction
            label="Open Table"
            icon="🪑"
            description="Start a new dining session"
            onClick={() => setActiveTab('tables')}
          />
          <QuickAction
            label="View Orders"
            icon="📋"
            description="Manage incoming orders"
            onClick={() => setActiveTab('orders')}
          />
          <QuickAction
            label="Update Menu"
            icon="🍽"
            description="Change availability & specials"
            onClick={() => setActiveTab('menu')}
          />
          <QuickAction
            label="Kitchen Display"
            icon="👨‍🍳"
            description="Track preparation live"
            onClick={() => setActiveTab('kitchen')}
          />
        </div>
      </Card>

      <Card variant="elevated" padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-staff-900">Demo flow</h2>
        </div>
        <p className="text-sm leading-relaxed text-staff-600">
          Open a table, copy its QR URL, place a customer order, confirm it in Orders, then settle the bill and close the session.
          Menu availability changes appear live on customer phones.
        </p>
      </Card>
    </div>
  );
}

function StatCard({ label, value, icon, color, badge }) {
  const colors = {
    brand: 'bg-brand-50 border-brand-200 text-brand-700',
    success: 'bg-success-50 border-success-200 text-success-700',
    warning: 'bg-warning-50 border-warning-200 text-warning-700',
    info: 'bg-info-50 border-info-200 text-info-700',
  };

  return (
    <Card variant="default" padding="lg" className="relative">
      {badge && (
        <Badge variant="warning" className="absolute -top-2 -right-2">Live</Badge>
      )}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-staff-500 mb-1">{label}</p>
          <p className="font-display font-bold text-2xl text-staff-900">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

function QuickAction({ label, icon, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className="p-4 rounded-xl border border-staff-200 hover:border-brand-300 hover:bg-brand-50 transition-all text-left group"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="font-medium text-staff-900">{label}</p>
          <p className="text-xs text-staff-500">{description}</p>
        </div>
      </div>
      <svg className="w-5 h-5 text-staff-300 group-hover:text-brand-500 transition-colors ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    </button>
  );
}