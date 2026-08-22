import { useAuth } from '../../context/AuthContext';
import { StaffProvider } from '../../context/StaffContext';
import { StaffHeader } from '../../components/staff/StaffHeader';
import { StaffNavigation } from '../../components/staff/StaffNavigation';
import { Dashboard } from '../../components/staff/Dashboard';
import { Orders } from '../../components/staff/Orders';
import { Tables } from '../../components/staff/Tables';
import { MenuManagement } from '../../components/staff/MenuManagement';
import { Bills } from '../../components/staff/Bills';
import { KitchenDisplay } from '../../components/staff/KitchenDisplay';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { StaffLogin } from '../../components/staff/StaffLogin';

export function StaffPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();

  if (authLoading) return <LoadingScreen message="Checking authentication..." />;

  if (!isAuthenticated) {
    return <StaffLoginPage />;
  }

  return (
    <StaffProvider>
      <StaffPageInner />
    </StaffProvider>
  );
}

function StaffPageInner() {
  const { loading, staff } = useAuth();

  if (loading) return <LoadingScreen message="Loading dashboard..." />;

  return (
    <div className="min-h-screen bg-staff-50">
      <StaffHeader />
      <StaffNavigation />
      <main className="max-w-7xl mx-auto px-4 pb-8">
        <Dashboard />
        <Orders />
        <Tables />
        <MenuManagement />
        <Bills />
        <KitchenDisplay />
      </main>
    </div>
  );
}

function StaffLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-staff-900 px-4">
      <div className="w-full max-w-md">
        <StaffLogin />
      </div>
    </div>
  );
}