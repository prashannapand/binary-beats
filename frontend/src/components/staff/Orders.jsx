import { useState } from 'react';
import { useStaff } from '../../context/StaffContext';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';

const STATUS_LABELS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY: 'Ready',
  SERVED: 'Served',
  REJECTED: 'Rejected',
};

const NEXT_STATUSES = {
  PENDING: ['CONFIRMED', 'REJECTED'],
  CONFIRMED: ['PREPARING'],
  PREPARING: ['READY'],
  READY: ['SERVED'],
};

const QUICK_REASONS = [
  'Item currently unavailable',
  'Kitchen at full capacity',
  'Closing soon',
];

function timeAgo(iso) {
  if (!iso) return '';
  const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const h = Math.floor(mins / 60);
  return `${h}h ${mins % 60}m ago`;
}

export function Orders() {
  const { orders, activeTab, handleOrderStatus, loading, loadDashboard } = useStaff();
  const [rejectTarget, setRejectTarget] = useState(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (activeTab !== 'orders') return null;

  const pendingOrders = orders.filter((o) => o.status === 'PENDING');
  const activeOrders = orders.filter((o) => ['CONFIRMED', 'PREPARING', 'READY'].includes(o.status));
  const completedOrders = orders.filter((o) => o.status === 'SERVED' || o.status === 'REJECTED');

  const confirmReject = async () => {
    if (!rejectTarget || !reason.trim() || submitting) return;
    setSubmitting(true);
    try {
      await handleOrderStatus(rejectTarget, 'REJECTED', reason.trim());
      setRejectTarget(null);
      setReason('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      {/* Pending */}
      <section>
        <header className="flex items-center gap-2 mb-2.5 px-1">
          <h3 className="text-sm font-bold uppercase tracking-wider text-staff-500">Awaiting confirmation</h3>
          {pendingOrders.length > 0 && <Badge variant="pending" size="sm" dot>{pendingOrders.length}</Badge>}
        </header>
        {loading && !orders.length ? (
          <div className="rounded-xl border border-staff-200 bg-white p-8 text-center text-sm text-staff-400">Loading…</div>
        ) : pendingOrders.length ? (
          <div className="space-y-2.5">
            {pendingOrders.map((order) => (
              <StaffOrderCard
                key={order.id}
                order={order}
                onStatus={handleOrderStatus}
                onReject={setRejectTarget}
                priority
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-staff-300 p-6 text-center text-sm text-staff-400">
            No new orders
          </div>
        )}
      </section>



      {/* Completed — collapsible */}
      {completedOrders.length > 0 && (
        <CompletedSection count={completedOrders.length}>
          {completedOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="font-mono text-xs text-staff-400">#{order.id.slice(0, 8)}</span>
              <span className="text-staff-600">Table {order.table_number || '—'}</span>
              <Badge variant={order.status.toLowerCase()}>{STATUS_LABELS[order.status]}</Badge>
              <span className="tabular-nums text-staff-900">Rs. {Number(order.total).toFixed(0)}</span>
            </div>
          ))}
        </CompletedSection>
      )}

      {/* Rejection modal */}
      <Modal
        isOpen={!!rejectTarget}
        onClose={() => { setRejectTarget(null); setReason(''); }}
        title="Reject order"
        description={rejectTarget ? `Table ${rejectTarget.table_number || '—'} · #${rejectTarget.id.slice(0, 8)} · Rs. ${Number(rejectTarget.total).toFixed(0)}` : ''}
        size="sm"
      >
        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-staff-700">Reason (shown to the customer)</span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              autoFocus
              placeholder="Explain briefly why this order can't be fulfilled…"
              className="w-full rounded-lg border border-staff-300 bg-white px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 resize-none"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {QUICK_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  reason === r ? 'bg-staff-900 text-white' : 'bg-staff-100 text-staff-600 hover:bg-staff-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <p className="rounded-lg bg-warning-50 border border-warning-100 px-3 py-2 text-xs leading-relaxed text-warning-800">
            ⚠ The customer is notified instantly and the bill total updates automatically.
          </p>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => { setRejectTarget(null); setReason(''); }}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-staff-600 hover:bg-staff-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmReject}
              disabled={!reason.trim() || submitting}
              className="rounded-lg bg-error-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-error-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Rejecting…' : 'Reject order'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function StaffOrderCard({ order, onStatus, onReject, priority = false }) {
  const nextOptions = NEXT_STATUSES[order.status] || [];
  const waiting = timeAgo(order.created_at);

  return (
    <article
      className={`rounded-xl border bg-white p-4 transition-shadow hover:shadow-cust-md ${
        priority ? 'border-warning-300 ring-1 ring-warning-200' : 'border-staff-200'
      }`}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-mono text-xs font-semibold text-staff-500">#{order.id.slice(0, 8)}</span>
        <span className="text-sm font-bold text-staff-900">Table {order.table_number ?? '—'}</span>
        {priority && <Badge variant="pending" dot>New</Badge>}
        <span className={`ml-auto text-xs ${waiting.startsWith('0') ? 'text-staff-400' : Number(waiting.split(' ')[0]) >= 10 ? 'font-semibold text-error-600' : 'text-staff-500'}`}>
          {waiting}
        </span>
      </div>

      <ul className="mt-2.5 space-y-1 border-t border-staff-100 pt-2.5">
        {(order.items || []).map((item) => (
          <li key={item.id} className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-staff-700">
              <span className="tabular-nums font-semibold">{item.quantity}×</span> {item.name}
              {item.item_note && <em className="ml-1.5 text-xs not-italic text-cust-text-muted">“{item.item_note}”</em>}
            </span>
            <span className="flex-shrink-0 tabular-nums text-staff-500">Rs. {Number(item.line_total).toFixed(0)}</span>
          </li>
        ))}
      </ul>

      {order.order_level_note && (
        <p className="mt-2 rounded-lg bg-info-50 px-3 py-1.5 text-xs italic text-info-800">“{order.order_level_note}”</p>
      )}

      <footer className="mt-3 flex items-center justify-between gap-3 border-t border-staff-100 pt-3">
        <Badge variant={order.status.toLowerCase()} dot>{STATUS_LABELS[order.status]}</Badge>
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-staff-900">Rs. {Number(order.total).toFixed(0)}</span>
          {!priority && nextOptions.length > 0 && (
            <div className="flex gap-2">
              {nextOptions.map((next) => (
                <button
                  key={next}
                  type="button"
                  onClick={() => onStatus(order, next)}
                  className="rounded-lg bg-staff-900 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-staff-700 active:scale-95"
                >
                  {STATUS_LABELS[next]} →
                </button>
              ))}
            </div>
          )}
          {priority && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onReject?.(order)}
                className="rounded-lg bg-error-50 px-3 py-1.5 text-xs font-bold text-error-600 transition-colors hover:bg-error-100 active:scale-95"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => onStatus(order, 'CONFIRMED')}
                className="rounded-lg bg-success-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-success-700 active:scale-95"
              >
                Confirm →
              </button>
            </div>
          )}
        </div>
      </footer>
    </article>
  );
}

function CompletedSection({ count, children }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="rounded-xl border border-staff-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-staff-500">
          Completed <Badge variant="default" size="sm">{count}</Badge>
        </span>
        <svg
          className={`h-4 w-4 text-staff-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="divide-y divide-staff-100 px-4 pb-2 animate-slide-down">{children}</div>}
    </section>
  );
}