import { Router } from "express";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { requireAuth, requireSeller } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth, requireSeller);

router.get("/stats", async (req, res, next) => {
  try {
    const [totalProducts, totalOrders, totalCustomers, sales] = await Promise.all([
      Product.countDocuments({ active: true }),
      Order.countDocuments(),
      User.countDocuments({ role: "customer" }),
      Order.aggregate([{ $match: { paymentStatus: "paid", status: { $ne: "cancelled" } } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
    ]);
    res.json({ stats: { totalProducts, totalOrders, totalCustomers, totalSales: sales[0]?.total || 0 } });
  } catch (error) { next(error); }
});

router.get("/orders", async (req, res, next) => {
  try { res.json({ orders: await Order.find().populate("user", "name email").sort({ createdAt: -1 }).limit(200) }); }
  catch (error) { next(error); }
});

router.get("/payments", async (req, res, next) => {
  try { res.json({ payments: await Payment.find().populate("order", "status").populate("user", "name email").sort({ createdAt: -1 }).limit(200) }); }
  catch (error) { next(error); }
});

router.patch("/orders/:id", async (req, res, next) => {
  try {
    const allowed = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ message: "Choose a valid order status" });
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status === "cancelled" && req.body.status !== "cancelled") return res.status(400).json({ message: "A cancelled order cannot be reopened" });
    if (order.paymentMethod === "razorpay" && order.paymentStatus !== "paid" && req.body.status !== "cancelled") {
      return res.status(400).json({ message: "Unpaid online orders cannot be fulfilled" });
    }
    if (req.body.status === "cancelled" && order.status !== "cancelled") {
      if (order.paymentStatus === "paid") return res.status(400).json({ message: "Paid orders need a refund before cancellation" });
      const cancelledOrder = await Order.findOneAndUpdate(
        { _id: order._id, status: order.status, paymentStatus: { $ne: "paid" } },
        { $set: { status: "cancelled", ...(order.paymentMethod === "razorpay" ? { paymentStatus: "failed" } : {}) } },
        { new: true },
      );
      if (!cancelledOrder) return res.status(409).json({ message: "This order has already been updated" });
      for (const item of order.items) if (item.product) await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity, soldCount: -item.quantity } });
      await Payment.updateOne({ order: order._id }, { $set: { status: order.paymentMethod === "razorpay" ? "failed" : "cancelled" } });
      return res.json({ order: cancelledOrder });
    }
    const update = { status: req.body.status };
    if (req.body.status === "delivered" && order.paymentMethod === "cod") update.paymentStatus = "paid";
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: order._id, status: order.status },
      { $set: update },
      { new: true, runValidators: true },
    );
    if (!updatedOrder) return res.status(409).json({ message: "This order has already been updated" });
    if (req.body.status === "delivered" && updatedOrder.paymentMethod === "cod") {
      await Payment.updateOne({ order: updatedOrder._id }, { $set: { status: "paid" } });
    }
    res.json({ order: updatedOrder });
  } catch (error) { next(error); }
});

export default router;
