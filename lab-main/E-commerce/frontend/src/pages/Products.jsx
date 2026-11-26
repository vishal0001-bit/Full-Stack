import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import api from "../services/api";
import { ProductGrid } from "../components/Layout";
import { filterSampleProducts, sampleProducts } from "../data/sampleProducts";

export default function Products() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sampleMode, setSampleMode] = useState(false);
  const search = params.get("search") || "";
  const category = params.get("category") || "";
  const sort = params.get("sort") || "popular";
  const maxPrice = params.get("maxPrice") || "";

  useEffect(() => {
    api.get("/products/categories").then(({ data }) => setCategories(data.categories || data)).catch(() => setCategories([...new Set(sampleProducts.map((product) => product.category))]));
  }, []);
  useEffect(() => {
    setLoading(true);
    api.get("/products", { params: { search, category, sort, maxPrice: maxPrice || undefined } })
      .then(({ data }) => { setProducts(data.products || data); setSampleMode(false); })
      .catch(() => { setProducts(filterSampleProducts({ search, category, sort, maxPrice })); setSampleMode(true); })
      .finally(() => setLoading(false));
  }, [search, category, sort, maxPrice]);
  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next);
  };
  return <section className="catalog-page" data-reveal>
    <div className="catalog-heading"><div><span className="eyebrow">The good stuff</span><h1>{search ? <>Search results for <em>“{search}”</em></> : category ? <>{category}, with <em>feeling.</em></> : <>All the things you’ll <em>love.</em></>}</h1><p>Considered finds for your home, your everyday, and everything in between.</p></div><span className="result-count">{products.length} FINDS</span></div>
    {sampleMode && <p className="sample-notice">Sample catalogue preview — connect the API to shop live inventory.</p>}
    <div className="filter-bar"><div className="filter-label"><SlidersHorizontal size={16} /> Find your fit</div><select aria-label="Filter by category" value={category} onChange={(e) => setFilter("category", e.target.value)}><option value="">All categories</option>{categories.map((value) => <option key={value} value={value}>{value}</option>)}</select><select aria-label="Filter by maximum price" value={maxPrice} onChange={(e) => setFilter("maxPrice", e.target.value)}><option value="">Any price</option><option value="1000">Under ₹1,000</option><option value="2500">Under ₹2,500</option><option value="5000">Under ₹5,000</option></select><select aria-label="Sort products" value={sort} onChange={(e) => setFilter("sort", e.target.value)}><option value="popular">Most loved</option><option value="newest">Just in</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></div>
    <ProductGrid products={products} loading={loading} disablePurchase={sampleMode} />
  </section>;
}
