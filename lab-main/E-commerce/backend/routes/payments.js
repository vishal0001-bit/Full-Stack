import { Router } from "express";
import crypto from "node:crypto";
import Razorpay from "razorpay";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

function razorpayClient() {
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    const error = new Error("Online payments are not configured. Please choose cash on delivery.");
    error.status = 503;
    throw error;
  }
  return new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
}

router.post("/razorpay/order", async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.body.orderId, user: req.user._id, paymentMethod: "razorpay", paymentStatus: "pending", status: "pending" });
    if (!order) return res.status(404).json({ message: "Pending online order not found" });
    const client = razorpayClient();
    const razorpayOrder = await client.orders.create({
      amount: Math.round(order.total * 100), currency: "INR",
      receipt: order._id.toString().slice(-40), notes: { orderId: order._id.toString() },
    });
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();
    await Payment.updateOne({ order: order._id }, { $set: { providerOrderId: razorpayOrder.id } });
    res.json({ keyId: process.env.RAZORPAY_KEY_ID, razorpayOrderId: razorpayOrder.id });
  } catch (error) { next(error); }
});

router.post("/razorpay/verify", async (req, res, next) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (![orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature].every((value) => typeof value === "string" && value.length < 256)) {
      return res.status(400).json({ message: "Payment details are incomplete" });
    }
    const order = await Order.findOne({ _id: orderId, user: req.user._id, paymentMethod: "razorpay", status: { $in: ["pending", "processing"] } });
    if (!order || order.razorpayOrderId !== razorpay_order_id) return res.status(400).json({ message: "Payment does not match a pending order" });
    if (order.paymentStatus === "paid") return res.json({ message: "Payment already verified", order });
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return res.status(503).json({ message: "Online payment verification is not configured" });
    const expected = crypto.createHmac("sha256", secret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest();
    let received;
    try { received = Buffer.from(razorpay_signature, "hex"); } catch { return res.status(400).json({ message: "Invalid payment signature" }); }
    if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) return res.status(400).json({ message: "Payment signature verification failed" });
    const verifiedOrder = await Order.findOneAndUpdate(
      { _id: order._id, user: req.user._id, paymentMethod: "razorpay", paymentStatus: "pending", status: "pending", razorpayOrderId: razorpay_order_id },
      { $set: { paymentStatus: "paid", razorpayPaymentId: razorpay_payment_id, status: "processing" } },
      { new: true },
    );
    if (!verifiedOrder) {
      const currentOrder = await Order.findOne({ _id: order._id, user: req.user._id });
      if (currentOrder?.paymentStatus === "paid") return res.json({ message: "Payment already verified", order: currentOrder });
      return res.status(409).json({ message: "This order is no longer awaiting payment" });
    }
    await Payment.updateOne({ order: verifiedOrder._id }, { $set: { status: "paid", providerOrderId: razorpay_order_id, providerPaymentId: razorpay_payment_id } });
    res.json({ message: "Payment verified", order: verifiedOrder });
  } catch (error) { next(error); }
});

export default router;
