import { useCustomer } from '../../context/CustomerContext';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export function CustomerHeader() {
  const { table, quietMode, toggleQuiet } = useCustomer();

  if (!table) return null;

  return (
    <header className="no-print sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-cust-border px-4 py-3">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
            {table.restaurant?.name || 'Seamless'}
          </p>
          <h1 className="font-display text-xl font-semibold text-cust-text-primary truncate">
            Table {table.table?.number}
          </h1>
        </div>
        <Button
          variant={quietMode ? 'custPrimary' : 'custGhost'}
          size="sm"
          onClick={toggleQuiet}
          className="flex items-center gap-1.5 whitespace-nowrap"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            {quietMode ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1zm12 0h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4a1 1 0 011-1zm0-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1z" />
            )}
          </svg>
          <span className="hidden sm:inline">{quietMode ? 'Quiet mode on' : 'Quiet dining'}</span>
        </Button>
      </div>
      {quietMode && (
        <div className="mt-2 text-xs text-brand-600 bg-brand-50 px-3 py-1.5 rounded-lg animate-slide-down">
          Quiet dining mode is on. Prefer app updates over check-ins.
        </div>
      )}
    </header>
  );
}