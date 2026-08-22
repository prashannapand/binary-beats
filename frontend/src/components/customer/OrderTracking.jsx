import { useCustomer } from '../../context/CustomerContext';
import { Badge } from '../ui/Badge';

const ORDER_FLOW = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED'];

const STATUS_LABELS = {
  PENDING: 'Received',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY: 'Ready',
  SERVED: 'Served',
  REJECTED: 'Rejected',
};

const STATUS_ICONS = {
  PENDING: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  ),
  CONFIRMED: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  PREPARING: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
  ),
  READY: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  SERVED: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.096A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.904z" />
    </svg>
  ),
  REJECTED: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
};

export function OrderTracking() {
  const { orders, view } = useCustomer();

  if (view !== 'orders') return null;

  if (orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center animate-fade-in">
        <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h2 className="font-display text-xl font-semibold text-cust-text-primary mb-2">No orders yet</h2>
        <p className="text-cust-text-muted">Your placed orders will appear here</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-28 space-y-4 animate-fade-in">
      <h2 className="font-display text-xl font-semibold text-cust-text-primary px-1">Your Orders</h2>
      <div className="space-y-3">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}

function OrderCard({ order }) {
  const currentIndex = ORDER_FLOW.indexOf(order.status);
  const isRejected = order.status === 'REJECTED';

  return (
    <article className="bg-white border border-cust-border rounded-xl overflow-hidden animate-slide-up">
      <div className="p-4 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-600">Order #{order.id.slice(0, 8)}</p>
            <Badge variant={order.status} dot>{STATUS_LABELS[order.status] || order.status}</Badge>
          </div>
          <span className="font-display font-bold text-lg text-cust-text-primary">
            Rs. {Number(order.total).toFixed(0)}
          </span>
        </div>

        {!isRejected && (
          <ol className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4" role="list" aria-label="Order progress">
            {ORDER_FLOW.map((step, index) => (
              <li key={step} className="flex-shrink-0 flex flex-col items-center gap-1.5">
                <div className={`
                  relative flex h-10 w-10 items-center justify-center rounded-full transition-all
                  ${index < currentIndex ? 'bg-success-500 text-white' : index === currentIndex ? 'bg-brand-500 text-white ring-4 ring-brand-500/20' : 'bg-staff-100 text-staff-400'}
                `}>
                  {STATUS_ICONS[step]}
                </div>
                <span className={`
                  text-xs font-medium whitespace-nowrap
                  ${index <= currentIndex ? 'text-cust-text-primary' : 'text-cust-text-muted'}
                `}>
                  {STATUS_LABELS[step]}
                </span>
                {index < ORDER_FLOW.length - 1 && (
                  <div className={`
                    absolute top-5 left-full right-0 h-0.5 rounded
                    ${index < currentIndex ? 'bg-success-500' : 'bg-staff-200'}
                  `} aria-hidden="true" />
                )}
              </li>
            ))}
          </ol>
        )}

        {isRejected && (
          <div className="bg-error-50 border border-error-200 rounded-xl p-4 flex items-start gap-3">
            {STATUS_ICONS.REJECTED}
            <div>
              <p className="font-medium text-error-800">Order Rejected</p>
              {order.rejection_reason && (
                <p className="text-sm text-error-700 mt-1">{order.rejection_reason}</p>
              )}
            </div>
          </div>
        )}

        <ul className="divide-y divide-cust-border" role="list">
          {order.items.map((item) => (
            <li key={item.id} className="py-3 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-cust-text-primary">
                  {item.quantity}× {item.name}
                </p>
                {item.item_note && (
                  <p className="text-sm text-cust-text-muted mt-0.5">Note: {item.item_note}</p>
                )}
              </div>
              <span className="font-medium text-cust-text-primary">
                Rs. {Number(item.line_total).toFixed(0)}
              </span>
            </li>
          ))}
        </ul>

        {order.order_level_note && (
          <p className="text-sm text-cust-text-muted italic bg-brand-50 rounded-lg p-3">
            "{order.order_level_note}"
          </p>
        )}
      </div>
    </article>
  );
}