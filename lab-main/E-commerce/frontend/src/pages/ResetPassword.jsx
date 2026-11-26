import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const token = params.get("token") || "";
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post("/auth/reset-password", { token, password });
      toast.success(data.message);
      navigate("/login");
    } catch (error) { toast.error(error.response?.data?.message || "Could not reset your password"); }
    finally { setBusy(false); }
  };
  return <section className="simple-form-page"><div className="simple-form-card"><Link to="/login" className="back-link"><ArrowLeft size={16} /> Back to sign in</Link><span className="eyebrow">A LITTLE RESET</span><h1>Choose a <em>new password.</em></h1><p>Make it at least 8 characters. Your old password won’t work after this.</p><form className="form-stack" onSubmit={submit}><label>New password<input type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" /></label><button className="button button-dark auth-submit" disabled={busy || !token}>{busy ? "Updating..." : "Update password"} <ArrowUpRight size={17} /></button></form></div></section>;
}
