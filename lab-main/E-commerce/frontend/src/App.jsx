import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Header, Footer } from "./components/Layout";
import { useStore } from "./context/StoreContext";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import SellerLogin from "./pages/SellerLogin";
import Signup from "./pages/Signup";
import MyOrders from "./pages/MyOrders";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import PaymentSuccess from "./pages/PaymentSuccess";
import { AddProduct, EditProduct } from "./pages/ProductForm";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function Guard({ children, admin = false }) {
  const { user } = useStore();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (admin && !["admin", "seller"].includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function ScrollReveals() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return undefined;
    const root = document.querySelector(".page-shell");
    if (!root) return undefined;
    const selector = "[data-reveal], .page-shell section";
    const observed = new WeakSet();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -32px 0px" });
    const register = (element) => {
      if (element.nodeType !== Node.ELEMENT_NODE) return;
      const targets = [];
      if (element.matches(selector)) targets.push(element);
      targets.push(...element.querySelectorAll(selector));
      targets.forEach((target) => {
        if (observed.has(target)) return;
        observed.add(target);
        observer.observe(target);
      });
    };
    register(root);
    const mutations = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach(register));
    });
    mutations.observe(root, { childList: true, subtree: true });
    return () => { mutations.disconnect(); observer.disconnect(); };
  }, []);
  return null;
}

export default function App() {
  return <><ScrollToTop /><ScrollReveals /><Header /><main className="page-shell"><Routes>
    <Route path="/" element={<Home />} /><Route path="/products" element={<Products />} /><Route path="/products/:id" element={<ProductDetails />} />
    <Route path="/cart" element={<Cart />} /><Route path="/checkout" element={<Guard><Checkout /></Guard>} />
    <Route path="/login" element={<Login />} /><Route path="/seller-login" element={<SellerLogin />} /><Route path="/signup" element={<Signup />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/orders" element={<Guard><MyOrders /></Guard>} /><Route path="/profile" element={<Guard><Profile /></Guard>} />
    <Route path="/payment/:status" element={<Guard><PaymentSuccess /></Guard>} />
    <Route path="/admin" element={<Guard admin><AdminDashboard /></Guard>} /><Route path="/admin/products/new" element={<Guard admin><AddProduct /></Guard>} />
    <Route path="/admin/products/:id/edit" element={<Guard admin><EditProduct /></Guard>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></main><Footer /></>;
}
