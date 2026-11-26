import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";

const blank = { name: "", description: "", price: "", category: "", image: "", stock: "", badge: "" };

function ProductForm({ editing = false }) {
  const { id } = useParams();
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (editing) api.get(`/products/${id}`).then(({ data }) => {
      const product = data.product || data;
      setForm({ name: product.name, description: product.description, price: product.price, category: product.category, image: product.image, stock: product.stock, badge: product.badge || "" });
    }).catch((error) => toast.error(error.response?.data?.message || "Could not load product"));
  }, [editing, id]);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const uploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Images must be 5 MB or smaller"); event.target.value = ""; return; }
    const payload = new FormData();
    payload.append("image", file);
    setUploadBusy(true);
    try {
      const { data } = await api.post("/uploads", payload);
      update("image", new URL(data.image, api.defaults.baseURL).toString());
      toast.success("Image uploaded");
    } catch (error) { toast.error(error.response?.data?.message || "Could not upload image"); }
    finally { setUploadBusy(false); event.target.value = ""; }
  };
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    const body = { ...form, price: Number(form.price), stock: Number(form.stock) };
    try {
      if (editing) await api.patch(`/products/${id}`, body);
      else await api.post("/products", body);
      toast.success(editing ? "Product updated" : "Your new find is live");
      navigate("/admin");
    } catch (error) { toast.error(error.response?.data?.message || "Could not save product"); }
    finally { setBusy(false); }
  };
  return <section className="product-form-page"><Link to="/admin" className="back-link"><ArrowLeft size={16} /> Back to your dashboard</Link><div className="form-page-heading"><span className="eyebrow">THE GOOD STUFF, CURATED</span><h1>{editing ? <>A little <em>refresh.</em></> : <>Make room for <em>something good.</em></>}</h1><p>{editing ? "Give this find a quick update." : "Add a new find to your ShopEase collection."}</p></div><form onSubmit={submit} className="product-editor">
    <div className="editor-main"><label>Product name<input value={form.name} required minLength={2} maxLength={120} onChange={(e) => update("name", e.target.value)} /></label><label>Short description<textarea rows="5" value={form.description} required maxLength={2000} onChange={(e) => update("description", e.target.value)} /></label><div className="editor-row"><label>Price (₹)<input type="number" min="1" step="0.01" value={form.price} required onChange={(e) => update("price", e.target.value)} /></label><label>Available stock<input type="number" min="0" step="1" value={form.stock} required onChange={(e) => update("stock", e.target.value)} /></label></div></div>
    <div className="editor-side"><label>Category<input placeholder="Home, Accessories, Tech..." value={form.category} required maxLength={60} onChange={(e) => update("category", e.target.value)} /></label><label>Image URL<input type="url" placeholder="https://..." value={form.image} required onChange={(e) => update("image", e.target.value)} /></label><label>Or upload a JPG, PNG, or WebP (max 5 MB)<input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadImage} disabled={uploadBusy} /></label>{uploadBusy && <span className="upload-status">Uploading your image...</span>}{form.image && <img className="editor-preview" src={form.image} alt="Product preview" onError={(e) => { e.currentTarget.style.display = "none"; }} />}<label>Small badge <span className="optional">(optional)</span><input placeholder="A little favorite, New in..." value={form.badge} maxLength={24} onChange={(e) => update("badge", e.target.value)} /></label><button className="button button-dark" disabled={busy || uploadBusy}>{busy ? "Saving..." : editing ? "Save these changes" : "Add to the collection"} <ArrowUpRight size={17} /></button></div>
  </form></section>;
}

export function AddProduct() { return <ProductForm />; }
export function EditProduct() { return <ProductForm editing />; }
