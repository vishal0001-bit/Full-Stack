import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowUpRight, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useStore } from "../context/StoreContext";

export default function Login() {
  const { login } = useStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await login(form); toast.success("Welcome back"); navigate(location.state?.from?.pathname || "/"); }
    catch (error) { toast.error(error.response?.data?.message || "Could not sign in. Check your details."); }
    finally { setBusy(false); }
  };
  return <AuthFrame label="Good to have you back" title={<>Your kind of<br /><em>everyday.</em></>} image="photo-1616486338812-3dadae4b4ace">
    <span className="eyebrow">WELCOME BACK</span><h2>Come on in.</h2><p className="auth-intro">Sign in to pick up right where you left off.</p>
    <form className="form-stack" onSubmit={submit}><label>Email address<input type="email" autoComplete="email" placeholder="you@example.com" value={form.email} required onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
      <label>Password<div className="password-wrap"><input type={show ? "text" : "password"} autoComplete="current-password" placeholder="Your password" value={form.password} required minLength={8} onChange={(e) => setForm({ ...form, password: e.target.value })} /><button type="button" onClick={() => setShow(!show)} aria-label="Toggle password visibility">{show ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
      <div className="forgot-row"><span>At least 8 characters</span><Link to="/forgot-password">Forgot password?</Link></div>
      <button className="button button-dark auth-submit" disabled={busy}>{busy ? "One moment..." : "Sign in"} <ArrowUpRight size={17} /></button>
    </form><p className="auth-switch">New around here? <Link to="/signup">Create an account</Link></p>
    <p className="auth-switch">Selling with us? <Link to="/seller-login">Seller sign in</Link></p>
  </AuthFrame>;
}

export function AuthFrame({ children, label, title, image = "photo-1616486338812-3dadae4b4ace" }) {
  return <section className="auth-page"><div className="auth-panel"><div className="auth-form-panel">{children}</div><div className="auth-visual"><img src={`https://images.unsplash.com/${image}?auto=format&fit=crop&w=1100&q=85`} alt="" /><div className="auth-visual-shade" /><span className="eyebrow light">{label}</span><h2>{title}</h2><span className="auth-visual-foot">A LITTLE MORE JOY IN EVERY DAY.</span></div></div></section>;
}
