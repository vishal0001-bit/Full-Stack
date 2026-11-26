import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useStore } from "../context/StoreContext";
import { AuthFrame } from "./Login";

export default function SellerLogin() {
  const { sellerLogin } = useStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await sellerLogin(form); toast.success("Welcome to your seller dashboard"); navigate("/admin"); }
    catch (error) { toast.error(error.response?.data?.message || "Could not sign in. Check your seller details."); }
    finally { setBusy(false); }
  };
  return <AuthFrame label="A good thing starts here" title={<>Your shop,<br /><em>your story.</em></>}>
    <span className="eyebrow">SELLER PORTAL</span><h2>Welcome back.</h2><p className="auth-intro">Sign in with your seller account to manage your collection.</p>
    <form className="form-stack" onSubmit={submit}><label>Seller email<input type="email" autoComplete="username" placeholder="seller@example.com" value={form.email} required onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
      <label>Password<div className="password-wrap"><input type={show ? "text" : "password"} autoComplete="current-password" placeholder="Your password" value={form.password} required minLength={8} onChange={(e) => setForm({ ...form, password: e.target.value })} /><button type="button" onClick={() => setShow(!show)} aria-label="Toggle password visibility">{show ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
      <button className="button button-dark auth-submit" disabled={busy}>{busy ? "One moment..." : "Sign in as seller"} <ArrowUpRight size={17} /></button>
    </form><p className="auth-switch">Shopping with us? <Link to="/login">Customer sign in</Link></p>
  </AuthFrame>;
}
