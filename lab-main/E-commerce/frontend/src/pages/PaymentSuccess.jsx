import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowRight, Check, X } from "lucide-react";
import api from "../services/api";

export default function PaymentSuccess() {
  const { status } = useParams();
  const location = useLocation();
  const orderId = new URLSearchParams(location.search).get("orderId");
  const [order, setOrder] = useState(null);
  useEffect(() => { if (orderId && status === "success") api.get(`/orders/${orderId}`).then(({ data }) => setOrder(data.order || data)).catch(() => setOrder(null)); }, [orderId, status]);
  const success = status === "success";
  return <section className="result-page"><div className={`result-icon ${success ? "success-icon" : "failure-icon"}`}>{success ? <Check size={30} /> : <X size={30} />}</div><span className="eyebrow">{success ? "IT’S OFFICIALLY YOURS" : "A LITTLE DETOUR"}</span><h1>{success ? <>Good things are <em>on their way.</em></> : <>Payment didn’t quite <em>go through.</em></>}</h1><p>{success ? "Your order is in good hands. We’ll take it from here and get everything moving." : "Your order wasn’t paid. You can try again from your orders or choose cash on delivery."}</p>{order && <div className="result-order"><span>ORDER REFERENCE</span><strong>{order._id}</strong><span>ORDER TOTAL</span><strong>₹{Number(order.total).toLocaleString("en-IN")}</strong></div>}<div className="result-actions"><Link className="button button-dark" to="/orders">{success ? "See my orders" : "Go to my orders"} <ArrowRight size={17} /></Link><Link className="text-link" to="/products">Keep exploring</Link></div></section>;
}
