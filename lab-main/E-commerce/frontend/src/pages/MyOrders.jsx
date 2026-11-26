import { useEffect, useState } from "react";
import { ArrowUpRight, PackageCheck } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = () => api.get("/orders/mine").then(({ data }) => setOrders(data.orders || data)).catch((error) => toast.error(error.response?.data?.message || "Could not load orders")).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const cancel = async (id) => {
    try { await api.patch(`/orders/${id}/cancel`); toast.success("Order cancelled"); load(); }
    catch (error) { toast.error(error.response?.data?.message || "This order can no longer be cancelled"); }
  };
  return <section className="orders-page"><div className="page-title-row"><div><span className="eyebrow">THE GOOD THINGS, TRACKED</span><h1>Your orders <em>so far.</em></h1></div></div>
    {loading ? <div className="loading-page">Gathering your orders...</div> : !orders.length ? <div className="cart-empty"><div className="empty-bag-icon"><PackageCheck size={28} /></div><h2>Your next favorite is out there.</h2><p>Once you find something good, it’ll show up right here.</p><Link className="button button-dark" to="/products">Find your first favorite <ArrowUpRight size={17} /></Link></div> :
      <div className="orders-list">{orders.map((order) => <article className="order-card" key={order._id}><div className="order-top"><div><span className="eyebrow">ORDER PLACED</span><strong>{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong></div><div><span className="eyebrow">TOTAL</span><strong>₹{Number(order.total).toLocaleString("en-IN")}</strong></div><div className="order-id"><span className="eyebrow">ORDER REFERENCE</span><strong>#{order._id.slice(-8).toUpperCase()}</strong></div><span className={`status-pill status-${order.status}`}>{order.status}</span></div><div className="order-products">{order.items.map((item, index) => <div className="order-product" key={`${item.name}-${index}`}><img src={item.image} alt={item.name} /><span><strong>{item.name}</strong><small>Qty {item.quantity} · ₹{Number(item.price).toLocaleString("en-IN")} each</small></span></div>)}</div><div className="order-bottom"><span>Payment: {order.paymentStatus} · {order.paymentMethod === "cod" ? "Cash on delivery" : "Razorpay"}</span><span className="order-tracking"><PackageCheck size={16} /> {order.status}</span>{order.status === "pending" && <button className="remove-item" onClick={() => cancel(order._id)}>Cancel order</button>}</div></article>)}</div>}
  </section>;
}
