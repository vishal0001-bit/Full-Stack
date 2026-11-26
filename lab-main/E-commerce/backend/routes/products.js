import { Router } from "express";
import Product from "../models/Product.js";
import { requireAuth, requireSeller } from "../middleware/auth.js";

const router = Router();
const productFields = ["name", "description", "price", "category", "image", "stock", "badge"];
const pickProduct = (body) => Object.fromEntries(productFields.filter((key) => body[key] !== undefined).map((key) => [key, body[key]]));
const validImage = (image) => typeof image === "string" && /^https?:\/\/\S+$/i.test(image);

router.get("/categories", async (req, res, next) => {
  try { res.json({ categories: await Product.distinct("category", { active: true }) }); }
  catch (error) { next(error); }
});

router.get("/", async (req, res, next) => {
  try {
    const { search = "", category, maxPrice, sort = "popular" } = req.query;
    const filter = { active: true };
    if (category) filter.category = String(category).slice(0, 60);
    if (maxPrice !== undefined && Number.isFinite(Number(maxPrice)) && Number(maxPrice) > 0) filter.price = { $lte: Number(maxPrice) };
    if (search) {
      const safeSearch = String(search).slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [{ name: { $regex: safeSearch, $options: "i" } }, { description: { $regex: safeSearch, $options: "i" } }];
    }
    const sortMap = { popular: { soldCount: -1, createdAt: -1 }, newest: { createdAt: -1 }, "price-asc": { price: 1 }, "price-desc": { price: -1 } };
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 24));
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortMap[sort] || sortMap.popular).skip((page - 1) * limit).limit(limit),
      Product.countDocuments(filter),
    ]);
    res.json({ products, total, page, pages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, active: true });
    if (!product) return res.status(404).json({ message: "We couldn't find that product" });
    res.json({ product });
  } catch (error) { next(error); }
});

router.post("/", requireAuth, requireSeller, async (req, res, next) => {
  try {
    const payload = pickProduct(req.body);
    if (!validImage(payload.image)) return res.status(400).json({ message: "Provide a valid product image URL" });
    const product = await Product.create(payload);
    res.status(201).json({ product });
  } catch (error) { next(error); }
});

router.patch("/:id", requireAuth, requireSeller, async (req, res, next) => {
  try {
    const payload = pickProduct(req.body);
    if (!Object.keys(payload).length) return res.status(400).json({ message: "There are no product changes to save" });
    if (payload.image !== undefined && !validImage(payload.image)) return res.status(400).json({ message: "Provide a valid product image URL" });
    const product = await Product.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (error) { next(error); }
});

router.delete("/:id", requireAuth, requireSeller, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product removed from the store" });
  } catch (error) { next(error); }
});

export default router;
