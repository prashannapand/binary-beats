import { useState } from 'react';
import { useCustomer } from '../../context/CustomerContext';

const IMAGES = {
  momo: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&h=400&fit=crop',
  noodles: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop',
  pizza: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop',
  drinks: 'https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=400&h=400&fit=crop',
  desserts: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop',
};
const DEFAULT_IMAGE = IMAGES.momo;

function pickImage(item, categoryName) {
  const haystack = `${item.name || ''} ${categoryName || ''}`.toLowerCase();
  if (/momo|dumpling/.test(haystack)) return IMAGES.momo;
  if (/chowmein|chow\ mein|noodle|spaghetti/.test(haystack)) return IMAGES.noodles;
  if (/pizza/.test(haystack)) return IMAGES.pizza;
  if (/coke|cola|lemonade|mojito|soda|juice|tea|coffee|water|lassi|drink|beverage/.test(haystack)) return IMAGES.drinks;
  if (/brownie|cake|dessert|kheer|ice[\s-]?cream|sweet|pudding|pastry/.test(haystack)) return IMAGES.desserts;
  return DEFAULT_IMAGE;
}

function VegMark({ value }) {
  if (value !== true && value !== false) return null;
  const color = value ? 'border-green-600' : 'border-red-700';
  const dot = value ? 'bg-green-600' : 'bg-red-700';
  return (
    <span
      title={value ? 'Vegetarian' : 'Non-vegetarian'}
      aria-label={value ? 'Vegetarian' : 'Non-vegetarian'}
      className={`inline-flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-[3px] border-2 ${color}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
    </span>
  );
}

export function MenuItemCard({ item, categoryName, onAdd, featured = false }) {
  const { cart, addItem, changeQuantity } = useCustomer();
  const [imgSrc, setImgSrc] = useState(pickImage(item, categoryName));

  const unavailable = item.state === 'UNAVAILABLE';
  const hidden = item.state === 'HIDDEN';
  if (hidden) return null;

  const inCart = cart[item.id];
  const price = Number(item.price || 0);

  const handleAdd = () => {
    if (onAdd) onAdd(item);
    else addItem(item);
  };

  return (
    <article
      className={`group relative flex gap-3 rounded-xl border p-3 transition-shadow ${
        unavailable
          ? 'border-cust-border bg-staff-50'
          : 'border-cust-border bg-white hover:shadow-cust-md'
      } ${featured && !unavailable ? 'ring-1 ring-brand-300' : ''}`}
    >
      {/* Thumbnail */}
      <div className="relative flex-shrink-0">
        <img
          src={imgSrc}
          alt={item.name}
          loading="lazy"
          onError={() => setImgSrc(DEFAULT_IMAGE)}
          className={`h-24 w-24 rounded-lg object-cover sm:h-28 sm:w-28 ${unavailable ? 'opacity-50 grayscale' : ''}`}
        />
        {item.is_special && !unavailable && (
          <span className="absolute -left-1 -top-1 flex items-center gap-0.5 rounded-full bg-warning-500 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-cust-sm">
            ★
          </span>
        )}
        {unavailable && (
          <span className="absolute inset-x-1.5 bottom-1.5 rounded-md bg-black/70 px-1 py-1 text-center text-[10px] font-semibold leading-tight text-white">
            Currently unavailable
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start gap-1.5">
          <VegMark value={item.is_vegetarian} />
          <h3 className={`min-w-0 truncate text-sm font-semibold sm:text-base ${unavailable ? 'text-cust-text-muted' : 'text-cust-text-primary'}`}>
            {item.name}
          </h3>
        </div>

        {item.description && (
          <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-cust-text-muted">
            {item.description}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="min-w-0">
            <p className={`font-display text-base font-bold sm:text-lg ${unavailable ? 'text-cust-text-muted' : 'text-cust-text-primary'}`}>
              Rs. {price.toFixed(0)}
            </p>
            <p className="flex items-center gap-1 text-[11px] text-cust-text-muted">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {item.preparation_minutes ?? 15} min
            </p>
          </div>

          {/* Add / quantity stepper */}
          {inCart && !unavailable ? (
            <div className="flex items-center overflow-hidden rounded-full bg-brand-600 text-white shadow-cust-sm" role="group" aria-label={`Quantity of ${item.name}`}>
              <button
                type="button"
                onClick={() => changeQuantity(item.id, -1)}
                aria-label={`Remove one ${item.name}`}
                className="px-2.5 py-1.5 text-lg leading-none transition-colors hover:bg-brand-700"
              >
                −
              </button>
              <span className="min-w-6 text-center text-sm font-bold">{inCart.quantity}</span>
              <button
                type="button"
                onClick={() => addItem(item)}
                aria-label={`Add one more ${item.name}`}
                className="px-2.5 py-1.5 text-lg leading-none transition-colors hover:bg-brand-700"
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              disabled={unavailable}
              className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
                unavailable
                  ? 'cursor-not-allowed bg-staff-200 text-staff-400'
                  : 'bg-white text-brand-700 shadow-cust-sm ring-1 ring-brand-200 hover:bg-brand-600 hover:text-white hover:ring-brand-600 active:scale-95'
              }`}
            >
              {unavailable ? 'Unavailable' : '+ Add'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}