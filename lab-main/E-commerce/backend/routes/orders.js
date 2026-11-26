import { Router } from "express";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import Product from "../models/Product.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
const deliveryFor = (subtotal) => subtotal === 0 || subtotal >= 1999 ? 0 : 99;

async function restoreOrderStock(order) {
  for (const item of order.items) {
    if (item.product) await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity, soldCount: -item.quantity } });
  }
}

async function restoreOrderToCart(order) {
  let cart = await Cart.findOne({ user: order.user });
  if (!cart) cart = new Cart({ user: order.user, items: [] });
  for (const item of order.items) {
    if (!item.product) continue;
    const existing = cart.items.find((entry) => entry.product.toString() === item.product.toString());
    if (existing) existing.quantity = Math.min(99, existing.quantity + item.quantity);
    else cart.items.push({ product: item.product, quantity: Math.min(99, item.quantity) });
  }
  await cart.save();
}

router.post("/", async (req, res, next) => {
  const reserved = [];
  let createdOrderId = null;
  let committed = false;
  try {
    const { shippingAddress, paymentMethod } = req.body;
    if (!shippingAddress || !["cod", "razorpay"].includes(paymentMethod)) return res.status(400).json({ message: "Valid delivery details and payment method are required" });
    for (const key of ["fullName", "phone", "line1", "city", "state", "postalCode"]) {
      if (typeof shippingAddress[key] !== "string" || !shippingAddress[key].trim() || shippingAddress[key].length > 160) return res.status(400).json({ message: "Please complete all delivery address fields" });
    }
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart?.items.length) return res.status(400).json({ message: "Your cart is empty" });
    let subtotal = 0;
    const items = [];
    for (const entry of cart.items) {
      const product = entry.product;
      if (!product?.active) throw Object.assign(new Error("A product in your cart is no longer available"), { status: 400 });
      const updated = await Product.findOneAndUpdate(
        { _id: product._id, active: true, stock: { $gte: entry.quantity } },
        { $inc: { stock: -entry.quantity, soldCount: entry.quantity } },
        { new: true },
      );
      if (!updated) throw Object.assign(new Error(`${product.name} no longer has enough stock`), { status: 409 });
      reserved.push({ product: product._id, quantity: entry.quantity });
      subtotal += product.price * entry.quantity;
      items.push({ product: product._id, name: product.name, image: product.image, price: product.price, quantity: entry.quantity });
    }
    const order = await Order.create({
      user: req.user._id, items, shippingAddress, subtotal, deliveryFee: deliveryFor(subtotal), total: subtotal + deliveryFor(subtotal),
      paymentMethod, paymentStatus: "pending", status: "pending",
    });
    createdOrderId = order._id;
    await Payment.create({ order: order._id, user: req.user._id, method: paymentMethod, amount: order.total, status: "pending" });
    await Cart.updateOne({ user: req.user._id }, { $set: { items: [] } });
    committed = true;
    res.status(201).json({ order });
  } catch (error) {
    if (!committed) {
      if (createdOrderId) {
        await Payment.deleteOne({ order: createdOrderId });
        await Order.deleteOne({ _id: createdOrderId });
      }
      await Promise.all(reserved.map(({ product, quantity }) => Product.updateOne({ _id: product }, { $inc: { stock: quantity, soldCount: -quantity } })));
    }
    next(error);
  }
});

router.get("/mine", async (req, res, next) => {
  try { res.json({ orders: await Order.find({ user: req.user._id }).sort({ createdAt: -1 }) }); }
  catch (error) { next(error); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ order });
  } catch (error) { next(error); }
});

router.patch("/:id/cancel", async (req, res, next) => {
  try {
    const existing = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!existing) return res.status(404).json({ message: "Order not found" });
    if (existing.status !== "pending" || existing.paymentStatus === "paid") return res.status(400).json({ message: "This order can no longer be cancelled" });
    const order = await Order.findOneAndUpdate(
      { _id: existing._id, user: req.user._id, status: "pending", paymentStatus: { $ne: "paid" } },
      { $set: { status: "cancelled", paymentStatus: existing.paymentMethod === "razorpay" ? "failed" : existing.paymentStatus } },
      { new: true },
    );
    if (!order) return res.status(409).json({ message: "This order has already been updated" });
    await Payment.updateOne({ order: order._id }, { $set: { status: order.paymentMethod === "razorpay" ? "failed" : "cancelled" } });
    await restoreOrderStock(order);
    await restoreOrderToCart(order);
    res.json({ order });
  } catch (error) { next(error); }
});

router.post("/cancel-unpaid", async (req, res, next) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.body.orderId, user: req.user._id, paymentMethod: "razorpay", paymentStatus: "pending", status: "pending" },
      { $set: { status: "cancelled", paymentStatus: "failed" } },
      { new: true },
    );
    if (!order) return res.status(404).json({ message: "Unpaid order not found" });
    await Payment.updateOne({ order: order._id }, { $set: { status: "failed" } });
    await restoreOrderStock(order);
    await restoreOrderToCart(order);
    res.json({ order });
  } catch (error) { next(error); }
});

export default router;
