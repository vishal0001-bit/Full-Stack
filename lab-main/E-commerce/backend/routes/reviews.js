import { Router } from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Review from "../models/Review.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/:productId", async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).populate("user", "name").sort({ createdAt: -1 }).limit(50);
    res.json({ reviews });
  } catch (error) { next(error); }
});

router.post("/:productId", requireAuth, async (req, res, next) => {
  try {
    const rating = Number(req.body.rating);
    const comment = typeof req.body.comment === "string" ? req.body.comment.trim() : "";
    if (!Number.isInteger(rating) || rating < 1 || rating > 5 || comment.length < 5 || comment.length > 1000) {
      return res.status(400).json({ message: "Add a 1–5 star rating and a review of 5–1,000 characters" });
    }
    const order = await Order.findOne({
      user: req.user._id, status: "delivered",
      "items.product": req.params.productId,
    });
    if (!order) return res.status(403).json({ message: "You can review a product after its order is delivered" });
    const review = await Review.create({ product: req.params.productId, user: req.user._id, order: order._id, rating, comment });
    const [aggregate] = await Review.aggregate([
      { $match: { product: review.product } },
      { $group: { _id: "$product", rating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    await Product.updateOne({ _id: review.product }, { $set: { rating: aggregate.rating, reviewCount: aggregate.count } });
    await review.populate("user", "name");
    res.status(201).json({ review });
  } catch (error) { next(error); }
});

export default router;
