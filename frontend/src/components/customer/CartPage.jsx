import { useCustomer } from '../../context/CustomerContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';

export function CartPage() {
  const {
    cartEntries,
    cartTotal,
    orderNote,
    setOrderNote,
    view,
    setView,
    changeQuantity,
    updateItemNote,
    removeItem,
    submitOrder,
    submitting,
  } = useCustomer();

  if (view !== 'cart') return null;

  if (cartEntries.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center animate-fade-in">
        <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <h2 className="font-display text-xl font-semibold text-cust-text-primary mb-2">Your cart is empty</h2>
        <p className="text-cust-text-muted mb-6">Add some delicious items from the menu</p>
        <Button variant="custPrimary" onClick={() => setView('menu')}>
          Browse Menu
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-28 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-cust-text-primary">Your Cart</h2>
        <Button variant="custGhost" size="sm" onClick={() => setView('menu')}>
          Continue browsing
        </Button>
      </div>

      <div className="space-y-3">
        {cartEntries.map((entry) => (
          <article
            key={entry.id}
            className="bg-white border border-cust-border rounded-xl p-4 space-y-3 animate-slide-up"
          >
            <div className="flex gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-cust-text-primary">{entry.name}</h3>
                <p className="text-sm text-cust-text-muted">
                  Rs. {Number(entry.price).toFixed(0)} each
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => changeQuantity(entry.id, -1)}
                  className="w-8 h-8 rounded-lg bg-staff-100 flex items-center justify-center text-staff-600 hover:bg-staff-200 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="w-10 text-center font-medium text-cust-text-primary">{entry.quantity}</span>
                <button
                  onClick={() => changeQuantity(entry.id, 1)}
                  className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600 hover:bg-brand-200 transition-colors"
                  aria-label="Increase quantity"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <span className="font-medium text-cust-text-primary w-20 text-right">
                  Rs. {(Number(entry.price) * entry.quantity).toFixed(0)}
                </span>
              </div>
            </div>

            <Input
              value={entry.note || ''}
              placeholder="Item note, e.g. less spicy"
              onChange={(e) => updateItemNote(entry.id, e.target.value)}
              className="text-sm"
            />

            <button
              onClick={() => removeItem(entry.id)}
              className="text-sm text-error-600 hover:text-error-700 font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Remove
            </button>
          </article>
        ))}
      </div>

      <div className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-cust-text-secondary">Request for this order</span>
          <textarea
            value={orderNote}
            onChange={(e) => setOrderNote(e.target.value)}
            placeholder="e.g. Please serve everything together."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-cust-border bg-white text-cust-text-primary placeholder:text-cust-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all resize-none"
          />
        </label>

        <div className="border-t border-cust-border pt-4 space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-cust-text-secondary">Total</span>
            <span className="font-display font-bold text-xl text-brand-600">
              Rs. {Number(cartTotal).toFixed(0)}
            </span>
          </div>
          <Button
            variant="custPrimary"
            fullWidth
            size="lg"
            onClick={submitOrder}
            disabled={submitting}
            loading={submitting}
          >
            {submitting ? 'Placing Order...' : 'Place Order'}
          </Button>
        </div>
      </div>
    </div>
  );
}