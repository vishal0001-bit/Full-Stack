import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  price: { type: Number, required: true, min: 1 },
  category: { type: String, required: true, trim: true, maxlength: 60, index: true },
  image: { type: String, required: true, trim: true },
  stock: { type: Number, required: true, min: 0, default: 0 },
  badge: { type: String, trim: true, maxlength: 24, default: "" },
  rating: { type: Number, min: 0, max: 5, default: 4.8 },
  reviewCount: { type: Number, min: 0, default: 0 },
  soldCount: { type: Number, min: 0, default: 0 },
  active: { type: Boolean, default: true, index: true },
}, { timestamps: true });

export default mongoose.model("Product", productSchema);
