import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import toast from "react-hot-toast";
import { useStore } from "../context/StoreContext";
import { AuthFrame } from "./Login";

export default function Signup() {
  const { register } = useStore();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await register(form); toast.success("Your ShopEase account is ready"); navigate("/"); }
    catch (error) { toast.error(error.response?.data?.message || "Could not create your account"); }
    finally { setBusy(false); }
  };
  return <AuthFrame label="A good thing starts here" title={<>Make space for<br /><em>the good.</em></>}>
    <span className="eyebrow">YOUR NEW FAVORITE PLACE</span><h2>Let’s get to know you.</h2><p className="auth-intro">A few details and you’re right at home.</p>
    <form className="form-stack" onSubmit={submit}><label>Your name<input autoComplete="name" placeholder="What should we call you?" value={form.name} required minLength={2} maxLength={60} onChange={(e) => update("name", e.target.value)} /></label>
      <label>Email address<input type="email" autoComplete="email" placeholder="you@example.com" value={form.email} required onChange={(e) => update("email", e.target.value)} /></label>
      <label>Create a password<input type="password" autoComplete="new-password" placeholder="At least 8 characters" value={form.password} required minLength={8} onChange={(e) => update("password", e.target.value)} /></label>
      <button className="button button-dark auth-submit" disabled={busy}>{busy ? "Creating your account..." : "Create account"} <ArrowUpRight size={17} /></button>
    </form><p className="auth-switch">Already one of us? <Link to="/login">Sign in</Link></p>
  </AuthFrame>;
}
