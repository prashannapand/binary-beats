import { useCustomer } from '../../context/CustomerContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export function CartDrawer() {
  const { cartEntries, cartTotal, cartCount, view, setView } = useCustomer();

  if (view !== 'menu' || cartEntries.length === 0) return null;

  return (
    <aside
      className="no-print fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-cust-border animate-slide-up"
      role="region"
      aria-label="Cart summary"
    >
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-2">
          <span className="text-cust-text-secondary">
            {cartCount} item{cartCount !== 1 ? 's' : ''}
          </span>
          <span className="font-display font-bold text-brand-600">
            Rs. {Number(cartTotal).toFixed(0)}
          </span>
        </div>
        <Button variant="custPrimary" onClick={() => setView('cart')}>
          View Cart
        </Button>
      </div>
    </aside>
  );
}