import { useStaff } from '../../context/StaffContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../ui/Skeleton';
import { staffApi } from '../../utils/api';

export function Tables() {
  const { tables, activeTab, runAction, copyQr, loading, token } = useStaff();

  if (activeTab !== 'tables') return null;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 animate-pulse">
        <SkeletonGrid count={6} variant="table-card" columns={3} />
      </div>
    );
  }

  const handleTableAction = (tableId, action, successMessage) => {
    runAction(
      () => staffApi[action === 'open' ? 'openTable' : 'closeTable'](tableId, token),
      successMessage
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-staff-900">Tables</h2>
          <p className="text-sm text-staff-500">Open a session before customers scan a QR</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tables.map((table) => (
          <TableCard
            key={table.id}
            table={table}
            onAction={handleTableAction}
            onCopyQr={copyQr}
          />
        ))}

        {tables.length === 0 && (
          <Card variant="default" padding="xl" className="col-span-full text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-staff-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            <h3 className="font-display text-lg font-semibold text-staff-900 mb-1">No tables configured</h3>
            <p className="text-staff-500">Add tables from the restaurant settings</p>
          </Card>
        )}
      </div>
    </div>
  );
}

function TableCard({ table, onAction, onCopyQr }) {
  const isActive = table.status === 'ACTIVE';

  return (
    <Card variant="elevated" padding="lg" className={isActive ? 'ring-2 ring-brand-300' : ''}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <Badge variant={isActive ? 'active' : 'available'} dot>
            {isActive ? 'Active' : 'Available'}
          </Badge>
        </div>
        <h3 className="font-display text-xl font-semibold text-staff-900">Table {table.number}</h3>
      </div>

      <p className="text-sm text-staff-500 mb-4">
        {isActive ? `Session #${table.dining_session_id?.slice(0, 8)}` : 'Ready for guests'}
      </p>

      <div className="mb-4 p-3 bg-staff-50 rounded-lg">
        <p className="text-xs font-bold uppercase tracking-wider text-staff-500 mb-1">QR Code Path</p>
        <code className="text-sm font-mono text-staff-700 break-all">{table.qr_path}</code>
      </div>

      {isActive && (
        <Button variant="secondary" fullWidth onClick={() => onCopyQr(table.qr_path)} className="mb-2">
          Copy QR URL
        </Button>
      )}

      <Button
        variant={isActive ? 'danger' : 'primary'}
        fullWidth
        onClick={() => onAction(table.id, isActive ? 'close' : 'open', isActive ? `Table ${table.number} closed.` : `Table ${table.number} opened.`)}
      >
        {isActive ? 'Close Session' : 'Open Table'}
      </Button>
    </Card>
  );
}

function SkeletonGrid({ count = 6, variant = 'card', columns = 3, className = '' }) {
  return (
    <div className={`grid gap-4 ${className}`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: count }, (_, i) => <Skeleton key={i} variant={variant} className="h-32" />)}
    </div>
  );
}