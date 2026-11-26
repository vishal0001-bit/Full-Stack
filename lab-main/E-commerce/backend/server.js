import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { fileURLToPath } from "node:url";
import { connectDatabase } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errors.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import cartRoutes from "./routes/cart.js";
import orderRoutes from "./routes/orders.js";
import paymentRoutes from "./routes/payments.js";
import adminRoutes from "./routes/admin.js";
import reviewRoutes from "./routes/reviews.js";
import uploadRoutes from "./routes/uploads.js";

const app = express();
const port = Number(process.env.PORT) || 5000;

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
  origin: (process.env.CLIENT_URL || "http://localhost:5173").split(",").map((origin) => origin.trim()),
}));
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(fileURLToPath(new URL("./uploads/", import.meta.url)), { dotfiles: "deny", index: false, maxAge: "1d" }));

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "shopease-api" }));
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/uploads", uploadRoutes);
app.use(notFound);
app.use(errorHandler);

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be set to a random secret of at least 32 characters");
}

connectDatabase()
  .then(() => app.listen(port, () => console.log(`ShopEase API listening on port ${port}`)))
  .catch((error) => { console.error("Could not start ShopEase API:", error); process.exitCode = 1; });
