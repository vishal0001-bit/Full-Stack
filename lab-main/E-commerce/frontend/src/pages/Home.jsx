import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Leaf, PackageCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { ProductGrid } from "../components/Layout";
import { sampleProducts } from "../data/sampleProducts";

const heroImages = [
  "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=2000&q=88",
  "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=2000&q=88",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=88",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2000&q=88",
];

const categories = [
  { name: "Home", caption: "Make room for calm", image: "photo-1600210492486-724fe5c67fb0" },
  { name: "Accessories", caption: "The little details", image: "photo-1490481651871-ab68de25d43d" },
  { name: "Tech", caption: "Everyday, upgraded", image: "photo-1498049794561-7780e7231661" },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sampleMode, setSampleMode] = useState(false);
  const [currentHero, setCurrentHero] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroImages.length);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    api.get("/products?limit=8&sort=popular").then(({ data }) => setProducts(data.products || data))
      .then(() => setSampleMode(false))
      .catch(() => { setProducts(sampleProducts); setSampleMode(true); }).finally(() => setLoading(false));
  }, []);
  return <>
    <section className="hero">
      {heroImages.map((src, index) => (
        <img
          key={src}
          className={`hero-image ${index === currentHero ? "active" : ""}`}
          src={src}
          alt={`ShopEase Hero Slide ${index + 1}`}
        />
      ))}
      <div className="hero-shade" />
      <div className="hero-copy"><span className="eyebrow light"><Sparkles size={14} /> A fresh kind of everyday</span><h1>Find your<br /><em>everyday.</em></h1><p>Thoughtful pieces for the spaces you love and the life you live.</p><Link className="button button-light" to="/products">Discover the collection <ArrowUpRight size={17} /></Link></div>
      <span className="hero-side-note">GOOD DESIGN, GOOD DAYS · EST. 2024</span>
      <a href="#discover" className="hero-scroll"><ArrowDownRight size={17} /> SCROLL TO EXPLORE</a>
      <div className="hero-indicators">
        {heroImages.map((_, index) => (
          <button
            key={index}
            className={`hero-indicator ${index === currentHero ? "active" : ""}`}
            onClick={() => setCurrentHero(index)}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
    <section className="value-strip"><div><Leaf /><span>Thoughtful by design</span></div><div><PackageCheck /><span>Free delivery over ₹1,999</span></div><div><Sparkles /><span>Made for everyday joy</span></div></section>
    <section id="discover" className="section-block categories-section" data-reveal>
      <div className="section-heading"><div><span className="eyebrow">A good place to start</span><h2>Find your kind of <em>good.</em></h2></div><Link className="text-link" to="/products">All collections <ArrowRight size={16} /></Link></div>
      <div className="category-grid">{categories.map((category, index) => <Link className={`category-card category-${index + 1}`} to={`/products?category=${category.name}`} key={category.name} data-reveal style={{ "--reveal-delay": `${index * 90}ms` }}>
        <img loading="lazy" src={`https://images.unsplash.com/${category.image}?auto=format&fit=crop&w=900&q=82`} alt="" /><span className="category-number">0{index + 1}</span><div><span>{category.caption}</span><h3>{category.name}</h3></div><span className="category-arrow"><ArrowUpRight size={19} /></span>
      </Link>)}</div>
    </section>
    <section className="section-block featured-section" data-reveal>
      <div className="section-heading"><div><span className="eyebrow">Good things, picked for you</span><h2>Worth a closer <em>look.</em></h2></div><Link className="text-link" to="/products">Shop all finds <ArrowRight size={16} /></Link></div>
      {sampleMode && <p className="sample-notice">You’re browsing the sample collection. Connect the API for live products and checkout.</p>}
      <ProductGrid products={products} loading={loading} disablePurchase={sampleMode} />
    </section>
    <section className="promo-band" data-reveal><div className="promo-copy"><span className="eyebrow light">A little treat from us</span><h2>Make everyday<br />a little more <em>you.</em></h2><p>Discover considered essentials that feel like they’ve always belonged.</p><Link className="button button-light" to="/products">Find your favorite <ArrowUpRight size={17} /></Link></div><img loading="lazy" src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=85" alt="A calm, sunlit living space" /></section>
    <section className="quote-strip" data-reveal><span>“</span><p>The best things aren’t just useful. They make you feel good about the everyday.</p><span className="eyebrow">THE SHopease WAY</span></section>
  </>;
}
