import { Button } from '../components/ui/Button';

export function LandingPage() {
  return (
    <main className="min-h-screen bg-staff-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg text-center space-y-8 animate-fade-in">
        <div className="space-y-5">
          <div className="w-20 h-20 mx-auto bg-staff-800 rounded-2xl flex items-center justify-center">
            <svg className="w-11 h-11 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-4xl font-semibold text-white tracking-tight">Seamless</h1>
            <p className="text-brand-400 font-medium mt-2">QR dining, without the friction</p>
          </div>
        </div>

        <p className="text-staff-300 leading-relaxed">
          Scan your table's QR code to order privately, track preparation in real time,
          and settle your bill from your phone — while staff keep full control of tables,
          menu availability, and billing.
        </p>

        <div className="grid gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={() => { window.location.href = '/staff'; }}
          >
            Open Staff Dashboard
          </Button>
          <p className="text-xs text-staff-500">
            To try the customer view: sign in as staff, open a table, then use <span className="text-staff-300 font-medium">Copy QR URL</span>.
          </p>
        </div>

        <div className="pt-4 border-t border-staff-800 space-y-1">
          <p className="text-xs uppercase tracking-wider text-staff-500 font-bold">Demo Login</p>
          <p className="text-sm"><code className="font-mono text-staff-300">demo_staff / demo1234</code></p>
        </div>
      </div>
    </main>
  );
}