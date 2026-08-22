import { useEffect, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { CustomerPage } from './pages/customer/CustomerPage';
import { StaffPage } from './pages/staff/StaffPage';
import { LandingPage } from './pages/LandingPage';
import { LoadingScreen } from './components/ui/LoadingScreen';

function App() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setInitialized(true);
  }, []);

  if (!initialized) {
    return <LoadingScreen message="Initializing..." />;
  }

  return (
    <ToastProvider>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </ToastProvider>
  );
}

function Router() {
  const path = window.location.pathname;

  // Customer route: /r/:restaurantSlug/t/:tableId
  const customerMatch = path.match(/^\/r\/([^/]+)\/t\/([^/]+)\/?$/);
  if (customerMatch) {
    return <CustomerPage restaurantSlug={customerMatch[1]} tableId={customerMatch[2]} />;
  }

  // Staff routes: /staff/*
  if (path.startsWith('/staff')) {
    return <StaffPage />;
  }

  // Landing page
  return <LandingPage />;
}

export default App;