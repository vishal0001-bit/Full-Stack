import { ArrowRight, ArrowUpRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";

const money = (value) => `₹${Number(value).toLocaleString("en-IN")}`;

export default function Cart() {
  const { cart, subtotal, cartBusy, updateQuantity, removeFromCart } = useStore();
  const delivery = subtotal === 0 || subtotal >= 1999 ? 0 : 99;
  if (cartBusy) return <div className="loading-page">Gathering your good finds...</div>;
  return <section className="cart-page">
    <div className="page-title-row"><div><span className="eyebrow">YOUR LITTLE COLLECTION</span><h1>Your bag <em>of good.</em></h1></div><span className="result-count">{cart.reduce((n, item) => n + item.quantity, 0)} ITEMS</span></div>
    {!cart.length ? <div className="cart-empty"><div className="empty-bag-icon"><ShoppingBag size={30} /></div><h2>A little room for something good.</h2><p>Your bag is taking a breather. Let’s find something you’ll love.</p><Link className="button button-dark" to="/products">Explore the collection <ArrowUpRight size={17} /></Link></div> :
      <div className="cart-layout"><div className="cart-items"><div className="cart-table-head"><span>YOUR FINDS</span><span>QUANTITY</span><span>SUBTOTAL</span></div>
        {cart.map(({ product, quantity }) => product && <article className="cart-item" key={product._id}><Link to={`/products/${product._id}`} className="cart-item-image"><img src={product.image} alt={product.name} /></Link><div className="cart-item-main"><span className="eyebrow">{product.category}</span><Link to={`/products/${product._id}`}><h3>{product.name}</h3></Link><span className="cart-item-price">{money(product.price)}</span><button className="remove-item" onClick={() => removeFromCart(product._id)}><Trash2 size={14} /> Remove</button></div><div className="quantity-control"><button aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => updateQuantity(product._id, quantity - 1)}><Minus size={14} /></button><span>{quantity}</span><button aria-label="Increase quantity" disabled={quantity >= product.stock} onClick={() => updateQuantity(product._id, quantity + 1)}><Plus size={14} /></button></div><strong className="cart-line-total">{money(product.price * quantity)}</strong></article>)}
      </div><aside className="order-summary"><span className="eyebrow">A QUICK RECAP</span><h2>Your order, so far.</h2><div className="summary-line"><span>Subtotal</span><span>{money(subtotal)}</span></div><div className="summary-line"><span>Delivery</span><span>{delivery === 0 ? <span className="free-delivery">On us</span> : money(delivery)}</span></div>{delivery > 0 && <p className="delivery-hint">You’re only {money(1999 - subtotal)} away from free delivery.</p>}<div className="summary-line summary-total"><span>Total</span><strong>{money(subtotal + delivery)}</strong></div><Link className="button button-dark checkout-cta" to="/checkout">Make it yours <ArrowRight size={17} /></Link><p className="secure-note">Secure checkout · Thoughtful shopping</p></aside></div>}
  </section>;
}
