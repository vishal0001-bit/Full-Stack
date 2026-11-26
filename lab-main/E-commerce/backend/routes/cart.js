import { Router } from "express";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

async function populatedCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  await cart.populate("items.product");
  cart.items = cart.items.filter((item) => item.product?.active);
  return cart;
}

router.get("/", async (req, res, next) => {
  try { res.json({ items: (await populatedCart(req.user._id)).items }); }
  catch (error) { next(error); }
});

router.post("/items", async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const count = Number(quantity);
    if (!productId || !Number.isInteger(count) || count < 1 || count > 99) return res.status(400).json({ message: "Choose a valid product quantity" });
    const product = await Product.findOne({ _id: productId, active: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });
    const existing = cart.items.find((item) => item.product.toString() === productId);
    const nextQuantity = (existing?.quantity || 0) + count;
    if (nextQuantity > product.stock) return res.status(400).json({ message: `Only ${product.stock} of this item are available` });
    if (existing) existing.quantity = nextQuantity;
    else cart.items.push({ product: productId, quantity: count });
    await cart.save();
    await cart.populate("items.product");
    res.json({ items: cart.items });
  } catch (error) { next(error); }
});

router.patch("/items/:productId", async (req, res, next) => {
  try {
    const quantity = Number(req.body.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) return res.status(400).json({ message: "Quantity must be between 1 and 99" });
    const product = await Product.findOne({ _id: req.params.productId, active: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (quantity > product.stock) return res.status(400).json({ message: `Only ${product.stock} of this item are available` });
    const cart = await Cart.findOne({ user: req.user._id });
    const item = cart?.items.find((entry) => entry.product.toString() === req.params.productId);
    if (!item) return res.status(404).json({ message: "That item is not in your cart" });
    item.quantity = quantity;
    await cart.save();
    await cart.populate("items.product");
    res.json({ items: cart.items });
  } catch (error) { next(error); }
});

router.delete("/items/:productId", async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.json({ items: [] });
    cart.items = cart.items.filter((item) => item.product.toString() !== req.params.productId);
    await cart.save();
    await cart.populate("items.product");
    res.json({ items: cart.items });
  } catch (error) { next(error); }
});

export default router;
