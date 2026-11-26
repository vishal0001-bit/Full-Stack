import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Check, Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { useStore } from "../context/StoreContext";
import { sampleProducts } from "../data/sampleProducts";

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart, user } = useStore();
  const samplePreview = id.startsWith("sample-");
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewBusy, setReviewBusy] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setProduct(null);
    setReviews([]);
    if (samplePreview) {
      setProduct(sampleProducts.find((item) => item._id === id) || null);
      setLoading(false);
      return () => { cancelled = true; };
    }
    api.get(`/products/${id}`)
      .then(({ data }) => { if (!cancelled) setProduct(data.product || data); })
      .catch((error) => { if (!cancelled) toast.error(error.response?.data?.message || "Could not load product"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    api.get(`/reviews/${id}`)
      .then(({ data }) => { if (!cancelled) setReviews(data.reviews || []); })
      .catch(() => { if (!cancelled) toast.error("Could not load product reviews"); });
    return () => { cancelled = true; };
  }, [id, samplePreview]);
  if (loading) return <div className="loading-page">Finding the good stuff...</div>;
  if (!product) return <div className="empty-state"><h2>We couldn’t find that one.</h2><Link className="button button-dark" to="/products">Back to the collection</Link></div>;
  const buyNow = async () => { if (!samplePreview && await addToCart(product._id, quantity)) navigate("/checkout"); };
  const submitReview = async (event) => {
    event.preventDefault();
    if (samplePreview) return;
    setReviewBusy(true);
    try {
      const { data } = await api.post(`/reviews/${id}`, reviewForm);
      setReviews((current) => [data.review, ...current]);
      setProduct((current) => ({ ...current, rating: ((current.rating || 0) * (current.reviewCount || 0) + Number(reviewForm.rating)) / ((current.reviewCount || 0) + 1), reviewCount: (current.reviewCount || 0) + 1 }));
      setReviewForm({ rating: 5, comment: "" });
      toast.success("Thanks for sharing a thoughtful review");
    } catch (error) { toast.error(error.response?.data?.message || "Could not submit your review"); }
    finally { setReviewBusy(false); }
  };
  return <section className="detail-page">
    <Link className="back-link" to="/products"><ArrowLeft size={16} /> Back to the collection</Link>
    <div className="detail-layout"><div className="detail-image"><img src={product.image || "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=700&q=80"} alt={product.name} onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=700&q=80"; }} /></div><div className="detail-copy">
      <span className="eyebrow">{product.category} · SHOP EASE EDIT</span><h1>{product.name}</h1><div className="detail-rating"><span>★ {Number(product.rating || 4.8).toFixed(1)}</span> <small>({product.reviewCount || 0} thoughtful reviews)</small></div>
      <strong className="detail-price">₹{Number(product.price).toLocaleString("en-IN")}</strong><p className="detail-description">{product.description}</p>
      {samplePreview && <p className="sample-notice">Sample preview only — use a live product from the collection to add to your bag or pay.</p>}
      <div className="stock-status"><Check size={15} /> {product.stock > 0 ? `${product.stock} in stock, ready for you` : "Currently out of stock"}</div>
      <div className="purchase-row"><div className="quantity-control"><button aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity(quantity - 1)}><Minus size={15} /></button><span>{quantity}</span><button aria-label="Increase quantity" disabled={quantity >= product.stock} onClick={() => setQuantity(quantity + 1)}><Plus size={15} /></button></div><button className="button button-dark add-large" disabled={samplePreview || product.stock < 1} onClick={() => addToCart(product._id, quantity)}>{samplePreview ? "Preview only" : `Add to bag — ₹${(product.price * quantity).toLocaleString("en-IN")}`} {!samplePreview && <ArrowUpRight size={17} />}</button></div>
      <button className="button button-outline buy-now" disabled={samplePreview || product.stock < 1} onClick={buyNow}>Buy it now</button>
      <div className="detail-perks"><div><Truck size={18} /><span>Free delivery over ₹1,999</span></div><div><ShieldCheck size={18} /><span>Simple, secure checkout</span></div></div>
      <div className="detail-note"><span>THE LITTLE DETAILS</span><p>{product.description}</p></div>
    </div></div>
      <section className="reviews-section"><div className="section-heading"><div><span className="eyebrow">GOOD WORDS FROM REAL PEOPLE</span><h2>A little <em>feedback.</em></h2></div><span className="detail-rating">★ {Number(product.rating || 4.8).toFixed(1)} <small> · {product.reviewCount || 0} reviews</small></span></div>
        {user && !samplePreview && <form className="review-form" onSubmit={submitReview}><label>Your rating<select value={reviewForm.rating} onChange={(event) => setReviewForm({ ...reviewForm, rating: Number(event.target.value) })}><option value="5">★★★★★ — Loved it</option><option value="4">★★★★ — Really good</option><option value="3">★★★ — Just right</option><option value="2">★★ — Could be better</option><option value="1">★ — Not for me</option></select></label><label>Your review<textarea value={reviewForm.comment} minLength={5} maxLength={1000} required placeholder="What did you think? Reviews are available after your order is delivered." onChange={(event) => setReviewForm({ ...reviewForm, comment: event.target.value })} /></label><button className="button button-dark" disabled={reviewBusy}>{reviewBusy ? "Sharing..." : "Share your thoughts"} <ArrowUpRight size={16} /></button></form>}
        {!reviews.length ? <p className="no-reviews">{samplePreview ? "Reviews are unavailable in the sample preview." : "No reviews just yet. A good thing is worth talking about."}</p> : <div className="review-grid">{reviews.map((review) => <article className="review-card" key={review._id}><span className="review-stars">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span><p>{review.comment}</p><div><strong>{review.user?.name || "ShopEase customer"}</strong><span>{new Date(review.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span></div></article>)}</div>}
      </section>
  </section>;
}
