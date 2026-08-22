import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { customerApi } from '../utils/api';
import { useCustomerWebSocket } from '../hooks/useWebSocket';
import { useToast } from '../components/ui/Toast';

const STORAGE_PREFIX = 'seamless.customer.';

const CustomerContext = createContext(null);

export function CustomerProvider({ restaurantSlug, tableId, children }) {
  const toast = useToast();
  const storageKey = `${STORAGE_PREFIX}${restaurantSlug}.${tableId}`;
  const quietKey = `${storageKey}.quiet`;

  const [table, setTable] = useState(null);
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [bill, setBill] = useState(null);
  const [token, setToken] = useState(() => sessionStorage.getItem(storageKey) || '');
  const [cart, setCart] = useState({});
  const [orderNote, setOrderNote] = useState('');
  const [view, setView] = useState('menu');
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [fatalError, setFatalError] = useState('');
  const [closed, setClosed] = useState(false);
  const [quietMode, setQuietMode] = useState(() => sessionStorage.getItem(quietKey) === '1');
  const [submitting, setSubmitting] = useState(false);

  const cartEntries = Object.values(cart);
  const cartTotal = cartEntries.reduce((total, entry) => total + Number(entry.price) * entry.quantity, 0);
  const cartCount = cartEntries.reduce((count, entry) => count + entry.quantity, 0);

  const refreshData = useCallback(async (sessionToken) => {
    const [menuPayload, ordersPayload, billPayload] = await Promise.all([
      customerApi.getMenu(sessionToken),
      customerApi.getOrders(sessionToken),
      customerApi.getBill(sessionToken),
    ]);
    setMenu(menuPayload.categories || []);
    setOrders(ordersPayload.orders || []);
    setBill(billPayload);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const tablePayload = await customerApi.getTable(restaurantSlug, tableId);
        if (!active) return;
        setTable(tablePayload);

        if (!tablePayload.can_start_session) {
          setClosed(true);
          return;
        }

        let sessionToken = sessionStorage.getItem(storageKey);
        if (sessionToken) {
          try {
            await refreshData(sessionToken);
          } catch {
            sessionToken = '';
            sessionStorage.removeItem(storageKey);
          }
        }
        if (!sessionToken) {
          const session = await customerApi.createSession(restaurantSlug, tableId);
          sessionToken = session.customer_token;
          sessionStorage.setItem(storageKey, sessionToken);
          await refreshData(sessionToken);
        }
        if (active) setToken(sessionToken);
      } catch (e) {
        if (active) {
          setFatalError(e.message || 'Unable to start a dining session.');
          setClosed(true);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [restaurantSlug, tableId, storageKey, refreshData]);

  // Real-time sync — single socket per page, auto-reconnecting.
  useCustomerWebSocket(token, (event) => {
    if (event === 'table.closed') {
      setClosed(true);
      sessionStorage.removeItem(storageKey);
      return;
    }
    refreshData(token).catch(() => {});
  });

  // Polling fallback (works for Windows native runserver where Daphne is disabled)
  useEffect(() => {
    if (!token || closed || fatalError) return;
    const interval = setInterval(() => {
      refreshData(token).catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [token, closed, fatalError, refreshData]);

  const toggleQuiet = useCallback(() => {
    setQuietMode((current) => {
      const next = !current;
      sessionStorage.setItem(quietKey, next ? '1' : '0');
      return next;
    });
  }, [quietKey]);

  const addItem = useCallback((item) => {
    if (item.state !== 'AVAILABLE') return;
    setCart((current) => ({
      ...current,
      [item.id]: { ...item, quantity: (current[item.id]?.quantity || 0) + 1, note: current[item.id]?.note || '' },
    }));
  }, []);

  const changeQuantity = useCallback((itemId, difference) => {
    setCart((current) => {
      const entry = current[itemId];
      if (!entry) return current;
      const quantity = entry.quantity + difference;
      if (quantity < 1) {
        const { [itemId]: _removed, ...remaining } = current;
        return remaining;
      }
      return { ...current, [itemId]: { ...entry, quantity } };
    });
  }, []);

  const updateItemNote = useCallback((itemId, note) => {
    setCart((current) => {
      const entry = current[itemId];
      if (!entry) return current;
      return { ...current, [itemId]: { ...entry, note } };
    });
  }, []);

  const removeItem = useCallback((itemId) => {
    setCart((current) => {
      const { [itemId]: _removed, ...remaining } = current;
      return remaining;
    });
  }, []);

  const submitOrder = useCallback(async () => {
    if (!cartEntries.length || submitting) return null;
    setSubmitting(true);
    try {
      const order = await customerApi.placeOrder(
        token,
        cartEntries.map((entry) => ({
          menu_item_id: entry.id,
          quantity: entry.quantity,
          item_note: entry.note,
        })),
        orderNote,
      );
      setOrders((current) => [order, ...current]);
      setCart({});
      setOrderNote('');
      setView('orders');
      toast.success('✓ Order placed');
      return order;
    } catch (e) {
      toast.error(e.message);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [cartEntries, orderNote, submitting, token, toast]);

  const requestBill = useCallback(async () => {
    try {
      setBill(await customerApi.requestBill(token));
      toast.success('✓ Bill requested');
    } catch (e) {
      toast.error(e.message);
    }
  }, [token, toast]);

  const payBill = useCallback(async () => {
    try {
      setBill(await customerApi.demoPayment(token));
      toast.success('✓ Payment successful');
    } catch (e) {
      toast.error(e.message);
    }
  }, [token, toast]);

  const value = {
    restaurantSlug,
    tableId,
    table,
    menu,
    orders,
    bill,
    token,
    cart,
    cartEntries,
    cartTotal,
    cartCount,
    orderNote,
    setOrderNote,
    view,
    setView,
    activeCategory,
    setActiveCategory,
    loading,
    fatalError,
    closed,
    quietMode,
    submitting,
    addItem,
    changeQuantity,
    updateItemNote,
    removeItem,
    submitOrder,
    requestBill,
    payBill,
    toggleQuiet,
  };

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
}

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (!context) throw new Error('useCustomer must be used within a CustomerProvider');
  return context;
}