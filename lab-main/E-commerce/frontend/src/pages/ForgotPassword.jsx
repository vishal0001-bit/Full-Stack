import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setSent(true);
      toast.success(data.message);
    } catch (error) { toast.error(error.response?.data?.message || "Could not request a password reset"); }
    finally { setBusy(false); }
  };
  return <section className="simple-form-page"><div className="simple-form-card"><Link to="/login" className="back-link"><ArrowLeft size={16} /> Back to sign in</Link><span className="eyebrow">A FRESH START</span><h1>Forgot your <em>password?</em></h1><p>Share your email and we’ll send you a secure link to set a new one.</p>{sent ? <div className="form-success">If there’s a ShopEase account for that email, a reset link is on its way. The link expires in 30 minutes.</div> : <form className="form-stack" onSubmit={submit}><label>Email address<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label><button className="button button-dark auth-submit" disabled={busy}>{busy ? "Sending..." : "Send reset link"} <ArrowUpRight size={17} /></button></form>}</div></section>;
}
