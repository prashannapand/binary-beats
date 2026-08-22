export function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-staff-50 px-4">
      <div className="text-center space-y-4 animate-fade-in">
        <div className="h-12 w-12 rounded-full border-4 border-staff-200 border-t-brand-600 animate-spin mx-auto" aria-hidden="true" />
        <p className="text-cust-text-secondary font-medium">{message}</p>
      </div>
    </div>
  );
}

export function ErrorScreen({ message, onRetry }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-staff-50 px-4">
      <div className="max-w-md w-full text-center space-y-6 animate-fade-in">
        <div className="w-16 h-16 mx-auto bg-error-50 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-error-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-cust-text-primary">Something went wrong</h2>
          <p className="text-cust-text-muted mt-2">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

export function ClosedScreen({ restaurantName, message }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-staff-50 px-4">
      <div className="max-w-md w-full text-center space-y-6 animate-fade-in">
        <div className="w-20 h-20 mx-auto bg-brand-100 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div>
          <h2 className="font-display text-2xl font-semibold text-cust-text-primary">
            {message ? 'Unable to open this table' : 'Dining Session Ended'}
          </h2>
          <p className="text-cust-text-muted mt-2">
            {message || `Thanks for visiting ${restaurantName || 'Seamless'}.`}
          </p>
          {!message && (
            <p className="text-cust-text-muted mt-1 text-sm">
              This table is currently closed. Please ask staff to open it if you are still dining.
            </p>
          )}
          {message && (
            <p className="text-cust-text-muted mt-1 text-sm">
              Please verify the QR code or ask staff for help.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}