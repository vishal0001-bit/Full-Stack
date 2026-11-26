import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Box, ClipboardList, IndianRupee, PackagePlus, Users } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = () => Promise.all([api.get("/admin/stats"), api.get("/products?limit=100"), api.get("/admin/orders"), api.get("/admin/payments")])
    .then(([statsRes, productRes, orderRes, paymentRes]) => {
      setStats(statsRes.data.stats || statsRes.data);
      setProducts(productRes.data.products || productRes.data);
      setOrders(orderRes.data.orders || orderRes.data);
      setPayments(paymentRes.data.payments || []);
    }).catch((error) => toast.error(error.response?.data?.message || "Could not load seller dashboard")).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const updateStatus = async (id, status) => {
    try { await api.patch(`/admin/orders/${id}`, { status }); toast.success("Order status updated"); load(); }
    catch (error) { toast.error(error.response?.data?.message || "Could not update order"); }
  };
  const removeProduct = async (id) => {
    if (!window.confirm("Remove this product from the store?")) return;
    try { await api.delete(`/products/${id}`); toast.success("Product removed"); load(); }
    catch (error) { toast.error(error.response?.data?.message || "Could not remove product"); }
  };
  const metrics = stats ? [
    { title: "Total sales", value: money(stats.totalSales), icon: IndianRupee },
    { title: "Orders", value: stats.totalOrders, icon: ClipboardList },
    { title: "Products", value: stats.totalProducts, icon: Box },
    { title: "Customers", value: stats.totalCustomers, icon: Users },
  ] : [];
  return <section className="admin-page"><div className="admin-heading"><div><span className="eyebrow">YOUR LITTLE CORNER OF SHOP EASE</span><h1>A good day to <em>make things.</em></h1><p>Keep an eye on the good stuff, all in one place.</p></div><Link className="button button-dark" to="/admin/products/new"><PackagePlus size={17} /> Add a product <ArrowUpRight size={16} /></Link></div>
    {loading ? <div className="loading-page">Setting up your dashboard...</div> : <>
      <div className="metrics-grid">{metrics.map(({ title, value, icon: Icon }) => <article className="metric-card" key={title}><span className="metric-icon"><Icon size={18} /></span><span className="eyebrow">{title}</span><strong>{value}</strong><span className="metric-caption"><ArrowDownRight size={14} /> Your store, at a glance</span></article>)}</div>
      <section className="admin-section"><div className="admin-section-title"><div><span className="eyebrow">YOUR COLLECTION</span><h2>All the good things.</h2></div><Link to="/admin/products/new" className="text-link">Add a find <ArrowUpRight size={15} /></Link></div>
        <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>PRODUCT</th><th>CATEGORY</th><th>PRICE</th><th>STOCK</th><th></th></tr></thead><tbody>{products.map((product) => <tr key={product._id}><td><div className="table-product"><img src={product.image} alt="" /><span>{product.name}</span></div></td><td>{product.category}</td><td>{money(product.price)}</td><td><span className={product.stock < 5 ? "low-stock" : ""}>{product.stock}</span></td><td><div className="table-actions"><Link to={`/admin/products/${product._id}/edit`}>Edit</Link><button onClick={() => removeProduct(product._id)}>Remove</button></div></td></tr>)}{!products.length && <tr><td colSpan="5">No products yet. Add something lovely to get started.</td></tr>}</tbody></table></div>
      </section>
      <section className="admin-section"><div className="admin-section-title"><div><span className="eyebrow">PAYMENT ACTIVITY</span><h2>Money matters, clearly.</h2></div></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>ORDER</th><th>CUSTOMER</th><th>METHOD</th><th>AMOUNT</th><th>PAYMENT STATUS</th><th>PROVIDER REFERENCE</th></tr></thead><tbody>{payments.map((payment) => <tr key={payment._id}><td>#{String(payment.order?._id || payment.order || "").slice(-8).toUpperCase()}</td><td>{payment.user?.name || "Customer"}</td><td>{payment.method === "cod" ? "Cash on delivery" : "Razorpay"}</td><td>{money(payment.amount)}</td><td>{payment.status}</td><td>{payment.providerPaymentId || payment.providerOrderId || "—"}</td></tr>)}{!payments.length && <tr><td colSpan="6">No payment activity just yet.</td></tr>}</tbody></table></div></section>
      <section className="admin-section"><div className="admin-section-title"><div><span className="eyebrow">COMING TO SOMEONE LOVELY</span><h2>Orders to look after.</h2></div></div>
        <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>ORDER</th><th>CUSTOMER</th><th>DATE</th><th>TOTAL</th><th>PAYMENT</th><th>STATUS</th></tr></thead><tbody>{orders.map((order) => <tr key={order._id}><td>#{order._id.slice(-8).toUpperCase()}</td><td>{order.user?.name || "Customer"}</td><td>{new Date(order.createdAt).toLocaleDateString("en-IN")}</td><td>{money(order.total)}</td><td>{order.paymentStatus}</td><td><select className="status-select" value={order.status} onChange={(e) => updateStatus(order._id, e.target.value)}><option value="pending">Pending</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select></td></tr>)}{!orders.length && <tr><td colSpan="6">No orders just yet.</td></tr>}</tbody></table></div>
      </section>
    </>}
  </section>;
}
