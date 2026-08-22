import { useState } from 'react';
import { useStaff } from '../../context/StaffContext';
import { Badge } from '../ui/Badge';
import { staffApi } from '../../utils/api';

const STATUS_LABELS = {
  NOT_REQUESTED: 'Not requested',
  REQUESTED: 'Awaiting payment',
  PAID: 'Paid',
};

function timeAgo(iso) {
  if (!iso) return '';
  const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
}

export function Bills() {
  const { bills, activeTab, token, runAction, loading } = useStaff();

  if (activeTab !== 'bills') return null;

  const pendingBills = bills.filter((b) => b.status !== 'PAID');
  const completedBills = bills.filter((b) => b.status === 'PAID');

  const markPaid = (bill) =>
    runAction(
      () => staffApi.markBillPaid(bill.id, token),
      `✓ Table ${bill.table_number ?? ''} bill settled`,
    );

  const sendBill = (bill) =>
    runAction(
      () => staffApi.sendBill(bill.id, token),
      `✓ Sent bill to Table ${bill.table_number ?? ''}`,
    );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      <section>
        <header className="flex items-center gap-2 mb-2.5 px-1">
          <h3 className="text-sm font-bold uppercase tracking-wider text-staff-500">Pending settlement</h3>
          {pendingBills.length > 0 && <Badge variant="requested" size="sm" dot>{pendingBills.length}</Badge>}
        </header>

        {!loading && pendingBills.length === 0 && (
          <div className="rounded-xl border border-dashed border-staff-300 p-6 text-center text-sm text-staff-400">
            No bills waiting. Requests appear here the moment a customer asks for the bill.
          </div>
        )}

        <div className="space-y-2.5">
          {pendingBills.map((bill) => (
            <article key={bill.id} className="rounded-xl border border-warning-200 bg-white p-4 ring-1 ring-warning-100">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-sm font-bold text-staff-900">Table {bill.table_number ?? '—'}</span>
                <span className="font-mono text-xs text-staff-400">#{bill.id.slice(0, 8)}</span>
                <Badge variant="requested" dot>{STATUS_LABELS[bill.status]}</Badge>
                <span className="ml-auto text-xs text-staff-500">{timeAgo(bill.requested_at)}</span>
              </div>

              <dl className="mt-3 space-y-1 border-t border-staff-100 pt-2.5 text-sm">
                <Row label="Subtotal" value={Number(bill.subtotal)} />
                {Number(bill.service_charge) > 0 && <Row label="Service charge" value={Number(bill.service_charge)} muted />}
                {Number(bill.tax) > 0 && <Row label="13% VAT" value={Number(bill.tax)} muted />}
              </dl>

              <footer className="mt-3 flex items-center justify-between gap-3 border-t border-staff-100 pt-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-staff-400">Grand total</p>
                  <p className="font-display text-xl font-bold text-staff-900 tabular-nums">Rs. {Number(bill.total).toFixed(2)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="rounded-lg bg-staff-100 px-4 py-2 text-xs font-bold text-staff-700 transition-colors hover:bg-staff-200 active:scale-95"
                  >
                    🖨 Print
                  </button>
                  {bill.status === 'NOT_REQUESTED' ? (
                    <button
                      type="button"
                      onClick={() => sendBill(bill)}
                      className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-brand-700 active:scale-95"
                    >
                      Send to Customer
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => markPaid(bill)}
                      className="rounded-lg bg-success-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-success-700 active:scale-95"
                    >
                      Mark Paid
                    </button>
                  )}
                </div>
              </footer>
            </article>
          ))}
        </div>
      </section>

      {completedBills.length > 0 && (
        <CompletedSection count={completedBills.length}>
          {completedBills.map((bill) => (
            <div key={bill.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="text-staff-600">Table {bill.table_number ?? '—'}</span>
              <span className="font-mono text-xs text-staff-400">#{bill.id.slice(0, 8)}</span>
              <Badge variant="paid">{STATUS_LABELS.PAID}</Badge>
              <span className="tabular-nums font-medium text-staff-900">Rs. {Number(bill.total).toFixed(2)}</span>
            </div>
          ))}
        </CompletedSection>
      )}
    </div>
  );
}

function Row({ label, value, muted = false }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className={muted ? 'text-cust-text-muted' : 'text-staff-500'}>{label}</dt>
      <dd className={`tabular-nums ${muted ? 'text-cust-text-muted' : 'text-staff-800'}`}>Rs. {value.toFixed(2)}</dd>
    </div>
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
          Completed Payments <Badge variant="default" size="sm">{count}</Badge>
        </span>
        <svg
          className={`h-4 w-4 text-staff-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="divide-y divide-staff-100 px-4 pb-1 animate-slide-down">{children}</div>}
    </section>
  );
}