import { useEffect, useState } from "react";
import { ArrowUpRight, LogOut, Save, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { useStore } from "../context/StoreContext";

export default function Profile() {
  const { user, logout, setUserData } = useStore();
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [addressForm, setAddressForm] = useState({ label: "Home", fullName: user?.name || "", phone: user?.phone || "", line1: "", city: "", state: "", postalCode: "" });
  const [editingAddress, setEditingAddress] = useState("");
  const [busy, setBusy] = useState(false);
  const [addressBusy, setAddressBusy] = useState(false);
  const navigate = useNavigate();
  useEffect(() => { if (user) setForm({ name: user.name, phone: user.phone || "" }); }, [user]);
  const save = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      const { data } = await api.patch("/auth/profile", form);
      setUserData(data.user);
      setForm({ name: data.user.name, phone: data.user.phone || "" });
      toast.success("Your details are up to date");
    } catch (error) { toast.error(error.response?.data?.message || "Could not update your profile"); }
    finally { setBusy(false); }
  };
  const saveAddress = async (event) => {
    event.preventDefault();
    setAddressBusy(true);
    try {
      const { data } = editingAddress
        ? await api.patch(`/auth/addresses/${editingAddress}`, addressForm)
        : await api.post("/auth/addresses", addressForm);
      setUserData(data.user);
      setEditingAddress("");
      setAddressForm({ label: "Home", fullName: data.user.name, phone: data.user.phone || "", line1: "", city: "", state: "", postalCode: "" });
      toast.success(editingAddress ? "Address updated" : "Address saved");
    } catch (error) { toast.error(error.response?.data?.message || "Could not save this address"); }
    finally { setAddressBusy(false); }
  };
  const removeAddress = async (id) => {
    try {
      const { data } = await api.delete(`/auth/addresses/${id}`);
      setUserData(data.user);
      toast.success("Address removed");
    } catch (error) { toast.error(error.response?.data?.message || "Could not remove this address"); }
  };
  const editAddress = (address) => {
    setEditingAddress(address._id);
    setAddressForm({ label: address.label, fullName: address.fullName, phone: address.phone, line1: address.line1, city: address.city, state: address.state, postalCode: address.postalCode });
  };
  const addressFields = [["label", "Label"], ["fullName", "Full name"], ["phone", "Phone number"], ["line1", "Street address"], ["city", "City"], ["state", "State"], ["postalCode", "PIN code"]];
  return <section className="profile-page"><div className="page-title-row"><div><span className="eyebrow">YOUR LITTLE CORNER</span><h1>Make yourself <em>at home.</em></h1></div></div><div className="profile-layout"><aside className="profile-sidebar"><div className="profile-avatar"><UserRound size={28} /></div><h3>{user?.name}</h3><span>{user?.email}</span><Link to="/orders">Your orders <ArrowUpRight size={15} /></Link>{["admin", "seller"].includes(user?.role) && <Link to="/admin">Seller dashboard <ArrowUpRight size={15} /></Link>}<button onClick={() => { logout(); navigate("/"); }}><LogOut size={15} /> Sign out</button></aside><div className="profile-content"><form className="profile-form" onSubmit={save}><span className="eyebrow">THE DETAILS</span><h2>A little about you.</h2><p>Your details help us make everything feel a little more personal.</p><label>Your name<input value={form.name} minLength={2} maxLength={60} required onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Email address<input value={user?.email || ""} readOnly /></label><label>Phone number<input type="tel" value={form.phone} maxLength={20} placeholder="Add your phone number" onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label><button className="button button-dark" disabled={busy}>{busy ? "Saving..." : "Save my details"} <Save size={16} /></button></form>
    <section className="saved-addresses"><span className="eyebrow">DELIVERY, MADE EASY</span><h2>Your saved addresses.</h2>{user?.addresses?.map((address) => <article className="saved-address" key={address._id}><div><strong>{address.label} · {address.fullName}</strong><p>{address.line1}, {address.city}, {address.state} {address.postalCode}<br />{address.phone}</p></div><div><button onClick={() => editAddress(address)}>Edit</button><button onClick={() => removeAddress(address._id)}>Remove</button></div></article>)}<form className="address-edit-form" onSubmit={saveAddress}><h3>{editingAddress ? "Update this address." : "Add a delivery address."}</h3><div className="address-grid">{addressFields.map(([key, label]) => <label key={key} className={key === "line1" ? "field-wide" : ""}>{label}<input required maxLength={key === "line1" ? 160 : key === "label" ? 30 : key === "postalCode" ? 12 : 80} value={addressForm[key]} onChange={(event) => setAddressForm({ ...addressForm, [key]: event.target.value })} /></label>)}</div><div className="address-actions"><button className="button button-dark" disabled={addressBusy}>{addressBusy ? "Saving..." : editingAddress ? "Update address" : "Save address"} <Save size={15} /></button>{editingAddress && <button className="text-link" type="button" onClick={() => { setEditingAddress(""); setAddressForm({ label: "Home", fullName: user?.name || "", phone: user?.phone || "", line1: "", city: "", state: "", postalCode: "" }); }}>Cancel</button>}</div></form></section></div></div></section>;
}
