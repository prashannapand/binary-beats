import { useCustomer } from '../../context/CustomerContext';

function BillRow({ label, value, muted = false, bold = false }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 py-1 ${bold ? 'font-semibold' : ''}`}>
      <span className={muted ? 'text-cust-text-muted' : 'text-cust-text-secondary'}>{label}</span>
      <span className={`tabular-nums ${muted ? 'text-cust-text-muted' : 'text-cust-text-primary'}`}>{value}</span>
    </div>
  );
}

export function CustomerBill() {
  const { bill, view, table, requestBill, payBill } = useCustomer();

  if (view !== 'bill') return null;

  if (!bill) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-fade-in">
        <p className="text-cust-text-muted">Loading your bill…</p>
      </div>
    );
  }

  const statusLabel = {
    NOT_REQUESTED: 'Not requested',
    REQUESTED: 'Payment pending',
    PAID: 'Paid ✓',
  }[bill.status] || bill.status;

  const timestamp = bill.paid_at || bill.requested_at;
  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : '';

  const items = bill.items || [];
  const hasCharges = Number(bill.service_charge) > 0 || Number(bill.tax) > 0;

  return (
    <div className="max-w-2xl mx-auto px-4 pb-32 animate-fade-in">
      {/* Invoice card */}
      <div className="overflow-hidden rounded-2xl border border-cust-border bg-white shadow-cust-md">
        {/* Header */}
        <div className="border-b border-dashed border-cust-border bg-cust-surface px-5 py-5 text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-brand-600">Invoice</p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-cust-text-primary">
            {table?.restaurant?.name || 'Restaurant'}
          </h2>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 text-xs text-cust-text-muted">
            <span>Table {bill.table_number || table?.table?.number || '—'}</span>
            <span aria-hidden="true">•</span>
            <span className="font-mono">#{String(bill.id).slice(0, 8).toUpperCase()}</span>
            {formattedTime && (
              <>
                <span aria-hidden="true">•</span>
                <span>{formattedTime}</span>
              </>
            )}
          </div>
          <span
            className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
              bill.status === 'PAID'
                ? 'bg-success-50 text-success-700'
                : bill.status === 'REQUESTED'
                  ? 'bg-warning-50 text-warning-700'
                  : 'bg-staff-100 text-staff-500'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${bill.status === 'PAID' ? 'bg-success-500' : bill.status === 'REQUESTED' ? 'bg-warning-500' : 'bg-staff-400'}`} />
            {statusLabel}
          </span>
        </div>

        {/* Items */}
        {items.length > 0 && (
          <ul className="divide-y divide-dashed divide-cust-border px-5">
            {items.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-cust-text-primary">
                    <span className="tabular-nums text-cust-text-secondary">{item.quantity} × </span>
                    {item.name}
                  </p>
                  {item.item_note && (
                    <p className="mt-0.5 text-xs italic text-cust-text-muted">“{item.item_note}”</p>
                  )}
                </div>
                <span className="flex-shrink-0 text-sm tabular-nums text-cust-text-primary">
                  Rs. {Number(item.line_total).toFixed(0)}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* Totals */}
        <div className="space-y-1 border-t border-dashed border-cust-border px-5 py-4">
          <BillRow label="Subtotal" value={`Rs. ${Number(bill.subtotal).toFixed(2)}`} />
          {Number(bill.service_charge) > 0 && (
            <BillRow label="Service charge" value={`Rs. ${Number(bill.service_charge).toFixed(2)}`} muted />
          )}
          {Number(bill.tax) > 0 && (
            <BillRow label={`13% VAT`} value={`Rs. ${Number(bill.tax).toFixed(2)}`} muted />
          )}
          {!hasCharges && (
            <p className="py-1 text-xs text-cust-text-muted">No additional charges applied.</p>
          )}
        </div>

        {/* Grand total */}
        <div className="flex items-center justify-between bg-staff-900 px-5 py-4">
          <span className="text-sm font-bold uppercase tracking-wide text-white/80">Grand total</span>
          <span className="font-display text-2xl font-bold text-white tabular-nums">
            Rs. {Number(bill.total).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Actions — hidden when printing */}
      <div className="no-print mt-5 space-y-3">
        {bill.status === 'NOT_REQUESTED' && (
          <button
            type="button"
            onClick={requestBill}
            className="w-full rounded-xl bg-brand-600 py-3.5 text-base font-bold text-white shadow-cust-md transition-colors hover:bg-brand-700 active:scale-[.99]"
          >
            Request Bill
          </button>
        )}

        {bill.status === 'REQUESTED' && (
          <>
            <button
              type="button"
              onClick={payBill}
              className="w-full rounded-xl bg-brand-600 py-3.5 text-base font-bold text-white shadow-cust-md transition-colors hover:bg-brand-700 active:scale-[.99]"
            >
              Pay Rs. {Number(bill.total).toFixed(0)} (Demo)
            </button>
            <p className="text-center text-xs leading-relaxed text-cust-text-muted">
              Prefer a physical bill? Just ask — staff will bring it and settle the table.
            </p>
          </>
        )}

        {bill.status === 'PAID' && (
          <div className="rounded-xl border border-success-200 bg-success-50 p-4 text-center">
            <p className="text-sm font-semibold text-success-800">Thank you for dining with us!</p>
            <p className="mt-0.5 text-xs text-success-700">Staff can now close this table session.</p>
          </div>
        )}

      </div>
    </div>
  );
}