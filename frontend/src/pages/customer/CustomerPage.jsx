import { CustomerProvider, useCustomer } from '../../context/CustomerContext';
import { CustomerHeader } from '../../components/customer/CustomerHeader';
import { CategoryTabs } from '../../components/customer/CategoryTabs';
import { MenuSection } from '../../components/customer/MenuSection';
import { CartDrawer } from '../../components/customer/CartDrawer';
import { CartPage } from '../../components/customer/CartPage';
import { OrderTracking } from '../../components/customer/OrderTracking';
import { CustomerBill } from '../../components/customer/CustomerBill';
import { CustomerNavigation } from '../../components/customer/CustomerNavigation';
import { TableAssistant } from '../../components/customer/TableAssistant';
import { LoadingScreen, ClosedScreen } from '../../components/ui/LoadingScreen';

export function CustomerPage({ restaurantSlug, tableId }) {
  return (
    <CustomerProvider restaurantSlug={restaurantSlug} tableId={tableId}>
      <CustomerPageInner />
    </CustomerProvider>
  );
}

function CustomerPageInner() {
  const { loading, fatalError, closed, table } = useCustomer();

  if (loading) return <LoadingScreen message="Opening your table…" />;
  if (fatalError) return <ClosedScreen restaurantName={table?.restaurant?.name} message={fatalError} />;
  if (closed) return <ClosedScreen restaurantName={table?.restaurant?.name} />;

  return (
    <div className="min-h-screen bg-cust-surface">
      <CustomerHeader />
      <CategoryTabs />
      <MenuSection />
      <CartPage />
      <OrderTracking />
      <CustomerBill />
      <CartDrawer />
      <CustomerNavigation />
      <TableAssistant />
    </div>
  );
}