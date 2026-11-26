import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const initialForm = { name: '', price: '', rating: '' };

function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch(`${API_URL}/api/products`);
        if (!response.ok) throw new Error('Could not load products.');
        setProducts(await response.json());
      } catch {
        setError('Could not connect to the product API. Make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          price: Number(form.price),
          rating: Number(form.rating),
        }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Could not add product.');

      setProducts((currentProducts) => [...currentProducts, data]);
      setForm(initialForm);
    } catch (submitError) {
      setError(submitError.message || 'Could not connect to the product API.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Productly home">
          <span className="brand-mark">P</span>
          Productly
        </a>
        <span className="topbar-note">PRODUCT CATALOG</span>
      </header>

      <section className="intro">
        <div>
          <p className="eyebrow">YOUR INVENTORY, AT A GLANCE</p>
          <h1>Products</h1>
          <p className="description">Browse your catalog or add a new product.</p>
        </div>
        <div className="product-count">
          <strong>{products.length}</strong>
          <span>{products.length === 1 ? 'product' : 'products'}</span>
        </div>
      </section>

      {error && <p className="message error" role="alert">{error}</p>}

      <div className="content-grid">
        <section className="catalog" aria-labelledby="catalog-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">THE COLLECTION</p>
              <h2 id="catalog-heading">All products</h2>
            </div>
          </div>

          {loading ? (
            <p className="empty-state">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="empty-state">No products yet. Add one to get started.</p>
          ) : (
            <div className="product-list">
              {products.map((product) => (
                <article className="product-card" key={product.id}>
                  <div className="product-icon" aria-hidden="true">
                    {product.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <span className="product-id">ID&nbsp; #{product.id}</span>
                  </div>
                  <div className="product-rating" aria-label={`Rating ${product.rating} out of 5`}>
                    <span aria-hidden="true">★</span> {Number(product.rating).toFixed(1)}
                  </div>
                  <strong className="product-price">
                    {Number(product.price).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })}
                  </strong>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="form-panel">
          <p className="eyebrow">GROW YOUR CATALOG</p>
          <h2>Add a product</h2>
          <p className="form-description">Fill in the details below to add a product to your collection.</p>
          <form onSubmit={handleSubmit}>
            <label htmlFor="name">Product name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="e.g. Studio headphones"
              value={form.name}
              onChange={handleChange}
              maxLength={100}
              required
            />

            <label htmlFor="price">Price (USD)</label>
            <div className="input-prefix">
              <span aria-hidden="true">$</span>
              <input
                id="price"
                name="price"
                type="number"
                placeholder="0.00"
                value={form.price}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                required
              />
            </div>

            <label htmlFor="rating">Rating (0–5)</label>
            <input
              id="rating"
              name="rating"
              type="number"
              placeholder="e.g. 4.5"
              value={form.rating}
              onChange={handleChange}
              min="0"
              max="5"
              step="0.1"
              required
            />

            <button type="submit" disabled={saving || loading}>
              {saving ? 'Adding product...' : 'Add product'}
              {!saving && <span aria-hidden="true">→</span>}
            </button>
          </form>
        </aside>
      </div>
    </main>
  );
}

export default App;
