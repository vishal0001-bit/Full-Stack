import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("shopease_user")); } catch { return null; }
  });
  const [cart, setCart] = useState([]);
  const [cartBusy, setCartBusy] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!localStorage.getItem("shopease_token")) { setCart([]); return; }
    try {
      setCartBusy(true);
      const { data } = await api.get("/cart");
      setCart(data.items || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not load your cart");
    } finally { setCartBusy(false); }
  }, []);

  useEffect(() => { refreshCart(); }, [refreshCart]);

  const loginWith = async (endpoint, credentials) => {
    const { data } = await api.post(endpoint, credentials);
    localStorage.setItem("shopease_token", data.token);
    localStorage.setItem("shopease_user", JSON.stringify(data.user));
    setUser(data.user);
    await refreshCart();
    return data.user;
  };
  const login = (credentials) => loginWith("/auth/login", credentials);
  const sellerLogin = (credentials) => loginWith("/auth/seller-login", credentials);
  const register = async (details) => {
    const { data } = await api.post("/auth/register", details);
    localStorage.setItem("shopease_token", data.token);
    localStorage.setItem("shopease_user", JSON.stringify(data.user));
    setUser(data.user);
    await refreshCart();
    return data.user;
  };
  const logout = () => {
    localStorage.removeItem("shopease_token");
    localStorage.removeItem("shopease_user");
    setUser(null);
    setCart([]);
    toast.success("You have been signed out");
  };
  const setUserData = (nextUser) => {
    localStorage.setItem("shopease_user", JSON.stringify(nextUser));
    setUser(nextUser);
  };
  const addToCart = async (productId, quantity = 1) => {
    if (!user) { toast("Sign in to save items to your cart"); return false; }
    try {
      const { data } = await api.post("/cart/items", { productId, quantity });
      setCart(data.items || []);
      toast.success("Added to your cart");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not add item");
      return false;
    }
  };
  const updateQuantity = async (productId, quantity) => {
    try {
      const { data } = await api.patch(`/cart/items/${productId}`, { quantity });
      setCart(data.items || []);
    } catch (error) { toast.error(error.response?.data?.message || "Could not update cart"); }
  };
  const removeFromCart = async (productId) => {
    try {
      const { data } = await api.delete(`/cart/items/${productId}`);
      setCart(data.items || []);
      toast.success("Item removed");
    } catch (error) { toast.error(error.response?.data?.message || "Could not remove item"); }
  };

  const value = useMemo(() => ({
    user, cart, cartBusy, login, sellerLogin, register, logout, setUserData, refreshCart, addToCart, updateQuantity, removeFromCart,
    cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0),
  }), [user, cart, cartBusy]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
}
