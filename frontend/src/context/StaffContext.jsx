import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { staffApi } from '../utils/api';
import { useStaffWebSocket } from '../hooks/useWebSocket';
import { useToast } from '../components/ui/Toast';
import { useAuth } from './AuthContext';

const StaffContext = createContext(null);

export function StaffProvider({ children }) {
  const { success, error } = useToast();
  const { token, staff, logout } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const loadDashboard = useCallback(async () => {
    if (!token) return;
    try {
      const [dashboardPayload, tablesPayload, ordersPayload, menuPayload, categoriesPayload, billsPayload] = await Promise.all([
        staffApi.dashboard(token),
        staffApi.tables(token),
        staffApi.orders(token),
        staffApi.menu(token),
        staffApi.categories(token),
        staffApi.bills(token),
      ]);
      setDashboard(dashboardPayload);
      setTables(tablesPayload.tables);
      setOrders(ordersPayload.orders);
      setMenu(menuPayload.items);
      setCategories(categoriesPayload.categories);
      setBills(billsPayload.bills);
    } catch (e) {
      error(e.message);
      if (e.status === 401) {
        logout();
      }
    }
  }, [token, error, logout]);

  useEffect(() => {
    if (token) {
      setLoading(true);
      loadDashboard().finally(() => setLoading(false));
    }
  }, [token, loadDashboard]);

  // WebSocket for real-time updates (works when Daphne is running)
  useStaffWebSocket(staff?.restaurant?.id, token, (event) => {
    loadDashboard();
  });

  // Polling fallback (works for Windows native runserver where Daphne is disabled)
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      loadDashboard();
    }, 5000);
    return () => clearInterval(interval);
  }, [token, loadDashboard]);

  const runAction = useCallback(async (action, successMessage) => {
    try {
      await action();
      await loadDashboard();
      success(successMessage);
    } catch (e) {
      error(e.message);
    }
  }, [loadDashboard, success, error]);

  const handleOrderStatus = useCallback(async (order, nextStatus, rejectionReason = '') => {
    try {
      await staffApi.updateOrderStatus(order.id, nextStatus, token, rejectionReason);
      await loadDashboard();
      success(`✓ Order marked ${nextStatus.toLowerCase()}`);
    } catch (e) {
      error(e.message);
    }
  }, [loadDashboard, token, success, error]);

  const copyQr = useCallback(async (path) => {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      success(`Copied ${url}`);
    } catch {
      success(url);
    }
  }, [success]);

  const value = {
    staff,
    token,
    dashboard,
    tables,
    orders,
    menu,
    categories,
    bills,
    loading,
    activeTab,
    setActiveTab,
    runAction,
    handleOrderStatus,
    copyQr,
    loadDashboard,
  };

  return (
    <StaffContext.Provider value={value}>
      {children}
    </StaffContext.Provider>
  );
}

export function useStaff() {
  const context = useContext(StaffContext);
  if (!context) {
    throw new Error('useStaff must be used within a StaffProvider');
  }
  return context;
}