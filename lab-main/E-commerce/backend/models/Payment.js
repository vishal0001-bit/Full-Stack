import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  method: { type: String, enum: ["cod", "razorpay"], required: true },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: "INR" },
  status: { type: String, enum: ["pending", "paid", "failed", "cancelled", "refunded"], default: "pending" },
  providerOrderId: { type: String, default: "" },
  providerPaymentId: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);
