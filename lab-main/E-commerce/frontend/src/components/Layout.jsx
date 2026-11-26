import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ArrowUpRight, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useStore } from "../context/StoreContext";

export function Header() {
  const { user, cartCount } = useStore();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const submit = (event) => {
    event.preventDefault();
    navigate(`/products${query.trim() ? `?search=${encodeURIComponent(query.trim())}` : ""}`);
    setMenuOpen(false);
  };
  return <>
    <div className="announcement">A little something for your everyday <span>— free delivery over ₹1,999</span></div>
    <header className="site-header">
      <button className="icon-btn mobile-menu" aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
      <Link to="/" className="brand"><span className="brand-mark">s.</span> shopease<span className="brand-period">.</span></Link>
      <nav className={`main-nav ${menuOpen ? "nav-open" : ""}`} onClick={() => setMenuOpen(false)}>
        <NavLink to="/products">Shop all</NavLink><NavLink to="/products?category=Home">Home</NavLink>
        <NavLink to="/products?category=Accessories">Accessories</NavLink><NavLink to="/products?category=Tech">Tech</NavLink>
      </nav>
      <form className="search-box" onSubmit={submit}><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for anything..." aria-label="Search products" /><button aria-label="Submit search"><ArrowUpRight size={16} /></button></form>
      <div className="header-actions">
        <Link className="header-icon" to={user ? "/profile" : "/login"} aria-label="Account"><UserRound size={20} /><span className="action-label">{user ? user.name.split(" ")[0] : "Account"}</span></Link>
        <Link className="header-icon" to="/cart" aria-label="Shopping bag"><ShoppingBag size={20} /><span className="action-label">Bag</span>{cartCount > 0 && <span className="cart-dot">{cartCount}</span>}</Link>
      </div>
    </header>
  </>;
}

export function Footer() {
  return <footer className="footer">
    <div className="footer-main">
      <div><Link to="/" className="brand footer-brand"><span className="brand-mark">s.</span> shopease<span className="brand-period">.</span></Link><p>Thoughtful finds for the way you live.<br />A little more joy in every day.</p></div>
      <div><h4>Explore</h4><Link to="/products">Shop everything</Link><Link to="/products?category=Home">Home & living</Link><Link to="/products?category=Accessories">Accessories</Link></div>
      <div><h4>Need a hand?</h4><a href="mailto:hello@shopease.example">hello@shopease.example</a><Link to="/orders">Track your order</Link><Link to="/profile">Your account</Link></div>
      <div className="newsletter"><h4>Good things, occasionally.</h4><p>Have a question, a thought, or just want to say hello? We’re always happy to hear from you.</p><a className="footer-contact-link" href="mailto:hello@shopease.example">hello@shopease.example <ArrowUpRight size={15} /></a></div>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} ShopEase. Made for everyday living.</span><span>Secure checkout · Thoughtful shopping</span></div>
  </footer>;
}

export function ProductCard({ product, onAdd, disablePurchase = false }) {
  const { addToCart } = useStore();
  const [adding, setAdding] = useState(false);
  const add = async () => {
    if (disablePurchase) return;
    setAdding(true);
    try { await (onAdd ? onAdd() : addToCart(product._id)); }
    finally { setAdding(false); }
  };
  return <article className="product-card" data-reveal>
    <Link to={`/products/${product._id}`} className="product-image-wrap">
      {product.badge && <span className="product-badge">{product.badge}</span>}
      <img
        loading="lazy"
        src={product.image || "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=700&q=80"}
        alt={product.name}
        onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=700&q=80"; }}
      />
    </Link>
    <div className="product-info"><div><span className="product-category">{product.category}</span><Link to={`/products/${product._id}`}><h3>{product.name}</h3></Link></div><strong>₹{Number(product.price).toLocaleString("en-IN")}</strong></div>
    <div className="product-meta"><span>★ {Number(product.rating || 4.8).toFixed(1)} <small>({product.reviewCount || 0})</small></span><button onClick={add} disabled={disablePurchase || adding}>{disablePurchase ? "Preview only" : adding ? "Adding..." : "Add to bag"} {!disablePurchase && !adding && <ArrowUpRight size={14} />}</button></div>
  </article>;
}

export function ProductGrid({ products, loading, disablePurchase = false }) {
  if (loading) return <div className="loading-grid">{[1, 2, 3, 4].map((n) => <div className="skeleton" key={n} />)}</div>;
  if (!products?.length) return <div className="empty-state"><span>⌕</span><h3>Nothing here just yet</h3><p>Try another search or explore all our finds.</p><Link className="button button-dark" to="/products">Explore everything</Link></div>;
  return <div className="product-grid">{products.map((product) => <ProductCard key={product._id} product={product} disablePurchase={disablePurchase} />)}</div>;
}
