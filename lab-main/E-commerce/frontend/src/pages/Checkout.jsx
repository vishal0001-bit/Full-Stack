import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { useStore } from "../context/StoreContext";

const initialAddress = { fullName: "", phone: "", line1: "", city: "", state: "", postalCode: "" };
const money = (value) => `₹${Number(value).toLocaleString("en-IN")}`;
let razorpayScript;

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();
  if (!razorpayScript) {
    razorpayScript = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => window.Razorpay ? resolve() : reject(new Error("Razorpay checkout could not be loaded"));
      script.onerror = () => reject(new Error("Razorpay checkout could not be loaded. Please try cash on delivery."));
      document.body.appendChild(script);
    });
  }
  return razorpayScript;
}

export default function Checkout() {
  const { user, cart, subtotal, refreshCart } = useStore();
  const [address, setAddress] = useState(() => {
    const saved = user?.addresses?.[0];
    return saved ? { fullName: saved.fullName, phone: saved.phone, line1: saved.line1, city: saved.city, state: saved.state, postalCode: saved.postalCode } : { ...initialAddress, fullName: user?.name || "", phone: user?.phone || "" };
  });
  const [method, setMethod] = useState("cod");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const delivery = subtotal === 0 || subtotal >= 1999 ? 0 : 99;
  const update = (key, value) => setAddress((current) => ({ ...current, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!cart.length) { toast.error("Your bag is empty"); navigate("/cart"); return; }
    setBusy(true);
    let orderId;
    try {
      const { data } = await api.post("/orders", { shippingAddress: address, paymentMethod: method });
      orderId = data.order._id;
      if (method === "cod") {
        await refreshCart();
        navigate(`/payment/success?orderId=${data.order._id}`);
      } else {
        const orderResponse = await api.post("/payments/razorpay/order", { orderId: data.order._id });
        const { keyId, razorpayOrderId } = orderResponse.data;
        await loadRazorpay();
        const checkout = new window.Razorpay({
          key: keyId, amount: Math.round(data.order.total * 100), currency: "INR",
          name: "ShopEase", description: `Order ${data.order._id}`, order_id: razorpayOrderId,
          handler: async (response) => {
            try {
              await api.post("/payments/razorpay/verify", { ...response, orderId: data.order._id });
              await refreshCart();
              navigate(`/payment/success?orderId=${data.order._id}`);
            } catch (error) { navigate(`/payment/failure?orderId=${data.order._id}`); toast.error(error.response?.data?.message || "Payment verification failed"); }
          },
          modal: { ondismiss: async () => {
            try { await api.post("/orders/cancel-unpaid", { orderId: data.order._id }); await refreshCart(); }
            catch (error) { toast.error(error.response?.data?.message || "Could not cancel the unpaid order"); }
            setBusy(false);
            navigate(`/payment/failure?orderId=${data.order._id}`);
          } },
          prefill: { name: address.fullName, email: user?.email, contact: address.phone },
          theme: { color: "#243b31" },
        });
        checkout.open();
        return;
      }
    } catch (error) {
      if (method === "razorpay" && orderId) {
        try { await api.post("/orders/cancel-unpaid", { orderId }); await refreshCart(); }
        catch (cancelError) { toast.error(cancelError.response?.data?.message || "The unpaid order could not be cancelled"); }
      }
      toast.error(error.response?.data?.message || error.message || "Could not place your order");
    }
    finally { setBusy(false); }
  };
  if (!cart.length) return <div className="empty-state"><h2>Your bag is waiting for something good.</h2><Link className="button button-dark" to="/products">Explore the collection</Link></div>;
  const fields = [["fullName", "Full name"], ["phone", "Phone number"], ["line1", "Street address"], ["city", "City"], ["state", "State"], ["postalCode", "PIN code"]];
  return <section className="checkout-page">
    <Link to="/cart" className="back-link"><ArrowLeft size={16} /> Back to your bag</Link><div className="page-title-row"><div><span className="eyebrow">THE GOOD STUFF IS ALMOST YOURS</span><h1>Make it <em>yours.</em></h1></div></div>
    <form className="checkout-layout" onSubmit={submit}><div className="checkout-main"><section className="checkout-card"><span className="step-number">01</span><div><h2>Where should we send it?</h2><p className="checkout-helper">Your finds are going somewhere lovely.</p></div><div className="address-grid">{fields.map(([key, label]) => <label key={key} className={key === "line1" ? "field-wide" : ""}>{label}<input required maxLength={key === "line1" ? 160 : 80} value={address[key]} onChange={(e) => update(key, e.target.value)} autoComplete={key === "fullName" ? "name" : key === "phone" ? "tel" : key === "line1" ? "street-address" : "off"} /></label>)}</div></section>
      <section className="checkout-card payment-card"><span className="step-number">02</span><div><h2>How would you like to pay?</h2><p className="checkout-helper">Simple, secure, and totally up to you.</p></div><label className={`payment-option ${method === "cod" ? "selected" : ""}`}><input type="radio" name="payment" value="cod" checked={method === "cod"} onChange={() => setMethod("cod")} /><span><strong>Cash on delivery</strong><small>Pay when your good things arrive</small></span><span className="radio-dot" /></label><label className={`payment-option ${method === "razorpay" ? "selected" : ""}`}><input type="radio" name="payment" value="razorpay" checked={method === "razorpay"} onChange={() => setMethod("razorpay")} /><span><strong>Pay online with Razorpay</strong><small>UPI, cards & net banking · Secure payment</small></span><span className="radio-dot" /></label></section>
      </div><aside className="order-summary checkout-summary"><span className="eyebrow">A QUICK RECAP</span><h2>Your lovely finds.</h2><div className="checkout-items">{cart.map(({ product, quantity }) => product && <div className="checkout-item" key={product._id}><img src={product.image} alt="" /><span>{product.name}<small>Qty: {quantity}</small></span><strong>{money(product.price * quantity)}</strong></div>)}</div><div className="summary-line"><span>Subtotal</span><span>{money(subtotal)}</span></div><div className="summary-line"><span>Delivery</span><span>{delivery ? money(delivery) : "On us"}</span></div><div className="summary-line summary-total"><span>Total</span><strong>{money(subtotal + delivery)}</strong></div><button className="button button-dark checkout-cta" disabled={busy}>{busy ? "Getting everything ready..." : "Place my order"} <ArrowUpRight size={17} /></button><p className="secure-note"><ShieldCheck size={14} /> Your details stay safe with us.</p></aside></form>
  </section>;
}
